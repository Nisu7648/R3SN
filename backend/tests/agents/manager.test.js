/**
 * Agent Manager Tests
 * Comprehensive test suite for AI Agent Executor
 */

const agentManager = require('../../src/agents/manager');
const fs = require('fs').promises;
const path = require('path');

describe('Agent Manager', () => {
  let testAgent;

  beforeAll(async () => {
    // Initialize manager
    await agentManager.initialize();
  });

  afterAll(async () => {
    // Cleanup test data
    const dataPath = path.join(__dirname, '../../data/agents.json');
    try {
      await fs.unlink(dataPath);
    } catch (error) {
      // File might not exist
    }
  });

  describe('Agent Creation', () => {
    it('should create agent with valid configuration', async () => {
      const config = {
        name: 'Test Agent',
        description: 'Test agent for unit tests',
        tasks: [
          {
            type: 'integration',
            name: 'slack',
            action: 'sendMessage',
            params: { channel: 'general', text: 'Hello' },
          },
        ],
      };

      const agent = await agentManager.createAgent(config);

      expect(agent).toBeDefined();
      expect(agent.id).toBeDefined();
      expect(agent.name).toBe('Test Agent');
      expect(agent.status).toBe('stopped');
      expect(agent.tasks).toHaveLength(1);
      expect(agent.stats.totalExecutions).toBe(0);

      testAgent = agent;
    });

    it('should reject agent without name', async () => {
      await expect(
        agentManager.createAgent({ tasks: [] })
      ).rejects.toThrow('Agent name is required');
    });

    it('should reject agent without tasks array', async () => {
      await expect(
        agentManager.createAgent({ name: 'Test' })
      ).rejects.toThrow('Tasks must be an array');
    });

    it('should reject agent with invalid task type', async () => {
      await expect(
        agentManager.createAgent({
          name: 'Test',
          tasks: [{ type: 'invalid' }],
        })
      ).rejects.toThrow('Invalid task type');
    });

    it('should reject integration task without name', async () => {
      await expect(
        agentManager.createAgent({
          name: 'Test',
          tasks: [{ type: 'integration', action: 'test' }],
        })
      ).rejects.toThrow('Integration tasks require name and action');
    });

    it('should reject plugin task without function', async () => {
      await expect(
        agentManager.createAgent({
          name: 'Test',
          tasks: [{ type: 'plugin', name: 'test' }],
        })
      ).rejects.toThrow('Plugin tasks require name and function');
    });
  });

  describe('Agent Lifecycle', () => {
    it('should start agent successfully', async () => {
      const agent = await agentManager.startAgent(testAgent.id);

      expect(agent.status).toBe('running');
      expect(agent.logs.length).toBeGreaterThan(0);
      expect(agent.logs[agent.logs.length - 1].message).toContain('started');
    });

    it('should reject starting already running agent', async () => {
      await expect(
        agentManager.startAgent(testAgent.id)
      ).rejects.toThrow('already running');
    });

    it('should stop agent successfully', async () => {
      const agent = await agentManager.stopAgent(testAgent.id);

      expect(agent.status).toBe('stopped');
    });

    it('should reject stopping already stopped agent', async () => {
      await expect(
        agentManager.stopAgent(testAgent.id)
      ).rejects.toThrow('already stopped');
    });

    it('should reject starting non-existent agent', async () => {
      await expect(
        agentManager.startAgent('invalid_id')
      ).rejects.toThrow('not found');
    });
  });

  describe('Task Execution', () => {
    it('should execute Slack integration task', async () => {
      const task = {
        type: 'integration',
        name: 'slack',
        action: 'sendMessage',
        params: { channel: 'general', text: 'Test' },
      };

      const result = await agentManager.executeTask(task);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Slack');
      expect(result.data).toBeDefined();
    });

    it('should execute Discord integration task', async () => {
      const task = {
        type: 'integration',
        name: 'discord',
        action: 'sendMessage',
        params: { channel_id: '123', content: 'Test' },
      };

      const result = await agentManager.executeTask(task);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Discord');
    });

    it('should execute plugin task', async () => {
      const task = {
        type: 'plugin',
        name: 'data-processor',
        function: 'process',
        params: {},
      };

      const result = await agentManager.executeTask(task);

      expect(result.success).toBe(true);
      expect(result.message).toContain('processed');
    });

    it('should execute custom task', async () => {
      const task = {
        type: 'custom',
        command: 'test-command',
        params: { key: 'value' },
      };

      const result = await agentManager.executeTask(task);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Custom command');
    });

    it('should reject unknown integration', async () => {
      const task = {
        type: 'integration',
        name: 'unknown',
        action: 'test',
      };

      await expect(
        agentManager.executeTask(task)
      ).rejects.toThrow('Unknown integration');
    });

    it('should reject unknown action', async () => {
      const task = {
        type: 'integration',
        name: 'slack',
        action: 'unknownAction',
      };

      await expect(
        agentManager.executeTask(task)
      ).rejects.toThrow('Unknown action');
    });
  });

  describe('Agent Management', () => {
    it('should list all agents', async () => {
      const agents = await agentManager.listAgents();

      expect(Array.isArray(agents)).toBe(true);
      expect(agents.length).toBeGreaterThan(0);
    });

    it('should filter agents by status', async () => {
      const agents = await agentManager.listAgents({ status: 'stopped' });

      expect(agents.every(a => a.status === 'stopped')).toBe(true);
    });

    it('should filter agents by name', async () => {
      const agents = await agentManager.listAgents({ name: 'Test' });

      expect(agents.every(a => a.name.includes('Test'))).toBe(true);
    });

    it('should get agent by ID', async () => {
      const agent = await agentManager.getAgent(testAgent.id);

      expect(agent.id).toBe(testAgent.id);
      expect(agent.name).toBe(testAgent.name);
    });

    it('should reject getting non-existent agent', async () => {
      await expect(
        agentManager.getAgent('invalid_id')
      ).rejects.toThrow('not found');
    });
  });

  describe('Agent Updates', () => {
    it('should update agent name', async () => {
      const updated = await agentManager.updateAgent(testAgent.id, {
        name: 'Updated Test Agent',
      });

      expect(updated.name).toBe('Updated Test Agent');
    });

    it('should update agent tasks', async () => {
      const newTasks = [
        {
          type: 'integration',
          name: 'discord',
          action: 'sendMessage',
        },
      ];

      const updated = await agentManager.updateAgent(testAgent.id, {
        tasks: newTasks,
      });

      expect(updated.tasks).toHaveLength(1);
      expect(updated.tasks[0].name).toBe('discord');
    });

    it('should reject updating running agent', async () => {
      await agentManager.startAgent(testAgent.id);

      await expect(
        agentManager.updateAgent(testAgent.id, { name: 'New Name' })
      ).rejects.toThrow('Cannot update running agent');

      await agentManager.stopAgent(testAgent.id);
    });

    it('should reject invalid task updates', async () => {
      await expect(
        agentManager.updateAgent(testAgent.id, {
          tasks: [{ type: 'invalid' }],
        })
      ).rejects.toThrow('Invalid task type');
    });
  });

  describe('Agent Logs', () => {
    it('should get agent logs', async () => {
      const logs = await agentManager.getAgentLogs(testAgent.id);

      expect(Array.isArray(logs)).toBe(true);
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0]).toHaveProperty('timestamp');
      expect(logs[0]).toHaveProperty('level');
      expect(logs[0]).toHaveProperty('message');
    });

    it('should filter logs by level', async () => {
      const logs = await agentManager.getAgentLogs(testAgent.id, {
        level: 'info',
      });

      expect(logs.every(log => log.level === 'info')).toBe(true);
    });

    it('should limit log results', async () => {
      const logs = await agentManager.getAgentLogs(testAgent.id, {
        limit: 5,
      });

      expect(logs.length).toBeLessThanOrEqual(5);
    });

    it('should clear agent logs', async () => {
      const result = await agentManager.clearAgentLogs(testAgent.id);

      expect(result.success).toBe(true);

      const logs = await agentManager.getAgentLogs(testAgent.id);
      expect(logs.length).toBe(0);
    });
  });

  describe('Agent Deletion', () => {
    it('should reject deleting running agent', async () => {
      await agentManager.startAgent(testAgent.id);

      await expect(
        agentManager.deleteAgent(testAgent.id)
      ).rejects.toThrow('Cannot delete running agent');

      await agentManager.stopAgent(testAgent.id);
    });

    it('should delete agent successfully', async () => {
      const result = await agentManager.deleteAgent(testAgent.id);

      expect(result.success).toBe(true);

      await expect(
        agentManager.getAgent(testAgent.id)
      ).rejects.toThrow('not found');
    });
  });

  describe('Statistics', () => {
    it('should get agent statistics', async () => {
      const stats = await agentManager.getStatistics();

      expect(stats).toHaveProperty('totalAgents');
      expect(stats).toHaveProperty('runningAgents');
      expect(stats).toHaveProperty('stoppedAgents');
      expect(stats).toHaveProperty('totalExecutions');
      expect(typeof stats.totalAgents).toBe('number');
    });
  });

  describe('Persistence', () => {
    it('should persist agents to disk', async () => {
      const agent = await agentManager.createAgent({
        name: 'Persistence Test',
        tasks: [{ type: 'custom', command: 'test' }],
      });

      await agentManager.persist();

      const dataPath = path.join(__dirname, '../../data/agents.json');
      const data = await fs.readFile(dataPath, 'utf8');
      const savedAgents = JSON.parse(data);

      expect(savedAgents.some(a => a.id === agent.id)).toBe(true);

      await agentManager.deleteAgent(agent.id);
    });
  });
});
