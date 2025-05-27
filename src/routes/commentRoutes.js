const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

router.get('/:id', commentController.getAllCommentsById);
// router.post('/', commentController.getAllComments);

module.exports = router;