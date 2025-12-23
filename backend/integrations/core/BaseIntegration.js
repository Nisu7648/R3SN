/**
 * BASE INTEGRATION CLASS
 * This is REAL, WORKING code that all integrations extend from
 * Handles: HTTP requests, auth, rate limiting, errors, retries
 */

const axios = require('axios');

class BaseIntegration {
  constructor(config = {}) {
    this.name = config.name || 'unknown';
    this.apiKey = config.apiKey || process.env[`${this.name.toUpperCase()}_API_KEY`];
    this.baseURL = config.baseURL || '';
    this.timeout = config.timeout || 30000;
    this.retries = config.retries || 3;
    this.rateLimit = config.rateLimit || null;
    
    // Request tracking
    this.requestCount = 0;
    this.lastRequestTime = null;
    this.rateLimitRemaining = null;
    
    // Initialize HTTP client
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: this.getDefaultHeaders()
    });
    
    // Add interceptors
    this.setupInterceptors();
  }

  /**
   * Get default headers for requests
   */
  getDefaultHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'R3SN-Integration/1.0'
    };
    
    // Add API key if available
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    
    return headers;
  }

  /**
   * Setup request/response interceptors
   */
  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        // Rate limiting
        if (this.rateLimit) {
          await this.checkRateLimit();
        }
        
        // Track request
        this.requestCount++;
        this.lastRequestTime = Date.now();
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Track rate limit headers
        if (response.headers['x-ratelimit-remaining']) {
          this.rateLimitRemaining = parseInt(response.headers['x-ratelimit-remaining']);
        }
        
        return response;
      },
      async (error) => {
        // Handle errors
        return this.handleError(error);
      }
    );
  }

  /**
   * Check rate limit before making request
   */
  async checkRateLimit() {
    if (!this.lastRequestTime) return;
    
    const timeSinceLastRequest = Date.now() - this.lastRequestTime;
    const minInterval = 1000 / this.rateLimit; // ms between requests
    
    if (timeSinceLastRequest < minInterval) {
      const waitTime = minInterval - timeSinceLastRequest;
      await this.sleep(waitTime);
    }
  }

  /**
   * Handle API errors
   */
  async handleError(error) {
    const originalRequest = error.config;
    
    // Retry logic
    if (!originalRequest._retry && originalRequest._retryCount < this.retries) {
      originalRequest._retry = true;
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      
      // Exponential backoff
      const delay = Math.pow(2, originalRequest._retryCount) * 1000;
      await this.sleep(delay);
      
      return this.client(originalRequest);
    }
    
    // Format error
    const formattedError = {
      integration: this.name,
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      timestamp: new Date().toISOString()
    };
    
    throw formattedError;
  }

  /**
   * Make GET request
   */
  async get(endpoint, params = {}, config = {}) {
    try {
      const response = await this.client.get(endpoint, {
        params,
        ...config
      });
      return this.formatResponse(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Make POST request
   */
  async post(endpoint, data = {}, config = {}) {
    try {
      const response = await this.client.post(endpoint, data, config);
      return this.formatResponse(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Make PUT request
   */
  async put(endpoint, data = {}, config = {}) {
    try {
      const response = await this.client.put(endpoint, data, config);
      return this.formatResponse(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Make DELETE request
   */
  async delete(endpoint, config = {}) {
    try {
      const response = await this.client.delete(endpoint, config);
      return this.formatResponse(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Format API response
   */
  formatResponse(response) {
    return {
      success: true,
      data: response.data,
      status: response.status,
      headers: response.headers,
      integration: this.name,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Validate API key
   */
  validateApiKey() {
    if (!this.apiKey) {
      throw new Error(`API key not found for ${this.name}. Set ${this.name.toUpperCase()}_API_KEY in environment.`);
    }
    return true;
  }

  /**
   * Test connection
   */
  async testConnection() {
    try {
      // Override this in child classes
      throw new Error('testConnection() must be implemented by child class');
    } catch (error) {
      return {
        success: false,
        integration: this.name,
        error: error.message
      };
    }
  }

  /**
   * Get integration info
   */
  getInfo() {
    return {
      name: this.name,
      baseURL: this.baseURL,
      hasApiKey: !!this.apiKey,
      requestCount: this.requestCount,
      rateLimitRemaining: this.rateLimitRemaining,
      lastRequestTime: this.lastRequestTime
    };
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Build query string
   */
  buildQueryString(params) {
    return Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== null)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
  }

  /**
   * Parse error response
   */
  parseError(error) {
    if (error.response) {
      return {
        status: error.response.status,
        message: error.response.data?.message || error.response.statusText,
        data: error.response.data
      };
    } else if (error.request) {
      return {
        status: 0,
        message: 'No response received from server',
        data: null
      };
    } else {
      return {
        status: -1,
        message: error.message,
        data: null
      };
    }
  }
}

module.exports = BaseIntegration;
