const express = require('express');
const router = express.Router();
const nearbyPlacesController = require('../controllers/nearbyPlacesController');

router.get('/', nearbyPlacesController.getNearbyPlaces);
module.exports = router;
