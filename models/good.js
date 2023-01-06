const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const good = new Schema({
  name: { type: String, required: true, unique: true },
});
module.exports = mongoose.model("Good", good);
