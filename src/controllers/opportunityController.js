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

exports.getOpportunityById = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: "ID je obavezan parametar" });
    }
    
    const opportunity = await opportunityModel.getById(id);
    
    if (!opportunity) {
      return res.status(404).json({ error: "Događaj nije pronađen" });
    }
    
    res.json(opportunity);
  } catch (err) {
    next(err);
  }
};