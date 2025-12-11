/**
 * End-to-End Integration Tests
 * Tests complete workflows from start to finish
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');

let authToken;
let testUser;
let testAgent;
let testWorkflow;
let testIntegration;
let testPlugin;

describe('End-to-End Integration Tests', () => {
  
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/r3sn_test');
  });

  afterAll(async () => {
    // Cleanup
    await mongoose.connection.close();
  });

  describe('Complete User Journey', () => {
    
    it('1. User Registration', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'e2e@test.com',
          password: 'SecurePass123!',
          name: 'E2E Test User'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      
      authToken = res.body.token;
      testUser = res.body.user;
    });

    it('2. User Login', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'e2e@test.com',
          password: 'SecurePass123!'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it('3. Get User Profile', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.user.email).toBe('e2e@test.com');
    });

    it('4. Generate API Key', async () => {
      const res = await request(app)
        .post('/api/auth/generate-api-key')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.apiKey).toBeDefined();
    });
  });

  describe('Agent Workflow', () => {
    
    it('1. Create AI Agent', async () => {
      const res = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'E2E Test Agent',
          type: 'executor',
          capabilities: ['data-processing', 'api-calls']
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.agent.name).toBe('E2E Test Agent');
      
      testAgent = res.body.agent;
    });

    it('2. List All Agents', async () => {
      const res = await request(app)
        .get('/api/agents')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.agents.length).toBeGreaterThan(0);
    });

    it('3. Get Agent Details', async () => {
      const res = await request(app)
        .get(`/api/agents/${testAgent._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.agent._id).toBe(testAgent._id);
    });

    it('4. Execute Agent', async () => {
      const res = await request(app)
        .post(`/api/agents/${testAgent._id}/execute`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          input: { task: 'Process test data', data: [1, 2, 3, 4, 5] }
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.result).toBeDefined();
    });

    it('5. Execute Universal Prompt', async () => {
      const res = await request(app)
        .post('/api/agents/execute-prompt')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          prompt: 'Calculate the sum of numbers 1 through 10'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('6. Get Agent Execution History', async () => {
      const res = await request(app)
        .get(`/api/agents/${testAgent._id}/executions`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.executions)).toBe(true);
    });

    it('7. Update Agent', async () => {
      const res = await request(app)
        .put(`/api/agents/${testAgent._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated E2E Agent',
          capabilities: ['data-processing', 'api-calls', 'file-operations']
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.agent.name).toBe('Updated E2E Agent');
    });
  });

  describe('Integration Workflow', () => {
    
    it('1. List All Integrations', async () => {
      const res = await request(app)
        .get('/api/integrations');

      expect(res.statusCode).toBe(200);
      expect(res.body.integrations.length).toBeGreaterThan(0);
      
      testIntegration = res.body.integrations[0];
    });

    it('2. Get Integration Categories', async () => {
      const res = await request(app)
        .get('/api/integrations/categories');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.categories)).toBe(true);
    });

    it('3. Get Integration Details', async () => {
      const res = await request(app)
        .get(`/api/integrations/${testIntegration._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.integration._id).toBe(testIntegration._id);
    });

    it('4. Search Integrations', async () => {
      const res = await request(app)
        .get('/api/integrations/search?q=slack');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.integrations)).toBe(true);
    });

    it('5. Filter by Category', async () => {
      const res = await request(app)
        .get('/api/integrations?category=productivity');

      expect(res.statusCode).toBe(200);
      expect(res.body.integrations.every(i => i.category === 'productivity')).toBe(true);
    });
  });

  describe('Workflow Automation', () => {
    
    it('1. Create Workflow', async () => {
      const res = await request(app)
        .post('/api/automations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'E2E Test Workflow',
          description: 'End-to-end test workflow',
          trigger: {
            type: 'manual'
          },
          steps: [
            {
              type: 'agent',
              agentId: testAgent._id,
              action: 'process',
              config: {}
            },
            {
              type: 'integration',
              integrationId: testIntegration._id,
              action: 'execute',
              config: {}
            }
          ]
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.workflow.name).toBe('E2E Test Workflow');
      
      testWorkflow = res.body.workflow;
    });

    it('2. List Workflows', async () => {
      const res = await request(app)
        .get('/api/automations')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.workflows.length).toBeGreaterThan(0);
    });

    it('3. Get Workflow Details', async () => {
      const res = await request(app)
        .get(`/api/automations/${testWorkflow._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.workflow._id).toBe(testWorkflow._id);
    });

    it('4. Execute Workflow', async () => {
      const res = await request(app)
        .post(`/api/automations/${testWorkflow._id}/execute`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          input: { test: 'data' }
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('5. Get Workflow Executions', async () => {
      const res = await request(app)
        .get(`/api/automations/${testWorkflow._id}/executions`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.executions)).toBe(true);
    });

    it('6. Get Workflow Analytics', async () => {
      const res = await request(app)
        .get(`/api/automations/${testWorkflow._id}/analytics`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.analytics).toBeDefined();
    });

    it('7. Duplicate Workflow', async () => {
      const res = await request(app)
        .post(`/api/automations/${testWorkflow._id}/duplicate`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(201);
      expect(res.body.workflow.name).toContain('Copy');
    });

    it('8. Update Workflow', async () => {
      const res = await request(app)
        .put(`/api/automations/${testWorkflow._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated E2E Workflow',
          description: 'Updated description'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.workflow.name).toBe('Updated E2E Workflow');
    });
  });

  describe('Plugin Workflow', () => {
    
    it('1. Generate Plugin', async () => {
      const res = await request(app)
        .post('/api/plugins/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          appName: 'TestApp',
          appPackage: 'com.test.app',
          actions: ['send_message', 'get_data']
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.plugin).toBeDefined();
      
      testPlugin = res.body.plugin;
    });

    it('2. List Plugins', async () => {
      const res = await request(app)
        .get('/api/plugins')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.plugins)).toBe(true);
    });

    it('3. Get Plugin Details', async () => {
      const res = await request(app)
        .get(`/api/plugins/${testPlugin._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.plugin._id).toBe(testPlugin._id);
    });

    it('4. Test Plugin', async () => {
      const res = await request(app)
        .post(`/api/plugins/${testPlugin._id}/test`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          action: 'send_message',
          params: { message: 'test' }
        });

      expect(res.statusCode).toBe(200);
    });

    it('5. Get Plugin Actions', async () => {
      const res = await request(app)
        .get(`/api/plugins/${testPlugin._id}/actions`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.actions)).toBe(true);
    });
  });

  describe('Execution Monitoring', () => {
    
    it('1. List All Executions', async () => {
      const res = await request(app)
        .get('/api/executions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.executions)).toBe(true);
    });

    it('2. Get Analytics Overview', async () => {
      const res = await request(app)
        .get('/api/executions/analytics/overview?days=7')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.analytics).toBeDefined();
    });

    it('3. Get Execution Stats', async () => {
      const res = await request(app)
        .get('/api/executions/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.stats).toBeDefined();
    });
  });

  describe('System Health', () => {
    
    it('1. Health Check', async () => {
      const res = await request(app).get('/health');

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('healthy');
    });

    it('2. System Stats', async () => {
      const res = await request(app).get('/api/stats');

      expect(res.statusCode).toBe(200);
      expect(res.body.stats).toBeDefined();
    });
  });

  describe('Cleanup', () => {
    
    it('1. Delete Plugin', async () => {
      const res = await request(app)
        .delete(`/api/plugins/${testPlugin._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
    });

    it('2. Delete Workflow', async () => {
      const res = await request(app)
        .delete(`/api/automations/${testWorkflow._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
    });

    it('3. Delete Agent', async () => {
      const res = await request(app)
        .delete(`/api/agents/${testAgent._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
    });
  });

  describe('Error Handling', () => {
    
    it('Should handle 404 errors', async () => {
      const res = await request(app)
        .get('/api/nonexistent')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(404);
    });

    it('Should handle unauthorized access', async () => {
      const res = await request(app)
        .get('/api/agents');

      expect(res.statusCode).toBe(401);
    });

    it('Should handle invalid data', async () => {
      const res = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
    });

    it('Should handle rate limiting', async () => {
      const requests = [];
      
      // Make 101 requests (limit is 100)
      for (let i = 0; i < 101; i++) {
        requests.push(
          request(app)
            .get('/api/agents')
            .set('Authorization', `Bearer ${authToken}`)
        );
      }

      const responses = await Promise.all(requests);
      const rateLimited = responses.some(r => r.statusCode === 429);
      
      expect(rateLimited).toBe(true);
    });
  });
});
