const keywordModel = require('../models/keywordModel');

exports.getAllKeywords = async (req, res, next) => {
  try {
    const keywords = await keywordModel.getAll();
    res.json(keywords);
  } catch (err) {
    next(err);
  }
};
