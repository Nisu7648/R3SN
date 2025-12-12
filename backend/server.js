const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const database = require('./database');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const { sanitizeInput } = require('./middleware/validator');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
  }
});

// Security middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(sanitizeInput);

// Logging in development
if (process.env.NODE_ENV !== 'production') {
  const morgan = require('morgan');
  app.use(morgan('dev'));
}

// Import all routes
const authRoutes = require('./routes/auth');
const agentRoutes = require('./routes/agents');
const integrationRoutes = require('./routes/integrations');
const automationRoutes = require('./routes/automations');
const pluginRoutes = require('./routes/plugins');
const executionRoutes = require('./routes/executions');
const healthRoutes = require('./routes/health');
const masterRoutes = require('./routes/master');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/agents', apiLimiter, agentRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/automations', apiLimiter, automationRoutes);
app.use('/api/plugins', apiLimiter, pluginRoutes);
app.use('/api/executions', executionRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/master', apiLimiter, masterRoutes); // NEW: Master routes with all advanced features

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'R3SN - Revolutionary Self-Sustaining Network',
    version: '2.0.0',
    status: 'operational',
    features: [
      'Universal Execution',
      'Web Search (10+ providers)',
      'Multi-Modal AI',
      'Blockchain Integration (7 networks)',
      'AI-Powered Scheduling',
      'Neural Workflow Optimization',
      '800+ Integrations',
      'Self-Evolving System',
      'Self-Debugging',
      'Enterprise Security'
    ],
    endpoints: {
      health: '/health',
      stats: '/api/stats',
      docs: '/api/docs',
      master: '/api/master'
    },
    documentation: 'https://github.com/Nisu7648/R3SN/blob/main/COMPLETE_API_GUIDE.md'
  });
});

// Quick health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    database: database.isConnected() ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// System statistics
app.get('/api/stats', async (req, res) => {
  try {
    const Agent = require('./models/Agent');
    const Workflow = require('./models/Workflow');
    const Integration = require('./models/Integration');
    const Execution = require('./models/Execution');

    const [agentCount, workflowCount, integrationCount, executionCount] = await Promise.all([
      Agent.countDocuments(),
      Workflow.countDocuments(),
      Integration.countDocuments({ isActive: true }),
      Execution.countDocuments()
    ]);

    res.json({
      success: true,
      stats: {
        agents: agentCount,
        workflows: workflowCount,
        integrations: integrationCount,
        executions: executionCount,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: '2.0.0'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    success: true,
    documentation: {
      complete_guide: 'https://github.com/Nisu7648/R3SN/blob/main/COMPLETE_API_GUIDE.md',
      quick_start: 'https://github.com/Nisu7648/R3SN/blob/main/QUICK_START.md',
      deployment: 'https://github.com/Nisu7648/R3SN/blob/main/RENDER_DEPLOY.md'
    },
    categories: {
      universal_execution: '/api/master/execute',
      web_search: '/api/master/search',
      ai_operations: '/api/master/ai',
      blockchain: '/api/master/blockchain',
      scheduling: '/api/master/schedule',
      optimization: '/api/master/optimize',
      workflows: '/api/master/workflow',
      system: '/api/master/status'
    },
    total_endpoints: '100+',
    features: [
      '10+ Search Providers',
      '15+ AI Models',
      '7 Blockchain Networks',
      '800+ Integrations',
      'Neural Optimization',
      'AI Scheduling',
      'Self-Evolution',
      'Auto-Debugging'
    ]
  });
});

// WebSocket event handlers
io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);

  // Agent execution
  socket.on('agent:execute', async (data) => {
    console.log('🤖 Agent execution requested:', data);
    socket.emit('agent:progress', { 
      status: 'processing',
      message: 'Agent execution started',
      timestamp: new Date()
    });
  });

  // Automation trigger
  socket.on('automation:trigger', async (data) => {
    console.log('⚡ Automation triggered:', data);
    socket.emit('automation:progress', {
      status: 'processing',
      message: 'Automation started',
      timestamp: new Date()
    });
  });

  // Workflow execution
  socket.on('workflow:execute', async (data) => {
    console.log('🔄 Workflow execution requested:', data);
    socket.emit('workflow:progress', {
      status: 'processing',
      message: 'Workflow started',
      timestamp: new Date()
    });
  });

  // Search request
  socket.on('search:execute', async (data) => {
    console.log('🔍 Search requested:', data);
    socket.emit('search:progress', {
      status: 'searching',
      message: 'Search in progress',
      timestamp: new Date()
    });
  });

  // AI operation
  socket.on('ai:execute', async (data) => {
    console.log('🧠 AI operation requested:', data);
    socket.emit('ai:progress', {
      status: 'processing',
      message: 'AI operation started',
      timestamp: new Date()
    });
  });

  // Blockchain transaction
  socket.on('blockchain:execute', async (data) => {
    console.log('⛓️ Blockchain transaction requested:', data);
    socket.emit('blockchain:progress', {
      status: 'processing',
      message: 'Transaction submitted',
      timestamp: new Date()
    });
  });

  // Execution subscription
  socket.on('execution:subscribe', (executionId) => {
    socket.join(`execution:${executionId}`);
    console.log(`📡 Client subscribed to execution: ${executionId}`);
  });

  socket.on('execution:unsubscribe', (executionId) => {
    socket.leave(`execution:${executionId}`);
    console.log(`📴 Client unsubscribed from execution: ${executionId}`);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Connect to database
    await database.connect();
    console.log('✅ Database connected');

    // Start server
    server.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════════════════╗
║                                                                       ║
║   🚀 R3SN - Revolutionary Self-Sustaining Network                    ║
║                                                                       ║
║   Version: 2.0.0                                                      ║
║   Port: ${PORT.toString().padEnd(62)}║
║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(56)}║
║   Database: Connected ✅                                              ║
║   WebSocket: Ready ✅                                                 ║
║                                                                       ║
║   🎯 CORE FEATURES:                                                   ║
║   ✅ Universal Execution                                              ║
║   ✅ Web Search (10+ providers)                                       ║
║   ✅ Multi-Modal AI (Image, Audio, Video, Documents)                 ║
║   ✅ Blockchain Integration (7 networks)                              ║
║   ✅ AI-Powered Scheduling                                            ║
║   ✅ Neural Workflow Optimization                                     ║
║   ✅ 800+ Integrations                                                ║
║   ✅ Self-Evolving System                                             ║
║   ✅ Self-Debugging                                                   ║
║   ✅ Enterprise Security                                              ║
║                                                                       ║
║   📚 API ENDPOINTS (100+):                                            ║
║                                                                       ║
║   🔐 Authentication:                                                  ║
║   - POST   /api/auth/register                                         ║
║   - POST   /api/auth/login                                            ║
║   - POST   /api/auth/refresh                                          ║
║                                                                       ║
║   🤖 Agents:                                                          ║
║   - GET    /api/agents                                                ║
║   - POST   /api/agents                                                ║
║   - POST   /api/agents/:id/execute                                    ║
║   - POST   /api/agents/execute-prompt                                 ║
║                                                                       ║
║   🔌 Integrations:                                                    ║
║   - GET    /api/integrations                                          ║
║   - POST   /api/integrations/:id/connect                              ║
║   - POST   /api/integrations/:id/execute                              ║
║                                                                       ║
║   ⚡ Automations:                                                     ║
║   - GET    /api/automations                                           ║
║   - POST   /api/automations                                           ║
║   - POST   /api/automations/:id/execute                               ║
║                                                                       ║
║   🔧 Plugins:                                                         ║
║   - GET    /api/plugins                                               ║
║   - POST   /api/plugins/generate                                      ║
║   - POST   /api/plugins/:id/execute                                   ║
║                                                                       ║
║   📊 Executions:                                                      ║
║   - GET    /api/executions                                            ║
║   - GET    /api/executions/:id                                        ║
║   - GET    /api/executions/analytics/overview                         ║
║                                                                       ║
║   🎯 MASTER API (NEW - 37 endpoints):                                 ║
║                                                                       ║
║   🌐 Universal Execution:                                             ║
║   - POST   /api/master/execute                                        ║
║   - POST   /api/master/execute/prompt                                 ║
║                                                                       ║
║   🔍 Web Search (10+ providers):                                      ║
║   - POST   /api/master/search                                         ║
║   - POST   /api/master/search/:provider                               ║
║   - POST   /api/master/search/analyze                                 ║
║   - GET    /api/master/search/stats                                   ║
║                                                                       ║
║   🧠 AI Operations:                                                   ║
║   - POST   /api/master/ai/image/analyze                               ║
║   - POST   /api/master/ai/image/generate                              ║
║   - POST   /api/master/ai/audio/transcribe                            ║
║   - POST   /api/master/ai/audio/generate                              ║
║   - POST   /api/master/ai/video/analyze                               ║
║   - POST   /api/master/ai/video/generate                              ║
║   - POST   /api/master/ai/document/analyze                            ║
║   - POST   /api/master/ai/reasoning                                   ║
║   - POST   /api/master/ai/stream/start                                ║
║   - POST   /api/master/ai/stream/stop/:streamId                       ║
║                                                                       ║
║   ⛓️ Blockchain (7 networks):                                         ║
║   - POST   /api/master/blockchain/contract/execute                    ║
║   - POST   /api/master/blockchain/contract/read                       ║
║   - POST   /api/master/blockchain/events/monitor                      ║
║   - POST   /api/master/blockchain/events/stop/:listenerId             ║
║   - POST   /api/master/blockchain/balance                             ║
║   - POST   /api/master/blockchain/transfer                            ║
║   - POST   /api/master/blockchain/defi/:protocol/:operation           ║
║   - POST   /api/master/blockchain/nft/:operation                      ║
║                                                                       ║
║   ⏰ Scheduling:                                                      ║
║   - POST   /api/master/schedule                                       ║
║   - GET    /api/master/schedule/tasks                                 ║
║   - GET    /api/master/schedule/tasks/:taskId                         ║
║   - DELETE /api/master/schedule/tasks/:taskId                         ║
║                                                                       ║
║   🧬 Optimization:                                                    ║
║   - POST   /api/master/optimize/workflow                              ║
║   - POST   /api/master/optimize/train                                 ║
║                                                                       ║
║   🔄 Complex Workflows:                                               ║
║   - POST   /api/master/workflow/complex                               ║
║                                                                       ║
║   📊 System:                                                          ║
║   - GET    /api/master/status                                         ║
║   - GET    /api/master/statistics                                     ║
║                                                                       ║
║   🚀 Advanced:                                                        ║
║   - POST   /api/master/advanced/search-workflow                       ║
║   - POST   /api/master/advanced/ai-blockchain                         ║
║                                                                       ║
║   💚 Health & Info:                                                   ║
║   - GET    /health                                                    ║
║   - GET    /api/stats                                                 ║
║   - GET    /api/docs                                                  ║
║   - GET    /api/health/detailed                                       ║
║                                                                       ║
║   📖 Documentation:                                                   ║
║   - Complete API Guide: /api/docs                                     ║
║   - GitHub: https://github.com/Nisu7648/R3SN                          ║
║                                                                       ║
║   🎉 TOTAL: 100+ API ENDPOINTS                                        ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝

🌟 R3SN is ready to automate EVERYTHING! 🌟
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Graceful shutdown handlers
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

module.exports = { app, io, server };
