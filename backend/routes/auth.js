const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { authLimiter } = require('../middleware/rateLimiter');
const { sanitizeInput } = require('../middleware/validator');

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    { expiresIn: '7d' }
  );
};

router.post('/register', authLimiter, sanitizeInput, asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      error: 'Email, password, and name are required'
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 8 characters long'
    });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      error: 'Email already registered'
    });
  }

  const user = new User({
    email,
    password,
    name,
    role: 'user',
    plan: 'free'
  });

  await user.save();

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      plan: user.plan
    }
  });
}));

router.post('/login', authLimiter, sanitizeInput, asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required'
    });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }

  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      error: 'Account is inactive'
    });
  }

  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user._id);

  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      plan: user.plan
    }
  });
}));

router.get('/me', auth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId)
    .select('-password -twoFactorSecret')
    .lean();

  res.json({
    success: true,
    user
  });
}));

router.put('/me', auth, sanitizeInput, asyncHandler(async (req, res) => {
  const { name, settings } = req.body;

  if (name) req.user.name = name;
  if (settings) req.user.settings = { ...req.user.settings, ...settings };

  await req.user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      settings: req.user.settings
    }
  });
}));

router.post('/change-password', auth, sanitizeInput, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      error: 'Current password and new password are required'
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      error: 'New password must be at least 8 characters long'
    });
  }

  const isPasswordValid = await req.user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      error: 'Current password is incorrect'
    });
  }

  req.user.password = newPassword;
  await req.user.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
}));

router.post('/generate-api-key', auth, asyncHandler(async (req, res) => {
  const apiKey = req.user.generateApiKey();
  await req.user.save();

  res.json({
    success: true,
    message: 'API key generated successfully',
    apiKey
  });
}));

router.delete('/revoke-api-key', auth, asyncHandler(async (req, res) => {
  req.user.apiKey = undefined;
  await req.user.save();

  res.json({
    success: true,
    message: 'API key revoked successfully'
  });
}));

router.get('/usage', auth, asyncHandler(async (req, res) => {
  const usage = req.user.usage;

  res.json({
    success: true,
    usage,
    plan: req.user.plan
  });
}));

router.post('/logout', auth, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}));

module.exports = router;
