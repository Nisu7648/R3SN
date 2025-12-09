const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['executor', 'analyzer', 'integrator', 'custom']
  },
  config: {
    type: Object,
    default: {}
  },
  capabilities: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['active', 'paused', 'stopped', 'error'],
    default: 'active'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  executionCount: {
    type: Number,
    default: 0
  },
  lastExecuted: {
    type: Date
  },
  performance: {
    avgExecutionTime: Number,
    successRate: Number,
    totalExecutions: Number,
    failedExecutions: Number
  },
  metadata: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
});

agentSchema.index({ userId: 1, status: 1 });
agentSchema.index({ type: 1 });
agentSchema.index({ createdAt: -1 });

agentSchema.methods.updatePerformance = function(executionTime, success) {
  this.executionCount += 1;
  this.lastExecuted = new Date();
  
  if (!this.performance) {
    this.performance = {
      avgExecutionTime: 0,
      successRate: 100,
      totalExecutions: 0,
      failedExecutions: 0
    };
  }
  
  this.performance.totalExecutions += 1;
  if (!success) this.performance.failedExecutions += 1;
  
  const total = this.performance.avgExecutionTime * (this.performance.totalExecutions - 1);
  this.performance.avgExecutionTime = (total + executionTime) / this.performance.totalExecutions;
  
  this.performance.successRate = 
    ((this.performance.totalExecutions - this.performance.failedExecutions) / 
    this.performance.totalExecutions) * 100;
  
  return this.save();
};

module.exports = mongoose.model('Agent', agentSchema);
