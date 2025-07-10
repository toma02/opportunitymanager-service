const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const authenticateToken = require('../utils/jwt');

router.get('/:id/attendance', attendanceController.getUserEvents);
router.post('/:id/attendance', authenticateToken, attendanceController.postAttendance);
router.delete('/:id/attendance', authenticateToken, attendanceController.deleteAttendance);
router.get('/:id/attendees', attendanceController.getEventAttendees);
router.get('/:id/my-closed', attendanceController.getUserClosedEvents);

module.exports = router;