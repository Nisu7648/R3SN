const axios = require('axios');

/**
 * SendGrid Complete Integration
 * Email sending, templates, and marketing campaigns
 */
class SendGridIntegration {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.sendgrid.com/v3';
    this.headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  // Send email
  async sendEmail(to, subject, text, html = null, from = 'noreply@example.com') {
    const data = {
      personalizations: [{
        to: [{ email: to }],
        subject: subject
      }],
      from: { email: from },
      content: [
        { type: 'text/plain', value: text },
        ...(html ? [{ type: 'text/html', value: html }] : [])
      ]
    };

    const response = await axios.post(`${this.baseURL}/mail/send`, data, {
      headers: this.headers
    });
    return response.data;
  }

  // Send bulk email
  async sendBulkEmail(recipients, subject, text, html = null, from = 'noreply@example.com') {
    const data = {
      personalizations: recipients.map(email => ({
        to: [{ email }],
        subject: subject
      })),
      from: { email: from },
      content: [
        { type: 'text/plain', value: text },
        ...(html ? [{ type: 'text/html', value: html }] : [])
      ]
    };

    const response = await axios.post(`${this.baseURL}/mail/send`, data, {
      headers: this.headers
    });
    return response.data;
  }

  // Send template email
  async sendTemplateEmail(to, templateId, dynamicData, from = 'noreply@example.com') {
    const data = {
      personalizations: [{
        to: [{ email: to }],
        dynamic_template_data: dynamicData
      }],
      from: { email: from },
      template_id: templateId
    };

    const response = await axios.post(`${this.baseURL}/mail/send`, data, {
      headers: this.headers
    });
    return response.data;
  }

  // Create template
  async createTemplate(name, generation = 'dynamic') {
    const data = { name, generation };
    const response = await axios.post(`${this.baseURL}/templates`, data, {
      headers: this.headers
    });
    return response.data;
  }

  // List templates
  async listTemplates(generations = 'legacy,dynamic') {
    const response = await axios.get(`${this.baseURL}/templates`, {
      headers: this.headers,
      params: { generations }
    });
    return response.data;
  }

  // Get template
  async getTemplate(templateId) {
    const response = await axios.get(`${this.baseURL}/templates/${templateId}`, {
      headers: this.headers
    });
    return response.data;
  }

  // Add contact
  async addContact(email, firstName = '', lastName = '', customFields = {}) {
    const data = {
      contacts: [{
        email,
        first_name: firstName,
        last_name: lastName,
        custom_fields: customFields
      }]
    };

    const response = await axios.put(`${this.baseURL}/marketing/contacts`, data, {
      headers: this.headers
    });
    return response.data;
  }

  // Create list
  async createList(name) {
    const data = { name };
    const response = await axios.post(`${this.baseURL}/marketing/lists`, data, {
      headers: this.headers
    });
    return response.data;
  }

  // Get stats
  async getStats(startDate, endDate = null) {
    const params = {
      start_date: startDate,
      ...(endDate && { end_date: endDate })
    };

    const response = await axios.get(`${this.baseURL}/stats`, {
      headers: this.headers,
      params
    });
    return response.data;
  }

  // Validate email
  async validateEmail(email) {
    const response = await axios.post(
      `${this.baseURL}/validations/email`,
      { email },
      { headers: this.headers }
    );
    return response.data;
  }
}

module.exports = SendGridIntegration;
