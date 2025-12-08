/**
 * API Designer - Design and generate custom APIs
 */

const APISchemaGenerator = require('./APISchemaGenerator');
const APINodeConverter = require('./APINodeConverter');

class APIDesigner {
  constructor() {
    this.apis = new Map();
    this.schemaGenerator = new APISchemaGenerator();
    this.nodeConverter = new APINodeConverter();
  }

  /**
   * Create a new API design
   */
  createAPI(config) {
    const {
      id,
      name,
      description,
      baseUrl,
      authentication,
      endpoints = []
    } = config;

    const api = {
      id: id || this.generateId(),
      name,
      description,
      baseUrl,
      authentication: authentication || { type: 'none' },
      endpoints: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add endpoints
    endpoints.forEach(endpoint => {
      this.addEndpoint(api, endpoint);
    });

    this.apis.set(api.id, api);

    console.log(`✅ Created API: ${name}`);

    return api;
  }

  /**
   * Add endpoint to API
   */
  addEndpoint(api, endpointConfig) {
    const endpoint = {
      id: this.generateId(),
      method: endpointConfig.method || 'GET',
      path: endpointConfig.path,
      name: endpointConfig.name,
      description: endpointConfig.description,
      parameters: endpointConfig.parameters || [],
      headers: endpointConfig.headers || [],
      body: endpointConfig.body || null,
      response: endpointConfig.response || {},
      authentication: endpointConfig.authentication || null
    };

    api.endpoints.push(endpoint);
    api.updatedAt = new Date().toISOString();

    return endpoint;
  }

  /**
   * Generate OpenAPI schema from API design
   */
  generateSchema(apiId) {
    const api = this.apis.get(apiId);
    
    if (!api) {
      throw new Error(`API not found: ${apiId}`);
    }

    return this.schemaGenerator.generate(api);
  }

  /**
   * Convert API to workflow nodes
   */
  convertToNodes(apiId) {
    const api = this.apis.get(apiId);
    
    if (!api) {
      throw new Error(`API not found: ${apiId}`);
    }

    return this.nodeConverter.convert(api);
  }

  /**
   * Import API from OpenAPI/Swagger schema
   */
  importFromSchema(schema) {
    const api = this.schemaGenerator.parse(schema);
    this.apis.set(api.id, api);
    
    console.log(`✅ Imported API: ${api.name}`);
    
    return api;
  }

  /**
   * Import API from URL (fetch OpenAPI schema)
   */
  async importFromURL(url) {
    const axios = require('axios');
    
    try {
      const response = await axios.get(url);
      return this.importFromSchema(response.data);
    } catch (error) {
      throw new Error(`Failed to import API from URL: ${error.message}`);
    }
  }

  /**
   * Test API endpoint
   */
  async testEndpoint(apiId, endpointId, testData = {}) {
    const api = this.apis.get(apiId);
    
    if (!api) {
      throw new Error(`API not found: ${apiId}`);
    }

    const endpoint = api.endpoints.find(e => e.id === endpointId);
    
    if (!endpoint) {
      throw new Error(`Endpoint not found: ${endpointId}`);
    }

    const axios = require('axios');

    // Build request
    const url = `${api.baseUrl}${endpoint.path}`;
    const config = {
      method: endpoint.method,
      url,
      headers: this.buildHeaders(api, endpoint, testData.headers),
      params: testData.params || {},
      data: testData.body || endpoint.body
    };

    // Add authentication
    this.addAuthentication(config, api.authentication, testData.auth);

    try {
      const response = await axios(config);
      
      return {
        success: true,
        status: response.status,
        headers: response.headers,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      };
    }
  }

  /**
   * Build headers for request
   */
  buildHeaders(api, endpoint, customHeaders = {}) {
    const headers = {};

    // Add default headers
    endpoint.headers.forEach(header => {
      if (header.default) {
        headers[header.name] = header.default;
      }
    });

    // Add custom headers
    Object.assign(headers, customHeaders);

    return headers;
  }

  /**
   * Add authentication to request
   */
  addAuthentication(config, authConfig, authData = {}) {
    switch (authConfig.type) {
      case 'bearer':
        config.headers['Authorization'] = `Bearer ${authData.token || authConfig.token}`;
        break;
      
      case 'apiKey':
        if (authConfig.in === 'header') {
          config.headers[authConfig.name] = authData.apiKey || authConfig.apiKey;
        } else if (authConfig.in === 'query') {
          config.params[authConfig.name] = authData.apiKey || authConfig.apiKey;
        }
        break;
      
      case 'basic':
        const credentials = Buffer.from(
          `${authData.username || authConfig.username}:${authData.password || authConfig.password}`
        ).toString('base64');
        config.headers['Authorization'] = `Basic ${credentials}`;
        break;
      
      case 'oauth2':
        config.headers['Authorization'] = `Bearer ${authData.accessToken}`;
        break;
    }
  }

  /**
   * Get API
   */
  getAPI(apiId) {
    return this.apis.get(apiId);
  }

  /**
   * Get all APIs
   */
  getAllAPIs() {
    return Array.from(this.apis.values());
  }

  /**
   * Update API
   */
  updateAPI(apiId, updates) {
    const api = this.apis.get(apiId);
    
    if (!api) {
      throw new Error(`API not found: ${apiId}`);
    }

    Object.assign(api, updates);
    api.updatedAt = new Date().toISOString();

    return api;
  }

  /**
   * Delete API
   */
  deleteAPI(apiId) {
    const deleted = this.apis.delete(apiId);
    
    if (!deleted) {
      throw new Error(`API not found: ${apiId}`);
    }

    console.log(`✅ Deleted API: ${apiId}`);
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Export API as JSON
   */
  exportAPI(apiId) {
    const api = this.apis.get(apiId);
    
    if (!api) {
      throw new Error(`API not found: ${apiId}`);
    }

    return JSON.stringify(api, null, 2);
  }

  /**
   * Import API from JSON
   */
  importAPI(jsonData) {
    const api = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    
    this.apis.set(api.id, api);
    
    console.log(`✅ Imported API: ${api.name}`);
    
    return api;
  }
}

module.exports = APIDesigner;
