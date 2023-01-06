const { validateDriverAuth } = require("./driverAuth");
const { validateUserAuth } = require("./userAuth");

const validateAuthBasedOnUserType = async (req, res, next) => {
  const { type } = req.params;
  if (type == "driver") {
    await validateDriverAuth(req, res, next);
  } else if (type == "user") {
    await validateUserAuth(req, res, next);
  } else {
    return res.status(401).json({ error: "Invalid Type." });
  }
};

module.exports = { validateAuthBasedOnUserType };
