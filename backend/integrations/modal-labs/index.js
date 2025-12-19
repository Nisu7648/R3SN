const axios = require('axios');

class ModalLabsIntegration {
  constructor(apiToken) {
    this.apiToken = apiToken;
    this.baseUrl = 'https://api.modal.com/v1';
  }

  getHeaders() {
    return { 'Authorization': `Bearer ${this.apiToken}`, 'Content-Type': 'application/json' };
  }

  async request(method, path, data = null) {
    try {
      const response = await axios({ method, url: `${this.baseUrl}${path}`, headers: this.getHeaders(), data });
      return { success: true, data: response.data };
    } catch (error) {
      throw new Error(`Modal API error: ${error.response?.data?.error || error.message}`);
    }
  }

  // Apps
  async listApps() { return this.request('GET', '/apps'); }
  async getApp(appId) { return this.request('GET', `/apps/${appId}`); }
  async createApp(name, description = '') { return this.request('POST', '/apps', { name, description }); }
  async updateApp(appId, updates) { return this.request('PATCH', `/apps/${appId}`, updates); }
  async deleteApp(appId) { return this.request('DELETE', `/apps/${appId}`); }
  async deployApp(appId, code) { return this.request('POST', `/apps/${appId}/deploy`, { code }); }

  // Functions
  async listFunctions() { return this.request('GET', '/functions'); }
  async getFunction(functionId) { return this.request('GET', `/functions/${functionId}`); }
  async invokeFunction(functionId, args = {}, kwargs = {}) {
    return this.request('POST', `/functions/${functionId}/invoke`, { args, kwargs });
  }
  async listFunctionCalls(functionId) { return this.request('GET', `/functions/${functionId}/calls`); }
  async getFunctionCall(callId) { return this.request('GET', `/calls/${callId}`); }

  // Volumes (Persistent Storage)
  async listVolumes() { return this.request('GET', '/volumes'); }
  async createVolume(name, sizeGb = 10) { return this.request('POST', '/volumes', { name, size_gb: sizeGb }); }
  async getVolume(volumeId) { return this.request('GET', `/volumes/${volumeId}`); }
  async deleteVolume(volumeId) { return this.request('DELETE', `/volumes/${volumeId}`); }

  // Secrets
  async listSecrets() { return this.request('GET', '/secrets'); }
  async createSecret(name, value) { return this.request('POST', '/secrets', { name, value }); }
  async getSecret(secretId) { return this.request('GET', `/secrets/${secretId}`); }
  async deleteSecret(secretId) { return this.request('DELETE', `/secrets/${secretId}`); }

  // Schedules (Cron Jobs)
  async listSchedules() { return this.request('GET', '/schedules'); }
  async createSchedule(functionId, cron, timezone = 'UTC') {
    return this.request('POST', '/schedules', { function_id: functionId, cron, timezone });
  }
  async getSchedule(scheduleId) { return this.request('GET', `/schedules/${scheduleId}`); }
  async deleteSchedule(scheduleId) { return this.request('DELETE', `/schedules/${scheduleId}`); }

  // Webhooks
  async listWebhooks() { return this.request('GET', '/webhooks'); }
  async createWebhook(url, events) { return this.request('POST', '/webhooks', { url, events }); }
  async deleteWebhook(webhookId) { return this.request('DELETE', `/webhooks/${webhookId}`); }

  // Monitoring
  async getLogs(params = {}) { return this.request('GET', '/logs', null, params); }

  // Usage & Billing
  async getUsage() { return this.request('GET', '/usage'); }
  async getBilling() { return this.request('GET', '/billing'); }
  async getCredits() { return this.request('GET', '/credits'); }
}

module.exports = ModalLabsIntegration;
