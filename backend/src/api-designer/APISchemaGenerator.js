/**
 * API Schema Generator - Generate OpenAPI schemas
 */

class APISchemaGenerator {
  /**
   * Generate OpenAPI 3.0 schema from API design
   */
  generate(api) {
    const schema = {
      openapi: '3.0.0',
      info: {
        title: api.name,
        description: api.description,
        version: '1.0.0'
      },
      servers: [
        {
          url: api.baseUrl,
          description: 'API Server'
        }
      ],
      paths: {},
      components: {
        securitySchemes: this.generateSecuritySchemes(api.authentication),
        schemas: {}
      }
    };

    // Add endpoints
    api.endpoints.forEach(endpoint => {
      const path = endpoint.path;
      const method = endpoint.method.toLowerCase();

      if (!schema.paths[path]) {
        schema.paths[path] = {};
      }

      schema.paths[path][method] = this.generateEndpointSchema(endpoint);
    });

    return schema;
  }

  /**
   * Generate endpoint schema
   */
  generateEndpointSchema(endpoint) {
    const endpointSchema = {
      summary: endpoint.name,
      description: endpoint.description,
      operationId: endpoint.id,
      parameters: this.generateParameters(endpoint.parameters),
      responses: this.generateResponses(endpoint.response)
    };

    // Add request body if applicable
    if (['post', 'put', 'patch'].includes(endpoint.method.toLowerCase()) && endpoint.body) {
      endpointSchema.requestBody = this.generateRequestBody(endpoint.body);
    }

    // Add security if specified
    if (endpoint.authentication) {
      endpointSchema.security = [{ [endpoint.authentication]: [] }];
    }

    return endpointSchema;
  }

  /**
   * Generate parameters schema
   */
  generateParameters(parameters) {
    return parameters.map(param => ({
      name: param.name,
      in: param.in || 'query',
      description: param.description,
      required: param.required || false,
      schema: {
        type: param.type || 'string',
        default: param.default
      }
    }));
  }

  /**
   * Generate request body schema
   */
  generateRequestBody(body) {
    return {
      required: true,
      content: {
        'application/json': {
          schema: this.generateSchema(body)
        }
      }
    };
  }

  /**
   * Generate responses schema
   */
  generateResponses(response) {
    return {
      '200': {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: this.generateSchema(response)
          }
        }
      },
      '400': {
        description: 'Bad request'
      },
      '401': {
        description: 'Unauthorized'
      },
      '500': {
        description: 'Internal server error'
      }
    };
  }

  /**
   * Generate schema from object
   */
  generateSchema(obj) {
    if (!obj || typeof obj !== 'object') {
      return { type: 'object' };
    }

    const schema = {
      type: 'object',
      properties: {}
    };

    Object.entries(obj).forEach(([key, value]) => {
      schema.properties[key] = this.inferType(value);
    });

    return schema;
  }

  /**
   * Infer type from value
   */
  inferType(value) {
    if (Array.isArray(value)) {
      return {
        type: 'array',
        items: value.length > 0 ? this.inferType(value[0]) : { type: 'string' }
      };
    }

    if (value && typeof value === 'object') {
      return this.generateSchema(value);
    }

    const type = typeof value;
    
    return {
      type: type === 'number' ? (Number.isInteger(value) ? 'integer' : 'number') : type
    };
  }

  /**
   * Generate security schemes
   */
  generateSecuritySchemes(auth) {
    const schemes = {};

    switch (auth.type) {
      case 'bearer':
        schemes.bearerAuth = {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        };
        break;

      case 'apiKey':
        schemes.apiKeyAuth = {
          type: 'apiKey',
          in: auth.in || 'header',
          name: auth.name || 'X-API-Key'
        };
        break;

      case 'basic':
        schemes.basicAuth = {
          type: 'http',
          scheme: 'basic'
        };
        break;

      case 'oauth2':
        schemes.oauth2 = {
          type: 'oauth2',
          flows: {
            authorizationCode: {
              authorizationUrl: auth.authorizationUrl,
              tokenUrl: auth.tokenUrl,
              scopes: auth.scopes || {}
            }
          }
        };
        break;
    }

    return schemes;
  }

  /**
   * Parse OpenAPI schema to API design
   */
  parse(schema) {
    const api = {
      id: `api_${Date.now()}`,
      name: schema.info.title,
      description: schema.info.description,
      baseUrl: schema.servers?.[0]?.url || '',
      authentication: this.parseAuthentication(schema.components?.securitySchemes),
      endpoints: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Parse endpoints
    Object.entries(schema.paths || {}).forEach(([path, methods]) => {
      Object.entries(methods).forEach(([method, endpoint]) => {
        if (['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
          api.endpoints.push(this.parseEndpoint(path, method, endpoint));
        }
      });
    });

    return api;
  }

  /**
   * Parse endpoint from OpenAPI
   */
  parseEndpoint(path, method, endpoint) {
    return {
      id: endpoint.operationId || `${method}_${path}`,
      method: method.toUpperCase(),
      path,
      name: endpoint.summary || `${method.toUpperCase()} ${path}`,
      description: endpoint.description,
      parameters: endpoint.parameters || [],
      headers: [],
      body: endpoint.requestBody?.content?.['application/json']?.schema || null,
      response: endpoint.responses?.['200']?.content?.['application/json']?.schema || {}
    };
  }

  /**
   * Parse authentication from OpenAPI
   */
  parseAuthentication(securitySchemes) {
    if (!securitySchemes) {
      return { type: 'none' };
    }

    const [schemeName, scheme] = Object.entries(securitySchemes)[0] || [];

    if (!scheme) {
      return { type: 'none' };
    }

    switch (scheme.type) {
      case 'http':
        return {
          type: scheme.scheme === 'bearer' ? 'bearer' : 'basic'
        };

      case 'apiKey':
        return {
          type: 'apiKey',
          in: scheme.in,
          name: scheme.name
        };

      case 'oauth2':
        return {
          type: 'oauth2',
          flows: scheme.flows
        };

      default:
        return { type: 'none' };
    }
  }
}

module.exports = APISchemaGenerator;
