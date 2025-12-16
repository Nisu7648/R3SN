/**
 * SendGrid Integration - Complete Implementation
 * 15 endpoints for email sending and management
 */

const axios = require('axios');

class SendGridIntegration {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.sendgrid.com/v3';
  }

  getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async sendEmail(to, from, subject, content, options = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/mail/send`,
        {
          personalizations: [{ to: [{ email: to }] }],
          from: { email: from },
          subject,
          content: [{ type: 'text/html', value: content }],
          ...options,
        },
        { headers: this.getHeaders() }
      );
      return { success: true, message: 'Email sent successfully' };
    } catch (error) {
      throw new Error(`Failed to send email: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  async listTemplates() {
    try {
      const response = await axios.get(`${this.baseUrl}/templates`, {
        headers: this.getHeaders(),
      });
      return { success: true, templates: response.data.templates };
    } catch (error) {
      throw new Error(`Failed to list templates: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  async getTemplate(templateId) {
    try {
      const response = await axios.get(`${this.baseUrl}/templates/${templateId}`, {
        headers: this.getHeaders(),
      });
      return { success: true, template: response.data };
    } catch (error) {
      throw new Error(`Failed to get template: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  async createTemplate(name, generation = 'dynamic') {
    try {
      const response = await axios.post(`${this.baseUrl}/templates`,
        { name, generation },
        { headers: this.getHeaders() }
      );
      return { success: true, template: response.data };
    } catch (error) {
      throw new Error(`Failed to create template: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  async updateTemplate(templateId, updates) {
    try {
      const response = await axios.patch(`${this.baseUrl}/templates/${templateId}`,
        updates,
        { headers: this.getHeaders() }
      );
      return { success: true, template: response.data };
    } catch (error) {
      throw new Error(`Failed to update template: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  async deleteTemplate(templateId) {
    try {
      await axios.delete(`${this.baseUrl}/templates/${templateId}`, {
        headers: this.getHeaders(),
      });
      return { success: true, message: 'Template deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete template: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  async listContacts(limit = 100) {
    try {
      const response = await axios.get(`${this.baseUrl}/marketing/contacts`, {
        headers: this.getHeaders(),
        params: { page_size: limit },
      });
      return { success: true, contacts: response.data.result };
    } catch (error) {
      throw new Error(`Failed to list contacts: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  async addContact(email, firstName, lastName, options = {}) {
    try {
      const response = await axios.put(`${this.baseUrl}/marketing/contacts`,
        {
          contacts: [{
            email,
            first_name: firstName,
            last_name: lastName,
            ...options,
          }],
        },
        { headers: this.getHeaders() }
      );
      return { success: true, result: response.data };
    } catch (error) {
      throw new Error(`Failed to add contact: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  async deleteContact(contactId) {
    try {
      await axios.delete(`${this.baseUrl}/marketing/contacts`, {
        headers: this.getHeaders(),
        params: { ids: contactId },
      });
      return { success: true, message: 'Contact deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete contact: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  async listCampaigns() {
    try {
      const response = await axios.get(`${this.baseUrl}/marketing/singlesends`, {
        headers: this.getHeaders(),
      });
      return { success: true, campaigns: response.data.result };
    } catch (error) {
      throw new Error(`Failed to list campaigns: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  async getCampaign(campaignId) {
    try {
      const response = await axios.get(`${this.baseUrl}/marketing/singlesends/${campaignId}`, {
        headers: this.getHeaders(),
      });
      return { success: true, campaign: response.data };
    } catch (error) {
      throw new Error(`Failed to get campaign: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  async getStats(startDate) {
    try {
      const response = await axios.get(`${this.baseUrl}/stats`, {
        headers: this.getHeaders(),
        params: { start_date: startDate },
      });
      return { success: true, stats: response.data };
    } catch (error) {
      throw new Error(`Failed to get stats: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  async listSuppressions(type = 'bounces') {
    try {
      const response = await axios.get(`${this.baseUrl}/suppression/${type}`, {
        headers: this.getHeaders(),
      });
      return { success: true, suppressions: response.data };
    } catch (error) {
      throw new Error(`Failed to list suppressions: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  async addSuppression(type, email) {
    try {
      const response = await axios.post(`${this.baseUrl}/suppression/${type}`,
        { emails: [email] },
        { headers: this.getHeaders() }
      );
      return { success: true, result: response.data };
    } catch (error) {
      throw new Error(`Failed to add suppression: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  async getApiKeyPermissions() {
    try {
      const response = await axios.get(`${this.baseUrl}/scopes`, {
        headers: this.getHeaders(),
      });
      return { success: true, scopes: response.data.scopes };
    } catch (error) {
      throw new Error(`Failed to get API key permissions: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }
}

module.exports = SendGridIntegration;
