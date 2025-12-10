/**
 * Logger Utility - Comprehensive logging for R3SN
 * Supports multiple transports, log levels, and structured logging
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'r3sn' },
  transports: [
    // Error log file
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // Combined log file
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // Debug log file
    new winston.transports.File({
      filename: path.join(logsDir, 'debug.log'),
      level: 'debug',
      maxsize: 5242880, // 5MB
      maxFiles: 3
    })
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log')
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log')
    })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Helper methods
logger.logRequest = (req, res, duration) => {
  logger.info('HTTP Request', {
    method: req.method,
    url: req.url,
    status: res.statusCode,
    duration: `${duration}ms`,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
};

logger.logExecution = (type, id, status, duration, error = null) => {
  const logData = {
    type,
    id,
    status,
    duration: `${duration}ms`
  };

  if (error) {
    logData.error = error.message;
    logger.error('Execution Failed', logData);
  } else {
    logger.info('Execution Completed', logData);
  }
};

logger.logAgent = (agentId, action, result) => {
  logger.info('Agent Action', {
    agentId,
    action,
    success: result.success,
    executionTime: result.executionTime
  });
};

logger.logIntegration = (integrationId, action, result) => {
  logger.info('Integration Action', {
    integrationId,
    action,
    success: result.success
  });
};

logger.logWorkflow = (workflowId, status, duration) => {
  logger.info('Workflow Execution', {
    workflowId,
    status,
    duration: `${duration}ms`
  });
};

logger.logSecurity = (event, details) => {
  logger.warn('Security Event', {
    event,
    ...details,
    timestamp: new Date().toISOString()
  });
};

logger.logPerformance = (metric, value, unit = 'ms') => {
  logger.debug('Performance Metric', {
    metric,
    value,
    unit
  });
};

module.exports = logger;
