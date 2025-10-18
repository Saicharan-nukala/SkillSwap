const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
require('dotenv').config();

// Import routes - FIXED: Import actual route files, not middleware
const authRoutes = require('./routes/authRoutes'); // ✅ FIXED: Import auth routes
const userRoutes = require('./routes/userRoutes');
const swapRoutes = require('./routes/swapRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
// Import email service for testing
const { testEmailConfig } = require('./services/emailService');

const app = express();
const server = http.createServer(app);
// Add to your server.js or app.js


// Mount routes

// Debug: Verify environment variables are loaded
console.log('Environment Variables:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI ? '*****' : 'undefined',
  EMAIL_USERNAME: process.env.EMAIL_USERNAME ? '*****' : 'undefined',
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? '*****' : 'undefined'
});

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host} ✅`);
    
    // Test email configuration after DB connection
    await testEmailConfig();
    
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes - FIXED: Use proper route paths
app.use('/api/auth', authRoutes); // ✅ FIXED: Now uses actual auth routes
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