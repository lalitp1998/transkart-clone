const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const accountSetting = new Schema({
  polygons: {
    type: { type: String, require: true },
    coordinates: { type: Array },
  },
  phone: { type: String, unique: true },
  email: { type: String, unique: true },
  orderRange: { type: Number },
});
module.exports = mongoose.model("AccountSetting", accountSetting);
