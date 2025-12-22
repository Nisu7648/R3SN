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

// Load master routes
try {
    const masterRoutes = require('./routes/index');
    app.use('/api', masterRoutes);
    console.log('✅ Master routes loaded successfully');
} catch (error) {
    console.warn('⚠️  Master routes not loaded:', error.message);
}

// Load individual integration routes dynamically
const fs = require('fs');
const routesDir = path.join(__dirname, 'routes');

if (fs.existsSync(routesDir)) {
    const routeFiles = fs.readdirSync(routesDir).filter(file => 
        file.endsWith('.js') && file !== 'index.js'
    );

    routeFiles.forEach(file => {
        try {
            const routeName = file.replace('.js', '');
            const route = require(`./routes/${file}`);
            app.use(`/api/${routeName}`, route);
            console.log(`✅ Route loaded: /api/${routeName}`);
        } catch (error) {
            console.warn(`⚠️  Route ${file} not loaded:`, error.message);
        }
    });
}

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
║   Endpoints:                                              ║
║   - GET  /health                                          ║
║   - GET  /api/health                                      ║
║   - GET  /api/integrations                                ║
║   - POST /api/integrations/:id/execute                    ║
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
