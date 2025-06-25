const axios = require('axios');
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

async function getNearbyPlaces(latitude, longitude) {
  try {
    const types = ['restaurant', 'supermarket'];
    const radius = 500;
    const allPlaces = [];

    for (const type of types) {
      const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
        params: {
          location: `${latitude},${longitude}`,
          radius: radius,
          type: type,
          key: GOOGLE_PLACES_API_KEY
        }
      });

      if (response.data?.results) {
        allPlaces.push(...response.data.results.map(place => ({
          name: place.name,
          address: place.vicinity,
          type: type === 'restaurant' ? 'restaurant' : 'store',
          location: place.geometry.location
        })));
      }
    }

    const restaurants = allPlaces.filter(p => p.type === 'restaurant').slice(0, 3);
    const stores = allPlaces.filter(p => p.type === 'store').slice(0, 3);

    return { restaurants, stores };
  } catch (error) {
    console.error('Google Places API error:', error);
    throw new Error('Failed to fetch nearby places');
  }
}

module.exports = { getNearbyPlaces };