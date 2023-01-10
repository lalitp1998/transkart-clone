const driverModal = require("../models/driver");
const accountSettingModal = require("../models/accountSetting");
const jwt = require("jsonwebtoken");
const { getVehicleName } = require("../services/vehicle");

const validateDriverAuth = async (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({
      status: 401,
      message: "Token not found",
    });
  }
  const token = req.headers.authorization.split(" ")[1] || req.params.token;
  let isValidToken = true;
  if (!token) {
    isValidToken = false;
    return res.status(401).json({
      status: 401,
      message: "Token not found",
    });
  }
  try {
    const decrypt = jwt.verify(token, process.env.SECRET, { complete: true });
    if (decrypt.payload && decrypt.payload.phoneNumber) {
      let driverDetails = await driverModal.findOne({
        phoneNumber: decrypt.payload.phoneNumber,
      });
      const supportDetails = await accountSettingModal.findOne({});
      if (!driverDetails) {
        isValidToken = false;
        return res.status(401).json({
          status: 401,
          error: "No user found.",
        });
      }
      if (driverDetails && !driverDetails.accountStatus) {
        isValidToken = false;
        return res.status(401).json({
          status: 401,
          error: "Account Deactivated.",
        });
      }
      if (isValidToken) {
        const vehicleName = await getVehicleName(driverDetails.vehicleId);
        driverDetails.expiresIn = decrypt.exp * 1000;
        req.driver = {
          ...driverDetails._doc,
          vehicleType: vehicleName,
          supportDetails: {
            phone: supportDetails?.phone,
            email: supportDetails?.email,
          },
        };
        next();
      }
    } else {
      isValidToken = false;
      return res.status(401).json({
        status: 401,
        error: "No user found.",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: error,
    });
  }
};
module.exports = {
  validateDriverAuth,
};
