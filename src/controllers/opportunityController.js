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

exports.getApprovedOpportunities = async (req, res, next) => {
  try {
    const opportunities = await opportunityModel.getApproved();
    res.json(opportunities);
  } catch (err) {
    next(err);
  }
};

exports.getPendingOpportunities = async (req, res, next) => {
  try {
    const opportunities = await opportunityModel.getPending();
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
      is_approved
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
      is_approved
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

exports.updateOpportunity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const eventData = req.body;

    if (!id) {
      return res.status(400).json({ error: "ID događaja je obavezan!" });
    }

    const updatedEvent = await opportunityModel.update(id, eventData);

    if (!updatedEvent) {
      return res.status(404).json({ error: "Događaj nije pronađen!" });
    }

    res.json({ success: true, event: updatedEvent });
  } catch (err) {
    next(err);
  }
};

exports.approveOpportunity = async (req, res, next) => {
  try {
    const { id } = req.params;

    const approvedEvent = await opportunityModel.approve(id);

    if (!approvedEvent) {
      return res.status(404).json({ error: "Događaj nije pronađen" });
    }

    res.json({
      success: true,
      message: "Događaj odobren",
      event: approvedEvent
    });
  } catch (err) {
    next(err);
  }
};

exports.getUpcomingOpportunities = async (req, res, next) => {
  try {
    const opportunities = await opportunityModel.getUpcoming();
    res.json(opportunities);
  } catch (err) {
    next(err);
  }
};

exports.getActiveOpportunities = async (req, res, next) => {
  try {
    const opportunities = await opportunityModel.getActiveNow();
    res.json(opportunities);
  } catch (err) {
    next(err);
  }
};

exports.getPastOpportunities = async (req, res, next) => {
  try {
    const opportunities = await opportunityModel.getPast();
    res.json(opportunities);
  } catch (err) {
    next(err);
  }
};

exports.closeOpportunity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userid; 

    if (!id) {
      return res.status(400).json({ error: "ID događaja je obavezan", code: "MISSING_ID" });
    }

    const opportunity = await opportunityModel.getById(id, userId);
    if (!opportunity) {
      return res.status(404).json({ error: "Događaj nije pronađen", code: "NOT_FOUND" });
    }

    if (opportunity.organizer.id !== userId) {
      return res.status(403).json({ error: "Samo organizator/admin može zatvoriti događaj", code: "NOT_ORGANIZER" });
    }

    const closedOpportunity = await opportunityModel.closeOpportunity(id);
    if (!closedOpportunity) {
      return res.status(404).json({ error: "Događaj nije pronađen", code: "NOT_FOUND" });
    }

    res.json({
      success: true,
      message: "Događaj je službeno završen",
      event: closedOpportunity
    });
  } catch (err) {
    next(err);
  }
};