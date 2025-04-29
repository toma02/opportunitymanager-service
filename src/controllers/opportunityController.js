const opportunityService = require('../services/opportunityService');
const opportunityModel = require('../models/opportunityModel');

exports.getAllOpportunities = async (req, res, next) => {
  try {
    const opportunities = await opportunityModel.getAll();
    res.json(opportunities);
  } catch (err) {
    next(err);
  }
};
