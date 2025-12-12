/**
 * Workflow Engine Tests
 * Comprehensive test suite for Workflow Engine with retry logic
 */

const workflowEngine = require('../../src/workflows/engine');
const fs = require('fs').promises;
const path = require('path');

describe('Workflow Engine', () => {
  let testWorkflow;

  beforeAll(async () => {
    await workflowEngine.initialize();
  });

  afterAll(async () => {
    // Cleanup test data
    const workflowsPath = path.join(__dirname, '../../data/workflows.json');
    const executionsPath = path.join(__dirname, '../../data/workflow-executions.json');
    
    try {
      await fs.unlink(workflowsPath);
      await fs.unlink(executionsPath);
    } catch (error) {
      // Files might not exist
    }
  });

  describe('Workflow Creation', () => {
    it('should create workflow with valid configuration', async () => {
      const config = {
        name: 'Test Workflow',
        description: 'Test workflow for unit tests',
        steps: [
          {
            type: 'integration',
            name: 'slack',
            action: 'sendMessage',
            params: { channel: 'general' },
          },
          {
            type: 'delay',
            duration: 100,
          },
          {
            type: 'plugin',
            name: 'data-processor',
            function: 'process',
          },
        ],
        config: {
          maxRetries: 3,
          retryDelay: 200,
        },
      };

      const workflow = await workflowEngine.createWorkflow(config);

      expect(workflow).toBeDefined();
      expect(workflow.id).toBeDefined();
      expect(workflow.name).toBe('Test Workflow');
      expect(workflow.steps).toHaveLength(3);
      expect(workflow.config.maxRetries).toBe(3);
      expect(workflow.stats.totalExecutions).toBe(0);

      testWorkflow = workflow;
    });

    it('should reject workflow without name', async () => {
      await expect(
        workflowEngine.createWorkflow({ steps: [] })
      ).rejects.toThrow('Workflow name is required');
    });

    it('should reject workflow without steps', async () => {
      await expect(
        workflowEngine.createWorkflow({ name: 'Test' })
      ).rejects.toThrow('at least one step');
    });

    it('should reject workflow with empty steps array', async () => {
      await expect(
        workflowEngine.createWorkflow({ name: 'Test', steps: [] })
      ).rejects.toThrow('at least one step');
    });

    it('should reject step without type', async () => {
      await expect(
        workflowEngine.createWorkflow({
          name: 'Test',
          steps: [{ name: 'test' }],
        })
      ).rejects.toThrow('type is required');
    });

    it('should reject step with invalid type', async () => {
      await expect(
        workflowEngine.createWorkflow({
          name: 'Test',
          steps: [{ type: 'invalid' }],
        })
      ).rejects.toThrow('invalid type');
    });

    it('should reject integration step without action', async () => {
      await expect(
        workflowEngine.createWorkflow({
          name: 'Test',
          steps: [{ type: 'integration', name: 'slack' }],
        })
      ).rejects.toThrow('require name and action');
    });

    it('should reject delay step without duration', async () => {
      await expect(
        workflowEngine.createWorkflow({
          name: 'Test',
          steps: [{ type: 'delay' }],
        })
      ).rejects.toThrow('require numeric duration');
    });
  });

  describe('Workflow Execution', () => {
    it('should execute workflow successfully', async () => {
      const execution = await workflowEngine.executeWorkflow(testWorkflow.id, {
        test: 'data',
      });

      expect(execution).toBeDefined();
      expect(execution.id).toBeDefined();
      expect(execution.workflowId).toBe(testWorkflow.id);
      expect(execution.status).toBe('completed');
      expect(execution.steps).toHaveLength(3);
      expect(execution.duration).toBeGreaterThan(0);
    });

    it('should execute all steps in sequence', async () => {
      const execution = await workflowEngine.executeWorkflow(testWorkflow.id);

      expect(execution.steps[0].index).toBe(0);
      expect(execution.steps[1].index).toBe(1);
      expect(execution.steps[2].index).toBe(2);
      
      // Each step should have completed
      execution.steps.forEach(step => {
        expect(step.status).toBe('completed');
        expect(step.attempts.length).toBeGreaterThan(0);
      });
    });

    it('should pass input to workflow', async () => {
      const input = { userId: 123, action: 'test' };
      const execution = await workflowEngine.executeWorkflow(
        testWorkflow.id,
        input
      );

      expect(execution.input).toEqual(input);
    });

    it('should reject executing non-existent workflow', async () => {
      await expect(
        workflowEngine.executeWorkflow('invalid_id')
      ).rejects.toThrow('not found');
    });
  });

  describe('Retry Logic', () => {
    it('should retry failed steps', async () => {
      const workflow = await workflowEngine.createWorkflow({
        name: 'Retry Test',
        steps: [
          {
            type: 'integration',
            name: 'slack',
            action: 'sendMessage',
            simulateFailure: true,
            maxRetries: 3,
            retryDelay: 100,
          },
        ],
      });

      const execution = await workflowEngine.executeWorkflow(workflow.id);

      // Should have attempted multiple times
      const step = execution.steps[0];
      expect(step.attempts.length).toBeGreaterThan(1);
      expect(step.attempts.length).toBeLessThanOrEqual(4); // 1 initial + 3 retries

      await workflowEngine.deleteWorkflow(workflow.id);
    });

    it('should use exponential backoff', async () => {
      const workflow = await workflowEngine.createWorkflow({
        name: 'Backoff Test',
        steps: [
          {
            type: 'integration',
            name: 'slack',
            action: 'sendMessage',
            simulateFailure: true,
            maxRetries: 2,
            retryDelay: 100,
          },
        ],
      });

      const startTime = Date.now();
      await workflowEngine.executeWorkflow(workflow.id);
      const duration = Date.now() - startTime;

      // With exponential backoff: 100ms + 200ms = 300ms minimum
      // (plus execution time)
      expect(duration).toBeGreaterThan(250);

      await workflowEngine.deleteWorkflow(workflow.id);
    });

    it('should respect step-level retry config', async () => {
      const workflow = await workflowEngine.createWorkflow({
        name: 'Step Retry Test',
        steps: [
          {
            type: 'integration',
            name: 'slack',
            action: 'sendMessage',
            maxRetries: 1, // Override workflow default
            retryDelay: 50,
          },
        ],
        config: {
          maxRetries: 5, // Workflow default
          retryDelay: 200,
        },
      });

      const execution = await workflowEngine.executeWorkflow(workflow.id);

      // Should use step-level config (1 retry max)
      const step = execution.steps[0];
      expect(step.attempts.length).toBeLessThanOrEqual(2); // 1 initial + 1 retry

      await workflowEngine.deleteWorkflow(workflow.id);
    });
  });

  describe('Step Types', () => {
    it('should execute integration step', async () => {
      const workflow = await workflowEngine.createWorkflow({
        name: 'Integration Test',
        steps: [
          {
            type: 'integration',
            name: 'slack',
            action: 'sendMessage',
          },
        ],
      });

      const execution = await workflowEngine.executeWorkflow(workflow.id);

      expect(execution.steps[0].status).toBe('completed');
      expect(execution.steps[0].output.integration).toBe('slack');

      await workflowEngine.deleteWorkflow(workflow.id);
    });

    it('should execute plugin step', async () => {
      const workflow = await workflowEngine.createWorkflow({
        name: 'Plugin Test',
        steps: [
          {
            type: 'plugin',
            name: 'data-processor',
            function: 'process',
          },
        ],
      });

      const execution = await workflowEngine.executeWorkflow(workflow.id);

      expect(execution.steps[0].status).toBe('completed');
      expect(execution.steps[0].output.plugin).toBe('data-processor');

      await workflowEngine.deleteWorkflow(workflow.id);
    });

    it('should execute custom step', async () => {
      const workflow = await workflowEngine.createWorkflow({
        name: 'Custom Test',
        steps: [
          {
            type: 'custom',
            command: 'test-command',
          },
        ],
      });

      const execution = await workflowEngine.executeWorkflow(workflow.id);

      expect(execution.steps[0].status).toBe('completed');
      expect(execution.steps[0].output.command).toBe('test-command');

      await workflowEngine.deleteWorkflow(workflow.id);
    });

    it('should execute condition step', async () => {
      const workflow = await workflowEngine.createWorkflow({
        name: 'Condition Test',
        steps: [
          {
            type: 'condition',
            condition: 'value > 10',
          },
        ],
      });

      const execution = await workflowEngine.executeWorkflow(workflow.id);

      expect(execution.steps[0].status).toBe('completed');
      expect(execution.steps[0].output).toHaveProperty('result');
      expect(typeof execution.steps[0].output.result).toBe('boolean');

      await workflowEngine.deleteWorkflow(workflow.id);
    });

    it('should execute delay step', async () => {
      const workflow = await workflowEngine.createWorkflow({
        name: 'Delay Test',
        steps: [
          {
            type: 'delay',
            duration: 100,
          },
        ],
      });

      const startTime = Date.now();
      const execution = await workflowEngine.executeWorkflow(workflow.id);
      const duration = Date.now() - startTime;

      expect(execution.steps[0].status).toBe('completed');
      expect(duration).toBeGreaterThanOrEqual(100);

      await workflowEngine.deleteWorkflow(workflow.id);
    });
  });

  describe('Error Handling', () => {
    it('should fail workflow on step failure by default', async () => {
      const workflow = await workflowEngine.createWorkflow({
        name: 'Failure Test',
        steps: [
          {
            type: 'integration',
            name: 'slack',
            action: 'sendMessage',
            simulateFailure: true,
            maxRetries: 0,
          },
          {
            type: 'integration',
            name: 'discord',
            action: 'sendMessage',
          },
        ],
      });

      const execution = await workflowEngine.executeWorkflow(workflow.id);

      expect(execution.status).toBe('failed');
      expect(execution.error).toBeDefined();
      expect(execution.steps).toHaveLength(1); // Should stop after first failure

      await workflowEngine.deleteWorkflow(workflow.id);
    });

    it('should continue on error if configured', async () => {
      const workflow = await workflowEngine.createWorkflow({
        name: 'Continue Test',
        steps: [
          {
            type: 'integration',
            name: 'slack',
            action: 'sendMessage',
            simulateFailure: true,
            maxRetries: 0,
          },
          {
            type: 'integration',
            name: 'discord',
            action: 'sendMessage',
          },
        ],
        config: {
          continueOnError: true,
        },
      });

      const execution = await workflowEngine.executeWorkflow(workflow.id);

      expect(execution.status).toBe('completed');
      expect(execution.steps).toHaveLength(2); // Should execute both steps
      expect(execution.steps[0].status).toBe('failed');
      expect(execution.steps[1].status).toBe('completed');

      await workflowEngine.deleteWorkflow(workflow.id);
    });
  });

  describe('Workflow Management', () => {
    it('should list all workflows', async () => {
      const workflows = await workflowEngine.listWorkflows();

      expect(Array.isArray(workflows)).toBe(true);
      expect(workflows.length).toBeGreaterThan(0);
    });

    it('should filter workflows by name', async () => {
      const workflows = await workflowEngine.listWorkflows({ name: 'Test' });

      expect(workflows.every(w => w.name.includes('Test'))).toBe(true);
    });

    it('should get workflow by ID', async () => {
      const workflow = await workflowEngine.getWorkflow(testWorkflow.id);

      expect(workflow.id).toBe(testWorkflow.id);
      expect(workflow.name).toBe(testWorkflow.name);
    });

    it('should reject getting non-existent workflow', async () => {
      await expect(
        workflowEngine.getWorkflow('invalid_id')
      ).rejects.toThrow('not found');
    });
  });

  describe('Workflow Updates', () => {
    it('should update workflow name', async () => {
      const updated = await workflowEngine.updateWorkflow(testWorkflow.id, {
        name: 'Updated Test Workflow',
      });

      expect(updated.name).toBe('Updated Test Workflow');
    });

    it('should update workflow steps', async () => {
      const newSteps = [
        {
          type: 'integration',
          name: 'discord',
          action: 'sendMessage',
        },
      ];

      const updated = await workflowEngine.updateWorkflow(testWorkflow.id, {
        steps: newSteps,
      });

      expect(updated.steps).toHaveLength(1);
      expect(updated.steps[0].name).toBe('discord');
    });

    it('should reject invalid step updates', async () => {
      await expect(
        workflowEngine.updateWorkflow(testWorkflow.id, {
          steps: [{ type: 'invalid' }],
        })
      ).rejects.toThrow('invalid type');
    });
  });

  describe('Execution History', () => {
    it('should get workflow execution history', async () => {
      const history = await workflowEngine.getWorkflowHistory(testWorkflow.id);

      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
      expect(history[0]).toHaveProperty('id');
      expect(history[0]).toHaveProperty('status');
      expect(history[0]).toHaveProperty('startedAt');
    });

    it('should filter history by status', async () => {
      const history = await workflowEngine.getWorkflowHistory(testWorkflow.id, {
        status: 'completed',
      });

      expect(history.every(e => e.status === 'completed')).toBe(true);
    });

    it('should limit history results', async () => {
      const history = await workflowEngine.getWorkflowHistory(testWorkflow.id, {
        limit: 5,
      });

      expect(history.length).toBeLessThanOrEqual(5);
    });

    it('should get execution by ID', async () => {
      const history = await workflowEngine.getWorkflowHistory(testWorkflow.id);
      const executionId = history[0].id;

      const execution = await workflowEngine.getExecution(executionId);

      expect(execution.id).toBe(executionId);
      expect(execution.workflowId).toBe(testWorkflow.id);
    });
  });

  describe('Workflow Status', () => {
    it('should get workflow status', async () => {
      const status = await workflowEngine.getWorkflowStatus(testWorkflow.id);

      expect(status).toHaveProperty('workflow');
      expect(status).toHaveProperty('stats');
      expect(status).toHaveProperty('recentExecutions');
      expect(status.workflow.id).toBe(testWorkflow.id);
      expect(Array.isArray(status.recentExecutions)).toBe(true);
    });
  });

  describe('Workflow Deletion', () => {
    it('should delete workflow successfully', async () => {
      const result = await workflowEngine.deleteWorkflow(testWorkflow.id);

      expect(result.success).toBe(true);

      await expect(
        workflowEngine.getWorkflow(testWorkflow.id)
      ).rejects.toThrow('not found');
    });
  });

  describe('Persistence', () => {
    it('should persist workflows to disk', async () => {
      const workflow = await workflowEngine.createWorkflow({
        name: 'Persistence Test',
        steps: [{ type: 'custom', command: 'test' }],
      });

      await workflowEngine.persistWorkflows();

      const dataPath = path.join(__dirname, '../../data/workflows.json');
      const data = await fs.readFile(dataPath, 'utf8');
      const savedWorkflows = JSON.parse(data);

      expect(savedWorkflows.some(w => w.id === workflow.id)).toBe(true);

      await workflowEngine.deleteWorkflow(workflow.id);
    });

    it('should persist executions to disk', async () => {
      const workflow = await workflowEngine.createWorkflow({
        name: 'Execution Persistence Test',
        steps: [{ type: 'custom', command: 'test' }],
      });

      const execution = await workflowEngine.executeWorkflow(workflow.id);

      await workflowEngine.persistExecutions();

      const dataPath = path.join(__dirname, '../../data/workflow-executions.json');
      const data = await fs.readFile(dataPath, 'utf8');
      const savedExecutions = JSON.parse(data);

      expect(savedExecutions.some(e => e.id === execution.id)).toBe(true);

      await workflowEngine.deleteWorkflow(workflow.id);
    });
  });
});
