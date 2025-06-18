const express = require('express');
const router = express.Router();
const opportunityController = require('../controllers/opportunityController');
const multer = require('multer');
const path = require('path');
const authenticateToken = require('../utils/jwt');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/events');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'event_' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

router.get('/', opportunityController.getAllOpportunities);
router.get('/upcoming', opportunityController.getUpcomingOpportunities);
router.get('/active', opportunityController.getActiveOpportunities);
router.get('/approved', opportunityController.getApprovedOpportunities);
router.get('/pending', opportunityController.getPendingOpportunities);
router.put('/pending/:id', authenticateToken, opportunityController.approveOpportunity);
router.get('/:id', opportunityController.getOpportunityById);
router.put('/:id', authenticateToken, opportunityController.updateOpportunity);
router.post('/', authenticateToken, upload.single('image'), opportunityController.postEvent);

module.exports = router;