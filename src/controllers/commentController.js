const commentModel = require('../models/commentModel');
const Messages = require('../enums/messages.enum');

exports.getAllCommentsById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const currentUser = req.query.current_user;

    if (!id) {
      return res.status(400).json({ error: Messages.ID_REQUIRED });
    }

    const comments = await commentModel.getAllById(id, currentUser);

    if (!comments) {
      return res.status(404).json({ error: Messages.NO_COMMENTS_FOR_EVENT });
    }

    res.json(comments);
  } catch (err) {
    next(err);
  }
};

exports.postNewComment = async (req, res, next) => {
  try {
    const { opportunityid, userid, comment } = req.body;
    if (!opportunityid || !userid || !comment) {
      return res.status(400).json({ error: Messages.ALL_FIELDS_REQUIRED });
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
    if (!commentId) {
      return res.status(400).json({ error: Messages.COMMENT_ID_REQUIRED });
    }

    const deletedComment = await commentModel.deleteComment(commentId);
    if (!deletedComment) {
      return res.status(404).json({ error: Messages.COMMENT_NOT_FOUND });
    }

    res.json({ success: true, deletedComment });
  } catch (err) {
    next(err);
  }
};

exports.likeComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userid;
    if (!commentId || !userId) {
      return res.status(400).json({ error: Messages.COMMENT_ID_AND_USER_ID_REQUIRED });
    }

    const result = await commentModel.likeComment(commentId, userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.unlikeComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userid;
    if (!commentId || !userId) {
      return res.status(400).json({ error: Messages.COMMENT_ID_AND_USER_ID_REQUIRED });
    }

    const result = await commentModel.unlikeComment(commentId, userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.reportComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userid;
    const { reason } = req.body;

    if (!commentId || !userId) {
      return res.status(400).json({ error: Messages.COMMENT_ID_AND_USER_ID_REQUIRED });
    }

    const result = await commentModel.reportComment(commentId, userId, reason);

    res.json({ success: true, report: result });
  } catch (err) {
    if (err.code === '23505') { 
      return res.status(400).json({ error: Messages.COMMENT_ALREADY_REPORTED });
    }
    next(err);
  }
};

exports.getAllReportedComments = async (req, res, next) => {
  try {
    const reportedComments = await commentModel.getAllReportedComments();
    res.json(reportedComments);
  } catch (err) {
    next(err);
  }
};