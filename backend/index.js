const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
const logger = require('./utils/logger');

// Load environment variables FIRST before importing anything that uses them
dotenv.config();

// Import Routes
const signupRoutes = require('./routes/signup');
const loginRoutes = require('./routes/login');
const approvalRoutes = require('./routes/approval');
const userRoutes = require('./routes/user');
const masterRoutes = require('./routes/master');
const archiveRoutes = require('./routes/archive');
const stockEntryRoutes = require('./routes/stockEntry');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// CORS Configuration
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:3000'];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Security Middleware - Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit for authentication endpoints (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,
});

// Middleware
app.use(cors(corsOptions)); // Allow only specific origins
app.use(express.json()); // Parse JSON bodies

// API Routes - Register BEFORE rate limiting to avoid middleware issues
app.use('/api/auth', signupRoutes);
app.use('/api/auth', loginRoutes);
app.use('/api/auth', approvalRoutes);
app.use('/api/user', userRoutes);
app.use('/api/master', masterRoutes);
app.use('/api/archive', archiveRoutes);
app.use('/api/stock', stockEntryRoutes);

// Serve static files from frontend build (production only)
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendPath));
  
  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (req, res, next) => {
    // Skip API routes and specific endpoints
    if (req.path.startsWith('/api/') || req.path === '/health') {
      return next();
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
} else {
  // Development - API root route
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Magizh Industries API',
      status: 'running',
      version: '1.0.0',
      mode: 'development'
    });
  });
}

app.get('/favicon.ico', (req, res) => res.status(204).end());

// Health Check Endpoint for monitoring and load balancers
app.get('/health', (req, res) => {
  const healthCheck = {
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    memory: {
      used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`
    }
  };
  res.status(200).json(healthCheck);
});

// 404 Handler - Must be after all other routes
app.use(notFoundHandler);

// Error Handler - Must be last middleware
app.use(errorHandler);

// Port configuration (Cloud Run sets PORT=8080, development defaults to 5000)
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

// Start server - Must listen on 0.0.0.0 for Cloud Run
app.listen(PORT, HOST, () => {
  logger.info(`Server running on ${HOST}:${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use.`);
    logger.error(`stop the other process or use a different port.`);
    process.exit(1);
  } else {
    logger.error('Server error:', err);
    process.exit(1);
  }
});
