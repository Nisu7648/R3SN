/**
 * Integration Routes
 * API endpoints for managing user integrations
 */

const express = require('express');
const router = express.Router();

// This will be injected by server.js
let integrationManager = null;
let authSystem = null;

// Middleware to verify authentication
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const session = authSystem.verifyToken(token);

    if (!session) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    req.userId = session.userId;
    next();
};

/**
 * Get all available integrations
 */
router.get('/available', authenticate, (req, res) => {
    try {
        const integrations = integrationManager.getAvailableIntegrations();
        res.json({ success: true, integrations });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Get user's connected integrations
 */
router.get('/connected', authenticate, (req, res) => {
    try {
        const integrations = integrationManager.getUserIntegrations(req.userId);
        res.json({ success: true, integrations });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Connect an integration
 */
router.post('/connect', authenticate, async (req, res) => {
    try {
        const { integrationId, credentials } = req.body;

        if (!integrationId || !credentials) {
            return res.status(400).json({
                success: false,
                error: 'Integration ID and credentials are required'
            });
        }

        const result = await integrationManager.connectIntegration(
            req.userId,
            integrationId,
            credentials
        );

        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Disconnect an integration
 */
router.post('/disconnect', authenticate, (req, res) => {
    try {
        const { integrationId } = req.body;

        if (!integrationId) {
            return res.status(400).json({
                success: false,
                error: 'Integration ID is required'
            });
        }

        const result = integrationManager.disconnectIntegration(req.userId, integrationId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Update integration credentials
 */
router.put('/update', authenticate, async (req, res) => {
    try {
        const { integrationId, credentials } = req.body;

        if (!integrationId || !credentials) {
            return res.status(400).json({
                success: false,
                error: 'Integration ID and credentials are required'
            });
        }

        const result = await integrationManager.updateIntegration(
            req.userId,
            integrationId,
            credentials
        );

        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Test integration connection
 */
router.post('/test', authenticate, async (req, res) => {
    try {
        const { integrationId, credentials } = req.body;

        if (!integrationId || !credentials) {
            return res.status(400).json({
                success: false,
                error: 'Integration ID and credentials are required'
            });
        }

        const result = await integrationManager.testConnection(integrationId, credentials);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Get integration status
 */
router.get('/status/:integrationId', authenticate, (req, res) => {
    try {
        const { integrationId } = req.params;
        const status = integrationManager.getIntegrationStatus(req.userId, integrationId);
        res.json({ success: true, status });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Bulk connect integrations
 */
router.post('/bulk-connect', authenticate, async (req, res) => {
    try {
        const { integrations } = req.body;

        if (!integrations || !Array.isArray(integrations)) {
            return res.status(400).json({
                success: false,
                error: 'Integrations array is required'
            });
        }

        const result = await integrationManager.bulkConnect(req.userId, integrations);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Execute integration action
 */
router.post('/execute/:integrationId', authenticate, async (req, res) => {
    try {
        const { integrationId } = req.params;
        const { action, params } = req.body;

        if (!action) {
            return res.status(400).json({
                success: false,
                error: 'Action is required'
            });
        }

        // Get API instance for user
        const api = integrationManager.getAPIInstance(req.userId, integrationId);

        // Execute action
        let result;
        
        if (typeof api[action] === 'function') {
            result = await api[action](params);
        } else {
            return res.status(400).json({
                success: false,
                error: `Action '${action}' not found`
            });
        }

        res.json({ success: true, result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Export router and setter functions
module.exports = {
    router,
    setIntegrationManager: (manager) => { integrationManager = manager; },
    setAuthSystem: (auth) => { authSystem = auth; }
};
