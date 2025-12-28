const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/santa-video';
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🎅 Santa Video Backend Starting...');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const templateRoutes = require('./routes/templates');
const scriptRoutes = require('./routes/scripts');
const paymentRoutes = require('./routes/payment');
const videoGenerationRoutes = require('./routes/generation');

// Routes
app.use('/api/templates', templateRoutes);
app.use('/api/scripts', scriptRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api', videoGenerationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: '🎅 Santa Video Backend is running!'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(error.status || 500).json({
    error: error.message || 'Internal Server Error',
  });
});

// Only start the server if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Santa Video Node.js Backend running on port ${PORT}`);
  });
}

module.exports = app;
