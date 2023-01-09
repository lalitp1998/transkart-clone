const driverModel = require("../models/driver");
const adminModel = require("../models/admin");
const walletService = require("./wallet");
const Chance = require("chance");
const cryptoJS = require("crypto-js");
let chance = new Chance();
const moment = require("moment");
const { currentDate } = require("../utils/common");
const { createContact } = require("./payment");
const { messaging } = require("../firebase-config");

const addAdmin = async (adminData) => {
  try {
    let salt = chance.string({ length: 5 });
    adminData.salt = salt;
    let password = chance.string({ length: 8 });
    adminData.password = cryptoJS.AES.encrypt(password, salt).toString();
    let adminDetails = await adminModel.create(adminData);
    return { data: adminDetails };
  } catch (error) {
    return { error: error };
  }
};
const loginAdmin = async (adminData) => {
  try {
    let adminDetails = await adminModel.findOne({
      username: adminData.username,
    });
    if (adminDetails) {
      var bytes = cryptoJS.AES.decrypt(
        adminDetails.password,
        adminDetails.salt
      );
      let password = bytes.toString(cryptoJS.enc.Utf8);
      if (password != adminData.password) {
        return { error: "Wrong credentials!" };
      } else {
        return { data: adminDetails };
      }
    } else {
      return { error: "Admin Not Foud!" };
    }
  } catch (error) {
    console.log(error);
    return { error: error };
  }
};
const changePassword = async (username, adminData) => {
  try {
    let admin = await adminModel.findOne({ username: username });
    if (admin) {
      var bytes = cryptoJS.AES.decrypt(admin.password, admin.salt);
      let oldPassword = bytes.toString(cryptoJS.enc.Utf8);
      if (oldPassword == adminData.oldPassword) {
        let salt = chance.string({ length: 5 });
        let newPassword = cryptoJS.AES.encrypt(
          adminData.newPassword,
          salt
        ).toString();
        let response = await adminModel.findOneAndUpdate(
          { _id: admin._id },
          { $set: { password: newPassword, salt: salt } },
          { new: true }
        );
        return { data: response };
      } else {
        return { error: "OLD PASSWORD NOT MATCHED." };
      }
    } else {
      return { error: "Admin Not Foud!" };
    }
  } catch (error) {
    return { error: error };
  }
};
const approveDriverDetails = async (driverData) => {
  try {
    let driverDetails = await driverModel.findOne({ _id: driverData._id });
    if (driverDetails) {
      if (!driverData.isVerified) {
        if (
          driverDetails.driverDocumentStatus == "UPLOADED" &&
          (driverData.image == "aadharImage" ||
            driverData.image == "dlImage" ||
            driverData.image == "rcImage")
        ) {
          driverDetails.driverDocumentStatus = "REJECTED";
        } else if (
          driverDetails.vehicleDocumentStatus == "UPLOADED" &&
          driverDetails.driverDocumentStatus == "ACCEPTED" &&
          (driverData.image == "insuranceImage" ||
            driverData.image == "panImage" ||
            driverData.image == "pucImage" ||
            driverData.image == "chequeorpbImage")
        ) {
          driverDetails.vehicleDocumentStatus = "REJECTED";
        } else {
          return { error: "You can't Reject this document" };
        }
        driverDetails.notes = driverData.message;
        driverDetails[driverData.image].isVerified = driverData.isVerified
          ? 1
          : 0;
        driverDetails.updatedAtByAdmin = currentDate();
        let response = await driverModel.findOneAndUpdate(
          { _id: driverDetails._id },
          { $set: driverDetails },
          { new: true }
        );
        return { data: response };
      } else {
        driverDetails[driverData.image].isVerified = driverData.isVerified
          ? 1
          : 0;
        if (
          driverDetails.driverDocumentStatus == "UPLOADED" &&
          driverDetails["aadharImage"].isVerified == 1 &&
          driverDetails["rcImage"].isVerified == 1 &&
          driverDetails["dlImage"].isVerified == 1
        ) {
          driverDetails.driverDocumentStatus = "ACCEPTED";
          let date = currentDate();
          await walletService.addWallet({
            userId: driverDetails._id,
            type: "driver",
            balance: 0,
            minBalance: 500,
            createdAt: date,
            updatedAt: date,
          });
        } else if (
          driverDetails.driverDocumentStatus == "ACCEPTED" &&
          driverDetails["insuranceImage"].isVerified == 1 &&
          driverDetails["panImage"].isVerified == 1 &&
          driverDetails["pucImage"].isVerified == 1 &&
          driverDetails["chequeorpbImage"].isVerified == 1
        ) {
          driverDetails.vehicleDocumentStatus = "ACCEPTED";
          driverDetails.notes = "";
        }
        if (
          driverDetails.driverDocumentStatus == "ACCEPTED" &&
          driverDetails.vehicleDocumentStatus == "ACCEPTED"
        ) {
          driverDetails.accountStatus = "ACTIVE";
          if (driverDetails.deviceToken) {
            messaging().send({
              token: driverDetails.deviceToken,
              notification: {
                title: "DOCUMENTS VERIFIED",
                body: `Your Documents are verified by Admin`,
              },
              android: {
                priority: "high",
                notification: {
                  title: "DOCUMENTS VERIFIED",
                  body: `Your Documents are verified by Admin`,
                  sound: "default",
                },
              },
            });
          }
        }
        driverDetails.updatedAtByAdmin = currentDate();
        let response = await driverModel.findOneAndUpdate(
          { _id: driverDetails._id },
          { $set: driverDetails },
          { new: true }
        );
        return { data: response };
      }
    } else {
      return { error: "Driver Not Found" };
    }
  } catch (error) {
    console.log(error)
    return { error: error };
  }
};
const updateAdminDeviceToken = async (adminData, deviceToken) => {
  try {
    let updatedAdminDetails = await adminModel.findOneAndUpdate(
      { _id: adminData._id },
      { $set: { deviceToken } },
      { new: true }
    );
    return { data: updatedAdminDetails };
  } catch (error) {
    return { error: error };
  }
};
const verifyDriverBankDetails = async (body) => {
  try {
    let driverName=await driverModel.findOne({_id:body._id});
    const data = await createContact(
      {
        driverName: driverName.driverName,
        phoneNumber: body.phoneNumber,
      },
      {
        name: body.bankName,
        ifsc: body.ifsc,
        account_number: body.account_number,
      }
    );
    if (data.error) {
      console.log("Error",data.error.response.data)
      return { error: data.error };
    }
    let updatedDriverDetails = await driverModel.findOneAndUpdate(
      { _id: body._id },
      {
        $set: { contactId: data.contactId, fundAccountId: data.fundAccountId },
      },
      { new: true }
    );
    return { data: updatedDriverDetails };
  } catch (error) {
    console.log("CATCH",error.response.data)
    return { error: error };
  }
};
module.exports = {
  addAdmin,
  loginAdmin,
  changePassword,
  approveDriverDetails,
  updateAdminDeviceToken,
  verifyDriverBankDetails,
};
