const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  trigger: {
    type: {
      type: String,
      enum: ['manual', 'schedule', 'webhook', 'event']
    },
    config: Object
  },
  steps: [{
    order: Number,
    type: String,
    action: String,
    config: Object,
    integrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Integration'
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent'
    }
  }],
  status: {
    type: String,
    enum: ['active', 'paused', 'draft'],
    default: 'draft'
  },
  executionCount: {
    type: Number,
    default: 0
  },
  lastExecuted: Date,
  performance: {
    avgExecutionTime: Number,
    successRate: Number,
    totalExecutions: Number,
    failedExecutions: Number
  }
}, {
  timestamps: true
});

workflowSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Workflow', workflowSchema);
