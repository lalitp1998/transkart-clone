const { createClient } = require("redis");
require("dotenv").config();
let redisClient = createClient({
  url: process.env.REDISTOGO_URL,
});
let sub = redisClient.duplicate();
let pub = redisClient.duplicate();
redisClient.on("connect", function () {
  console.log("redis client connected");
});
redisClient.on("error", (error) => {
  console.log("Redis not connected", error);
});
sub.on("connect", function () {
  console.log("sub connected");
});
sub.on("error", (error) => {
  console.log("sub connected", error);
});
pub.on("connect", function () {
  console.log("pub connected");
});
pub.on("error", (error) => {
  console.log("pub connected", error);
});
module.exports = {
  redisClient,
  sub,
  pub,
};
