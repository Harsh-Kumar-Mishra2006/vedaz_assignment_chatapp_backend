const express = require('express');
const router = express.Router();
const {
  getMessages,
  saveMessage
} = require('../controllers/messageControllers');

// Get all messages
router.get('/', getMessages);

// Save a new message
router.post('/', saveMessage);

module.exports = router;