/**
 * Security Middleware - Production-grade security hardening
 * Rate limiting, suspicious UA blocking, JSON schema validation
 */

const rateLimit = require('express-rate-limit');
const Joi = require('joi');

/**
 * Rate Limiter - 50 requests per minute per IP
 */
const createRateLimiter = (windowMs = 60000, max = 50) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      console.warn(`⚠️  Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        success: false,
        error: 'Too many requests',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

/**
 * Strict rate limiter for sensitive endpoints
 */
const strictRateLimiter = createRateLimiter(60000, 10);

/**
 * API rate limiter (50 req/min)
 */
const apiRateLimiter = createRateLimiter(60000, 50);

/**
 * Auth rate limiter (5 attempts per 15 minutes)
 */
const authRateLimiter = createRateLimiter(900000, 5);

/**
 * Suspicious User-Agent Blocker
 */
const suspiciousUserAgents = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
  /curl/i,
  /wget/i,
  /python-requests/i,
  /java/i,
  /go-http-client/i,
  /nikto/i,
  /sqlmap/i,
  /nmap/i,
  /masscan/i,
  /metasploit/i,
  /burp/i,
  /zap/i,
  /acunetix/i,
  /nessus/i,
  /openvas/i
];

const blockSuspiciousUA = (req, res, next) => {
  const userAgent = req.get('User-Agent') || '';
  
  // Allow empty UA for testing
  if (!userAgent && process.env.NODE_ENV === 'development') {
    return next();
  }

  // Check against suspicious patterns
  const isSuspicious = suspiciousUserAgents.some(pattern => pattern.test(userAgent));
  
  if (isSuspicious) {
    console.warn(`🚫 Blocked suspicious User-Agent: ${userAgent} from IP: ${req.ip}`);
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  next();
};

/**
 * JSON Schema Validator using Joi
 */
const validateSchema = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      console.warn(`⚠️  Validation failed for ${req.method} ${req.path}:`, errors);

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }

    // Replace request data with validated and sanitized data
    req[property] = value;
    next();
  };
};

/**
 * Common Joi Schemas
 */
const schemas = {
  // Agent schemas
  createAgent: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    type: Joi.string().valid('general', 'analyzer', 'executor', 'monitor').required(),
    config: Joi.object().default({}),
    capabilities: Joi.array().items(Joi.string()).default([]),
    metadata: Joi.object().default({})
  }),

  executePrompt: Joi.object({
    prompt: Joi.string().min(1).max(10000).required(),
    context: Joi.object().default({})
  }),

  // Workflow schemas
  createWorkflow: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(500).optional(),
    trigger: Joi.object({
      type: Joi.string().valid('manual', 'schedule', 'webhook', 'event').required(),
      config: Joi.object().default({})
    }).required(),
    steps: Joi.array().items(
      Joi.object({
        type: Joi.string().valid('agent', 'integration', 'plugin', 'condition', 'transform', 'delay').required(),
        action: Joi.string().optional(),
        parameters: Joi.object().default({}),
        continueOnError: Joi.boolean().default(false)
      })
    ).min(1).required(),
    config: Joi.object().default({})
  }),

  // Plugin schemas
  generatePlugin: Joi.object({
    appName: Joi.string().min(1).max(100).required(),
    appPackage: Joi.string().optional(),
    description: Joi.string().max(500).optional(),
    actions: Joi.array().items(Joi.string()).default([]),
    platform: Joi.string().valid('android', 'ios', 'web', 'desktop').default('android')
  }),

  executePlugin: Joi.object({
    action: Joi.string().min(1).required(),
    parameters: Joi.object().default({})
  }),

  // Auth schemas
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(128).required(),
    name: Joi.string().min(1).max(100).required()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  // Pagination schema
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    search: Joi.string().max(100).optional(),
    status: Joi.string().optional(),
    type: Joi.string().optional()
  })
};

/**
 * IP Whitelist/Blacklist
 */
const ipBlacklist = new Set();
const ipWhitelist = new Set();

const checkIPAccess = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;

  // Check whitelist first (if configured)
  if (ipWhitelist.size > 0 && !ipWhitelist.has(ip)) {
    console.warn(`🚫 IP not in whitelist: ${ip}`);
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  // Check blacklist
  if (ipBlacklist.has(ip)) {
    console.warn(`🚫 Blacklisted IP attempted access: ${ip}`);
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  next();
};

/**
 * Add IP to blacklist
 */
const blacklistIP = (ip) => {
  ipBlacklist.add(ip);
  console.log(`🚫 IP blacklisted: ${ip}`);
};

/**
 * Remove IP from blacklist
 */
const unblacklistIP = (ip) => {
  ipBlacklist.delete(ip);
  console.log(`✅ IP removed from blacklist: ${ip}`);
};

/**
 * Add IP to whitelist
 */
const whitelistIP = (ip) => {
  ipWhitelist.add(ip);
  console.log(`✅ IP whitelisted: ${ip}`);
};

/**
 * Request sanitization
 */
const sanitizeRequest = (req, res, next) => {
  // Remove potentially dangerous characters from query params
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key]
          .replace(/[<>]/g, '')
          .trim();
      }
    });
  }

  // Limit request body size
  const contentLength = parseInt(req.get('content-length') || '0');
  const maxSize = 50 * 1024 * 1024; // 50MB

  if (contentLength > maxSize) {
    return res.status(413).json({
      success: false,
      error: 'Request body too large'
    });
  }

  next();
};

/**
 * Security headers
 */
const securityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  
  // Remove powered by header
  res.removeHeader('X-Powered-By');

  next();
};

/**
 * CORS configuration
 */
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];
    
    if (allowedOrigins.includes('*') || !origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

/**
 * Request logging for security audit
 */
const securityLogger = (req, res, next) => {
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.userId || 'anonymous'
  };

  // Log sensitive operations
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    console.log('🔒 Security Log:', JSON.stringify(logData));
  }

  next();
};

module.exports = {
  // Rate limiters
  apiRateLimiter,
  strictRateLimiter,
  authRateLimiter,
  createRateLimiter,

  // Security middleware
  blockSuspiciousUA,
  checkIPAccess,
  sanitizeRequest,
  securityHeaders,
  securityLogger,

  // Validation
  validateSchema,
  schemas,

  // IP management
  blacklistIP,
  unblacklistIP,
  whitelistIP,

  // CORS
  corsOptions
};
