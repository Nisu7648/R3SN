/**
 * Airtable Integration
 * Real Airtable API for database management
 */

const axios = require('axios');

class AirtableIntegration {
  constructor(config) {
    this.config = config;
    this.validateConfig();
    this.baseUrl = 'https://api.airtable.com/v0';
  }

  validateConfig() {
    if (!this.config.apiKey) {
      throw new Error('Airtable API Key is required');
    }
    if (!this.config.baseId) {
      throw new Error('Airtable Base ID is required');
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
      listRecords: this.listRecords.bind(this),
      getRecord: this.getRecord.bind(this),
      createRecord: this.createRecord.bind(this),
      updateRecord: this.updateRecord.bind(this),
      deleteRecord: this.deleteRecord.bind(this),
      createRecords: this.createRecords.bind(this),
      updateRecords: this.updateRecords.bind(this),
    };

    if (!actions[action]) {
      throw new Error(`Unknown action: ${action}`);
    }

    return await actions[action](params);
  }

  async listRecords(params) {
    const { tableName, maxRecords = 100, view, filterByFormula, sort } = params;
    
    if (!tableName) {
      throw new Error('Table name is required');
    }

    try {
      const queryParams = {
        maxRecords,
        ...(view && { view }),
        ...(filterByFormula && { filterByFormula }),
        ...(sort && { sort: JSON.stringify(sort) })
      };

      const response = await axios.get(
        `${this.baseUrl}/${this.config.baseId}/${encodeURIComponent(tableName)}`,
        {
          headers: this.getHeaders(),
          params: queryParams
        }
      );

      return {
        success: true,
        data: {
          records: response.data.records.map(record => ({
            id: record.id,
            fields: record.fields,
            createdTime: record.createdTime
          })),
          offset: response.data.offset
        }
      };
    } catch (error) {
      throw new Error(`Airtable API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async getRecord(params) {
    const { tableName, recordId } = params;
    
    if (!tableName || !recordId) {
      throw new Error('Table name and record ID are required');
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/${this.config.baseId}/${encodeURIComponent(tableName)}/${recordId}`,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          id: response.data.id,
          fields: response.data.fields,
          createdTime: response.data.createdTime
        }
      };
    } catch (error) {
      throw new Error(`Airtable API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async createRecord(params) {
    const { tableName, fields } = params;
    
    if (!tableName || !fields) {
      throw new Error('Table name and fields are required');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.config.baseId}/${encodeURIComponent(tableName)}`,
        { fields },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          id: response.data.id,
          fields: response.data.fields,
          createdTime: response.data.createdTime
        }
      };
    } catch (error) {
      throw new Error(`Airtable API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async updateRecord(params) {
    const { tableName, recordId, fields } = params;
    
    if (!tableName || !recordId || !fields) {
      throw new Error('Table name, record ID, and fields are required');
    }

    try {
      const response = await axios.patch(
        `${this.baseUrl}/${this.config.baseId}/${encodeURIComponent(tableName)}/${recordId}`,
        { fields },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          id: response.data.id,
          fields: response.data.fields
        }
      };
    } catch (error) {
      throw new Error(`Airtable API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async deleteRecord(params) {
    const { tableName, recordId } = params;
    
    if (!tableName || !recordId) {
      throw new Error('Table name and record ID are required');
    }

    try {
      const response = await axios.delete(
        `${this.baseUrl}/${this.config.baseId}/${encodeURIComponent(tableName)}/${recordId}`,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          id: response.data.id,
          deleted: response.data.deleted
        }
      };
    } catch (error) {
      throw new Error(`Airtable API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async createRecords(params) {
    const { tableName, records } = params;
    
    if (!tableName || !records || !Array.isArray(records)) {
      throw new Error('Table name and records array are required');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.config.baseId}/${encodeURIComponent(tableName)}`,
        { records: records.map(r => ({ fields: r })) },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          records: response.data.records.map(record => ({
            id: record.id,
            fields: record.fields
          }))
        }
      };
    } catch (error) {
      throw new Error(`Airtable API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async updateRecords(params) {
    const { tableName, records } = params;
    
    if (!tableName || !records || !Array.isArray(records)) {
      throw new Error('Table name and records array are required');
    }

    try {
      const response = await axios.patch(
        `${this.baseUrl}/${this.config.baseId}/${encodeURIComponent(tableName)}`,
        { records: records.map(r => ({ id: r.id, fields: r.fields })) },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          records: response.data.records.map(record => ({
            id: record.id,
            fields: record.fields
          }))
        }
      };
    } catch (error) {
      throw new Error(`Airtable API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

module.exports = AirtableIntegration;
