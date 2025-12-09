const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { sanitizeInput } = require('../middleware/validator');
const PluginFactory = require('../core/PluginFactory');

const pluginFactory = new PluginFactory();

router.get('/', auth, asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;

  const plugins = await pluginFactory.listPlugins({
    userId: req.userId,
    search,
    page: parseInt(page),
    limit: parseInt(limit)
  });

  res.json({
    success: true,
    ...plugins
  });
}));

router.get('/:id', auth, asyncHandler(async (req, res) => {
  const plugin = await pluginFactory.getPlugin(req.params.id, req.userId);

  if (!plugin) {
    return res.status(404).json({
      success: false,
      error: 'Plugin not found'
    });
  }

  res.json({
    success: true,
    plugin
  });
}));

router.post('/generate', auth, sanitizeInput, asyncHandler(async (req, res) => {
  const { appName, appPackage, description, actions } = req.body;

  if (!appName || !appPackage) {
    return res.status(400).json({
      success: false,
      error: 'App name and package are required'
    });
  }

  try {
    const plugin = await pluginFactory.generatePlugin({
      appName,
      appPackage,
      description,
      actions: actions || [],
      userId: req.userId
    });

    res.status(201).json({
      success: true,
      plugin,
      message: 'Plugin generated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Plugin generation failed',
      message: error.message
    });
  }
}));

router.post('/:id/execute', auth, sanitizeInput, asyncHandler(async (req, res) => {
  const { action, params } = req.body;

  if (!action) {
    return res.status(400).json({
      success: false,
      error: 'Action is required'
    });
  }

  try {
    const result = await pluginFactory.executePlugin({
      pluginId: req.params.id,
      action,
      params: params || {},
      userId: req.userId
    });

    res.json({
      success: true,
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Plugin execution failed',
      message: error.message
    });
  }
}));

router.put('/:id', auth, sanitizeInput, asyncHandler(async (req, res) => {
  const { name, description, actions, config } = req.body;

  try {
    const plugin = await pluginFactory.updatePlugin({
      pluginId: req.params.id,
      userId: req.userId,
      updates: {
        name,
        description,
        actions,
        config
      }
    });

    res.json({
      success: true,
      plugin,
      message: 'Plugin updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Plugin update failed',
      message: error.message
    });
  }
}));

router.delete('/:id', auth, asyncHandler(async (req, res) => {
  try {
    await pluginFactory.deletePlugin(req.params.id, req.userId);

    res.json({
      success: true,
      message: 'Plugin deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Plugin deletion failed',
      message: error.message
    });
  }
}));

router.post('/:id/test', auth, sanitizeInput, asyncHandler(async (req, res) => {
  const { action, params } = req.body;

  try {
    const testResult = await pluginFactory.testPlugin({
      pluginId: req.params.id,
      action,
      params: params || {},
      userId: req.userId
    });

    res.json({
      success: true,
      testResult,
      message: 'Plugin test completed'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Plugin test failed',
      message: error.message
    });
  }
}));

router.post('/analyze-app', auth, sanitizeInput, asyncHandler(async (req, res) => {
  const { appPackage } = req.body;

  if (!appPackage) {
    return res.status(400).json({
      success: false,
      error: 'App package is required'
    });
  }

  try {
    const analysis = await pluginFactory.analyzeApp(appPackage);

    res.json({
      success: true,
      analysis,
      message: 'App analyzed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'App analysis failed',
      message: error.message
    });
  }
}));

router.get('/:id/actions', auth, asyncHandler(async (req, res) => {
  try {
    const actions = await pluginFactory.getPluginActions(req.params.id, req.userId);

    res.json({
      success: true,
      actions
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: 'Plugin not found',
      message: error.message
    });
  }
}));

router.post('/:id/install', auth, asyncHandler(async (req, res) => {
  try {
    const result = await pluginFactory.installPlugin(req.params.id, req.userId);

    res.json({
      success: true,
      result,
      message: 'Plugin installed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Plugin installation failed',
      message: error.message
    });
  }
}));

router.post('/:id/uninstall', auth, asyncHandler(async (req, res) => {
  try {
    await pluginFactory.uninstallPlugin(req.params.id, req.userId);

    res.json({
      success: true,
      message: 'Plugin uninstalled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Plugin uninstallation failed',
      message: error.message
    });
  }
}));

module.exports = router;
