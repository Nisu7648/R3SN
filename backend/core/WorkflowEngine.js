/**
 * WorkflowEngine.js - Parallel Workflow Execution Engine
 * Supports 1000+ concurrent workflows with error recovery
 */

const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');

class WorkflowEngine extends EventEmitter {
  constructor() {
    super();
    this.executions = new Map();
    this.nodeRegistry = new Map();
    this.maxConcurrentExecutions = 1000;
    this.retryConfig = {
      maxRetries: 3,
      retryDelay: 1000,
      backoffMultiplier: 2
    };
  }

  async initialize() {
    console.log('⚙️  Initializing Workflow Engine...');
    
    // Register default node types
    this.registerDefaultNodes();
    
    this.emit('initialized', {
      maxConcurrent: this.maxConcurrentExecutions
    });
    
    console.log(`✅ Workflow Engine initialized (max ${this.maxConcurrentExecutions} concurrent)`);
  }

  registerDefaultNodes() {
    // HTTP Request Node
    this.registerNode('http.request', async (params, inputData) => {
      const axios = require('axios');
      const response = await axios({
        method: params.method || 'GET',
        url: params.url,
        headers: params.headers,
        data: params.body,
        params: params.query
      });
      return { status: response.status, data: response.data };
    });

    // Transform Node
    this.registerNode('transform', async (params, inputData) => {
      const fn = eval(`(${params.function})`);
      return fn(inputData);
    });

    // Condition Node
    this.registerNode('condition', async (params, inputData) => {
      const condition = eval(`(${params.condition})`);
      return { result: condition(inputData), data: inputData };
    });

    // Delay Node
    this.registerNode('delay', async (params) => {
      await new Promise(resolve => setTimeout(resolve, params.duration || 1000));
      return { delayed: params.duration };
    });

    // Log Node
    this.registerNode('log', async (params, inputData) => {
      console.log(`[Workflow Log] ${params.message}:`, inputData);
      return inputData;
    });
  }

  registerNode(type, executor) {
    this.nodeRegistry.set(type, executor);
    this.emit('node:registered', { type });
  }

  async executeWorkflow(workflow, inputData = {}, options = {}) {
    // Validate workflow
    this.validateWorkflow(workflow);

    // Check concurrent limit
    if (this.executions.size >= this.maxConcurrentExecutions) {
      throw new Error(`Max concurrent executions reached: ${this.maxConcurrentExecutions}`);
    }

    const executionId = uuidv4();
    const execution = {
      id: executionId,
      workflow,
      inputData,
      options,
      status: 'running',
      startTime: Date.now(),
      endTime: null,
      result: null,
      error: null,
      executedNodes: new Set(),
      nodeResults: new Map()
    };

    this.executions.set(executionId, execution);
    this.emit('execution:start', { executionId, workflow: workflow.name });

    try {
      // Build execution graph
      const graph = this.buildExecutionGraph(workflow);
      
      // Execute graph
      const result = await this.executeGraph(graph, execution);

      execution.status = 'completed';
      execution.endTime = Date.now();
      execution.result = result;

      this.emit('execution:complete', {
        executionId,
        duration: execution.endTime - execution.startTime,
        nodesExecuted: execution.executedNodes.size
      });

      return {
        executionId,
        status: 'completed',
        result,
        duration: execution.endTime - execution.startTime,
        nodesExecuted: execution.executedNodes.size
      };
    } catch (error) {
      execution.status = 'failed';
      execution.endTime = Date.now();
      execution.error = error.message;

      this.emit('execution:error', { executionId, error: error.message });
      
      throw error;
    } finally {
      // Cleanup after 5 minutes
      setTimeout(() => this.executions.delete(executionId), 300000);
    }
  }

  buildExecutionGraph(workflow) {
    const { nodes, connections } = workflow;
    
    const graph = {
      nodes: new Map(),
      adjacency: new Map(),
      reverseAdjacency: new Map(),
      startNodes: new Set(),
      endNodes: new Set()
    };

    // Build node maps
    nodes.forEach(node => {
      graph.nodes.set(node.id, node);
      graph.adjacency.set(node.id, []);
      graph.reverseAdjacency.set(node.id, []);
    });

    // Build adjacency lists
    connections.forEach(conn => {
      graph.adjacency.get(conn.source).push(conn.target);
      graph.reverseAdjacency.get(conn.target).push(conn.source);
    });

    // Find start and end nodes
    nodes.forEach(node => {
      if (graph.reverseAdjacency.get(node.id).length === 0) {
        graph.startNodes.add(node.id);
      }
      if (graph.adjacency.get(node.id).length === 0) {
        graph.endNodes.add(node.id);
      }
    });

    // Check for cycles
    if (this.hasCycle(graph)) {
      throw new Error('Workflow contains cycles');
    }

    return graph;
  }

  async executeGraph(graph, execution) {
    const executed = new Set();
    const executing = new Map();

    const executeNode = async (nodeId) => {
      // Return if already executed or executing
      if (executing.has(nodeId) || executed.has(nodeId)) {
        return executing.get(nodeId) || execution.nodeResults.get(nodeId);
      }

      const node = graph.nodes.get(nodeId);
      const dependencies = graph.reverseAdjacency.get(nodeId);

      // Wait for dependencies
      const dependencyResults = await Promise.all(
        dependencies.map(depId => executeNode(depId))
      );

      // Merge input data
      const inputData = this.mergeInputData(dependencies, dependencyResults, execution.nodeResults);

      // Execute node
      const promise = this.executeNode(node, inputData, execution);
      executing.set(nodeId, promise);

      try {
        const result = await promise;
        execution.nodeResults.set(nodeId, result);
        executed.add(nodeId);
        execution.executedNodes.add(nodeId);

        this.emit('node:complete', {
          executionId: execution.id,
          nodeId,
          type: node.type,
          result
        });

        return result;
      } catch (error) {
        if (node.continueOnError) {
          const errorResult = { error: error.message };
          execution.nodeResults.set(nodeId, errorResult);
          executed.add(nodeId);
          return errorResult;
        }
        throw error;
      } finally {
        executing.delete(nodeId);
      }
    };

    // Execute all end nodes (will trigger dependency execution)
    const endNodeResults = await Promise.all(
      Array.from(graph.endNodes).map(nodeId => executeNode(nodeId))
    );

    return this.mergeResults(endNodeResults);
  }

  async executeNode(node, inputData, execution) {
    this.emit('node:start', {
      executionId: execution.id,
      nodeId: node.id,
      type: node.type
    });

    const executor = this.nodeRegistry.get(node.type);
    
    if (!executor) {
      throw new Error(`No executor for node type: ${node.type}`);
    }

    const startTime = Date.now();

    try {
      const result = await this.executeWithRetry(
        () => executor(node.parameters, inputData),
        node.retryConfig || this.retryConfig
      );

      const duration = Date.now() - startTime;

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      throw error;
    }
  }

  async executeWithRetry(fn, retryConfig) {
    const { maxRetries, retryDelay, backoffMultiplier } = retryConfig;
    let lastError;
    let delay = retryDelay;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt < maxRetries) {
          await this.sleep(delay);
          delay *= backoffMultiplier;
        }
      }
    }

    throw lastError;
  }

  mergeInputData(dependencies, dependencyResults, allResults) {
    if (dependencies.length === 0) return {};
    if (dependencies.length === 1) return dependencyResults[0];

    return dependencies.reduce((merged, depId, index) => {
      merged[depId] = dependencyResults[index];
      return merged;
    }, {});
  }

  mergeResults(results) {
    if (results.length === 1) return results[0];
    return { outputs: results, merged: true };
  }

  validateWorkflow(workflow) {
    if (!workflow || typeof workflow !== 'object') {
      throw new Error('Invalid workflow: must be an object');
    }

    if (!Array.isArray(workflow.nodes) || workflow.nodes.length === 0) {
      throw new Error('Invalid workflow: must have at least one node');
    }

    if (!Array.isArray(workflow.connections)) {
      throw new Error('Invalid workflow: connections must be an array');
    }

    const nodeIds = new Set();
    workflow.nodes.forEach(node => {
      if (!node.id || !node.type) {
        throw new Error('Invalid node: must have id and type');
      }
      if (nodeIds.has(node.id)) {
        throw new Error(`Duplicate node id: ${node.id}`);
      }
      nodeIds.add(node.id);
    });

    workflow.connections.forEach(conn => {
      if (!conn.source || !conn.target) {
        throw new Error('Invalid connection: must have source and target');
      }
      if (!nodeIds.has(conn.source)) {
        throw new Error(`Invalid connection: source node ${conn.source} not found`);
      }
      if (!nodeIds.has(conn.target)) {
        throw new Error(`Invalid connection: target node ${conn.target} not found`);
      }
    });
  }

  hasCycle(graph) {
    const visited = new Set();
    const recursionStack = new Set();

    const dfs = (nodeId) => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const neighbors = graph.adjacency.get(nodeId);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true;
        } else if (recursionStack.has(neighbor)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const nodeId of graph.nodes.keys()) {
      if (!visited.has(nodeId)) {
        if (dfs(nodeId)) return true;
      }
    }

    return false;
  }

  getExecutionStatus(executionId) {
    const execution = this.executions.get(executionId);
    
    if (!execution) {
      return null;
    }

    return {
      executionId,
      status: execution.status,
      startTime: execution.startTime,
      endTime: execution.endTime,
      duration: execution.endTime 
        ? execution.endTime - execution.startTime 
        : Date.now() - execution.startTime,
      nodesExecuted: execution.executedNodes.size,
      totalNodes: execution.workflow.nodes.length,
      result: execution.result,
      error: execution.error
    };
  }

  cancelExecution(executionId) {
    const execution = this.executions.get(executionId);
    
    if (execution) {
      execution.status = 'cancelled';
      execution.endTime = Date.now();
      this.emit('execution:cancelled', { executionId });
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStats() {
    return {
      activeExecutions: this.executions.size,
      maxConcurrentExecutions: this.maxConcurrentExecutions,
      registeredNodeTypes: this.nodeRegistry.size
    };
  }
}

module.exports = WorkflowEngine;
