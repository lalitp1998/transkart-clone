const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const wallet = new Schema({
  userId: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  balance: { type: Number, required: true },
  minBalance: { type: Number, required: true },
  createdAt: { type: String, required: true },
  updatedAt: { type: String, required: true },
});
module.exports = mongoose.model("Wallet", wallet);
