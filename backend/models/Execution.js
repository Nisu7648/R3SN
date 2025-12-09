const mongoose = require('mongoose');

const executionSchema = new mongoose.Schema({
  workflowId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workflow'
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['workflow', 'agent', 'prompt'],
    required: true
  },
  input: Object,
  output: Object,
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed'],
    default: 'pending'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  duration: Number,
  error: {
    message: String,
    stack: String,
    code: String
  },
  logs: [{
    timestamp: Date,
    level: String,
    message: String,
    data: Object
  }],
  metadata: Object
}, {
  timestamps: true
});

executionSchema.index({ userId: 1, status: 1, createdAt: -1 });
executionSchema.index({ workflowId: 1 });
executionSchema.index({ agentId: 1 });

executionSchema.methods.complete = function(output) {
  this.status = 'completed';
  this.endTime = new Date();
  this.duration = this.endTime - this.startTime;
  this.output = output;
  return this.save();
};

executionSchema.methods.fail = function(error) {
  this.status = 'failed';
  this.endTime = new Date();
  this.duration = this.endTime - this.startTime;
  this.error = {
    message: error.message,
    stack: error.stack,
    code: error.code
  };
  return this.save();
};

executionSchema.methods.addLog = function(level, message, data = {}) {
  this.logs.push({
    timestamp: new Date(),
    level,
    message,
    data
  });
  return this.save();
};

module.exports = mongoose.model('Execution', executionSchema);
