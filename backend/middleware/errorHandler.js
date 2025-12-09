const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  const error = {
    success: false,
    error: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR'
  };

  if (process.env.NODE_ENV === 'development') {
    error.stack = err.stack;
    error.details = err.details;
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json(error);
};

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const notFound = (req, res, next) => {
  const error = new AppError(`Not found - ${req.originalUrl}`, 404, 'NOT_FOUND');
  next(error);
};

module.exports = {
  errorHandler,
  asyncHandler,
  AppError,
  notFound
};
