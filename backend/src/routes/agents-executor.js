/**
 * Agent Executor API Routes
 * Endpoints for managing and executing AI agents
 */

const express = require('express');
const router = express.Router();
const agentManager = require('../agents/manager');
const { authenticate } = require('../../middleware/auth');

/**
 * POST /api/agents
 * Create new agent
 */
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { name, description, tasks } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Agent name is required',
      });
    }

    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({
        success: false,
        error: 'Tasks array is required',
      });
    }

    const agent = await agentManager.createAgent({
      name,
      description,
      tasks,
    });

    res.status(201).json({
      success: true,
      message: 'Agent created successfully',
      agent,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/agents/:id/start
 * Start agent task processing
 */
router.post('/:id/start', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const agent = await agentManager.startAgent(id);

    res.json({
      success: true,
      message: 'Agent started successfully',
      agent,
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }
    if (error.message.includes('already running')) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
    next(error);
  }
});

/**
 * POST /api/agents/:id/stop
 * Stop agent
 */
router.post('/:id/stop', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const agent = await agentManager.stopAgent(id);

    res.json({
      success: true,
      message: 'Agent stopped successfully',
      agent,
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }
    if (error.message.includes('already stopped')) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
    next(error);
  }
});

/**
 * GET /api/agents
 * List all agents
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { status, name } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (name) filters.name = name;

    const agents = await agentManager.listAgents(filters);

    res.json({
      success: true,
      count: agents.length,
      agents,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/agents/:id
 * Get agent details
 */
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const agent = await agentManager.getAgent(id);

    res.json({
      success: true,
      agent,
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }
    next(error);
  }
});

/**
 * PUT /api/agents/:id
 * Update agent
 */
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const agent = await agentManager.updateAgent(id, updates);

    res.json({
      success: true,
      message: 'Agent updated successfully',
      agent,
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }
    if (error.message.includes('Cannot update running agent')) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
    next(error);
  }
});

/**
 * DELETE /api/agents/:id
 * Delete agent
 */
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await agentManager.deleteAgent(id);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }
    if (error.message.includes('Cannot delete running agent')) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
    next(error);
  }
});

/**
 * GET /api/agents/:id/logs
 * Get agent logs
 */
router.get('/:id/logs', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { level, limit } = req.query;

    const options = {};
    if (level) options.level = level;
    if (limit) options.limit = parseInt(limit);

    const logs = await agentManager.getAgentLogs(id, options);

    res.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }
    next(error);
  }
});

/**
 * DELETE /api/agents/:id/logs
 * Clear agent logs
 */
router.delete('/:id/logs', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await agentManager.clearAgentLogs(id);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }
    next(error);
  }
});

/**
 * GET /api/agents/stats/overview
 * Get agent statistics
 */
router.get('/stats/overview', authenticate, async (req, res, next) => {
  try {
    const stats = await agentManager.getStatistics();

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
