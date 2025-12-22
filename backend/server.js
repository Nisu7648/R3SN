/**
 * R3SN Production Server
 * Simplified and optimized for deployment
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

// Health check endpoint
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
        timestamp: new Date().toISOString(),
        service: 'R3SN API',
        version: '2.0.0'
    });
});

// API Routes - Load dynamically to avoid startup errors
app.use('/api', (req, res, next) => {
    try {
        // Try to load routes dynamically
        const routes = [
            './routes/integrations',
            './routes/dynamic-builder',
            './routes/api-integrations'
        ];

        routes.forEach(route => {
            try {
                const routeModule = require(route);
                if (routeModule && typeof routeModule === 'function') {
                    routeModule(req, res, next);
                } else if (routeModule && routeModule.router) {
                    routeModule.router(req, res, next);
                }
            } catch (err) {
                console.warn(`Route ${route} not loaded:`, err.message);
            }
        });

        next();
    } catch (error) {
        console.error('Route loading error:', error);
        next();
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
║   🚀 R3SN Server Running                                  ║
║                                                           ║
║   Port: ${PORT}                                           ║
║   Environment: ${process.env.NODE_ENV || 'development'}  ║
║   Status: ✅ READY                                        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

module.exports = app;
