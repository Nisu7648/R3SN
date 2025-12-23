/**
 * R3SN Production Server
 * REAL WORKING VERSION - NO BS
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Health check endpoints
app.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'R3SN Backend',
        version: '2.0.0'
    });
});

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

// Load integration loader
let integrationLoader;
try {
    integrationLoader = require('./integrations/index');
    console.log('✅ Integration loader initialized');
} catch (error) {
    console.error('❌ Integration loader failed:', error.message);
}

// Integration routes
app.get('/api/integrations', (req, res) => {
    try {
        if (!integrationLoader) {
            return res.status(500).json({
                success: false,
                error: 'Integration loader not available'
            });
        }

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

app.get('/api/integrations/:id', (req, res) => {
    try {
        if (!integrationLoader) {
            return res.status(500).json({
                success: false,
                error: 'Integration loader not available'
            });
        }

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

app.post('/api/integrations/:id/execute', async (req, res) => {
    try {
        if (!integrationLoader) {
            return res.status(500).json({
                success: false,
                error: 'Integration loader not available'
            });
        }

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

// Catch-all for frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
    });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 R3SN Server LIVE                                     ║
║                                                           ║
║   Port: ${PORT}                                           ║
║   Environment: ${process.env.NODE_ENV || 'development'}  ║
║                                                           ║
║   API Endpoints:                                          ║
║   GET  /health                                            ║
║   GET  /api/health                                        ║
║   GET  /api/integrations                                  ║
║   GET  /api/integrations/:id                              ║
║   POST /api/integrations/:id/execute                      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

module.exports = app;
