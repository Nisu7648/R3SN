const axios = require('axios');

class GoogleSheetsIntegration {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://sheets.googleapis.com/v4/spreadsheets';
  }

  async getSpreadsheet(spreadsheetId) {
    const response = await axios.get(`${this.baseURL}/${spreadsheetId}`, {
      params: { key: this.apiKey }
    });
    return response.data;
  }

  async getValues(spreadsheetId, range) {
    const response = await axios.get(
      `${this.baseURL}/${spreadsheetId}/values/${range}`,
      { params: { key: this.apiKey } }
    );
    return response.data;
  }

  async updateValues(spreadsheetId, range, values, accessToken) {
    const response = await axios.put(
      `${this.baseURL}/${spreadsheetId}/values/${range}`,
      { values },
      {
        headers: { 'Authorization': `Bearer ${accessToken}` },
        params: { valueInputOption: 'RAW' }
      }
    );
    return response.data;
  }

  async appendValues(spreadsheetId, range, values, accessToken) {
    const response = await axios.post(
      `${this.baseURL}/${spreadsheetId}/values/${range}:append`,
      { values },
      {
        headers: { 'Authorization': `Bearer ${accessToken}` },
        params: { valueInputOption: 'RAW' }
      }
    );
    return response.data;
  }

  async createSpreadsheet(title, accessToken) {
    const response = await axios.post(
      this.baseURL,
      { properties: { title } },
      { headers: { 'Authorization': `Bearer ${accessToken}` } }
    );
    return response.data;
  }

  async batchUpdate(spreadsheetId, requests, accessToken) {
    const response = await axios.post(
      `${this.baseURL}/${spreadsheetId}:batchUpdate`,
      { requests },
      { headers: { 'Authorization': `Bearer ${accessToken}` } }
    );
    return response.data;
  }
}

module.exports = GoogleSheetsIntegration;
