const userModel = require("../models/user");
const polygonModel = require("../models/accountSetting");
const walletService = require("../services/wallet");
const { currentDate } = require("../utils/common");
const { Client } = require("@googlemaps/google-maps-services-js");
const accountSetting = require("../models/accountSetting");
const accountSettingModal = require("../models/accountSetting");
const googleClient = new Client({});
require("dotenv").config();

const findUserByPhoneNumber = async (phoneNumber) => {
  try {
    let userDetails = await userModel.findOne({
      phoneNumber: phoneNumber,
    });
    if (userDetails && !userDetails.accountStatus) {
      return { error: "Your Account has been Suspened" };
    }
    if (!userDetails) {
      return { data: false };
    } else {
      return { data: true };
    }
  } catch (error) {
    return { error: error };
  }
};
const testUser = async (userData) => {
  try {
    let userDetails = await userModel.findOne({
      phoneNumber: userData.phoneNumber,
    });
    if (userDetails && !userDetails.accountStatus) {
      return { error: "Your Account has been Suspened" };
    }
    let testOTP = "3698";
    if (userData.otp == testOTP) {
      if (!userDetails) {
        let date = currentDate();
        let newUser = await userModel.create({
          phoneNumber: userData.phoneNumber,
          createdAt: date,
          updatedAt: date,
        });
        const supportDetails=await accountSettingModal.findOne({});
        await walletService.addWallet({
          userId: newUser._id,
          type: "user",
          balance: 0,
          minBalance: 100,
          createdAt: date,
          updatedAt: date,
        });
        return { data: {...newUser._doc,supportDetails:{
          phone: supportDetails?.phone,
          email: supportDetails?.email
        } }};
      } else {
        const supportDetails=await accountSettingModal.findOne({});
        return { data: {...userDetails._doc,supportDetails:{
          phone: supportDetails?.phone,
          email: supportDetails?.email
        }} };
      }
    } else {
      return { error: "Wrong OTP!" };
    }
  } catch (error) {
    console.log(error);
    return { error: error };
  }
};
const updateUser = async (userData) => {
  try {
    let userDetails = await userModel.findOneAndUpdate(
      { _id: userData._id },
      { $set: userData },
      { new: true }
    );
    const supportDetails=await accountSettingModal.findOne({});
    return { data: {...userDetails._doc,supportDetails:{
      phone: supportDetails?.phone,
      email: supportDetails?.email
    }} };
  } catch (error) {
    return { error: error };
  }
};
const addUser = async (userData) => {
  try {
    let userDetails = await userModel.findOne({
      phoneNumber: userData.phoneNumber,
    });
    if (userDetails) {
      return { error: "User ALready Exist" };
    } else {
      let date = currentDate();
      let newUser = await userModel.create({
        ...userData,
        createdAt: date,
        updatedAt: date,
      });
      await walletService.addWallet({
        userId: newUser._id,
        type: "user",
        balance: 0,
        minBalance: 100,
        createdAt: date,
        updatedAt: date,
      });
      return { data: newUser };
    }
  } catch (error) {
    console.log(error);
    return { error: error };
  }
};
const findAllUsers = async () => {
  try {
    let userDetails = await userModel.find().sort({ createdAt: "desc" });
    return { data: userDetails };
  } catch (error) {
    return { error: error };
  }
};
const updateUserStatus = async (userData) => {
  try {
    let userDetails = await userModel.findOne({ _id: userData._id });
    if (userDetails) {
      let updatedUserDetails = await userModel.findOneAndUpdate(
        { _id: userData._id },
        {
          $set: {
            accountStatus: userData.accountStatus,
            deActivatedReason: userData.deActivatedReason
              ? userData.deActivatedReason
              : "",
          },
        },
        { new: true }
      );
      return { data: updatedUserDetails };
    } else {
      return { error: "User Not Found" };
    }
  } catch (error) {
    return { error: error };
  }
};
const updateUserDeviceToken = async (userData, deviceToken) => {
  try {
    let updatedUserDetails = await userModel.findOneAndUpdate(
      { _id: userData._id },
      { $set: { deviceToken } },
      { new: true }
    );
    return { data: updatedUserDetails };
  } catch (error) {
    return { error: error };
  }
};
const checkLocation = async (location) => {
  try {
    const coordinate = new googleClient.maps.LatLng(40, -90);
    const polygonT = new googleClient.maps.Polygon(
      [],
      "#000000",
      1,
      1,
      "#336699",
      0.3
    );
    const isWithinPolygon = polygonT.containsLatLng(coordinate);
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
module.exports = {
  findUserByPhoneNumber,
  testUser,
  updateUser,
  findAllUsers,
  updateUserStatus,
  addUser,
  updateUserDeviceToken,
  checkLocation,
};
