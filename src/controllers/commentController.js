const commentModel = require('../models/commentModel');

exports.getAllCommentsById = async (req, res, next) => {
   try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: "ID je obavezan parametar" });
    }

    const comments = await commentModel.getAllById(id);

    if (!comments) {
      return res.status(404).json({ error: "Nema komentara za taj događaj!" });
    }

    // console.log(comments);

    res.json(comments);
  } catch (err) {
    next(err);
  }
};
