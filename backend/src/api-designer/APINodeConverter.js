/**
 * API Node Converter - Convert API endpoints to workflow nodes
 */

class APINodeConverter {
  /**
   * Convert API to workflow nodes
   */
  convert(api) {
    const nodes = [];

    api.endpoints.forEach(endpoint => {
      const node = this.convertEndpoint(api, endpoint);
      nodes.push(node);
    });

    return nodes;
  }

  /**
   * Convert single endpoint to node
   */
  convertEndpoint(api, endpoint) {
    const nodeType = `api.${api.id}.${endpoint.id}`;
    
    const node = {
      type: nodeType,
      name: endpoint.name,
      description: endpoint.description,
      category: 'api',
      icon: '🔌',
      color: '#9C27B0',
      
      inputs: [
        {
          name: 'trigger',
          type: 'any',
          required: false
        }
      ],
      
      outputs: [
        {
          name: 'response',
          type: 'object'
        }
      ],
      
      parameters: this.generateParameters(api, endpoint),
      
      // Store API metadata
      metadata: {
        apiId: api.id,
        apiName: api.name,
        endpointId: endpoint.id,
        method: endpoint.method,
        path: endpoint.path,
        baseUrl: api.baseUrl
      },
      
      // Execute function
      execute: async (inputs, parameters, context) => {
        return await this.executeEndpoint(api, endpoint, parameters);
      }
    };

    return node;
  }

  /**
   * Generate node parameters from endpoint
   */
  generateParameters(api, endpoint) {
    const parameters = [];

    // Add authentication parameters
    if (api.authentication.type !== 'none') {
      parameters.push(...this.generateAuthParameters(api.authentication));
    }

    // Add path parameters
    const pathParams = this.extractPathParameters(endpoint.path);
    pathParams.forEach(param => {
      parameters.push({
        name: param,
        type: 'string',
        required: true,
        description: `Path parameter: ${param}`
      });
    });

    // Add query parameters
    endpoint.parameters
      .filter(p => p.in === 'query')
      .forEach(param => {
        parameters.push({
          name: param.name,
          type: param.type || 'string',
          required: param.required || false,
          description: param.description,
          default: param.default
        });
      });

    // Add header parameters
    endpoint.parameters
      .filter(p => p.in === 'header')
      .forEach(param => {
        parameters.push({
          name: `header_${param.name}`,
          type: param.type || 'string',
          required: param.required || false,
          description: `Header: ${param.description || param.name}`
        });
      });

    // Add body parameter for POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].includes(endpoint.method) && endpoint.body) {
      parameters.push({
        name: 'body',
        type: 'json',
        required: true,
        description: 'Request body',
        default: endpoint.body
      });
    }

    return parameters;
  }

  /**
   * Generate authentication parameters
   */
  generateAuthParameters(auth) {
    const params = [];

    switch (auth.type) {
      case 'bearer':
        params.push({
          name: 'bearerToken',
          type: 'string',
          required: true,
          description: 'Bearer token for authentication',
          sensitive: true
        });
        break;

      case 'apiKey':
        params.push({
          name: 'apiKey',
          type: 'string',
          required: true,
          description: 'API key for authentication',
          sensitive: true
        });
        break;

      case 'basic':
        params.push(
          {
            name: 'username',
            type: 'string',
            required: true,
            description: 'Username for basic auth'
          },
          {
            name: 'password',
            type: 'string',
            required: true,
            description: 'Password for basic auth',
            sensitive: true
          }
        );
        break;

      case 'oauth2':
        params.push({
          name: 'accessToken',
          type: 'string',
          required: true,
          description: 'OAuth2 access token',
          sensitive: true
        });
        break;
    }

    return params;
  }

  /**
   * Extract path parameters from path string
   */
  extractPathParameters(path) {
    const matches = path.match(/\{([^}]+)\}/g);
    return matches ? matches.map(m => m.slice(1, -1)) : [];
  }

  /**
   * Execute endpoint
   */
  async executeEndpoint(api, endpoint, parameters) {
    const axios = require('axios');

    // Build URL
    let url = `${api.baseUrl}${endpoint.path}`;
    
    // Replace path parameters
    const pathParams = this.extractPathParameters(endpoint.path);
    pathParams.forEach(param => {
      url = url.replace(`{${param}}`, parameters[param]);
    });

    // Build request config
    const config = {
      method: endpoint.method,
      url,
      headers: {},
      params: {}
    };

    // Add authentication
    this.addAuthentication(config, api.authentication, parameters);

    // Add query parameters
    endpoint.parameters
      .filter(p => p.in === 'query')
      .forEach(param => {
        if (parameters[param.name] !== undefined) {
          config.params[param.name] = parameters[param.name];
        }
      });

    // Add headers
    endpoint.parameters
      .filter(p => p.in === 'header')
      .forEach(param => {
        const paramName = `header_${param.name}`;
        if (parameters[paramName] !== undefined) {
          config.headers[param.name] = parameters[paramName];
        }
      });

    // Add body
    if (['POST', 'PUT', 'PATCH'].includes(endpoint.method) && parameters.body) {
      config.data = parameters.body;
    }

    try {
      const response = await axios(config);
      
      return {
        success: true,
        statusCode: response.status,
        headers: response.headers,
        data: response.data
      };
    } catch (error) {
      if (error.response) {
        return {
          success: false,
          statusCode: error.response.status,
          error: error.message,
          data: error.response.data
        };
      }
      throw error;
    }
  }

  /**
   * Add authentication to request
   */
  addAuthentication(config, auth, parameters) {
    switch (auth.type) {
      case 'bearer':
        config.headers['Authorization'] = `Bearer ${parameters.bearerToken}`;
        break;

      case 'apiKey':
        if (auth.in === 'header') {
          config.headers[auth.name] = parameters.apiKey;
        } else if (auth.in === 'query') {
          config.params[auth.name] = parameters.apiKey;
        }
        break;

      case 'basic':
        const credentials = Buffer.from(
          `${parameters.username}:${parameters.password}`
        ).toString('base64');
        config.headers['Authorization'] = `Basic ${credentials}`;
        break;

      case 'oauth2':
        config.headers['Authorization'] = `Bearer ${parameters.accessToken}`;
        break;
    }
  }

  /**
   * Generate node class code
   */
  generateNodeClass(api, endpoint) {
    const className = this.toCamelCase(endpoint.name) + 'Node';
    const nodeType = `api.${api.id}.${endpoint.id}`;

    return `
/**
 * ${endpoint.name} Node
 * Auto-generated from API: ${api.name}
 */

class ${className} {
  constructor() {
    this.type = '${nodeType}';
    this.name = '${endpoint.name}';
    this.description = '${endpoint.description}';
    this.category = 'api';
    this.icon = '🔌';
    this.color = '#9C27B0';
    
    this.inputs = ${JSON.stringify([{ name: 'trigger', type: 'any', required: false }], null, 2)};
    this.outputs = ${JSON.stringify([{ name: 'response', type: 'object' }], null, 2)};
    this.parameters = ${JSON.stringify(this.generateParameters(api, endpoint), null, 2)};
  }

  async execute(inputs, parameters, context) {
    // Implementation here
    const axios = require('axios');
    
    const url = '${api.baseUrl}${endpoint.path}';
    const config = {
      method: '${endpoint.method}',
      url,
      headers: {},
      params: {}
    };

    // Add your implementation here
    
    const response = await axios(config);
    return response.data;
  }
}

module.exports = ${className};
`;
  }

  /**
   * Convert string to camel case
   */
  toCamelCase(str) {
    return str
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
      .replace(/^./, chr => chr.toUpperCase());
  }
}

module.exports = APINodeConverter;
