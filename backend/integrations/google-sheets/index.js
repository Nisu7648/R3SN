/**
 * Google Sheets Integration - Complete Implementation
 * 20 endpoints for full Google Sheets functionality
 */

const axios = require('axios');

class GoogleSheetsIntegration {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
  }

  getHeaders() {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  // 1. Get Spreadsheet
  async getSpreadsheet(spreadsheetId, options = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}/${spreadsheetId}`, {
        headers: this.getHeaders(),
        params: options,
      });
      return { success: true, spreadsheet: response.data };
    } catch (error) {
      throw new Error(`Failed to get spreadsheet: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // 2. Create Spreadsheet
  async createSpreadsheet(title, sheets = []) {
    try {
      const response = await axios.post(this.baseUrl,
        {
          properties: { title },
          sheets: sheets.length > 0 ? sheets : [{ properties: { title: 'Sheet1' } }],
        },
        { headers: this.getHeaders() }
      );
      return { success: true, spreadsheet: response.data };
    } catch (error) {
      throw new Error(`Failed to create spreadsheet: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // 3. Update Spreadsheet
  async updateSpreadsheet(spreadsheetId, requests) {
    try {
      const response = await axios.post(`${this.baseUrl}/${spreadsheetId}:batchUpdate`,
        { requests },
        { headers: this.getHeaders() }
      );
      return { success: true, result: response.data };
    } catch (error) {
      throw new Error(`Failed to update spreadsheet: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // 4. Get Values
  async getValues(spreadsheetId, range) {
    try {
      const response = await axios.get(`${this.baseUrl}/${spreadsheetId}/values/${range}`, {
        headers: this.getHeaders(),
      });
      return { success: true, values: response.data.values || [], range: response.data.range };
    } catch (error) {
      throw new Error(`Failed to get values: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // 5. Update Values
  async updateValues(spreadsheetId, range, values, valueInputOption = 'USER_ENTERED') {
    try {
      const response = await axios.put(`${this.baseUrl}/${spreadsheetId}/values/${range}`,
        { values },
        {
          headers: this.getHeaders(),
          params: { valueInputOption },
        }
      );
      return { success: true, result: response.data };
    } catch (error) {
      throw new Error(`Failed to update values: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // 6. Append Values
  async appendValues(spreadsheetId, range, values, valueInputOption = 'USER_ENTERED') {
    try {
      const response = await axios.post(`${this.baseUrl}/${spreadsheetId}/values/${range}:append`,
        { values },
        {
          headers: this.getHeaders(),
          params: { valueInputOption },
        }
      );
      return { success: true, result: response.data };
    } catch (error) {
      throw new Error(`Failed to append values: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // 7. Clear Values
  async clearValues(spreadsheetId, range) {
    try {
      const response = await axios.post(`${this.baseUrl}/${spreadsheetId}/values/${range}:clear`,
        {},
        { headers: this.getHeaders() }
      );
      return { success: true, result: response.data };
    } catch (error) {
      throw new Error(`Failed to clear values: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // 8. Batch Get Values
  async batchGet(spreadsheetId, ranges) {
    try {
      const response = await axios.get(`${this.baseUrl}/${spreadsheetId}/values:batchGet`, {
        headers: this.getHeaders(),
        params: { ranges },
      });
      return { success: true, valueRanges: response.data.valueRanges };
    } catch (error) {
      throw new Error(`Failed to batch get: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // 9. Batch Update Values
  async batchUpdate(spreadsheetId, data, valueInputOption = 'USER_ENTERED') {
    try {
      const response = await axios.post(`${this.baseUrl}/${spreadsheetId}/values:batchUpdate`,
        { data, valueInputOption },
        { headers: this.getHeaders() }
      );
      return { success: true, result: response.data };
    } catch (error) {
      throw new Error(`Failed to batch update: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // 10. Create Sheet
  async createSheet(spreadsheetId, title, options = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/${spreadsheetId}:batchUpdate`,
        {
          requests: [{
            addSheet: {
              properties: { title, ...options },
            },
          }],
        },
        { headers: this.getHeaders() }
      );
      return { success: true, sheet: response.data.replies[0].addSheet };
    } catch (error) {
      throw new Error(`Failed to create sheet: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // 11. Delete Sheet
  async deleteSheet(spreadsheetId, sheetId) {
    try {
      const response = await axios.post(`${this.baseUrl}/${spreadsheetId}:batchUpdate`,
        {
          requests: [{
            deleteSheet: { sheetId },
          }],
        },
        { headers: this.getHeaders() }
      );
      return { success: true, result: response.data };
    } catch (error) {
      throw new Error(`Failed to delete sheet: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // 12. Copy Sheet
  async copySheet(spreadsheetId, sheetId, destinationSpreadsheetId) {
    try {
      const response = await axios.post(`${this.baseUrl}/${spreadsheetId}/sheets/${sheetId}:copyTo`,
        { destinationSpreadsheetId },
        { headers: this.getHeaders() }
      );
      return { success: true, sheet: response.data };
    } catch (error) {
      throw new Error(`Failed to copy sheet: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // 13. Get Sheet Properties
  async getSheetProperties(spreadsheetId, sheetId) {
    try {
      const response = await axios.get(`${this.baseUrl}/${spreadsheetId}`, {
        headers: this.getHeaders(),
        params: { fields: `sheets(properties,data)` },
      });
      const sheet = response.data.sheets.find(s => s.properties.sheetId === sheetId);
      return { success: true, properties: sheet?.properties };
    } catch (error) {
      throw new Error(`Failed to get sheet properties: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // 14. Update Sheet Properties
  async updateSheetProperties(spreadsheetId, sheetId, properties) {
    try {
      const response = await axios.post(`${this.baseUrl}/${spreadsheetId}:batchUpdate`,
        {
          requests: [{
            updateSheetProperties: {
              properties: { sheetId, ...properties },
              fields: Object.keys(properties).join(','),
            },
          }],
        },
        { headers: this.getHeaders() }
      );
      return { success: true, result: response.data };
    } catch (error) {
      throw new Error(`Failed to update sheet properties: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // 15. Add Rows
  async addRows(spreadsheetId, sheetId, startIndex, endIndex) {
    try {
      const response = await axios.post(`${this.baseUrl}/${spreadsheetId}:batchUpdate`,
        {
          requests: [{
            insertDimension: {
              range: {
                sheetId,
                dimension: 'ROWS',
                startIndex,
                endIndex,
              },
            },
          }],
        },
        { headers: this.getHeaders() }
      );
      return { success: true, result: response.data };
    } catch (error) {
      throw new Error(`Failed to add rows: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // 16. Delete Rows
  async deleteRows(spreadsheetId, sheetId, startIndex, endIndex) {
    try {
      const response = await axios.post(`${this.baseUrl}/${spreadsheetId}:batchUpdate`,
        {
          requests: [{
            deleteDimension: {
              range: {
                sheetId,
                dimension: 'ROWS',
                startIndex,
                endIndex,
              },
            },
          }],
        },
        { headers: this.getHeaders() }
      );
      return { success: true, result: response.data };
    } catch (error) {
      throw new Error(`Failed to delete rows: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // 17. Add Columns
  async addColumns(spreadsheetId, sheetId, startIndex, endIndex) {
    try {
      const response = await axios.post(`${this.baseUrl}/${spreadsheetId}:batchUpdate`,
        {
          requests: [{
            insertDimension: {
              range: {
                sheetId,
                dimension: 'COLUMNS',
                startIndex,
                endIndex,
              },
            },
          }],
        },
        { headers: this.getHeaders() }
      );
      return { success: true, result: response.data };
    } catch (error) {
      throw new Error(`Failed to add columns: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // 18. Delete Columns
  async deleteColumns(spreadsheetId, sheetId, startIndex, endIndex) {
    try {
      const response = await axios.post(`${this.baseUrl}/${spreadsheetId}:batchUpdate`,
        {
          requests: [{
            deleteDimension: {
              range: {
                sheetId,
                dimension: 'COLUMNS',
                startIndex,
                endIndex,
              },
            },
          }],
        },
        { headers: this.getHeaders() }
      );
      return { success: true, result: response.data };
    } catch (error) {
      throw new Error(`Failed to delete columns: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // 19. Format Cells
  async formatCells(spreadsheetId, sheetId, startRowIndex, endRowIndex, startColumnIndex, endColumnIndex, format) {
    try {
      const response = await axios.post(`${this.baseUrl}/${spreadsheetId}:batchUpdate`,
        {
          requests: [{
            repeatCell: {
              range: {
                sheetId,
                startRowIndex,
                endRowIndex,
                startColumnIndex,
                endColumnIndex,
              },
              cell: { userEnteredFormat: format },
              fields: 'userEnteredFormat',
            },
          }],
        },
        { headers: this.getHeaders() }
      );
      return { success: true, result: response.data };
    } catch (error) {
      throw new Error(`Failed to format cells: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // 20. Get Cell Format
  async getCellFormat(spreadsheetId, range) {
    try {
      const response = await axios.get(`${this.baseUrl}/${spreadsheetId}`, {
        headers: this.getHeaders(),
        params: {
          ranges: range,
          fields: 'sheets(data(rowData(values(userEnteredFormat))))',
        },
      });
      return { success: true, format: response.data };
    } catch (error) {
      throw new Error(`Failed to get cell format: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

module.exports = GoogleSheetsIntegration;
