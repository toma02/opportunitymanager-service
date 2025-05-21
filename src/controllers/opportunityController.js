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

exports.getAllOpportunitiesByUser = async (req, res, next) => {
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

    const currentUser = req.query.current_user;
    const opportunity = await opportunityModel.getById(id, currentUser);

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
    const imagePath = req.file ? req.file.filename : null;

    // console.log(req.body);

    const {
      title,
      description,
      keywords,
      startDate,
      endDate,
      frequencyId,
      frequencyVolume,
      location,
      latitude,
      longitude,
      transport,
      minVolunteers,
      maxVolunteers,
      duration,
      equipment,
      shareToSocialMedia,
      isPrivate,
      userId,
    } = req.body;

    if (!title || !startDate || !location || !userId) {
      return res.status(400).json({ error: "Obavezna polja su naslov, datum, lokacija i organizator" });
    }

    const newEvent = await opportunityModel.create({
      title,
      description,
      keywords,
      startDate,
      endDate,
      frequencyId,
      frequencyVolume,
      location,
      latitude,
      longitude,
      transport,
      minVolunteers,
      maxVolunteers,
      duration,
      equipment,
      shareToSocialMedia,
      isPrivate,
      userId,
    });

    const eventId = newEvent.opportunityid;

    if (req.file) {
      await opportunityModel.uploadOrUpdateEventImage(eventId, req.file.filename);
    }

    res.status(201).json(newEvent);
  } catch (err) {
    next(err);
  }
};