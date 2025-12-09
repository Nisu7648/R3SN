const express = require('express');
const router = express.Router();
const Execution = require('../models/Execution');
const { auth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { sanitizeInput } = require('../middleware/validator');

router.get('/', auth, sanitizeInput, asyncHandler(async (req, res) => {
  const { type, status, page = 1, limit = 20, startDate, endDate } = req.query;
  const query = { userId: req.userId };
  
  if (type) query.type = type;
  if (status) query.status = status;
  
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const executions = await Execution.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('workflowId', 'name')
    .populate('agentId', 'name type')
    .lean();

  const count = await Execution.countDocuments(query);

  const stats = await Execution.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgDuration: { $avg: '$duration' }
      }
    }
  ]);

  res.json({
    success: true,
    executions,
    stats,
    pagination: {
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      hasMore: page * limit < count
    }
  });
}));

router.get('/:id', auth, asyncHandler(async (req, res) => {
  const execution = await Execution.findOne({
    _id: req.params.id,
    userId: req.userId
  })
    .populate('workflowId')
    .populate('agentId')
    .lean();

  if (!execution) {
    return res.status(404).json({
      success: false,
      error: 'Execution not found'
    });
  }

  res.json({
    success: true,
    execution
  });
}));

router.get('/:id/logs', auth, asyncHandler(async (req, res) => {
  const execution = await Execution.findOne({
    _id: req.params.id,
    userId: req.userId
  }).select('logs').lean();

  if (!execution) {
    return res.status(404).json({
      success: false,
      error: 'Execution not found'
    });
  }

  res.json({
    success: true,
    logs: execution.logs || []
  });
}));

router.delete('/:id', auth, asyncHandler(async (req, res) => {
  const execution = await Execution.findOneAndDelete({
    _id: req.params.id,
    userId: req.userId
  });

  if (!execution) {
    return res.status(404).json({
      success: false,
      error: 'Execution not found'
    });
  }

  res.json({
    success: true,
    message: 'Execution deleted successfully'
  });
}));

router.get('/analytics/overview', auth, asyncHandler(async (req, res) => {
  const { days = 7 } = req.query;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));

  const executions = await Execution.find({
    userId: req.userId,
    createdAt: { $gte: startDate }
  }).lean();

  const analytics = {
    totalExecutions: executions.length,
    successful: executions.filter(e => e.status === 'completed').length,
    failed: executions.filter(e => e.status === 'failed').length,
    running: executions.filter(e => e.status === 'running').length,
    pending: executions.filter(e => e.status === 'pending').length,
    avgDuration: 0,
    byType: {},
    byDay: {}
  };

  const completedExecutions = executions.filter(e => e.duration);
  if (completedExecutions.length > 0) {
    analytics.avgDuration = completedExecutions.reduce((sum, e) => sum + e.duration, 0) / completedExecutions.length;
  }

  executions.forEach(exec => {
    if (!analytics.byType[exec.type]) {
      analytics.byType[exec.type] = { total: 0, success: 0, failed: 0 };
    }
    analytics.byType[exec.type].total += 1;
    if (exec.status === 'completed') analytics.byType[exec.type].success += 1;
    if (exec.status === 'failed') analytics.byType[exec.type].failed += 1;

    const day = exec.createdAt.toISOString().split('T')[0];
    if (!analytics.byDay[day]) {
      analytics.byDay[day] = { total: 0, success: 0, failed: 0 };
    }
    analytics.byDay[day].total += 1;
    if (exec.status === 'completed') analytics.byDay[day].success += 1;
    if (exec.status === 'failed') analytics.byDay[day].failed += 1;
  });

  analytics.successRate = analytics.totalExecutions > 0
    ? (analytics.successful / analytics.totalExecutions) * 100
    : 0;

  res.json({
    success: true,
    analytics,
    period: {
      days: parseInt(days),
      startDate,
      endDate: new Date()
    }
  });
}));

router.post('/bulk-delete', auth, sanitizeInput, asyncHandler(async (req, res) => {
  const { executionIds } = req.body;

  if (!executionIds || !Array.isArray(executionIds)) {
    return res.status(400).json({
      success: false,
      error: 'executionIds array is required'
    });
  }

  const result = await Execution.deleteMany({
    _id: { $in: executionIds },
    userId: req.userId
  });

  res.json({
    success: true,
    message: `${result.deletedCount} executions deleted`,
    deletedCount: result.deletedCount
  });
}));

module.exports = router;
