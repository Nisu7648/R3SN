/**
 * HTTP Request Node - Make HTTP/API calls
 */

const axios = require('axios');

class HttpRequestNode {
  constructor() {
    this.type = 'http.request';
    this.name = 'HTTP Request';
    this.description = 'Make HTTP requests to APIs';
    this.category = 'network';
    this.icon = '🌐';
    this.color = '#4CAF50';

    this.inputs = [
      {
        name: 'trigger',
        type: 'any',
        required: false
      }
    ];

    this.outputs = [
      {
        name: 'response',
        type: 'object'
      }
    ];

    this.parameters = [
      {
        name: 'method',
        type: 'select',
        options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
        default: 'GET',
        required: true
      },
      {
        name: 'url',
        type: 'string',
        required: true,
        placeholder: 'https://api.example.com/endpoint'
      },
      {
        name: 'headers',
        type: 'json',
        default: {},
        placeholder: '{"Content-Type": "application/json"}'
      },
      {
        name: 'queryParams',
        type: 'json',
        default: {},
        placeholder: '{"key": "value"}'
      },
      {
        name: 'body',
        type: 'json',
        default: null,
        placeholder: '{"data": "value"}'
      },
      {
        name: 'timeout',
        type: 'number',
        default: 30000,
        description: 'Request timeout in milliseconds'
      },
      {
        name: 'followRedirects',
        type: 'boolean',
        default: true
      },
      {
        name: 'validateStatus',
        type: 'boolean',
        default: false,
        description: 'Throw error on non-2xx status codes'
      }
    ];
  }

  /**
   * Execute the node
   */
  async execute(inputs, parameters, context) {
    const {
      method,
      url,
      headers = {},
      queryParams = {},
      body,
      timeout,
      followRedirects,
      validateStatus
    } = parameters;

    try {
      const config = {
        method: method.toUpperCase(),
        url,
        headers,
        params: queryParams,
        timeout,
        maxRedirects: followRedirects ? 5 : 0,
        validateStatus: validateStatus ? (status) => status >= 200 && status < 300 : () => true
      };

      // Add body for methods that support it
      if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && body) {
        config.data = body;
      }

      const response = await axios(config);

      return {
        statusCode: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
        success: response.status >= 200 && response.status < 300
      };

    } catch (error) {
      if (error.response) {
        // Server responded with error status
        return {
          statusCode: error.response.status,
          statusText: error.response.statusText,
          headers: error.response.headers,
          data: error.response.data,
          error: error.message,
          success: false
        };
      } else {
        // Network error or timeout
        throw new Error(`HTTP Request failed: ${error.message}`);
      }
    }
  }
}

module.exports = HttpRequestNode;
