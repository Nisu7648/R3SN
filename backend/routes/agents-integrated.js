/**
 * Agents Routes - REAL INTEGRATION
 * Connected to ExecutionOrchestrator for actual execution
 */

const express = require('express');
const router = express.Router();
const Agent = require('../models/Agent');
const Execution = require('../models/Execution');
const { auth, requirePlan } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { sanitizeInput } = require('../middleware/validator');

// Get orchestrator from app locals
const getOrchestrator = (req) => req.app.locals.orchestrator;
const getRealtimeEngine = (req) => req.app.locals.realtimeEngine;

/**
 * GET /api/agents - List all agents
 */
router.get('/', auth, sanitizeInput, asyncHandler(async (req, res) => {
  const { status, type, page = 1, limit = 20, search } = req.query;
  const query = { userId: req.userId };
  
  if (status) query.status = status;
  if (type) query.type = type;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { 'metadata.description': { $regex: search, $options: 'i' } }
    ];
  }

  const agents = await Agent.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const count = await Agent.countDocuments(query);

  res.json({
    success: true,
    agents,
    pagination: {
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      hasMore: page * limit < count
    }
  });
}));

/**
 * GET /api/agents/:id - Get agent details
 */
router.get('/:id', auth, asyncHandler(async (req, res) => {
  const agent = await Agent.findOne({
    _id: req.params.id,
    userId: req.userId
  }).lean();

  if (!agent) {
    return res.status(404).json({
      success: false,
      error: 'Agent not found'
    });
  }

  const recentExecutions = await Execution.find({
    agentId: agent._id
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  res.json({
    success: true,
    agent,
    recentExecutions
  });
}));

/**
 * POST /api/agents - Create new agent
 */
router.post('/', auth, sanitizeInput, asyncHandler(async (req, res) => {
  const { name, type, config, capabilities, metadata } = req.body;

  if (!name || !type) {
    return res.status(400).json({
      success: false,
      error: 'Name and type are required'
    });
  }

  const orchestrator = getOrchestrator(req);
  const realtimeEngine = getRealtimeEngine(req);

  // Create agent using orchestrator's agent engine
  const agent = await orchestrator.agentEngine.createAgent({
    name,
    type,
    config: config || {},
    capabilities: capabilities || [],
    metadata: metadata || {},
    userId: req.userId
  });

  // Broadcast to user's connected clients
  if (realtimeEngine) {
    realtimeEngine.broadcastAgentUpdate(req.userId, agent, 'created');
  }

  res.status(201).json({
    success: true,
    agent
  });
}));

/**
 * POST /api/agents/execute-prompt - Execute universal prompt
 */
router.post('/execute-prompt', auth, sanitizeInput, asyncHandler(async (req, res) => {
  const { prompt, context } = req.body;

  if (!prompt) {
    return res.status(400).json({
      success: false,
      error: 'Prompt is required'
    });
  }

  const orchestrator = getOrchestrator(req);
  const realtimeEngine = getRealtimeEngine(req);

  console.log(`\n🚀 [Agent Execute] User ${req.userId} executing prompt`);
  console.log(`📝 Prompt: ${prompt}`);

  // Execute using orchestrator
  const result = await orchestrator.executePrompt(prompt, req.userId, context);

  // Broadcast completion
  if (realtimeEngine) {
    realtimeEngine.sendSuccessNotification(req.userId, 'Prompt executed successfully', {
      executionId: result.executionId,
      prompt
    });
  }

  res.json({
    success: true,
    ...result
  });
}));

/**
 * GET /api/agents/:id/executions - Get agent execution history
 */
router.get('/:id/executions', auth, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const query = {
    agentId: req.params.id,
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
 * PUT /api/agents/:id - Update agent
 */
router.put('/:id', auth, sanitizeInput, asyncHandler(async (req, res) => {
  const { name, config, capabilities, metadata, status } = req.body;

  const agent = await Agent.findOne({
    _id: req.params.id,
    userId: req.userId
  });

  if (!agent) {
    return res.status(404).json({
      success: false,
      error: 'Agent not found'
    });
  }

  if (name) agent.name = name;
  if (config) agent.config = { ...agent.config, ...config };
  if (capabilities) agent.capabilities = capabilities;
  if (metadata) agent.metadata = { ...agent.metadata, ...metadata };
  if (status) agent.status = status;

  await agent.save();

  const realtimeEngine = getRealtimeEngine(req);
  if (realtimeEngine) {
    realtimeEngine.broadcastAgentUpdate(req.userId, agent, 'updated');
  }

  res.json({
    success: true,
    agent
  });
}));

/**
 * DELETE /api/agents/:id - Delete agent
 */
router.delete('/:id', auth, asyncHandler(async (req, res) => {
  const agent = await Agent.findOne({
    _id: req.params.id,
    userId: req.userId
  });

  if (!agent) {
    return res.status(404).json({
      success: false,
      error: 'Agent not found'
    });
  }

  await agent.deleteOne();

  const realtimeEngine = getRealtimeEngine(req);
  if (realtimeEngine) {
    realtimeEngine.broadcastAgentUpdate(req.userId, agent, 'deleted');
  }

  res.json({
    success: true,
    message: 'Agent deleted successfully'
  });
}));

/**
 * POST /api/agents/:id/execute - Execute specific agent
 */
router.post('/:id/execute', auth, sanitizeInput, asyncHandler(async (req, res) => {
  const { action, parameters, context } = req.body;

  const agent = await Agent.findOne({
    _id: req.params.id,
    userId: req.userId
  });

  if (!agent) {
    return res.status(404).json({
      success: false,
      error: 'Agent not found'
    });
  }

  const orchestrator = getOrchestrator(req);

  console.log(`\n⚡ [Agent Execute] Executing agent ${agent.name}`);
  console.log(`🎯 Action: ${action}`);

  // Execute agent using orchestrator
  const result = await orchestrator.agentEngine.executeAgent(
    agent,
    action,
    { ...parameters, ...context }
  );

  // Update agent stats
  agent.executionCount += 1;
  agent.lastExecutedAt = new Date();
  await agent.save();

  res.json({
    success: true,
    agent: agent.toObject(),
    result
  });
}));

/**
 * GET /api/agents/:id/analytics - Get agent analytics
 */
router.get('/:id/analytics', auth, asyncHandler(async (req, res) => {
  const agent = await Agent.findOne({
    _id: req.params.id,
    userId: req.userId
  });

  if (!agent) {
    return res.status(404).json({
      success: false,
      error: 'Agent not found'
    });
  }

  const executions = await Execution.find({
    agentId: agent._id
  }).lean();

  const totalExecutions = executions.length;
  const successfulExecutions = executions.filter(e => e.status === 'completed').length;
  const failedExecutions = executions.filter(e => e.status === 'failed').length;
  const averageExecutionTime = executions.reduce((sum, e) => sum + (e.executionTime || 0), 0) / totalExecutions || 0;

  const analytics = {
    totalExecutions,
    successfulExecutions,
    failedExecutions,
    successRate: totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0,
    averageExecutionTime,
    lastExecution: executions[0]?.createdAt,
    executionsByDay: groupExecutionsByDay(executions)
  };

  res.json({
    success: true,
    analytics
  });
}));

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
