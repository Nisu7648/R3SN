/**
 * ExecutionOrchestrator - THE REAL BRAIN
 * Connects UniversalExecutor, AgentEngine, IntegrationHub, PluginFactory
 * Handles actual execution flow with real database persistence
 */

const UniversalExecutor = require('./UniversalExecutor');
const AgentEngine = require('./AgentEngine');
const IntegrationHub = require('./IntegrationHub');
const PluginFactory = require('./PluginFactory');
const SelfEvolvingEngine = require('./SelfEvolvingEngine');
const SelfDebuggingEngine = require('./SelfDebuggingEngine');
const Execution = require('../models/Execution');
const Agent = require('../models/Agent');
const Workflow = require('../models/Workflow');
const Plugin = require('../models/Plugin');

class ExecutionOrchestrator {
  constructor() {
    // Initialize all engines
    this.integrationHub = new IntegrationHub();
    this.pluginFactory = new PluginFactory();
    this.agentEngine = new AgentEngine();
    this.universalExecutor = new UniversalExecutor(
      this.agentEngine,
      this.integrationHub,
      this.pluginFactory
    );
    this.selfEvolvingEngine = new SelfEvolvingEngine();
    this.selfDebuggingEngine = new SelfDebuggingEngine();
    
    // Execution tracking
    this.activeExecutions = new Map();
    this.executionHistory = [];
    
    console.log('🧠 ExecutionOrchestrator initialized - All engines connected');
  }

  /**
   * MAIN ENTRY POINT - Execute any prompt with full orchestration
   */
  async executePrompt(prompt, userId, context = {}) {
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    console.log(`\n🚀 [${executionId}] Starting execution for user ${userId}`);
    console.log(`📝 Prompt: ${prompt}`);

    // Create execution record
    const execution = new Execution({
      executionId,
      userId,
      type: 'prompt',
      prompt,
      status: 'running',
      startTime: new Date(),
      context
    });
    await execution.save();

    this.activeExecutions.set(executionId, execution);

    try {
      // Step 1: Analyze prompt and determine strategy
      console.log(`🔍 [${executionId}] Analyzing prompt...`);
      const strategy = await this.universalExecutor.analyzePrompt(prompt, context);
      
      execution.strategy = strategy;
      await execution.save();

      // Step 2: Check if we need agents, integrations, or plugins
      const requirements = this.determineRequirements(strategy);
      console.log(`📋 [${executionId}] Requirements:`, requirements);

      // Step 3: Prepare resources
      const resources = await this.prepareResources(requirements, userId);
      console.log(`✅ [${executionId}] Resources prepared:`, {
        agents: resources.agents.length,
        integrations: resources.integrations.length,
        plugins: resources.plugins.length
      });

      // Step 4: Execute with full orchestration
      console.log(`⚡ [${executionId}] Executing...`);
      const result = await this.orchestrateExecution(
        strategy,
        resources,
        context,
        executionId
      );

      // Step 5: Learn from execution (self-evolving)
      await this.selfEvolvingEngine.learnFromExecution({
        prompt,
        strategy,
        result,
        executionTime: Date.now() - startTime
      });

      // Step 6: Update execution record
      execution.status = 'completed';
      execution.result = result;
      execution.endTime = new Date();
      execution.executionTime = Date.now() - startTime;
      await execution.save();

      this.activeExecutions.delete(executionId);
      this.executionHistory.push(execution);

      console.log(`✅ [${executionId}] Completed in ${execution.executionTime}ms`);

      return {
        success: true,
        executionId,
        prompt,
        strategy,
        result,
        executionTime: execution.executionTime
      };

    } catch (error) {
      console.error(`❌ [${executionId}] Execution failed:`, error);

      // Self-debugging attempt
      const debugResult = await this.selfDebuggingEngine.debugAndFix(error, {
        prompt,
        executionId,
        context
      });

      if (debugResult.fixed) {
        console.log(`🔧 [${executionId}] Auto-fixed and retrying...`);
        return this.executePrompt(prompt, userId, {
          ...context,
          retryAfterFix: true,
          previousError: error.message
        });
      }

      // Update execution with error
      execution.status = 'failed';
      execution.error = error.message;
      execution.endTime = new Date();
      execution.executionTime = Date.now() - startTime;
      await execution.save();

      this.activeExecutions.delete(executionId);

      throw error;
    }
  }

  /**
   * Execute workflow with full orchestration
   */
  async executeWorkflow(workflowId, userId, triggerData = {}) {
    const executionId = `wf_exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    console.log(`\n🔄 [${executionId}] Starting workflow execution`);

    const workflow = await Workflow.findById(workflowId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    const execution = new Execution({
      executionId,
      userId,
      type: 'workflow',
      workflowId,
      status: 'running',
      startTime: new Date(),
      context: triggerData
    });
    await execution.save();

    try {
      const stepResults = [];
      let workflowContext = { ...triggerData };

      // Execute each step
      for (let i = 0; i < workflow.steps.length; i++) {
        const step = workflow.steps[i];
        console.log(`📍 [${executionId}] Executing step ${i + 1}/${workflow.steps.length}: ${step.type}`);

        const stepResult = await this.executeWorkflowStep(
          step,
          workflowContext,
          userId,
          executionId
        );

        stepResults.push(stepResult);

        if (!stepResult.success && !step.continueOnError) {
          throw new Error(`Step ${i + 1} failed: ${stepResult.error}`);
        }

        // Add step output to context
        if (stepResult.output) {
          workflowContext[`step_${i}_output`] = stepResult.output;
        }
      }

      execution.status = 'completed';
      execution.result = { steps: stepResults };
      execution.endTime = new Date();
      execution.executionTime = Date.now() - startTime;
      await execution.save();

      // Update workflow stats
      workflow.executionCount += 1;
      workflow.lastExecutedAt = new Date();
      await workflow.save();

      console.log(`✅ [${executionId}] Workflow completed in ${execution.executionTime}ms`);

      return {
        success: true,
        executionId,
        workflowId,
        steps: stepResults,
        executionTime: execution.executionTime
      };

    } catch (error) {
      console.error(`❌ [${executionId}] Workflow failed:`, error);

      execution.status = 'failed';
      execution.error = error.message;
      execution.endTime = new Date();
      execution.executionTime = Date.now() - startTime;
      await execution.save();

      throw error;
    }
  }

  /**
   * Execute a single workflow step
   */
  async executeWorkflowStep(step, context, userId, executionId) {
    const stepStart = Date.now();

    try {
      let result;

      switch (step.type) {
        case 'agent':
          result = await this.executeAgentStep(step, context, userId);
          break;

        case 'integration':
          result = await this.executeIntegrationStep(step, context, userId);
          break;

        case 'plugin':
          result = await this.executePluginStep(step, context, userId);
          break;

        case 'condition':
          result = await this.executeConditionStep(step, context);
          break;

        case 'transform':
          result = await this.executeTransformStep(step, context);
          break;

        case 'delay':
          result = await this.executeDelayStep(step);
          break;

        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }

      return {
        success: true,
        type: step.type,
        output: result,
        executionTime: Date.now() - stepStart
      };

    } catch (error) {
      return {
        success: false,
        type: step.type,
        error: error.message,
        executionTime: Date.now() - stepStart
      };
    }
  }

  /**
   * Execute agent step
   */
  async executeAgentStep(step, context, userId) {
    const { agentId, prompt, config } = step;

    if (agentId) {
      // Use existing agent
      const agent = await Agent.findById(agentId);
      if (!agent) throw new Error('Agent not found');

      return await this.agentEngine.executeAgent(agent, prompt || step.action, context);
    } else {
      // Create temporary agent
      const tempAgent = {
        name: 'Temp Agent',
        type: step.agentType || 'general',
        capabilities: step.capabilities || []
      };

      return await this.agentEngine.executeAgent(tempAgent, prompt || step.action, context);
    }
  }

  /**
   * Execute integration step
   */
  async executeIntegrationStep(step, context, userId) {
    const { integrationId, action, parameters } = step;

    return await this.integrationHub.executeIntegration(
      integrationId,
      action,
      { ...parameters, ...context },
      userId
    );
  }

  /**
   * Execute plugin step
   */
  async executePluginStep(step, context, userId) {
    const { pluginId, action, parameters } = step;

    const plugin = await Plugin.findById(pluginId);
    if (!plugin) throw new Error('Plugin not found');

    return await this.pluginFactory.executePlugin(
      plugin,
      action,
      { ...parameters, ...context }
    );
  }

  /**
   * Execute condition step
   */
  async executeConditionStep(step, context) {
    const { condition, ifTrue, ifFalse } = step;

    // Evaluate condition
    const conditionMet = this.evaluateCondition(condition, context);

    return {
      conditionMet,
      nextStep: conditionMet ? ifTrue : ifFalse
    };
  }

  /**
   * Execute transform step
   */
  async executeTransformStep(step, context) {
    const { transformation, input } = step;

    // Apply transformation to data
    const inputData = this.resolveValue(input, context);
    const transformed = this.applyTransformation(transformation, inputData);

    return transformed;
  }

  /**
   * Execute delay step
   */
  async executeDelayStep(step) {
    const { duration } = step;
    await new Promise(resolve => setTimeout(resolve, duration));
    return { delayed: duration };
  }

  /**
   * Determine what resources are needed
   */
  determineRequirements(strategy) {
    const requirements = {
      agents: [],
      integrations: [],
      plugins: [],
      capabilities: []
    };

    // Analyze strategy to determine needs
    if (strategy.capabilities) {
      for (const capability of strategy.capabilities) {
        if (capability.includes('integration:')) {
          requirements.integrations.push(capability.replace('integration:', ''));
        } else if (capability.includes('plugin:')) {
          requirements.plugins.push(capability.replace('plugin:', ''));
        } else if (capability.includes('agent:')) {
          requirements.agents.push(capability.replace('agent:', ''));
        } else {
          requirements.capabilities.push(capability);
        }
      }
    }

    return requirements;
  }

  /**
   * Prepare all required resources
   */
  async prepareResources(requirements, userId) {
    const resources = {
      agents: [],
      integrations: [],
      plugins: []
    };

    // Load or create agents
    for (const agentType of requirements.agents) {
      let agent = await Agent.findOne({ userId, type: agentType });
      if (!agent) {
        agent = await this.agentEngine.createAgent({
          name: `Auto-created ${agentType}`,
          type: agentType,
          userId
        });
      }
      resources.agents.push(agent);
    }

    // Load integrations
    for (const integrationName of requirements.integrations) {
      const integration = await this.integrationHub.getIntegration(integrationName);
      if (integration) {
        resources.integrations.push(integration);
      }
    }

    // Load or generate plugins
    for (const pluginName of requirements.plugins) {
      let plugin = await Plugin.findOne({ appName: pluginName });
      if (!plugin) {
        plugin = await this.pluginFactory.generatePlugin({
          appName: pluginName,
          platform: 'android'
        });
        await plugin.save();
      }
      resources.plugins.push(plugin);
    }

    return resources;
  }

  /**
   * Orchestrate the actual execution
   */
  async orchestrateExecution(strategy, resources, context, executionId) {
    console.log(`🎯 [${executionId}] Orchestrating execution with ${strategy.steps?.length || 0} steps`);

    // Use UniversalExecutor for the heavy lifting
    const result = await this.universalExecutor.execute(strategy.intent || 'Execute', {
      ...context,
      strategy,
      resources,
      executionId
    });

    return result;
  }

  /**
   * Evaluate a condition
   */
  evaluateCondition(condition, context) {
    try {
      // Simple condition evaluation
      // In production, use a safe expression evaluator
      const func = new Function('context', `with(context) { return ${condition}; }`);
      return func(context);
    } catch (error) {
      console.error('Condition evaluation error:', error);
      return false;
    }
  }

  /**
   * Resolve a value from context
   */
  resolveValue(value, context) {
    if (typeof value === 'string' && value.startsWith('$')) {
      const path = value.substring(1).split('.');
      let result = context;
      for (const key of path) {
        result = result?.[key];
      }
      return result;
    }
    return value;
  }

  /**
   * Apply transformation to data
   */
  applyTransformation(transformation, data) {
    switch (transformation.type) {
      case 'map':
        return data.map(transformation.function);
      case 'filter':
        return data.filter(transformation.function);
      case 'reduce':
        return data.reduce(transformation.function, transformation.initial);
      case 'extract':
        return data[transformation.field];
      case 'format':
        return this.formatData(data, transformation.format);
      default:
        return data;
    }
  }

  /**
   * Format data
   */
  formatData(data, format) {
    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'csv':
        return this.convertToCSV(data);
      case 'xml':
        return this.convertToXML(data);
      default:
        return data;
    }
  }

  /**
   * Convert to CSV
   */
  convertToCSV(data) {
    if (!Array.isArray(data)) return '';
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(h => row[h]).join(','));
    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Convert to XML
   */
  convertToXML(data) {
    // Simple XML conversion
    return `<data>${JSON.stringify(data)}</data>`;
  }

  /**
   * Get execution status
   */
  async getExecutionStatus(executionId) {
    const execution = await Execution.findOne({ executionId });
    return execution;
  }

  /**
   * Get active executions
   */
  getActiveExecutions() {
    return Array.from(this.activeExecutions.values());
  }

  /**
   * Get execution history
   */
  getExecutionHistory(limit = 100) {
    return this.executionHistory.slice(-limit);
  }
}

module.exports = ExecutionOrchestrator;
