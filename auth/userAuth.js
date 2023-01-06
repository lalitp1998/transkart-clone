const userModal = require("../models/user");
const jwt = require("jsonwebtoken");
const accountSettingModal = require("../models/accountSetting");

const validateUserAuth = async (req, res, next) => {
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
      let userDetails = await userModal.findOne({
        phoneNumber: decrypt.payload.phoneNumber,
      });
      const supportDetails = await accountSettingModal.findOne({});
      if (!userDetails) {
        isValidToken = false;
        return res.status(401).json({
          status: 401,
          error: "No user found.",
        });
      }
      if (userDetails && !userDetails.accountStatus) {
        isValidToken = false;
        return res.status(401).json({
          status: 401,
          error: "Account Deactivated.",
        });
      }
      if (isValidToken) {
        userDetails.expiresIn = decrypt.exp * 1000;
        req.user = {
          ...userDetails._doc,
          supportDetails: {
            phone: supportDetails.phone,
            email: supportDetails.email,
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
  validateUserAuth,
};
