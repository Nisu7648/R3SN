const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const apiKey = req.header('X-API-Key');

    if (!token && !apiKey) {
      throw new Error('No authentication provided');
    }

    let user;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
      user = await User.findById(decoded.userId);
    } else if (apiKey) {
      user = await User.findOne({ apiKey, isActive: true });
    }

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.isActive) {
      throw new Error('Account is inactive');
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Authentication failed',
      message: error.message
    });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }
    next();
  };
};

const requirePlan = (plans) => {
  return (req, res, next) => {
    if (!plans.includes(req.user.plan)) {
      return res.status(403).json({
        success: false,
        error: 'Upgrade required',
        message: `This feature requires ${plans.join(' or ')} plan`
      });
    }
    next();
  };
};

module.exports = { auth, requireRole, requirePlan };
