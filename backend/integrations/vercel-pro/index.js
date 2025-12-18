/**
 * Vercel Pro Integration - Complete Premium Implementation
 * 30 endpoints with advanced features (free premium access)
 */

const axios = require('axios');

class VercelProIntegration {
  constructor(token, teamId = null) {
    this.token = token;
    this.teamId = teamId;
    this.baseUrl = 'https://api.vercel.com';
  }

  getHeaders() {
    return { 'Authorization': `Bearer ${this.token}`, 'Content-Type': 'application/json' };
  }

  getParams() {
    return this.teamId ? { teamId: this.teamId } : {};
  }

  async request(method, path, data = null, params = {}) {
    try {
      const response = await axios({
        method,
        url: `${this.baseUrl}${path}`,
        headers: this.getHeaders(),
        params: { ...this.getParams(), ...params },
        data,
      });
      return { success: true, data: response.data };
    } catch (error) {
      throw new Error(`Vercel API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Deployment Management
  async listDeployments(params = {}) { return this.request('GET', '/v6/deployments', null, params); }
  async getDeployment(id) { return this.request('GET', `/v13/deployments/${id}`); }
  async createDeployment(name, files, options = {}) { return this.request('POST', '/v13/deployments', { name, files, ...options }); }
  async cancelDeployment(id) { return this.request('PATCH', `/v12/deployments/${id}/cancel`); }
  async deleteDeployment(id) { return this.request('DELETE', `/v13/deployments/${id}`); }

  // Project Management
  async listProjects(params = {}) { return this.request('GET', '/v9/projects', null, params); }
  async getProject(id) { return this.request('GET', `/v9/projects/${id}`); }
  async createProject(name, framework, options = {}) { return this.request('POST', '/v9/projects', { name, framework, ...options }); }
  async updateProject(id, updates) { return this.request('PATCH', `/v9/projects/${id}`, updates); }
  async deleteProject(id) { return this.request('DELETE', `/v9/projects/${id}`); }

  // Domain Management (Premium)
  async listDomains(params = {}) { return this.request('GET', '/v5/domains', null, params); }
  async getDomain(domain) { return this.request('GET', `/v5/domains/${domain}`); }
  async addDomain(name, options = {}) { return this.request('POST', '/v5/domains', { name, ...options }); }
  async verifyDomain(domain) { return this.request('POST', `/v5/domains/${domain}/verify`); }
  async removeDomain(domain) { return this.request('DELETE', `/v6/domains/${domain}`); }

  // Environment Variables (Premium)
  async listEnvVars(projectId) { return this.request('GET', `/v9/projects/${projectId}/env`); }
  async createEnvVar(projectId, key, value, target, type = 'encrypted') {
    return this.request('POST', `/v10/projects/${projectId}/env`, { key, value, target, type });
  }
  async updateEnvVar(projectId, key, updates) { return this.request('PATCH', `/v9/projects/${projectId}/env/${key}`, updates); }
  async deleteEnvVar(projectId, envId) { return this.request('DELETE', `/v9/projects/${projectId}/env/${envId}`); }

  // Analytics (Premium)
  async getAnalytics(params = {}) { return this.request('GET', '/v1/analytics', null, params); }
  async getDeploymentEvents(deploymentId) { return this.request('GET', `/v3/deployments/${deploymentId}/events`); }

  // Edge Functions (Premium)
  async listEdgeFunctions() { return this.request('GET', '/v1/edge-functions'); }
  async getEdgeFunction(id) { return this.request('GET', `/v1/edge-functions/${id}`); }

  // Team Management (Premium)
  async listTeams() { return this.request('GET', '/v2/teams'); }
  async getTeam(teamId) { return this.request('GET', `/v2/teams/${teamId}`); }
  async listTeamMembers(teamId) { return this.request('GET', `/v2/teams/${teamId}/members`); }
  async inviteTeamMember(teamId, email, role = 'MEMBER') {
    return this.request('POST', `/v1/teams/${teamId}/members`, { email, role });
  }

  // Logs & Monitoring (Premium)
  async getLogs(deploymentId, params = {}) { return this.request('GET', `/v2/deployments/${deploymentId}/events`, null, params); }

  // Aliases (Premium)
  async getAliases(params = {}) { return this.request('GET', '/v4/aliases', null, params); }
  async createAlias(deploymentId, alias) { return this.request('POST', `/v2/deployments/${deploymentId}/aliases`, { alias }); }
}

module.exports = VercelProIntegration;
