const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const priceCalculator = new Schema({
  vehicleId: { type: String, required: true,unique:true },
  vehicleInfo: [
    {
      startRange: Number,
      endRange: Number,
      minPrice: Number,
      pricePerKm: Number,
    },
  ],
});
module.exports = mongoose.model("PriceCalculator", priceCalculator);
