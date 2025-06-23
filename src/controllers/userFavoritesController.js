const userFavoritesModel = require('../models/userFavoritesModel');
const authenticateToken = require('../utils/jwt');

exports.addToFavorites = async (req, res, next) => {
  try {
    const userId = req.user.userid;
    const { opportunityId } = req.body;
    if (!opportunityId) {
      return res.status(400).json({ error: "ID događaja je obavezan." });
    }
    const favorite = await userFavoritesModel.addToFavorites(userId, opportunityId);
    if (!favorite) {
      return res.status(200).json({ success: true, message: "Događaj već u favoritima." });
    }
    res.json({ success: true, favorite });
  } catch (err) {
    next(err);
  }
};

exports.removeFromFavorites = async (req, res, next) => {
  try {
    const userId = req.user.userid;
    const { opportunityId } = req.params;
    if (!opportunityId) {
      return res.status(400).json({ error: "ID događaja je obavezan." });
    }
    const removed = await userFavoritesModel.removeFromFavorites(userId, opportunityId);
    if (!removed) {
      return res.status(404).json({ error: "Događaj nije pronađen u favoritima." });
    }
    res.json({ success: true, message: "Događaj uklonjen iz favorita." });
  } catch (err) {
    next(err);
  }
};

exports.getUserFavorites = async (req, res, next) => {
  try {
    const userId = req.user.userid;
    const favorites = await userFavoritesModel.getUserFavorites(userId);
    res.json(favorites);
  } catch (err) {
    next(err);
  }
};