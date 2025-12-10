const Joi = require('joi');
const { ValidationError } = require('./errorHandler');

// Common validation schemas
const schemas = {
  objectId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).message('Invalid ID format'),
  email: Joi.string().email().lowercase().trim(),
  password: Joi.string().min(8).max(128),
  url: Joi.string().uri(),
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),
};

// Workflow validation
const workflowSchema = Joi.object({
  name: Joi.string().required().min(3).max(100),
  description: Joi.string().max(500),
  nodes: Joi.array().items(
    Joi.object({
      id: Joi.string().required(),
      type: Joi.string().required(),
      config: Joi.object().required(),
      position: Joi.object({
        x: Joi.number().required(),
        y: Joi.number().required(),
      }),
    })
  ).min(1).required(),
  edges: Joi.array().items(
    Joi.object({
      source: Joi.string().required(),
      target: Joi.string().required(),
      condition: Joi.string(),
    })
  ),
  settings: Joi.object({
    timeout: Joi.number().integer().min(1000).max(3600000),
    retryAttempts: Joi.number().integer().min(0).max(10),
    retryDelay: Joi.number().integer().min(100).max(60000),
  }),
  tags: Joi.array().items(Joi.string()),
  enabled: Joi.boolean().default(true),
});

// Agent validation
const agentSchema = Joi.object({
  name: Joi.string().required().min(3).max(100),
  description: Joi.string().max(500),
  type: Joi.string().valid('executor', 'analyzer', 'optimizer', 'custom').required(),
  config: Joi.object().required(),
  capabilities: Joi.array().items(Joi.string()),
  enabled: Joi.boolean().default(true),
});

// Integration validation
const integrationSchema = Joi.object({
  name: Joi.string().required().min(3).max(100),
  type: Joi.string().required(),
  credentials: Joi.object().required(),
  config: Joi.object(),
  enabled: Joi.boolean().default(true),
});

// Plugin validation
const pluginSchema = Joi.object({
  name: Joi.string().required().min(3).max(100),
  version: Joi.string().required().pattern(/^\d+\.\d+\.\d+$/),
  description: Joi.string().max(500),
  author: Joi.string().required(),
  nodes: Joi.array().items(
    Joi.object({
      type: Joi.string().required(),
      category: Joi.string().required(),
      displayName: Joi.string().required(),
      description: Joi.string(),
      inputs: Joi.array(),
      outputs: Joi.array(),
    })
  ).min(1).required(),
  permissions: Joi.array().items(Joi.string()),
});

// User validation
const userSchema = Joi.object({
  email: schemas.email.required(),
  password: schemas.password.required(),
  name: Joi.string().min(2).max(100),
  role: Joi.string().valid('user', 'admin', 'developer').default('user'),
});

// Login validation
const loginSchema = Joi.object({
  email: schemas.email.required(),
  password: Joi.string().required(),
});

// Execution validation
const executionSchema = Joi.object({
  workflowId: schemas.objectId.required(),
  input: Joi.object(),
  context: Joi.object(),
  priority: Joi.number().integer().min(1).max(10).default(5),
});

// API Designer validation
const apiDesignerSchema = Joi.object({
  name: Joi.string().required().min(3).max(100),
  baseUrl: schemas.url.required(),
  authentication: Joi.object({
    type: Joi.string().valid('none', 'apiKey', 'bearer', 'oauth2', 'basic').required(),
    config: Joi.object(),
  }),
  endpoints: Joi.array().items(
    Joi.object({
      path: Joi.string().required(),
      method: Joi.string().valid('GET', 'POST', 'PUT', 'PATCH', 'DELETE').required(),
      description: Joi.string(),
      parameters: Joi.array(),
      headers: Joi.object(),
      body: Joi.object(),
    })
  ).min(1).required(),
});

// Validation middleware factory
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      throw new ValidationError('Validation failed', errors);
    }

    req[property] = value;
    next();
  };
};

// Custom validators
const validators = {
  isValidCronExpression: (value) => {
    const cronRegex = /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/;
    return cronRegex.test(value);
  },

  isValidJSON: (value) => {
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  },

  isValidWorkflowGraph: (nodes, edges) => {
    // Check for cycles
    const visited = new Set();
    const recursionStack = new Set();

    const hasCycle = (nodeId) => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const outgoingEdges = edges.filter(e => e.source === nodeId);
      for (const edge of outgoingEdges) {
        if (!visited.has(edge.target)) {
          if (hasCycle(edge.target)) return true;
        } else if (recursionStack.has(edge.target)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        if (hasCycle(node.id)) {
          return { valid: false, error: 'Workflow contains cycles' };
        }
      }
    }

    // Check for orphaned nodes
    const connectedNodes = new Set();
    edges.forEach(edge => {
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    });

    const orphanedNodes = nodes.filter(n => !connectedNodes.has(n.id) && nodes.length > 1);
    if (orphanedNodes.length > 0) {
      return { valid: false, error: 'Workflow contains orphaned nodes' };
    }

    return { valid: true };
  },
};

module.exports = {
  schemas,
  workflowSchema,
  agentSchema,
  integrationSchema,
  pluginSchema,
  userSchema,
  loginSchema,
  executionSchema,
  apiDesignerSchema,
  validate,
  validators,
};
