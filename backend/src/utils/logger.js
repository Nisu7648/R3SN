/**
 * Logger Utility - Comprehensive logging system
 */

const fs = require('fs');
const path = require('path');

class Logger {
  constructor(options = {}) {
    this.logLevel = options.logLevel || process.env.LOG_LEVEL || 'info';
    this.logFile = options.logFile || process.env.LOG_FILE || './logs/r3sn.log';
    this.enableConsole = options.enableConsole !== false;
    this.enableFile = options.enableFile !== false;

    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
      trace: 4
    };

    this.colors = {
      error: '\x1b[31m',
      warn: '\x1b[33m',
      info: '\x1b[36m',
      debug: '\x1b[35m',
      trace: '\x1b[90m',
      reset: '\x1b[0m'
    };

    // Ensure log directory exists
    if (this.enableFile) {
      const logDir = path.dirname(this.logFile);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
    }
  }

  /**
   * Check if level should be logged
   */
  shouldLog(level) {
    return this.levels[level] <= this.levels[this.logLevel];
  }

  /**
   * Format log message
   */
  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  /**
   * Write to console
   */
  writeConsole(level, message) {
    const color = this.colors[level] || this.colors.reset;
    console.log(`${color}${message}${this.colors.reset}`);
  }

  /**
   * Write to file
   */
  writeFile(message) {
    try {
      fs.appendFileSync(this.logFile, message + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  /**
   * Log message
   */
  log(level, message, meta = {}) {
    if (!this.shouldLog(level)) {
      return;
    }

    const formattedMessage = this.formatMessage(level, message, meta);

    if (this.enableConsole) {
      this.writeConsole(level, formattedMessage);
    }

    if (this.enableFile) {
      this.writeFile(formattedMessage);
    }
  }

  /**
   * Error log
   */
  error(message, meta = {}) {
    this.log('error', message, meta);
  }

  /**
   * Warning log
   */
  warn(message, meta = {}) {
    this.log('warn', message, meta);
  }

  /**
   * Info log
   */
  info(message, meta = {}) {
    this.log('info', message, meta);
  }

  /**
   * Debug log
   */
  debug(message, meta = {}) {
    this.log('debug', message, meta);
  }

  /**
   * Trace log
   */
  trace(message, meta = {}) {
    this.log('trace', message, meta);
  }

  /**
   * Log execution time
   */
  time(label) {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      this.debug(`${label} took ${duration}ms`);
      return duration;
    };
  }

  /**
   * Clear log file
   */
  clear() {
    if (this.enableFile && fs.existsSync(this.logFile)) {
      fs.writeFileSync(this.logFile, '');
      this.info('Log file cleared');
    }
  }
}

// Create default logger instance
const logger = new Logger();

module.exports = logger;
module.exports.Logger = Logger;
