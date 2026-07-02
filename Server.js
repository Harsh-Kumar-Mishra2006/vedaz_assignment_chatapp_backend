const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/Database');
const messageRoutes = require('./routes/messageRoutes');
const socketHandler = require('./socket/socketHandler');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// Get frontend URLs from environment
const frontendUrls = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
  'https://vedaz-assignment-chatapp-frontend.onrender.com'
].filter(Boolean);

// Remove trailing slashes from URLs
const cleanUrls = frontendUrls.map(url => url.replace(/\/$/, ''));

// Configure CORS options
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (cleanUrls.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  maxAge: 86400,
};

// Apply CORS to Express app
app.use(cors(corsOptions));

// Socket.io with CORS configuration
const io = socketIo(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (cleanUrls.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        console.log('Socket blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  crossOriginEmbedderPolicy: false,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ✅ ADD: Welcome route for root path
app.get('/', (req, res) => {
  res.json({
    name: 'Chat Application API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      messages: '/api/messages',
      'test-cors': '/api/test-cors',
      websocket: 'ws://localhost:3000 (or your deployed URL)'
    },
    documentation: 'For more info, visit the GitHub repository',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/messages', messageRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    allowedOrigins: cleanUrls,
    mongodb: 'connected'
  });
});

// Test CORS endpoint
app.get('/api/test-cors', (req, res) => {
  res.json({ 
    message: 'CORS is working!', 
    origin: req.headers.origin || 'unknown',
    timestamp: new Date().toISOString()
  });
});

// Socket.io handling
socketHandler(io);

// 404 handler - Keep this at the end
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      path: req.path,
      availableEndpoints: [
        '/',
        '/health',
        '/api/messages',
        '/api/test-cors',
        'WebSocket connection'
      ]
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500,
    },
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io server is ready`);
  console.log(`🔗 WebSocket URL: ws://localhost:${PORT}`);
  console.log(`🌐 HTTP URL: http://localhost:${PORT}`);
  console.log(`📋 Allowed CORS origins:`, cleanUrls);
  console.log(`\n📌 Available endpoints:`);
  console.log(`   GET  /              - API Information`);
  console.log(`   GET  /health        - Health Check`);
  console.log(`   GET  /api/messages  - Get Messages`);
  console.log(`   POST /api/messages  - Send Message`);
  console.log(`   GET  /api/test-cors - Test CORS`);
  console.log(`   WS   /              - WebSocket Connection`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});