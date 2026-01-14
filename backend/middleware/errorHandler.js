const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  // Log error using winston library 
  logger.error('Error occurred:', {
    message: err.message,
    statusCode,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    ...(isProduction ? {} : { stack: err.stack })
  });

  // Prepare error response
  const errorResponse = {
    success: false,
    message: err.message || 'Internal Server Error',
    statusCode,
  };

  // Add stack trace only in development
  if (!isProduction && err.stack) {
    errorResponse.stack = err.stack;
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    errorResponse.message = 'Validation Error';
    errorResponse.errors = err.errors;
  }

  if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    errorResponse.message = 'Unauthorized - Invalid or expired token';
  }

  if (err.code === 'ECONNREFUSED') {
    errorResponse.message = 'Service temporarily unavailable';
  }

  // Firebase specific errors
  if (err.code && err.code.startsWith('auth/')) {
    errorResponse.message = 'Authentication error';
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = {
  errorHandler,
  notFoundHandler
};
