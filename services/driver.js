const driverModal = require("../models/driver");
const { uploadS3 } = require("../utils/upload");
const Chance = require("chance");
const cryptoJS = require("crypto-js");
const aws = require("aws-sdk");
const moment = require("moment");
const { currentDate } = require("../utils/common");
const accountSetting = require("../models/accountSetting");
const { getVehicleName } = require("./vehicle");
let Pinpoint = new aws.Pinpoint({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.region,
});

let chance = new Chance();
const updateDriver = async (driverData) => {
  try {
    if (driverData._id) {
      let driver = await driverModal.findOne({ _id: driverData._id });
      if (driverData.aadharFront) {
        let aadharImage = driverData.aadharImage || driver.aadharImage || {};
        aadharImage.aadharFront = await uploadS3(
          `${driverData._id}/aadharFront.png`,
          driverData.aadharFront.buffer
        );
        aadharImage.isVerified = 2;
        driverData.aadharImage = aadharImage;
        driverData.driverDocumentStatus = "UPLOADED";
      }
      if (driverData.aadharBack) {
        let aadharImage = driverData.aadharImage || driver.aadharImage || {};
        aadharImage.aadharBack = await uploadS3(
          `${driverData._id}/aadharBack.png`,
          driverData.aadharBack.buffer
        );
        aadharImage.isVerified = 2;
        driverData.aadharImage = aadharImage;
        driverData.driverDocumentStatus = "UPLOADED";
      }
      if (driverData.rcFront) {
        let rcImage = driverData.rcImage || driver.rcImage || {};
        rcImage.rcFront = await uploadS3(
          `${driverData._id}/rcFront.png`,
          driverData.rcFront.buffer
        );
        rcImage.isVerified = 2;
        driverData.rcImage = rcImage;
        driverData.driverDocumentStatus = "UPLOADED";
      }
      if (driverData.rcBack) {
        let rcImage = driverData.rcImage || driver.rcImage || {};
        rcImage.rcBack = await uploadS3(
          `${driverData._id}/rcBack.png`,
          driverData.rcBack.buffer
        );
        rcImage.isVerified = 2;
        driverData.rcImage = rcImage;
        driverData.driverDocumentStatus = "UPLOADED";
      }
      if (driverData.dlFront) {
        let dlImage = driverData.dlImage || driver.dlImage || {};
        dlImage.dlFront = await uploadS3(
          `${driverData._id}/dlFront.png`,
          driverData.dlFront.buffer
        );
        dlImage.isVerified = 2;
        driverData.dlImage = dlImage;
        driverData.driverDocumentStatus = "UPLOADED";
      }
      if (driverData.dlBack) {
        let dlImage = driverData.dlImage || driver.dlImage || {};
        dlImage.dlBack = await uploadS3(
          `${driverData._id}/dlBack.png`,
          driverData.dlBack.buffer
        );
        dlImage.isVerified = 2;
        driverData.dlImage = dlImage;
        driverData.driverDocumentStatus = "UPLOADED";
      }
      if (driverData.panFront) {
        let panImage = driverData.panImage || driver.panImage || {};
        panImage.panFront = await uploadS3(
          `${driverData._id}/panFront.png`,
          driverData.panFront.buffer
        );
        panImage.isVerified = 2;
        driverData.panImage = panImage;
        driverData.vehicleDocumentStatus = "UPLOADED";
      }
      if (driverData.panBack) {
        let panImage = driverData.panImage || driver.panImage || {};
        panImage.panBack = await uploadS3(
          `${driverData._id}/panBack.png`,
          driverData.panBack.buffer
        );
        panImage.isVerified = 2;
        driverData.panImage = panImage;
        driverData.vehicleDocumentStatus = "UPLOADED";
      }
      if (driverData.chequeOrpb) {
        let chequeOrpbImage =
          driverData.chequeorpbImage || driver.chequeorpbImage || {};
        chequeOrpbImage.image = await uploadS3(
          `${driverData._id}/chequeOrpb.png`,
          driverData.chequeOrpb.buffer
        );
        chequeOrpbImage.isVerified = 2;
        driverData.chequeorpbImage = chequeOrpbImage;
        driverData.vehicleDocumentStatus = "UPLOADED";
      }
      if (driverData.puc) {
        let pucImage = driverData.pucImage || driver.pucImage || {};
        pucImage.image = await uploadS3(
          `${driverData._id}/puc.png`,
          driverData.puc.buffer
        );
        pucImage.isVerified = 2;
        driverData.pucImage = pucImage;
        driverData.vehicleDocumentStatus = "UPLOADED";
      }
      if (driverData.insurance) {
        let insuranceImage =
          driverData.insuranceImage || driver.insuranceImage || {};
        insuranceImage.image = await uploadS3(
          `${driverData._id}/insurance.png`,
          driverData.insurance.buffer
        );
        insuranceImage.isVerified = 2;
        driverData.insuranceImage = insuranceImage;
        driverData.vehicleDocumentStatus = "UPLOADED";
      }
      if (driverData.profile) {
        driverData.profileImage = await uploadS3(
          `${driverData._id}/profile.png`,
          driverData.profile.buffer
        );
      }
      // if (
      //   driverData.isTrainingCompleted &&
      //   (driver.driverDocumentStatus == "PENDING" ||
      //   driver.driverDocumentStatus == "UPLOADED" ||
      //   driver.driverDocumentStatus == "REJECTED")
      // ) {
      //   return { error: "Training is not completed yet." };
      // }
      if (
        driverData.isTrainingCompleted &&
        driver.driverDocumentStatus == "ACCEPTED" &&
        driver.vehicleDocumentStatus == "ACCEPTED" &&
        driver.isRegistrationFeeCompleted
      ) {
        driverData.accountStatus = "ACTIVE";
      }
      driverData.updatedAtByDriver = currentDate();

      let driverDetails = await driverModal.findOneAndUpdate(
        { _id: driverData._id },
        { $set: driverData },
        { new: true }
      );
      let vehicleName = await getVehicleName(driverDetails.vehicleId);

      return { data: { ...driverDetails._doc, vehicleType: vehicleName } };
    } else {
      let salt = chance.string({ length: 5 });
      driverData.password = cryptoJS.AES.encrypt(
        driverData.password.toString(),
        salt
      ).toString();
      driverData.salt = salt;
      let driverDetails = await driverModal.create(driverData);
      return { data: driverDetails };
    }
  } catch (error) {
    console.log(error);
    return { error: error };
  }
};
const testDriver = async (driverData) => {
  try {
    let driverDetails = await driverModal.findOne({
      phoneNumber: driverData.phoneNumber,
    });
    let testOTP = "3698";
    if (driverDetails && !driverDetails.accountStatus) {
      return { error: "Your Account has been DeActivated." };
    } else {
      if (driverData.otp == testOTP) {
        if (!driverDetails) {
          let date = currentDate();
          let newDriver = await driverModal.create({
            phoneNumber: driverData.phoneNumber,
            createdAt: date,
            lastOnline: date,
            updatedAtByDriver: date,
          });
          return { data: newDriver };
        } else {
          let vehicleName = await getVehicleName(driverDetails.vehicleId);
          return { data: { ...driverDetails._doc, vehicleType: vehicleName } };
        }
      } else {
        return { error: "Wrong OTP!" };
      }
    }
  } catch (error) {
    console.log(error);
    return { error: error };
  }
};
const sendOTP = async (driverData) => {
  try {
    let driverDetails = await driverModal.findOne({
      phoneNumber: driverData.phoneNumber,
    });
    if (driverDetails && !driverDetails.accountStatus) {
      return { error: "Your Account has been DeActivated." };
    }
    let response = await Pinpoint.sendOTPMessage({
      ApplicationId: "",
      SendOTPMessageRequestParameters: {
        BrandName: "",
        Channel: "",
        CodeLength: 6,
        ValidityPeriod: 30,
        AllowedAttempts: 5,
        DestinationIdentity: driverData.phoneNumber,
        OriginationIdentity: "",
        ReferenceId: "",
      },
    }).promise();
    if (response.MessageResponse.Result[""].DeliveryStatus == "SUCCESSFUL") {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return { error: error };
  }
};
const verifyOTP = async (driverData) => {
  try {
    let response = await Pinpoint.verifyOTPMessage({
      ApplicationId: "",
      VerifyOTPMessageRequestParameters: {
        DestinationIdentity: "",
        Otp: "",
        ReferenceId: "",
      },
    }).promise();
    if (response.VerificationResponse.Valid) {
      let driverDetails = await driverModal.findOne({
        phoneNumber: driverData.phoneNumber,
      });
      if (!driverDetails) {
        let newDriver = await driverModal.create({
          phoneNumber: driverData.phoneNumber,
        });
        return { data: newDriver };
      } else {
        return { data: driverDetails };
      }
    } else {
      return false;
    }
  } catch (error) {
    return { error: error };
  }
};
const findDriverByPhone = async (phoneNumber) => {
  try {
    let driverDetails = await driverModal.findOne({ phoneNumber: phoneNumber });
    if (!driverDetails) {
      return { data: false };
    } else {
      return { data: true };
    }
  } catch (error) {
    return { error: error };
  }
};
const findAllDrivers = async () => {
  try {
    let driverList = await driverModal.find({}).sort({ createdAt: "desc" });
    let updatedDriverList = await Promise.all(
      driverList.map(async (driver) => {
        let vehicleName = await getVehicleName(driver.vehicleId);
        return { ...driver._doc, vehicleType: vehicleName };
      })
    );
    return { data: updatedDriverList };
  } catch (error) {
    console.log(error);
    return { error: error };
  }
};
const deleteDriver = async (id) => {
  try {
    let driverData = await driverModal.findOne({ _id: id });
    if (driverData) {
      let deletedDriver = await driverModal.deleteOne({ _id: id });
      if (deletedDriver.deletedCount > 0) {
        return { data: "Driver Deleted SuccessFully." };
      } else {
        return { error: "Driver Not Deleted,Something went wrong" };
      }
    } else {
      return { error: "Driver Not Found" };
    }
  } catch (error) {}
};
const activateOrDeActivateDriver = async (driverData) => {
  try {
    let driverDetails = await driverModal.findOne({ _id: driverData._id });
    if (driverDetails) {
      if (driverData.accountStatus) {
        let accountStatus =
          driverDetails.driverDocumentStatus == "PENDING" ||
          driverDetails.vehicleDocumentStatus == "PENDING" ||
          !driverDetails.isTrainingCompleted ||
          !driverDetails.isRegistrationFeeCompleted
            ? "PENDING"
            : driverDetails.driverDocumentStatus == "REJECTED" ||
              driverDetails.vehicleDocumentStatus == "REJECTED"
            ? "REJECTED"
            : "ACTIVE";
        let updatedDriver = await driverModal.findOneAndUpdate(
          { _id: driverDetails._id },
          { $set: { accountStatus: accountStatus, notes: "" } },
          { new: true }
        );
        return { data: updatedDriver };
      } else {
        let updatedDriver = await driverModal.findOneAndUpdate(
          { _id: driverDetails._id },
          { $set: { accountStatus: "DEACTIVE", notes: driverData.message } },
          { new: true }
        );
        return { data: updatedDriver };
      }
    } else {
      return { error: "Driver Not Found" };
    }
  } catch (error) {
    console.log(error);
    return { error: error };
  }
};
const updateDriverDeviceToken = async (driverData, deviceToken) => {
  try {
    let updatedDriverDetails = await driverModal.findOneAndUpdate(
      { _id: driverData._id },
      { $set: { deviceToken } },
      { new: true }
    );
    return { data: updatedDriverDetails };
  } catch (error) {
    return { error: error };
  }
};
const updateDriverLocation = async (driverData, location) => {
  try {
    let updatedDriverDetails = await driverModal.findOneAndUpdate(
      { _id: driverData._id },
      {
        $set: {
          location: {
            type: "Point",
            coordinates: [location.lat, location.lng],
          },
        },
      },
      { new: true }
    );
    return { data: updatedDriverDetails };
  } catch (error) {
    console.log(error);
    return { error: error };
  }
};
const getAllDriversWithinOrderRadius = async (location) => {
  try {
    const accountSettings = await accountSetting.find({});
    const drivers = await driverModal.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [location.lat, location.lng] },
          distanceField: "dist.calculated",
          maxDistance: accountSettings[0]?.orderRange || 5000,
          query: { deliveryStatus: "FREE", availabilityStatus: "ONLINE" },
          includeLocs: "dist.location",
          spherical: true,
        },
      },
    ]);
    return { data: drivers };
  } catch (error) {
    console.log(error);
    return { error: error };
  }
};
const updateDriverAvailabilityStatus = async (driverData) => {
  try {
    let objectToBeSet = {
      availabilityStatus: driverData.status,
    };
    if (driverData.status === "OFFLINE") {
      objectToBeSet.lastOnline = currentDate();
      objectToBeSet.availabilityStatusNotificationSend = false;
    }
    let driverDetails = await driverModal.findByIdAndUpdate(
      { _id: driverData.driverId },
      { $set: objectToBeSet },
      { new: true }
    );
    return { data: driverDetails };
  } catch (error) {
    console.log(error);
    return { error: error };
  }
};
module.exports = {
  updateDriver,
  testDriver,
  sendOTP,
  verifyOTP,
  findDriverByPhone,
  findAllDrivers,
  deleteDriver,
  activateOrDeActivateDriver,
  updateDriverDeviceToken,
  updateDriverLocation,
  getAllDriversWithinOrderRadius,
  updateDriverAvailabilityStatus,
};
