const rateLimit = require('express-rate-limit');

const createRateLimiter = (options = {}) => {
  const config = {
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    message: {
      success: false,
      error: 'Too many requests, please try again later',
      retryAfter: options.windowMs || 15 * 60 * 1000
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: 'Too many requests',
        message: 'You have exceeded the rate limit. Please try again later.',
        retryAfter: Math.ceil(options.windowMs / 1000)
      });
    }
  };

  return rateLimit(config);
};

const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100
});

const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5
});

const executionLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10
});

const strictLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 3
});

module.exports = {
  apiLimiter,
  authLimiter,
  executionLimiter,
  strictLimiter,
  createRateLimiter
};
