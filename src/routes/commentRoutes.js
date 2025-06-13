const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authenticateToken = require('../utils/jwt');

router.get('/:id', commentController.getAllCommentsById);
router.post('/', authenticateToken, commentController.postNewComment);
router.delete('/:commentId', authenticateToken, commentController.deleteComment);
router.post('/:commentId/like', authenticateToken, commentController.likeComment);
router.post('/:commentId/unlike', authenticateToken, commentController.unlikeComment);
router.post('/:commentId/report', authenticateToken, commentController.reportComment);
router.get('/reported/all', authenticateToken, commentController.getAllReportedComments);
router.get('/reported/alll', commentController.getAllReportedComments);

module.exports = router;