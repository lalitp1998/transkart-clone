const userService = require("../services/user");
const jwt = require("jsonwebtoken");
exports.findUserByPhone = async (req, res) => {
  try {
    if (!req.body.phoneNumber) {
      return res.status(400).send({ error: "Please Pass Credentials" });
    }
    let response = await userService.findUserByPhoneNumber(
      req.body.phoneNumber
    );
    if (response.error) {
      res.status(400).send({ error: response.error });
    } else {
      res.status(200).send({ data: response.data });
    }
  } catch (error) {
    res.status(400).send({ error: error });
  }
};
exports.testUser = async (req, res) => {
  try {
    if (!req.body.phoneNumber || !req.body.otp) {
      return res.status(400).send({ error: "Please Pass Credentials" });
    }
    let response = await userService.testUser(req.body);
    if (response.error) {
      res.status(400).send({ error: response.error });
    } else {
      let payload = { phoneNumber: req.body.phoneNumber };
      let token = jwt.sign(payload, process.env.SECRET, { expiresIn: "30d" });
      res
        .status(200)
        .json({ message: "ok", token: token, driver: response.data });
    }
  } catch (error) {
    res.status(400).send({ error: error });
  }
};
exports.updateUser = async (req, res) => {
  try {
    let response = await userService.updateUser(req.body);
    if (response.error) {
      return res.status(400).send({ error: response.error });
    } else {
      return res.status(200).send({ data: response.data });
    }
  } catch (error) {
    res.status(400).send({ error: error });
  }
};
exports.addUser = async (req, res) => {
  try {
    let response = await userService.addUser(req.body);
    if (response.error) {
      return res.status(400).send({ error: response.error });
    } else {
      return res.status(200).send({ data: response.data });
    }
  } catch (error) {
    res.status(400).send({ error: error });
  }
};
exports.findAllUser = async (req, res) => {
  try {
    let response = await userService.findAllUsers();
    if (response.error) {
      return res.status(400).send({ error: response.error });
    } else {
      return res.status(200).send({ data: response.data });
    }
  } catch (error) {
    res.status(400).send({ error: error });
  }
};
exports.updateUserStatus = async (req, res) => {
  try {
    if (!req.body._id) {
      return res.status(400).send({ error: "Please Pass Proper body" });
    }
    let response = await userService.updateUserStatus(req.body);
    if (response.error) {
      return res.status(400).send({ error: response.error });
    } else {
      return res.status(200).send({ data: response.data });
    }
  } catch (error) {
    res.status(400).send({ error: error });
  }
};
exports.verifyUser = async (req, res) => {
  try {
    res.status(200).json({ data: req.user });
  } catch (error) {
    res.status(400).send({ error: error });
  }
};
exports.updateUserDeviceToken = async (req, res) => {
  try {
    let response = await userService.updateUserDeviceToken(
      req.user,
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
exports.checkLocation = async (req, res) => {
  try {
    let response = await userService.checkLocation(req.body);
    if (response.error) {
      return res.status(400).send({ error: response.error });
    } else {
      return res.status(200).send({ data: response.data });
    }
  } catch (error) {
    res.status(400).send({ error: error });
  }
};
