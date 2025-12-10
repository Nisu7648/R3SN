/**
 * Helper Utilities - Common utility functions for R3SN
 */

const crypto = require('crypto');

/**
 * Generate unique ID
 */
function generateId(prefix = '') {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
}

/**
 * Generate secure random string
 */
function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash password or sensitive data
 */
function hashData(data, algorithm = 'sha256') {
  return crypto.createHash(algorithm).update(data).digest('hex');
}

/**
 * Encrypt data
 */
function encrypt(text, key) {
  const algorithm = 'aes-256-cbc';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, 'hex'), iv);
  
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted.toString('hex')
  };
}

/**
 * Decrypt data
 */
function decrypt(encryptedData, key, iv) {
  const algorithm = 'aes-256-cbc';
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(key, 'hex'),
    Buffer.from(iv, 'hex')
  );
  
  let decrypted = decipher.update(Buffer.from(encryptedData, 'hex'));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  return decrypted.toString();
}

/**
 * Sleep/delay function
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
async function retry(fn, options = {}) {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = 2,
    onRetry = null
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxAttempts) {
        throw error;
      }

      const waitTime = delay * Math.pow(backoff, attempt - 1);
      
      if (onRetry) {
        onRetry(attempt, maxAttempts, waitTime, error);
      }

      await sleep(waitTime);
    }
  }

  throw lastError;
}

/**
 * Debounce function
 */
function debounce(func, wait) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
function throttle(func, limit) {
  let inThrottle;
  
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Deep clone object
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Merge objects deeply
 */
function deepMerge(target, ...sources) {
  if (!sources.length) return target;
  
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
}

/**
 * Check if value is object
 */
function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format duration to human readable
 */
function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(2)}m`;
  return `${(ms / 3600000).toFixed(2)}h`;
}

/**
 * Validate email
 */
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validate URL
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize string
 */
function sanitizeString(str) {
  return str.replace(/[<>]/g, '').trim();
}

/**
 * Parse JSON safely
 */
function parseJSON(str, defaultValue = null) {
  try {
    return JSON.parse(str);
  } catch {
    return defaultValue;
  }
}

/**
 * Get nested property safely
 */
function getNestedProperty(obj, path, defaultValue = undefined) {
  const keys = path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return defaultValue;
    }
  }

  return result;
}

/**
 * Chunk array
 */
function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Remove duplicates from array
 */
function uniqueArray(array) {
  return [...new Set(array)];
}

/**
 * Group array by key
 */
function groupBy(array, key) {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
}

/**
 * Calculate percentage
 */
function calculatePercentage(value, total) {
  if (total === 0) return 0;
  return ((value / total) * 100).toFixed(2);
}

/**
 * Generate random number in range
 */
function randomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Truncate string
 */
function truncate(str, length, suffix = '...') {
  if (str.length <= length) return str;
  return str.substring(0, length) + suffix;
}

/**
 * Capitalize first letter
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert to camelCase
 */
function toCamelCase(str) {
  return str.replace(/[-_](.)/g, (_, c) => c.toUpperCase());
}

/**
 * Convert to snake_case
 */
function toSnakeCase(str) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

module.exports = {
  generateId,
  generateSecureToken,
  hashData,
  encrypt,
  decrypt,
  sleep,
  retry,
  debounce,
  throttle,
  deepClone,
  deepMerge,
  isObject,
  formatBytes,
  formatDuration,
  isValidEmail,
  isValidUrl,
  sanitizeString,
  parseJSON,
  getNestedProperty,
  chunkArray,
  uniqueArray,
  groupBy,
  calculatePercentage,
  randomInRange,
  truncate,
  capitalize,
  toCamelCase,
  toSnakeCase
};
