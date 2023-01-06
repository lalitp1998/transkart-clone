const adminService = require("../services/admin");
const jwt = require("jsonwebtoken");

exports.addAdmin = async (req, res) => {
  try {
    if (!req.body.username || !req.body.name) {
      return res.status(400).send({ error: "Please Pass Proper Details" });
    }
    let response = await adminService.addAdmin(req.body);
    if (response.error) {
      res.status(400).send({ error: response.error });
    } else {
      res.status(200).send({ data: response.data });
    }
  } catch (error) {
    res.status(400).send({ error: error });
  }
};
exports.loginAdmin = async (req, res) => {
  try {
    if (!req.body.username || !req.body.password) {
      return res.status(400).send({ error: "Please Pass Proper Details" });
    }
    let response = await adminService.loginAdmin(req.body);
    if (response.error) {
      res.status(400).send({ error: response.error });
    } else {
      let payload = { username: req.body.username };
      let token = jwt.sign(payload, process.env.SECRET, { expiresIn: "30d" });
      res
        .status(200)
        .json({ message: "ok", token: token, Admin: response.data });
    }
  } catch (error) {
    res.status(400).send({ error: error });
  }
};
exports.changePassword = async (req, res) => {
  try {
    if (!req.body.oldPassword) {
      return res.status(400).send({ error: "Please Pass Old Password" });
    }
    if (!req.body.newPassword) {
      return res.status(400).send({ error: "Please Pass New Password" });
    }
    let adminDetails = req.admin;
    let response = await adminService.changePassword(
      adminDetails.username,
      req.body
    );
    if (response.error) {
      res.status(400).send({ error: response.error });
    } else {
      res.status(200).send({ data: "Password Change SuccessFully" });
    }
  } catch (error) {
    res.status(400).send({ error: error });
  }
};
exports.approveDriver = async (req, res) => {
  try {
    let response = await adminService.approveDriverDetails(req.body);
    if (response.error) {
      res.status(400).send({ error: response.error });
    } else {
      res.status(200).send({ data: response.data });
    }
  } catch (error) {
    res.status(400).send({ error: error });
  }
};
exports.refreshToken = async (req, res) => {
  try {
    let adminDetails = req.admin;
    let payload = { username: adminDetails.username };
    let token = jwt.sign(payload, process.env.SECRET, { expiresIn: "30d" });
    res.status(200).json({ message: "ok", token: token, Admin: adminDetails });
  } catch (error) {
    res.status(400).send({ error: error });
  }
};
exports.verifyAdmin = async (req, res) => {
  try {
    res.status(200).json({ data: req.admin });
  } catch (error) {
    res.status(400).send({ error: error });
  }
};
exports.updateAdminDeviceToken = async (req, res) => {
  try {
    let response = await adminService.updateAdminDeviceToken(
      req.admin,
      req.body.deviceToken
    );
    if (response.error) {
      return res.status(400).send({ error: response.error });
    } else {
      return res.status(200).send({ data: response.data });
    }
  } catch (error) {
    res.status(400).send({ error: error });
  }
};
exports.verifyDriverBankDetails = async (req, res) => {
  try {
    let response = await adminService.verifyDriverBankDetails(req.body);
    if (response.error) {
      return res.status(400).send({ error: response.error });
    } else {
      return res.status(200).send({ data: response.data });
    }
  } catch (error) {
    res.status(400).send({ error: error });
  }
};
