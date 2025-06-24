const express = require('express');
const router = express.Router();
const userStatisticsController = require('../controllers/userStatisticsController');
const authenticateToken = require('../utils/jwt');

router.get('/', userStatisticsController.getBasicStatistics);

module.exports = router;