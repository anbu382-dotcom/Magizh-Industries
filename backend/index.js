const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const logger = require('./utils/logger');
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
  : ['http://localhost:3000', 'http://localhost:5000'];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or curl)
    // or if the origin is in the allowed list
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Security Middleware - Helmet (Adjusted for React/Vite compatibility)
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP in production to allow Vite's hashed assets
  crossOriginEmbedderPolicy: false,
}));

// Logging Middleware
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// --- STATIC FILES (BEFORE CORS) ---
// In production, we serve from the 'dist' folder that was copied into backend/
const frontendPath = path.join(__dirname, 'dist');

// Log the static file path for debugging
logger.info(`Static files path: ${frontendPath}`);
if (fs.existsSync(frontendPath)) {
  logger.info(`Static files directory exists: ${frontendPath}`);
  const assetsPath = path.join(frontendPath, 'assets');
  if (fs.existsSync(assetsPath)) {
    const files = fs.readdirSync(assetsPath);
    logger.info(`Found ${files.length} files in assets directory: ${files.join(', ')}`);
  } else {
    logger.warn(`Assets directory not found: ${assetsPath}`);
  }
} else {
  logger.error(`Static files directory does not exist: ${frontendPath}`);
}

// Serve static assets with proper MIME types and caching
// Important: This must come BEFORE the catch-all route
app.use(express.static(frontendPath, {
  maxAge: '1y',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    // Ensure proper MIME types for JavaScript modules
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    }
  }
}));

// CORS and JSON parsing only for API routes
app.use('/api', cors(corsOptions));
app.use(express.json());

// --- API ROUTES ---
app.use('/api/auth', signupRoutes);
app.use('/api/auth', loginRoutes);
app.use('/api/auth', approvalRoutes);
app.use('/api/user', userRoutes);
app.use('/api/master', masterRoutes);
app.use('/api/archive', archiveRoutes);
app.use('/api/stock', stockEntryRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// The "Catch-all" handler: Send index.html for SPA routing
// This should only catch routes that don't match static files or API routes
app.get('*', (req, res) => {
  // If the request is for an API that doesn't exist, return a 404 JSON instead of index.html
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API endpoint not found' });
  }
  
  // Check if this is a request for a static asset file
  // If it is, the static middleware should have handled it, but if we reach here,
  // the file doesn't exist - return 404 instead of index.html
  const staticAssetExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.woff', '.woff2', '.ttf', '.eot', '.json'];
  const isStaticAsset = req.path.startsWith('/assets/') || 
                        staticAssetExtensions.some(ext => req.path.endsWith(ext));
  
  if (isStaticAsset) {
    logger.warn(`Static asset not found: ${req.path}`);
    return res.status(404).json({ message: 'Static asset not found' });
  }
  
  // Send the React app for all other routes (SPA routing)
  res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
    if (err) {
      logger.error('Error sending index.html:', err);
      res.status(500).send('An error occurred loading the application.');
    }
  });
});

// Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on ${HOST}:${PORT}`);
  logger.info(`Static files being served from: ${frontendPath}`);
});