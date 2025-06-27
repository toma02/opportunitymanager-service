const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const authenticateToken = require('../utils/jwt');

router.get('/', authenticateToken, reportsController.getAllReports);
router.get('/:id', authenticateToken, reportsController.getReportById);
router.post('/', authenticateToken, reportsController.addReport);
router.patch('/:id/status', authenticateToken, reportsController.updateReportStatus);
router.delete('/:id', authenticateToken, reportsController.deleteReport);

module.exports = router;