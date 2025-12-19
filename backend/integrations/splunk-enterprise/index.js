/**
 * Splunk Enterprise Log Analytics Integration
 * Save $1200+/month - Enterprise log management & analytics
 */

const axios = require('axios');

class SplunkEnterpriseIntegration {
  constructor(config) {
    this.host = config.host || process.env.SPLUNK_HOST;
    this.port = config.port || process.env.SPLUNK_PORT || 8089;
    this.username = config.username || process.env.SPLUNK_USERNAME;
    this.password = config.password || process.env.SPLUNK_PASSWORD;
    
    if (!this.host || !this.username || !this.password) {
      throw new Error('Splunk credentials required');
    }
    
    this.baseURL = `https://${this.host}:${this.port}/services`;
    this.sessionKey = null;
  }

  async authenticate() {
    try {
      const response = await axios.post(
        `${this.baseURL}/auth/login`,
        new URLSearchParams({
          username: this.username,
          password: this.password
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
        }
      );
      
      const match = response.data.match(/<sessionKey>(.*?)<\/sessionKey>/);
      if (match) {
        this.sessionKey = match[1];
        return { success: true };
      }
      
      return { success: false, error: 'Failed to get session key' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async makeRequest(method, endpoint, data = null) {
    if (!this.sessionKey) {
      await this.authenticate();
    }

    const config = {
      method,
      url: `${this.baseURL}${endpoint}`,
      headers: {
        'Authorization': `Splunk ${this.sessionKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
    };

    if (data) {
      config.data = new URLSearchParams(data);
    }

    try {
      const response = await axios(config);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message };
    }
  }

  async createSearch(search, earliestTime = '-24h', latestTime = 'now') {
    return await this.makeRequest('POST', '/search/jobs', {
      search,
      earliest_time: earliestTime,
      latest_time: latestTime
    });
  }

  async getSearchResults(searchId) {
    return await this.makeRequest('GET', `/search/jobs/${searchId}/results`);
  }

  async getSearchStatus(searchId) {
    return await this.makeRequest('GET', `/search/jobs/${searchId}`);
  }

  async cancelSearch(searchId) {
    return await this.makeRequest('DELETE', `/search/jobs/${searchId}`);
  }

  async listSearches() {
    return await this.makeRequest('GET', '/search/jobs');
  }

  async indexData(index, sourcetype, data) {
    return await this.makeRequest('POST', '/receivers/simple', {
      index,
      sourcetype,
      data: JSON.stringify(data)
    });
  }

  async listIndexes() {
    return await this.makeRequest('GET', '/data/indexes');
  }

  async createIndex(name, datatype = 'event') {
    return await this.makeRequest('POST', '/data/indexes', {
      name,
      datatype
    });
  }

  async deleteIndex(name) {
    return await this.makeRequest('DELETE', `/data/indexes/${name}`);
  }

  async createSavedSearch(name, search) {
    return await this.makeRequest('POST', '/saved/searches', {
      name,
      search
    });
  }

  async listSavedSearches() {
    return await this.makeRequest('GET', '/saved/searches');
  }

  async getSavedSearch(name) {
    return await this.makeRequest('GET', `/saved/searches/${name}`);
  }

  async deleteSavedSearch(name) {
    return await this.makeRequest('DELETE', `/saved/searches/${name}`);
  }

  async createAlert(name, search, alertType = 'always') {
    return await this.makeRequest('POST', '/saved/searches', {
      name,
      search,
      'alert_type': alertType,
      'is_scheduled': 1,
      'cron_schedule': '*/5 * * * *'
    });
  }

  async listAlerts() {
    return await this.makeRequest('GET', '/saved/searches?search=is_scheduled%3D1');
  }

  async createDashboard(name, panels) {
    return await this.makeRequest('POST', '/data/ui/views', {
      name,
      'eai:data': JSON.stringify(panels)
    });
  }

  async listDashboards() {
    return await this.makeRequest('GET', '/data/ui/views');
  }

  async getDashboard(name) {
    return await this.makeRequest('GET', `/data/ui/views/${name}`);
  }

  async createUser(name, password, roles = ['user']) {
    return await this.makeRequest('POST', '/authentication/users', {
      name,
      password,
      roles: roles.join(',')
    });
  }

  async listUsers() {
    return await this.makeRequest('GET', '/authentication/users');
  }

  async getServerInfo() {
    return await this.makeRequest('GET', '/server/info');
  }

  async getServerHealth() {
    return await this.makeRequest('GET', '/server/health/splunkd/details');
  }
}

module.exports = SplunkEnterpriseIntegration;
