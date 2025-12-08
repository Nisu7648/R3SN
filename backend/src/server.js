/**
 * R3SN Workflow Engine Server
 * Main entry point for the application
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const WorkflowEngine = require('./workflow-engine/core/WorkflowEngine');
const APIDesigner = require('./api-designer/APIDesigner');
const MLInsightsEngine = require('./ml-engine/MLInsightsEngine');

// Import routes
const { router: workflowRoutes, setWorkflowEngine } = require('./routes/workflow.routes');
const { router: apiRoutes, setAPIDesigner } = require('./routes/api.routes');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Initialize engines
const workflowEngine = new WorkflowEngine();
const apiDesigner = new APIDesigner();
const mlEngine = new MLInsightsEngine();

// Inject engines into routes
setWorkflowEngine(workflowEngine);
setAPIDesigner(apiDesigner);

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'R3SN Workflow Engine is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/workflows', workflowRoutes);
app.use('/api/designer', apiRoutes);

// ML Insights Routes
app.get('/api/ml/insights/:executionId', async (req, res) => {
  try {
    const execution = workflowEngine.getExecutionStatus(req.params.executionId);
    
    if (!execution) {
      return res.status(404).json({
        success: false,
        error: 'Execution not found'
      });
    }

    const insights = await mlEngine.analyzeExecution(execution);

    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/ml/analytics/daily', async (req, res) => {
  try {
    const { date } = req.query;
    const analytics = await mlEngine.getDailyAnalytics(date ? new Date(date) : undefined);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/ml/behavior/insights', async (req, res) => {
  try {
    const { userId } = req.query;
    const insights = mlEngine.behaviorTracker.getInsights(userId);

    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/ml/improvements', async (req, res) => {
  try {
    const improvements = await mlEngine.selfImprovementEngine.generateImprovements();

    res.json({
      success: true,
      data: improvements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Plugin Routes
app.get('/api/plugins', async (req, res) => {
  try {
    const plugins = workflowEngine.pluginLoader.getAllPlugins();

    res.json({
      success: true,
      data: plugins
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/plugins/install', async (req, res) => {
  try {
    const { packagePath } = req.body;

    if (!packagePath) {
      return res.status(400).json({
        success: false,
        error: 'Package path is required'
      });
    }

    await workflowEngine.pluginLoader.installPlugin(packagePath);

    res.json({
      success: true,
      message: 'Plugin installed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.delete('/api/plugins/:pluginId', async (req, res) => {
  try {
    await workflowEngine.pluginLoader.uninstallPlugin(req.params.pluginId);

    res.json({
      success: true,
      message: 'Plugin uninstalled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Initialize and start server
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    console.log('🚀 Starting R3SN Workflow Engine...\n');

    // Initialize workflow engine
    await workflowEngine.initialize();

    // Initialize API designer
    console.log('🎨 Initializing API Designer...');
    console.log('✅ API Designer initialized\n');

    // Initialize ML engine
    await mlEngine.initialize();

    // Listen for workflow events
    workflowEngine.on('execution:completed', async (data) => {
      console.log(`✅ Workflow completed: ${data.executionId} (${data.duration}ms)`);
      
      // Analyze with ML
      const execution = workflowEngine.getExecutionStatus(data.executionId);
      if (execution) {
        await mlEngine.analyzeExecution(execution);
      }
    });

    workflowEngine.on('execution:failed', (data) => {
      console.error(`❌ Workflow failed: ${data.executionId} - ${data.error}`);
    });

    // Start Express server
    app.listen(PORT, () => {
      console.log(`\n✅ Server running on port ${PORT}`);
      console.log(`📡 API: http://localhost:${PORT}`);
      console.log(`🏥 Health: http://localhost:${PORT}/health\n`);
      console.log('🎉 R3SN Workflow Engine is ready!\n');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n🛑 SIGTERM received, shutting down gracefully...');
  
  await workflowEngine.shutdown();
  
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n🛑 SIGINT received, shutting down gracefully...');
  
  await workflowEngine.shutdown();
  
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
