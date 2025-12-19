const axios = require('axios');

class BananaDevIntegration {
  constructor(apiKey, modelKey = null) {
    this.apiKey = apiKey;
    this.modelKey = modelKey;
    this.baseUrl = 'https://api.banana.dev';
  }

  getHeaders() {
    return { 'X-API-Key': this.apiKey, 'Content-Type': 'application/json' };
  }

  async request(method, path, data = null) {
    try {
      const response = await axios({ method, url: `${this.baseUrl}${path}`, headers: this.getHeaders(), data });
      return { success: true, data: response.data };
    } catch (error) {
      throw new Error(`Banana API error: ${error.response?.data?.message || error.message}`);
    }
  }

  // Model Inference
  async runModel(modelKey, modelInputs) {
    return this.request('POST', '/run', {
      apiKey: this.apiKey,
      modelKey: modelKey || this.modelKey,
      modelInputs,
    });
  }

  async checkModel(modelKey, callID) {
    return this.request('POST', '/check', {
      apiKey: this.apiKey,
      modelKey: modelKey || this.modelKey,
      callID,
    });
  }

  // Model Management
  async listModels() { return this.request('GET', '/models'); }
  async getModel(modelKey) { return this.request('GET', `/models/${modelKey}`); }
  async deployModel(name, image, hardware = 'gpu-t4') {
    return this.request('POST', '/models/deploy', { name, image, hardware });
  }
  async updateModel(modelKey, updates) { return this.request('PATCH', `/models/${modelKey}`, updates); }
  async deleteModel(modelKey) { return this.request('DELETE', `/models/${modelKey}`); }
  async scaleModel(modelKey, minReplicas, maxReplicas) {
    return this.request('POST', `/models/${modelKey}/scale`, { minReplicas, maxReplicas });
  }

  // Monitoring
  async getModelLogs(modelKey, limit = 100) {
    return this.request('GET', `/models/${modelKey}/logs?limit=${limit}`);
  }
  async getModelMetrics(modelKey) { return this.request('GET', `/models/${modelKey}/metrics`); }

  // Deployments
  async listDeployments() { return this.request('GET', '/deployments'); }
  async getDeployment(deploymentId) { return this.request('GET', `/deployments/${deploymentId}`); }
  async rollbackDeployment(deploymentId) { return this.request('POST', `/deployments/${deploymentId}/rollback`); }

  // Webhooks
  async createWebhook(url, events) { return this.request('POST', '/webhooks', { url, events }); }
  async listWebhooks() { return this.request('GET', '/webhooks'); }
  async deleteWebhook(webhookId) { return this.request('DELETE', `/webhooks/${webhookId}`); }

  // A/B Testing
  async createAbTest(name, modelKeys, trafficSplit) {
    return this.request('POST', '/ab-tests', { name, modelKeys, trafficSplit });
  }
  async listAbTests() { return this.request('GET', '/ab-tests'); }
  async getAbTest(testId) { return this.request('GET', `/ab-tests/${testId}`); }
  async endAbTest(testId, winnerModelKey) {
    return this.request('POST', `/ab-tests/${testId}/end`, { winnerModelKey });
  }

  // Analytics & Usage
  async getAnalytics(params = {}) { return this.request('GET', '/analytics', null, params); }
  async getUsage() { return this.request('GET', '/usage'); }
  async getBilling() { return this.request('GET', '/billing'); }
  async getCredits() { return this.request('GET', '/credits'); }

  // Health
  async getHealth() { return this.request('GET', '/health'); }
}

module.exports = BananaDevIntegration;
