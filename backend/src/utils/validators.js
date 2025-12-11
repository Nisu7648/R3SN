/**
 * Validation Utilities
 */

class Validators {
  /**
   * Validate email address
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate URL
   */
  static isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate JSON string
   */
  static isValidJSON(str) {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate workflow structure
   */
  static validateWorkflow(workflow) {
    const errors = [];

    if (!workflow) {
      errors.push('Workflow is required');
      return { valid: false, errors };
    }

    if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
      errors.push('Workflow must have nodes array');
    }

    if (workflow.nodes && workflow.nodes.length === 0) {
      errors.push('Workflow must have at least one node');
    }

    if (workflow.nodes) {
      workflow.nodes.forEach((node, index) => {
        if (!node.id) {
          errors.push(`Node at index ${index} missing id`);
        }
        if (!node.type) {
          errors.push(`Node at index ${index} missing type`);
        }
      });
    }

    if (workflow.connections && !Array.isArray(workflow.connections)) {
      errors.push('Connections must be an array');
    }

    if (workflow.connections) {
      workflow.connections.forEach((conn, index) => {
        if (!conn.source) {
          errors.push(`Connection at index ${index} missing source`);
        }
        if (!conn.target) {
          errors.push(`Connection at index ${index} missing target`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate node parameters
   */
  static validateNodeParameters(parameters, schema) {
    const errors = [];

    if (!schema || !Array.isArray(schema)) {
      return { valid: true, errors: [] };
    }

    schema.forEach(param => {
      if (param.required && !parameters[param.name]) {
        errors.push(`Parameter '${param.name}' is required`);
      }

      if (parameters[param.name] !== undefined) {
        const value = parameters[param.name];

        // Type validation
        if (param.type === 'number' && typeof value !== 'number') {
          errors.push(`Parameter '${param.name}' must be a number`);
        }

        if (param.type === 'boolean' && typeof value !== 'boolean') {
          errors.push(`Parameter '${param.name}' must be a boolean`);
        }

        if (param.type === 'array' && !Array.isArray(value)) {
          errors.push(`Parameter '${param.name}' must be an array`);
        }

        // Range validation
        if (param.min !== undefined && value < param.min) {
          errors.push(`Parameter '${param.name}' must be >= ${param.min}`);
        }

        if (param.max !== undefined && value > param.max) {
          errors.push(`Parameter '${param.name}' must be <= ${param.max}`);
        }

        // Options validation
        if (param.options && !param.options.includes(value)) {
          errors.push(`Parameter '${param.name}' must be one of: ${param.options.join(', ')}`);
        }
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitize string
   */
  static sanitizeString(str) {
    if (typeof str !== 'string') {
      return str;
    }

    return str
      .replace(/[<>]/g, '')
      .trim();
  }

  /**
   * Validate cron expression
   */
  static isValidCron(expression) {
    const cronRegex = /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/;
    return cronRegex.test(expression);
  }

  /**
   * Validate port number
   */
  static isValidPort(port) {
    const portNum = parseInt(port);
    return !isNaN(portNum) && portNum >= 1 && portNum <= 65535;
  }

  /**
   * Validate IP address
   */
  static isValidIP(ip) {
    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  }
}

module.exports = Validators;
