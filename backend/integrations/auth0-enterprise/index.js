const axios = require('axios');

class Auth0EnterpriseIntegration {
  constructor(domain, accessToken) {
    this.domain = domain;
    this.accessToken = accessToken;
    this.baseUrl = `https://${domain}.auth0.com/api/v2`;
  }

  getHeaders() {
    return { 'Authorization': `Bearer ${this.accessToken}`, 'Content-Type': 'application/json' };
  }

  async request(method, path, data = null, params = {}) {
    try {
      const response = await axios({ method, url: `${this.baseUrl}${path}`, headers: this.getHeaders(), data, params });
      return { success: true, data: response.data };
    } catch (error) {
      throw new Error(`Auth0 API error: ${error.response?.data?.message || error.message}`);
    }
  }

  // User Management
  async listUsers(params = {}) { return this.request('GET', '/users', null, params); }
  async getUser(userId) { return this.request('GET', `/users/${userId}`); }
  async createUser(data) { return this.request('POST', '/users', data); }
  async updateUser(userId, updates) { return this.request('PATCH', `/users/${userId}`, updates); }
  async deleteUser(userId) { return this.request('DELETE', `/users/${userId}`); }

  // User Roles (Premium)
  async getUserRoles(userId) { return this.request('GET', `/users/${userId}/roles`); }
  async assignRoles(userId, roles) { return this.request('POST', `/users/${userId}/roles`, { roles }); }
  async removeRoles(userId, roles) { return this.request('DELETE', `/users/${userId}/roles`, { roles }); }

  // User Permissions (Premium)
  async getUserPermissions(userId) { return this.request('GET', `/users/${userId}/permissions`); }
  async assignPermissions(userId, permissions) { return this.request('POST', `/users/${userId}/permissions`, { permissions }); }

  // Role Management (Premium)
  async listRoles(params = {}) { return this.request('GET', '/roles', null, params); }
  async createRole(data) { return this.request('POST', '/roles', data); }
  async updateRole(roleId, updates) { return this.request('PATCH', `/roles/${roleId}`, updates); }
  async deleteRole(roleId) { return this.request('DELETE', `/roles/${roleId}`); }

  // Client Management
  async listClients(params = {}) { return this.request('GET', '/clients', null, params); }
  async getClient(clientId) { return this.request('GET', `/clients/${clientId}`); }
  async createClient(data) { return this.request('POST', '/clients', data); }
  async updateClient(clientId, updates) { return this.request('PATCH', `/clients/${clientId}`, updates); }

  // Connections (Premium)
  async listConnections(params = {}) { return this.request('GET', '/connections', null, params); }
  async createConnection(data) { return this.request('POST', '/connections', data); }
  async updateConnection(connectionId, updates) { return this.request('PATCH', `/connections/${connectionId}`, updates); }
  async deleteConnection(connectionId) { return this.request('DELETE', `/connections/${connectionId}`); }

  // Rules (Premium)
  async listRules(params = {}) { return this.request('GET', '/rules', null, params); }
  async createRule(data) { return this.request('POST', '/rules', data); }

  // Logs & Analytics (Premium)
  async getLogs(params = {}) { return this.request('GET', '/logs', null, params); }
  async getStats(params = {}) { return this.request('GET', '/stats/daily', null, params); }

  // Organizations (Premium)
  async listOrganizations(params = {}) { return this.request('GET', '/organizations', null, params); }
  async createOrganization(data) { return this.request('POST', '/organizations', data); }

  // Branding (Premium)
  async getBranding() { return this.request('GET', '/branding'); }
  async updateBranding(updates) { return this.request('PATCH', '/branding', updates); }
}

module.exports = Auth0EnterpriseIntegration;
