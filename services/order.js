const orderModel = require("../models/order");
const userModel = require("../models/user");
const driverModel = require("../models/driver");
const priceModel = require("../models/priceCalculator");
const polygonModel = require("../models/accountSetting");
const vehicleModel = require("../models/vehicle");
const paymentService = require("./payment");
const transactionService = require("./transaction");
const goodModel = require("../models/good");
const invoiceModel = require("../models/invoice");
const { messaging } = require("../firebase-config");
const generateUniqueId = require("generate-unique-id");
const {
  currentDate,
  setOrderRedis,
  deleteOrderRedis,
  getInvoiceHTML,
  driverLeave,
} = require("../utils/common");
const { uploadS3, getObject } = require("../utils/upload");
const { Client } = require("@googlemaps/google-maps-services-js");
const { default: mongoose } = require("mongoose");
const { redisClient } = require("../redis");
const { getVehicleName } = require("./vehicle");
const { getGoodName } = require("./good");
const googleClient = new Client({});
const pdf = require("html-pdf");
const sendEmail = require("../utils/ses");
require("dotenv").config();
const getUserOrders = async (userId) => {
  try {
    const userOrders = await orderModel.find({
      userId,
      //   orderStatus: "Initiated",
    });
    let userOrdersWithDetails = [];
    const userDetails = await userModel.findById(userId);
    for (let i = 0; i < userOrders.length; i++) {
      let vehicleName = await getVehicleName(userOrders[i].vehicleId);
      let goodName = await getGoodName(userOrders[i].goodId);
      if (userOrders[i].driverId) {
        let driverDetails = await driverModel.findById(userOrders[i].driverId);
        userOrdersWithDetails.push({
          ...userOrders[i]._doc,
          vehicleType: vehicleName,
          goodName: goodName,
          driverDetails,
          userDetails,
        });
      } else {
        userOrdersWithDetails.push({
          ...userOrders[i]._doc,
          vehicleType: vehicleName,
          goodName: goodName,
          userDetails,
        });
      }
    }
    return {
      data: { orders: userOrdersWithDetails, userDetails: userDetails },
    };
  } catch (error) {
    console.log(error);
    return { error: error };
  }
};

const getDriverOrders = async (driverId) => {
  try {
    const driverOrders = await orderModel.find({
      driverId,
      //   orderStatus: "Claimed",
    }).limit(20);
    let driverOrdersWithDetails = [];
    const driverDetails = await driverModel.findById(driverId);
    let vehicleName = await getVehicleName(driverDetails.vehicleId);
    for (let i = 0; i < driverOrders.length; i++) {
      let goodName = await getGoodName(driverOrders[i].goodId);
      const userDetails = await userModel.findById(driverOrders[i].userId);
      driverOrdersWithDetails.push({
        ...driverOrders[i]._doc,
        goodName: goodName,
        userDetails,
      });
    }
    return {
      data: {
        orders: driverOrdersWithDetails,
        driverDetails: { ...driverDetails._doc, vehicleType: vehicleName },
      },
    };
  } catch (error) {
    console.log(error);
    return { error: error };
  }
};

const getAllOrders = async () => {
  try {
    const allOrders = await orderModel.find({}).limit(50);
    let orders = [];
    for (let i = 0; i < allOrders.length; i++) {
      const userDetails = await userModel.findById(allOrders[i].userId);
      let vehicleName = await getVehicleName(allOrders[i].vehicleId);
      let goodName = await getGoodName(allOrders[i].goodId);
      if (allOrders[i].driverId) {
        const driverDetails = await driverModel.findById(allOrders[i].driverId);
        orders.push({
          ...allOrders[i]._doc,
          vehicleType: vehicleName,
          goodName: goodName,
          driverDetails,
          userDetails,
          goodType: goodName,
        });
      } else {
        orders.push({
          ...allOrders[i]._doc,
          vehicleType: vehicleName,
          goodName: goodName,
          userDetails,
          goodType: goodName,
        });
      }
    }
    return { data: { orders } };
  } catch (error) {
    console.log(error);
    return { error: error };
  }
};

const updateOrder = async (orderData) => {
  try {
    let vehicleName = await getVehicleName(orderData.vehicleId);
    let goodName = await getGoodName(orderData.goodId);
    if (orderData._id) {
      const orderDetails = await orderModel.findOneAndUpdate(
        { _id: orderData._id },
        { $set: orderData },
        { new: true }
      );
      return {
        data: {
          ...orderDetails._doc,
          vehicleType: vehicleName,
          goodName: goodName,
        },
      };
    } else {
      const l1 = await checkLocation(orderData.source);
      if (!l1?.data?.inside) {
        return { error: "Service Not Available!" };
      }
      const l2 = await checkLocation(orderData.destination);
      if (!l2?.data?.inside) {
        return { error: "Service Not Available!" };
      }
      if (orderData.stop1) {
        const l3 = await checkLocation(orderData.stop1);
        if (!l3?.data?.inside) {
          return { error: "Service Not Available!" };
        }
      }
      if (orderData.stop2) {
        const l4 = await checkLocation(orderData.stop2);
        if (!l4?.data?.inside) {
          return { error: "Service Not Available!" };
        }
      }
      let userDetails = await userModel.findOne({ _id: orderData.userId });
      const cgstAmount = (orderData.totalAmount * 9) / 100;
      const sgstAmount = (orderData.totalAmount * 9) / 100;
      const baseAmount = orderData.totalAmount - (cgstAmount + sgstAmount);
      orderData.cgstAmount = cgstAmount;
      orderData.sgstAmount = sgstAmount;
      orderData.baseAmount = baseAmount;
      orderData.pickupTime = orderData.pickupTime
        ? orderData.pickupTime
        : currentDate();
      orderData.createdAt = currentDate();
      if (orderData.typeOfPayment != "cash") {
        let driverToken = await (
          await driverModel.find({
            availabilityStatus: "ONLINE",
            deliveryStatus: "FREE",
          })
        ).map((driverData) => driverData.deviceToken);
        driverToken = driverToken.filter((token) => token);
        if (driverToken.length == 0) {
          return { error: "No Driver Available" };
        }
        const orderDetails = await orderModel.create(orderData);
        await generateInvoice(orderDetails);
        let transaction = await transactionService.addTransaction(
          {
            userId: userDetails._id,
            type: "COD",
            amount: orderData.totalAmount,
            transactionType: "ORDER",
            orderId: orderDetails._id,
          },
          userDetails,
          "user"
        );
        if (transaction.error) {
          return { error: transaction.error };
        } else {
          sendNotification(driverToken, orderDetails, "ORDER_CREATED");
          await setOrderRedis(orderDetails);
          return {
            data: {
              orderDetails: orderDetails,
              payment: transaction?.data?.paymentLink,
              vehicleType: vehicleName,
              goodName: goodName,
            },
          };
        }
        // }
      } else {
        let driverToken = await (
          await driverModel.find({
            availabilityStatus: "ONLINE",
            deliveryStatus: "FREE",
          })
        ).map((driverData) => driverData.deviceToken);
        driverToken = driverToken.filter((token) => token);
        if (driverToken.length == 0) {
          return { error: "No Driver Available" };
        }
        const orderDetails = await orderModel.create(orderData);
        await generateInvoice(orderDetails);
        await transactionService.addTransaction(
          {
            userId: userDetails._id,
            type: "order",
            amount: orderData.totalAmount,
            transactionType: "ORDER",
            orderId: orderDetails._id,
          },
          userDetails,
          "user"
        );
        sendNotification(driverToken, orderDetails, "ORDER_CREATED");
        await setOrderRedis(orderDetails);
        return {
          data: {
            orderDetails: orderDetails,
            vehicleType: vehicleName,
            goodName: goodName,
          },
        };
      }
    }
  } catch (error) {
    console.log(error);
    return { error: error };
  }
};
const sendNotificationToUser = (token, order, type, driverDetails) => {
  try {
    if (type == "ORDER_ACCEPTED") {
      messaging().send({
        token: token,
        notification: {
          title: "ORDER ACCEPTED",
          body: `Your order has been accepted by ${driverDetails.driverName}`,
        },
        data: {
          orderId: order._id.toString(),
          amount: order.totalAmount.toString(),
          source: order.source.address.toString(),
          destination: order.destination.address.toString(),
          timeStamp: currentDate(),
        },
        android: {
          priority: "high",
          notification: {
            title: "ORDER ACCEPTED",
            body: `Your order has been accepted by ${driverDetails.driverName}`,
            sound: "default",
          },
        },
      });
    }
    if (type == "ORDER_DELIVERED") {
      messaging().send({
        token: token,
        notification: {
          title: "ORDER DELIVERED",
          body: `Your Order has been delivered at ${order.destination.address}`,
        },
        data: {
          orderId: order._id.toString(),
          amount: order.totalAmount.toString(),
          source: order.source.address.toString(),
          destination: order.destination.address.toString(),
          timeStamp: currentDate(),
        },
        android: {
          priority: "high",
          notification: {
            title: "ORDER DELIVERED",
            body: `Your Order has been delivered at ${order.destination.address}`,
            sound: "default",
          },
        },
      });
    }
    if (type == "ORDER_REJECTED") {
      messaging().send({
        token: token,
        notification: {
          title: "ORDER REJECTED",
          body: `No driver was available`,
        },
        data: {
          orderId: order._id.toString(),
          amount: order.totalAmount.toString(),
          source: order.source.address.toString(),
          destination: order.destination.address.toString(),
          timeStamp: currentDate(),
        },
        android: {
          priority: "high",
          notification: {
            title: "ORDER REJECTED",
            body: `Your Order has been rejected`,
            sound: "default",
          },
        },
      });
    }
    if (type == "ORDER_CANCELLED") {
      // for (let i = 0; i < deviceArr.length; i++) {
      messaging().send({
        token: token,
        notification: {
          title: "ORDER CANCELLED",
          body: `You have cancelled order of ${order.source.address.toString()} to ${order.destination.address.toString()}`,
        },
        data: {
          orderId: order._id.toString(),
          amount: order.totalAmount.toString(),
          source: order.source.address.toString(),
          destination: order.destination.address.toString(),
          timeStamp: currentDate(),
        },
        android: {
          priority: "high",
          notification: {
            title: "ORDER CANCELLED",
            body: `Your delivery Order has been cancelled`,
            sound: "default",
          },
        },
      });
      // }
    }
  } catch (error) {
    console.log(error);
  }
};
const sendNotification = async (deviceArr, order, type) => {
  try {
    if (type == "ORDER_CREATED") {
      for (let i = 0; i < deviceArr.length; i++) {
        console.log("HERE");
        messaging().send({
          token: deviceArr[i],
          notification: {
            title: "ORDER CREATED",
            body: `order from ${order.source.address}`,
          },
          data: {
            orderId: order._id.toString(),
            amount: order.totalAmount.toString(),
            source: order.source.address.toString(),
            destination: order.destination.address.toString(),
            timeStamp: currentDate(),
          },
          android: {
            priority: "high",
            notification: {
              title: "ORDER CREATED",
              body: `order from ${order.source.address}`,
              sound: "default",
            },
          },
        });
      }
    }
    if (type == "ORDER_ACCEPTED") {
      console.log("ORD", order);
      // for (let i = 0; i < deviceArr.length; i++) {
      messaging().send({
        token: deviceArr[0],
        notification: {
          title: "ORDER CONFIRMED",
          body: `You have Confirm order from ${order.source.address}`,
        },
        data: {
          orderId: order._id.toString(),
          amount: order.totalAmount.toString(),
          source: order.source.address.toString(),
          destination: order.destination.address.toString(),
          timeStamp: currentDate(),
        },
        android: {
          priority: "high",
          notification: {
            title: "ORDER CONFIRMED",
            body: `You have Confirm order from ${order.source.address}`,
            sound: "default",
          },
        },
      });
      // }
    }
    if (type == "ORDER_DELIVERED") {
      // for (let i = 0; i < deviceArr.length; i++) {
      messaging().send({
        token: deviceArr[0],
        notification: {
          title: "ORDER DELIVERED",
          body: `you have delivered Order at ${order.destination.address}`,
        },
        data: {
          orderId: order._id.toString(),
          amount: order.totalAmount.toString(),
          source: order.source.address.toString(),
          destination: order.destination.address.toString(),
          timeStamp: currentDate(),
        },
        android: {
          priority: "high",
          notification: {
            title: "ORDER DELIVERED",
            body: `you have delivered Order at ${order.destination.address}`,
            sound: "default",
          },
        },
      });
      // }
    }
    if (type == "ORDER_CANCELLED") {
      // for (let i = 0; i < deviceArr.length; i++) {
      messaging().send({
        token: deviceArr[0],
        notification: {
          title: "ORDER CANCELLED",
          body: `Your delivery Order has been cancelled`,
        },
        data: {
          orderId: order._id.toString(),
          amount: order.totalAmount.toString(),
          source: order.source.address.toString(),
          destination: order.destination.address.toString(),
          timeStamp: currentDate(),
        },
        android: {
          priority: "high",
          notification: {
            title: "ORDER CANCELLED",
            body: `Your delivery Order has been cancelled`,
            sound: "default",
          },
        },
      });
      // }
    }
  } catch (error) {
    console.log(error);
  }
};
const rejectOrder = async (orderId) => {
  try {
    const orderDetails = await orderModel.findOneAndUpdate(
      { _id: orderId },
      { $set: { orderStatus: "REJECTED" } },
      { new: true }
    );
    let user = await userModel.findOne({ _id: orderDetails.userId });
    let vehicleName = await getVehicleName(orderDetails.vehicleId);
    let goodName = await getGoodName(orderDetails.goodId);
    let orderData = {
      ...orderDetails._doc,
      ...{
        sender: {
          name: `${user.firstName} ${user.lastName}`,
          phoneNumber: user.phoneNumber,
        },
      },
      vehicleType: vehicleName,
      goodName: goodName,
    };
    sendNotificationToUser(user.deviceToken, orderDetails, "ORDER_REJECTED");
    return { data: orderData };
  } catch (error) {
    return { error: error };
  }
};
const cancelOrder = async (orderId) => {
  try {
    let redisOrder = JSON.parse(
      await redisClient.hGet("order", orderId.toString())
    );
    console.log("redisOrder.orderStatus", redisOrder.orderStatus);
    if (
      redisOrder.orderStatus == "INITIATED" ||
      redisOrder.orderStatus == "ACCEPTED"
    ) {
      redisOrder.orderStatus = "CANCELLED";
      await setOrderRedis(redisOrder);
    } else {
      return { error: "You can't cancel the cancelled order" };
    }
    const orderDetails = await orderModel.findOneAndUpdate(
      { _id: orderId },
      { $set: { orderStatus: "CANCELLED" } }, //025415
      { new: true }
    );
    // await generateInvoice(orderDetails);
    let user = await userModel.findOne({ _id: orderDetails.userId });
    let vehicleName = await getVehicleName(orderDetails.vehicleId);
    let goodName = await getGoodName(orderDetails.goodId);
    let orderData = {
      ...orderDetails._doc,
      ...{
        sender: {
          name: `${user.firstName} ${user.lastName}`,
          phoneNumber: user.phoneNumber,
        },
      },
      vehicleType: vehicleName,
      goodName: goodName,
    };

    if (orderDetails.driverId) {
      const driverDetails = await driverModel.findById(orderDetails.driverId);
      sendNotification(
        [driverDetails.deviceToken],
        orderDetails,
        "ORDER_CANCELLED"
      );
    }
    sendNotificationToUser(user.deviceToken, orderDetails, "ORDER_CANCELLED");
    return { data: orderData };
  } catch (error) {
    console.log(error);
    return { error: error };
  }
};
const generateSuccesInvoice = async (id) => {
  try {
    let orderDetails = await orderModel.findOne({ _id: id });
    await generateInvoice(orderDetails);
  } catch (error) {
    console.log("error", error);
  }
};

const claimOrder = async (orderId, driverId) => {
  try {
    let redisOrder = JSON.parse(
      await redisClient.hGet("order", orderId.toString())
    );
    if (redisOrder.status == "CANCELLED") {
      return { error: "Order has been cancelled by user." };
    }
    if (redisOrder.status == "REJECTED") {
      return { error: "Order has been rejected by admin." };
    }
    if (redisOrder.status == "ACCEPTED") {
      return { error: "Order has been accepted already." };
    }
    if (redisOrder.orderStatus == "INITIATED") {
      redisOrder.orderStatus = "ACCEPTED";
      redisOrder.driverId = driverId;
      await setOrderRedis(redisOrder);
    }
    let orderDetails = await orderModel.findOneAndUpdate(
      { _id: orderId },
      { $set: { orderStatus: "ACCEPTED", driverId: driverId } },
      { new: true }
    );
    let user = await userModel.findOne({ _id: orderDetails.userId });
    let driverToken = await driverModel.findOneAndUpdate(
      {
        _id: driverId,
      },
      {
        $set: {
          deliveryStatus: "OCCUPIED",
        },
      },
      { new: true }
    );
    let vehicleName = await getVehicleName(orderDetails.vehicleId);
    let goodName = await getGoodName(orderDetails.goodId);
    let orderData = {
      ...orderDetails._doc,
      ...{
        sender: {
          name: `${user.firstName} ${user.lastName}`,
          phoneNumber: user.phoneNumber,
        },
      },
      vehicleType: vehicleName,
      goodName: goodName,
    };
    if (driverToken.deviceToken) {
      sendNotification(
        [driverToken.deviceToken],
        orderDetails,
        "ORDER_ACCEPTED"
      );
    }
    if (user.deviceToken) {
      sendNotificationToUser(
        user.deviceToken,
        orderDetails,
        "ORDER_ACCEPTED",
        driverToken
      );
    }

    return { data: orderData };
  } catch (error) {
    console.log(error);
    return { error: error };
  }
};

const orderDelivered = async (orderData) => {
  try {
    let deliveredData = {};
    if (orderData.stop1) {
      deliveredData = {
        stop1: {
          delivered: true,
        },
        stop1DeliveredAt: new Date(),
      };
    } else if (orderData.stop2) {
      deliveredData = {
        stop2: {
          delivered: true,
        },
        stop2DeliveredAt: new Date(),
      };
    } else {
      deliveredData = {
        deliveredAt: new Date(),
      };
    }
    const orderDetails = await orderModel.findOneAndUpdate(
      { _id: orderData.orderId },
      {
        $set: {
          orderStatus: "DELIVERED",
          driverOrderRating: orderData.orderRating,
          driverOrderComment: orderData.orderComment,
          ...deliveredData,
        },
      },
      { new: true }
    );
    const driverDetails = await driverModel.findOneAndUpdate(
      { _id: orderDetails.driverId },
      { $set: { availabilityStatus: "OFFLINE", deliveryStatus: "FREE" } },
      { new: true }
    );
    const userDetails = await userModel.findById(orderDetails.userId);
    const vehicleDetails = await vehicleModel.findById(orderDetails.vehicleId);
    // let vehicleName = await getVehicleName(orderData.vehicleId);
    let goodName = await getGoodName(orderData.goodId);
    let orderDetailsData = {
      ...orderDetails._doc,
      ...{
        sender: {
          name: `${userDetails.firstName} ${userDetails.lastName}`,
          phoneNumber: userDetails.phoneNumber,
        },
      },
      vehicleType: vehicleDetails?.name,
      goodName: goodName,
    };
    await transactionService.addTransaction(
      {
        userId: driverDetails._id,
        type: orderDetails.typeOfPayment === "cash" ? "debit" : "credit",
        amount:
          orderDetails.typeOfPayment === "cash"
            ? orderDetails.totalAmount % vehicleDetails.commission || 20
            : orderDetails.totalAmount %
              (100 - vehicleDetails.commission || 20),
        transactionType: "ORDER",
        orderId: orderDetails._id,
      },
      driverDetails,
      "driver"
    );

    await transactionService.addTransaction(
      {
        userId: driverDetails._id,
        type: orderDetails.typeOfPayment === "cash" ? "debit" : "credit",
        amount:
          orderDetails.typeOfPayment === "cash"
            ? orderDetails.totalAmount % (100 - vehicleDetails.commission || 20)
            : orderDetails.totalAmount % vehicleDetails.commission || 20,
        transactionType: "ORDER",
        orderId: orderDetails._id,
      },
      driverDetails,
      "porter"
    );
    if (driverDetails.deviceToken) {
      sendNotification(
        [driverDetails.deviceToken],
        orderDetails,
        "ORDER_DELIVERED"
      );
    }
    if (userDetails.deviceToken) {
      sendNotificationToUser(
        userDetails.deviceToken,
        orderDetails,
        "ORDER_DELIVERED",
        driverDetails
      );
    }
    await deleteOrderRedis(orderDetails._id);
    // await generateInvoice({
    //   ...orderDetailsData,
    //   vehicleNumber: driverDetails.vehicleNumber,
    //   driverName: driverDetails.driverName,
    // });
    driverLeave(driverDetails._id);
    return { data: orderDetailsData };
  } catch (error) {
    console.log(error);
    return { error: error };
  }
};

const refund = async (orderId) => {
  try {
    const orderDetails = await orderModel.findOneAndUpdate(
      { _id: orderId },
      { $set: { orderStatus: "REFUND_INITIATED" } },
      { new: true }
    );
    const userDetails = await userModel.findById(orderDetails.userId);

    await transactionService.addTransaction(
      {
        userId: userDetails._id,
        type: "order",
        amount: orderData.totalAmount,
        transactionType: "ORDER",
        orderId: orderDetails._id,
      },
      userDetails,
      "user"
    );
    return { data: orderDetails };
  } catch (error) {
    return { error: error };
  }
};

const approveRefund = async (orderId) => {
  try {
    const orderDetails = await orderModel.findOneAndUpdate(
      { _id: orderId },
      { $set: { orderStatus: "REFUNDED" } },
      { new: true }
    );
    return { data: orderDetails };
  } catch (error) {
    return { error: error };
  }
};

const uploadSignature = async (orderData) => {
  try {
    const order = await orderModel.findOne({ _id: orderData.orderId });
    if (orderData.senderSignature) {
      const signature = await uploadS3(
        `orders/${orderData.orderId}/senderSignature.png`,
        orderData.senderSignature.buffer
      );
      orderData.status = "PICKED_UP"
      const orderDetails = await orderModel.findOneAndUpdate(
        { _id: orderData.orderId },
        { $set: { senderSignature: signature,trackingUrl:"http://192.168.1.33:5000",orderStatus:"PICKED_UP" } },
        { new: true }
      );
      await setOrderRedis(orderDetails);
      return { data: orderDetails };
    }
    if (orderData.stop1Signature) {
      const signature = await uploadS3(
        `orders/${orderData.orderId}/stop1Signature.png`,
        orderData.stop1Signature.buffer
      );
      order.stop1.signature = signature;
      order.stop1.deliveredAt = new Date();
      const orderDetails = await orderModel.findOneAndUpdate(
        { _id: orderData.orderId },
        { $set: order },
        { new: true }
      );
      return { data: orderDetails };
    }
    if (orderData.stop2Signature) {
      const signature = await uploadS3(
        `orders/${orderData.orderId}/stop2Signature.png`,
        orderData.stop2Signature.buffer
      );
      order.stop2.signature = signature;
      order.stop2.deliveredAt = new Date();
      const orderDetails = await orderModel.findOneAndUpdate(
        { _id: orderData.orderId },
        { $set: order },
        { new: true }
      );
      return { data: orderDetails };
    }
    if (orderData.receiverSignature) {
      const signature = await uploadS3(
        `orders/${orderData.orderId}/receiverSignature.png`,
        orderData.receiverSignature.buffer
      );
      order.destination.signature = signature;
      order.deliveredAt = new Date();
      const orderDetails = await orderModel.findOneAndUpdate(
        { _id: orderData.orderId },
        { $set: order },
        { new: true }
      );
      return { data: orderDetails };
    }
    return { error: "Please provide proper body" };
  } catch (error) {
    return { error: error };
  }
};

const checkLocation = async (location) => {
  try {
    const x = location.latitude;
    const y = location.longitude;
    const polygonData = await polygonModel.find({});
    const polygon = polygonData[0].polygons.coordinates[0];
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      let xi = polygon[i][0];
      let yi = polygon[i][1];
      let xj = polygon[j][0];
      let yj = polygon[j][1];
      let intersect =
        yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return { data: { inside } };
  } catch (error) {
    console.log(error);
    return { error };
  }
};
const checkOrderLocation = async (orderId) => {
  try {
    const orderData = await orderModel.findById(orderId);
    const r1 = await polygonModel.find({
      polygons: {
        $geoIntersects: {
          $geometry: {
            type: "Point",
            coordinates: [
              orderData.source.latitude,
              orderData.source.longitude,
            ],
          },
        },
      },
    });
    if (r1.length == 0) {
      return { error: "We cannot deliver on this address" };
    }
    const r2 = await polygonModel.find({
      polygons: {
        $geoIntersects: {
          $geometry: {
            type: "Point",
            coordinates: [
              orderData.destination.latitude,
              orderData.destination.longitude,
            ],
          },
        },
      },
    });
    if (r2.length == 0) {
      return { error: "We cannot deliver on this address" };
    }
    if (orderData.stop1) {
      const r3 = await polygonModel.find({
        polygons: {
          $geoIntersects: {
            $geometry: {
              type: "Point",
              coordinates: [
                orderData.stop1.latitude,
                orderData.stop1.longitude,
              ],
            },
          },
        },
      });
      if (r3.length == 0) {
        return { error: "We cannot deliver on this address" };
      }
    }
    if (orderData.stop2) {
      const r4 = await polygonModel.find({
        polygons: {
          $geoIntersects: {
            $geometry: {
              type: "Point",
              coordinates: [
                orderData.stop2.latitude,
                orderData.stop2.longitude,
              ],
            },
          },
        },
      });
      if (r4.length == 0) {
        return { error: "We cannot deliver on this address" };
      }
    }
    return {
      data: "We can deliver on this address",
    };
  } catch (error) {
    return { error };
  }
};
const findDistanceAndDuration = async (origins, destinations, waypoints) => {
  try {
    const directionsRes = await googleClient.directions({
      params: {
        origin: origins[0],
        destination: destinations[0],
        waypoints,
        travelMode: "DRIVING",
        unitSystem: 0,
        key: process.env.GOOGLE_MAP_API_KEY,
      },
    });
    const totalDistanceAndDuration = directionsRes.data.routes[0].legs.reduce(
      (acc, cur) => {
        let distance = Number(cur.distance.text.split(" ")[0]);
        let duration = Number(cur.duration.value);
        const unit = cur.distance.text.split(" ")[1];
        if (unit === "m") {
          distance = distance / 1000;
        }
        return {
          distance: acc.distance + distance,
          duration: acc.duration + duration,
        };
      },
      { distance: 0, duration: 0 }
    );
    if (directionsRes.status == 200) {
      return { data: { ...totalDistanceAndDuration } };
    } else {
      return { error: directionsRes.data.error_message };
    }
  } catch (error) {
    return { error: error };
  }
};

const getAllDriversWithinRange = async (orderDetails) => {
  try {
    const drivers = await driverModel.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [
              orderDetails.source.latitude,
              orderDetails.source.longitude,
            ],
          },
          query: {
            availabilityStatus: "ONLINE",
            deliveryStatus: "FREE",
          },
          distanceField: "dist.calculated",
          maxDistance: 500,
          includeLocs: "dist.location",
          spherical: true,
        },
      },
    ]);
    const wayPoints = [];
    if (orderDetails?.stop1?.latitude && orderDetails?.stop1?.longitude) {
      wayPoints.push({
        lat: orderDetails?.stop1?.latitude,
        lng: orderDetails?.stop1?.longitude,
      });
    }
    if (orderDetails?.stop2?.latitude && orderDetails?.stop2?.longitude) {
      wayPoints.push({
        lat: orderDetails?.stop2?.latitude,
        lng: orderDetails?.stop2?.longitude,
      });
    }
    const distanceAndDuration = await findDistanceAndDuration(
      [
        {
          lat: orderDetails.source.latitude,
          lng: orderDetails.source.longitude,
        },
      ],
      [
        {
          lat: orderDetails.destination.latitude,
          lng: orderDetails.destination.longitude,
        },
        ,
      ],
      wayPoints
    );
    if (distanceAndDuration.error) {
      throw distanceAndDuration.error;
    }

    const vehicles = await vehicleModel.find({});
    const vehiclesData = {};
    for (let i = 0; i < vehicles.length; i++) {
      const vehicle = vehicles[i];
      const priceEntity = await priceModel.findOne({
        vehicleId: vehicle.id,
      });
      const matchParameter = priceEntity?.vehicleInfo?.find(
        (el) =>
          el.startRange <= distanceAndDuration.data.distance &&
          el.endRange >= distanceAndDuration.data.distance
      );
      const calculatedPrice = Math.max(
        distanceAndDuration.data.distance * matchParameter?.pricePerKm,
        matchParameter?.minPrice || 0
      );
      const GST = (calculatedPrice * 18) / 100;
      const priceWithGST = Math.ceil(GST + calculatedPrice);
      const filteredDrivers = drivers.filter(
        (driver) => driver.vehicleId === vehicle.id
      );
      let distanceAndDurationForDriver;
      if (filteredDrivers.length) {
        distanceAndDurationForDriver = await findDistanceAndDuration(
          [
            {
              lat: orderDetails.source.latitude,
              lng: orderDetails.source.longitude,
            },
          ],
          [
            {
              lat: filteredDrivers[0].location.coordinates[0],
              lng: filteredDrivers[0].location.coordinates[1],
            },
            ,
          ],
          wayPoints
        );
        if (distanceAndDurationForDriver.error) {
          throw distanceAndDurationForDriver.error;
        }
      }
      vehiclesData[vehicle.id] = {
        drivers: filteredDrivers,
        distance: {
          value: distanceAndDuration.data.distance,
          unit: "km",
        },
        duration: {
          value: distanceAndDurationForDriver?.data?.duration
            ? Math.ceil(distanceAndDurationForDriver?.data?.duration / 60)
            : 0,
          unit: "min",
        },
        price: {
          value: priceWithGST,
          unit: "Rs",
        },
      };
    }

    return {
      data: {
        ...vehiclesData,
      },
    };
  } catch (error) {
    console.log(error);
    return { error: error };
  }
};

const generateInvoice = async (orderDetails) => {
  try {
    const invoiceNumber = generateUniqueId({
      length: 10,
      useLetters: false,
      useNumbers: true,
    });
    const userDetails = await userModel.findOne({ _id: orderDetails.userId });
    const goodDetails = await goodModel.findOne({ _id: orderDetails.goodId });
    const driverDetails = await driverModel.findOne({
      _id: orderDetails.driverId,
    });
    const vehicleName = await getVehicleName(orderDetails.vehicleId);
    let deliveredDate = "";
    if (orderDetails.deliveredAt) {
      let d = new Date(new Date(orderDetails.deliveredAt).toISOString());
      deliveredDate =
        new Date(orderDetails.deliveredAt).toISOString().split("T")[0] +
        " " +
        d.getHours() +
        ":" +
        d.getMinutes() +
        ":" +
        d.getSeconds();
    }

    const html = getInvoiceHTML(
      orderDetails,
      invoiceNumber,
      userDetails,
      goodDetails,
      driverDetails,
      vehicleName,
      deliveredDate
    );
    return new Promise((resolve, reject) => {
      pdf
        .create(html, {
          format: "A3",
          "phantomPath": "../node_modules/phantomjs-prebuilt/bin/phantomjs"
        })
        .toBuffer(async function (err, buffer) {
          if (err) {
            console.log(err);
            return reject(err);
          }
          const location = await uploadS3(
            `orders/${orderDetails._id}/invoice.pdf`,
            buffer
          );
          const orderData = await orderModel.findByIdAndUpdate(
            orderDetails._id,
            {
              $set: {
                invoice: location,
              },
            },
            { new: true }
          );
          await invoiceModel.create({
            invoice: location,
            invoiceNumber: invoiceNumber,
          });
          return resolve(orderData);
        });
    });
  } catch (error) {
    console.log(error);
    return { error: error };
  }
};

const sendInvoiceMail = async (data) => {
  try {
    const orderDetails = await orderModel.findById(data.orderId);
    const userDetails = await userModel.findById(orderDetails.userId);
    console.log(orderDetails.invoice);
    const buffer = await getObject(
      orderDetails?.invoice?.split("/")?.slice(3)?.join("/")
    );
    await sendEmail(userDetails.email, buffer);
    return { data: "Successfully sent a mail" };
  } catch (error) {
    console.log(error);
    return { error: error };
  }
};

const getOrderDetails = async (orderId) => {
  try {
    const orderDetails = await orderModel.findById(orderId);
    let driverDetails;
    if (orderDetails.driverId) {
      driverDetails = await driverModel.findById(orderDetails.driverId);
    }
    let vehicleName = await getVehicleName(orderDetails.vehicleId);
    let goodName = await getGoodName(orderDetails.goodId);
    return {
      data: {
        ...orderDetails._doc,
        vehicleType: vehicleName,
        goodName,
        driverName: driverDetails?.driverName,
      },
    };
  } catch (error) {
    console.log(error);
    return { error: error };
  }
};

module.exports = {
  getUserOrders,
  getDriverOrders,
  getAllOrders,
  updateOrder,
  rejectOrder,
  claimOrder,
  orderDelivered,
  refund,
  approveRefund,
  uploadSignature,
  checkOrderLocation,
  checkLocation,
  cancelOrder,
  findDistanceAndDuration,
  getAllDriversWithinRange,
  sendInvoiceMail,
  getOrderDetails,
  generateSuccesInvoice,
  sendNotificationToUser,
  sendNotification
};
