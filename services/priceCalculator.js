const priceModel = require("../models/priceCalculator");
const driverModel = require("../models/driver");
const vehicleModel = require("../models/vehicle");
const orderService = require("./order");
const { getVehicleName } = require("./vehicle");

const addPriceEntity = async (priceEntity) => {
  try {
    const { vehicleId, vehicleInfo } = priceEntity;

    const priceEntityDetails = await priceModel.create({
      vehicleInfo,
      vehicleId,
    });
    let vehicleDetails = await vehicleModel.findById(vehicleId);
    let updatedPriceEntity = {
      _id: priceEntityDetails._id,
      vehicleInfo: priceEntityDetails.vehicleInfo,
      vehicleId: priceEntityDetails.vehicleId,
      vehicleType: vehicleDetails.name,
    };
    return { data: updatedPriceEntity };
  } catch (error) {
    console.log(error);
    return { error };
  }
};

const updatePriceEntity = async (priceEntity) => {
  try {
    const priceEntityDetails = await priceModel.findOneAndUpdate(
      { _id: priceEntity._id },
      { $set: priceEntity },
      { new: true }
    );
    let vehicleDetails = await getVehicleName(priceEntity.vehicleId);
    let updatedPriceEntity = {
      _id: priceEntityDetails._id,
      vehicleId: priceEntityDetails.vehicleId,
      vehicleInfo: priceEntityDetails.vehicleInfo,
      vehicleType: vehicleDetails,
    };
    return { data: updatedPriceEntity };
  } catch (error) {
    console.log(error);
    return { error };
  }
};

const calculatePrice = async (orderDetails) => {
  try {
    if (
      !orderDetails?.source?.latitude ||
      !orderDetails?.source?.longitude ||
      !orderDetails?.destination?.latitude ||
      !orderDetails?.destination?.longitude
    ) {
      return { error: "Please provide proper body" };
    }
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
    const distanceAndDuration = await orderService.findDistanceAndDuration(
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
      return { error: distanceAndDuration.error };
    }
    const priceEntity = await priceModel.find({});
    if (!priceEntity.length) {
      return { error: "Please provide proper body" };
    }
    const data = [];
    for (let i = 0; i < priceEntity.length; i++) {
      const matchParameter = priceEntity[i].vehicleInfo.find(
        (el) =>
          el.startRange <= distanceAndDuration.data.distance &&
          el.endRange >= distanceAndDuration.data.distance
      );
      if (matchParameter) {
        const calculatedPrice = Math.max(
          distanceAndDuration.data.distance * matchParameter.pricePerKm,
          matchParameter.minPrice || 0
        );
        const GST = (calculatedPrice * 18) / 100;
        const priceWithGST = Math.ceil(GST + calculatedPrice);
        const vehicleData = await vehicleModel.findById(
          priceEntity[i].vehicleId
        );
        const nearestDriver = await driverModel.find({
          location: {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [
                  orderDetails?.source?.latitude,
                  orderDetails?.source?.longitude,
                ],
              },
            },
          },
          availabilityStatus: "ONLINE",
          deliveryStatus: "FREE",
          vehicleId: priceEntity[i].vehicleId,
        });
        if (vehicleData.status === "ACTIVATED") {
          const distanceAndDuration =
            await orderService.findDistanceAndDuration(
              [
                {
                  lat: orderDetails.source.latitude,
                  lng: orderDetails.source.longitude,
                },
              ],
              [
                {
                  lat: nearestDriver?.[0].location.latitude,
                  lng: nearestDriver?.[0].location.longitude,
                },
                ,
              ]
            );
          data.push({
            price: priceWithGST,
            unit: "Rs",
            vehicleData,
            isDriverAvailable: nearestDriver.length ? true : false,
            nearestDriver: nearestDriver?.[0],
            ...distanceAndDuration,
          });
        }
      }
    }
    return { data };
  } catch (error) {
    console.log(error);
    return { error };
  }
};
const getPriceEntity = async () => {
  try {
    let priceEntity = await priceModel.find({});
    const vehicleList = await vehicleModel.find({});
    let updatePriceEntity = priceEntity.map((entity) => {
      let vehicleType = vehicleList.find(
        (vehicle) => vehicle._id == entity.vehicleId
      )?.name;
      entity.vehicleType = vehicleType;
      return {
        _id: entity._id,
        vehicleId: entity.vehicleId,
        vehicleInfo: entity.vehicleInfo,
        vehicleType: entity.vehicleType,
      };
    });
    return { data: updatePriceEntity };
  } catch (error) {
    console.log(error);
    return { error };
  }
};

module.exports = {
  addPriceEntity,
  updatePriceEntity,
  calculatePrice,
  getPriceEntity,
};
