/**
 * Zendesk Customer Support Integration
 */

const axios = require('axios');

class ZendeskIntegration {
  constructor(config) {
    this.subdomain = config.subdomain || process.env.ZENDESK_SUBDOMAIN;
    this.email = config.email || process.env.ZENDESK_EMAIL;
    this.apiToken = config.apiToken || process.env.ZENDESK_API_TOKEN;
    
    if (!this.subdomain || !this.email || !this.apiToken) {
      throw new Error('Zendesk credentials required');
    }
    
    this.baseURL = `https://${this.subdomain}.zendesk.com/api/v2`;
    this.auth = Buffer.from(`${this.email}/token:${this.apiToken}`).toString('base64');
  }

  async makeRequest(method, endpoint, data = null) {
    const config = {
      method,
      url: `${this.baseURL}${endpoint}`,
      headers: {
        'Authorization': `Basic ${this.auth}`,
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

  async getTickets(page = 1) {
    return await this.makeRequest('GET', `/tickets.json?page=${page}`);
  }

  async getTicket(ticketId) {
    return await this.makeRequest('GET', `/tickets/${ticketId}.json`);
  }

  async createTicket(subject, description, requesterEmail, priority = 'normal') {
    return await this.makeRequest('POST', '/tickets.json', {
      ticket: {
        subject,
        comment: { body: description },
        requester: { email: requesterEmail },
        priority
      }
    });
  }

  async updateTicket(ticketId, updates) {
    return await this.makeRequest('PUT', `/tickets/${ticketId}.json`, {
      ticket: updates
    });
  }

  async deleteTicket(ticketId) {
    return await this.makeRequest('DELETE', `/tickets/${ticketId}.json`);
  }

  async addComment(ticketId, body, isPublic = true) {
    return await this.makeRequest('PUT', `/tickets/${ticketId}.json`, {
      ticket: {
        comment: { body, public: isPublic }
      }
    });
  }

  async getUsers(page = 1) {
    return await this.makeRequest('GET', `/users.json?page=${page}`);
  }

  async getUser(userId) {
    return await this.makeRequest('GET', `/users/${userId}.json`);
  }

  async createUser(name, email, role = 'end-user') {
    return await this.makeRequest('POST', '/users.json', {
      user: { name, email, role }
    });
  }

  async updateUser(userId, updates) {
    return await this.makeRequest('PUT', `/users/${userId}.json`, {
      user: updates
    });
  }

  async searchTickets(query) {
    return await this.makeRequest('GET', `/search.json?query=${encodeURIComponent(query)}`);
  }

  async getOrganizations() {
    return await this.makeRequest('GET', '/organizations.json');
  }
}

module.exports = ZendeskIntegration;
