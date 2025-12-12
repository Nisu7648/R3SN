/**
 * Error Handler Middleware - Safe error serialization
 * Production-grade error handling with security considerations
 */

/**
 * Custom Error Classes
 */
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = []) {
    super(message, 400);
    this.details = details;
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403);
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429);
  }
}

/**
 * Safe error serialization - removes sensitive data
 */
const serializeError = (error, includeStack = false) => {
  const serialized = {
    success: false,
    error: error.message || 'An error occurred',
    timestamp: error.timestamp || new Date().toISOString()
  };

  if (error.statusCode) serialized.statusCode = error.statusCode;
  if (error.details) serialized.details = error.details;
  if (includeStack && process.env.NODE_ENV !== 'production') {
    serialized.stack = error.stack;
  }
  if (error.code) serialized.code = error.code;

  return serialized;
};

/**
 * Log error with appropriate level
 */
const logError = (error, req) => {
  const logData = {
    timestamp: new Date().toISOString(),
    error: error.message,
    statusCode: error.statusCode || 500,
    path: req?.path,
    method: req?.method,
    ip: req?.ip,
    userId: req?.userId || 'anonymous'
  };

  if (error.isOperational) {
    console.warn('⚠️  Operational Error:', JSON.stringify(logData));
  } else {
    console.error('❌ Programming Error:', JSON.stringify(logData));
    if (process.env.NODE_ENV !== 'production') {
      console.error(error.stack);
    }
  }
};

/**
 * Main error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  logError(err, req);

  const includeStack = process.env.NODE_ENV !== 'production';
  let statusCode = err.statusCode || 500;
  let serializedError = serializeError(err, includeStack);

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    serializedError = {
      success: false,
      error: 'Validation failed',
      details: Object.values(err.errors).map(e => ({
        field: e.path,
        message: e.message
      }))
    };
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern)[0];
    serializedError = {
      success: false,
      error: `${field} already exists`
    };
  }

  // Handle Mongoose cast errors
  if (err.name === 'CastError') {
    statusCode = 400;
    serializedError = {
      success: false,
      error: `Invalid ${err.path}: ${err.value}`
    };
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    serializedError = { success: false, error: 'Invalid token' };
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    serializedError = { success: false, error: 'Token expired' };
  }

  // Handle multer errors
  if (err.name === 'MulterError') {
    statusCode = 400;
    serializedError = {
      success: false,
      error: `File upload error: ${err.message}`
    };
  }

  res.status(statusCode).json(serializedError);
};

/**
 * 404 Not Found handler
 */
const notFound = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.originalUrl}`);
  next(error);
};

/**
 * Async handler wrapper
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Initialize error handlers
 */
const initializeErrorHandlers = (server, db) => {
  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection:', reason);
  });

  process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
  });

  const shutdown = async (signal) => {
    console.log(`\n🛑 ${signal} received, shutting down...`);
    server.close(async () => {
      console.log('✅ HTTP server closed');
      if (db && db.disconnect) {
        await db.disconnect();
        console.log('✅ Database disconnected');
      }
      process.exit(0);
    });

    setTimeout(() => {
      console.error('❌ Forced shutdown');
      process.exit(1);
    }, 30000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  errorHandler,
  notFound,
  asyncHandler,
  serializeError,
  logError,
  initializeErrorHandlers
};
