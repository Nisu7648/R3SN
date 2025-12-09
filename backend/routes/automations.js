const express = require('express');
const router = express.Router();
const Workflow = require('../models/Workflow');
const Execution = require('../models/Execution');
const { auth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { sanitizeInput } = require('../middleware/validator');
const EnterpriseOrchestrator = require('../core/EnterpriseOrchestrator');

const orchestrator = new EnterpriseOrchestrator();

router.get('/', auth, sanitizeInput, asyncHandler(async (req, res) => {
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
    .populate('steps.integrationId', 'name icon')
    .populate('steps.agentId', 'name type')
    .lean();

  const count = await Workflow.countDocuments(query);

  res.json({
    success: true,
    workflows,
    pagination: {
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      hasMore: page * limit < count
    }
  });
}));

router.get('/:id', auth, asyncHandler(async (req, res) => {
  const workflow = await Workflow.findOne({
    _id: req.params.id,
    userId: req.userId
  })
    .populate('steps.integrationId')
    .populate('steps.agentId')
    .lean();

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

router.post('/', auth, sanitizeInput, asyncHandler(async (req, res) => {
  const { name, description, trigger, steps } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      error: 'Workflow name is required'
    });
  }

  if (!steps || !Array.isArray(steps) || steps.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'At least one step is required'
    });
  }

  const workflow = new Workflow({
    name,
    description,
    trigger: trigger || { type: 'manual' },
    steps: steps.map((step, index) => ({
      ...step,
      order: index + 1
    })),
    userId: req.userId
  });

  await workflow.save();

  res.status(201).json({
    success: true,
    workflow,
    message: 'Workflow created successfully'
  });
}));

router.put('/:id', auth, sanitizeInput, asyncHandler(async (req, res) => {
  const { name, description, trigger, steps, status } = req.body;

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
  if (description !== undefined) workflow.description = description;
  if (trigger) workflow.trigger = trigger;
  if (steps) {
    workflow.steps = steps.map((step, index) => ({
      ...step,
      order: index + 1
    }));
  }
  if (status) workflow.status = status;

  await workflow.save();

  res.json({
    success: true,
    workflow,
    message: 'Workflow updated successfully'
  });
}));

router.post('/:id/execute', auth, sanitizeInput, asyncHandler(async (req, res) => {
  const workflow = await Workflow.findOne({
    _id: req.params.id,
    userId: req.userId
  })
    .populate('steps.integrationId')
    .populate('steps.agentId');

  if (!workflow) {
    return res.status(404).json({
      success: false,
      error: 'Workflow not found'
    });
  }

  if (workflow.status !== 'active') {
    return res.status(400).json({
      success: false,
      error: `Workflow is ${workflow.status}. Only active workflows can be executed.`
    });
  }

  const execution = new Execution({
    workflowId: workflow._id,
    userId: req.userId,
    type: 'workflow',
    input: req.body.input || {},
    status: 'running'
  });

  await execution.save();

  try {
    const startTime = Date.now();

    const result = await orchestrator.executeWorkflow(workflow, req.body.input || {});

    const executionTime = Date.now() - startTime;

    await execution.complete(result);

    if (!workflow.performance) {
      workflow.performance = {
        avgExecutionTime: 0,
        successRate: 100,
        totalExecutions: 0,
        failedExecutions: 0
      };
    }

    workflow.executionCount += 1;
    workflow.lastExecuted = new Date();
    workflow.performance.totalExecutions += 1;

    const total = workflow.performance.avgExecutionTime * (workflow.performance.totalExecutions - 1);
    workflow.performance.avgExecutionTime = (total + executionTime) / workflow.performance.totalExecutions;
    workflow.performance.successRate = 
      ((workflow.performance.totalExecutions - workflow.performance.failedExecutions) / 
      workflow.performance.totalExecutions) * 100;

    await workflow.save();

    req.user.usage.workflowsExecuted += 1;
    await req.user.save();

    res.json({
      success: true,
      result,
      executionTime,
      executionId: execution._id
    });
  } catch (error) {
    await execution.fail(error);

    if (!workflow.performance) {
      workflow.performance = {
        avgExecutionTime: 0,
        successRate: 0,
        totalExecutions: 0,
        failedExecutions: 0
      };
    }

    workflow.performance.totalExecutions += 1;
    workflow.performance.failedExecutions += 1;
    workflow.performance.successRate = 
      ((workflow.performance.totalExecutions - workflow.performance.failedExecutions) / 
      workflow.performance.totalExecutions) * 100;

    await workflow.save();

    res.status(500).json({
      success: false,
      error: error.message,
      executionId: execution._id
    });
  }
}));

router.delete('/:id', auth, asyncHandler(async (req, res) => {
  const workflow = await Workflow.findOneAndDelete({
    _id: req.params.id,
    userId: req.userId
  });

  if (!workflow) {
    return res.status(404).json({
      success: false,
      error: 'Workflow not found'
    });
  }

  await Execution.deleteMany({ workflowId: workflow._id });

  res.json({
    success: true,
    message: 'Workflow deleted successfully'
  });
}));

router.get('/:id/executions', auth, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  
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

  const query = { workflowId: workflow._id };
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
    userId: req.userId,
    status: 'draft'
  });

  await duplicated.save();

  res.status(201).json({
    success: true,
    workflow: duplicated,
    message: 'Workflow duplicated successfully'
  });
}));

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

  const analytics = {
    totalExecutions: executions.length,
    successfulExecutions: executions.filter(e => e.status === 'completed').length,
    failedExecutions: executions.filter(e => e.status === 'failed').length,
    avgExecutionTime: workflow.performance?.avgExecutionTime || 0,
    successRate: workflow.performance?.successRate || 0,
    lastExecuted: workflow.lastExecuted,
    executionsByDay: {}
  };

  executions.forEach(exec => {
    const day = exec.createdAt.toISOString().split('T')[0];
    if (!analytics.executionsByDay[day]) {
      analytics.executionsByDay[day] = { total: 0, success: 0, failed: 0 };
    }
    analytics.executionsByDay[day].total += 1;
    if (exec.status === 'completed') analytics.executionsByDay[day].success += 1;
    if (exec.status === 'failed') analytics.executionsByDay[day].failed += 1;
  });

  res.json({
    success: true,
    analytics
  });
}));

module.exports = router;
