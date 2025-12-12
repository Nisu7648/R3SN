/**
 * R3SN Integrated Server
 * Complete server with ALL components connected
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

// Import ALL core components
const IntelligenceLayer = require('./core/IntelligenceLayer');
const PluginExecutionEngine = require('./core/PluginExecutionEngine');
const RealAPIIntegrations = require('./integrations/RealAPIIntegrations');
const SearchSystem = require('./core/SearchSystem');
const MultiAgentSystem = require('./core/MultiAgentSystem');
const TaskExecutionEngine = require('./core/TaskExecutionEngine');
const ReasoningModels = require('./core/ReasoningModels');
const FileSystemIntelligence = require('./core/FileSystemIntelligence');
const ObservabilitySystem = require('./core/ObservabilitySystem');
const VectorDatabase = require('./core/VectorDatabase');
const AIChainInterpreter = require('./core/AIChainInterpreter');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*", methods: ["GET", "POST", "PUT", "DELETE", "PATCH"] }
});

// ============================================
// INITIALIZE ALL SYSTEMS
// ============================================

console.log('🚀 Initializing R3SN Complete System...');

const intelligenceLayer = new IntelligenceLayer();
const reasoningModels = new ReasoningModels();
const aiChainInterpreter = new AIChainInterpreter({ reasoningModel: reasoningModels, intelligenceLayer });
const pluginEngine = new PluginExecutionEngine();
const taskEngine = new TaskExecutionEngine();
const apiIntegrations = new RealAPIIntegrations();
const searchSystem = new SearchSystem();
const multiAgentSystem = new MultiAgentSystem();
const vectorDB = new VectorDatabase();
const fileSystem = new FileSystemIntelligence();
const observability = new ObservabilitySystem();

console.log('✅ All 11 systems initialized successfully');

// Make globally available
app.locals.intelligence = intelligenceLayer;
app.locals.reasoning = reasoningModels;
app.locals.aiChain = aiChainInterpreter;
app.locals.plugins = pluginEngine;
app.locals.tasks = taskEngine;
app.locals.integrations = apiIntegrations;
app.locals.search = searchSystem;
app.locals.multiAgent = multiAgentSystem;
app.locals.vectors = vectorDB;
app.locals.files = fileSystem;
app.locals.observability = observability;
app.locals.io = io;

// ============================================
// MIDDLEWARE
// ============================================

app.use(helmet());
app.use(compression());
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ============================================
// UNIFIED EXECUTION ENDPOINT
// ============================================

app.post('/api/execute', async (req, res) => {
    try {
        const { prompt, context = {} } = req.body;
        
        // Intelligence processing
        const intelligence = await intelligenceLayer.processIntelligentRequest(prompt, context);
        
        // AI Chain execution
        const chain = await aiChainInterpreter.executeChain({
            name: 'Universal Execution',
            goal: prompt,
            context: { ...context, intelligence }
        });

        // Task execution
        const task = await taskEngine.addTask({
            name: 'Execute Prompt',
            type: 'execution',
            priority: 8,
            data: { prompt, intelligence, chain }
        });

        observability.recordMetric('executions_total', 1);

        res.json({
            success: true,
            executionId: task.taskId,
            chainId: chain.chainId,
            intelligence,
            chain,
            task
        });
    } catch (error) {
        observability.log('error', 'Execution failed', { error: error.message });
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// SEARCH ENDPOINTS
// ============================================

app.post('/api/search', async (req, res) => {
    try {
        const result = await searchSystem.search(req.body.query, req.body.options);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// MULTI-AGENT ENDPOINTS
// ============================================

app.post('/api/agents/spawn', async (req, res) => {
    try {
        const result = await multiAgentSystem.spawnAgent(req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/agents/multi/stats', (req, res) => {
    res.json({ success: true, stats: multiAgentSystem.getStats() });
});

// ============================================
// TASK ENDPOINTS
// ============================================

app.post('/api/tasks', async (req, res) => {
    try {
        const result = await taskEngine.addTask(req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/tasks/queue', (req, res) => {
    res.json({ success: true, ...taskEngine.getQueueStatus() });
});

// ============================================
// VECTOR DATABASE ENDPOINTS
// ============================================

app.post('/api/vectors/collections', async (req, res) => {
    try {
        const result = await vectorDB.createCollection(req.body.name, req.body.options);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/vectors/:collection/search', async (req, res) => {
    try {
        const result = await vectorDB.semanticSearch(req.params.collection, req.body.query, req.body.options);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// OBSERVABILITY ENDPOINTS
// ============================================

app.get('/api/metrics/prometheus', (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.send(observability.exportPrometheus());
});

app.get('/api/health/system', (req, res) => {
    res.json({ success: true, ...observability.getSystemHealth() });
});

// ============================================
// WEBSOCKET EVENTS
// ============================================

io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);

  searchSystem.on('search:completed', (data) => socket.emit('search:completed', data));
  multiAgentSystem.on('agent:spawned', (data) => socket.emit('agent:spawned', data));
  taskEngine.on('task:progress', (data) => socket.emit('task:progress', data));
  aiChainInterpreter.on('chain:step:completed', (data) => socket.emit('chain:step', data));

  socket.on('disconnect', () => console.log('❌ Client disconnected:', socket.id));
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log('');
  console.log('🚀 ═══════════════════════════════════════════');
  console.log('🚀 R3SN COMPLETE INTEGRATED SERVER');
  console.log('🚀 ═══════════════════════════════════════════');
  console.log('');
  console.log(`✅ Server: http://localhost:${PORT}`);
  console.log(`✅ Version: 3.0.0`);
  console.log('');
  console.log('📊 ALL SYSTEMS ONLINE:');
  console.log('   ✅ Intelligence Layer');
  console.log('   ✅ Reasoning Models (11 models)');
  console.log('   ✅ AI Chain Interpreter');
  console.log('   ✅ Plugin Execution Engine');
  console.log('   ✅ Task Execution Engine');
  console.log('   ✅ Search System (10 providers)');
  console.log('   ✅ Multi-Agent System');
  console.log('   ✅ Real API Integrations (800+)');
  console.log('   ✅ Vector Database');
  console.log('   ✅ File System Intelligence');
  console.log('   ✅ Observability System');
  console.log('');
  console.log('🚀 ═══════════════════════════════════════════');
});

module.exports = { app, server, io };
