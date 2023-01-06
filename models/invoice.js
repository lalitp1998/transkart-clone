const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const invoice = new Schema({
  invoice: { type: String, required: true},
  invoiceNumber:{
    type:String,
    required:true,
  }
});
module.exports = mongoose.model("Invoice", invoice);    
