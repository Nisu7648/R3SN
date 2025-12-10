const redis = require('redis');
const config = require('../config/config');
const logger = require('./logger');

class CacheManager {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    if (this.isConnected) return;

    try {
      this.client = redis.createClient(config.database.redis);

      this.client.on('error', (err) => {
        logger.error('Redis error:', err);
      });

      this.client.on('connect', () => {
        logger.info('Redis connected');
        this.isConnected = true;
      });

      this.client.on('disconnect', () => {
        logger.warn('Redis disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
      logger.info('Redis disconnected');
    }
  }

  async get(key) {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set(key, value, ttl = 300) {
    try {
      const serialized = JSON.stringify(value);
      await this.client.setEx(key, ttl, serialized);
      return true;
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  async exists(key) {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  async flush() {
    try {
      await this.client.flushDb();
      logger.info('Cache flushed');
      return true;
    } catch (error) {
      logger.error('Cache flush error:', error);
      return false;
    }
  }

  async keys(pattern = '*') {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      logger.error(`Cache keys error for pattern ${pattern}:`, error);
      return [];
    }
  }

  async mget(keys) {
    try {
      const values = await this.client.mGet(keys);
      return values.map(v => v ? JSON.parse(v) : null);
    } catch (error) {
      logger.error('Cache mget error:', error);
      return [];
    }
  }

  async mset(keyValuePairs, ttl = 300) {
    try {
      const pipeline = this.client.multi();
      for (const [key, value] of Object.entries(keyValuePairs)) {
        const serialized = JSON.stringify(value);
        pipeline.setEx(key, ttl, serialized);
      }
      await pipeline.exec();
      return true;
    } catch (error) {
      logger.error('Cache mset error:', error);
      return false;
    }
  }

  async increment(key, amount = 1) {
    try {
      return await this.client.incrBy(key, amount);
    } catch (error) {
      logger.error(`Cache increment error for key ${key}:`, error);
      return null;
    }
  }

  async decrement(key, amount = 1) {
    try {
      return await this.client.decrBy(key, amount);
    } catch (error) {
      logger.error(`Cache decrement error for key ${key}:`, error);
      return null;
    }
  }

  async expire(key, ttl) {
    try {
      await this.client.expire(key, ttl);
      return true;
    } catch (error) {
      logger.error(`Cache expire error for key ${key}:`, error);
      return false;
    }
  }

  async ttl(key) {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      logger.error(`Cache ttl error for key ${key}:`, error);
      return -1;
    }
  }

  // Cache wrapper for functions
  async wrap(key, fn, ttl = 300) {
    const cached = await this.get(key);
    if (cached !== null) {
      logger.info(`Cache hit for key: ${key}`);
      return cached;
    }

    logger.info(`Cache miss for key: ${key}`);
    const result = await fn();
    await this.set(key, result, ttl);
    return result;
  }

  // Generate cache key
  generateKey(...parts) {
    return parts.filter(Boolean).join(':');
  }

  // Clear cache by pattern
  async clearPattern(pattern) {
    try {
      const keys = await this.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
        logger.info(`Cleared ${keys.length} keys matching pattern: ${pattern}`);
      }
      return keys.length;
    } catch (error) {
      logger.error(`Cache clear pattern error for ${pattern}:`, error);
      return 0;
    }
  }
}

// Create singleton instance
const cache = new CacheManager();

module.exports = cache;
