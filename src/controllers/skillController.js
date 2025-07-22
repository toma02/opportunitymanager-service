const skillModel = require('../models/skillModel');

exports.getAllSkills = async (req, res, next) => {
  try {
    const skills = await skillModel.getAll();
    res.json(skills);
  } catch (err) {
    next(err);
  }
};