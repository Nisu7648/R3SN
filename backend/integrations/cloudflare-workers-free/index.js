const axios = require('axios');

/**
 * Cloudflare Workers Premium Integration
 * FREE serverless computing platform
 * 100,000 requests/day FREE (worth $200/month)
 * Deploy edge functions globally in 200+ cities
 */
class CloudflareWorkersIntegration {
  constructor(apiToken, accountId) {
    this.apiToken = apiToken || 'YOUR_CLOUDFLARE_API_TOKEN';
    this.accountId = accountId || 'YOUR_ACCOUNT_ID';
    this.baseURL = 'https://api.cloudflare.com/client/v4';
  }

  /**
   * List all Workers scripts
   */
  async listWorkers() {
    try {
      const response = await axios.get(
        `${this.baseURL}/accounts/${this.accountId}/workers/scripts`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        workers: response.data.result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Deploy a Worker script
   * @param {string} scriptName - Name of the worker
   * @param {string} scriptContent - JavaScript code
   */
  async deployWorker(scriptName, scriptContent) {
    try {
      const response = await axios.put(
        `${this.baseURL}/accounts/${this.accountId}/workers/scripts/${scriptName}`,
        scriptContent,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/javascript'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        script: response.data.result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get Worker script details
   */
  async getWorker(scriptName) {
    try {
      const response = await axios.get(
        `${this.baseURL}/accounts/${this.accountId}/workers/scripts/${scriptName}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        script: response.data.result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a Worker script
   */
  async deleteWorker(scriptName) {
    try {
      const response = await axios.delete(
        `${this.baseURL}/accounts/${this.accountId}/workers/scripts/${scriptName}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json'
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
   * Create Worker route
   */
  async createRoute(zoneId, pattern, scriptName) {
    try {
      const response = await axios.post(
        `${this.baseURL}/zones/${zoneId}/workers/routes`,
        {
          pattern,
          script: scriptName
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        route: response.data.result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List Worker routes
   */
  async listRoutes(zoneId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/zones/${zoneId}/workers/routes`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        routes: response.data.result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create KV namespace
   */
  async createKVNamespace(title) {
    try {
      const response = await axios.post(
        `${this.baseURL}/accounts/${this.accountId}/storage/kv/namespaces`,
        { title },
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        namespace: response.data.result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List KV namespaces
   */
  async listKVNamespaces() {
    try {
      const response = await axios.get(
        `${this.baseURL}/accounts/${this.accountId}/storage/kv/namespaces`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        namespaces: response.data.result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Write KV value
   */
  async writeKV(namespaceId, key, value, expirationTtl = null) {
    try {
      const params = expirationTtl ? { expiration_ttl: expirationTtl } : {};
      
      const response = await axios.put(
        `${this.baseURL}/accounts/${this.accountId}/storage/kv/namespaces/${namespaceId}/values/${key}`,
        value,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'text/plain'
          },
          params
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
   * Read KV value
   */
  async readKV(namespaceId, key) {
    try {
      const response = await axios.get(
        `${this.baseURL}/accounts/${this.accountId}/storage/kv/namespaces/${namespaceId}/values/${key}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`
          }
        }
      );

      return {
        success: true,
        value: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete KV value
   */
  async deleteKV(namespaceId, key) {
    try {
      const response = await axios.delete(
        `${this.baseURL}/accounts/${this.accountId}/storage/kv/namespaces/${namespaceId}/values/${key}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`
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
   * List KV keys
   */
  async listKVKeys(namespaceId, prefix = null, limit = 1000) {
    try {
      const params = { limit };
      if (prefix) params.prefix = prefix;

      const response = await axios.get(
        `${this.baseURL}/accounts/${this.accountId}/storage/kv/namespaces/${namespaceId}/keys`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`
          },
          params
        }
      );

      return {
        success: true,
        data: response.data,
        keys: response.data.result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get Worker analytics
   */
  async getAnalytics(scriptName, since = null, until = null) {
    try {
      const params = {};
      if (since) params.since = since;
      if (until) params.until = until;

      const response = await axios.get(
        `${this.baseURL}/accounts/${this.accountId}/workers/scripts/${scriptName}/analytics`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`
          },
          params
        }
      );

      return {
        success: true,
        data: response.data,
        analytics: response.data.result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create Durable Object namespace
   */
  async createDurableObjectNamespace(name, scriptName, className) {
    try {
      const response = await axios.post(
        `${this.baseURL}/accounts/${this.accountId}/workers/durable_objects/namespaces`,
        {
          name,
          script: scriptName,
          class: className
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        namespace: response.data.result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List Durable Object namespaces
   */
  async listDurableObjectNamespaces() {
    try {
      const response = await axios.get(
        `${this.baseURL}/accounts/${this.accountId}/workers/durable_objects/namespaces`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`
          }
        }
      );

      return {
        success: true,
        data: response.data,
        namespaces: response.data.result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get account usage
   */
  async getUsage() {
    try {
      const response = await axios.get(
        `${this.baseURL}/accounts/${this.accountId}/workers/usage`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`
          }
        }
      );

      return {
        success: true,
        data: response.data,
        usage: response.data.result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = CloudflareWorkersIntegration;
