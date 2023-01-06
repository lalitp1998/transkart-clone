const { sub } = require("./redis");
const {
  getAllDrivers,
  getCurrentDriver,
  driverJoin,
  driverLeave,
  updateDriver,
  getRoomUsers,
} = require("./utils/common");
const socketConnection = (io) => {
  // console.log(io)
  io.on("connection", (socket) => {
    console.log(
      "\nSocket Id : " +
        socket.id +
        " & Client " +
        io.engine.clientsCount +
        " connected"
    );
    socket.on("joinRoom", ({ id, vehicleId, location }) => {
      let driver;
      if (getCurrentDriver(id)) {
        driver = updateDriver(id, vehicleId, location);
        socket.join(driver.vehicleId);
        socket.emit("driver", driver);
      } else {
        driver = driverJoin(id, vehicleId, location);
        socket.join(driver.vehicleId);
        socket.emit("driver", driver);
      }
    });
    socket.on("driverList", (vehicleId) => {
      const drivers = getRoomUsers(vehicleId);
      socket.emit("driversList", drivers);
    });
    socket.on("allDriverList", () => {
      const drivers = getAllDrivers();
      socket.emit("driversList", drivers);
    });
    socket.on("getDriver", (id) => {
      const driver = getCurrentDriver(id);
      console.log("driver", driver);
      socket.emit("getDriverData", driver);
    });
    socket.on("leaveDriver", (id) => {
      let driver = driverLeave(id);
      if (driver && driver.vehicleId) {
        socket.leave(driver.vehicleId);
      }
    });
    socket.on("subscribe", (channel) => {
      if (channel === "driverDataUpdate") {
        console.log(`Subscribed to ${channel}`);
        sub.subscribe(channel, (data) => {
          socket.emit(channel, data);
        });
      }
    });
    socket.on("error", (err) => {
      console.log("error", err);
    });
    socket.on("disconnect", (err) => {
      console.log("error", err);
    });
  });
};
module.exports = { socketConnection };
