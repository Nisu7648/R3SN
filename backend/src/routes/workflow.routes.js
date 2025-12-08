/**
 * Workflow API Routes
 */

const express = require('express');
const router = express.Router();

// Workflow engine will be injected
let workflowEngine;

const setWorkflowEngine = (engine) => {
  workflowEngine = engine;
};

/**
 * @route   POST /api/workflows/execute
 * @desc    Execute a workflow
 * @access  Public
 */
router.post('/execute', async (req, res) => {
  try {
    const { workflowId, workflow, inputData, options } = req.body;

    if (!workflow) {
      return res.status(400).json({
        success: false,
        error: 'Workflow is required'
      });
    }

    const result = await workflowEngine.executeWorkflow(
      workflowId || 'temp',
      workflow,
      inputData,
      options
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/workflows/executions/:executionId
 * @desc    Get execution status
 * @access  Public
 */
router.get('/executions/:executionId', async (req, res) => {
  try {
    const { executionId } = req.params;

    const status = workflowEngine.getExecutionStatus(executionId);

    if (!status) {
      return res.status(404).json({
        success: false,
        error: 'Execution not found'
      });
    }

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/workflows/executions
 * @desc    Get all active executions
 * @access  Public
 */
router.get('/executions', async (req, res) => {
  try {
    const executions = workflowEngine.getActiveExecutions();

    res.json({
      success: true,
      data: executions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/workflows/history
 * @desc    Get execution history
 * @access  Public
 */
router.get('/history', async (req, res) => {
  try {
    const { limit = 100 } = req.query;

    const history = workflowEngine.getExecutionHistory(parseInt(limit));

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/workflows/executions/:executionId/stop
 * @desc    Stop an execution
 * @access  Public
 */
router.post('/executions/:executionId/stop', async (req, res) => {
  try {
    const { executionId } = req.params;

    await workflowEngine.stopExecution(executionId);

    res.json({
      success: true,
      message: 'Execution stopped'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/workflows/nodes
 * @desc    Get all registered nodes
 * @access  Public
 */
router.get('/nodes', async (req, res) => {
  try {
    const nodes = workflowEngine.getRegisteredNodes();

    res.json({
      success: true,
      data: nodes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/workflows/validate
 * @desc    Validate a workflow
 * @access  Public
 */
router.post('/validate', async (req, res) => {
  try {
    const { workflow } = req.body;

    if (!workflow) {
      return res.status(400).json({
        success: false,
        error: 'Workflow is required'
      });
    }

    workflowEngine.validateWorkflow(workflow);

    res.json({
      success: true,
      message: 'Workflow is valid'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = { router, setWorkflowEngine };
