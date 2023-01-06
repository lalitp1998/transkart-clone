const accountSettingModel = require("../models/accountSetting");

const updatePolygons = async (_polygon) => {
  try {
    const polygons = {
      type: "Polygon",
      coordinates: [
        _polygon.polygons.map((polygon) => [polygon.lat, polygon.lng]),
      ],
    };
    let updatedPolygonDetails = await accountSettingModel.findByIdAndUpdate(
      _polygon._id,
      { $set: { polygons } },
      { new: true }
    );
    const newPolygonDetails = {
      ...updatedPolygonDetails._doc,
      polygons: polygons.coordinates[0].map((polygon) => ({
        lat: polygon[0],
        lng: polygon[1],
      })),
    };
    return { data: newPolygonDetails };
  } catch (error) {
    console.log(error);
    return { error: error };
  }
};

const getPolygons = async () => {
  try {
    const { polygons, _id } = await accountSettingModel.findOne({});
    const polygonsDetails = polygons.coordinates[0].map((polygon) => ({
      lat: polygon[0],
      lng: polygon[1],
    }));
    return { data: { _id, polygonsDetails } };
  } catch (error) {
    console.log(error);
    return { error: error };
  }
};

const getAccountSetting = async () => {
  try {
    const accountSettings = await accountSettingModel.findOne({});
    return { data: accountSettings };
  } catch (error) {
    console.log(error);
    return { error: error };
  }
};

const updateAccountSettings = async (accountSettings) => {
  try {
    const accountSettingsDetails = await accountSettingModel.findOneAndUpdate(
      { _id: accountSettings._id },
      { $set: accountSettings },
      { new: true }
    );
    return { data: accountSettingsDetails };
  } catch (error) {
    console.log(error);
    return { error: error };
  }
};

module.exports = {
  updatePolygons,
  getPolygons,
  getAccountSetting,
  updateAccountSettings,
};
