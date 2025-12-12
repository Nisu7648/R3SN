/**
 * Workflow Engine API Routes
 * Endpoints for creating and executing workflows with retry logic
 */

const express = require('express');
const router = express.Router();
const workflowEngine = require('../workflows/engine');
const { authenticate } = require('../../middleware/auth');

/**
 * POST /api/workflows
 * Create new workflow
 */
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { name, description, steps, config } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Workflow name is required',
      });
    }

    if (!steps || !Array.isArray(steps) || steps.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Workflow must have at least one step',
      });
    }

    const workflow = await workflowEngine.createWorkflow({
      name,
      description,
      steps,
      config,
    });

    res.status(201).json({
      success: true,
      message: 'Workflow created successfully',
      workflow,
    });
  } catch (error) {
    if (error.message.includes('Step')) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
    next(error);
  }
});

/**
 * POST /api/workflows/:id/run
 * Execute workflow
 */
router.post('/:id/run', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { input } = req.body;

    const execution = await workflowEngine.executeWorkflow(id, input || {});

    res.json({
      success: true,
      message: 'Workflow execution started',
      execution,
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
 * GET /api/workflows/:id/status
 * Get workflow status
 */
router.get('/:id/status', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const status = await workflowEngine.getWorkflowStatus(id);

    res.json({
      success: true,
      status,
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
 * GET /api/workflows/:id/history
 * Get workflow execution history
 */
router.get('/:id/history', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, limit } = req.query;

    const options = {};
    if (status) options.status = status;
    if (limit) options.limit = parseInt(limit);

    const history = await workflowEngine.getWorkflowHistory(id, options);

    res.json({
      success: true,
      count: history.length,
      history,
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
 * GET /api/workflows
 * List all workflows
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { name } = req.query;

    const filters = {};
    if (name) filters.name = name;

    const workflows = await workflowEngine.listWorkflows(filters);

    res.json({
      success: true,
      count: workflows.length,
      workflows,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/workflows/:id
 * Get workflow details
 */
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const workflow = await workflowEngine.getWorkflow(id);

    res.json({
      success: true,
      workflow,
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
 * PUT /api/workflows/:id
 * Update workflow
 */
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const workflow = await workflowEngine.updateWorkflow(id, updates);

    res.json({
      success: true,
      message: 'Workflow updated successfully',
      workflow,
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }
    if (error.message.includes('Step')) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
    next(error);
  }
});

/**
 * DELETE /api/workflows/:id
 * Delete workflow
 */
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await workflowEngine.deleteWorkflow(id);

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
 * GET /api/workflows/executions/:executionId
 * Get execution details
 */
router.get('/executions/:executionId', authenticate, async (req, res, next) => {
  try {
    const { executionId } = req.params;

    const execution = await workflowEngine.getExecution(executionId);

    res.json({
      success: true,
      execution,
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

module.exports = router;
