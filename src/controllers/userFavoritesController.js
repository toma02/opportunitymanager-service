const Messages = require('../enums/messages.enum');
const userFavoritesModel = require('../models/userFavoritesModel');

exports.addToFavorites = async (req, res, next) => {
  try {
    const userId = req.user.userid;
    const { opportunityId } = req.body;
    if (!opportunityId) {
      return res.status(400).json({ error: Messages.EVENT_ID_REQUIRED });
    }
    const favorite = await userFavoritesModel.addToFavorites(userId, opportunityId);
    if (!favorite) {
      return res.status(200).json({ success: true, message: Messages.ALREADY_IN_FAVORITES });
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
      return res.status(400).json({ error: Messages.EVENT_ID_REQUIRED });
    }
    const removed = await userFavoritesModel.removeFromFavorites(userId, opportunityId);
    if (!removed) {
      return res.status(404).json({ error: Messages.NOT_FOUND_IN_FAVORITES });
    }
    res.json({ success: true, message: Messages.REMOVED_FROM_FAVORITES  });
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