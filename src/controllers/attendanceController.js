const attendanceModel = require('../models/attendanceModel');

exports.getUserEvents = async (req, res, next) => {
   try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: "ID je obavezan parametar" });
    }

    const opportunities = await attendanceModel.getAllForUser(id);

    if (!opportunities) {
      return res.status(404).json({ error: "Korisnik se nije prijavio ni ja jedan događaj!" });
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