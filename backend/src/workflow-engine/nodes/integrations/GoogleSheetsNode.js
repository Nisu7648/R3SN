/**
 * Google Sheets Node - Real Google Sheets API Integration
 * Read, write, update spreadsheet data
 */

const { google } = require('googleapis');

class GoogleSheetsNode {
  constructor() {
    this.type = 'google.sheets';
    this.name = 'Google Sheets';
    this.description = 'Read and write data to Google Sheets';
    this.category = 'productivity';
    this.icon = '📊';
    this.color = '#0F9D58';

    this.parameters = [
      {
        name: 'credentials',
        type: 'json',
        required: true,
        sensitive: true,
        description: 'Google Service Account JSON credentials'
      },
      {
        name: 'action',
        type: 'select',
        required: true,
        options: [
          'read_range',
          'write_range',
          'append_row',
          'update_cell',
          'clear_range',
          'get_sheet_info'
        ],
        description: 'Action to perform'
      },
      {
        name: 'spreadsheetId',
        type: 'string',
        required: true,
        description: 'Spreadsheet ID from URL'
      },
      {
        name: 'range',
        type: 'string',
        required: false,
        placeholder: 'Sheet1!A1:D10',
        description: 'Range in A1 notation'
      },
      {
        name: 'values',
        type: 'array',
        required: false,
        description: 'Values to write (2D array)'
      },
      {
        name: 'row',
        type: 'array',
        required: false,
        description: 'Row data to append'
      },
      {
        name: 'cell',
        type: 'string',
        required: false,
        description: 'Cell address (e.g., A1)'
      },
      {
        name: 'value',
        type: 'string',
        required: false,
        description: 'Value to write to cell'
      }
    ];
  }

  async execute(inputs, parameters, context) {
    const {
      credentials,
      action,
      spreadsheetId,
      range,
      values,
      row,
      cell,
      value
    } = parameters;

    if (!credentials) {
      throw new Error('Google credentials are required');
    }

    if (!spreadsheetId) {
      throw new Error('Spreadsheet ID is required');
    }

    try {
      // Parse credentials if string
      const creds = typeof credentials === 'string' 
        ? JSON.parse(credentials) 
        : credentials;

      // Create auth client
      const auth = new google.auth.GoogleAuth({
        credentials: creds,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      });

      const sheets = google.sheets({ version: 'v4', auth });

      switch (action) {
        case 'read_range':
          return await this.readRange(sheets, spreadsheetId, range);
        
        case 'write_range':
          return await this.writeRange(sheets, spreadsheetId, range, values);
        
        case 'append_row':
          return await this.appendRow(sheets, spreadsheetId, range, row);
        
        case 'update_cell':
          return await this.updateCell(sheets, spreadsheetId, cell, value);
        
        case 'clear_range':
          return await this.clearRange(sheets, spreadsheetId, range);
        
        case 'get_sheet_info':
          return await this.getSheetInfo(sheets, spreadsheetId);
        
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      throw new Error(`Google Sheets error: ${error.message}`);
    }
  }

  async readRange(sheets, spreadsheetId, range) {
    if (!range) throw new Error('Range is required');

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range
    });
    
    return {
      success: true,
      values: response.data.values || [],
      range: response.data.range
    };
  }

  async writeRange(sheets, spreadsheetId, range, values) {
    if (!range || !values) {
      throw new Error('Range and values are required');
    }

    const response = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values
      }
    });
    
    return {
      success: true,
      updatedCells: response.data.updatedCells,
      updatedRange: response.data.updatedRange
    };
  }

  async appendRow(sheets, spreadsheetId, range, row) {
    if (!range || !row) {
      throw new Error('Range and row data are required');
    }

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row]
      }
    });
    
    return {
      success: true,
      updatedCells: response.data.updates.updatedCells,
      updatedRange: response.data.updates.updatedRange
    };
  }

  async updateCell(sheets, spreadsheetId, cell, value) {
    if (!cell || value === undefined) {
      throw new Error('Cell and value are required');
    }

    const response = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: cell,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[value]]
      }
    });
    
    return {
      success: true,
      updatedCells: response.data.updatedCells,
      updatedRange: response.data.updatedRange
    };
  }

  async clearRange(sheets, spreadsheetId, range) {
    if (!range) throw new Error('Range is required');

    const response = await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range
    });
    
    return {
      success: true,
      clearedRange: response.data.clearedRange
    };
  }

  async getSheetInfo(sheets, spreadsheetId) {
    const response = await sheets.spreadsheets.get({
      spreadsheetId
    });
    
    return {
      success: true,
      spreadsheet: {
        title: response.data.properties.title,
        locale: response.data.properties.locale,
        sheets: response.data.sheets.map(s => ({
          title: s.properties.title,
          sheetId: s.properties.sheetId,
          index: s.properties.index
        }))
      }
    };
  }
}

module.exports = GoogleSheetsNode;
