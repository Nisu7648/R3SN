/**
 * Execution Context - Manages workflow execution state
 */

class ExecutionContext {
  constructor(options) {
    this.executionId = options.executionId;
    this.workflowId = options.workflowId;
    this.workflow = options.workflow;
    this.inputData = options.inputData;
    this.options = options.options;
    this.engine = options.engine;

    this.status = 'running';
    this.startTime = Date.now();
    this.endTime = null;
    this.nodeExecutions = [];
    this.variables = new Map();
    this.errors = [];
    this.stopped = false;

    // Initialize with input data
    Object.entries(this.inputData).forEach(([key, value]) => {
      this.setVariable(key, value);
    });
  }

  /**
   * Set a variable in context
   */
  setVariable(key, value) {
    this.variables.set(key, value);
  }

  /**
   * Get a variable from context
   */
  getVariable(key) {
    return this.variables.get(key);
  }

  /**
   * Get all variables
   */
  getAllVariables() {
    return Object.fromEntries(this.variables);
  }

  /**
   * Add node execution result
   */
  addNodeExecution(execution) {
    this.nodeExecutions.push({
      ...execution,
      timestamp: Date.now()
    });
  }

  /**
   * Add error
   */
  addError(error) {
    this.errors.push({
      message: error.message,
      stack: error.stack,
      timestamp: Date.now()
    });
  }

  /**
   * Mark execution as completed
   */
  complete(result) {
    this.status = 'completed';
    this.endTime = Date.now();
    this.result = result;
  }

  /**
   * Mark execution as failed
   */
  fail(error) {
    this.status = 'failed';
    this.endTime = Date.now();
    this.addError(error);
  }

  /**
   * Stop execution
   */
  stop() {
    this.stopped = true;
    this.status = 'stopped';
    this.endTime = Date.now();
  }

  /**
   * Check if execution should stop
   */
  shouldStop() {
    return this.stopped;
  }

  /**
   * Get execution duration
   */
  getDuration() {
    const end = this.endTime || Date.now();
    return end - this.startTime;
  }

  /**
   * Get execution status
   */
  getStatus() {
    return {
      executionId: this.executionId,
      workflowId: this.workflowId,
      status: this.status,
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.getDuration(),
      nodeExecutions: this.nodeExecutions.length,
      errors: this.errors.length
    };
  }

  /**
   * Convert to JSON
   */
  toJSON() {
    return {
      executionId: this.executionId,
      workflowId: this.workflowId,
      status: this.status,
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.getDuration(),
      nodeExecutions: this.nodeExecutions,
      variables: this.getAllVariables(),
      errors: this.errors,
      result: this.result
    };
  }
}

module.exports = ExecutionContext;
