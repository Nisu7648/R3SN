const axios = require('axios');

class AirtableIntegration {
  constructor(apiKey, baseId) {
    this.apiKey = apiKey;
    this.baseId = baseId;
    this.baseURL = `https://api.airtable.com/v0/${baseId}`;
    this.headers = { 'Authorization': `Bearer ${apiKey}` };
  }

  async listRecords(tableName, params = {}) {
    const response = await axios.get(`${this.baseURL}/${tableName}`, {
      headers: this.headers,
      params
    });
    return response.data;
  }

  async getRecord(tableName, recordId) {
    const response = await axios.get(`${this.baseURL}/${tableName}/${recordId}`, {
      headers: this.headers
    });
    return response.data;
  }

  async createRecord(tableName, fields) {
    const response = await axios.post(
      `${this.baseURL}/${tableName}`,
      { fields },
      { headers: this.headers }
    );
    return response.data;
  }

  async updateRecord(tableName, recordId, fields) {
    const response = await axios.patch(
      `${this.baseURL}/${tableName}/${recordId}`,
      { fields },
      { headers: this.headers }
    );
    return response.data;
  }

  async deleteRecord(tableName, recordId) {
    const response = await axios.delete(`${this.baseURL}/${tableName}/${recordId}`, {
      headers: this.headers
    });
    return response.data;
  }

  async batchCreate(tableName, records) {
    const response = await axios.post(
      `${this.baseURL}/${tableName}`,
      { records: records.map(fields => ({ fields })) },
      { headers: this.headers }
    );
    return response.data;
  }
}

module.exports = AirtableIntegration;
