const walletModel = require("../models/wallet");
const driverTransactionModel = require("../models/driverTransaction");
const userTransactionModel = require("../models/userTransaction");

const addWallet = async (walletData) => {
  try {
    const walletDetails = await walletModel.create(walletData);
    return { data: walletDetails };
  } catch (error) {
    console.log(error);
    return { error };
  }
};

const findWalletByUserId = async (userId,userType) => {
  try {
    const walletDetails = await walletModel.findOne({ userId });
    if (!walletDetails) {
      return { error: "Wallet not found!" };
    }
    let transactionDetails;
    if(userType=="user"){
      transactionDetails = await userTransactionModel.find({userId:userId});
    }
    if(userType=="driver"){
      transactionDetails = await driverTransactionModel.find({driverId:userId});
    }
    return { data: {walletDetails,transactionDetails} };
  } catch (error) {
    console.log(error);
    return { error };
  }
};

const updateWallet = async (id, walletData) => {
  try {
    const walletDetails = await walletModel.findByIdAndUpdate(id, walletData);
    return { data: walletDetails };
  } catch (error) {
    console.log(error);
    return { error };
  }
};

module.exports = {
  addWallet,
  findWalletByUserId,
  updateWallet,
};
