const priceService = require("../services/priceCalculator");

exports.addPriceEntity = async (req, res) => {
  const { vehicleId, vehicleInfo } = req.body;
  try {
    if (!vehicleId || !vehicleInfo) {
      return res.status(400).send({ error: "Please provide required data!" });
    }
    const priceEntity = await priceService.addPriceEntity(req.body);
    if (priceEntity.error) {
      return res.status(400).send({ error: priceEntity.error });
    }
    return res.status(200).send({ data: priceEntity.data });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error });
  }
};

exports.updateEntity = async (req, res) => {
  try {
    const priceEntity = await priceService.updatePriceEntity(req.body);
    if (priceEntity.error) {
      return res.status(400).send({ error: priceEntity.error });
    }
    return res.status(200).send({ data: priceEntity.data });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error });
  }
};

exports.calculatePrice = async (req, res) => {
  try {
    const data = await priceService.calculatePrice(req.body);
    if (data.error) {
      return res.status(400).send({ error: data.error });
    }
    return res.status(200).send({ data: data.data });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error });
  }
};
exports.getPriceEntity = async (req, res) => {
  try {
    const data = await priceService.getPriceEntity();
    if (data.error) {
      return res.status(400).send({ error: data.error });
    }
    return res.status(200).send({ data: data.data });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error });
  }
};
