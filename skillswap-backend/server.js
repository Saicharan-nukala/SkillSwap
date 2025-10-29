const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const swapRoutes = require('./routes/swapRoutes');
const sessionRoutes = require('./routes/sessionRoutes');

// Import email service for testing
const { testEmailConfig } = require('./services/emailService');

const app = express();
const server = http.createServer(app);

// Socket.IO Configuration with online users tracking
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
  }
});

// Track online users - Map of userId -> Set of socketIds (user can have multiple tabs)
const onlineUsers = new Map();

io.on('connection', (socket) => {

  
  // User comes online
  socket.on('userOnline', (userId) => {
    // Add socket to user's set of connections
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);
    
    
    // Broadcast to all clients that this user is online
    io.emit('userStatusChange', { userId, isOnline: true });
    
    // Send current list of all online users to the newly connected socket
    const allOnlineUsers = Array.from(onlineUsers.keys());
    socket.emit('allOnlineUsers', allOnlineUsers);
  });
  
  // Join swap-specific room
  socket.on('joinRoom', (swapId) => {
    socket.join(swapId);
  });
  
  // Mark messages as read
  socket.on('markAsRead', async ({ swapId, userId }) => {
    // Emit to the room that messages were read
    io.to(swapId).emit('messagesRead', { swapId, userId });
  });
  
  // User disconnect
  socket.on('disconnect', () => {

    
    // Find and remove this specific socket from user's connections
    let disconnectedUserId = null;
    
    for (let [userId, socketSet] of onlineUsers.entries()) {
      if (socketSet.has(socket.id)) {
        socketSet.delete(socket.id);
        disconnectedUserId = userId;
        
        // If user has no more sockets, remove them completely and broadcast offline status
        if (socketSet.size === 0) {
          onlineUsers.delete(userId);

          io.emit('userStatusChange', { userId, isOnline: false });
        } else {

        }
        break;
      }
    }
  });
});

// Make io and onlineUsers accessible in controllers
app.set('io', io);
app.set('onlineUsers', onlineUsers);

// Debug: Verify environment variables are loaded
console.log('Environment Variables:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI ? '*****' : 'undefined',
  EMAIL_USERNAME: process.env.EMAIL_USERNAME ? '*****' : 'undefined',
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY ? '*****' : 'undefined'
});

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host} ✅`);
    
    await testEmailConfig();
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/swaps', swapRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/swap-requests', require('./routes/swapRequestRoutes'));

// Basic route for testing
app.get('/', (req, res) => {
  res.json({
    message: 'Server is running!',
    timestamp: new Date().toISOString()
  });
});
app.get('/test-mail', async (req, res) => {
  try {
    await sendOTPEmail(process.env.EMAIL_USERNAME, "999999", "Test User");
    res.json({ success: true, message: "Test mail sent ✅" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
