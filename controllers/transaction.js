const walletService = require("../services/wallet");
const transactionService = require("../services/transaction");

exports.addTransaction = async (req, res) => {
  try {
    const userDetails = req.params.type === "user" ? req.user : req.driver;
    let transactionDetails = await transactionService.addTransaction(
      req.body,
      userDetails,
      req.params.type
    );
    if(transactionDetails.error){
      return res.status(400).json({ error: transactionDetails.error });
    }
    else{
      return res.status(200).json({ data: transactionDetails.data });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error });
  }
};

exports.listAllTransactions = async (req, res) => {
  try {
    const userDetails = req.params.type === "user" ? req.user : req.driver;
    const transactions = await transactionService.listTransactions(
      userDetails._id
    );
    if (transactions.error) {
      return res.status(400).send({ error: transactions.error });
    }
    return res.status(200).send({ data: transactions.data });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error });
  }
};

exports.listAllTransactionsForAdmin = async (req, res) => {
  try {
    const transactions = await transactionService.listAllTransactionsForAdmin();
    if (transactions.error) {
      return res.status(400).send({ error: transactions.error });
    }
    return res.status(200).send({ data: transactions.data });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error });
  }
};

exports.getTransaction = async (req, res) => {
  const { transactionId } = req.params;
  try {
    if (!transactionId) {
      return res.status(400).send({ error: "Please provide required data!" });
    }
    const transaction = await transactionService.getTransaction(transactionId);
    if (transaction.error) {
      return res.status(400).send({ error: transaction.error });
    }
    return res.status(200).send({ data: transaction.data });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error });
  }
};
