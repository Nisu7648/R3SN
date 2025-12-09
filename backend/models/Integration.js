const mongoose = require('mongoose');

const integrationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['api', 'plugin', 'oauth'],
    required: true
  },
  description: String,
  icon: String,
  authType: {
    type: String,
    enum: ['apikey', 'oauth2', 'basic', 'none']
  },
  endpoints: [{
    name: String,
    method: String,
    path: String,
    description: String
  }],
  capabilities: [String],
  rateLimit: {
    requests: Number,
    period: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: Object
}, {
  timestamps: true
});

integrationSchema.index({ category: 1, isActive: 1 });
integrationSchema.index({ name: 1 });

module.exports = mongoose.model('Integration', integrationSchema);
