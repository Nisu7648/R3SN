/**
 * SendGrid API Integration
 * Complete email marketing and transactional email with all endpoints
 */

const axios = require('axios');

class SendGridAPI {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.SENDGRID_API_KEY;
    this.baseURL = 'https://api.sendgrid.com/v3';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // ==================== MAIL SEND ====================

  async sendEmail(data) {
    const payload = {
      personalizations: [{
        to: Array.isArray(data.to) ? data.to : [{ email: data.to }],
        ...(data.cc && { cc: Array.isArray(data.cc) ? data.cc : [{ email: data.cc }] }),
        ...(data.bcc && { bcc: Array.isArray(data.bcc) ? data.bcc : [{ email: data.bcc }] }),
        ...(data.subject && { subject: data.subject }),
        ...(data.dynamic_template_data && { dynamic_template_data: data.dynamic_template_data })
      }],
      from: data.from || { email: process.env.SENDGRID_FROM_EMAIL },
      ...(data.subject && { subject: data.subject }),
      content: data.content || [
        {
          type: data.contentType || 'text/html',
          value: data.html || data.text
        }
      ],
      ...(data.template_id && { template_id: data.template_id }),
      ...(data.attachments && { attachments: data.attachments }),
      ...(data.reply_to && { reply_to: data.reply_to })
    };

    const response = await this.client.post('/mail/send', payload);
    return { success: true, message: 'Email sent successfully', status: response.status };
  }

  async sendBulkEmail(data) {
    const payload = {
      personalizations: data.personalizations,
      from: data.from || { email: process.env.SENDGRID_FROM_EMAIL },
      subject: data.subject,
      content: data.content,
      ...(data.template_id && { template_id: data.template_id })
    };

    const response = await this.client.post('/mail/send', payload);
    return { success: true, message: 'Bulk email sent successfully', status: response.status };
  }

  // ==================== TEMPLATES ====================

  async createTemplate(data) {
    const payload = {
      name: data.name,
      generation: data.generation || 'dynamic'
    };

    const response = await this.client.post('/templates', payload);
    return { success: true, template: response.data };
  }

  async getTemplate(templateId) {
    const response = await this.client.get(`/templates/${templateId}`);
    return { success: true, template: response.data };
  }

  async listTemplates(options = {}) {
    const params = new URLSearchParams({
      generations: options.generations || 'dynamic',
      page_size: options.page_size || 20
    });

    const response = await this.client.get(`/templates?${params}`);
    return { success: true, templates: response.data.result };
  }

  async updateTemplate(templateId, data) {
    const payload = {
      ...(data.name && { name: data.name })
    };

    const response = await this.client.patch(`/templates/${templateId}`, payload);
    return { success: true, template: response.data };
  }

  async deleteTemplate(templateId) {
    await this.client.delete(`/templates/${templateId}`);
    return { success: true, deleted: true };
  }

  async createTemplateVersion(templateId, data) {
    const payload = {
      name: data.name,
      subject: data.subject,
      html_content: data.html_content,
      ...(data.plain_content && { plain_content: data.plain_content }),
      active: data.active !== undefined ? data.active : 1
    };

    const response = await this.client.post(`/templates/${templateId}/versions`, payload);
    return { success: true, version: response.data };
  }

  async getTemplateVersion(templateId, versionId) {
    const response = await this.client.get(`/templates/${templateId}/versions/${versionId}`);
    return { success: true, version: response.data };
  }

  async updateTemplateVersion(templateId, versionId, data) {
    const response = await this.client.patch(`/templates/${templateId}/versions/${versionId}`, data);
    return { success: true, version: response.data };
  }

  async deleteTemplateVersion(templateId, versionId) {
    await this.client.delete(`/templates/${templateId}/versions/${versionId}`);
    return { success: true, deleted: true };
  }

  // ==================== CONTACTS ====================

  async addContact(data) {
    const payload = {
      contacts: [{
        email: data.email,
        ...(data.first_name && { first_name: data.first_name }),
        ...(data.last_name && { last_name: data.last_name }),
        ...(data.custom_fields && { custom_fields: data.custom_fields })
      }]
    };

    const response = await this.client.put('/marketing/contacts', payload);
    return { success: true, result: response.data };
  }

  async addContacts(contacts) {
    const payload = { contacts };
    const response = await this.client.put('/marketing/contacts', payload);
    return { success: true, result: response.data };
  }

  async searchContacts(query) {
    const payload = { query };
    const response = await this.client.post('/marketing/contacts/search', payload);
    return { success: true, contacts: response.data.result };
  }

  async getContact(contactId) {
    const response = await this.client.get(`/marketing/contacts/${contactId}`);
    return { success: true, contact: response.data };
  }

  async deleteContact(contactId) {
    const params = new URLSearchParams({ ids: contactId });
    await this.client.delete(`/marketing/contacts?${params}`);
    return { success: true, deleted: true };
  }

  async deleteContacts(contactIds) {
    const params = new URLSearchParams({ ids: contactIds.join(',') });
    await this.client.delete(`/marketing/contacts?${params}`);
    return { success: true, deleted: true };
  }

  // ==================== LISTS ====================

  async createList(data) {
    const payload = {
      name: data.name
    };

    const response = await this.client.post('/marketing/lists', payload);
    return { success: true, list: response.data };
  }

  async getList(listId) {
    const response = await this.client.get(`/marketing/lists/${listId}`);
    return { success: true, list: response.data };
  }

  async listLists(options = {}) {
    const params = new URLSearchParams({
      page_size: options.page_size || 100
    });

    const response = await this.client.get(`/marketing/lists?${params}`);
    return { success: true, lists: response.data.result };
  }

  async updateList(listId, data) {
    const payload = {
      name: data.name
    };

    const response = await this.client.patch(`/marketing/lists/${listId}`, payload);
    return { success: true, list: response.data };
  }

  async deleteList(listId) {
    await this.client.delete(`/marketing/lists/${listId}`);
    return { success: true, deleted: true };
  }

  async addContactsToList(listId, contactIds) {
    const payload = {
      list_ids: [listId],
      contacts: contactIds.map(id => ({ id }))
    };

    const response = await this.client.put('/marketing/contacts', payload);
    return { success: true, result: response.data };
  }

  // ==================== CAMPAIGNS ====================

  async createCampaign(data) {
    const payload = {
      name: data.name,
      send_to: data.send_to,
      email_config: {
        subject: data.subject,
        html_content: data.html_content,
        sender_id: data.sender_id,
        ...(data.plain_content && { plain_content: data.plain_content })
      }
    };

    const response = await this.client.post('/marketing/singlesends', payload);
    return { success: true, campaign: response.data };
  }

  async getCampaign(campaignId) {
    const response = await this.client.get(`/marketing/singlesends/${campaignId}`);
    return { success: true, campaign: response.data };
  }

  async listCampaigns(options = {}) {
    const params = new URLSearchParams({
      page_size: options.page_size || 10
    });

    const response = await this.client.get(`/marketing/singlesends?${params}`);
    return { success: true, campaigns: response.data.result };
  }

  async updateCampaign(campaignId, data) {
    const response = await this.client.patch(`/marketing/singlesends/${campaignId}`, data);
    return { success: true, campaign: response.data };
  }

  async deleteCampaign(campaignId) {
    await this.client.delete(`/marketing/singlesends/${campaignId}`);
    return { success: true, deleted: true };
  }

  async scheduleCampaign(campaignId, sendAt) {
    const payload = {
      send_at: sendAt
    };

    const response = await this.client.put(`/marketing/singlesends/${campaignId}/schedule`, payload);
    return { success: true, campaign: response.data };
  }

  // ==================== STATS ====================

  async getGlobalStats(options = {}) {
    const params = new URLSearchParams({
      start_date: options.start_date,
      ...(options.end_date && { end_date: options.end_date }),
      ...(options.aggregated_by && { aggregated_by: options.aggregated_by })
    });

    const response = await this.client.get(`/stats?${params}`);
    return { success: true, stats: response.data };
  }

  async getCategoryStats(categories, options = {}) {
    const params = new URLSearchParams({
      start_date: options.start_date,
      categories: categories.join(','),
      ...(options.end_date && { end_date: options.end_date })
    });

    const response = await this.client.get(`/categories/stats?${params}`);
    return { success: true, stats: response.data };
  }

  // ==================== SUPPRESSIONS ====================

  async getSuppressions(group) {
    const response = await this.client.get(`/suppression/${group}`);
    return { success: true, suppressions: response.data };
  }

  async addSuppression(group, data) {
    const response = await this.client.post(`/suppression/${group}`, data);
    return { success: true, result: response.data };
  }

  async deleteSuppression(group, email) {
    await this.client.delete(`/suppression/${group}/${email}`);
    return { success: true, deleted: true };
  }

  // ==================== API KEYS ====================

  async createApiKey(data) {
    const payload = {
      name: data.name,
      scopes: data.scopes || []
    };

    const response = await this.client.post('/api_keys', payload);
    return { success: true, api_key: response.data };
  }

  async listApiKeys() {
    const response = await this.client.get('/api_keys');
    return { success: true, api_keys: response.data.result };
  }

  async getApiKey(apiKeyId) {
    const response = await this.client.get(`/api_keys/${apiKeyId}`);
    return { success: true, api_key: response.data };
  }

  async deleteApiKey(apiKeyId) {
    await this.client.delete(`/api_keys/${apiKeyId}`);
    return { success: true, deleted: true };
  }

  // ==================== WEBHOOKS ====================

  async getWebhookSettings() {
    const response = await this.client.get('/user/webhooks/event/settings');
    return { success: true, settings: response.data };
  }

  async updateWebhookSettings(data) {
    const response = await this.client.patch('/user/webhooks/event/settings', data);
    return { success: true, settings: response.data };
  }

  async testWebhook(url) {
    const payload = { url };
    const response = await this.client.post('/user/webhooks/event/test', payload);
    return { success: true, result: response.data };
  }
}

module.exports = SendGridAPI;
