/**
 * Validation Middleware - Reusable validator wrapper
 * Provides easy-to-use validation for routes
 */

const Joi = require('joi');
const { ValidationError } = require('./errorHandler');

/**
 * Validate request data against Joi schema
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, ''),
        type: detail.type
      }));

      return next(new ValidationError('Validation failed', details));
    }

    // Replace request data with validated and sanitized data
    req[property] = value;
    next();
  };
};

/**
 * Validate multiple properties
 */
const validateMultiple = (schemas) => {
  return (req, res, next) => {
    const errors = [];

    for (const [property, schema] of Object.entries(schemas)) {
      const { error, value } = schema.validate(req[property], {
        abortEarly: false,
        stripUnknown: true,
        convert: true
      });

      if (error) {
        errors.push(...error.details.map(detail => ({
          property,
          field: detail.path.join('.'),
          message: detail.message.replace(/"/g, ''),
          type: detail.type
        })));
      } else {
        req[property] = value;
      }
    }

    if (errors.length > 0) {
      return next(new ValidationError('Validation failed', errors));
    }

    next();
  };
};

/**
 * Common validation schemas
 */
const commonSchemas = {
  id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).message('Invalid ID format'),
  email: Joi.string().email().lowercase().trim(),
  password: Joi.string().min(8).max(128),
  url: Joi.string().uri(),
  date: Joi.date().iso(),
  pagination: {
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  }
};

/**
 * Custom validators
 */
const customValidators = {
  /**
   * Validate MongoDB ObjectId
   */
  objectId: () => {
    return Joi.string().regex(/^[0-9a-fA-F]{24}$/).message('Invalid ObjectId');
  },

  /**
   * Validate array of ObjectIds
   */
  objectIdArray: () => {
    return Joi.array().items(
      Joi.string().regex(/^[0-9a-fA-F]{24}$/)
    );
  },

  /**
   * Validate cron expression
   */
  cronExpression: () => {
    return Joi.string().regex(
      /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/
    ).message('Invalid cron expression');
  },

  /**
   * Validate JSON string
   */
  jsonString: () => {
    return Joi.string().custom((value, helpers) => {
      try {
        JSON.parse(value);
        return value;
      } catch (error) {
        return helpers.error('any.invalid');
      }
    }).message('Invalid JSON string');
  },

  /**
   * Validate phone number
   */
  phoneNumber: () => {
    return Joi.string().regex(/^\+?[1-9]\d{1,14}$/).message('Invalid phone number');
  }
};

module.exports = {
  validate,
  validateMultiple,
  commonSchemas,
  customValidators,
  Joi
};
