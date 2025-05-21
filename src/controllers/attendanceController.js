const attendanceModel = require('../models/attendanceModel');

exports.postAttendance = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const { userId } = req.body;

    if (!eventId || !userId) {
      return res.status(400).json({ error: "Event ID i userId su obavezni." });
    }

    const result = await attendanceModel.addAttendance(eventId, userId);

    res.status(201).json({ success: true, message: "Prijava uspješna", attendance: result });
  } catch (err) {
    next(err);
  }
};

exports.deleteAttendance = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const { userId } = req.body;

    if (!eventId || !userId) {
      return res.status(400).json({ error: "Event ID i userId su obavezni." });
    }

    await attendanceModel.removeAttendance(eventId, userId);

    res.status(200).json({ success: true, message: "Odjava uspješna" });
  } catch (err) {
    next(err);
  }
};