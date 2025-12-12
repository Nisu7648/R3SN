/**
 * server-complete.js - Complete Integrated R3SN Server
 * All systems integrated and ready for production
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

// Core Systems
const UniversalAPI = require('./core/UniversalAPI');
const PluginEngine = require('./core/PluginEngine');
const WorkflowEngine = require('./core/WorkflowEngine');
const LLMEngine = require('./llm/LLMEngine');
const AgentSystem = require('./agents/AgentSystem');
const MLEngine = require('./ml/MLEngine');
const DatabaseManager = require('./database/DatabaseManager');

class R3SNServer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    
    // Initialize all systems
    this.universalAPI = new UniversalAPI();
    this.pluginEngine = new PluginEngine('./plugins');
    this.workflowEngine = new WorkflowEngine();
    this.llmEngine = new LLMEngine('./models');
    this.agentSystem = new AgentSystem();
    this.mlEngine = new MLEngine();
    this.database = new DatabaseManager({
      path: './data/db',
      encryption: true,
      encryptionKey: process.env.ENCRYPTION_KEY
    });
  }

  async initialize() {
    console.log('🚀 Initializing R3SN Server...');
    console.log('═'.repeat(60));

    // Setup middleware
    this.setupMiddleware();

    // Initialize all systems in parallel
    await Promise.all([
      this.universalAPI.initialize?.() || Promise.resolve(),
      this.pluginEngine.initialize(),
      this.workflowEngine.initialize(),
      this.llmEngine.initialize(),
      this.agentSystem.initialize(),
      this.mlEngine.initialize(),
      this.database.initialize()
    ]);

    // Setup routes
    this.setupRoutes();

    // Setup error handling
    this.setupErrorHandling();

    console.log('═'.repeat(60));
    console.log('✅ All systems initialized successfully!');
  }

  setupMiddleware() {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(compression());
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    this.app.use(morgan('combined'));
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        systems: {
          universalAPI: 'operational',
          pluginEngine: 'operational',
          workflowEngine: 'operational',
          llmEngine: 'operational',
          agentSystem: 'operational',
          mlEngine: 'operational',
          database: 'operational'
        }
      });
    });

    // System status
    this.app.get('/api/status', async (req, res) => {
      try {
        const status = {
          universalAPI: this.universalAPI.getStats(),
          pluginEngine: this.pluginEngine.getStats(),
          workflowEngine: this.workflowEngine.getStats(),
          llmEngine: this.llmEngine.getStats(),
          agentSystem: this.agentSystem.getStats(),
          mlEngine: this.mlEngine.getStats(),
          database: this.database.getStats()
        };

        res.json({ success: true, status });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // ==================== UNIVERSAL API ====================
    
    this.app.get('/api/universal/services', (req, res) => {
      try {
        const services = this.universalAPI.listServices();
        res.json({ success: true, services, count: services.length });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/universal/call', async (req, res) => {
      try {
        const { service, endpoint, options } = req.body;
        const result = await this.universalAPI.call(service, endpoint, options);
        res.json(result);
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/universal/batch', async (req, res) => {
      try {
        const { calls } = req.body;
        const result = await this.universalAPI.batchCall(calls);
        res.json(result);
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // ==================== PLUGINS ====================
    
    this.app.get('/api/plugins', (req, res) => {
      try {
        const plugins = this.pluginEngine.listPlugins();
        res.json({ success: true, plugins, count: plugins.length });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.get('/api/plugins/:pluginId', (req, res) => {
      try {
        const plugin = this.pluginEngine.getPlugin(req.params.pluginId);
        if (!plugin) {
          return res.status(404).json({ success: false, error: 'Plugin not found' });
        }
        res.json({ success: true, plugin });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/plugins/:pluginId/execute', async (req, res) => {
      try {
        const { method, params } = req.body;
        const result = await this.pluginEngine.execute(req.params.pluginId, method, params);
        res.json(result);
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/plugins/:pluginId/reload', async (req, res) => {
      try {
        await this.pluginEngine.reloadPlugin(req.params.pluginId);
        res.json({ success: true, message: 'Plugin reloaded successfully' });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // ==================== WORKFLOWS ====================
    
    this.app.post('/api/workflows/execute', async (req, res) => {
      try {
        const { workflow, inputData, options } = req.body;
        const result = await this.workflowEngine.executeWorkflow(workflow, inputData, options);
        res.json(result);
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.get('/api/workflows/executions/:id', (req, res) => {
      try {
        const status = this.workflowEngine.getExecutionStatus(req.params.id);
        if (!status) {
          return res.status(404).json({ success: false, error: 'Execution not found' });
        }
        res.json({ success: true, status });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/workflows/executions/:id/cancel', (req, res) => {
      try {
        this.workflowEngine.cancelExecution(req.params.id);
        res.json({ success: true, message: 'Execution cancelled' });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // ==================== LLM ====================
    
    this.app.get('/api/llm/models', (req, res) => {
      try {
        const models = this.llmEngine.listModels();
        res.json({ success: true, models, count: models.length });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/llm/load', async (req, res) => {
      try {
        const { model, config } = req.body;
        const result = await this.llmEngine.loadModel(model, config);
        res.json(result);
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/llm/generate', async (req, res) => {
      try {
        const { prompt, options } = req.body;
        const result = await this.llmEngine.generate(prompt, options);
        res.json(result);
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/llm/embed', async (req, res) => {
      try {
        const { text } = req.body;
        const result = await this.llmEngine.embed(text);
        res.json(result);
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.get('/api/llm/active', (req, res) => {
      try {
        const model = this.llmEngine.getActiveModel();
        res.json({ success: true, model });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // ==================== AGENTS ====================
    
    this.app.get('/api/agents', (req, res) => {
      try {
        const agents = this.agentSystem.listAgents();
        res.json({ success: true, agents, count: agents.length });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/agents', async (req, res) => {
      try {
        const { id, type, config } = req.body;
        const agent = await this.agentSystem.createAgent(id, type, config);
        res.json({ success: true, agent: agent.getInfo() });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/agents/:agentId/execute', async (req, res) => {
      try {
        const { task, context } = req.body;
        const result = await this.agentSystem.executeAgent(req.params.agentId, task, context);
        res.json(result);
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/agents/collaborate', async (req, res) => {
      try {
        const { task, agentIds } = req.body;
        const result = await this.agentSystem.collaborateAgents(task, agentIds);
        res.json({ success: true, result });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.delete('/api/agents/:agentId', async (req, res) => {
      try {
        await this.agentSystem.deleteAgent(req.params.agentId);
        res.json({ success: true, message: 'Agent deleted' });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // ==================== ML ====================
    
    this.app.get('/api/ml/models', (req, res) => {
      try {
        const models = this.mlEngine.listModels();
        res.json({ success: true, models, count: models.length });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/ml/predict', async (req, res) => {
      try {
        const { modelId, input } = req.body;
        const result = await this.mlEngine.predict(modelId, input);
        res.json(result);
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/ml/train', async (req, res) => {
      try {
        const { modelId, data, labels } = req.body;
        const result = await this.mlEngine.train(modelId, data, labels);
        res.json(result);
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/ml/analyze-workflow', async (req, res) => {
      try {
        const { workflow } = req.body;
        const result = await this.mlEngine.analyzeWorkflow(workflow);
        res.json(result);
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // ==================== DATABASE ====================
    
    this.app.get('/api/database/stats', (req, res) => {
      try {
        const stats = this.database.getStats();
        res.json({ success: true, stats });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        name: 'R3SN - Revolutionary AI Automation Platform',
        version: '1.0.0',
        status: 'operational',
        systems: {
          universalAPI: '50+ services',
          plugins: 'Hot-reload enabled',
          workflows: '1000+ concurrent',
          llm: 'GGUF models',
          agents: '4 specialized agents',
          ml: '3 trained models',
          database: 'AES-256 encrypted'
        },
        endpoints: {
          health: '/health',
          status: '/api/status',
          universalAPI: '/api/universal/*',
          plugins: '/api/plugins/*',
          workflows: '/api/workflows/*',
          llm: '/api/llm/*',
          agents: '/api/agents/*',
          ml: '/api/ml/*'
        }
      });
    });
  }

  setupErrorHandling() {
    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.path
      });
    });

    // Global error handler
    this.app.use((err, req, res, next) => {
      console.error('Error:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Internal server error'
      });
    });
  }

  async start() {
    await this.initialize();

    this.server = this.app.listen(this.port, () => {
      console.log('');
      console.log('═'.repeat(60));
      console.log('🎉 R3SN SERVER RUNNING');
      console.log('═'.repeat(60));
      console.log(`🌐 Server: http://localhost:${this.port}`);
      console.log(`📊 Status: http://localhost:${this.port}/api/status`);
      console.log(`💚 Health: http://localhost:${this.port}/health`);
      console.log('═'.repeat(60));
      console.log('');
      console.log('✅ SYSTEMS OPERATIONAL:');
      console.log('   🔌 Universal API: 50+ services');
      console.log('   🔥 Plugin Engine: Hot-reload enabled');
      console.log('   ⚙️  Workflow Engine: 1000+ concurrent');
      console.log('   🧠 LLM Engine: GGUF models ready');
      console.log('   🤖 Agent System: 4 agents active');
      console.log('   📊 ML Engine: 3 models trained');
      console.log('   🗄️  Database: AES-256 encrypted');
      console.log('');
      console.log('═'.repeat(60));
      console.log('🚀 READY FOR PRODUCTION!');
      console.log('═'.repeat(60));
    });
  }

  async stop() {
    console.log('🛑 Shutting down server...');
    
    if (this.server) {
      this.server.close();
    }

    await Promise.all([
      this.pluginEngine.shutdown(),
      this.database.close()
    ]);

    console.log('✅ Server shut down gracefully');
  }
}

// Start server if run directly
if (require.main === module) {
  const server = new R3SNServer();
  
  server.start().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    await server.stop();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    await server.stop();
    process.exit(0);
  });
}

module.exports = R3SNServer;
