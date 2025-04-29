const express = require('express');
const router = express.Router();
const userController = require('../controllers/opportunityController');

router.get('/', userController.getAllOpportunities);

module.exports = router;