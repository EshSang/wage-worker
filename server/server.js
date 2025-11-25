require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const prisma = require('./config/prisma');
const routes = require('./routes');

const app = express();

// Logger configuration
morgan.token('body', (req) => JSON.stringify(req.body));
morgan.token('timestamp', () => new Date().toISOString());

// Allow multiple origins for CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(null, true); // For development, allow all origins
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

// HTTP request logging
app.use(morgan(':timestamp :method :url :status :res[content-length] - :response-time ms'));

// Request body logging for debugging (excluding sensitive routes)
app.use((req, res, next) => {
  if (req.path !== '/auth/signin' && req.path !== '/auth/signup') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, req.body);
  } else {
    // For auth routes, log without password
    const safeBody = { ...req.body };
    if (safeBody.password) safeBody.password = '***HIDDEN***';
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, safeBody);
  }
  next();
});

// Mount all routes
app.use('/api', routes);

// Legacy route redirects for backward compatibility
app.post('/signin', (req, res) => res.redirect(307, '/api/auth/signin'));
app.post('/signup', (req, res) => res.redirect(307, '/api/auth/signup'));
app.get('/healthcheck', (req, res) => res.redirect(307, '/api/healthcheck'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('=== GLOBAL ERROR HANDLER ===');
  console.error('Timestamp:', new Date().toISOString());
  console.error('Path:', req.path);
  console.error('Method:', req.method);
  console.error('Error:', err);
  console.error('Stack:', err.stack);

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await prisma.$disconnect();
  process.exit(0);
});

const PORT = process.env.PORT || 8081;

app.listen(PORT, async () => {
  console.log(`[${new Date().toISOString()}] ========================================`);
  console.log(`[${new Date().toISOString()}] Server running on port ${PORT}`);
  console.log(`[${new Date().toISOString()}] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[${new Date().toISOString()}] ========================================`);

  // Test database connection
  try {
    await prisma.$connect();
    console.log(`[${new Date().toISOString()}] Database connected successfully with Prisma!`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Database connection failed:`, error);
  }
});
