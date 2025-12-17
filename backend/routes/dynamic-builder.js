/**
 * Dynamic Builder Routes
 * REST endpoints for building APIs and plugins from natural language
 */

const express = require('express');
const router = express.Router();
const DynamicAPIBuilder = require('../core/DynamicAPIBuilder');
const PluginMaker = require('../core/PluginMaker');

const apiBuilder = new DynamicAPIBuilder();
const pluginMaker = new PluginMaker();

// ============================================
// DYNAMIC API BUILDER
// ============================================

/**
 * Build API from natural language prompt
 * POST /api/builder/api/create
 */
router.post('/api/create', async (req, res) => {
    try {
        const { prompt, userId } = req.body;

        if (!prompt) {
            return res.status(400).json({
                success: false,
                error: 'Prompt is required'
            });
        }

        const result = await apiBuilder.buildAPIFromPrompt(prompt, userId || 'default');

        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * List user's custom APIs
 * GET /api/builder/api/list
 */
router.get('/api/list', (req, res) => {
    try {
        const userId = req.query.userId || 'default';
        const apis = apiBuilder.listUserAPIs(userId);

        res.json({
            success: true,
            count: apis.length,
            apis
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get API details
 * GET /api/builder/api/:apiId
 */
router.get('/api/:apiId', (req, res) => {
    try {
        const { apiId } = req.params;
        const api = apiBuilder.getAPI(apiId);

        if (!api) {
            return res.status(404).json({
                success: false,
                error: 'API not found'
            });
        }

        res.json({
            success: true,
            api
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Execute API endpoint
 * POST /api/builder/api/:apiId/execute
 */
router.post('/api/:apiId/execute', async (req, res) => {
    try {
        const { apiId } = req.params;
        const { endpoint, params } = req.body;

        const result = await apiBuilder.executeAPICall(apiId, endpoint, params);

        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Test API endpoint
 * POST /api/builder/api/:apiId/test
 */
router.post('/api/:apiId/test', async (req, res) => {
    try {
        const { apiId } = req.params;
        const { endpoint, params } = req.body;

        const result = await apiBuilder.testEndpoint(apiId, endpoint, params);

        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Update API
 * PUT /api/builder/api/:apiId
 */
router.put('/api/:apiId', async (req, res) => {
    try {
        const { apiId } = req.params;
        const { updates } = req.body;

        const result = await apiBuilder.updateAPI(apiId, updates);

        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Delete API
 * DELETE /api/builder/api/:apiId
 */
router.delete('/api/:apiId', (req, res) => {
    try {
        const { apiId } = req.params;
        const result = apiBuilder.deleteAPI(apiId);

        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Import API from OpenAPI spec
 * POST /api/builder/api/import
 */
router.post('/api/import', async (req, res) => {
    try {
        const { openApiSpec, userId } = req.body;

        if (!openApiSpec) {
            return res.status(400).json({
                success: false,
                error: 'OpenAPI spec is required'
            });
        }

        const result = await apiBuilder.importFromOpenAPI(openApiSpec, userId || 'default');

        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Export API
 * GET /api/builder/api/:apiId/export
 */
router.get('/api/:apiId/export', (req, res) => {
    try {
        const { apiId } = req.params;
        const { format } = req.query;

        const result = apiBuilder.exportAPI(apiId, format || 'javascript');

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// PLUGIN MAKER
// ============================================

/**
 * Create plugin from prompt
 * POST /api/builder/plugin/create
 */
router.post('/plugin/create', async (req, res) => {
    try {
        const { prompt, userId } = req.body;

        if (!prompt) {
            return res.status(400).json({
                success: false,
                error: 'Prompt is required'
            });
        }

        const result = await pluginMaker.createPluginFromPrompt(prompt, userId || 'default');

        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * List user's plugins
 * GET /api/builder/plugin/list
 */
router.get('/plugin/list', (req, res) => {
    try {
        const userId = req.query.userId || 'default';
        const plugins = pluginMaker.listUserPlugins(userId);

        res.json({
            success: true,
            count: plugins.length,
            plugins
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get plugin details
 * GET /api/builder/plugin/:pluginId
 */
router.get('/plugin/:pluginId', (req, res) => {
    try {
        const { pluginId } = req.params;
        const plugin = pluginMaker.getPlugin(pluginId);

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
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Execute plugin
 * POST /api/builder/plugin/:pluginId/execute
 */
router.post('/plugin/:pluginId/execute', async (req, res) => {
    try {
        const { pluginId } = req.params;
        const { input } = req.body;

        const result = await pluginMaker.executePlugin(pluginId, input);

        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Delete plugin
 * DELETE /api/builder/plugin/:pluginId
 */
router.delete('/plugin/:pluginId', (req, res) => {
    try {
        const { pluginId } = req.params;
        const deleted = pluginMaker.deletePlugin(pluginId);

        res.json({
            success: deleted,
            message: deleted ? 'Plugin deleted' : 'Plugin not found'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// WORKFLOW BUILDER
// ============================================

/**
 * Create workflow from prompt
 * POST /api/builder/workflow/create
 */
router.post('/workflow/create', async (req, res) => {
    try {
        const { prompt, userId } = req.body;

        if (!prompt) {
            return res.status(400).json({
                success: false,
                error: 'Prompt is required'
            });
        }

        const result = await pluginMaker.createWorkflowFromPrompt(prompt, userId || 'default');

        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * List user's workflows
 * GET /api/builder/workflow/list
 */
router.get('/workflow/list', (req, res) => {
    try {
        const userId = req.query.userId || 'default';
        const workflows = pluginMaker.listUserWorkflows(userId);

        res.json({
            success: true,
            count: workflows.length,
            workflows
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get workflow details
 * GET /api/builder/workflow/:workflowId
 */
router.get('/workflow/:workflowId', (req, res) => {
    try {
        const { workflowId } = req.params;
        const workflow = pluginMaker.getWorkflow(workflowId);

        if (!workflow) {
            return res.status(404).json({
                success: false,
                error: 'Workflow not found'
            });
        }

        res.json({
            success: true,
            workflow
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Execute workflow
 * POST /api/builder/workflow/:workflowId/execute
 */
router.post('/workflow/:workflowId/execute', async (req, res) => {
    try {
        const { workflowId } = req.params;
        const { input } = req.body;

        const result = await pluginMaker.executeWorkflow(workflowId, input);

        res.json({
            success: true,
            execution: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Toggle workflow
 * POST /api/builder/workflow/:workflowId/toggle
 */
router.post('/workflow/:workflowId/toggle', (req, res) => {
    try {
        const { workflowId } = req.params;
        const { enabled } = req.body;

        const success = pluginMaker.toggleWorkflow(workflowId, enabled);

        res.json({
            success,
            message: success ? `Workflow ${enabled ? 'enabled' : 'disabled'}` : 'Workflow not found'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Delete workflow
 * DELETE /api/builder/workflow/:workflowId
 */
router.delete('/workflow/:workflowId', (req, res) => {
    try {
        const { workflowId } = req.params;
        const deleted = pluginMaker.deleteWorkflow(workflowId);

        res.json({
            success: deleted,
            message: deleted ? 'Workflow deleted' : 'Workflow not found'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
