const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const cache = require('../utils/cache');
const metrics = require('../utils/metrics');
const ResponseHandler = require('../utils/responseHandler');
const { asyncHandler } = require('../utils/errorHandler');

// Basic health check
router.get('/', asyncHandler(async (req, res) => {
  const health = {
    healthy: true,
    checks: {
      server: 'healthy',
      database: 'unknown',
      cache: 'unknown',
    },
  };

  // Check MongoDB
  try {
    if (mongoose.connection.readyState === 1) {
      health.checks.database = 'healthy';
    } else {
      health.checks.database = 'unhealthy';
      health.healthy = false;
    }
  } catch (error) {
    health.checks.database = 'unhealthy';
    health.healthy = false;
  }

  // Check Redis
  try {
    if (cache.isConnected) {
      await cache.set('health:check', Date.now(), 10);
      health.checks.cache = 'healthy';
    } else {
      health.checks.cache = 'unhealthy';
      health.healthy = false;
    }
  } catch (error) {
    health.checks.cache = 'unhealthy';
    health.healthy = false;
  }

  ResponseHandler.health(res, health);
}));

// Detailed health check
router.get('/detailed', asyncHandler(async (req, res) => {
  const health = {
    healthy: true,
    checks: {
      server: {
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
      },
      database: {
        status: 'unknown',
        readyState: mongoose.connection.readyState,
      },
      cache: {
        status: 'unknown',
        connected: cache.isConnected,
      },
    },
  };

  // Check MongoDB
  try {
    if (mongoose.connection.readyState === 1) {
      health.checks.database.status = 'healthy';
      health.checks.database.host = mongoose.connection.host;
      health.checks.database.name = mongoose.connection.name;
    } else {
      health.checks.database.status = 'unhealthy';
      health.healthy = false;
    }
  } catch (error) {
    health.checks.database.status = 'unhealthy';
    health.checks.database.error = error.message;
    health.healthy = false;
  }

  // Check Redis
  try {
    if (cache.isConnected) {
      const testKey = 'health:detailed:check';
      const testValue = Date.now();
      await cache.set(testKey, testValue, 10);
      const retrieved = await cache.get(testKey);
      
      if (retrieved === testValue) {
        health.checks.cache.status = 'healthy';
      } else {
        health.checks.cache.status = 'degraded';
        health.healthy = false;
      }
    } else {
      health.checks.cache.status = 'unhealthy';
      health.healthy = false;
    }
  } catch (error) {
    health.checks.cache.status = 'unhealthy';
    health.checks.cache.error = error.message;
    health.healthy = false;
  }

  ResponseHandler.health(res, health);
}));

// Readiness check (for Kubernetes/Docker)
router.get('/ready', asyncHandler(async (req, res) => {
  const ready = mongoose.connection.readyState === 1 && cache.isConnected;
  
  if (ready) {
    res.status(200).json({ ready: true });
  } else {
    res.status(503).json({ ready: false });
  }
}));

// Liveness check (for Kubernetes/Docker)
router.get('/live', (req, res) => {
  res.status(200).json({ alive: true });
});

// Metrics endpoint
router.get('/metrics', asyncHandler(async (req, res) => {
  const allMetrics = metrics.getDetailedStats();
  ResponseHandler.success(res, allMetrics, 'Metrics retrieved successfully');
}));

// Workflow metrics
router.get('/metrics/workflows', asyncHandler(async (req, res) => {
  const workflowMetrics = metrics.getWorkflowMetrics();
  ResponseHandler.success(res, workflowMetrics, 'Workflow metrics retrieved');
}));

// Agent metrics
router.get('/metrics/agents', asyncHandler(async (req, res) => {
  const agentMetrics = metrics.getAgentMetrics();
  ResponseHandler.success(res, agentMetrics, 'Agent metrics retrieved');
}));

// Integration metrics
router.get('/metrics/integrations', asyncHandler(async (req, res) => {
  const integrationMetrics = metrics.getIntegrationMetrics();
  ResponseHandler.success(res, integrationMetrics, 'Integration metrics retrieved');
}));

// API metrics
router.get('/metrics/api', asyncHandler(async (req, res) => {
  const apiMetrics = metrics.getApiMetrics();
  ResponseHandler.success(res, apiMetrics, 'API metrics retrieved');
}));

// System metrics
router.get('/metrics/system', asyncHandler(async (req, res) => {
  const systemMetrics = metrics.getSystemMetrics();
  ResponseHandler.success(res, systemMetrics, 'System metrics retrieved');
}));

// Reset metrics (admin only)
router.post('/metrics/reset', asyncHandler(async (req, res) => {
  metrics.reset();
  ResponseHandler.success(res, null, 'Metrics reset successfully');
}));

module.exports = router;
