const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'enterprise'],
    default: 'user'
  },
  plan: {
    type: String,
    enum: ['free', 'pro', 'enterprise'],
    default: 'free'
  },
  apiKey: {
    type: String,
    unique: true,
    sparse: true
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: String,
  integrations: [{
    service: String,
    connected: Boolean,
    credentials: Object,
    connectedAt: Date
  }],
  usage: {
    agentsCreated: { type: Number, default: 0 },
    workflowsExecuted: { type: Number, default: 0 },
    apiCallsThisMonth: { type: Number, default: 0 },
    storageUsed: { type: Number, default: 0 }
  },
  settings: {
    type: Object,
    default: {}
  },
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

userSchema.index({ email: 1 });
userSchema.index({ apiKey: 1 });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateApiKey = function() {
  this.apiKey = crypto.randomBytes(32).toString('hex');
  return this.apiKey;
};

module.exports = mongoose.model('User', userSchema);
