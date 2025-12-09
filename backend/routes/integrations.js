const express = require('express');
const router = express.Router();
const Integration = require('../models/Integration');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { sanitizeInput } = require('../middleware/validator');
const IntegrationHub = require('../core/IntegrationHub');

const integrationHub = new IntegrationHub();

router.get('/', asyncHandler(async (req, res) => {
  const { category, type, search, page = 1, limit = 50 } = req.query;
  const query = { isActive: true };
  
  if (category) query.category = category;
  if (type) query.type = type;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const integrations = await Integration.find(query)
    .sort({ name: 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select('-endpoints')
    .lean();

  const count = await Integration.countDocuments(query);

  const categories = await Integration.distinct('category', { isActive: true });

  res.json({
    success: true,
    integrations,
    categories,
    pagination: {
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      hasMore: page * limit < count
    },
    stats: {
      totalIntegrations: count,
      categoriesCount: categories.length
    }
  });
}));

router.get('/categories', asyncHandler(async (req, res) => {
  const categories = await Integration.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        integrations: {
          $push: {
            id: '$_id',
            name: '$name',
            icon: '$icon',
            type: '$type'
          }
        }
      }
    },
    { $sort: { count: -1 } }
  ]);

  res.json({
    success: true,
    categories: categories.map(cat => ({
      name: cat._id,
      count: cat.count,
      integrations: cat.integrations
    }))
  });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const integration = await Integration.findOne({
    _id: req.params.id,
    isActive: true
  }).lean();

  if (!integration) {
    return res.status(404).json({
      success: false,
      error: 'Integration not found'
    });
  }

  res.json({
    success: true,
    integration
  });
}));

router.post('/:id/connect', auth, sanitizeInput, asyncHandler(async (req, res) => {
  const { credentials, config } = req.body;

  const integration = await Integration.findOne({
    _id: req.params.id,
    isActive: true
  });

  if (!integration) {
    return res.status(404).json({
      success: false,
      error: 'Integration not found'
    });
  }

  if (!credentials && integration.authType !== 'none') {
    return res.status(400).json({
      success: false,
      error: 'Credentials are required for this integration'
    });
  }

  const existingIntegration = req.user.integrations.find(
    int => int.service === integration.name
  );

  if (existingIntegration) {
    existingIntegration.credentials = credentials;
    existingIntegration.connected = true;
    existingIntegration.connectedAt = new Date();
  } else {
    req.user.integrations.push({
      service: integration.name,
      connected: true,
      credentials,
      connectedAt: new Date()
    });
  }

  await req.user.save();

  try {
    const connectionTest = await integrationHub.testConnection(
      integration.name,
      credentials
    );

    res.json({
      success: true,
      message: 'Integration connected successfully',
      integration: {
        id: integration._id,
        name: integration.name,
        connected: true
      },
      connectionTest
    });
  } catch (error) {
    const userIntegration = req.user.integrations.find(
      int => int.service === integration.name
    );
    if (userIntegration) {
      userIntegration.connected = false;
    }
    await req.user.save();

    res.status(400).json({
      success: false,
      error: 'Connection test failed',
      message: error.message
    });
  }
}));

router.post('/:id/disconnect', auth, asyncHandler(async (req, res) => {
  const integration = await Integration.findById(req.params.id);

  if (!integration) {
    return res.status(404).json({
      success: false,
      error: 'Integration not found'
    });
  }

  const integrationIndex = req.user.integrations.findIndex(
    int => int.service === integration.name
  );

  if (integrationIndex === -1) {
    return res.status(400).json({
      success: false,
      error: 'Integration not connected'
    });
  }

  req.user.integrations.splice(integrationIndex, 1);
  await req.user.save();

  res.json({
    success: true,
    message: 'Integration disconnected successfully'
  });
}));

router.get('/user/connected', auth, asyncHandler(async (req, res) => {
  const connectedIntegrations = req.user.integrations.filter(
    int => int.connected
  );

  const integrationDetails = await Integration.find({
    name: { $in: connectedIntegrations.map(int => int.service) }
  }).select('name category icon type').lean();

  const enrichedIntegrations = connectedIntegrations.map(userInt => {
    const details = integrationDetails.find(int => int.name === userInt.service);
    return {
      service: userInt.service,
      connectedAt: userInt.connectedAt,
      ...details
    };
  });

  res.json({
    success: true,
    integrations: enrichedIntegrations,
    count: enrichedIntegrations.length
  });
}));

router.post('/:id/test', auth, sanitizeInput, asyncHandler(async (req, res) => {
  const integration = await Integration.findById(req.params.id);

  if (!integration) {
    return res.status(404).json({
      success: false,
      error: 'Integration not found'
    });
  }

  const userIntegration = req.user.integrations.find(
    int => int.service === integration.name
  );

  if (!userIntegration || !userIntegration.connected) {
    return res.status(400).json({
      success: false,
      error: 'Integration not connected'
    });
  }

  try {
    const testResult = await integrationHub.testConnection(
      integration.name,
      userIntegration.credentials
    );

    res.json({
      success: true,
      message: 'Connection test successful',
      testResult
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Connection test failed',
      message: error.message
    });
  }
}));

router.post('/:id/execute', auth, sanitizeInput, asyncHandler(async (req, res) => {
  const { action, params } = req.body;

  if (!action) {
    return res.status(400).json({
      success: false,
      error: 'Action is required'
    });
  }

  const integration = await Integration.findById(req.params.id);

  if (!integration) {
    return res.status(404).json({
      success: false,
      error: 'Integration not found'
    });
  }

  const userIntegration = req.user.integrations.find(
    int => int.service === integration.name
  );

  if (!userIntegration || !userIntegration.connected) {
    return res.status(400).json({
      success: false,
      error: 'Integration not connected'
    });
  }

  try {
    const result = await integrationHub.executeAction(
      integration.name,
      action,
      params,
      userIntegration.credentials
    );

    req.user.usage.apiCallsThisMonth += 1;
    await req.user.save();

    res.json({
      success: true,
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Execution failed',
      message: error.message
    });
  }
}));

module.exports = router;
