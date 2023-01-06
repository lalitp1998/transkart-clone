const Razorpay = require("razorpay");
const axios = require("axios");

let instance = new Razorpay({
  key_id: "rzp_test_1rM79Xv7xGgTGB", // your `KEY_ID`
  key_secret: "5s0SY1cfjWcCNLoCCjWpL0SH", // your `KEY_SECRET`
});
const createPaymentLink = async (orderData, userData) => {
  try {
    let bodyObject = {
      amount: orderData.totalAmount * 100,
      description: "Payment for policy no #23456",
      customer: {
        name: userData.firstName + " " + userData.lastName,
        contact: "+91" + userData.phoneNumber,
        email: userData.email,
      },
      notes: {
        usertype: userData?.userType,
        transactionType: orderData.transactionType,
        type: orderData.type,
      },
      // callback_url: "https://porter-app-backend.herokuapp.com/",
      // callback_method: "get"
    };
    let paymentLink = await instance.paymentLink.create(bodyObject);
    return { data: paymentLink };
  } catch (error) {
    console.log(error);
    return { error: error };
  }
};

const createContact = async (driverData, bankDetails) => {
  try {
    let contact = await axios({
      method: "post",
      url: "https://api.razorpay.com/v1/contacts",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic cnpwX3Rlc3RfMXJNNzlYdjd4R2dUR0I6NXMwU1kxY2ZqV2NDTkxvQ0NqV3BMMFNI",
      },
      data: {
        name: driverData.driverName,
        contact: driverData.contact,
        type: "Driver",
      },
    });
    let fundAccount = await instance.fundAccount.create({
      contact_id: contact.data.id,
      account_type: "bank_account",
      bank_account: {
        name: driverData.driverName,
        ifsc: bankDetails.ifsc,
        account_number: bankDetails.account_number,
      },
    });
    return { fundAccountId: fundAccount.id, contactId: fundAccount.contact_id };
  } catch (error) {
    console.log("ERERE",error.response.data.error);
    return { error };
  }
};
const createPayout = async (
  fund_account_id,
  account_number,
  amount,
  transactionId
) => {
  try {
    await axios({
      method: "post",
      url: "https://api.razorpay.com/v1/payouts",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic cnpwX3Rlc3RfMXJNNzlYdjd4R2dUR0I6NXMwU1kxY2ZqV2NDTkxvQ0NqV3BMMFNI",
      },
      data: {
        account_number,
        fund_account_id,
        amount,
        currency: "INR",
        mode: "IMPS",
        purpose: "payout",
        notes: {
          transactionId,
        },
      },
    });
  } catch (error) {
    return { error: error?.response?.data };
  }
};

const getFundAccountDetails = async (id) => {
  try {
    const data = await axios({
      url: `https://api.razorpay.com/v1/fund_accounts/${id}`,
      headers: {
        Authorization:
          "Basic cnpwX3Rlc3RfMXJNNzlYdjd4R2dUR0I6NXMwU1kxY2ZqV2NDTkxvQ0NqV3BMMFNI",
      },
    });
    return data.data;
  } catch (error) {
    return { error };
  }
};
module.exports = {
  createPaymentLink,
  createContact,
  createPayout,
  getFundAccountDetails,
};
