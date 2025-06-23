const express = require('express');
const router = express.Router();
const userFavoritesController = require('../controllers/userFavoritesController');
const authenticateToken = require('../utils/jwt');

router.post('/', authenticateToken, userFavoritesController.addToFavorites);

router.delete('/:opportunityId', authenticateToken, userFavoritesController.removeFromFavorites);

router.get('/', authenticateToken, userFavoritesController.getUserFavorites);

module.exports = router;

