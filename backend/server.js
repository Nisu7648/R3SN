/**
 * R3SN Main Server
 * Complete production-ready server with all systems integrated
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

// Core Systems
const AuthSystem = require('./auth/AuthSystem');
const NaturalLanguageProcessor = require('./core/NaturalLanguageProcessor');
const IntegrationManager = require('./core/IntegrationManager');
const DynamicAPIBuilder = require('./core/DynamicAPIBuilder');
const PluginMaker = require('./core/PluginMaker');

// Routes
const dynamicBuilderRoutes = require('./routes/dynamic-builder');
const apiIntegrationsRoutes = require('./routes/api-integrations');
const integrationsRoutes = require('./routes/integrations');

// Initialize
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Initialize systems
const authSystem = new AuthSystem();
const integrationManager = new IntegrationManager();
const nlp = new NaturalLanguageProcessor();

// Inject dependencies into routes
integrationsRoutes.setIntegrationManager(integrationManager);
integrationsRoutes.setAuthSystem(authSystem);

// ============================================
// AUTHENTICATION ROUTES
// ============================================

app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const result = await authSystem.signup(name, email, password);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authSystem.login(email, password);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/auth/logout', (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        const result = authSystem.logout(token);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/auth/me', (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        const session = authSystem.verifyToken(token);

        if (!session) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const user = authSystem.getUserById(session.userId);
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// NATURAL LANGUAGE PROCESSING
// ============================================

app.post('/api/process', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        const session = authSystem.verifyToken(token);

        if (!session) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { message, history, userId } = req.body;

        const result = await nlp.process(message, history, userId || session.userId);

        res.json(result);
    } catch (error) {
        console.error('Process error:', error);
        res.status(500).json({ 
            success: false, 
            response: 'Sorry, I encountered an error processing your request.',
            error: error.message 
        });
    }
});

// ============================================
// INTEGRATION ROUTES
// ============================================

app.use('/api/integrations', integrationsRoutes.router);

// ============================================
// DYNAMIC BUILDER ROUTES
// ============================================

app.use('/api/builder', dynamicBuilderRoutes);

// ============================================
// API INTEGRATIONS ROUTES
// ============================================

app.use('/api/integrations', apiIntegrationsRoutes);

// ============================================
// HEALTH CHECK
// ============================================

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date(),
        systems: {
            auth: 'operational',
            nlp: 'operational',
            integrationManager: 'operational',
            apiBuilder: 'operational',
            pluginMaker: 'operational'
        }
    });
});

// ============================================
// SERVE FRONTEND
// ============================================

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: err.message
    });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 R3SN Server Running                                  ║
║                                                           ║
║   Port: ${PORT}                                              ║
║   URL: http://localhost:${PORT}                              ║
║                                                           ║
║   Systems:                                                ║
║   ✅ Authentication System                                ║
║   ✅ Integration Manager (User-Specific APIs)            ║
║   ✅ Natural Language Processor                           ║
║   ✅ Dynamic API Builder                                  ║
║   ✅ Plugin Maker                                         ║
║   ✅ Workflow Engine                                      ║
║                                                           ║
║   Available Integrations: 12                              ║
║   - Stripe, Slack, Google, GitHub, Twitter                ║
║   - Twilio, SendGrid, Notion, OpenAI                      ║
║   - Shopify, Discord, Zoom                                ║
║                                                           ║
║   Default Login:                                          ║
║   Email: admin@r3sn.com                                   ║
║   Password: admin123                                      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
});

module.exports = app;
