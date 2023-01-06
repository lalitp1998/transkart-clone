const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const cron = require("node-cron");
const { redisClient, pub, sub } = require("./redis");
const { socketConnection } = require("./socket");
const driverModel = require("./models/driver");
require("dotenv").config();
const { messaging } = require("./firebase-config");
const {generateSuccesInvoice}=require("./services/order")

const port = process.env.PORT || "5000";
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);
redisClient.connect();
pub.connect();
sub.connect();
socketConnection(io);
require("./routes.js")(app);
mongoose
  .connect(process.env.MONGO_DB_URL, {
    useNewUrlParser: true,
  })
  .then(() => {
    server.listen(port, () => {
      console.log(`Listening to requests on http://localhost:${port}`);

      // cron job every 30 minute
      const task = cron.schedule("*/30 * * * *", async () => {
        try {
          const drivers = await driverModel.find({
            availabilityStatus: "OFFLINE",
          });
          const threeDays = 3 * 24 * 60 * 60 * 1000;
          for (let i = 0; i < drivers.length; i++) {
            const driver = drivers[i];
            if (
              !driver.availabilityStatusNotificationSend &&
              new Date(driver.lastOnline).getTime() > threeDays &&
              driver.deviceToken
            ) {
              // send notification to driver
              messaging().send({
                token: driver.deviceToken,
                notification: {
                  title: "AVAILABILITY REMINDER",
                  body: `You are offline for more then 3 days`,
                },
                data: {},
                android: {
                  priority: "high",
                  notification: {
                    title: "AVAILABILITY REMINDER",
                    body: `You are offline for more then 3 days`,
                    sound: "default",
                  },
                },
              });
              await driverModel.findByIdAndUpdate(driver._id, {
                $set: { availabilityStatusNotificationSend: true },
              });
            }
          }
        } catch (error) {
          console.log(error);
        }
      });

      task.start();
    });
  });
mongoose.connection.on("open", () => {
  console.log("<<<Database connected>>>");
});
mongoose.connection.on(
  "error",
  console.error.bind(console, "connection error:")
);
app.get("/", (req, res) => {
  res.status(200).send("Hello World !");
});
