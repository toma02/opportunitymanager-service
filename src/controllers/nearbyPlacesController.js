const nearbyPlacesModel = require('../models/nearbyPlacesModel');

exports.getNearbyPlaces = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    const places = await nearbyPlacesModel.getNearbyPlaces(latitude, longitude);
    res.json(places);
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};