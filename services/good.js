const goodModel = require("../models/good");

const addGood = async (goodData) => {
  try {
    const goodDetails = await goodModel.create({
      name: goodData.name,
    });
    return { data: goodDetails };
  } catch (error) {
    console.log(error);
    return { error };
  }
};

const getGoodList = async () => {
  try {
    const goodList = await goodModel.find({});
    return { data: goodList };
  } catch (error) {
    console.log(error);
    return { error };
  }
};

const updateGood = async (goodData) => {
  try {
    const data = await goodModel.findByIdAndUpdate(
      goodData._id,
      { $set: goodData },
      { new: true }
    );
    return { data: data };
  } catch (error) {
    console.log(error);
    return { error };
  }
};

const getGoodName = async (goodId) => {
  try {
    let goodName = "";
    const good = await goodModel.findById(goodId);
    goodName = good?.name || "";
    return goodName;
  } catch (error) {
    console.log(error);
    return goodName;
  }
};

module.exports = {
  addGood,
  getGoodList,
  updateGood,
  getGoodName,
};
