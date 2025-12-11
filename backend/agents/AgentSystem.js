/**
 * AgentSystem.js - Multi-Agent Orchestration System
 * Manages multiple AI agents with memory and collaboration
 */

const EventEmitter = require('events');
const Agent = require('./Agent');
const AgentMemory = require('./AgentMemory');

class AgentSystem extends EventEmitter {
  constructor() {
    super();
    this.agents = new Map();
    this.memory = new AgentMemory();
    this.premium = true;
    this.unlimited = true;
  }

  async initialize() {
    console.log('🤖 Initializing Agent System...');

    // Create default specialized agents
    await this.createAgent('workflow-agent', 'workflow', {
      description: 'Creates and optimizes workflows',
      capabilities: ['workflow-creation', 'optimization', 'analysis', 'debugging']
    });

    await this.createAgent('plugin-agent', 'plugin', {
      description: 'Generates custom plugins and extensions',
      capabilities: ['plugin-generation', 'code-generation', 'testing', 'deployment']
    });

    await this.createAgent('analysis-agent', 'analysis', {
      description: 'Analyzes data and provides insights',
      capabilities: ['data-analysis', 'visualization', 'reporting', 'predictions']
    });

    await this.createAgent('integration-agent', 'integration', {
      description: 'Integrates external services and APIs',
      capabilities: ['api-integration', 'data-sync', 'automation', 'webhooks']
    });

    await this.createAgent('executor-agent', 'executor', {
      description: 'Executes tasks and commands',
      capabilities: ['task-execution', 'command-running', 'script-execution']
    });

    this.emit('initialized', { agentCount: this.agents.size });
    console.log(`✅ Agent System initialized with ${this.agents.size} agents`);
  }

  async createAgent(id, type, config = {}) {
    const agent = new Agent(id, type, config);
    await agent.initialize();
    
    this.agents.set(id, agent);
    
    this.emit('agent:created', {
      id,
      type,
      capabilities: config.capabilities
    });

    console.log(`✅ Created agent: ${id} (${type})`);
    
    return agent;
  }

  async executeAgent(agentId, task, context = {}) {
    const agent = this.agents.get(agentId);
    
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    console.log(`🚀 Executing agent: ${agentId}`);
    console.log(`📝 Task: ${task}`);

    try {
      const startTime = Date.now();
      const result = await agent.execute(task, context);
      const duration = Date.now() - startTime;

      // Store in memory
      await this.memory.store(`agent:${agentId}:task`, {
        task,
        result,
        timestamp: Date.now(),
        duration
      });

      this.emit('agent:executed', {
        agentId,
        task,
        duration,
        success: true
      });

      console.log(`✅ Agent execution completed in ${duration}ms`);

      return {
        success: true,
        agentId,
        result,
        duration
      };
    } catch (error) {
      this.emit('agent:error', {
        agentId,
        task,
        error: error.message
      });

      console.error(`❌ Agent execution failed:`, error.message);
      throw error;
    }
  }

  async collaborateAgents(task, agentIds) {
    console.log(`🤝 Collaborating ${agentIds.length} agents on task`);

    const results = [];
    
    for (const agentId of agentIds) {
      try {
        const result = await this.executeAgent(agentId, task);
        results.push({
          agentId,
          success: true,
          result: result.result
        });
      } catch (error) {
        results.push({
          agentId,
          success: false,
          error: error.message
        });
      }
    }

    // Synthesize results
    const synthesis = {
      task,
      agents: agentIds,
      results,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      combined: this.combineResults(results)
    };

    this.emit('collaboration:complete', synthesis);

    return synthesis;
  }

  combineResults(results) {
    const successful = results.filter(r => r.success);
    
    if (successful.length === 0) {
      return 'All agents failed to complete the task';
    }

    return successful
      .map(r => `[${r.agentId}]: ${JSON.stringify(r.result)}`)
      .join('\n\n');
  }

  getAgent(agentId) {
    return this.agents.get(agentId);
  }

  listAgents() {
    return Array.from(this.agents.entries()).map(([id, agent]) => ({
      id,
      type: agent.type,
      description: agent.config.description,
      capabilities: agent.config.capabilities,
      executionCount: agent.executionCount,
      lastExecution: agent.lastExecution
    }));
  }

  async deleteAgent(agentId) {
    const agent = this.agents.get(agentId);
    
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    this.agents.delete(agentId);
    
    this.emit('agent:deleted', { agentId });
    console.log(`✅ Deleted agent: ${agentId}`);
  }

  getStats() {
    const agents = Array.from(this.agents.values());

    return {
      totalAgents: this.agents.size,
      totalExecutions: agents.reduce((sum, a) => sum + a.executionCount, 0),
      premium: this.premium,
      unlimited: this.unlimited,
      memorySize: this.memory.getSize(),
      agentTypes: {
        workflow: agents.filter(a => a.type === 'workflow').length,
        plugin: agents.filter(a => a.type === 'plugin').length,
        analysis: agents.filter(a => a.type === 'analysis').length,
        integration: agents.filter(a => a.type === 'integration').length,
        executor: agents.filter(a => a.type === 'executor').length
      }
    };
  }
}

module.exports = AgentSystem;
