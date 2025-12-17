/**
 * Dynamic API Builder - Build ANY API from Natural Language
 * Users can add new APIs just by describing them in plain text
 */

const axios = require('axios');
const OpenAIAPI = require('../integrations/apis/OpenAIAPI');

class DynamicAPIBuilder {
    constructor() {
        this.openai = new OpenAIAPI();
        this.customAPIs = new Map();
        this.apiTemplates = new Map();
        this.initializeTemplates();
    }

    /**
     * Initialize common API templates
     */
    initializeTemplates() {
        this.apiTemplates.set('rest', {
            type: 'REST',
            authTypes: ['none', 'apikey', 'bearer', 'basic', 'oauth2'],
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
        });

        this.apiTemplates.set('graphql', {
            type: 'GraphQL',
            authTypes: ['none', 'bearer', 'apikey'],
            methods: ['QUERY', 'MUTATION', 'SUBSCRIPTION']
        });

        this.apiTemplates.set('soap', {
            type: 'SOAP',
            authTypes: ['none', 'basic', 'wsse'],
            methods: ['POST']
        });
    }

    /**
     * Build API from natural language description
     */
    async buildAPIFromPrompt(prompt, userId) {
        console.log(`Building API from prompt: ${prompt}`);

        // Use AI to understand the API requirements
        const apiSpec = await this.analyzeAPIPrompt(prompt);

        // Generate API client code
        const apiCode = await this.generateAPICode(apiSpec);

        // Create and register the API
        const apiInstance = await this.createAPIInstance(apiCode, apiSpec);

        // Store for user
        const apiId = `custom_${Date.now()}_${userId}`;
        this.customAPIs.set(apiId, {
            id: apiId,
            userId,
            name: apiSpec.name,
            description: apiSpec.description,
            spec: apiSpec,
            code: apiCode,
            instance: apiInstance,
            createdAt: new Date()
        });

        return {
            success: true,
            apiId,
            name: apiSpec.name,
            description: apiSpec.description,
            endpoints: apiSpec.endpoints,
            usage: this.generateUsageExamples(apiSpec)
        };
    }

    /**
     * Analyze API prompt using AI
     */
    async analyzeAPIPrompt(prompt) {
        const systemPrompt = `You are an API specification expert. Analyze the user's description and extract:
1. API name
2. Base URL
3. Authentication type (none, apikey, bearer, basic, oauth2)
4. Authentication details (header name, parameter name, etc.)
5. Available endpoints with methods, paths, parameters, and descriptions
6. Request/response formats

Return a JSON object with this structure:
{
    "name": "API Name",
    "description": "What this API does",
    "baseUrl": "https://api.example.com",
    "auth": {
        "type": "bearer|apikey|basic|oauth2|none",
        "headerName": "Authorization",
        "prefix": "Bearer",
        "paramName": "api_key"
    },
    "endpoints": [
        {
            "name": "endpoint_name",
            "method": "GET|POST|PUT|DELETE",
            "path": "/path/{param}",
            "description": "What it does",
            "parameters": {
                "path": ["param1"],
                "query": ["param2"],
                "body": ["field1", "field2"]
            },
            "example": {
                "request": {},
                "response": {}
            }
        }
    ]
}`;

        const response = await this.openai.chat([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
        ], 'gpt-4');

        const content = response.choices[0].message.content;
        
        // Extract JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Could not parse API specification from AI response');
        }

        return JSON.parse(jsonMatch[0]);
    }

    /**
     * Generate API client code
     */
    async generateAPICode(apiSpec) {
        const codePrompt = `Generate a complete, production-ready JavaScript API client class for this specification:

${JSON.stringify(apiSpec, null, 2)}

Requirements:
1. Use axios for HTTP requests
2. Handle authentication properly
3. Include error handling
4. Add JSDoc comments
5. Support all endpoints
6. Return clean, working code

Generate ONLY the JavaScript class code, no explanations.`;

        const response = await this.openai.chat([
            { role: 'system', content: 'You are an expert JavaScript developer. Generate clean, production-ready code.' },
            { role: 'user', content: codePrompt }
        ], 'gpt-4');

        let code = response.choices[0].message.content;

        // Extract code from markdown if present
        const codeMatch = code.match(/```(?:javascript|js)?\n([\s\S]*?)\n```/);
        if (codeMatch) {
            code = codeMatch[1];
        }

        return code;
    }

    /**
     * Create API instance from generated code
     */
    async createAPIInstance(code, apiSpec) {
        try {
            // Create a safe execution context
            const module = { exports: {} };
            const require = (name) => {
                if (name === 'axios') return axios;
                throw new Error(`Module ${name} not available`);
            };

            // Execute the generated code
            const func = new Function('module', 'exports', 'require', code);
            func(module, module.exports, require);

            // Get the class
            const APIClass = module.exports;

            // Create instance
            return new APIClass();
        } catch (error) {
            console.error('Error creating API instance:', error);
            throw new Error(`Failed to create API instance: ${error.message}`);
        }
    }

    /**
     * Execute API call
     */
    async executeAPICall(apiId, endpointName, params = {}) {
        const api = this.customAPIs.get(apiId);
        if (!api) {
            throw new Error(`API ${apiId} not found`);
        }

        const endpoint = api.spec.endpoints.find(e => e.name === endpointName);
        if (!endpoint) {
            throw new Error(`Endpoint ${endpointName} not found in API ${api.name}`);
        }

        try {
            // Call the method on the API instance
            const methodName = this.getMethodName(endpoint);
            const result = await api.instance[methodName](...Object.values(params));

            return {
                success: true,
                data: result
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get method name from endpoint
     */
    getMethodName(endpoint) {
        // Convert endpoint name to camelCase method name
        return endpoint.name.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    }

    /**
     * Generate usage examples
     */
    generateUsageExamples(apiSpec) {
        const examples = [];

        for (const endpoint of apiSpec.endpoints) {
            const params = [];
            
            if (endpoint.parameters.path) {
                params.push(...endpoint.parameters.path.map(p => `'${p}_value'`));
            }
            if (endpoint.parameters.query) {
                params.push(...endpoint.parameters.query.map(p => `'${p}_value'`));
            }
            if (endpoint.parameters.body) {
                params.push(`{ ${endpoint.parameters.body.map(f => `${f}: 'value'`).join(', ')} }`);
            }

            examples.push({
                endpoint: endpoint.name,
                description: endpoint.description,
                code: `await api.${this.getMethodName(endpoint)}(${params.join(', ')})`
            });
        }

        return examples;
    }

    /**
     * List user's custom APIs
     */
    listUserAPIs(userId) {
        const userAPIs = [];

        for (const [id, api] of this.customAPIs) {
            if (api.userId === userId) {
                userAPIs.push({
                    id: api.id,
                    name: api.name,
                    description: api.description,
                    endpoints: api.spec.endpoints.map(e => ({
                        name: e.name,
                        method: e.method,
                        path: e.path,
                        description: e.description
                    })),
                    createdAt: api.createdAt
                });
            }
        }

        return userAPIs;
    }

    /**
     * Get API details
     */
    getAPI(apiId) {
        const api = this.customAPIs.get(apiId);
        if (!api) return null;

        return {
            id: api.id,
            name: api.name,
            description: api.description,
            spec: api.spec,
            code: api.code,
            usage: this.generateUsageExamples(api.spec),
            createdAt: api.createdAt
        };
    }

    /**
     * Update API
     */
    async updateAPI(apiId, updates) {
        const api = this.customAPIs.get(apiId);
        if (!api) {
            throw new Error(`API ${apiId} not found`);
        }

        // Merge updates into spec
        Object.assign(api.spec, updates);

        // Regenerate code
        api.code = await this.generateAPICode(api.spec);

        // Recreate instance
        api.instance = await this.createAPIInstance(api.code, api.spec);

        return {
            success: true,
            message: 'API updated successfully'
        };
    }

    /**
     * Delete API
     */
    deleteAPI(apiId) {
        const deleted = this.customAPIs.delete(apiId);
        return {
            success: deleted,
            message: deleted ? 'API deleted successfully' : 'API not found'
        };
    }

    /**
     * Test API endpoint
     */
    async testEndpoint(apiId, endpointName, params = {}) {
        try {
            const result = await this.executeAPICall(apiId, endpointName, params);
            return {
                success: true,
                result,
                timestamp: new Date()
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                timestamp: new Date()
            };
        }
    }

    /**
     * Import API from OpenAPI/Swagger spec
     */
    async importFromOpenAPI(openApiSpec, userId) {
        // Convert OpenAPI spec to our format
        const apiSpec = this.convertOpenAPISpec(openApiSpec);

        // Generate code
        const apiCode = await this.generateAPICode(apiSpec);

        // Create instance
        const apiInstance = await this.createAPIInstance(apiCode, apiSpec);

        // Store
        const apiId = `imported_${Date.now()}_${userId}`;
        this.customAPIs.set(apiId, {
            id: apiId,
            userId,
            name: apiSpec.name,
            description: apiSpec.description,
            spec: apiSpec,
            code: apiCode,
            instance: apiInstance,
            createdAt: new Date()
        });

        return {
            success: true,
            apiId,
            name: apiSpec.name
        };
    }

    /**
     * Convert OpenAPI spec to our format
     */
    convertOpenAPISpec(openApiSpec) {
        const spec = {
            name: openApiSpec.info.title,
            description: openApiSpec.info.description,
            baseUrl: openApiSpec.servers?.[0]?.url || '',
            auth: this.extractAuthFromOpenAPI(openApiSpec),
            endpoints: []
        };

        // Convert paths to endpoints
        for (const [path, methods] of Object.entries(openApiSpec.paths)) {
            for (const [method, details] of Object.entries(methods)) {
                if (['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
                    spec.endpoints.push({
                        name: details.operationId || `${method}_${path.replace(/\//g, '_')}`,
                        method: method.toUpperCase(),
                        path,
                        description: details.summary || details.description,
                        parameters: this.extractParametersFromOpenAPI(details)
                    });
                }
            }
        }

        return spec;
    }

    /**
     * Extract auth from OpenAPI spec
     */
    extractAuthFromOpenAPI(spec) {
        const securitySchemes = spec.components?.securitySchemes || {};
        const firstScheme = Object.values(securitySchemes)[0];

        if (!firstScheme) {
            return { type: 'none' };
        }

        switch (firstScheme.type) {
            case 'apiKey':
                return {
                    type: 'apikey',
                    headerName: firstScheme.name,
                    paramName: firstScheme.name
                };
            case 'http':
                return {
                    type: firstScheme.scheme === 'bearer' ? 'bearer' : 'basic',
                    headerName: 'Authorization',
                    prefix: firstScheme.scheme === 'bearer' ? 'Bearer' : 'Basic'
                };
            case 'oauth2':
                return {
                    type: 'oauth2',
                    headerName: 'Authorization',
                    prefix: 'Bearer'
                };
            default:
                return { type: 'none' };
        }
    }

    /**
     * Extract parameters from OpenAPI endpoint
     */
    extractParametersFromOpenAPI(details) {
        const params = {
            path: [],
            query: [],
            body: []
        };

        if (details.parameters) {
            for (const param of details.parameters) {
                if (param.in === 'path') {
                    params.path.push(param.name);
                } else if (param.in === 'query') {
                    params.query.push(param.name);
                }
            }
        }

        if (details.requestBody) {
            const schema = details.requestBody.content?.['application/json']?.schema;
            if (schema?.properties) {
                params.body = Object.keys(schema.properties);
            }
        }

        return params;
    }

    /**
     * Export API as code
     */
    exportAPI(apiId, format = 'javascript') {
        const api = this.customAPIs.get(apiId);
        if (!api) {
            throw new Error(`API ${apiId} not found`);
        }

        switch (format) {
            case 'javascript':
                return {
                    format: 'javascript',
                    code: api.code,
                    filename: `${api.name.replace(/\s+/g, '')}API.js`
                };
            case 'json':
                return {
                    format: 'json',
                    code: JSON.stringify(api.spec, null, 2),
                    filename: `${api.name.replace(/\s+/g, '')}.json`
                };
            case 'openapi':
                return {
                    format: 'openapi',
                    code: JSON.stringify(this.convertToOpenAPI(api.spec), null, 2),
                    filename: `${api.name.replace(/\s+/g, '')}-openapi.json`
                };
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }

    /**
     * Convert to OpenAPI spec
     */
    convertToOpenAPI(spec) {
        const openapi = {
            openapi: '3.0.0',
            info: {
                title: spec.name,
                description: spec.description,
                version: '1.0.0'
            },
            servers: [{ url: spec.baseUrl }],
            paths: {}
        };

        for (const endpoint of spec.endpoints) {
            if (!openapi.paths[endpoint.path]) {
                openapi.paths[endpoint.path] = {};
            }

            openapi.paths[endpoint.path][endpoint.method.toLowerCase()] = {
                summary: endpoint.description,
                operationId: endpoint.name,
                parameters: [
                    ...endpoint.parameters.path.map(p => ({
                        name: p,
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    })),
                    ...endpoint.parameters.query.map(p => ({
                        name: p,
                        in: 'query',
                        schema: { type: 'string' }
                    }))
                ],
                responses: {
                    '200': {
                        description: 'Successful response'
                    }
                }
            };
        }

        return openapi;
    }
}

module.exports = DynamicAPIBuilder;
