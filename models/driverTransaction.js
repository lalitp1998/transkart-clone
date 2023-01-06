const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const driverTransaction = new Schema({
  driverId: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: "PENDING" },
  createdAt: { type: String },
  paymentId: { type: String },
  orderId: { type: String },
  transactionType: { type: String },
  type: { type: String },
  updatedAt: { type: String },
});
module.exports = mongoose.model("driverTransaction", driverTransaction);
