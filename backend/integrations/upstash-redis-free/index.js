const axios = require('axios');

/**
 * Upstash Redis Premium Integration
 * FREE Serverless Redis database
 * 10,000 commands/day FREE (worth $280/month)
 * Global edge caching, REST API, no connection limits
 */
class UpstashRedisIntegration {
  constructor(apiKey, email) {
    this.apiKey = apiKey || 'YOUR_UPSTASH_API_KEY';
    this.email = email || 'YOUR_EMAIL';
    this.baseURL = 'https://api.upstash.com';
  }

  /**
   * List all Redis databases
   */
  async listDatabases() {
    try {
      const response = await axios.get(`${this.baseURL}/v2/redis/databases`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return {
        success: true,
        data: response.data,
        databases: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a new Redis database
   */
  async createDatabase(name, region = 'us-east-1', tls = true) {
    try {
      const response = await axios.post(
        `${this.baseURL}/v2/redis/database`,
        {
          name,
          region,
          tls
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        database: response.data,
        endpoint: response.data.endpoint,
        restToken: response.data.rest_token
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get database details
   */
  async getDatabase(databaseId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/v2/redis/database/${databaseId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return {
        success: true,
        data: response.data,
        database: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete database
   */
  async deleteDatabase(databaseId) {
    try {
      const response = await axios.delete(
        `${this.baseURL}/v2/redis/database/${databaseId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Reset database password
   */
  async resetPassword(databaseId) {
    try {
      const response = await axios.post(
        `${this.baseURL}/v2/redis/database/${databaseId}/reset-password`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return {
        success: true,
        data: response.data,
        password: response.data.password
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get database stats
   */
  async getStats(databaseId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/v2/redis/stats/${databaseId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return {
        success: true,
        data: response.data,
        stats: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Execute Redis command via REST
   */
  async executeCommand(restUrl, restToken, command, ...args) {
    try {
      const response = await axios.post(
        `${restUrl}/${command}/${args.join('/')}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${restToken}`
          }
        }
      );

      return {
        success: true,
        result: response.data.result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * SET key value
   */
  async set(restUrl, restToken, key, value, ex = null) {
    try {
      const args = [key, value];
      if (ex) {
        args.push('EX', ex);
      }

      const response = await axios.post(
        `${restUrl}/set/${args.join('/')}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${restToken}`
          }
        }
      );

      return {
        success: true,
        result: response.data.result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * GET key
   */
  async get(restUrl, restToken, key) {
    try {
      const response = await axios.get(
        `${restUrl}/get/${key}`,
        {
          headers: {
            'Authorization': `Bearer ${restToken}`
          }
        }
      );

      return {
        success: true,
        result: response.data.result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * DEL key
   */
  async del(restUrl, restToken, ...keys) {
    try {
      const response = await axios.post(
        `${restUrl}/del/${keys.join('/')}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${restToken}`
          }
        }
      );

      return {
        success: true,
        result: response.data.result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * INCR key
   */
  async incr(restUrl, restToken, key) {
    try {
      const response = await axios.post(
        `${restUrl}/incr/${key}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${restToken}`
          }
        }
      );

      return {
        success: true,
        result: response.data.result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * LPUSH key value
   */
  async lpush(restUrl, restToken, key, ...values) {
    try {
      const response = await axios.post(
        `${restUrl}/lpush/${key}/${values.join('/')}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${restToken}`
          }
        }
      );

      return {
        success: true,
        result: response.data.result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * LRANGE key start stop
   */
  async lrange(restUrl, restToken, key, start, stop) {
    try {
      const response = await axios.get(
        `${restUrl}/lrange/${key}/${start}/${stop}`,
        {
          headers: {
            'Authorization': `Bearer ${restToken}`
          }
        }
      );

      return {
        success: true,
        result: response.data.result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * HSET key field value
   */
  async hset(restUrl, restToken, key, field, value) {
    try {
      const response = await axios.post(
        `${restUrl}/hset/${key}/${field}/${value}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${restToken}`
          }
        }
      );

      return {
        success: true,
        result: response.data.result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * HGET key field
   */
  async hget(restUrl, restToken, key, field) {
    try {
      const response = await axios.get(
        `${restUrl}/hget/${key}/${field}`,
        {
          headers: {
            'Authorization': `Bearer ${restToken}`
          }
        }
      );

      return {
        success: true,
        result: response.data.result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * HGETALL key
   */
  async hgetall(restUrl, restToken, key) {
    try {
      const response = await axios.get(
        `${restUrl}/hgetall/${key}`,
        {
          headers: {
            'Authorization': `Bearer ${restToken}`
          }
        }
      );

      return {
        success: true,
        result: response.data.result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * SADD key member
   */
  async sadd(restUrl, restToken, key, ...members) {
    try {
      const response = await axios.post(
        `${restUrl}/sadd/${key}/${members.join('/')}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${restToken}`
          }
        }
      );

      return {
        success: true,
        result: response.data.result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * SMEMBERS key
   */
  async smembers(restUrl, restToken, key) {
    try {
      const response = await axios.get(
        `${restUrl}/smembers/${key}`,
        {
          headers: {
            'Authorization': `Bearer ${restToken}`
          }
        }
      );

      return {
        success: true,
        result: response.data.result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * ZADD key score member
   */
  async zadd(restUrl, restToken, key, score, member) {
    try {
      const response = await axios.post(
        `${restUrl}/zadd/${key}/${score}/${member}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${restToken}`
          }
        }
      );

      return {
        success: true,
        result: response.data.result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * ZRANGE key start stop
   */
  async zrange(restUrl, restToken, key, start, stop) {
    try {
      const response = await axios.get(
        `${restUrl}/zrange/${key}/${start}/${stop}`,
        {
          headers: {
            'Authorization': `Bearer ${restToken}`
          }
        }
      );

      return {
        success: true,
        result: response.data.result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * EXPIRE key seconds
   */
  async expire(restUrl, restToken, key, seconds) {
    try {
      const response = await axios.post(
        `${restUrl}/expire/${key}/${seconds}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${restToken}`
          }
        }
      );

      return {
        success: true,
        result: response.data.result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * TTL key
   */
  async ttl(restUrl, restToken, key) {
    try {
      const response = await axios.get(
        `${restUrl}/ttl/${key}`,
        {
          headers: {
            'Authorization': `Bearer ${restToken}`
          }
        }
      );

      return {
        success: true,
        result: response.data.result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = UpstashRedisIntegration;
