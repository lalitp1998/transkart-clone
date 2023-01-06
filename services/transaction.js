const transactionModel = require("../models/driverTransaction");
const userTransactionModel = require("../models/userTransaction");
const porterTransactionModel = require("../models/porterTransaction");
const walletModel = require("../models/wallet");
const paymentService = require("./payment");
const moment = require("moment");
const { currentDate } = require("../utils/common");

const addTransaction = async (transactionData, userDetails, userType) => {
  try {
    let walletDetails = await walletModel.findOne({ userId: userDetails._id });
    if (!walletDetails) {
      let date = currentDate();
      walletDetails = await walletModel.create({
        userId: userDetails._id,
        type: userType,
        balance: 0,
        minBalance: 100,
        createdAt: date,
        updatedAt: date,
      });
    }
    if (userType === "user" && transactionData.type === "debit") {
      return { error: "You will not able to withdraw amount." };
    }
    if (transactionData.type == "order" && walletDetails.balance == 0) {
      return { error: "You will not able to withdraw amount." };
    }
    if (
      transactionData.type == "credit" &&
      userType == "driver" &&
      transactionData.amount < userDetails.minRegistrationFee
    ) {
      return {
        error: `please add minimum registeration Fee ${userDetails.minRegistrationFee}`,
      };
    }
    if (
      transactionData.type == "credit" &&
      userType == "user" &&
      transactionData.amount < userDetails.minTransactionValue
    ) {
      return {
        error: `please add minimum transaction value ${userDetails.minTransactionValue}`,
      };
    }
    if (
      transactionData.type == "order" &&
      walletDetails.balance - transactionData.amount < walletDetails.balance
    ) {
      return { error: "you can't" };
    }
    if (
      userType == "driver" &&
      transactionData.type != "order" &&
      walletDetails.balance == 0
    ) {
      transactionData.transactionType = "REGISTERATION_FEE";
    }
    let date = currentDate();
    transactionData.createdAt = date;
    transactionData.updatedAt = date;
    userDetails.userType = userType;
    // let paymentLink = await paymentService.createPaymentLink(
    //   {
    //     totalAmount: transactionData.amount,
    //     transactionType: transactionData.transactionType,
    //     type: transactionData.type,
    //   },
    //   userDetails
    // );
    // console.log(paymentLink.data)
    // if (paymentLink.error) {
    //   return { error: paymentLink.error };
    // } else {
    //   transactionData.paymentId = paymentLink.data.id;

    let transactionDetails;
    if (userType === "driver") {
      transactionData.driverId = userDetails._id;
      transactionDetails = await transactionModel.create(transactionData);
    } else if (userType === "user") {
      transactionData.userId = userDetails._id;
      transactionDetails = await userTransactionModel.create(transactionData);
    } else {
      transactionData.userId = userDetails._id;
      transactionDetails = await porterTransactionModel.create(transactionData);
    }
    if (
      userType == "driver" &&
      transactionData.type == "debit" &&
      transactionData.transactionType == "WITHDRAW"
    ) {
      const fundAccountDetails = await paymentService.getFundAccountDetails(
        userDetails.fundAccountId
      );
      if (fundAccountDetails.error) {
        return { error: fundAccountDetails.error };
      }
      const payoutDetails = await paymentService.createPayout(
        userDetails.fundAccountId,
        "2323230075107775",
        transactionData.amount*100,
        transactionDetails._id
      );
      if (payoutDetails?.error) {
        return { error: payoutDetails.error };
      }
    }
    return { data: transactionDetails };
    // }
  } catch (error) {
    console.log(error);
    return { error };
  }
};

const listTransactions = async (userId) => {
  try {
    const transactionDetails = await transactionModel.find({ userId });
    return { data: transactionDetails };
  } catch (error) {
    console.log(error);
    return { error };
  }
};

const listAllTransactionsForAdmin = async () => {
  try {
    const driverTransactionDetails = await transactionModel.find({});
    const userTransactionDetails = await userTransactionModel.find({});
    return {
      data: { user: userTransactionDetails, driver: driverTransactionDetails },
    };
  } catch (error) {
    console.log(error);
    return { error };
  }
};

const getTransaction = async (transactionId) => {
  try {
    const transactionDetails = await transactionModel.findById(transactionId);
    if (!transactionDetails) {
      return { error: "Transaction not found!" };
    }
    return { data: transactionDetails };
  } catch (error) {
    console.log(error);
    return { error };
  }
};

module.exports = {
  addTransaction,
  listTransactions,
  getTransaction,
  listAllTransactionsForAdmin,
};
