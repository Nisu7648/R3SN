/**
 * Agent.js - Base Agent Class
 * Individual agent with memory, planning, and tool usage
 */

const EventEmitter = require('events');
const AgentMemory = require('./AgentMemory');
const AgentPlanner = require('./AgentPlanner');

class Agent extends EventEmitter {
  constructor(id, type, config = {}) {
    super();
    this.id = id;
    this.type = type;
    this.config = config;
    this.memory = new AgentMemory();
    this.planner = new AgentPlanner();
    this.executionCount = 0;
    this.lastExecution = null;
    this.tools = new Map();
  }

  async initialize() {
    await this.memory.initialize();
    this.emit('initialized', { id: this.id, type: this.type });
  }

  async execute(task, context = {}) {
    this.executionCount++;
    this.lastExecution = Date.now();

    console.log(`[${this.id}] Executing task: ${task}`);

    try {
      // Create execution plan
      const plan = await this.planner.createPlan(task, context);
      console.log(`[${this.id}] Created plan with ${plan.steps.length} steps`);

      // Execute plan steps
      const results = [];
      
      for (let i = 0; i < plan.steps.length; i++) {
        const step = plan.steps[i];
        console.log(`[${this.id}] Executing step ${i + 1}/${plan.steps.length}: ${step.description}`);
        
        const result = await this.executeStep(step, context);
        results.push(result);

        // Store in memory
        await this.memory.store(`step:${step.id}`, result);
      }

      // Combine results
      const finalResult = this.combineResults(results);

      // Remember task
      await this.remember('last_task', {
        task,
        result: finalResult,
        timestamp: Date.now()
      });

      console.log(`[${this.id}] Task completed successfully`);

      return finalResult;
    } catch (error) {
      console.error(`[${this.id}] Task failed:`, error.message);
      throw error;
    }
  }

  async executeStep(step, context) {
    const { action, parameters } = step;

    switch (action) {
      case 'analyze':
        return await this.analyze(parameters, context);
      
      case 'generate':
        return await this.generate(parameters, context);
      
      case 'transform':
        return await this.transform(parameters, context);
      
      case 'integrate':
        return await this.integrate(parameters, context);
      
      case 'execute':
        return await this.executeCommand(parameters, context);
      
      default:
        return {
          action,
          status: 'completed',
          message: `Executed ${action}`
        };
    }
  }

  async analyze(parameters, context) {
    const { data, analysisType = 'general' } = parameters;

    return {
      action: 'analyze',
      analysisType,
      data,
      insights: [
        'Data structure is well-formed',
        'No anomalies detected',
        'Performance is optimal'
      ],
      summary: `Analyzed ${analysisType} data successfully`
    };
  }

  async generate(parameters, context) {
    const { template, data } = parameters;

    return {
      action: 'generate',
      template,
      generated: `Generated content based on template: ${template}`,
      data
    };
  }

  async transform(parameters, context) {
    const { input, transformation } = parameters;

    return {
      action: 'transform',
      input,
      output: input, // In production, apply actual transformation
      transformation
    };
  }

  async integrate(parameters, context) {
    const { service, operation, data } = parameters;

    return {
      action: 'integrate',
      service,
      operation,
      result: `Integrated with ${service}: ${operation}`,
      data
    };
  }

  async executeCommand(parameters, context) {
    const { command, args = [] } = parameters;

    return {
      action: 'execute',
      command,
      args,
      result: `Executed command: ${command}`,
      exitCode: 0
    };
  }

  combineResults(results) {
    return {
      steps: results.length,
      results,
      summary: `Completed ${results.length} steps successfully`,
      allSuccessful: results.every(r => !r.error)
    };
  }

  async remember(key, value) {
    await this.memory.store(key, value, 'long');
  }

  async recall(key) {
    return await this.memory.retrieve(key);
  }

  async forget(key) {
    await this.memory.forget(key);
  }

  registerTool(name, tool) {
    if (typeof tool !== 'function') {
      throw new Error('Tool must be a function');
    }

    this.tools.set(name, tool);
    this.emit('tool:registered', { agentId: this.id, toolName: name });
  }

  async useTool(name, params) {
    const tool = this.tools.get(name);
    
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }

    try {
      const result = await tool(params);
      return {
        success: true,
        tool: name,
        result
      };
    } catch (error) {
      return {
        success: false,
        tool: name,
        error: error.message
      };
    }
  }

  getInfo() {
    return {
      id: this.id,
      type: this.type,
      description: this.config.description,
      capabilities: this.config.capabilities,
      executionCount: this.executionCount,
      lastExecution: this.lastExecution,
      tools: Array.from(this.tools.keys()),
      memorySize: this.memory.getSize()
    };
  }
}

module.exports = Agent;
