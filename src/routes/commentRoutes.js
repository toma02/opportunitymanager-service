const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authenticateToken = require('../utils/jwt');

router.get('/:id', commentController.getAllCommentsById);
router.post('/', authenticateToken, commentController.postNewComment);
// router.post('/', commentController.getAllComments);

module.exports = router;