/**
 * Plugins Routes - REAL INTEGRATION
 * Connected to PluginFactory for actual plugin generation and execution
 */

const express = require('express');
const router = express.Router();
const Plugin = require('../models/Plugin');
const Execution = require('../models/Execution');
const { auth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { sanitizeInput } = require('../middleware/validator');

const getOrchestrator = (req) => req.app.locals.orchestrator;
const getRealtimeEngine = (req) => req.app.locals.realtimeEngine;

/**
 * GET /api/plugins - List all plugins
 */
router.get('/', auth, asyncHandler(async (req, res) => {
  const { platform, status, page = 1, limit = 20, search } = req.query;
  const query = { userId: req.userId };
  
  if (platform) query.platform = platform;
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { appName: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const plugins = await Plugin.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const count = await Plugin.countDocuments(query);

  res.json({
    success: true,
    plugins,
    pagination: {
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit)
    }
  });
}));

/**
 * GET /api/plugins/:id - Get plugin details
 */
router.get('/:id', auth, asyncHandler(async (req, res) => {
  const plugin = await Plugin.findOne({
    _id: req.params.id,
    userId: req.userId
  }).lean();

  if (!plugin) {
    return res.status(404).json({
      success: false,
      error: 'Plugin not found'
    });
  }

  const recentExecutions = await Execution.find({
    pluginId: plugin._id
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  res.json({
    success: true,
    plugin,
    recentExecutions
  });
}));

/**
 * POST /api/plugins/generate - Generate new plugin using AI
 */
router.post('/generate', auth, sanitizeInput, asyncHandler(async (req, res) => {
  const { appName, appPackage, description, actions, platform } = req.body;

  if (!appName) {
    return res.status(400).json({
      success: false,
      error: 'App name is required'
    });
  }

  const orchestrator = getOrchestrator(req);
  const realtimeEngine = getRealtimeEngine(req);

  console.log(`\n🔧 [Plugin Generate] User ${req.userId} generating plugin for ${appName}`);

  // Notify user that generation started
  if (realtimeEngine) {
    realtimeEngine.sendSuccessNotification(req.userId, 'Plugin generation started', {
      appName
    });
  }

  // Generate plugin using PluginFactory
  const generatedPlugin = await orchestrator.pluginFactory.generatePlugin({
    appName,
    appPackage,
    description,
    actions: actions || [],
    platform: platform || 'android'
  });

  // Save to database
  const plugin = new Plugin({
    ...generatedPlugin,
    userId: req.userId
  });

  await plugin.save();

  // Broadcast to user's connected clients
  if (realtimeEngine) {
    realtimeEngine.broadcastPluginUpdate(req.userId, plugin, 'generated');
    realtimeEngine.sendSuccessNotification(req.userId, 'Plugin generated successfully', {
      pluginId: plugin._id,
      appName: plugin.appName
    });
  }

  res.status(201).json({
    success: true,
    plugin
  });
}));

/**
 * POST /api/plugins/:id/execute - Execute plugin action
 */
router.post('/:id/execute', auth, sanitizeInput, asyncHandler(async (req, res) => {
  const { action, parameters } = req.body;

  if (!action) {
    return res.status(400).json({
      success: false,
      error: 'Action is required'
    });
  }

  const plugin = await Plugin.findOne({
    _id: req.params.id,
    userId: req.userId
  });

  if (!plugin) {
    return res.status(404).json({
      success: false,
      error: 'Plugin not found'
    });
  }

  const orchestrator = getOrchestrator(req);
  const realtimeEngine = getRealtimeEngine(req);

  console.log(`\n⚡ [Plugin Execute] Executing ${plugin.appName} - ${action}`);

  // Execute plugin using PluginFactory
  const result = await orchestrator.pluginFactory.executePlugin(
    plugin,
    action,
    parameters || {}
  );

  // Create execution record
  const execution = new Execution({
    executionId: `plugin_exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: req.userId,
    type: 'plugin',
    pluginId: plugin._id,
    status: result.success ? 'completed' : 'failed',
    result: result.result,
    error: result.error,
    startTime: new Date(),
    endTime: new Date(),
    executionTime: result.executionTime || 0
  });

  await execution.save();

  // Update plugin stats
  plugin.executionCount += 1;
  if (result.success) plugin.successCount += 1;
  else plugin.failureCount += 1;
  plugin.lastExecutedAt = new Date();
  await plugin.save();

  // Broadcast result
  if (realtimeEngine) {
    if (result.success) {
      realtimeEngine.sendSuccessNotification(req.userId, 'Plugin executed successfully', {
        pluginId: plugin._id,
        action
      });
    } else {
      realtimeEngine.sendErrorNotification(req.userId, new Error(result.error), {
        pluginId: plugin._id,
        action
      });
    }
  }

  res.json({
    success: result.success,
    plugin: plugin.toObject(),
    result: result.result,
    error: result.error,
    executionId: execution.executionId
  });
}));

/**
 * PUT /api/plugins/:id - Update plugin
 */
router.put('/:id', auth, sanitizeInput, asyncHandler(async (req, res) => {
  const { description, actions, status, config } = req.body;

  const plugin = await Plugin.findOne({
    _id: req.params.id,
    userId: req.userId
  });

  if (!plugin) {
    return res.status(404).json({
      success: false,
      error: 'Plugin not found'
    });
  }

  if (description) plugin.description = description;
  if (actions) plugin.actions = actions;
  if (status) plugin.status = status;
  if (config) plugin.config = { ...plugin.config, ...config };

  await plugin.save();

  const realtimeEngine = getRealtimeEngine(req);
  if (realtimeEngine) {
    realtimeEngine.broadcastPluginUpdate(req.userId, plugin, 'updated');
  }

  res.json({
    success: true,
    plugin
  });
}));

/**
 * DELETE /api/plugins/:id - Delete plugin
 */
router.delete('/:id', auth, asyncHandler(async (req, res) => {
  const plugin = await Plugin.findOne({
    _id: req.params.id,
    userId: req.userId
  });

  if (!plugin) {
    return res.status(404).json({
      success: false,
      error: 'Plugin not found'
    });
  }

  await plugin.deleteOne();

  const realtimeEngine = getRealtimeEngine(req);
  if (realtimeEngine) {
    realtimeEngine.broadcastPluginUpdate(req.userId, plugin, 'deleted');
  }

  res.json({
    success: true,
    message: 'Plugin deleted successfully'
  });
}));

/**
 * GET /api/plugins/:id/executions - Get plugin execution history
 */
router.get('/:id/executions', auth, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const query = {
    pluginId: req.params.id,
    userId: req.userId
  };

  if (status) query.status = status;

  const executions = await Execution.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const count = await Execution.countDocuments(query);

  res.json({
    success: true,
    executions,
    pagination: {
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit)
    }
  });
}));

/**
 * GET /api/plugins/:id/analytics - Get plugin analytics
 */
router.get('/:id/analytics', auth, asyncHandler(async (req, res) => {
  const plugin = await Plugin.findOne({
    _id: req.params.id,
    userId: req.userId
  });

  if (!plugin) {
    return res.status(404).json({
      success: false,
      error: 'Plugin not found'
    });
  }

  const executions = await Execution.find({
    pluginId: plugin._id
  }).lean();

  const totalExecutions = executions.length;
  const successfulExecutions = executions.filter(e => e.status === 'completed').length;
  const failedExecutions = executions.filter(e => e.status === 'failed').length;
  const averageExecutionTime = executions.reduce((sum, e) => sum + (e.executionTime || 0), 0) / totalExecutions || 0;

  // Action-level analytics
  const actionAnalytics = analyzeActions(executions);

  const analytics = {
    totalExecutions,
    successfulExecutions,
    failedExecutions,
    successRate: totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0,
    averageExecutionTime,
    lastExecution: executions[0]?.createdAt,
    executionsByDay: groupExecutionsByDay(executions),
    actionAnalytics
  };

  res.json({
    success: true,
    analytics
  });
}));

/**
 * POST /api/plugins/:id/test - Test plugin action
 */
router.post('/:id/test', auth, sanitizeInput, asyncHandler(async (req, res) => {
  const { action, parameters } = req.body;

  if (!action) {
    return res.status(400).json({
      success: false,
      error: 'Action is required'
    });
  }

  const plugin = await Plugin.findOne({
    _id: req.params.id,
    userId: req.userId
  });

  if (!plugin) {
    return res.status(404).json({
      success: false,
      error: 'Plugin not found'
    });
  }

  const orchestrator = getOrchestrator(req);

  console.log(`\n🧪 [Plugin Test] Testing ${plugin.appName} - ${action}`);

  // Test plugin without saving execution
  const result = await orchestrator.pluginFactory.executePlugin(
    plugin,
    action,
    { ...parameters, testMode: true }
  );

  res.json({
    success: result.success,
    result: result.result,
    error: result.error,
    testMode: true
  });
}));

/**
 * Helper: Analyze action performance
 */
function analyzeActions(executions) {
  const actionStats = {};

  executions.forEach(exec => {
    if (exec.context && exec.context.action) {
      const action = exec.context.action;
      if (!actionStats[action]) {
        actionStats[action] = {
          action,
          totalExecutions: 0,
          successful: 0,
          failed: 0,
          averageTime: 0
        };
      }

      actionStats[action].totalExecutions += 1;
      if (exec.status === 'completed') actionStats[action].successful += 1;
      else actionStats[action].failed += 1;
      actionStats[action].averageTime += exec.executionTime || 0;
    }
  });

  // Calculate averages
  Object.values(actionStats).forEach(stat => {
    if (stat.totalExecutions > 0) {
      stat.averageTime = stat.averageTime / stat.totalExecutions;
      stat.successRate = (stat.successful / stat.totalExecutions) * 100;
    }
  });

  return Object.values(actionStats);
}

/**
 * Helper: Group executions by day
 */
function groupExecutionsByDay(executions) {
  const grouped = {};
  
  executions.forEach(exec => {
    const date = new Date(exec.createdAt).toISOString().split('T')[0];
    if (!grouped[date]) {
      grouped[date] = { total: 0, successful: 0, failed: 0 };
    }
    grouped[date].total += 1;
    if (exec.status === 'completed') grouped[date].successful += 1;
    if (exec.status === 'failed') grouped[date].failed += 1;
  });

  return Object.entries(grouped).map(([date, stats]) => ({
    date,
    ...stats
  }));
}

module.exports = router;
