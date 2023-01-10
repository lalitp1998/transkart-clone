const accountSettingService = require("../services/accountSetting");

exports.updatePolygons = async (req, res) => {
  try {
    if (!req.body.polygons) {
      return res.status(400).send({ error: "Please Pass Proper body" });
    }
    let response = await accountSettingService.updatePolygons(req.body);
    if (response.error) {
      return res.status(400).send({ error: response.error });
    } else {
      return res.status(200).send({ data: response.data });
    }
  } catch (error) {
    res.status(400).send({ error: error });
  }
};

exports.getPolygons = async (req, res) => {
  try {
    let response = await accountSettingService.getPolygons();
    if (response.error) {
      return res.status(400).send({ error: response.error });
    } else {
      return res.status(200).send({ data: response.data });
    }
  } catch (error) {
    res.status(400).send({ error: error });
  }
};

exports.getAccountSetting = async (req, res) => {
  try {
    // const { id } = req.params;
    // if (!id) {
    //   return res.status(400).send({ error: "Please pass proper params" });
    // }
    let response = await accountSettingService.getAccountSetting();
    if (response.error) {
      return res.status(400).send({ error: response.error });
    } else {
      return res.status(200).send({ data: response.data });
    }
  } catch (error) {
    res.status(400).send({ error: error });
  }
};

exports.updateAccountSettings = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).send({ error: "Please pass proper body" });
    }
    let response = await accountSettingService.updateAccountSettings(req.body);
    if (response.error) {
      return res.status(400).send({ error: response.error });
    } else {
      return res.status(200).send({ data: response.data });
    }
  } catch (error) {
    res.status(400).send({ error: error });
  }
};
