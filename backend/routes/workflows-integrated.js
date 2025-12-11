/**
 * Workflows Routes - REAL INTEGRATION
 * Connected to ExecutionOrchestrator for actual workflow execution
 */

const express = require('express');
const router = express.Router();
const Workflow = require('../models/Workflow');
const Execution = require('../models/Execution');
const { auth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { sanitizeInput } = require('../middleware/validator');

const getOrchestrator = (req) => req.app.locals.orchestrator;
const getRealtimeEngine = (req) => req.app.locals.realtimeEngine;

/**
 * GET /api/workflows - List all workflows
 */
router.get('/', auth, asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20, search } = req.query;
  const query = { userId: req.userId };
  
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const workflows = await Workflow.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const count = await Workflow.countDocuments(query);

  res.json({
    success: true,
    workflows,
    pagination: {
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit)
    }
  });
}));

/**
 * GET /api/workflows/:id - Get workflow details
 */
router.get('/:id', auth, asyncHandler(async (req, res) => {
  const workflow = await Workflow.findOne({
    _id: req.params.id,
    userId: req.userId
  }).lean();

  if (!workflow) {
    return res.status(404).json({
      success: false,
      error: 'Workflow not found'
    });
  }

  const recentExecutions = await Execution.find({
    workflowId: workflow._id
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  res.json({
    success: true,
    workflow,
    recentExecutions
  });
}));

/**
 * POST /api/workflows - Create new workflow
 */
router.post('/', auth, sanitizeInput, asyncHandler(async (req, res) => {
  const { name, description, trigger, steps, config } = req.body;

  if (!name || !steps || !Array.isArray(steps) || steps.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Name and steps are required'
    });
  }

  const workflow = new Workflow({
    name,
    description,
    trigger: trigger || { type: 'manual' },
    steps,
    config: config || {},
    userId: req.userId,
    status: 'active'
  });

  await workflow.save();

  const realtimeEngine = getRealtimeEngine(req);
  if (realtimeEngine) {
    realtimeEngine.broadcastWorkflowUpdate(req.userId, workflow, 'created');
  }

  res.status(201).json({
    success: true,
    workflow
  });
}));

/**
 * POST /api/workflows/:id/execute - Execute workflow
 */
router.post('/:id/execute', auth, sanitizeInput, asyncHandler(async (req, res) => {
  const { triggerData } = req.body;

  const workflow = await Workflow.findOne({
    _id: req.params.id,
    userId: req.userId
  });

  if (!workflow) {
    return res.status(404).json({
      success: false,
      error: 'Workflow not found'
    });
  }

  if (workflow.status !== 'active') {
    return res.status(400).json({
      success: false,
      error: 'Workflow is not active'
    });
  }

  const orchestrator = getOrchestrator(req);
  const realtimeEngine = getRealtimeEngine(req);

  console.log(`\n🔄 [Workflow Execute] User ${req.userId} executing workflow ${workflow.name}`);
  console.log(`📋 Steps: ${workflow.steps.length}`);

  // Execute workflow using orchestrator
  const result = await orchestrator.executeWorkflow(
    workflow._id.toString(),
    req.userId,
    triggerData || {}
  );

  // Broadcast completion
  if (realtimeEngine) {
    realtimeEngine.sendSuccessNotification(req.userId, 'Workflow executed successfully', {
      workflowId: workflow._id,
      executionId: result.executionId,
      workflowName: workflow.name
    });
  }

  res.json({
    success: true,
    ...result
  });
}));

/**
 * PUT /api/workflows/:id - Update workflow
 */
router.put('/:id', auth, sanitizeInput, asyncHandler(async (req, res) => {
  const { name, description, trigger, steps, config, status } = req.body;

  const workflow = await Workflow.findOne({
    _id: req.params.id,
    userId: req.userId
  });

  if (!workflow) {
    return res.status(404).json({
      success: false,
      error: 'Workflow not found'
    });
  }

  if (name) workflow.name = name;
  if (description) workflow.description = description;
  if (trigger) workflow.trigger = trigger;
  if (steps) workflow.steps = steps;
  if (config) workflow.config = { ...workflow.config, ...config };
  if (status) workflow.status = status;

  await workflow.save();

  const realtimeEngine = getRealtimeEngine(req);
  if (realtimeEngine) {
    realtimeEngine.broadcastWorkflowUpdate(req.userId, workflow, 'updated');
  }

  res.json({
    success: true,
    workflow
  });
}));

/**
 * DELETE /api/workflows/:id - Delete workflow
 */
router.delete('/:id', auth, asyncHandler(async (req, res) => {
  const workflow = await Workflow.findOne({
    _id: req.params.id,
    userId: req.userId
  });

  if (!workflow) {
    return res.status(404).json({
      success: false,
      error: 'Workflow not found'
    });
  }

  await workflow.deleteOne();

  const realtimeEngine = getRealtimeEngine(req);
  if (realtimeEngine) {
    realtimeEngine.broadcastWorkflowUpdate(req.userId, workflow, 'deleted');
  }

  res.json({
    success: true,
    message: 'Workflow deleted successfully'
  });
}));

/**
 * GET /api/workflows/:id/executions - Get workflow execution history
 */
router.get('/:id/executions', auth, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const query = {
    workflowId: req.params.id,
    userId: req.userId
  };

  if (status) query.status = status;

  const executions = await Execution.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const count = await Execution.countDocuments(query);

  res.json({
    success: true,
    executions,
    pagination: {
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit)
    }
  });
}));

/**
 * GET /api/workflows/:id/analytics - Get workflow analytics
 */
router.get('/:id/analytics', auth, asyncHandler(async (req, res) => {
  const workflow = await Workflow.findOne({
    _id: req.params.id,
    userId: req.userId
  });

  if (!workflow) {
    return res.status(404).json({
      success: false,
      error: 'Workflow not found'
    });
  }

  const executions = await Execution.find({
    workflowId: workflow._id
  }).lean();

  const totalExecutions = executions.length;
  const successfulExecutions = executions.filter(e => e.status === 'completed').length;
  const failedExecutions = executions.filter(e => e.status === 'failed').length;
  const averageExecutionTime = executions.reduce((sum, e) => sum + (e.executionTime || 0), 0) / totalExecutions || 0;

  // Step-level analytics
  const stepAnalytics = analyzeSteps(executions, workflow.steps.length);

  const analytics = {
    totalExecutions,
    successfulExecutions,
    failedExecutions,
    successRate: totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0,
    averageExecutionTime,
    lastExecution: executions[0]?.createdAt,
    executionsByDay: groupExecutionsByDay(executions),
    stepAnalytics
  };

  res.json({
    success: true,
    analytics
  });
}));

/**
 * POST /api/workflows/:id/pause - Pause workflow
 */
router.post('/:id/pause', auth, asyncHandler(async (req, res) => {
  const workflow = await Workflow.findOne({
    _id: req.params.id,
    userId: req.userId
  });

  if (!workflow) {
    return res.status(404).json({
      success: false,
      error: 'Workflow not found'
    });
  }

  workflow.status = 'paused';
  await workflow.save();

  const realtimeEngine = getRealtimeEngine(req);
  if (realtimeEngine) {
    realtimeEngine.broadcastWorkflowUpdate(req.userId, workflow, 'paused');
  }

  res.json({
    success: true,
    workflow
  });
}));

/**
 * POST /api/workflows/:id/resume - Resume workflow
 */
router.post('/:id/resume', auth, asyncHandler(async (req, res) => {
  const workflow = await Workflow.findOne({
    _id: req.params.id,
    userId: req.userId
  });

  if (!workflow) {
    return res.status(404).json({
      success: false,
      error: 'Workflow not found'
    });
  }

  workflow.status = 'active';
  await workflow.save();

  const realtimeEngine = getRealtimeEngine(req);
  if (realtimeEngine) {
    realtimeEngine.broadcastWorkflowUpdate(req.userId, workflow, 'resumed');
  }

  res.json({
    success: true,
    workflow
  });
}));

/**
 * POST /api/workflows/:id/duplicate - Duplicate workflow
 */
router.post('/:id/duplicate', auth, asyncHandler(async (req, res) => {
  const workflow = await Workflow.findOne({
    _id: req.params.id,
    userId: req.userId
  });

  if (!workflow) {
    return res.status(404).json({
      success: false,
      error: 'Workflow not found'
    });
  }

  const duplicated = new Workflow({
    name: `${workflow.name} (Copy)`,
    description: workflow.description,
    trigger: workflow.trigger,
    steps: workflow.steps,
    config: workflow.config,
    userId: req.userId,
    status: 'draft'
  });

  await duplicated.save();

  res.json({
    success: true,
    workflow: duplicated
  });
}));

/**
 * Helper: Analyze step performance
 */
function analyzeSteps(executions, totalSteps) {
  const stepStats = Array(totalSteps).fill(null).map((_, i) => ({
    stepIndex: i,
    totalExecutions: 0,
    successful: 0,
    failed: 0,
    averageTime: 0
  }));

  executions.forEach(exec => {
    if (exec.result && exec.result.steps) {
      exec.result.steps.forEach((step, index) => {
        if (stepStats[index]) {
          stepStats[index].totalExecutions += 1;
          if (step.success) stepStats[index].successful += 1;
          else stepStats[index].failed += 1;
          stepStats[index].averageTime += step.executionTime || 0;
        }
      });
    }
  });

  // Calculate averages
  stepStats.forEach(stat => {
    if (stat.totalExecutions > 0) {
      stat.averageTime = stat.averageTime / stat.totalExecutions;
      stat.successRate = (stat.successful / stat.totalExecutions) * 100;
    }
  });

  return stepStats;
}

/**
 * Helper: Group executions by day
 */
function groupExecutionsByDay(executions) {
  const grouped = {};
  
  executions.forEach(exec => {
    const date = new Date(exec.createdAt).toISOString().split('T')[0];
    if (!grouped[date]) {
      grouped[date] = { total: 0, successful: 0, failed: 0 };
    }
    grouped[date].total += 1;
    if (exec.status === 'completed') grouped[date].successful += 1;
    if (exec.status === 'failed') grouped[date].failed += 1;
  });

  return Object.entries(grouped).map(([date, stats]) => ({
    date,
    ...stats
  }));
}

module.exports = router;
