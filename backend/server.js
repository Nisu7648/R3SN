const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const agentRoutes = require('./routes/agents');
const integrationRoutes = require('./routes/integrations');
const automationRoutes = require('./routes/automations');
const pluginRoutes = require('./routes/plugins');

// Use routes
app.use('/api/agents', agentRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/automations', automationRoutes);
app.use('/api/plugins', pluginRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '0.1.0'
  });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('agent:execute', async (data) => {
    // Handle agent execution
    console.log('Agent execution requested:', data);
    // Emit progress updates
    socket.emit('agent:progress', { status: 'processing' });
  });

  socket.on('automation:trigger', async (data) => {
    // Handle automation trigger
    console.log('Automation triggered:', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`R3SN Server running on port ${PORT}`);
  console.log(`WebSocket server ready`);
});

module.exports = { app, io };
