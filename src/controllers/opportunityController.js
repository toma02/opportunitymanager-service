const opportunityModel = require('../models/opportunityModel');
const Messages = require('../enums/messages.enum');
const path = require('path');
const fs = require('fs');
const { getEventImageFilename, isImageUsedByOtherEvents } = opportunityModel;

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
      return res.status(400).json({ error: Messages.ID_REQUIRED });
    }

    const currentUser = req.query.current_user;
    const opportunity = await opportunityModel.getById(id, currentUser);

    if (!opportunity) {
      return res.status(404).json({ error: Messages.EVENT_NOT_FOUND });
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
      is_approved,
      county,
      city,
      country,
      place_id
    } = req.body;

    if (!title || !startDate || !location || !userId) {
      return res.status(400).json({ error: Messages.REQUIRED_FIELDS_MISSING });
    }

    const createdEvents = [];

    const freqMap = {
      '2': 'day',
      '3': 'week',
      '4': 'month',
      '5': 'year'
    };

    const freqUnit = freqMap[frequencyId];
    const totalRepeats = parseInt(frequencyVolume) || 1;

    if (frequencyId !== '1' && freqUnit) {
      const initialStart = new Date(startDate);
      const initialEnd = new Date(endDate);

      for (let i = 0; i < totalRepeats; i++) {
        const startDateOffset = new Date(initialStart);
        const endDateOffset = new Date(initialEnd);

        switch (freqUnit) {
          case 'day':
            startDateOffset.setDate(initialStart.getDate() + i);
            endDateOffset.setDate(initialEnd.getDate() + i);
            break;
          case 'week':
            startDateOffset.setDate(initialStart.getDate() + 7 * i);
            endDateOffset.setDate(initialEnd.getDate() + 7 * i);
            break;
          case 'month':
            startDateOffset.setMonth(initialStart.getMonth() + i);
            endDateOffset.setMonth(initialEnd.getMonth() + i);
            break;
          case 'year':
            startDateOffset.setFullYear(initialStart.getFullYear() + i);
            endDateOffset.setFullYear(initialEnd.getFullYear() + i);
            break;
        }

        const event = await opportunityModel.create({
          title,
          description,
          keywords,
          startDate: startDateOffset.toISOString(),
          endDate: endDateOffset.toISOString(),
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
          is_approved,
          county,
          city,
          country,
          place_id
        });

        await opportunityModel.uploadOrUpdateEventImage(event.opportunityid, req.file.filename);

        createdEvents.push(event);
      }

      return res.status(201).json({ message: 'Višestruki događaji kreirani', events: createdEvents });
    }

    const singleEvent = await opportunityModel.create({
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
      is_approved,
      county,
      city,
      country,
      place_id
    });

    if (req.file) {
      await opportunityModel.uploadOrUpdateEventImage(singleEvent.opportunityid, req.file.filename);
    }

    res.status(201).json(singleEvent);
  } catch (err) {
    next(err);
  }
};

exports.updateOpportunity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const eventData = req.body;

    if (!id) {
      return res.status(400).json({ error: Messages.EVENT_ID_REQUIRED });
    }

    const updatedEvent = await opportunityModel.update(id, eventData);

    if (!updatedEvent) {
      return res.status(404).json({ error: Messages.EVENT_NOT_FOUND });
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
      return res.status(404).json({ error: Messages.EVENT_NOT_FOUND });
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
      return res.status(400).json({ error: Messages.EVENT_ID_REQUIRED, code: "MISSING_ID" });
    }

    const opportunity = await opportunityModel.getById(id, userId);
    if (!opportunity) {
      return res.status(404).json({ error: Messages.EVENT_NOT_FOUND, code: "NOT_FOUND" });
    }

    if (opportunity.organizer.id !== userId) {
      return res.status(403).json({ error: Messages.ONLY_ORGANIZER_OR_ADMIN_CAN_CLOSE, code: "NOT_ORGANIZER" });
    }

    const closedOpportunity = await opportunityModel.closeOpportunity(id);
    if (!closedOpportunity) {
      return res.status(404).json({ error: Messages.EVENT_NOT_FOUND, code: "NOT_FOUND" });
    }

    res.json({ success: true, message: Messages.EVENT_CLOSED, event: closedOpportunity });
  } catch (err) {
    next(err);
  }
};

exports.deleteOpportunity = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: Messages.EVENT_ID_REQUIRED });
    }

    const filename = await getEventImageFilename(id);
    const deleted = await opportunityModel.deleteById(id);

    if (!deleted) {
      return res.status(404).json({ error: Messages.EVENT_NOT_FOUND_OR_ALREADY_DELETED });
    }

    if (filename) {
      const isUsed = await isImageUsedByOtherEvents(filename, id);
      if (!isUsed) {
        const fullPath = path.join(__dirname, '..', '..', 'uploads', 'events', filename);
        try {
          await fs.promises.unlink(fullPath);
        } catch (err) {
          console.error(`Greška pri brisanju slike ${filename}:`, err.message);
        }
      }
    }

    res.json({ success: true, message: Messages.EVENT_DELETED });
  } catch (err) {
    next(err);
  }
};


exports.getMyClosedEvents = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: Messages.USER_ID_REQUIRED });
    }
    const events = await opportunityModel.getClosedEventsByUser(id);
    res.json(events);
  } catch (err) {
    next(err);
  }
};

exports.getAllCounties = async (req, res, next) => {
  try {
    const counties = await opportunityModel.getAllCounties();
    res.json(counties);
  } catch (err) {
    next(err);
  }
};