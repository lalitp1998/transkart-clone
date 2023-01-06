const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const admin = new Schema({
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  salt: { type: String, required: true },
  deviceToken: { type: String, required: false },
});
module.exports = mongoose.model("Admin", admin);
