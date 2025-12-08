/**
 * AgentEngine - Manages unlimited AI agents with intelligent resource allocation
 * Supports parallel execution, context sharing, and dynamic scaling
 */

class AgentEngine {
  constructor() {
    this.agents = new Map();
    this.executionQueue = [];
    this.maxParallelAgents = Infinity; // Unlimited!
    this.contextStore = new Map();
  }

  /**
   * Register a new agent
   */
  registerAgent(agentId, config) {
    const agent = {
      id: agentId,
      type: config.type,
      capabilities: config.capabilities || [],
      status: 'idle',
      createdAt: new Date(),
      executionCount: 0
    };
    
    this.agents.set(agentId, agent);
    console.log(`Agent registered: ${agentId}`);
    return agent;
  }

  /**
   * Execute agent with context awareness
   */
  async executeAgent(agentId, input, context = {}) {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    agent.status = 'running';
    agent.executionCount++;

    try {
      // Merge with global context
      const fullContext = {
        ...this.getGlobalContext(),
        ...context,
        agentId,
        timestamp: new Date()
      };

      // Execute agent logic
      const result = await this.runAgentLogic(agent, input, fullContext);

      // Update context store
      this.updateContext(agentId, result);

      agent.status = 'idle';
      return result;
    } catch (error) {
      agent.status = 'error';
      throw error;
    }
  }

  /**
   * Execute multiple agents in parallel
   */
  async executeParallel(agentConfigs) {
    const promises = agentConfigs.map(config => 
      this.executeAgent(config.agentId, config.input, config.context)
    );
    
    return Promise.all(promises);
  }

  /**
   * Agent logic execution (to be implemented per agent type)
   */
  async runAgentLogic(agent, input, context) {
    // This will be overridden by specific agent implementations
    return {
      agentId: agent.id,
      output: `Processed: ${input}`,
      context
    };
  }

  /**
   * Get global context shared across all agents
   */
  getGlobalContext() {
    const contexts = Array.from(this.contextStore.values());
    return contexts.reduce((acc, ctx) => ({ ...acc, ...ctx }), {});
  }

  /**
   * Update context for an agent
   */
  updateContext(agentId, data) {
    this.contextStore.set(agentId, {
      ...this.contextStore.get(agentId),
      lastUpdate: new Date(),
      data
    });
  }

  /**
   * Get agent statistics
   */
  getStats() {
    return {
      totalAgents: this.agents.size,
      activeAgents: Array.from(this.agents.values()).filter(a => a.status === 'running').length,
      totalExecutions: Array.from(this.agents.values()).reduce((sum, a) => sum + a.executionCount, 0)
    };
  }

  /**
   * Remove agent
   */
  removeAgent(agentId) {
    this.agents.delete(agentId);
    this.contextStore.delete(agentId);
  }
}

module.exports = AgentEngine;
