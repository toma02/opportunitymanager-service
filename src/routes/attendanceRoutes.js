const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

router.get('/:id/attendance', attendanceController.getUserEvents);
router.post('/:id/attendance', attendanceController.postAttendance);
router.delete('/:id/attendance', attendanceController.deleteAttendance);

module.exports = router;