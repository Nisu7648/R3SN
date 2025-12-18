/**
 * AWS Lambda Serverless Computing Integration
 * Premium service - Save $100s on serverless infrastructure
 */

const AWS = require('aws-sdk');

class AWSLambdaIntegration {
  constructor(config) {
    this.accessKeyId = config.accessKeyId || process.env.AWS_ACCESS_KEY_ID;
    this.secretAccessKey = config.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY;
    this.region = config.region || process.env.AWS_REGION || 'us-east-1';
    
    if (!this.accessKeyId || !this.secretAccessKey) {
      throw new Error('AWS credentials required');
    }
    
    AWS.config.update({
      accessKeyId: this.accessKeyId,
      secretAccessKey: this.secretAccessKey,
      region: this.region
    });
    
    this.lambda = new AWS.Lambda();
  }

  async listFunctions(maxItems = 50) {
    try {
      const params = { MaxItems: maxItems };
      const result = await this.lambda.listFunctions(params).promise();
      
      return {
        success: true,
        functions: result.Functions.map(fn => ({
          name: fn.FunctionName,
          arn: fn.FunctionArn,
          runtime: fn.Runtime,
          handler: fn.Handler,
          codeSize: fn.CodeSize,
          timeout: fn.Timeout,
          memorySize: fn.MemorySize,
          lastModified: fn.LastModified
        }))
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getFunction(functionName) {
    try {
      const params = { FunctionName: functionName };
      const result = await this.lambda.getFunction(params).promise();
      
      return {
        success: true,
        function: result.Configuration,
        code: result.Code
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createFunction(functionName, runtime, handler, code, role, options = {}) {
    try {
      const params = {
        FunctionName: functionName,
        Runtime: runtime,
        Handler: handler,
        Code: code,
        Role: role,
        Timeout: options.timeout || 30,
        MemorySize: options.memorySize || 128,
        Description: options.description || '',
        Environment: options.environment || {},
        ...options
      };
      
      const result = await this.lambda.createFunction(params).promise();
      
      return {
        success: true,
        function: {
          name: result.FunctionName,
          arn: result.FunctionArn,
          runtime: result.Runtime,
          handler: result.Handler
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateFunctionCode(functionName, code) {
    try {
      const params = {
        FunctionName: functionName,
        ...code
      };
      
      const result = await this.lambda.updateFunctionCode(params).promise();
      
      return {
        success: true,
        function: {
          name: result.FunctionName,
          codeSize: result.CodeSize,
          lastModified: result.LastModified
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateFunctionConfiguration(functionName, config) {
    try {
      const params = {
        FunctionName: functionName,
        ...config
      };
      
      const result = await this.lambda.updateFunctionConfiguration(params).promise();
      
      return {
        success: true,
        function: result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async invokeFunction(functionName, payload = {}, invocationType = 'RequestResponse') {
    try {
      const params = {
        FunctionName: functionName,
        InvocationType: invocationType,
        Payload: JSON.stringify(payload)
      };
      
      const result = await this.lambda.invoke(params).promise();
      
      return {
        success: true,
        statusCode: result.StatusCode,
        payload: result.Payload ? JSON.parse(result.Payload) : null,
        executedVersion: result.ExecutedVersion
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteFunction(functionName) {
    try {
      const params = { FunctionName: functionName };
      await this.lambda.deleteFunction(params).promise();
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createAlias(functionName, aliasName, version) {
    try {
      const params = {
        FunctionName: functionName,
        Name: aliasName,
        FunctionVersion: version
      };
      
      const result = await this.lambda.createAlias(params).promise();
      
      return {
        success: true,
        alias: {
          name: result.Name,
          arn: result.AliasArn,
          version: result.FunctionVersion
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async listAliases(functionName) {
    try {
      const params = { FunctionName: functionName };
      const result = await this.lambda.listAliases(params).promise();
      
      return {
        success: true,
        aliases: result.Aliases
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async publishVersion(functionName, description = '') {
    try {
      const params = {
        FunctionName: functionName,
        Description: description
      };
      
      const result = await this.lambda.publishVersion(params).promise();
      
      return {
        success: true,
        version: {
          version: result.Version,
          arn: result.FunctionArn,
          codeSize: result.CodeSize
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async listVersions(functionName) {
    try {
      const params = { FunctionName: functionName };
      const result = await this.lambda.listVersionsByFunction(params).promise();
      
      return {
        success: true,
        versions: result.Versions
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async addPermission(functionName, statementId, principal, action, sourceArn = null) {
    try {
      const params = {
        FunctionName: functionName,
        StatementId: statementId,
        Principal: principal,
        Action: action
      };
      
      if (sourceArn) params.SourceArn = sourceArn;
      
      const result = await this.lambda.addPermission(params).promise();
      
      return {
        success: true,
        statement: result.Statement
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async removePermission(functionName, statementId) {
    try {
      const params = {
        FunctionName: functionName,
        StatementId: statementId
      };
      
      await this.lambda.removePermission(params).promise();
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getPolicy(functionName) {
    try {
      const params = { FunctionName: functionName };
      const result = await this.lambda.getPolicy(params).promise();
      
      return {
        success: true,
        policy: JSON.parse(result.Policy)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createEventSourceMapping(functionName, eventSourceArn, options = {}) {
    try {
      const params = {
        FunctionName: functionName,
        EventSourceArn: eventSourceArn,
        Enabled: options.enabled !== false,
        BatchSize: options.batchSize || 10,
        StartingPosition: options.startingPosition || 'LATEST',
        ...options
      };
      
      const result = await this.lambda.createEventSourceMapping(params).promise();
      
      return {
        success: true,
        mapping: result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async listEventSourceMappings(functionName) {
    try {
      const params = { FunctionName: functionName };
      const result = await this.lambda.listEventSourceMappings(params).promise();
      
      return {
        success: true,
        mappings: result.EventSourceMappings
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteEventSourceMapping(uuid) {
    try {
      const params = { UUID: uuid };
      await this.lambda.deleteEventSourceMapping(params).promise();
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getAccountSettings() {
    try {
      const result = await this.lambda.getAccountSettings().promise();
      
      return {
        success: true,
        settings: result.AccountLimit,
        usage: result.AccountUsage
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = AWSLambdaIntegration;
