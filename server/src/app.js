require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const logger = require('./config/logger');
const { errorHandler, asyncHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const studentsRoutes = require('./routes/students');
const schoolsRoutes = require('./routes/schools');
const attendanceRoutes = require('./routes/attendance');
const assessmentsRoutes = require('./routes/assessments');
const consentsRoutes = require('./routes/consents');
const notificationsRoutes = require('./routes/notifications');
const calendarRoutes = require('./routes/calendar');

const app = express();

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Middleware - Security
app.use(helmet());

// Middleware - CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Middleware - Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Middleware - Compression
app.use(compression());

// Middleware - Logging
const morganMiddleware = morgan(':method :url :status :response-time ms - :res[content-length]', {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
});
app.use(morganMiddleware);

// Middleware - Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit OTP/auth requests to 10 per 15 mins
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', generalLimiter);
app.use('/api/auth/send-otp', authLimiter);
app.use('/api/auth/verify-otp', authLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'EKAI Backend is healthy',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/schools', schoolsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/assessments', assessmentsRoutes);
app.use('/api/consents', consentsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/calendar', calendarRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    error: 'NOT_FOUND',
    path: req.path,
    method: req.method,
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
