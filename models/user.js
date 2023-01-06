const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const user = new Schema({
  phoneNumber: { type: String, required: true, unique: true },
  firstName: { type: String, required: false },
  lastName: { type: String, required: false },
  address1: { type: String, required: false },
  address2: { type: String, required: false },
  email: { type: String, required: false },
  usedFor: { type: String, required: false },
  accountStatus: { type: Boolean, default: true },
  deActivatedReason: { type: String, required: false },
  minTransactionValue: { type: Number, default: 500 },
  gstNumber : {type: String,required :false},
  gstAddress : {type: String,required :false},
  deviceToken: { type: String, required: false },
});
module.exports = mongoose.model("User", user);
