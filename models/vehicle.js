const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const vehicle = new Schema({
  name: { type: String, required: true, unique: true },
  image: { type: String },
  status: { type: String, required: true },
  commission: { type: Number, required: true },
});
module.exports = mongoose.model("Vehicle", vehicle);
