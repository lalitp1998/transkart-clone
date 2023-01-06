const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const userTransaction = new Schema({
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: "PENDING" },
  createdAt: { type: String, required: true },
  paymentId: { type: String },
  orderId: { type: String },
  transactionType: { type: String },
  type: { type: String },
  updatedAt: { type: String, required: true },
});
module.exports = mongoose.model("userTransaction", userTransaction);
