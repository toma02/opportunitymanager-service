const userStatisticsModel = require('../models/userStatisticsModel');

exports.getBasicStatistics = async (req, res, next) => {
  try {
    const stats = await userStatisticsModel.getBasicStatistics();
    res.json(stats);
  } catch (err) {
    next(err);
  }
};