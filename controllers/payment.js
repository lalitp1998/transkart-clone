const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");
const driverTransactionModel = require("../models/driverTransaction");
const userTransactionModel = require("../models/userTransaction");
const driverModel = require("../models/driver");
const walletModel = require("../models/wallet");
const { currentDate } = require("../utils/common");
exports.webhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    console.log("SIG", signature);
    var expectedSignature = validateWebhookSignature(
      JSON.stringify(req.body),
      signature,
      "Lalitp@123"
    );
    console.log(req.body.event, req.body.payload);

    if (expectedSignature) {
      // console.log(req.body.event)
      switch (req.body.event) {
        case "order.paid":
          console.log("Order Paid");
          break;
        case "payment.authorized":
          let data = req.body.payload.payment.entity;
          console.log(data.notes);
          let transactionData = await driverTransactionModel.findOne({
            _id: data.notes.transactionId,
          });
          if (transactionData) {
            if (
              transactionData.status == "PENDING" &&
              (transactionData.transactionType == "REGISTERATION_FEE" ||
                transactionData.transactionType == "RECHARGE" ||
                transactionData.transactionType == "WITHDRAW")
            ) {
              let walletData = await walletModel.findOne({
                userId: transactionData.driverId,
              });
              if (transactionData.type == "credit") {
                walletData.balance += data.amount / 100;
              } else {
                walletData.balance -= data.amount / 100;
              }
              walletData.updatedAt = currentDate();
              await walletModel.findOneAndUpdate(
                { _id: walletData._id },
                { $set: walletData },
                { new: true }
              );
              await driverTransactionModel.findOneAndUpdate(
                { _id: transactionData._id },
                { $set: { status: "SUCCESS", updatedAt: currentDate() } },
                { new: true }
              );
              if (transactionData.transactionType == "REGISTERATION_FEE") {
                await driverModel.findOneAndUpdate(
                  { _id: transactionData.driverId },
                  {
                    $set: {
                      isRegistrationFeeCompleted: true,
                      registrationTransactionId: transactionData._id,
                      accountStatus:"ACTIVE"
                    },
                  },
                  { new: true }
                );
              }
            }
          } else {
            transactionData = await userTransactionModel.findOne({
              _id: data.notes.transactionId,
            });
            if (
              transactionData &&
              transactionData.status == "PENDING" &&
              (transactionData.transactionType == "RECHARGE" ||
                transactionData.transactionType == "WITHDRAW")
            ) {
              let walletData = await walletModel.findOne({
                userId: transactionData.userId,
              });
              if (transactionData.type == "credit") {
                walletData.balance += data.amount / 100;
              } else {
                walletData.balance -= data.amount / 100;
              }
              walletData.updatedAt = currentDate();
              await walletModel.findOneAndUpdate(
                { _id: walletData._id },
                { $set: walletData },
                { new: true }
              );
              await userTransactionModel.findOneAndUpdate(
                { _id: transactionData._id },
                { $set: { status: "SUCCESS", updatedAt: currentDate() } },
                { new: true }
              );
            }
          }
          console.log("ACD payment.authorized");
          break;
        case "payment.captured":
          console.log("payment Captured");
          break;
        case "payment.failed":
          let transactionBody = req.body.payload.payment.entity;
          let transactionDetails = await driverTransactionModel.findOne({
            _id: transactionBody.notes.transactionId,
          });
          if (transactionDetails && transactionDetails.status == "PENDING") {
            await driverTransactionModel.findOneAndUpdate(
              {
                _id: transactionDetails._id,
              },
              { $set: { status: "FAILED" } }
            );
          } else {
            transactionData = await userTransactionModel.findOne({
              _id: transactionBody.notes.transactionId,
            });
            if (transactionDetails && transactionDetails.status == "PENDING") {
              await userTransactionModel.findOneAndUpdate(
                {
                  _id: transactionDetails._id,
                },
                { $set: { status: "FAILED" } }
              );
            }
          }
          // if (data.notes.usertype == "user") {
          //   await userTransactionModel.findOneAndUpdate(
          //     {
          //       paymentId: data.id,
          //     },
          //     { $set: { status: "FAILED" } }
          //   );
          // }
          // if (data.notes.usertype == "driver") {
          //   await driverTransactionModel.findOneAndUpdate(
          //     {
          //       paymentId: data.id,
          //     },
          //     { $set: { status: "FAILED" } }
          //   );
          // }
          break;
        case "payment_link.paid":
          // let data = req.body.payload.payment_link.entity;
          // if (
          //   data.notes.transactionType == "REGISTERATION_FEE" ||
          //   data.notes.transactionType == "RECHARGE" ||
          //   data.notes.transactionType == "WITHDRAW"
          // ) {
          //   if (data.notes.usertype == "user") {
          //     let response = await userTransactionModel.findOne({
          //       paymentId: data.id,
          //     });
          //     if (response && response.status == "PENDING") {
          //       let walletData = await walletModel.findOne({
          //         userId: response.userId,
          //       });
          //       if (data.notes.type == "credit") {
          //         walletData.balance +=
          //           req.body.payload.payment_link.entity.amount / 100;
          //       } else {
          //         walletData.balance -=
          //           req.body.payload.payment_link.entity.amount / 100;
          //       }
          //       walletData.updatedAt = currentDate();
          //       await walletModel.findOneAndUpdate(
          //         { _id: walletData._id },
          //         { $set: walletData },
          //         { new: true }
          //       );
          //       await driverTransactionModel.findOneAndUpdate(
          //         { _id: response._id },
          //         { $set: { status: "SUCCESS", updatedAt: currentDate() } },
          //         { new: true }
          //       );
          //     }
          //   }
          //   if (data.notes.usertype == "driver") {
          //     let response = await driverTransactionModel.findOne({
          //       paymentId: data.id,
          //     });
          //     if (response && response.status == "PENDING") {
          //       let walletData = await walletModel.findOne({
          //         userId: response.driverId,
          //       });
          //       if (data.notes.type == "credit") {
          //         walletData.balance +=
          //           req.body.payload.payment_link.entity.amount / 100;
          //       } else {
          //         walletData.balance -=
          //           req.body.payload.payment_link.entity.amount / 100;
          //       }
          //       walletData.updatedAt = currentDate();
          //       await walletModel.findOneAndUpdate(
          //         { _id: walletData._id },
          //         { $set: walletData },
          //         { new: true }
          //       );
          //       await driverTransactionModel.findOneAndUpdate(
          //         { _id: response._id },
          //         { $set: { status: "SUCCESS", updatedAt: currentDate() } },
          //         { new: true }
          //       );
          //       walletData.updatedAt = currentDate();
          //       await walletModel.findOneAndUpdate(
          //         { _id: walletData._id },
          //         { $set: walletData },
          //         { new: true }
          //       );
          //       await driverTransactionModel.findOneAndUpdate(
          //         { _id: response._id },
          //         {
          //           $set: {
          //             status: "SUCCESS",
          //             updatedAt: currentDate(),
          //           },
          //         },
          //         { new: true }
          //       );
          //     }
          //   }
          // }
          // if (data.notes.usertype == "driver") {
          //   let response = await driverTransactionModel.findOne({
          //     paymentId: data.id,
          //   });
          //   if (response && response.status == "PENDING") {
          //     let walletData = await walletModel.findOne({
          //       userId: response.driverId,
          //     });
          //     if (data.notes.type == "credit") {
          //       walletData.balance +=
          //         req.body.payload.payment_link.entity.amount / 100;
          //     } else {
          //       walletData.balance -=
          //         req.body.payload.payment_link.entity.amount / 100;
          //     }
          //     walletData.updatedAt = currentDate();
          //     await walletModel.findOneAndUpdate(
          //       { _id: walletData._id },
          //       { $set: walletData },
          //       { new: true }
          //     );
          //     await driverTransactionModel.findOneAndUpdate(
          //       { _id: response._id },
          //       {
          //         $set: {
          //           status: "SUCCESS",
          //           updatedAt: currentDate(),
          //         },
          //       },
          //       { new: true }
          //     );
          //   }
          // }

          break;
        case "payout.initiated":
          console.log("Payout Initiated");
          let payoutTransactionData = await driverTransactionModel.findOne({
            _id: req.body.payload.payout.entity.notes.transactionId,
          });
          console.log(payoutTransactionData.status)
          if(payoutTransactionData.status=="PENDING"){
            const transaction = await driverTransactionModel.findByIdAndUpdate(
              req.body.payload.payout.entity.notes.transactionId,
              { $set: { status: "SUCCESS" } },
              { new: true }
            );
            await walletModel.findOneAndUpdate(
              {
                userId: transaction.driverId,
              },
              { $inc: { balance: -((req.body.payload.payout.entity.amount)/100) } }
            );
          }
          break;
        case "payout.processed":
          console.log("Payout Processed");
          break;
        case "payout.failed":
          console.log("Payout Failed");
          break;
        default:
          console.log("event", req.body.event);
          break;
      }
    }
  } catch (error) {
    throw error;
  }
};
