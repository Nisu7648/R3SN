/**
 * R3SN API Test Suite
 * Comprehensive tests for all API endpoints
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const User = require('../models/User');
const Agent = require('../models/Agent');
const Integration = require('../models/Integration');
const Workflow = require('../models/Workflow');

let authToken;
let testUser;
let testAgent;
let testWorkflow;

beforeAll(async () => {
  // Connect to test database
  await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/r3sn_test');
});

afterAll(async () => {
  // Cleanup and disconnect
  await User.deleteMany({});
  await Agent.deleteMany({});
  await Integration.deleteMany({});
  await Workflow.deleteMany({});
  await mongoose.connection.close();
});

describe('Authentication API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('test@example.com');
      
      authToken = res.body.token;
      testUser = res.body.user;
    });

    it('should reject duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject weak password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test2@example.com',
          password: '123',
          name: 'Test User'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('8 characters');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should get current user', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe('test@example.com');
    });

    it('should reject without token', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.statusCode).toBe(401);
    });
  });
});

describe('Agents API', () => {
  describe('POST /api/agents', () => {
    it('should create a new agent', async () => {
      const res = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Agent',
          type: 'executor',
          capabilities: ['data-processing']
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.agent.name).toBe('Test Agent');
      
      testAgent = res.body.agent;
    });
  });

  describe('GET /api/agents', () => {
    it('should list all agents', async () => {
      const res = await request(app)
        .get('/api/agents')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.agents)).toBe(true);
    });
  });

  describe('POST /api/agents/:id/execute', () => {
    it('should execute agent', async () => {
      const res = await request(app)
        .post(`/api/agents/${testAgent._id}/execute`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          input: { task: 'test task' }
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.result).toBeDefined();
    });
  });

  describe('POST /api/agents/execute-prompt', () => {
    it('should execute universal prompt', async () => {
      const res = await request(app)
        .post('/api/agents/execute-prompt')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          prompt: 'Analyze this data: [1,2,3,4,5]'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});

describe('Integrations API', () => {
  describe('GET /api/integrations', () => {
    it('should list integrations', async () => {
      const res = await request(app)
        .get('/api/integrations');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.integrations)).toBe(true);
    });

    it('should filter by category', async () => {
      const res = await request(app)
        .get('/api/integrations?category=productivity');

      expect(res.statusCode).toBe(200);
      expect(res.body.integrations.every(i => i.category === 'productivity')).toBe(true);
    });
  });

  describe('GET /api/integrations/categories', () => {
    it('should get all categories', async () => {
      const res = await request(app)
        .get('/api/integrations/categories');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.categories)).toBe(true);
    });
  });
});

describe('Workflows API', () => {
  describe('POST /api/automations', () => {
    it('should create workflow', async () => {
      const res = await request(app)
        .post('/api/automations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Workflow',
          description: 'Test workflow description',
          trigger: { type: 'manual' },
          steps: [
            { type: 'agent', action: 'process' }
          ]
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.workflow.name).toBe('Test Workflow');
      
      testWorkflow = res.body.workflow;
    });
  });

  describe('GET /api/automations', () => {
    it('should list workflows', async () => {
      const res = await request(app)
        .get('/api/automations')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.workflows)).toBe(true);
    });
  });

  describe('POST /api/automations/:id/execute', () => {
    it('should execute workflow', async () => {
      const res = await request(app)
        .post(`/api/automations/${testWorkflow._id}/execute`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ input: {} });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});

describe('System Endpoints', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/health');

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.database).toBeDefined();
    });
  });

  describe('GET /api/stats', () => {
    it('should return system stats', async () => {
      const res = await request(app).get('/api/stats');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stats).toBeDefined();
    });
  });
});

describe('Rate Limiting', () => {
  it('should enforce rate limits', async () => {
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

describe('Error Handling', () => {
  it('should handle 404 errors', async () => {
    const res = await request(app)
      .get('/api/nonexistent')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should handle validation errors', async () => {
    const res = await request(app)
      .post('/api/agents')
      .set('Authorization', `Bearer ${authToken}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
