/**
 * SendGrid Integration
 * Real SendGrid API for email sending
 */

const axios = require('axios');

class SendGridIntegration {
  constructor(config) {
    this.config = config;
    this.validateConfig();
    this.baseUrl = 'https://api.sendgrid.com/v3';
  }

  validateConfig() {
    if (!this.config.apiKey) {
      throw new Error('SendGrid API Key is required');
    }
  }

  getHeaders() {
    return {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  async execute(action, params) {
    const actions = {
      sendEmail: this.sendEmail.bind(this),
      sendBulkEmail: this.sendBulkEmail.bind(this),
      addContact: this.addContact.bind(this),
      listContacts: this.listContacts.bind(this),
      deleteContact: this.deleteContact.bind(this),
      createList: this.createList.bind(this),
      getStats: this.getStats.bind(this),
      validateEmail: this.validateEmail.bind(this),
    };

    if (!actions[action]) {
      throw new Error(`Unknown action: ${action}`);
    }

    return await actions[action](params);
  }

  async sendEmail(params) {
    const { to, from, subject, text, html, attachments } = params;
    
    if (!to || !from || !subject || (!text && !html)) {
      throw new Error('To, From, Subject, and Text/HTML are required');
    }

    try {
      const payload = {
        personalizations: [{
          to: Array.isArray(to) ? to.map(email => ({ email })) : [{ email: to }]
        }],
        from: { email: from },
        subject,
        content: []
      };

      if (text) payload.content.push({ type: 'text/plain', value: text });
      if (html) payload.content.push({ type: 'text/html', value: html });
      if (attachments) payload.attachments = attachments;

      const response = await axios.post(
        `${this.baseUrl}/mail/send`,
        payload,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          messageId: response.headers['x-message-id'],
          status: response.status
        }
      };
    } catch (error) {
      throw new Error(`SendGrid API error: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  async sendBulkEmail(params) {
    const { recipients, from, subject, text, html } = params;
    
    if (!recipients || !from || !subject) {
      throw new Error('Recipients, From, and Subject are required');
    }

    try {
      const payload = {
        personalizations: recipients.map(recipient => ({
          to: [{ email: recipient.email }],
          substitutions: recipient.substitutions || {}
        })),
        from: { email: from },
        subject,
        content: []
      };

      if (text) payload.content.push({ type: 'text/plain', value: text });
      if (html) payload.content.push({ type: 'text/html', value: html });

      const response = await axios.post(
        `${this.baseUrl}/mail/send`,
        payload,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          messageId: response.headers['x-message-id'],
          recipientCount: recipients.length
        }
      };
    } catch (error) {
      throw new Error(`SendGrid API error: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  async addContact(params) {
    const { email, firstName, lastName, customFields } = params;
    
    if (!email) {
      throw new Error('Email is required');
    }

    try {
      const payload = {
        contacts: [{
          email,
          ...(firstName && { first_name: firstName }),
          ...(lastName && { last_name: lastName }),
          ...(customFields && { custom_fields: customFields })
        }]
      };

      const response = await axios.put(
        `${this.baseUrl}/marketing/contacts`,
        payload,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          jobId: response.data.job_id
        }
      };
    } catch (error) {
      throw new Error(`SendGrid API error: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  async listContacts(params) {
    const { pageSize = 100 } = params;

    try {
      const response = await axios.get(
        `${this.baseUrl}/marketing/contacts`,
        {
          headers: this.getHeaders(),
          params: { page_size: pageSize }
        }
      );

      return {
        success: true,
        data: response.data.result.map(contact => ({
          id: contact.id,
          email: contact.email,
          firstName: contact.first_name,
          lastName: contact.last_name,
          createdAt: contact.created_at
        }))
      };
    } catch (error) {
      throw new Error(`SendGrid API error: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  async deleteContact(params) {
    const { contactId } = params;
    
    if (!contactId) {
      throw new Error('Contact ID is required');
    }

    try {
      await axios.delete(
        `${this.baseUrl}/marketing/contacts`,
        {
          headers: this.getHeaders(),
          params: { ids: contactId }
        }
      );

      return {
        success: true,
        data: { deleted: true, contactId }
      };
    } catch (error) {
      throw new Error(`SendGrid API error: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  async createList(params) {
    const { name } = params;
    
    if (!name) {
      throw new Error('List name is required');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/marketing/lists`,
        { name },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          id: response.data.id,
          name: response.data.name,
          contactCount: response.data.contact_count
        }
      };
    } catch (error) {
      throw new Error(`SendGrid API error: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  async getStats(params) {
    const { startDate, endDate, aggregatedBy = 'day' } = params;
    
    if (!startDate) {
      throw new Error('Start date is required');
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/stats`,
        {
          headers: this.getHeaders(),
          params: {
            start_date: startDate,
            ...(endDate && { end_date: endDate }),
            aggregated_by: aggregatedBy
          }
        }
      );

      return {
        success: true,
        data: response.data.map(stat => ({
          date: stat.date,
          stats: stat.stats
        }))
      };
    } catch (error) {
      throw new Error(`SendGrid API error: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  async validateEmail(params) {
    const { email } = params;
    
    if (!email) {
      throw new Error('Email is required');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/validations/email`,
        { email },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          email: response.data.email,
          verdict: response.data.verdict,
          score: response.data.score
        }
      };
    } catch (error) {
      throw new Error(`SendGrid API error: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }
}

module.exports = SendGridIntegration;
