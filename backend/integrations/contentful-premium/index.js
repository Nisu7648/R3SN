const axios = require('axios');

class ContentfulPremiumIntegration {
  constructor(accessToken, spaceId, environmentId = 'master') {
    this.accessToken = accessToken;
    this.spaceId = spaceId;
    this.environmentId = environmentId;
    this.baseUrl = 'https://api.contentful.com';
  }

  getHeaders() {
    return { 'Authorization': `Bearer ${this.accessToken}`, 'Content-Type': 'application/vnd.contentful.management.v1+json' };
  }

  async request(method, path, data = null) {
    try {
      const response = await axios({ method, url: `${this.baseUrl}${path}`, headers: this.getHeaders(), data });
      return { success: true, data: response.data };
    } catch (error) {
      throw new Error(`Contentful API error: ${error.response?.data?.message || error.message}`);
    }
  }

  // Space & Environment
  async getSpace() { return this.request('GET', `/spaces/${this.spaceId}`); }
  async listEnvironments() { return this.request('GET', `/spaces/${this.spaceId}/environments`); }
  async getEnvironment() { return this.request('GET', `/spaces/${this.spaceId}/environments/${this.environmentId}`); }

  // Entries
  async listEntries(params = {}) { return this.request('GET', `/spaces/${this.spaceId}/environments/${this.environmentId}/entries?${new URLSearchParams(params)}`); }
  async getEntry(entryId) { return this.request('GET', `/spaces/${this.spaceId}/environments/${this.environmentId}/entries/${entryId}`); }
  async createEntry(contentTypeId, fields) { return this.request('POST', `/spaces/${this.spaceId}/environments/${this.environmentId}/entries`, { fields }, { 'X-Contentful-Content-Type': contentTypeId }); }
  async updateEntry(entryId, fields, version) { return this.request('PUT', `/spaces/${this.spaceId}/environments/${this.environmentId}/entries/${entryId}`, { fields }, { 'X-Contentful-Version': version }); }
  async deleteEntry(entryId) { return this.request('DELETE', `/spaces/${this.spaceId}/environments/${this.environmentId}/entries/${entryId}`); }
  async publishEntry(entryId, version) { return this.request('PUT', `/spaces/${this.spaceId}/environments/${this.environmentId}/entries/${entryId}/published`, null, { 'X-Contentful-Version': version }); }
  async unpublishEntry(entryId) { return this.request('DELETE', `/spaces/${this.spaceId}/environments/${this.environmentId}/entries/${entryId}/published`); }

  // Assets
  async listAssets(params = {}) { return this.request('GET', `/spaces/${this.spaceId}/environments/${this.environmentId}/assets?${new URLSearchParams(params)}`); }
  async getAsset(assetId) { return this.request('GET', `/spaces/${this.spaceId}/environments/${this.environmentId}/assets/${assetId}`); }
  async createAsset(fields) { return this.request('POST', `/spaces/${this.spaceId}/environments/${this.environmentId}/assets`, { fields }); }
  async processAsset(assetId, locale = 'en-US') { return this.request('PUT', `/spaces/${this.spaceId}/environments/${this.environmentId}/assets/${assetId}/files/${locale}/process`); }
  async publishAsset(assetId, version) { return this.request('PUT', `/spaces/${this.spaceId}/environments/${this.environmentId}/assets/${assetId}/published`, null, { 'X-Contentful-Version': version }); }

  // Content Types
  async listContentTypes() { return this.request('GET', `/spaces/${this.spaceId}/environments/${this.environmentId}/content_types`); }
  async getContentType(contentTypeId) { return this.request('GET', `/spaces/${this.spaceId}/environments/${this.environmentId}/content_types/${contentTypeId}`); }
  async createContentType(data) { return this.request('POST', `/spaces/${this.spaceId}/environments/${this.environmentId}/content_types`, data); }
  async updateContentType(contentTypeId, data, version) { return this.request('PUT', `/spaces/${this.spaceId}/environments/${this.environmentId}/content_types/${contentTypeId}`, data, { 'X-Contentful-Version': version }); }

  // Locales (Premium)
  async listLocales() { return this.request('GET', `/spaces/${this.spaceId}/environments/${this.environmentId}/locales`); }
  async createLocale(data) { return this.request('POST', `/spaces/${this.spaceId}/environments/${this.environmentId}/locales`, data); }

  // Webhooks (Premium)
  async listWebhooks() { return this.request('GET', `/spaces/${this.spaceId}/webhook_definitions`); }
  async createWebhook(data) { return this.request('POST', `/spaces/${this.spaceId}/webhook_definitions`, data); }
  async deleteWebhook(webhookId) { return this.request('DELETE', `/spaces/${this.spaceId}/webhook_definitions/${webhookId}`); }

  // Roles (Premium)
  async listRoles() { return this.request('GET', `/spaces/${this.spaceId}/roles`); }
  async createRole(data) { return this.request('POST', `/spaces/${this.spaceId}/roles`, data); }

  // Scheduled Actions (Premium)
  async listScheduledActions() { return this.request('GET', `/spaces/${this.spaceId}/scheduled_actions`); }
  async createScheduledAction(data) { return this.request('POST', `/spaces/${this.spaceId}/scheduled_actions`, data); }

  // GraphQL (Premium)
  async graphqlQuery(query, variables = {}) { return this.request('POST', `/spaces/${this.spaceId}/environments/${this.environmentId}/graphql`, { query, variables }); }

  // Content Preview (Premium)
  async getContentPreview(entryId) { return this.request('GET', `/spaces/${this.spaceId}/environments/${this.environmentId}/entries/${entryId}`); }
}

module.exports = ContentfulPremiumIntegration;
