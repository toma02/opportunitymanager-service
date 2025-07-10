const nearbyPlacesModel = require('../models/nearbyPlacesModel');
const Messages = require('../enums/messages.enum');

exports.getNearbyPlaces = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: Messages.LATITUDE_AND_LONGITUDE_REQUIRED });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    const places = await nearbyPlacesModel.getNearbyPlaces(latitude, longitude);
    res.json(places);
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({ error: error.message || Messages.INTERNAL_SERVER_ERROR });
  }
};