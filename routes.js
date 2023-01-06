const driverController = require("./controllers/driver");
const adminController = require("./controllers/admin");
const userController = require("./controllers/user");
const transactionController = require("./controllers/transaction");
const walletController = require("./controllers/wallet");
const orderController = require("./controllers/order");
const paymentController = require("./controllers/payment");
const polygonController = require("./controllers/accountSetting");
const priceCalculator = require("./controllers/priceCalculator");
const vehicleController = require("./controllers/vehicle");
const goodController = require("./controllers/good");
const { validateDriverAuth } = require("./auth/driverAuth");
const { validateAdminAuth } = require("./auth/adminAuth");
const { validateUserAuth } = require("./auth/userAuth");
const { validateAuthBasedOnUserType } = require("./auth/validateAuth");
const { validateAdminDriverAuth } = require("./auth/validateAdminDriver");
const { validateAdminUserAuth } = require("./auth/validateAdminUser");
const { upload } = require("./utils/upload");

module.exports = (app) => {
  //Driver Api
  app.post(
    "/driver/updateDriver",
    validateAdminDriverAuth,
    upload.fields([
      { name: "aadharFront", maxCount: 1 },
      { name: "aadharBack", maxCount: 1 },
      { name: "rcFront", maxCount: 1 },
      { name: "rcBack", maxCount: 1 },
      { name: "dlFront", maxCount: 1 },
      { name: "dlBack", maxCount: 1 },
      { name: "panFront", maxCount: 1 },
      { name: "panBack", maxCount: 1 },
      { name: "chequeOrpb", maxCount: 1 },
      { name: "puc", maxCount: 1 },
      { name: "insurance", maxCount: 1 },
      { name: "profile", maxCount: 1 },
    ]),
    driverController.updateDriver
  );
  app.post("/driver/sendOTP", driverController.sendOTP);
  app.post("/driver/verifyOTP", driverController.verifyOTP);
  app.post("/driver/testDriverApi", driverController.testDriver);
  app.post("/driver/findDriverByphone", driverController.findDriverByPhone);
  app.get(
    "/driver/refreshToken",
    validateAdminDriverAuth,
    driverController.refreshToken
  );
  app.get(
    "/driver/verifyDriver",
    validateDriverAuth,
    driverController.verifyDriver
  );
  app.get(
    "/driver/findAllDriver",
    validateAdminAuth,
    driverController.findDriverList
  );
  app.delete(
    "/driver/deleteDriver",
    validateAdminAuth,
    driverController.deleteDriver
  );
  app.post(
    "/driver/updateDriverStatus",
    validateAdminAuth,
    driverController.updateDriverStatus
  );
  app.put(
    "/driver/updateDriverDeviceToken",
    validateDriverAuth,
    driverController.updateDriverDeviceToken
  );
  app.put(
    "/driver/updateDriverLocation",
    validateDriverAuth,
    driverController.updateDriverLocation
  );
  app.post(
    "/driver/getAllDriversWithinOrderRadius",
    validateDriverAuth,
    driverController.getAllDriversWithinOrderRadius
  );
  app.post(
    "/driver/updateDriverAvailabilityStatus",
    validateDriverAuth,
    driverController.updateDriverAvailablityStatus
  );

  //Admin Api
  app.post("/admin/addAdmin", adminController.addAdmin);
  app.post("/admin/loginAdmin", adminController.loginAdmin);
  app.post(
    "/admin/approveDriver",
    validateAdminAuth,
    adminController.approveDriver
  );
  app.post(
    "/admin/changePassword",
    validateAdminAuth,
    adminController.changePassword
  );
  app.get(
    "/admin/refreshToken",
    validateAdminAuth,
    adminController.refreshToken
  );
  app.get("/admin/verifyAdmin", validateAdminAuth, adminController.verifyAdmin);
  app.put(
    "/admin/updateAdminDeviceToken",
    validateAdminAuth,
    adminController.updateAdminDeviceToken
  );
  app.post(
    "/admin/verifyDriverBankDetails",
    validateAdminAuth,
    adminController.verifyDriverBankDetails
  );

  //user Api
  app.post("/user/testUser", userController.testUser);
  app.post(
    "/user/updateUser",
    validateAdminUserAuth,
    userController.updateUser
  );
  app.post("/user/addUser", userController.addUser);
  app.get("/user/findAllUser", validateAdminAuth, userController.findAllUser);
  app.post(
    "/user/updateUserStatus",
    validateAdminAuth,
    userController.updateUserStatus
  );
  app.post("/user/findUserByphone", userController.findUserByPhone);
  app.get("/user/verifyUser", validateUserAuth, userController.verifyUser);
  app.put(
    "/user/updateUserDeviceToken",
    validateUserAuth,
    userController.updateUserDeviceToken
  );
  app.post(
    "/user/checkLocation",
    validateUserAuth,
    userController.checkLocation
  );

  //Transaction Api
  app.post(
    "/transaction/:type/addTransaction",
    validateAuthBasedOnUserType,
    transactionController.addTransaction
  );
  app.get(
    "/transaction/:type/listAllTransactions",
    validateAuthBasedOnUserType,
    transactionController.listAllTransactions
  );
  app.get(
    "/transaction/:type/getTransaction/:transactionId",
    validateAuthBasedOnUserType,
    transactionController.getTransaction
  );
  app.get(
    "/transaction/listAllTransactionsForAdmin",
    validateAdminAuth,
    transactionController.listAllTransactionsForAdmin
  );

  //Wallet Api
  app.post(
    "/wallet/:type/addWallet",
    validateAuthBasedOnUserType,
    walletController.addWallet
  );
  app.get(
    "/wallet/:type/getWalletByUserId",
    validateAuthBasedOnUserType,
    walletController.getWalletByUserId
  );

  //Order Api
  app.post(
    "/order/updateOrder",
    validateAdminUserAuth,
    orderController.updateOrder
  );
  app.get(
    "/order/getDrivrOrders",
    validateAdminDriverAuth,
    orderController.getUserOrders
  );
  app.get(
    "/order/getOrders",
    validateAdminUserAuth,
    orderController.getUserOrders
  );
  app.get(
    "/order/getDriverOrders",
    validateAdminUserAuth,
    orderController.getDriverOrders
  );
  app.get(
    "/order/getAllOrders",
    validateAdminAuth,
    orderController.getAllOrders
  );
  app.post(
    "/order/rejectOrder",
    validateAdminAuth,
    orderController.rejectOrder
  );
  app.post("/order/claimOrder", validateDriverAuth, orderController.claimOrder);
  app.post("/order/cancelOrder", validateUserAuth, orderController.orderCancel);
  app.post(
    "/order/orderDelivered",
    validateDriverAuth,
    orderController.orderDelivered
  );
  app.post(
    "/order/approveRefund",
    validateUserAuth,
    orderController.approveRefund
  );
  app.post(
    "/order/approveRefund",
    validateAdminAuth,
    orderController.approveRefund
  );
  app.put(
    "/order/uploadSignature",
    validateDriverAuth,
    upload.fields([
      { name: "receiverSignature", maxCount: 1 },
      { name: "stop1Signature", maxCount: 1 },
      { name: "stop2Signature", maxCount: 1 },
      { name: "senderSignature", maxCount: 1 },
    ]),
    orderController.uploadSignature
  );
  app.post(
    "/order/checkLocation",
    validateUserAuth,
    orderController.checkLocation
  );
  app.post(
    "/order/checkOrderLocation",
    validateDriverAuth,
    orderController.checkOrderLocation
  );
  app.get(
    "/order/findDistance",
    validateDriverAuth,
    orderController.findDistance
  );
  app.post(
    "/order/getAllDriversWithinRange",
    validateDriverAuth,
    orderController.getAllDriversWithinRange
  );
  app.post(
    "/order/sendInvoiceMail",
    validateDriverAuth,
    orderController.sendInvoiceMail
  );
  app.get("/order/getOrderDetails", orderController.getOrderDetails);
  app.post("/payment/webhook", paymentController.webhook);

  //Account Setting API

  app.put(
    "/accountSetting/updatePolygons",
    validateAdminAuth,
    polygonController.updatePolygons
  );

  app.get(
    "/accountSetting/getPolygons",
    validateAdminAuth,
    polygonController.getPolygons
  );

  app.get(
    "/accountSetting/getAccountSetting",
    validateAdminAuth,
    polygonController.getAccountSetting
  );

  app.put(
    "/accountSetting/updateAccountSettings",
    validateAdminAuth,
    polygonController.updateAccountSettings
  );

  //Price Calculator API

  app.get(
    "/priceCalculator/getPriceList",
    validateAdminAuth,
    priceCalculator.getPriceEntity
  );
  app.post(
    "/priceCalculator/addEntity",
    validateAdminAuth,
    priceCalculator.addPriceEntity
  );

  app.put(
    "/priceCalculator/updateEntity",
    validateAdminAuth,
    priceCalculator.updateEntity
  );

  app.post(
    "/priceCalculator/calculatePrice",
    validateAdminAuth,
    priceCalculator.calculatePrice
  );

  // Vehicle API
  app.get("/vehicle/getVehicleList", vehicleController.getVehicleList);

  app.post(
    "/vehicle/addVehicle",
    validateAdminAuth,
    upload.fields([{ name: "image", maxCount: 1 }]),
    vehicleController.addVehicle
  );
  app.put(
    "/vehicle/updateVehicle",
    validateAdminAuth,
    upload.fields([{ name: "image", maxCount: 1 }]),
    vehicleController.updateVehicle
  );

  // Good API
  app.get("/good/getGoodList", goodController.getGoodList);
  app.post("/good/addGood", validateAdminAuth, goodController.addGood);
  app.put("/good/updateGood", validateAdminAuth, goodController.updateGood);
};
