/**
 * Master Routes
 * Connects all integration routes dynamically
 */

const express = require('express');
const router = express.Router();
const integrationLoader = require('../integrations');

// List all integrations
router.get('/integrations', (req, res) => {
  try {
    const integrations = integrationLoader.getAllIntegrations();
    res.json({
      success: true,
      count: integrations.length,
      integrations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Execute integration action
router.post('/integrations/:id/execute', async (req, res) => {
  try {
    const { id } = req.params;
    const { config, action, params } = req.body;

    const result = await integrationLoader.executeIntegration(id, config, action, params);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get integration details
router.get('/integrations/:id', (req, res) => {
  try {
    const { id } = req.params;
    const integration = integrationLoader.getIntegration(id);

    if (!integration) {
      return res.status(404).json({
        success: false,
        error: 'Integration not found'
      });
    }

    res.json({
      success: true,
      integration: integration.metadata
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
