const axios = require('axios');

class ReplicateCloudIntegration {
  constructor(apiToken) {
    this.apiToken = apiToken;
    this.baseUrl = 'https://api.replicate.com/v1';
  }

  getHeaders() {
    return { 'Authorization': `Token ${this.apiToken}`, 'Content-Type': 'application/json' };
  }

  async request(method, path, data = null) {
    try {
      const response = await axios({ method, url: `${this.baseUrl}${path}`, headers: this.getHeaders(), data });
      return { success: true, data: response.data };
    } catch (error) {
      throw new Error(`Replicate API error: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Models
  async listModels() { return this.request('GET', '/models'); }
  async getModel(owner, name) { return this.request('GET', `/models/${owner}/${name}`); }
  async listModelVersions(owner, name) { return this.request('GET', `/models/${owner}/${name}/versions`); }
  async getModelVersion(owner, name, versionId) { return this.request('GET', `/models/${owner}/${name}/versions/${versionId}`); }

  // Predictions (Inference)
  async createPrediction(version, input, webhook = null) {
    return this.request('POST', '/predictions', { version, input, webhook });
  }
  async getPrediction(predictionId) { return this.request('GET', `/predictions/${predictionId}`); }
  async cancelPrediction(predictionId) { return this.request('POST', `/predictions/${predictionId}/cancel`); }
  async listPredictions() { return this.request('GET', '/predictions'); }

  // Deployments
  async createDeployment(owner, name, version, hardware) {
    return this.request('POST', '/deployments', { owner, name, version, hardware });
  }
  async listDeployments() { return this.request('GET', '/deployments'); }
  async getDeployment(owner, name) { return this.request('GET', `/deployments/${owner}/${name}`); }
  async updateDeployment(owner, name, updates) { return this.request('PATCH', `/deployments/${owner}/${name}`, updates); }
  async deleteDeployment(owner, name) { return this.request('DELETE', `/deployments/${owner}/${name}`); }

  // Training
  async createTraining(version, input, destination) {
    return this.request('POST', '/trainings', { version, input, destination });
  }
  async getTraining(trainingId) { return this.request('GET', `/trainings/${trainingId}`); }
  async cancelTraining(trainingId) { return this.request('POST', `/trainings/${trainingId}/cancel`); }
  async listTrainings() { return this.request('GET', '/trainings'); }

  // Collections
  async listCollections() { return this.request('GET', '/collections'); }
  async getCollection(collectionSlug) { return this.request('GET', `/collections/${collectionSlug}`); }

  // Webhooks
  async createWebhook(url, events) { return this.request('POST', '/webhooks', { url, events }); }
  async listWebhooks() { return this.request('GET', '/webhooks'); }
  async getWebhook(webhookId) { return this.request('GET', `/webhooks/${webhookId}`); }
  async deleteWebhook(webhookId) { return this.request('DELETE', `/webhooks/${webhookId}`); }

  // Account
  async getAccount() { return this.request('GET', '/account'); }
  async getHardware() { return this.request('GET', '/hardware'); }
}

module.exports = ReplicateCloudIntegration;
