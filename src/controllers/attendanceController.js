const attendanceModel = require('../models/attendanceModel');
const Messages = require('../enums/messages.enum');

exports.getUserEvents = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: Messages.ID_REQUIRED });
    }

    const opportunities = await attendanceModel.getAllForUser(id);

    if (!opportunities) {
      return res.status(404).json({ error: Messages.NO_EVENTS_FOUND_FOR_USER });
    }

    // console.log(opportunities);

    res.json(opportunities);
  } catch (err) {
    next(err);
  }
};

exports.postAttendance = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const { userId } = req.body;

    if (!eventId || !userId) {
      return res.status(400).json({ error: Messages.EVENT_ID_AND_USER_ID_REQUIRED });
    }

    const result = await attendanceModel.addAttendance(eventId, userId);

    res.status(201).json({ success: true, message: Messages.ATTENDANCE_SUCCESS, attendance: result });
  } catch (err) {
    next(err);
  }
};

exports.deleteAttendance = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const { userId } = req.body;

    if (!eventId || !userId) {
      return res.status(400).json({ error: Messages.EVENT_ID_AND_USER_ID_REQUIRED });
    }

    await attendanceModel.removeAttendance(eventId, userId);

    res.status(200).json({ success: true, message: Messages.UNREGISTER_SUCCESS });
  } catch (err) {
    next(err);
  }
};

exports.getEventAttendees = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    if (!eventId) {
      return res.status(400).json({ error: Messages.EVENT_ID_REQUIRED, code: 'MISSING_ID' });
    }

    const attendees = await attendanceModel.getAllForEvent(eventId);
    res.json(attendees);
  } catch (err) {
    next(err);
  }
};

exports.getUserClosedEvents = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: Messages.ID_REQUIRED });
    }

    const opportunities = await attendanceModel.getClosedForUser(id);

    if (!opportunities) {
      return res.status(404).json({ error: Messages.NO_CLOSED_EVENTS_FOR_USER });
    }

    res.json(opportunities);
  } catch (err) {
    next(err);
  }
};