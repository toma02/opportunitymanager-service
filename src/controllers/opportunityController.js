const opportunityService = require('../services/opportunityService');
const opportunityModel = require('../models/opportunityModel');

exports.getAllOpportunities = async (req, res, next) => {
  try {
    const currentUser = req.query.current_user;
    const opportunities = await opportunityModel.getAll(currentUser);
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
  // console.log(req.body);
  try {
    const {
      title,
      description,
      image,
      keywords,
      startDate,
      endDate,
      frequencyId,
      frequencyVolume,
      location,
      transport,
      minVolunteers,
      maxVolunteers,
      duration,
      equipment,
      shareToSocialMedia,
      isPrivate,
      userId,
    } = req.body;

    // console.log({title, startDate, location, userId});

    if (!title || !startDate || !location || !userId) {
      return res.status(400).json({ error: "Obavezna polja su naslov, datum, lokacija i organizator" });
    }

    const newEvent = await opportunityModel.create({
      title,
      description,
      image,
      keywords,
      startDate,
      endDate,
      frequencyId,
      frequencyVolume,
      location,
      transport,
      minVolunteers,
      maxVolunteers,
      duration,
      equipment,
      shareToSocialMedia,
      isPrivate,
      userId,
    });

    res.status(201).json(newEvent);
  } catch (err) {
    next(err);
  }
};
