const Message = require('../models/Message');

const socketHandler = (io) => {
  const users = new Map();

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    // Send connection acknowledgment
    socket.emit('connection_ack', {
      status: 'connected',
      socketId: socket.id,
      timestamp: new Date().toISOString()
    });

    // Send previous messages
    Message.find()
      .sort({ timestamp: 1 })
      .limit(50)
      .then(messages => {
        console.log(`📨 Sending ${messages.length} previous messages to ${socket.id}`);
        socket.emit('previous_messages', messages);
      })
      .catch(error => {
        console.error('❌ Error fetching previous messages:', error);
        socket.emit('error', 'Failed to load messages');
      });

    // Handle new message
    socket.on('new_message', async (data) => {
      try {
        console.log(`📝 New message from ${data.username}: ${data.message.substring(0, 30)}...`);

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

        console.log(`📤 Message broadcasted to all clients`);

      } catch (error) {
        console.error('❌ Error saving message:', error);
        socket.emit('error', 'Failed to send message');
      }
    });

    // Handle typing
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

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.id}`);
      
      // Clean up user from map
      for (const [key, value] of users.entries()) {
        if (value === socket.id) {
          users.delete(key);
          break;
        }
      }
      
      console.log(`📊 Total connected clients: ${io.engine.clientsCount}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`❌ Socket error for ${socket.id}:`, error);
    });
  });

  // Handle server-level errors
  io.engine.on('connection_error', (err) => {
    console.error('❌ Connection error:', err);
  });
};

module.exports = socketHandler;