//controllers/messageControllers.js
const Message = require('../models/Message');

// Get all messages
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find()
      .sort({ timestamp: -1 })
      .limit(50);
    
    res.json({
      success: true,
      data: messages.reverse()
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages'
    });
  }
};

// Save a new message
const saveMessage = async (req, res) => {
  try {
    const { username, message, userId } = req.body;

    if (!username || !message || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const newMessage = new Message({
      username,
      message,
      userId,
      timestamp: new Date()
    });

    await newMessage.save();

    res.status(201).json({
      success: true,
      data: newMessage
    });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save message'
    });
  }
};

module.exports = {getMessages, saveMessage};