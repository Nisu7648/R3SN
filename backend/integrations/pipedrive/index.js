const axios = require('axios');

class PipedriveIntegration {
  constructor(apiToken) {
    this.apiToken = apiToken;
    this.baseUrl = 'https://api.pipedrive.com/v1';
  }

  async request(method, path, data = null) {
    try {
      const response = await axios({
        method,
        url: `${this.baseUrl}${path}`,
        params: { api_token: this.apiToken },
        data,
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      throw new Error(`Pipedrive API error: ${error.response?.data?.error || error.message}`);
    }
  }

  async listDeals(params = {}) { return this.request('GET', '/deals', null); }
  async getDeal(id) { return this.request('GET', `/deals/${id}`); }
  async createDeal(title, options = {}) { return this.request('POST', '/deals', { title, ...options }); }
  async updateDeal(id, updates) { return this.request('PUT', `/deals/${id}`, updates); }
  async deleteDeal(id) { return this.request('DELETE', `/deals/${id}`); }
  async listPersons() { return this.request('GET', '/persons'); }
  async getPerson(id) { return this.request('GET', `/persons/${id}`); }
  async createPerson(name, options = {}) { return this.request('POST', '/persons', { name, ...options }); }
  async updatePerson(id, updates) { return this.request('PUT', `/persons/${id}`, updates); }
  async listOrganizations() { return this.request('GET', '/organizations'); }
  async createOrganization(name, options = {}) { return this.request('POST', '/organizations', { name, ...options }); }
  async listActivities() { return this.request('GET', '/activities'); }
  async createActivity(subject, type, options = {}) { return this.request('POST', '/activities', { subject, type, ...options }); }
  async updateActivity(id, updates) { return this.request('PUT', `/activities/${id}`, updates); }
  async listPipelines() { return this.request('GET', '/pipelines'); }
  async getPipeline(id) { return this.request('GET', `/pipelines/${id}`); }
  async listStages() { return this.request('GET', '/stages'); }
  async listProducts() { return this.request('GET', '/products'); }
  async createProduct(name, options = {}) { return this.request('POST', '/products', { name, ...options }); }
  async listNotes() { return this.request('GET', '/notes'); }
  async createNote(content, options = {}) { return this.request('POST', '/notes', { content, ...options }); }
  async listFiles() { return this.request('GET', '/files'); }
  async uploadFile(file) { return this.request('POST', '/files', { file }); }
  async listUsers() { return this.request('GET', '/users'); }
  async getUser(id) { return this.request('GET', `/users/${id}`); }
}

module.exports = PipedriveIntegration;
