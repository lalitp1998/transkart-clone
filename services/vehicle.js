const vehicleModel = require("../models/vehicle");
const { uploadS3 } = require("../utils/upload");

const addVehicle = async (vehicleData) => {
  try {
    const vehicleDetails = await vehicleModel.create({
      name: vehicleData.name,
      status: "ACTIVATED",
      commission: vehicleData.commission,
    });
    const image = await uploadS3(
      `vehicle/${vehicleDetails._id}/${vehicleData.image.originalname}`,
      vehicleData.image.buffer
    );
    const newVehicleDetails = await vehicleModel.findByIdAndUpdate(
      vehicleDetails._id,
      { $set: { image } },
      { new: true }
    );
    return { data: newVehicleDetails };
  } catch (error) {
    console.log(error);
    return { error };
  }
};

const getVehicleList = async () => {
  try {
    const vehicleList = await vehicleModel.find({});
    return { data: vehicleList };
  } catch (error) {
    console.log(error);
    return { error };
  }
};

const updateVehicle = async (vehicleData) => {
  try {
    if (vehicleData.image) {
      const image = await uploadS3(
        `vehicle/${vehicleData._id}/${vehicleData.image.originalname}`,
        vehicleData.image.buffer
      );
      vehicleData.image = image;
    } else {
      delete vehicleData.image;
    }
    const data = await vehicleModel.findByIdAndUpdate(
      vehicleData._id,
      {
        $set: vehicleData,
      },
      { new: true }
    );
    return { data: data };
  } catch (error) {
    console.log(error);
    return { error };
  }
};

const getVehicleName = async (vehicleId) => {
  try {
    let vehicleName = "";
    if (vehicleId) {
      const vehicleData = await vehicleModel.findById(vehicleId);
      vehicleName = vehicleData?.name || "";
    }
    return vehicleName;
  } catch (error) {
    console.log(error);
  }
};
module.exports = {
  addVehicle,
  getVehicleList,
  updateVehicle,
  getVehicleName,
};
