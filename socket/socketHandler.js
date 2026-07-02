// socket/socketHandler.js
const Message = require('../models/Message');

const socketHandler = (io) => {
  
  const users = new Map();

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

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

    socket.on('new_message', async (data) => {
      try {
        if (!data.message || !data.username || !data.userId) {
          socket.emit('error', 'Invalid message data');
          return;
        }

        const message = new Message({
          username: data.username,
          message: data.message,
          userId: data.userId,
          timestamp: new Date()
        });

        await message.save();

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

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
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