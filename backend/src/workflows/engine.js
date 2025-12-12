/**
 * Workflow Engine
 * Sequential step execution with retry logic and configurable backoff
 */

const fs = require('fs').promises;
const path = require('path');
const EventEmitter = require('events');

class WorkflowEngine extends EventEmitter {
  constructor() {
    super();
    this.workflows = new Map();
    this.executions = new Map();
    this.dataPath = path.join(__dirname, '../../data/workflows.json');
    this.executionsPath = path.join(__dirname, '../../data/workflow-executions.json');
    this.isInitialized = false;
  }

  /**
   * Initialize engine and load persisted workflows
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      const dataDir = path.dirname(this.dataPath);
      await fs.mkdir(dataDir, { recursive: true });

      // Load workflows
      try {
        const data = await fs.readFile(this.dataPath, 'utf8');
        const savedWorkflows = JSON.parse(data);
        
        for (const workflow of savedWorkflows) {
          this.workflows.set(workflow.id, workflow);
        }
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }

      // Load executions
      try {
        const data = await fs.readFile(this.executionsPath, 'utf8');
        const savedExecutions = JSON.parse(data);
        
        for (const execution of savedExecutions) {
          this.executions.set(execution.id, execution);
        }
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }

      this.isInitialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize WorkflowEngine: ${error.message}`);
    }
  }

  /**
   * Persist workflows to disk
   */
  async persistWorkflows() {
    try {
      const workflowsArray = Array.from(this.workflows.values());
      await fs.writeFile(
        this.dataPath,
        JSON.stringify(workflowsArray, null, 2),
        'utf8'
      );
    } catch (error) {
      throw new Error(`Failed to persist workflows: ${error.message}`);
    }
  }

  /**
   * Persist executions to disk
   */
  async persistExecutions() {
    try {
      const executionsArray = Array.from(this.executions.values());
      
      // Keep only last 1000 executions
      const recentExecutions = executionsArray
        .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))
        .slice(0, 1000);
      
      await fs.writeFile(
        this.executionsPath,
        JSON.stringify(recentExecutions, null, 2),
        'utf8'
      );
    } catch (error) {
      throw new Error(`Failed to persist executions: ${error.message}`);
    }
  }

  /**
   * Create new workflow
   */
  async createWorkflow(config) {
    await this.initialize();

    const { name, description, steps = [], config: workflowConfig = {} } = config;

    if (!name) {
      throw new Error('Workflow name is required');
    }

    if (!Array.isArray(steps) || steps.length === 0) {
      throw new Error('Workflow must have at least one step');
    }

    // Validate steps
    for (let i = 0; i < steps.length; i++) {
      this.validateStep(steps[i], i);
    }

    const workflow = {
      id: this.generateId(),
      name,
      description: description || '',
      steps,
      config: {
        maxRetries: workflowConfig.maxRetries || 3,
        retryDelay: workflowConfig.retryDelay || 1000,
        timeout: workflowConfig.timeout || 300000, // 5 minutes
        continueOnError: workflowConfig.continueOnError || false,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        lastExecutionAt: null,
      },
    };

    this.workflows.set(workflow.id, workflow);
    await this.persistWorkflows();

    this.emit('workflow:created', workflow);
    return workflow;
  }

  /**
   * Validate workflow step
   */
  validateStep(step, index) {
    if (!step.type) {
      throw new Error(`Step ${index}: type is required`);
    }

    if (!['integration', 'plugin', 'custom', 'condition', 'delay'].includes(step.type)) {
      throw new Error(`Step ${index}: invalid type ${step.type}`);
    }

    if (step.type === 'integration') {
      if (!step.name || !step.action) {
        throw new Error(`Step ${index}: integration steps require name and action`);
      }
    }

    if (step.type === 'plugin') {
      if (!step.name || !step.function) {
        throw new Error(`Step ${index}: plugin steps require name and function`);
      }
    }

    if (step.type === 'condition') {
      if (!step.condition) {
        throw new Error(`Step ${index}: condition steps require condition field`);
      }
    }

    if (step.type === 'delay') {
      if (!step.duration || typeof step.duration !== 'number') {
        throw new Error(`Step ${index}: delay steps require numeric duration`);
      }
    }

    // Validate retry config
    if (step.maxRetries !== undefined && typeof step.maxRetries !== 'number') {
      throw new Error(`Step ${index}: maxRetries must be a number`);
    }

    if (step.retryDelay !== undefined && typeof step.retryDelay !== 'number') {
      throw new Error(`Step ${index}: retryDelay must be a number`);
    }
  }

  /**
   * Execute workflow
   */
  async executeWorkflow(workflowId, input = {}) {
    await this.initialize();

    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const execution = {
      id: this.generateId(),
      workflowId,
      workflowName: workflow.name,
      status: 'running',
      input,
      output: null,
      steps: [],
      startedAt: new Date().toISOString(),
      completedAt: null,
      duration: null,
      error: null,
    };

    this.executions.set(execution.id, execution);
    await this.persistExecutions();

    this.emit('execution:started', execution);

    try {
      // Execute steps sequentially
      const context = { input, variables: {} };
      
      for (let i = 0; i < workflow.steps.length; i++) {
        const step = workflow.steps[i];
        
        const stepExecution = await this.executeStep(
          step,
          i,
          context,
          workflow.config
        );

        execution.steps.push(stepExecution);

        if (stepExecution.status === 'failed') {
          if (!workflow.config.continueOnError) {
            throw new Error(`Step ${i} failed: ${stepExecution.error}`);
          }
        }

        // Store step output in context
        context.variables[`step${i}`] = stepExecution.output;
      }

      execution.status = 'completed';
      execution.output = context.variables;
      workflow.stats.successfulExecutions++;
    } catch (error) {
      execution.status = 'failed';
      execution.error = error.message;
      workflow.stats.failedExecutions++;
      
      this.emit('execution:failed', { execution, error });
    }

    execution.completedAt = new Date().toISOString();
    execution.duration = new Date(execution.completedAt) - new Date(execution.startedAt);

    workflow.stats.totalExecutions++;
    workflow.stats.lastExecutionAt = execution.completedAt;

    await this.persistWorkflows();
    await this.persistExecutions();

    this.emit('execution:completed', execution);

    return execution;
  }

  /**
   * Execute single step with retry logic
   */
  async executeStep(step, index, context, workflowConfig) {
    const stepExecution = {
      index,
      type: step.type,
      name: step.name || `Step ${index}`,
      status: 'running',
      attempts: [],
      output: null,
      error: null,
      startedAt: new Date().toISOString(),
      completedAt: null,
      duration: null,
    };

    const maxRetries = step.maxRetries !== undefined 
      ? step.maxRetries 
      : workflowConfig.maxRetries;
    
    const retryDelay = step.retryDelay !== undefined 
      ? step.retryDelay 
      : workflowConfig.retryDelay;

    let lastError = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const attemptData = {
        number: attempt + 1,
        startedAt: new Date().toISOString(),
        status: 'running',
        error: null,
      };

      try {
        // Execute step based on type
        const result = await this.executeStepType(step, context);
        
        attemptData.status = 'success';
        attemptData.completedAt = new Date().toISOString();
        stepExecution.attempts.push(attemptData);
        
        stepExecution.status = 'completed';
        stepExecution.output = result;
        break;
      } catch (error) {
        lastError = error;
        attemptData.status = 'failed';
        attemptData.error = error.message;
        attemptData.completedAt = new Date().toISOString();
        stepExecution.attempts.push(attemptData);

        // If not last attempt, wait before retry with exponential backoff
        if (attempt < maxRetries) {
          const backoffDelay = retryDelay * Math.pow(2, attempt);
          await this.sleep(backoffDelay);
        }
      }
    }

    if (stepExecution.status !== 'completed') {
      stepExecution.status = 'failed';
      stepExecution.error = lastError.message;
    }

    stepExecution.completedAt = new Date().toISOString();
    stepExecution.duration = new Date(stepExecution.completedAt) - new Date(stepExecution.startedAt);

    return stepExecution;
  }

  /**
   * Execute step based on type
   */
  async executeStepType(step, context) {
    switch (step.type) {
      case 'integration':
        return await this.executeIntegration(step, context);
      
      case 'plugin':
        return await this.executePlugin(step, context);
      
      case 'custom':
        return await this.executeCustom(step, context);
      
      case 'condition':
        return await this.executeCondition(step, context);
      
      case 'delay':
        return await this.executeDelay(step, context);
      
      default:
        throw new Error(`Unknown step type: ${step.type}`);
    }
  }

  /**
   * Execute integration step (simulated)
   */
  async executeIntegration(step, context) {
    const { name, action, params = {} } = step;

    // Simulate execution delay
    await this.sleep(50);

    // Simulate random failures for testing retry logic
    if (step.simulateFailure && Math.random() < 0.3) {
      throw new Error('Simulated integration failure');
    }

    return {
      success: true,
      integration: name,
      action,
      result: `Integration ${name}.${action} executed (simulated)`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Execute plugin step (simulated)
   */
  async executePlugin(step, context) {
    const { name, function: func, params = {} } = step;

    await this.sleep(50);

    if (step.simulateFailure && Math.random() < 0.3) {
      throw new Error('Simulated plugin failure');
    }

    return {
      success: true,
      plugin: name,
      function: func,
      result: `Plugin ${name}.${func} executed (simulated)`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Execute custom step
   */
  async executeCustom(step, context) {
    const { command, params = {} } = step;

    await this.sleep(50);

    return {
      success: true,
      command,
      result: `Custom command executed: ${command} (simulated)`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Execute condition step
   */
  async executeCondition(step, context) {
    const { condition } = step;

    // Simple condition evaluation (simulated)
    const result = Math.random() > 0.5;

    return {
      success: true,
      condition,
      result,
      message: `Condition evaluated to ${result}`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Execute delay step
   */
  async executeDelay(step, context) {
    const { duration } = step;

    await this.sleep(duration);

    return {
      success: true,
      duration,
      message: `Delayed for ${duration}ms`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get workflow by ID
   */
  async getWorkflow(workflowId) {
    await this.initialize();

    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    return workflow;
  }

  /**
   * List all workflows
   */
  async listWorkflows(filters = {}) {
    await this.initialize();

    let workflows = Array.from(this.workflows.values());

    if (filters.name) {
      workflows = workflows.filter(w => 
        w.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    return workflows;
  }

  /**
   * Update workflow
   */
  async updateWorkflow(workflowId, updates) {
    await this.initialize();

    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    // Validate steps if provided
    if (updates.steps) {
      for (let i = 0; i < updates.steps.length; i++) {
        this.validateStep(updates.steps[i], i);
      }
    }

    const allowedFields = ['name', 'description', 'steps', 'config'];
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        workflow[field] = updates[field];
      }
    }

    workflow.updatedAt = new Date().toISOString();
    
    await this.persistWorkflows();
    this.emit('workflow:updated', workflow);

    return workflow;
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow(workflowId) {
    await this.initialize();

    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    this.workflows.delete(workflowId);
    await this.persistWorkflows();

    this.emit('workflow:deleted', { id: workflowId });

    return { success: true, message: 'Workflow deleted' };
  }

  /**
   * Get execution by ID
   */
  async getExecution(executionId) {
    await this.initialize();

    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution not found: ${executionId}`);
    }

    return execution;
  }

  /**
   * Get workflow execution history
   */
  async getWorkflowHistory(workflowId, options = {}) {
    await this.initialize();

    let executions = Array.from(this.executions.values())
      .filter(e => e.workflowId === workflowId)
      .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));

    if (options.status) {
      executions = executions.filter(e => e.status === options.status);
    }

    if (options.limit) {
      executions = executions.slice(0, options.limit);
    }

    return executions;
  }

  /**
   * Get workflow status
   */
  async getWorkflowStatus(workflowId) {
    await this.initialize();

    const workflow = await this.getWorkflow(workflowId);
    const recentExecutions = await this.getWorkflowHistory(workflowId, { limit: 10 });

    return {
      workflow: {
        id: workflow.id,
        name: workflow.name,
        steps: workflow.steps.length,
      },
      stats: workflow.stats,
      recentExecutions: recentExecutions.map(e => ({
        id: e.id,
        status: e.status,
        startedAt: e.startedAt,
        duration: e.duration,
      })),
    };
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
const workflowEngine = new WorkflowEngine();

module.exports = workflowEngine;
