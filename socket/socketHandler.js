const Message = require('../models/Message');

const socketHandler = (io) => {
  // Store connected users
  const users = new Map();

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Send previous messages to new user
    Message.find()
      .sort({ timestamp: 1 })
      .limit(50)
      .then(messages => {
        socket.emit('previous_messages', messages);
      })
      .catch(error => {
        console.error('Error fetching previous messages:', error);
        socket.emit('error', 'Failed to load messages');
      });

    // Handle new message
    socket.on('new_message', async (data) => {
      try {
        // Validate message data
        if (!data.message || !data.username || !data.userId) {
          socket.emit('error', 'Invalid message data');
          return;
        }

        // Create and save message
        const message = new Message({
          username: data.username,
          message: data.message,
          userId: data.userId,
          timestamp: new Date()
        });

        await message.save();

        // Broadcast to all connected clients
        io.emit('message_received', {
          id: message._id,
          username: message.username,
          message: message.message,
          userId: message.userId,
          timestamp: message.timestamp
        });

      } catch (error) {
        console.error('Error saving message:', error);
        socket.emit('error', 'Failed to send message');
      }
    });

    // Handle user typing
    socket.on('typing', (data) => {
      socket.broadcast.emit('user_typing', {
        username: data.username,
        isTyping: true
      });
    });

    socket.on('stop_typing', (data) => {
      socket.broadcast.emit('user_typing', {
        username: data.username,
        isTyping: false
      });
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      // Clean up user data
      for (const [key, value] of users.entries()) {
        if (value === socket.id) {
          users.delete(key);
          break;
        }
      }
    });
  });
};

module.exports = socketHandler;