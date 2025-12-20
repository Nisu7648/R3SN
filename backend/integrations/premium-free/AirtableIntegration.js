const axios = require('axios');

/**
 * Airtable Integration
 * FREE Premium App - Database + Spreadsheet hybrid
 * Sign up at: https://airtable.com
 * Get API key: https://airtable.com/account
 * 
 * Features:
 * - Create/read/update/delete records
 * - Table management
 * - Field operations
 * - Filtering and sorting
 * - Attachments
 * - Formulas
 * 
 * FREE Plan: 1,200 records per base, unlimited bases
 */
class AirtableIntegration {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.airtable.com/v0';
  }

  /**
   * Get headers
   */
  getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * List records
   */
  async listRecords(baseId, tableName, options = {}) {
    try {
      const params = {};
      
      if (options.maxRecords) params.maxRecords = options.maxRecords;
      if (options.view) params.view = options.view;
      if (options.filterByFormula) params.filterByFormula = options.filterByFormula;
      if (options.sort) params.sort = JSON.stringify(options.sort);
      if (options.fields) params.fields = options.fields;

      const response = await axios.get(
        `${this.baseUrl}/${baseId}/${encodeURIComponent(tableName)}`,
        {
          headers: this.getHeaders(),
          params
        }
      );

      return {
        success: true,
        records: response.data.records,
        offset: response.data.offset
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  /**
   * Get record by ID
   */
  async getRecord(baseId, tableName, recordId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/${baseId}/${encodeURIComponent(tableName)}/${recordId}`,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        record: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  /**
   * Create record
   */
  async createRecord(baseId, tableName, fields) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${baseId}/${encodeURIComponent(tableName)}`,
        { fields },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        record: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  /**
   * Create multiple records
   */
  async createRecords(baseId, tableName, records) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${baseId}/${encodeURIComponent(tableName)}`,
        { records: records.map(fields => ({ fields })) },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        records: response.data.records
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  /**
   * Update record
   */
  async updateRecord(baseId, tableName, recordId, fields) {
    try {
      const response = await axios.patch(
        `${this.baseUrl}/${baseId}/${encodeURIComponent(tableName)}/${recordId}`,
        { fields },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        record: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  /**
   * Update multiple records
   */
  async updateRecords(baseId, tableName, updates) {
    try {
      const response = await axios.patch(
        `${this.baseUrl}/${baseId}/${encodeURIComponent(tableName)}`,
        { records: updates },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        records: response.data.records
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  /**
   * Delete record
   */
  async deleteRecord(baseId, tableName, recordId) {
    try {
      const response = await axios.delete(
        `${this.baseUrl}/${baseId}/${encodeURIComponent(tableName)}/${recordId}`,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        deleted: response.data.deleted,
        id: response.data.id
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  /**
   * Delete multiple records
   */
  async deleteRecords(baseId, tableName, recordIds) {
    try {
      const response = await axios.delete(
        `${this.baseUrl}/${baseId}/${encodeURIComponent(tableName)}`,
        {
          headers: this.getHeaders(),
          params: { records: recordIds }
        }
      );

      return {
        success: true,
        records: response.data.records
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  /**
   * Search records
   */
  async searchRecords(baseId, tableName, searchField, searchValue) {
    const filterFormula = `SEARCH("${searchValue}", {${searchField}})`;
    
    return await this.listRecords(baseId, tableName, {
      filterByFormula: filterFormula
    });
  }

  /**
   * Filter records by field value
   */
  async filterRecords(baseId, tableName, field, value) {
    const filterFormula = `{${field}} = "${value}"`;
    
    return await this.listRecords(baseId, tableName, {
      filterByFormula: filterFormula
    });
  }

  /**
   * Get all records (handles pagination)
   */
  async getAllRecords(baseId, tableName, options = {}) {
    let allRecords = [];
    let offset = null;

    do {
      const params = { ...options };
      if (offset) params.offset = offset;

      const result = await this.listRecords(baseId, tableName, params);
      
      if (!result.success) {
        return result;
      }

      allRecords = allRecords.concat(result.records);
      offset = result.offset;
    } while (offset);

    return {
      success: true,
      records: allRecords,
      count: allRecords.length
    };
  }
}

module.exports = AirtableIntegration;
