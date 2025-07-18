const attendanceModel = require('../models/attendanceModel');
const Messages = require('../enums/messages.enum');
const { validateParam } = require('../utils/validators');

exports.getUserEvents = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (validateParam(id, res, 'ID')) return;

    const opportunities = await attendanceModel.getAllForUser(id);
    if (!opportunities || opportunities.length === 0) {
      return res.status(404).json({ error: Messages.NO_EVENTS_FOUND_FOR_USER });
    }

    res.json(opportunities);
  } catch (err) {
    next(err);
  }
};

exports.postAttendance = async (req, res, next) => {
  try {
    const { id: eventId } = req.params;
    const { userId } = req.body;

    if (validateParam(eventId, res, 'EVENT_ID_AND_USER_ID')) return;
    if (validateParam(userId, res, 'EVENT_ID_AND_USER_ID')) return;

    const result = await attendanceModel.addAttendance(eventId, userId);
    res.status(201).json({
      success: true,
      message: Messages.ATTENDANCE_SUCCESS,
      attendance: result
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteAttendance = async (req, res, next) => {
  try {
    const { id: eventId } = req.params;
    const { userId } = req.body;

    if (validateParam(eventId, res, 'EVENT_ID_AND_USER_ID')) return;
    if (validateParam(userId, res, 'EVENT_ID_AND_USER_ID')) return;

    await attendanceModel.removeAttendance(eventId, userId);
    res.status(200).json({ success: true, message: Messages.UNREGISTER_SUCCESS });
  } catch (err) {
    next(err);
  }
};

exports.getEventAttendees = async (req, res, next) => {
  try {
    const { id: eventId } = req.params;
    if (validateParam(eventId, res, 'EVENT_ID')) return;

    const attendees = await attendanceModel.getAllForEvent(eventId);
    res.json(attendees);
  } catch (err) {
    next(err);
  }
};

exports.getUserClosedEvents = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (validateParam(id, res, 'ID')) return;

    const opportunities = await attendanceModel.getClosedForUser(id);
    if (!opportunities || opportunities.length === 0) {
      return res.status(404).json({ error: Messages.NO_CLOSED_EVENTS_FOR_USER });
    }

    res.json(opportunities);
  } catch (err) {
    next(err);
  }
};