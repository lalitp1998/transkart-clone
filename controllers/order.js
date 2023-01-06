const orderService = require("../services/order");

exports.getUserOrders = async (req, res) => {
  try {
    let userId;
    if (req.admin) {
      if (!req.query.userId) {
        return res.status(400).send({ error: "Please Pass user id" });
      }
      userId = req.query.userId;
    }
    if (req.user) {
      userId = req.user._id;
    }
    const orders = await orderService.getUserOrders(userId);
    if (orders.error) {
      return res.status(400).send({ error: orders.error });
    }
    return res.status(200).send({ data: orders.data });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error });
  }
};
exports.getDriverOrders = async (req, res) => {
  try {
    let driverId;
    if (req.admin) {
      if (!req.query.driverId) {
        return res.status(400).send({ error: "Please Pass user id" });
      }
      driverId = req.query.driverId;
    }
    if (req.driver) {
      driverId = req.driver._id;
    }
    const orders = await orderService.getDriverOrders(driverId);
    if (orders.error) {
      return res.status(400).send({ error: orders.error });
    }
    return res.status(200).send({ data: orders.data });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        error: "Order Data is missing.",
      });
    }
    if (req.user) {
      req.body.userId = req.user._id;
    }
    let order = await orderService.updateOrder(req.body);
    if (order.error) {
      res.status(400).send({ error: order.error });
    } else {
      res.status(200).send({ data: order.data });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    let order = await orderService.getAllOrders();
    if (order.error) {
      res.status(400).send({ error: order.error });
    } else {
      res.status(200).send({ data: order.data });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error });
  }
};
exports.rejectOrder = async (req, res) => {
  try {
    if (!req.query.id) {
      return res.status(400).send({ error: "Please Pass Order Id." });
    }
    let order = await orderService.rejectOrder(req.query.id);
    if (order.error) {
      res.status(400).send({ error: order.error });
    } else {
      res.status(200).send({ data: order.data });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error });
  }
};

exports.claimOrder = async (req, res) => {
  try {
    if (!req.query.orderId) {
      return res.status(400).send({ error: "Please Pass Order Id." });
    }
    let order = await orderService.claimOrder(req.query.orderId, req.driver._id);
    if (order.error) {
      res.status(400).send({ error: order.error });
    } else {
      res.status(200).send({ data: order.data });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error });
  }
};

exports.orderDelivered = async (req, res) => {
  try {
    if (!req.body.orderId) {
      return res.status(400).send({ error: "Please Pass Order Id." });
    }
    let order = await orderService.orderDelivered(req.body);
    if (order.error) {
      res.status(400).send({ error: order.error });
    } else {
      res.status(200).send({ data: order.data });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error });
  }
};
exports.orderCancel = async (req, res) => {
  try {
    if (!req.body.orderId) {
      return res.status(400).send({ error: "Please Pass Order Id." });
    }
    let order = await orderService.cancelOrder(req.body.orderId);
    if (order.error) {
      console.log(order.error);
      res.status(400).send({ error: order.error });
    } else {
      res.status(200).send({ data: order.data });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error });
  }
};

exports.refund = async (req, res) => {
  try {
    if (!req.query.id) {
      return res.status(400).send({ error: "Please Pass Order Id." });
    }
    let order = await orderService.refund(req.query.id);
    if (order.error) {
      res.status(400).send({ error: order.error });
    } else {
      res.status(200).send({ data: order.data });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error });
  }
};

exports.approveRefund = async (req, res) => {
  try {
    if (!req.query.id) {
      return res.status(400).send({ error: "Please Pass Order Id." });
    }
    let order = await orderService.approveRefund(req.query.id);
    if (order.error) {
      res.status(400).send({ error: order.error });
    } else {
      res.status(200).send({ data: order.data });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error });
  }
};

exports.uploadSignature = async (req, res) => {
  try {
    if (!req.body.orderId) {
      res.status(400).send({ error: "Order Id is missing" });
      return;
    }
    req.body["receiverSignature"] = req.files?.["receiverSignature"]?.[0];
    req.body["senderSignature"] = req.files?.["senderSignature"]?.[0];
    req.body["stop1Signature"] = req.files?.["stop1Signature"]?.[0];
    req.body["stop2Signature"] = req.files?.["stop2Signature"]?.[0];
    const order = await orderService.uploadSignature(req.body);
    if (order.error) {
      res.status(400).send({ error: order.error });
    } else {
      res.status(200).send({ data: order.data });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error });
  }
};

exports.checkLocation = async (req, res) => {
  try {
    if (!req.body.latitude || !req.body.longitude) {
      res.status(400).send({ error: "data is missing" });
      return;
    }
    const order = await orderService.checkLocation(req.body);
    if (order.error) {
      res.status(400).send({ error: order.error });
    } else {
      res.status(200).send({ data: order.data });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error });
  }
};

exports.checkOrderLocation = async (req, res) => {
  try {
    if (!req.body.orderId) {
      res.status(400).send({ error: "Order Id is missing" });
      return;
    }
    const order = await orderService.checkOrderLocation(req.body.orderId);
    if (order.error) {
      res.status(400).send({ error: order.error });
    } else {
      res.status(200).send({ data: order.data });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error });
  }
};
exports.findDistance = async (req, res) => {
  try {
    const order = await orderService.findDistance();
    if (order.error) {
      res.status(400).send({ error: order.error });
    } else {
      res.status(200).send({ data: order.data });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error });
  }
};
exports.getAllDriversWithinRange = async (req, res) => {
  try {
    const order = await orderService.getAllDriversWithinRange(req.body);
    if (order.error) {
      res.status(400).send({ error: order.error });
    } else {
      res.status(200).send({ data: order.data });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error });
  }
};
exports.sendInvoiceMail = async (req, res) => {
  try {
    const order = await orderService.sendInvoiceMail(req.body);
    if (order.error) {
      res.status(400).send({ error: order.error });
    } else {
      res.status(200).send({ data: order.data });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error });
  }
};
exports.getOrderDetails = async (req, res) => {
  try {
    if (!req.query.orderId) {
      res.status(400).send({ error: "Order Id is missing" });
    }
    const order = await orderService.getOrderDetails(req.query.orderId);
    if (order.error) {
      res.status(400).send({ error: order.error });
    } else {
      res.status(200).send({ data: order.data });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error });
  }
};
