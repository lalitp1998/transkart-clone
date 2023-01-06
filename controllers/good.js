const goodService = require("../services/good");

exports.addGood = async (req, res) => {
  try {
    if (!req.body.name) {
      return res.status(400).send({ error: "Please provide required data!" });
    }
    const goodDetails = await goodService.addGood(req.body);
    if (goodDetails.error) {
      return res.status(400).send({ error: goodDetails.error });
    }
    return res.status(200).send({ data: goodDetails.data });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error });
  }
};

exports.getGoodList = async (req, res) => {
  try {
    const goodList = await goodService.getGoodList();
    if (goodList.error) {
      return res.status(400).send({ error: goodList.error });
    }
    return res.status(200).send({ data: goodList.data });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error });
  }
};

exports.updateGood = async (req, res) => {
  try {
    const data = await goodService.updateGood(req.body);
    if (data.error) {
      return res.status(400).send({ error: data.error });
    }
    return res.status(200).send({ data: data.data });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error });
  }
};
