const walletService = require("../services/wallet");

exports.addWallet = async (req, res) => {
  try {
    const type = req.params.type;
    const userDetails = type == "user" ? req.user : req.driver;
    const { data: walletDetails, error: walletError } =
      await walletService.addWallet({
        userId: userDetails._id,
        type,
        balance: 0,
        minBalance: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    if (walletError) {
      return res.status(400).send({ error: walletError });
    }
    return res.status(200).json({ data: walletDetails });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
};

exports.getWalletByUserId = async (req, res) => {
  const userDetails = req.params.type == "user" ? req.user : req.driver;
  try {
    const { data, error } = await walletService.findWalletByUserId(
      userDetails._id,req.params.type
    );
    if (error) {
      return res.status(400).send({ error });
    }
    return res.status(200).send({ data });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
};
