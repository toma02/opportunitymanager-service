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

exports.postNewComment = async (req, res, next) => {
  try {
    const { opportunityid, userid, comment } = req.body;
    if (!opportunityid || !userid || !comment) {
      return res.status(400).json({ error: "Sva polja su obavezna!" });
    }

    const newComment = await commentModel.addComment({ opportunityid, userid, comment });
    res.status(201).json(newComment);
  } catch (err) {
    next(err);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    console.log(commentId);
    if (!commentId) {
      return res.status(400).json({ error: "ID komentara je obavezan!" });
    }

    const deletedComment = await commentModel.deleteComment(commentId);
    if (!deletedComment) {
      return res.status(404).json({ error: "Komentar nije pronađen!" });
    }

    res.json({ success: true, deletedComment });
  } catch (err) {
    next(err);
  }
};