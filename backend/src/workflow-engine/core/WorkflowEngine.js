/**
 * R3SN Workflow Engine - Core Execution Engine
 * Orchestrates workflow execution with node-based processing
 */

const EventEmitter = require('events');
const NodeRegistry = require('./NodeRegistry');
const PluginLoader = require('../plugins/PluginLoader');
const ExecutionContext = require('./ExecutionContext');

class WorkflowEngine extends EventEmitter {
  constructor() {
    super();
    this.nodeRegistry = new NodeRegistry();
    this.pluginLoader = new PluginLoader();
    this.activeExecutions = new Map();
    this.executionHistory = [];
    this.maxConcurrentExecutions = 100;
  }

  /**
   * Initialize the workflow engine
   */
  async initialize() {
    console.log('🚀 Initializing R3SN Workflow Engine...');
    
    // Load core nodes
    await this.nodeRegistry.loadCoreNodes();
    
    // Load plugins with hot-reload support
    await this.pluginLoader.loadPlugins();
    
    // Setup hot-reload watcher
    this.pluginLoader.enableHotReload((plugin) => {
      console.log(`🔄 Hot-reloaded plugin: ${plugin.name}`);
      this.emit('plugin:reloaded', plugin);
    });
    
    console.log('✅ Workflow Engine initialized');
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(workflowId, workflow, inputData = {}, options = {}) {
    const executionId = this.generateExecutionId();
    
    console.log(`▶️  Starting workflow execution: ${executionId}`);
    
    // Create execution context
    const context = new ExecutionContext({
      executionId,
      workflowId,
      workflow,
      inputData,
      options,
      engine: this
    });

    // Store active execution
    this.activeExecutions.set(executionId, context);

    try {
      // Validate workflow
      this.validateWorkflow(workflow);

      // Execute workflow nodes
      const result = await this.executeNodes(workflow, context);

      // Mark as completed
      context.complete(result);
      
      this.emit('execution:completed', {
        executionId,
        workflowId,
        result,
        duration: context.getDuration()
      });

      return {
        success: true,
        executionId,
        result,
        duration: context.getDuration()
      };

    } catch (error) {
      context.fail(error);
      
      this.emit('execution:failed', {
        executionId,
        workflowId,
        error: error.message,
        duration: context.getDuration()
      });

      throw error;
    } finally {
      // Move to history
      this.executionHistory.push(context.toJSON());
      this.activeExecutions.delete(executionId);
      
      // Cleanup old history (keep last 1000)
      if (this.executionHistory.length > 1000) {
        this.executionHistory = this.executionHistory.slice(-1000);
      }
    }
  }

  /**
   * Execute workflow nodes in correct order
   */
  async executeNodes(workflow, context) {
    const { nodes, connections } = workflow;
    const executionOrder = this.determineExecutionOrder(nodes, connections);
    const nodeOutputs = new Map();

    for (const nodeId of executionOrder) {
      const node = nodes.find(n => n.id === nodeId);
      
      if (!node) {
        throw new Error(`Node not found: ${nodeId}`);
      }

      // Get node implementation
      const nodeImpl = this.nodeRegistry.getNode(node.type);
      
      if (!nodeImpl) {
        throw new Error(`Node type not registered: ${node.type}`);
      }

      // Prepare input data from connected nodes
      const inputData = this.prepareNodeInput(node, connections, nodeOutputs);

      // Execute node
      console.log(`  🔹 Executing node: ${node.name} (${node.type})`);
      
      const startTime = Date.now();
      
      try {
        const output = await nodeImpl.execute(inputData, node.parameters, context);
        
        const duration = Date.now() - startTime;
        
        nodeOutputs.set(nodeId, output);
        
        context.addNodeExecution({
          nodeId,
          nodeName: node.name,
          nodeType: node.type,
          status: 'success',
          duration,
          output
        });

        this.emit('node:executed', {
          executionId: context.executionId,
          nodeId,
          nodeName: node.name,
          duration
        });

      } catch (error) {
        const duration = Date.now() - startTime;
        
        context.addNodeExecution({
          nodeId,
          nodeName: node.name,
          nodeType: node.type,
          status: 'failed',
          duration,
          error: error.message
        });

        throw new Error(`Node execution failed: ${node.name} - ${error.message}`);
      }
    }

    // Return final output (from last node or specified output node)
    const outputNode = nodes.find(n => n.type === 'output') || nodes[nodes.length - 1];
    return nodeOutputs.get(outputNode.id);
  }

  /**
   * Determine execution order using topological sort
   */
  determineExecutionOrder(nodes, connections) {
    const graph = new Map();
    const inDegree = new Map();

    // Initialize graph
    nodes.forEach(node => {
      graph.set(node.id, []);
      inDegree.set(node.id, 0);
    });

    // Build graph from connections
    connections.forEach(conn => {
      graph.get(conn.source).push(conn.target);
      inDegree.set(conn.target, inDegree.get(conn.target) + 1);
    });

    // Topological sort (Kahn's algorithm)
    const queue = [];
    const result = [];

    // Find nodes with no incoming edges
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) {
        queue.push(nodeId);
      }
    });

    while (queue.length > 0) {
      const nodeId = queue.shift();
      result.push(nodeId);

      graph.get(nodeId).forEach(targetId => {
        inDegree.set(targetId, inDegree.get(targetId) - 1);
        if (inDegree.get(targetId) === 0) {
          queue.push(targetId);
        }
      });
    }

    // Check for cycles
    if (result.length !== nodes.length) {
      throw new Error('Workflow contains cycles');
    }

    return result;
  }

  /**
   * Prepare input data for a node from connected nodes
   */
  prepareNodeInput(node, connections, nodeOutputs) {
    const inputs = {};

    connections
      .filter(conn => conn.target === node.id)
      .forEach(conn => {
        const sourceOutput = nodeOutputs.get(conn.source);
        inputs[conn.targetInput || 'default'] = sourceOutput;
      });

    return inputs;
  }

  /**
   * Validate workflow structure
   */
  validateWorkflow(workflow) {
    if (!workflow.nodes || workflow.nodes.length === 0) {
      throw new Error('Workflow must contain at least one node');
    }

    if (!workflow.connections) {
      workflow.connections = [];
    }

    // Validate all node types are registered
    workflow.nodes.forEach(node => {
      if (!this.nodeRegistry.hasNode(node.type)) {
        throw new Error(`Unknown node type: ${node.type}`);
      }
    });

    // Validate connections
    workflow.connections.forEach(conn => {
      const sourceExists = workflow.nodes.some(n => n.id === conn.source);
      const targetExists = workflow.nodes.some(n => n.id === conn.target);

      if (!sourceExists || !targetExists) {
        throw new Error('Invalid connection: node not found');
      }
    });
  }

  /**
   * Get execution status
   */
  getExecutionStatus(executionId) {
    const active = this.activeExecutions.get(executionId);
    if (active) {
      return active.getStatus();
    }

    const historical = this.executionHistory.find(e => e.executionId === executionId);
    return historical || null;
  }

  /**
   * Get all active executions
   */
  getActiveExecutions() {
    return Array.from(this.activeExecutions.values()).map(ctx => ctx.getStatus());
  }

  /**
   * Get execution history
   */
  getExecutionHistory(limit = 100) {
    return this.executionHistory.slice(-limit);
  }

  /**
   * Stop an active execution
   */
  async stopExecution(executionId) {
    const context = this.activeExecutions.get(executionId);
    
    if (!context) {
      throw new Error('Execution not found or already completed');
    }

    context.stop();
    this.emit('execution:stopped', { executionId });
  }

  /**
   * Generate unique execution ID
   */
  generateExecutionId() {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Register a custom node
   */
  registerNode(nodeType, nodeImplementation) {
    this.nodeRegistry.register(nodeType, nodeImplementation);
  }

  /**
   * Get registered nodes
   */
  getRegisteredNodes() {
    return this.nodeRegistry.getAllNodes();
  }

  /**
   * Shutdown engine
   */
  async shutdown() {
    console.log('🛑 Shutting down Workflow Engine...');
    
    // Stop all active executions
    for (const [executionId] of this.activeExecutions) {
      await this.stopExecution(executionId);
    }

    // Cleanup
    this.pluginLoader.cleanup();
    this.removeAllListeners();
    
    console.log('✅ Workflow Engine shutdown complete');
  }
}

module.exports = WorkflowEngine;
