const express = require('express');
const router = express.Router();
const opportunityController = require('../controllers/opportunityController');

router.get('/', opportunityController.getAllOpportunities);
router.get('/:id', opportunityController.getOpportunityById); 

module.exports = router;