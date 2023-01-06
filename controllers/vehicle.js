const vehicleService = require("../services/vehicle");

exports.addVehicle = async (req, res) => {
  try {
    if (!req.body.name) {
      return res.status(400).send({ error: "Please provide required data!" });
    }
    req.body["image"] = req.files["image"]?.[0];
    const vehicleDetails = await vehicleService.addVehicle(req.body);
    if (vehicleDetails.error) {
      return res.status(400).send({ error: vehicleDetails.error });
    }
    return res.status(200).send({ data: vehicleDetails.data });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error });
  }
};

exports.getVehicleList = async (req, res) => {
  try {
    const vehicleList = await vehicleService.getVehicleList();
    if (vehicleList.error) {
      return res.status(400).send({ error: vehicleList.error });
    }
    return res.status(200).send({ data: vehicleList.data });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error });
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    req.body["image"] = req.files["image"]?.[0];
    const data = await vehicleService.updateVehicle(req.body);
    if (data.error) {
      return res.status(400).send({ error: data.error });
    }
    return res.status(200).send({ data: data.data });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error });
  }
};
