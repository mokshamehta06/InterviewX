const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const companyRoutes = require('./routes/companyRoutes');
const questionRoutes = require('./routes/questionRoutes');
const experienceRoutes = require('./routes/experienceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const mockTestRoutes = require('./routes/mockTestRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const adminRoutes = require('./routes/adminRoutes');
const companyInsightRoutes = require('./routes/companyInsightRoutes');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// ========================
// Security Middleware
// ========================

// Helmet: sets various HTTP headers for security
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for development
  crossOriginEmbedderPolicy: false,
}));

// CORS: allow frontend to communicate with backend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting: prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // only 20 auth attempts per 15 min
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes',
  },
});
app.use('/api/auth', authLimiter);

// ========================
// Body Parsing Middleware
// ========================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ========================
// Serve Frontend Static Files
// ========================
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ========================
// API Routes
// ========================
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/mock-tests', mockTestRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/company-insights', companyInsightRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'InterviewIQ API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ========================
// Serve Frontend Pages
// ========================
// For any non-API route, serve the frontend
app.get('*', (req, res) => {
  // If the request is for a specific page file
  const pagePath = path.join(__dirname, '..', 'frontend', 'pages', req.path);
  const fs = require('fs');
  if (fs.existsSync(pagePath)) {
    return res.sendFile(pagePath);
  }
  // Default to index.html
  res.sendFile(path.join(__dirname, '..', 'frontend', 'pages', 'index.html'));
});

// ========================
// Error Handling
// ========================
app.use(errorHandler);

// ========================
// Start Server
// ========================
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║         InterviewIQ Server               ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log(`║  🚀 Server running on port ${PORT}          ║`);
  console.log(`║  🌍 Environment: ${process.env.NODE_ENV || 'development'}       ║`);
  console.log(`║  📡 API: http://localhost:${PORT}/api       ║`);
  console.log(`║  🖥️  Frontend: http://localhost:${PORT}      ║`);
  console.log('╚══════════════════════════════════════════╝');
  console.log('');
});

module.exports = app;
