const driverService = require("../services/driver");
const userModel = require("../models/user");
const jwt = require("jsonwebtoken");
const orderModel = require("../models/order");

exports.updateDriver = async (req, res) => {
  try {
    if (req.files && Object.keys(req.files).length > 0) {
      Object.keys(req.files).forEach((file) => {
        req.body[file] = req.files[file][0];
      });
    }
    // console.log(req.body)
    if (!req.body) {
      return res.status(400).json({
        error: "Driver Data is missing.",
      });
    }
    let newDriver = await driverService.updateDriver(req.body);
    if (newDriver.error) {
      res.status(400).send({ error: newDriver.error });
    } else {
      res.status(200).send({ data: newDriver.data });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error });
  }
};
exports.sendOTP = async (req, res) => {
  try {
    if (!req.body.phoneNumber) {
      return res.status(400).send({ error: "Please Pass Credentials" });
    }
    let response = await driverService.sendOTP(req.body);
    if (!response) {
      res.status(400).send({ error: "Try After Some Time" });
    } else {
      res.status(200).send({ data: "OTP Send SuccessFully." });
    }
  } catch (error) {
    res.status(400).send({ error: error });
  }
};
exports.verifyOTP = async (req, res) => {
  try {
    if (!req.body.phoneNumber || !req.body.otp) {
      return res.status(400).send({ error: "Please Pass Credentials" });
    }
    let response = await driverService.verifyOTP(req.body);
    if (!response) {
      res.status(400).send({ error: "Wrong OTP" });
    } else {
      let payload = { phoneNumber: req.body.phoneNumber };
      let token = jwt.sign(payload, process.env.SECRET, { expiresIn: "30d" });
      res
        .status(200)
        .json({ message: "ok", token: token, driver: response.data });
    }
  } catch (error) {
    res.status(400).send({ error: error });
  }
};
exports.testDriver = async (req, res) => {
  try {
    if (!req.body.phoneNumber || !req.body.otp) {
      return res.status(400).send({ error: "Please Pass Credentials" });
    }
    let response = await driverService.testDriver(req.body);
    if (response.error) {
      res.status(400).send({ error: response.error });
    } else {
      let payload = { phoneNumber: req.body.phoneNumber };
      let token = jwt.sign(payload, process.env.SECRET, { expiresIn: "30d" });
      res
        .status(200)
        .json({ message: "ok", token: token, driver: response.data });
    }
  } catch (error) {
    res.status(400).send({ error: error });
  }
};
exports.findDriverByPhone = async (req, res) => {
  try {
    if (!req.body.phoneNumber) {
      return res.status(400).send({ error: "Please Pass Credentials" });
    }
    let response = await driverService.findDriverByPhone(req.body.phoneNumber);
    if (response.error) {
      res.status(400).send({ error: response.error });
    } else {
      res.status(200).send({ data: response.data });
    }
  } catch (error) {
    res.status(400).send({ error: error });
  }
};
exports.refreshToken = async (req, res) => {
  try {
    let driverDetails = req.driver;
    let payload = { phoneNumber: driverDetails.phoneNumber };
    let token = jwt.sign(payload, process.env.SECRET, { expiresIn: "30d" });
    res
      .status(200)
      .json({ message: "ok", token: token, driver: driverDetails });
  } catch (error) {
    res.status(400).send({ error: error });
  }
};
exports.verifyDriver = async (req, res) => {
  try {
    let responseData;
    let orderData = await orderModel.findOne({
      orderStatus: "ACCEPTED",
      driverId: req.driver._id,
    });
    if (orderData) {
      let user = await userModel.findById(orderData.userId);
      orderData = {
        ...orderData._doc,
        ...{
          sender: {
            name: `${user.firstName} ${user.lastName}`,
            phoneNumber: user.phoneNumber,
          },
        },
      };
      responseData = { ...req.driver, order: orderData };
    } else {
      responseData = req.driver;
    }

    res.status(200).json({ data: responseData });
  } catch (error) {
    res.status(400).send({ error: error });
  }
};
exports.findDriverList = async (req, res) => {
  try {
    let response = await driverService.findAllDrivers();
    if (response.error) {
      res.status(400).send({ error: response.error });
    } else {
      res.status(200).send({ data: response.data });
    }
  } catch (error) {
    res.status(400).send({ error: error });
  }
};
exports.deleteDriver = async (req, res) => {
  try {
    let response = await driverService.deleteDriver(req.query.id);
    if (response.error) {
      res.status(400).send({ error: response.error });
    } else {
      res.status(200).send({ data: response.data });
    }
  } catch (error) {
    res.status(400).send({ error: error });
  }
};
exports.updateDriverStatus = async (req, res) => {
  try {
    let response = await driverService.activateOrDeActivateDriver(req.body);
    if (response.error) {
      res.status(400).send({ error: response.error });
    } else {
      res.status(200).send({ data: response.data });
    }
  } catch (error) {
    res.status(400).send({ error: error });
  }
};
exports.updateDriverDeviceToken = async (req, res) => {
  try {
    if (!req.body.deviceToken) {
      return res.status(400).send({ error: "Please Pass Device Token" });
    }
    let response = await driverService.updateDriverDeviceToken(
      req.driver,
      req.body.deviceToken
    );
    if (response.error) {
      return res.status(400).send({ error: response.error });
    } else {
      return res.status(200).send({ data: response.data });
    }
  } catch (error) {
    res.status(400).send({ error: error });
  }
};
exports.updateDriverLocation = async (req, res) => {
  try {
    if (!req.body.location) {
      return res.status(400).send({ error: "Please Pass Location" });
    }
    let response = await driverService.updateDriverLocation(
      req.driver,
      req.body.location
    );
    if (response.error) {
      return res.status(400).send({ error: response.error });
    } else {
      return res.status(200).send({ data: response.data });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error });
  }
};

exports.getAllDriversWithinOrderRadius = async (req, res) => {
  try {
    const result = await driverService.getAllDriversWithinOrderRadius(
      req.body.location
    );
    if (result.error) {
      res.status(400).send({ error: result.error });
    } else {
      res.status(200).send({ data: result.data });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error });
  }
};
exports.updateDriverAvailablityStatus = async (req, res) => {
  try {
    if (!req.body.status) {
      return res.status(400).send({ error: "Please Pass Proper Body" });
    }
    req.body.driverId = req.driver._id;
    let response = await driverService.updateDriverAvailabilityStatus(req.body);
    if (response.error) {
      return res.status(400).send({ error: response.error });
    } else {
      return res.status(200).send({ data: response.data });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error });
  }
};
