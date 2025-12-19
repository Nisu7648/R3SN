const axios = require('axios');

class TogetherAIIntegration {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.together.xyz/v1';
  }

  getHeaders() {
    return { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' };
  }

  async request(method, path, data = null) {
    try {
      const response = await axios({ method, url: `${this.baseUrl}${path}`, headers: this.getHeaders(), data });
      return { success: true, data: response.data };
    } catch (error) {
      throw new Error(`Together AI error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Models
  async listModels() { return this.request('GET', '/models'); }
  async getModel(model) { return this.request('GET', `/models/${model}`); }

  // Inference
  async createCompletion(model, prompt, options = {}) {
    return this.request('POST', '/completions', { model, prompt, ...options });
  }
  async createChatCompletion(model, messages, options = {}) {
    return this.request('POST', '/chat/completions', { model, messages, ...options });
  }
  async createEmbedding(model, input) {
    return this.request('POST', '/embeddings', { model, input });
  }
  async createImage(model, prompt, options = {}) {
    return this.request('POST', '/images/generations', { model, prompt, ...options });
  }

  // Files
  async listFiles() { return this.request('GET', '/files'); }
  async uploadFile(file, purpose = 'fine-tune') {
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('purpose', purpose);
    return this.request('POST', '/files', formData);
  }
  async getFile(fileId) { return this.request('GET', `/files/${fileId}`); }
  async deleteFile(fileId) { return this.request('DELETE', `/files/${fileId}`); }

  // Fine-tuning
  async createFineTune(trainingFile, model, options = {}) {
    return this.request('POST', '/fine-tunes', { training_file: trainingFile, model, ...options });
  }
  async listFineTunes() { return this.request('GET', '/fine-tunes'); }
  async getFineTune(fineTuneId) { return this.request('GET', `/fine-tunes/${fineTuneId}`); }
  async cancelFineTune(fineTuneId) { return this.request('POST', `/fine-tunes/${fineTuneId}/cancel`); }
  async listFineTuneEvents(fineTuneId) { return this.request('GET', `/fine-tunes/${fineTuneId}/events`); }
  async downloadFineTune(fineTuneId) { return this.request('GET', `/fine-tunes/${fineTuneId}/download`); }

  // Deployments
  async listDeployments() { return this.request('GET', '/deployments'); }
  async createDeployment(model, name, options = {}) {
    return this.request('POST', '/deployments', { model, name, ...options });
  }
  async getDeployment(deploymentId) { return this.request('GET', `/deployments/${deploymentId}`); }
  async updateDeployment(deploymentId, updates) { return this.request('PATCH', `/deployments/${deploymentId}`, updates); }
  async deleteDeployment(deploymentId) { return this.request('DELETE', `/deployments/${deploymentId}`); }

  // Usage & Billing
  async getUsage() { return this.request('GET', '/usage'); }
  async getBilling() { return this.request('GET', '/billing'); }
  async getCredits() { return this.request('GET', '/credits'); }

  // API Keys
  async listApiKeys() { return this.request('GET', '/api-keys'); }
  async createApiKey(name) { return this.request('POST', '/api-keys', { name }); }
  async deleteApiKey(keyId) { return this.request('DELETE', `/api-keys/${keyId}`); }

  // Health
  async getHealth() { return this.request('GET', '/health'); }
}

module.exports = TogetherAIIntegration;
