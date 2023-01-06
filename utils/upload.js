const multer = require("multer");
const aws = require("aws-sdk");
require("dotenv").config();
let s3 = new aws.S3({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.region,
});
const storage = multer.memoryStorage({
  destination: function (req, file, cb) {
    cb(null, "");
  },
});
const filefilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({ storage: storage, fileFilter: filefilter });
const uploadS3 = async (key, body) => {
  return (
    await s3
      .upload({ Bucket: process.env.bucket, Key: key, Body: body })
      .promise()
  ).Location;
};
const getObject = async (key) => {
  return (
    await s3.getObject({ Bucket: process.env.bucket, Key: key }).promise()
  ).Body;
};
module.exports = { upload, uploadS3, getObject };
