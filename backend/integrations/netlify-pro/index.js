const axios = require('axios');

class NetlifyProIntegration {
  constructor(token) {
    this.token = token;
    this.baseUrl = 'https://api.netlify.com/api/v1';
  }

  getHeaders() {
    return { 'Authorization': `Bearer ${this.token}`, 'Content-Type': 'application/json' };
  }

  async request(method, path, data = null) {
    try {
      const response = await axios({ method, url: `${this.baseUrl}${path}`, headers: this.getHeaders(), data });
      return { success: true, data: response.data };
    } catch (error) {
      throw new Error(`Netlify API error: ${error.response?.data?.message || error.message}`);
    }
  }

  // Site Management
  async listSites() { return this.request('GET', '/sites'); }
  async getSite(siteId) { return this.request('GET', `/sites/${siteId}`); }
  async createSite(data) { return this.request('POST', '/sites', data); }
  async updateSite(siteId, updates) { return this.request('PATCH', `/sites/${siteId}`, updates); }
  async deleteSite(siteId) { return this.request('DELETE', `/sites/${siteId}`); }

  // Deploy Management
  async listDeploys(siteId) { return this.request('GET', `/sites/${siteId}/deploys`); }
  async getDeploy(deployId) { return this.request('GET', `/deploys/${deployId}`); }
  async createDeploy(siteId, data) { return this.request('POST', `/sites/${siteId}/deploys`, data); }
  async cancelDeploy(deployId) { return this.request('POST', `/deploys/${deployId}/cancel`); }
  async restoreDeploy(siteId, deployId) { return this.request('POST', `/sites/${siteId}/deploys/${deployId}/restore`); }

  // Forms (Premium)
  async listForms(siteId) { return this.request('GET', `/sites/${siteId}/forms`); }
  async getForm(formId) { return this.request('GET', `/forms/${formId}`); }
  async listSubmissions(formId) { return this.request('GET', `/forms/${formId}/submissions`); }

  // Functions (Premium)
  async listFunctions(siteId) { return this.request('GET', `/sites/${siteId}/functions`); }
  async getFunction(siteId, functionName) { return this.request('GET', `/sites/${siteId}/functions/${functionName}`); }

  // Build Hooks (Premium)
  async listBuildHooks(siteId) { return this.request('GET', `/sites/${siteId}/build_hooks`); }
  async createBuildHook(siteId, title, branch) { return this.request('POST', `/sites/${siteId}/build_hooks`, { title, branch }); }
  async deleteBuildHook(siteId, hookId) { return this.request('DELETE', `/sites/${siteId}/build_hooks/${hookId}`); }

  // Analytics (Premium)
  async getAnalytics(siteId) { return this.request('GET', `/sites/${siteId}/analytics`); }

  // Environment Variables (Premium)
  async listEnvVars(accountId) { return this.request('GET', `/accounts/${accountId}/env`); }
  async createEnvVar(accountId, key, values) { return this.request('POST', `/accounts/${accountId}/env`, { key, values }); }
  async updateEnvVar(accountId, key, updates) { return this.request('PATCH', `/accounts/${accountId}/env/${key}`, updates); }
  async deleteEnvVar(accountId, key) { return this.request('DELETE', `/accounts/${accountId}/env/${key}`); }

  // Split Testing (Premium)
  async listSplitTests(siteId) { return this.request('GET', `/sites/${siteId}/traffic_splits`); }
  async createSplitTest(siteId, data) { return this.request('POST', `/sites/${siteId}/traffic_splits`, data); }

  // Snippets (Premium)
  async listSnippets(siteId) { return this.request('GET', `/sites/${siteId}/snippets`); }
  async createSnippet(siteId, data) { return this.request('POST', `/sites/${siteId}/snippets`, data); }

  // Account
  async getAccount(accountId) { return this.request('GET', `/accounts/${accountId}`); }
}

module.exports = NetlifyProIntegration;
