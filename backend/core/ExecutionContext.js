/**
 * ExecutionContext.js - Workflow Execution Context
 * Maintains state during workflow execution
 */

class ExecutionContext {
  constructor(executionId, workflow, inputData = {}, options = {}) {
    this.executionId = executionId;
    this.workflow = workflow;
    this.inputData = inputData;
    this.options = options;
    this.status = 'pending';
    this.startTime = Date.now();
    this.endTime = null;
    this.result = null;
    this.error = null;
    this.executedNodes = new Set();
    this.nodeExecutions = new Map();
    this.variables = new Map();
  }

  setVariable(key, value) {
    this.variables.set(key, value);
  }

  getVariable(key) {
    return this.variables.get(key);
  }

  hasVariable(key) {
    return this.variables.has(key);
  }

  recordNodeExecution(nodeId, data) {
    this.nodeExecutions.set(nodeId, {
      ...data,
      timestamp: Date.now()
    });
  }

  getNodeExecution(nodeId) {
    return this.nodeExecutions.get(nodeId);
  }

  markNodeExecuted(nodeId) {
    this.executedNodes.add(nodeId);
  }

  isNodeExecuted(nodeId) {
    return this.executedNodes.has(nodeId);
  }

  complete(result) {
    this.status = 'completed';
    this.endTime = Date.now();
    this.result = result;
  }

  fail(error) {
    this.status = 'failed';
    this.endTime = Date.now();
    this.error = error;
  }

  cancel() {
    this.status = 'cancelled';
    this.endTime = Date.now();
  }

  getDuration() {
    if (!this.endTime) {
      return Date.now() - this.startTime;
    }
    return this.endTime - this.startTime;
  }

  getProgress() {
    const total = this.workflow.nodes.length;
    const executed = this.executedNodes.size;
    return {
      total,
      executed,
      percentage: total > 0 ? (executed / total) * 100 : 0
    };
  }

  toJSON() {
    return {
      executionId: this.executionId,
      workflow: {
        name: this.workflow.name,
        nodeCount: this.workflow.nodes.length
      },
      status: this.status,
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.getDuration(),
      progress: this.getProgress(),
      result: this.result,
      error: this.error
    };
  }
}

module.exports = ExecutionContext;
