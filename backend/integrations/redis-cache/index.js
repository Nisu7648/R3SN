/**
 * Redis Caching & Real-time Data Integration
 */

const Redis = require('ioredis');

class RedisIntegration {
  constructor(config) {
    this.host = config.host || process.env.REDIS_HOST || 'localhost';
    this.port = config.port || process.env.REDIS_PORT || 6379;
    this.password = config.password || process.env.REDIS_PASSWORD;
    this.db = config.db || process.env.REDIS_DB || 0;
    
    this.client = new Redis({
      host: this.host,
      port: this.port,
      password: this.password,
      db: this.db
    });
  }

  async set(key, value, expirySeconds = null) {
    try {
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      
      if (expirySeconds) {
        await this.client.setex(key, expirySeconds, stringValue);
      } else {
        await this.client.set(key, stringValue);
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async get(key) {
    try {
      const value = await this.client.get(key);
      
      if (!value) {
        return { success: true, value: null };
      }
      
      try {
        return { success: true, value: JSON.parse(value) };
      } catch {
        return { success: true, value };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async delete(key) {
    try {
      await this.client.del(key);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async exists(key) {
    try {
      const exists = await this.client.exists(key);
      return { success: true, exists: exists === 1 };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async expire(key, seconds) {
    try {
      await this.client.expire(key, seconds);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async ttl(key) {
    try {
      const ttl = await this.client.ttl(key);
      return { success: true, ttl };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async increment(key, amount = 1) {
    try {
      const value = await this.client.incrby(key, amount);
      return { success: true, value };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async decrement(key, amount = 1) {
    try {
      const value = await this.client.decrby(key, amount);
      return { success: true, value };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async listPush(key, ...values) {
    try {
      const stringValues = values.map(v => 
        typeof v === 'object' ? JSON.stringify(v) : String(v)
      );
      await this.client.lpush(key, ...stringValues);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async listPop(key) {
    try {
      const value = await this.client.lpop(key);
      if (!value) return { success: true, value: null };
      
      try {
        return { success: true, value: JSON.parse(value) };
      } catch {
        return { success: true, value };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async listRange(key, start = 0, stop = -1) {
    try {
      const values = await this.client.lrange(key, start, stop);
      const parsed = values.map(v => {
        try {
          return JSON.parse(v);
        } catch {
          return v;
        }
      });
      return { success: true, values: parsed };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async setAdd(key, ...members) {
    try {
      const stringMembers = members.map(m => 
        typeof m === 'object' ? JSON.stringify(m) : String(m)
      );
      await this.client.sadd(key, ...stringMembers);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async setMembers(key) {
    try {
      const members = await this.client.smembers(key);
      const parsed = members.map(m => {
        try {
          return JSON.parse(m);
        } catch {
          return m;
        }
      });
      return { success: true, members: parsed };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async hashSet(key, field, value) {
    try {
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      await this.client.hset(key, field, stringValue);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async hashGet(key, field) {
    try {
      const value = await this.client.hget(key, field);
      if (!value) return { success: true, value: null };
      
      try {
        return { success: true, value: JSON.parse(value) };
      } catch {
        return { success: true, value };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async hashGetAll(key) {
    try {
      const hash = await this.client.hgetall(key);
      const parsed = {};
      for (const [field, value] of Object.entries(hash)) {
        try {
          parsed[field] = JSON.parse(value);
        } catch {
          parsed[field] = value;
        }
      }
      return { success: true, hash: parsed };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async keys(pattern = '*') {
    try {
      const keys = await this.client.keys(pattern);
      return { success: true, keys };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async flushAll() {
    try {
      await this.client.flushall();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async disconnect() {
    try {
      await this.client.quit();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = RedisIntegration;
