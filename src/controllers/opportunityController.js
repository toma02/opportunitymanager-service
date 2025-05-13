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

exports.postEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      image,
      dateFrom,
      dateTo,
      frequency,
      location,
      transport,
      minVolunteers,
      maxVolunteers,
      equipment,
      shareToSocialMedia,
      isPrivate,
      userId
    } = req.body;

    if (!title || !dateFrom || !location || !userId) {
      return res.status(400).json({ error: "Obavezna polja su naslov, datum, lokacija i organizator" });
    }

    const newEvent = await opportunityModel.create({
      title,
      description,
      category,
      image,
      dateFrom,
      dateTo,
      frequency,
      location,
      transport,
      minVolunteers,
      maxVolunteers,
      equipment,
      shareToSocialMedia,
      isPrivate,
      userId
    });

    res.status(201).json(newEvent);
  } catch (err) {
    next(err);
  }
};
