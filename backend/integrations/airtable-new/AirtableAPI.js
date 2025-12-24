/**
 * Airtable Integration - Complete Implementation
 * Spreadsheet-database hybrid platform
 */

const axios = require('axios');

class AirtableIntegration {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseUrl = 'https://api.airtable.com/v0';
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // Bases
  async listBases() {
    const response = await this.client.get('/meta/bases');
    return response.data.bases;
  }

  async getBase(baseId) {
    const response = await this.client.get(`/meta/bases/${baseId}`);
    return response.data;
  }

  // Tables
  async listTables(baseId) {
    const response = await this.client.get(`/meta/bases/${baseId}/tables`);
    return response.data.tables;
  }

  async getTable(baseId, tableId) {
    const response = await this.client.get(`/meta/bases/${baseId}/tables/${tableId}`);
    return response.data;
  }

  // Records
  async listRecords(baseId, tableId, params = {}) {
    const response = await this.client.get(`/${baseId}/${tableId}`, { params });
    return response.data.records;
  }

  async getRecord(baseId, tableId, recordId) {
    const response = await this.client.get(`/${baseId}/${tableId}/${recordId}`);
    return response.data;
  }

  async createRecord(baseId, tableId, fields) {
    const response = await this.client.post(`/${baseId}/${tableId}`, {
      fields
    });
    return response.data;
  }

  async createRecords(baseId, tableId, records) {
    const response = await this.client.post(`/${baseId}/${tableId}`, {
      records: records.map(fields => ({ fields }))
    });
    return response.data.records;
  }

  async updateRecord(baseId, tableId, recordId, fields) {
    const response = await this.client.patch(`/${baseId}/${tableId}/${recordId}`, {
      fields
    });
    return response.data;
  }

  async updateRecords(baseId, tableId, records) {
    const response = await this.client.patch(`/${baseId}/${tableId}`, {
      records: records.map(r => ({ id: r.id, fields: r.fields }))
    });
    return response.data.records;
  }

  async deleteRecord(baseId, tableId, recordId) {
    const response = await this.client.delete(`/${baseId}/${tableId}/${recordId}`);
    return response.data;
  }

  async deleteRecords(baseId, tableId, recordIds) {
    const response = await this.client.delete(`/${baseId}/${tableId}`, {
      params: { records: recordIds }
    });
    return response.data.records;
  }

  // Query
  async queryRecords(baseId, tableId, options = {}) {
    const params = {};
    
    if (options.filterByFormula) params.filterByFormula = options.filterByFormula;
    if (options.maxRecords) params.maxRecords = options.maxRecords;
    if (options.pageSize) params.pageSize = options.pageSize;
    if (options.sort) params.sort = options.sort;
    if (options.view) params.view = options.view;
    if (options.fields) params.fields = options.fields;
    
    return this.listRecords(baseId, tableId, params);
  }

  // Search
  async searchRecords(baseId, tableId, searchTerm, field) {
    const formula = `SEARCH("${searchTerm}", {${field}})`;
    return this.queryRecords(baseId, tableId, { filterByFormula: formula });
  }

  // Attachments
  async uploadAttachment(baseId, tableId, recordId, fieldName, fileUrl) {
    return this.updateRecord(baseId, tableId, recordId, {
      [fieldName]: [{ url: fileUrl }]
    });
  }

  // Batch Operations
  async batchCreate(baseId, tableId, records, batchSize = 10) {
    const results = [];
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const created = await this.createRecords(baseId, tableId, batch);
      results.push(...created);
    }
    return results;
  }

  async batchUpdate(baseId, tableId, records, batchSize = 10) {
    const results = [];
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const updated = await this.updateRecords(baseId, tableId, batch);
      results.push(...updated);
    }
    return results;
  }

  async batchDelete(baseId, tableId, recordIds, batchSize = 10) {
    const results = [];
    for (let i = 0; i < recordIds.length; i += batchSize) {
      const batch = recordIds.slice(i, i + batchSize);
      const deleted = await this.deleteRecords(baseId, tableId, batch);
      results.push(...deleted);
    }
    return results;
  }

  // Webhooks
  async createWebhook(baseId, notificationUrl, specification) {
    const response = await this.client.post(`/bases/${baseId}/webhooks`, {
      notificationUrl,
      specification
    });
    return response.data;
  }

  async listWebhooks(baseId) {
    const response = await this.client.get(`/bases/${baseId}/webhooks`);
    return response.data.webhooks;
  }

  async deleteWebhook(baseId, webhookId) {
    await this.client.delete(`/bases/${baseId}/webhooks/${webhookId}`);
    return { success: true };
  }

  async refreshWebhook(baseId, webhookId) {
    const response = await this.client.post(`/bases/${baseId}/webhooks/${webhookId}/refresh`);
    return response.data;
  }

  // Collaborators
  async listCollaborators(baseId) {
    const response = await this.client.get(`/meta/bases/${baseId}/collaborators`);
    return response.data.collaborators;
  }

  // Shares
  async createShare(baseId, tableId) {
    const response = await this.client.post(`/${baseId}/${tableId}/shares`);
    return response.data;
  }

  async listShares(baseId, tableId) {
    const response = await this.client.get(`/${baseId}/${tableId}/shares`);
    return response.data.shares;
  }

  async deleteShare(baseId, tableId, shareId) {
    await this.client.delete(`/${baseId}/${tableId}/shares/${shareId}`);
    return { success: true };
  }
}

module.exports = AirtableIntegration;
