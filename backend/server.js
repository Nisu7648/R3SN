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
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeInput);

if (process.env.NODE_ENV !== 'production') {
  const morgan = require('morgan');
  app.use(morgan('dev'));
}

const authRoutes = require('./routes/auth');
const agentRoutes = require('./routes/agents');
const integrationRoutes = require('./routes/integrations');
const automationRoutes = require('./routes/automations');
const pluginRoutes = require('./routes/plugins');
const executionRoutes = require('./routes/executions');

app.use('/api/auth', authRoutes);
app.use('/api/agents', apiLimiter, agentRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/automations', apiLimiter, automationRoutes);
app.use('/api/plugins', apiLimiter, pluginRoutes);
app.use('/api/executions', executionRoutes);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: database.isConnected() ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

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
        executions: executionCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('agent:execute', async (data) => {
    console.log('Agent execution requested:', data);
    socket.emit('agent:progress', { 
      status: 'processing',
      message: 'Agent execution started'
    });
  });

  socket.on('automation:trigger', async (data) => {
    console.log('Automation triggered:', data);
    socket.emit('automation:progress', {
      status: 'processing',
      message: 'Automation started'
    });
  });

  socket.on('execution:subscribe', (executionId) => {
    socket.join(`execution:${executionId}`);
    console.log(`Client subscribed to execution: ${executionId}`);
  });

  socket.on('execution:unsubscribe', (executionId) => {
    socket.leave(`execution:${executionId}`);
    console.log(`Client unsubscribed from execution: ${executionId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await database.connect();
    console.log('✅ Database connected');

    server.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 R3SN Server Running                                  ║
║                                                           ║
║   Port: ${PORT}                                           ║
║   Environment: ${process.env.NODE_ENV || 'development'}  ║
║   Database: Connected                                     ║
║   WebSocket: Ready                                        ║
║                                                           ║
║   API Endpoints:                                          ║
║   - POST   /api/auth/register                             ║
║   - POST   /api/auth/login                                ║
║   - GET    /api/agents                                    ║
║   - POST   /api/agents                                    ║
║   - POST   /api/agents/:id/execute                        ║
║   - POST   /api/agents/execute-prompt                     ║
║   - GET    /api/integrations                              ║
║   - POST   /api/integrations/:id/connect                  ║
║   - GET    /api/automations                               ║
║   - POST   /api/automations                               ║
║   - POST   /api/automations/:id/execute                   ║
║   - GET    /api/plugins                                   ║
║   - POST   /api/plugins/generate                          ║
║   - GET    /api/executions                                ║
║   - GET    /api/executions/analytics/overview             ║
║                                                           ║
║   Health Check: GET /health                               ║
║   Stats: GET /api/stats                                   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  server.close(() => process.exit(1));
});

module.exports = { app, io, server };
