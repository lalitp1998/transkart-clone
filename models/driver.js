const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const driver = new Schema({
  driverName: { type: String },
  phoneNumber: { type: String, required: true, unique: true },
  city: { type: String },
  vehicleId: { type: String },
  vehicleNumber: { type: String },
  isVehicleOwner: { type: Boolean, default: false },
  willYouDrive: { type: Boolean, default: false },
  profileImage: { type: String },
  aadharImage: { type: Object },
  rcImage: { type: Object },
  dlImage: { type: Object },
  panImage: { type: Object },
  chequeorpbImage: { type: Object },
  pucImage: { type: Object },
  insuranceImage: { type: Object },
  driverDocumentStatus: { type: String, default: "PENDING" },
  vehicleDocumentStatus: { type: String, default: "PENDING" },
  transportAgencyId: { type: String },
  accountStatus: { type: String, default: "PENDING" },
  isTrainingCompleted: { type: Boolean, default: false },
  isRegistrationFeeCompleted: { type: Boolean, default: false },
  registrationTransactionId: { type: String },
  minRegistrationFee: { type: Number, default: 10 },
  availabilityStatus: { type: String, default: "OFFLINE" },
  availabilityStatusNotificationSend: { type: Boolean, default: false },
  lastOnline: { type: String },
  createdAt: { type: String },
  deliveryStatus: { type: String, default: "FREE" },
  notes: { type: String, default: "DOCUMENT_VERIFICATION" },
  updatedAtByDriver: { type: String },
  updatedAtByAdmin: { type: String },
  deviceToken: { type: String, required: false },
  location: {
    type: { type: String },
    coordinates: { type: Array },
  },
  contactId: { type: String },
  fundAccountId: { type: String },
});
driver.index({ location: "2dsphere" });
module.exports = mongoose.model("Driver", driver);
