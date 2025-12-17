/**
 * Freshdesk Integration - Complete Implementation
 * 20 endpoints for customer support management
 */

const axios = require('axios');

class FreshdeskIntegration {
  constructor(apiKey, domain) {
    this.apiKey = apiKey;
    this.domain = domain;
    this.baseUrl = `https://${domain}.freshdesk.com/api/v2`;
  }

  getHeaders() {
    const auth = Buffer.from(`${this.apiKey}:X`).toString('base64');
    return {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    };
  }

  async listTickets(options = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}/tickets`, {
        headers: this.getHeaders(),
        params: options,
      });
      return { success: true, tickets: response.data };
    } catch (error) {
      throw new Error(`Failed to list tickets: ${error.response?.data?.description || error.message}`);
    }
  }

  async getTicket(ticketId) {
    try {
      const response = await axios.get(`${this.baseUrl}/tickets/${ticketId}`, { headers: this.getHeaders() });
      return { success: true, ticket: response.data };
    } catch (error) {
      throw new Error(`Failed to get ticket: ${error.response?.data?.description || error.message}`);
    }
  }

  async createTicket(subject, description, email, priority = 1, status = 2) {
    try {
      const response = await axios.post(`${this.baseUrl}/tickets`,
        { subject, description, email, priority, status },
        { headers: this.getHeaders() }
      );
      return { success: true, ticket: response.data };
    } catch (error) {
      throw new Error(`Failed to create ticket: ${error.response?.data?.description || error.message}`);
    }
  }

  async updateTicket(ticketId, updates) {
    try {
      const response = await axios.put(`${this.baseUrl}/tickets/${ticketId}`,
        updates,
        { headers: this.getHeaders() }
      );
      return { success: true, ticket: response.data };
    } catch (error) {
      throw new Error(`Failed to update ticket: ${error.response?.data?.description || error.message}`);
    }
  }

  async deleteTicket(ticketId) {
    try {
      await axios.delete(`${this.baseUrl}/tickets/${ticketId}`, { headers: this.getHeaders() });
      return { success: true, message: 'Ticket deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete ticket: ${error.response?.data?.description || error.message}`);
    }
  }

  async listContacts(options = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}/contacts`, {
        headers: this.getHeaders(),
        params: options,
      });
      return { success: true, contacts: response.data };
    } catch (error) {
      throw new Error(`Failed to list contacts: ${error.response?.data?.description || error.message}`);
    }
  }

  async getContact(contactId) {
    try {
      const response = await axios.get(`${this.baseUrl}/contacts/${contactId}`, { headers: this.getHeaders() });
      return { success: true, contact: response.data };
    } catch (error) {
      throw new Error(`Failed to get contact: ${error.response?.data?.description || error.message}`);
    }
  }

  async createContact(name, email, options = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/contacts`,
        { name, email, ...options },
        { headers: this.getHeaders() }
      );
      return { success: true, contact: response.data };
    } catch (error) {
      throw new Error(`Failed to create contact: ${error.response?.data?.description || error.message}`);
    }
  }

  async updateContact(contactId, updates) {
    try {
      const response = await axios.put(`${this.baseUrl}/contacts/${contactId}`,
        updates,
        { headers: this.getHeaders() }
      );
      return { success: true, contact: response.data };
    } catch (error) {
      throw new Error(`Failed to update contact: ${error.response?.data?.description || error.message}`);
    }
  }

  async listAgents() {
    try {
      const response = await axios.get(`${this.baseUrl}/agents`, { headers: this.getHeaders() });
      return { success: true, agents: response.data };
    } catch (error) {
      throw new Error(`Failed to list agents: ${error.response?.data?.description || error.message}`);
    }
  }

  async getAgent(agentId) {
    try {
      const response = await axios.get(`${this.baseUrl}/agents/${agentId}`, { headers: this.getHeaders() });
      return { success: true, agent: response.data };
    } catch (error) {
      throw new Error(`Failed to get agent: ${error.response?.data?.description || error.message}`);
    }
  }

  async listCompanies() {
    try {
      const response = await axios.get(`${this.baseUrl}/companies`, { headers: this.getHeaders() });
      return { success: true, companies: response.data };
    } catch (error) {
      throw new Error(`Failed to list companies: ${error.response?.data?.description || error.message}`);
    }
  }

  async createCompany(name, options = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/companies`,
        { name, ...options },
        { headers: this.getHeaders() }
      );
      return { success: true, company: response.data };
    } catch (error) {
      throw new Error(`Failed to create company: ${error.response?.data?.description || error.message}`);
    }
  }

  async addNote(ticketId, body, isPrivate = true) {
    try {
      const response = await axios.post(`${this.baseUrl}/tickets/${ticketId}/notes`,
        { body, private: isPrivate },
        { headers: this.getHeaders() }
      );
      return { success: true, note: response.data };
    } catch (error) {
      throw new Error(`Failed to add note: ${error.response?.data?.description || error.message}`);
    }
  }

  async addReply(ticketId, body) {
    try {
      const response = await axios.post(`${this.baseUrl}/tickets/${ticketId}/reply`,
        { body },
        { headers: this.getHeaders() }
      );
      return { success: true, reply: response.data };
    } catch (error) {
      throw new Error(`Failed to add reply: ${error.response?.data?.description || error.message}`);
    }
  }

  async listConversations(ticketId) {
    try {
      const response = await axios.get(`${this.baseUrl}/tickets/${ticketId}/conversations`, { headers: this.getHeaders() });
      return { success: true, conversations: response.data };
    } catch (error) {
      throw new Error(`Failed to list conversations: ${error.response?.data?.description || error.message}`);
    }
  }

  async listGroups() {
    try {
      const response = await axios.get(`${this.baseUrl}/groups`, { headers: this.getHeaders() });
      return { success: true, groups: response.data };
    } catch (error) {
      throw new Error(`Failed to list groups: ${error.response?.data?.description || error.message}`);
    }
  }

  async listCategories() {
    try {
      const response = await axios.get(`${this.baseUrl}/solutions/categories`, { headers: this.getHeaders() });
      return { success: true, categories: response.data };
    } catch (error) {
      throw new Error(`Failed to list categories: ${error.response?.data?.description || error.message}`);
    }
  }

  async listArticles() {
    try {
      const response = await axios.get(`${this.baseUrl}/solutions/articles`, { headers: this.getHeaders() });
      return { success: true, articles: response.data };
    } catch (error) {
      throw new Error(`Failed to list articles: ${error.response?.data?.description || error.message}`);
    }
  }

  async createArticle(title, description, folderId) {
    try {
      const response = await axios.post(`${this.baseUrl}/solutions/articles`,
        { title, description, folder_id: folderId },
        { headers: this.getHeaders() }
      );
      return { success: true, article: response.data };
    } catch (error) {
      throw new Error(`Failed to create article: ${error.response?.data?.description || error.message}`);
    }
  }
}

module.exports = FreshdeskIntegration;
