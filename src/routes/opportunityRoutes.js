const express = require('express');
const router = express.Router();
const opportunityController = require('../controllers/opportunityController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'event_' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

router.get('/', opportunityController.getAllOpportunities);
router.get('/:id', opportunityController.getOpportunityById);
router.post('/', upload.single('image'), opportunityController.postEvent);
router.post('/:id/attendance', opportunityController.postAttendance);
router.delete('/:id/attendance', opportunityController.deleteAttendance);

module.exports = router;