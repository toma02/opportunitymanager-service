const express = require('express');
const router = express.Router();
const opportunityController = require('../controllers/opportunityController');

router.get('/', opportunityController.getAllOpportunities);
router.get('/:id', opportunityController.getOpportunityById);
router.post('/', opportunityController.postEvent); 
router.post('/:id/attendance', opportunityController.postAttendance);
router.delete('/:id/attendance', opportunityController.deleteAttendance);

module.exports = router;