/**
 * AI Agent Manager
 * Safe & Simulated - Deterministic rule-based engine
 * No external LLM calls - all responses are simulated
 */

const fs = require('fs').promises;
const path = require('path');
const EventEmitter = require('events');

class AgentManager extends EventEmitter {
  constructor() {
    super();
    this.agents = new Map();
    this.dataPath = path.join(__dirname, '../../data/agents.json');
    this.isInitialized = false;
  }

  /**
   * Initialize manager and load persisted agents
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Ensure data directory exists
      const dataDir = path.dirname(this.dataPath);
      await fs.mkdir(dataDir, { recursive: true });

      // Load persisted agents
      try {
        const data = await fs.readFile(this.dataPath, 'utf8');
        const savedAgents = JSON.parse(data);
        
        for (const agent of savedAgents) {
          this.agents.set(agent.id, {
            ...agent,
            status: 'stopped', // Reset status on load
            logs: agent.logs || [],
          });
        }
      } catch (error) {
        // File doesn't exist yet, that's okay
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }

      this.isInitialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize AgentManager: ${error.message}`);
    }
  }

  /**
   * Persist agents to disk
   */
  async persist() {
    try {
      const agentsArray = Array.from(this.agents.values());
      await fs.writeFile(
        this.dataPath,
        JSON.stringify(agentsArray, null, 2),
        'utf8'
      );
    } catch (error) {
      throw new Error(`Failed to persist agents: ${error.message}`);
    }
  }

  /**
   * Create new agent
   */
  async createAgent(config) {
    await this.initialize();

    const { name, description, tasks = [] } = config;

    if (!name) {
      throw new Error('Agent name is required');
    }

    if (!Array.isArray(tasks)) {
      throw new Error('Tasks must be an array');
    }

    // Validate tasks
    for (const task of tasks) {
      this.validateTask(task);
    }

    const agent = {
      id: this.generateId(),
      name,
      description: description || '',
      tasks,
      status: 'stopped',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      logs: [],
      stats: {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        lastExecutionAt: null,
      },
    };

    this.agents.set(agent.id, agent);
    await this.persist();

    this.emit('agent:created', agent);
    return agent;
  }

  /**
   * Validate task structure
   */
  validateTask(task) {
    if (!task.type) {
      throw new Error('Task type is required');
    }

    if (!['integration', 'plugin', 'custom'].includes(task.type)) {
      throw new Error(`Invalid task type: ${task.type}`);
    }

    if (task.type === 'integration') {
      if (!task.name || !task.action) {
        throw new Error('Integration tasks require name and action');
      }
    }

    if (task.type === 'plugin') {
      if (!task.name || !task.function) {
        throw new Error('Plugin tasks require name and function');
      }
    }
  }

  /**
   * Start agent
   */
  async startAgent(agentId) {
    await this.initialize();

    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    if (agent.status === 'running') {
      throw new Error('Agent is already running');
    }

    agent.status = 'running';
    agent.updatedAt = new Date().toISOString();
    
    this.addLog(agent, 'info', 'Agent started');
    await this.persist();

    this.emit('agent:started', agent);

    // Start processing tasks
    this.processTasks(agent);

    return agent;
  }

  /**
   * Stop agent
   */
  async stopAgent(agentId) {
    await this.initialize();

    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    if (agent.status === 'stopped') {
      throw new Error('Agent is already stopped');
    }

    agent.status = 'stopped';
    agent.updatedAt = new Date().toISOString();
    
    this.addLog(agent, 'info', 'Agent stopped');
    await this.persist();

    this.emit('agent:stopped', agent);

    return agent;
  }

  /**
   * Process agent tasks
   */
  async processTasks(agent) {
    if (agent.status !== 'running') return;

    this.addLog(agent, 'info', `Processing ${agent.tasks.length} tasks`);

    for (let i = 0; i < agent.tasks.length; i++) {
      if (agent.status !== 'running') {
        this.addLog(agent, 'info', 'Agent stopped, halting task processing');
        break;
      }

      const task = agent.tasks[i];
      
      try {
        this.addLog(agent, 'info', `Executing task ${i + 1}: ${task.type} - ${task.name}`);
        
        const result = await this.executeTask(task);
        
        this.addLog(agent, 'success', `Task ${i + 1} completed: ${result.message}`);
        
        agent.stats.successfulExecutions++;
      } catch (error) {
        this.addLog(agent, 'error', `Task ${i + 1} failed: ${error.message}`);
        agent.stats.failedExecutions++;
      }
    }

    agent.stats.totalExecutions++;
    agent.stats.lastExecutionAt = new Date().toISOString();
    
    this.addLog(agent, 'info', 'All tasks processed');
    
    await this.persist();
    this.emit('agent:completed', agent);
  }

  /**
   * Execute single task (simulated)
   */
  async executeTask(task) {
    // Simulate execution delay
    await this.sleep(100);

    if (task.type === 'integration') {
      return this.simulateIntegration(task);
    }

    if (task.type === 'plugin') {
      return this.simulatePlugin(task);
    }

    if (task.type === 'custom') {
      return this.simulateCustom(task);
    }

    throw new Error(`Unknown task type: ${task.type}`);
  }

  /**
   * Simulate integration execution
   */
  simulateIntegration(task) {
    const { name, action, params = {} } = task;

    // Deterministic response mapping
    const responses = {
      slack: {
        sendMessage: () => ({
          success: true,
          message: `Message sent to Slack (simulated)`,
          data: { channel: params.channel || 'general', ts: Date.now() },
        }),
        getChannels: () => ({
          success: true,
          message: 'Channels retrieved (simulated)',
          data: { channels: ['general', 'random', 'engineering'] },
        }),
      },
      discord: {
        sendMessage: () => ({
          success: true,
          message: 'Message sent to Discord (simulated)',
          data: { channel_id: params.channel_id || '123', id: Date.now() },
        }),
        getChannels: () => ({
          success: true,
          message: 'Channels retrieved (simulated)',
          data: { channels: ['general', 'announcements'] },
        }),
      },
      gmail: {
        sendEmail: () => ({
          success: true,
          message: 'Email sent (simulated)',
          data: { messageId: `msg_${Date.now()}` },
        }),
        getEmails: () => ({
          success: true,
          message: 'Emails retrieved (simulated)',
          data: { emails: [], count: 0 },
        }),
      },
      webhook: {
        post: () => ({
          success: true,
          message: 'Webhook posted (simulated)',
          data: { status: 200 },
        }),
      },
    };

    if (!responses[name]) {
      throw new Error(`Unknown integration: ${name}`);
    }

    if (!responses[name][action]) {
      throw new Error(`Unknown action for ${name}: ${action}`);
    }

    return responses[name][action]();
  }

  /**
   * Simulate plugin execution
   */
  simulatePlugin(task) {
    const { name, function: func, params = {} } = task;

    // Deterministic response mapping
    const responses = {
      'data-processor': {
        process: () => ({
          success: true,
          message: 'Data processed (simulated)',
          data: { processed: true, records: 100 },
        }),
        transform: () => ({
          success: true,
          message: 'Data transformed (simulated)',
          data: { transformed: true },
        }),
      },
      'file-handler': {
        read: () => ({
          success: true,
          message: 'File read (simulated)',
          data: { content: 'simulated file content' },
        }),
        write: () => ({
          success: true,
          message: 'File written (simulated)',
          data: { path: '/tmp/file.txt' },
        }),
      },
    };

    if (!responses[name]) {
      // Generic response for unknown plugins
      return {
        success: true,
        message: `Plugin ${name}.${func} executed (simulated)`,
        data: { result: 'simulated' },
      };
    }

    if (!responses[name][func]) {
      throw new Error(`Unknown function for plugin ${name}: ${func}`);
    }

    return responses[name][func]();
  }

  /**
   * Simulate custom task execution
   */
  simulateCustom(task) {
    const { command, params = {} } = task;

    return {
      success: true,
      message: `Custom command executed: ${command} (simulated)`,
      data: { result: 'simulated', params },
    };
  }

  /**
   * Get agent by ID
   */
  async getAgent(agentId) {
    await this.initialize();

    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    return agent;
  }

  /**
   * List all agents
   */
  async listAgents(filters = {}) {
    await this.initialize();

    let agents = Array.from(this.agents.values());

    // Apply filters
    if (filters.status) {
      agents = agents.filter(a => a.status === filters.status);
    }

    if (filters.name) {
      agents = agents.filter(a => 
        a.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    return agents;
  }

  /**
   * Update agent
   */
  async updateAgent(agentId, updates) {
    await this.initialize();

    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    if (agent.status === 'running') {
      throw new Error('Cannot update running agent. Stop it first.');
    }

    // Validate tasks if provided
    if (updates.tasks) {
      for (const task of updates.tasks) {
        this.validateTask(task);
      }
    }

    // Update allowed fields
    const allowedFields = ['name', 'description', 'tasks'];
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        agent[field] = updates[field];
      }
    }

    agent.updatedAt = new Date().toISOString();
    
    await this.persist();
    this.emit('agent:updated', agent);

    return agent;
  }

  /**
   * Delete agent
   */
  async deleteAgent(agentId) {
    await this.initialize();

    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    if (agent.status === 'running') {
      throw new Error('Cannot delete running agent. Stop it first.');
    }

    this.agents.delete(agentId);
    await this.persist();

    this.emit('agent:deleted', { id: agentId });

    return { success: true, message: 'Agent deleted' };
  }

  /**
   * Get agent logs
   */
  async getAgentLogs(agentId, options = {}) {
    await this.initialize();

    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    let logs = [...agent.logs];

    // Apply filters
    if (options.level) {
      logs = logs.filter(log => log.level === options.level);
    }

    if (options.limit) {
      logs = logs.slice(-options.limit);
    }

    return logs;
  }

  /**
   * Clear agent logs
   */
  async clearAgentLogs(agentId) {
    await this.initialize();

    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    agent.logs = [];
    await this.persist();

    return { success: true, message: 'Logs cleared' };
  }

  /**
   * Add log entry to agent
   */
  addLog(agent, level, message) {
    const log = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    agent.logs.push(log);

    // Keep only last 1000 logs
    if (agent.logs.length > 1000) {
      agent.logs = agent.logs.slice(-1000);
    }

    this.emit('agent:log', { agentId: agent.id, log });
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get statistics
   */
  async getStatistics() {
    await this.initialize();

    const agents = Array.from(this.agents.values());

    return {
      totalAgents: agents.length,
      runningAgents: agents.filter(a => a.status === 'running').length,
      stoppedAgents: agents.filter(a => a.status === 'stopped').length,
      totalExecutions: agents.reduce((sum, a) => sum + a.stats.totalExecutions, 0),
      successfulExecutions: agents.reduce((sum, a) => sum + a.stats.successfulExecutions, 0),
      failedExecutions: agents.reduce((sum, a) => sum + a.stats.failedExecutions, 0),
    };
  }
}

// Singleton instance
const agentManager = new AgentManager();

module.exports = agentManager;
