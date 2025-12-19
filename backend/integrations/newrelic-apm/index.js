/**
 * New Relic APM Integration
 * Save $600+/month - Application performance monitoring
 */

const axios = require('axios');

class NewRelicAPMIntegration {
  constructor(config) {
    this.apiKey = config.apiKey || process.env.NEWRELIC_API_KEY;
    this.accountId = config.accountId || process.env.NEWRELIC_ACCOUNT_ID;
    
    if (!this.apiKey) {
      throw new Error('New Relic API key required');
    }
    
    this.baseURL = 'https://api.newrelic.com/v2';
    this.graphqlURL = 'https://api.newrelic.com/graphql';
  }

  async makeRequest(method, endpoint, data = null) {
    const config = {
      method,
      url: `${this.baseURL}${endpoint}`,
      headers: {
        'X-Api-Key': this.apiKey,
        'Content-Type': 'application/json'
      }
    };

    if (data) config.data = data;

    try {
      const response = await axios(config);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message };
    }
  }

  async makeGraphQLRequest(query, variables = {}) {
    try {
      const response = await axios.post(this.graphqlURL, {
        query,
        variables
      }, {
        headers: {
          'API-Key': this.apiKey,
          'Content-Type': 'application/json'
        }
      });
      
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message };
    }
  }

  async listApplications() {
    return await this.makeRequest('GET', '/applications.json');
  }

  async getApplication(appId) {
    return await this.makeRequest('GET', `/applications/${appId}.json`);
  }

  async getApplicationMetrics(appId, names = [], values = []) {
    const params = new URLSearchParams();
    names.forEach(name => params.append('names[]', name));
    values.forEach(value => params.append('values[]', value));
    
    return await this.makeRequest('GET', `/applications/${appId}/metrics/data.json?${params.toString()}`);
  }

  async getTransactions(appId) {
    return await this.makeRequest('GET', `/applications/${appId}/transactions.json`);
  }

  async getErrors(appId) {
    return await this.makeRequest('GET', `/applications/${appId}/errors.json`);
  }

  async getHosts(appId) {
    return await this.makeRequest('GET', `/applications/${appId}/hosts.json`);
  }

  async getInstances(appId) {
    return await this.makeRequest('GET', `/applications/${appId}/instances.json`);
  }

  async createAlert(policyId, condition) {
    return await this.makeRequest('POST', `/alerts_conditions/policies/${policyId}.json`, condition);
  }

  async listAlertPolicies() {
    return await this.makeRequest('GET', '/alerts_policies.json');
  }

  async getAlertPolicy(policyId) {
    return await this.makeRequest('GET', `/alerts_policies/${policyId}.json`);
  }

  async createAlertPolicy(name, incidentPreference = 'PER_POLICY') {
    return await this.makeRequest('POST', '/alerts_policies.json', {
      policy: {
        name,
        incident_preference: incidentPreference
      }
    });
  }

  async listDashboards() {
    return await this.makeRequest('GET', '/dashboards.json');
  }

  async getDashboard(dashboardId) {
    return await this.makeRequest('GET', `/dashboards/${dashboardId}.json`);
  }

  async createDashboard(dashboard) {
    return await this.makeRequest('POST', '/dashboards.json', { dashboard });
  }

  async runNRQL(query) {
    const nrqlQuery = `
      {
        actor {
          account(id: ${this.accountId}) {
            nrql(query: "${query}") {
              results
            }
          }
        }
      }
    `;
    
    return await this.makeGraphQLRequest(nrqlQuery);
  }

  async getInfrastructureHosts() {
    return await this.makeRequest('GET', '/servers.json');
  }

  async getSyntheticMonitors() {
    return await this.makeRequest('GET', '/monitors.json');
  }

  async createSyntheticMonitor(monitor) {
    return await this.makeRequest('POST', '/monitors.json', monitor);
  }

  async getInsights(query) {
    return await this.runNRQL(query);
  }
}

module.exports = NewRelicAPMIntegration;
