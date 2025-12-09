const express = require('express');
const router = express.Router();
const Agent = require('../models/Agent');
const Execution = require('../models/Execution');
const { auth, requirePlan } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { sanitizeInput } = require('../middleware/validator');
const AgentEngine = require('../core/AgentEngine');
const UniversalExecutor = require('../core/UniversalExecutor');
const IntegrationHub = require('../core/IntegrationHub');
const PluginFactory = require('../core/PluginFactory');

const integrationHub = new IntegrationHub();
const pluginFactory = new PluginFactory();
const agentEngine = new AgentEngine();
const universalExecutor = new UniversalExecutor(agentEngine, integrationHub, pluginFactory);

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

router.post('/', auth, sanitizeInput, asyncHandler(async (req, res) => {
  const { name, type, config, capabilities, metadata } = req.body;

  if (!name || !type) {
    return res.status(400).json({
      success: false,
      error: 'Name and type are required'
    });
  }
  
  const agent = new Agent({
    name,
    type,
    config: config || {},
    capabilities: capabilities || [],
    metadata: metadata || {},
    userId: req.userId
  });

  await agent.save();
  
  req.user.usage.agentsCreated += 1;
  await req.user.save();

  res.status(201).json({
    success: true,
    agent,
    message: 'Agent created successfully'
  });
}));

router.put('/:id', auth, sanitizeInput, asyncHandler(async (req, res) => {
  const { name, config, capabilities, status, metadata } = req.body;

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
  if (status) agent.status = status;
  if (metadata) agent.metadata = { ...agent.metadata, ...metadata };

  await agent.save();

  res.json({
    success: true,
    agent,
    message: 'Agent updated successfully'
  });
}));

router.post('/:id/execute', auth, sanitizeInput, asyncHandler(async (req, res) => {
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

  if (agent.status !== 'active') {
    return res.status(400).json({
      success: false,
      error: `Agent is ${agent.status}. Only active agents can be executed.`
    });
  }

  const execution = new Execution({
    agentId: agent._id,
    userId: req.userId,
    type: 'agent',
    input: req.body.input || {},
    status: 'running'
  });

  await execution.save();

  try {
    const startTime = Date.now();
    
    const result = await agentEngine.execute(agent, req.body.input || {});
    
    const executionTime = Date.now() - startTime;

    await execution.complete(result);
    await agent.updatePerformance(executionTime, true);

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
    await agent.updatePerformance(Date.now() - execution.startTime, false);

    res.status(500).json({
      success: false,
      error: error.message,
      executionId: execution._id
    });
  }
}));

router.post('/execute-prompt', auth, sanitizeInput, asyncHandler(async (req, res) => {
  const { prompt, context } = req.body;

  if (!prompt) {
    return res.status(400).json({
      success: false,
      error: 'Prompt is required'
    });
  }

  const execution = new Execution({
    userId: req.userId,
    type: 'prompt',
    input: { prompt, context },
    status: 'running'
  });

  await execution.save();

  try {
    const startTime = Date.now();
    
    const result = await universalExecutor.execute(prompt, {
      ...context,
      userId: req.userId,
      startTime
    });
    
    await execution.complete(result);

    req.user.usage.workflowsExecuted += 1;
    await req.user.save();

    res.json({
      success: true,
      result,
      executionId: execution._id
    });
  } catch (error) {
    await execution.fail(error);

    res.status(500).json({
      success: false,
      error: error.message,
      executionId: execution._id
    });
  }
}));

router.delete('/:id', auth, asyncHandler(async (req, res) => {
  const agent = await Agent.findOneAndDelete({
    _id: req.params.id,
    userId: req.userId
  });

  if (!agent) {
    return res.status(404).json({
      success: false,
      error: 'Agent not found'
    });
  }

  await Execution.deleteMany({ agentId: agent._id });

  res.json({
    success: true,
    message: 'Agent deleted successfully'
  });
}));

router.get('/:id/executions', auth, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  
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

  const query = { agentId: agent._id };
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

module.exports = router;
