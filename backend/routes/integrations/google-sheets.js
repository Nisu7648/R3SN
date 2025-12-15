/**
 * Google Sheets Integration API Routes
 * 20 endpoints for complete Google Sheets functionality
 */

const express = require('express');
const router = express.Router();
const GoogleSheetsIntegration = require('../../integrations/google-sheets');
const { authenticate } = require('../../middleware/auth');

const initSheetsClient = (req, res, next) => {
  const token = req.body.token || req.query.token || req.headers['x-sheets-token'];
  if (!token) return res.status(400).json({ success: false, error: 'Google Sheets access token is required' });
  req.sheetsClient = new GoogleSheetsIntegration(token);
  next();
};

// 1-3: Spreadsheet Operations
router.get('/:spreadsheetId', authenticate, initSheetsClient, async (req, res, next) => {
  try {
    const result = await req.sheetsClient.getSpreadsheet(req.params.spreadsheetId, req.query);
    res.json(result);
  } catch (error) { next(error); }
});

router.post('/create', authenticate, initSheetsClient, async (req, res, next) => {
  try {
    const { title, sheets } = req.body;
    if (!title) return res.status(400).json({ success: false, error: 'Title is required' });
    const result = await req.sheetsClient.createSpreadsheet(title, sheets);
    res.json(result);
  } catch (error) { next(error); }
});

router.post('/:spreadsheetId/update', authenticate, initSheetsClient, async (req, res, next) => {
  try {
    const { requests } = req.body;
    if (!requests) return res.status(400).json({ success: false, error: 'Requests are required' });
    const result = await req.sheetsClient.updateSpreadsheet(req.params.spreadsheetId, requests);
    res.json(result);
  } catch (error) { next(error); }
});

// 4-7: Value Operations
router.get('/:spreadsheetId/values/:range', authenticate, initSheetsClient, async (req, res, next) => {
  try {
    const result = await req.sheetsClient.getValues(req.params.spreadsheetId, req.params.range);
    res.json(result);
  } catch (error) { next(error); }
});

router.put('/:spreadsheetId/values/:range', authenticate, initSheetsClient, async (req, res, next) => {
  try {
    const { values, valueInputOption } = req.body;
    if (!values) return res.status(400).json({ success: false, error: 'Values are required' });
    const result = await req.sheetsClient.updateValues(req.params.spreadsheetId, req.params.range, values, valueInputOption);
    res.json(result);
  } catch (error) { next(error); }
});

router.post('/:spreadsheetId/values/:range/append', authenticate, initSheetsClient, async (req, res, next) => {
  try {
    const { values, valueInputOption } = req.body;
    if (!values) return res.status(400).json({ success: false, error: 'Values are required' });
    const result = await req.sheetsClient.appendValues(req.params.spreadsheetId, req.params.range, values, valueInputOption);
    res.json(result);
  } catch (error) { next(error); }
});

router.post('/:spreadsheetId/values/:range/clear', authenticate, initSheetsClient, async (req, res, next) => {
  try {
    const result = await req.sheetsClient.clearValues(req.params.spreadsheetId, req.params.range);
    res.json(result);
  } catch (error) { next(error); }
});

// 8-9: Batch Operations
router.get('/:spreadsheetId/values/batchGet', authenticate, initSheetsClient, async (req, res, next) => {
  try {
    const { ranges } = req.query;
    if (!ranges) return res.status(400).json({ success: false, error: 'Ranges are required' });
    const result = await req.sheetsClient.batchGet(req.params.spreadsheetId, ranges);
    res.json(result);
  } catch (error) { next(error); }
});

router.post('/:spreadsheetId/values/batchUpdate', authenticate, initSheetsClient, async (req, res, next) => {
  try {
    const { data, valueInputOption } = req.body;
    if (!data) return res.status(400).json({ success: false, error: 'Data is required' });
    const result = await req.sheetsClient.batchUpdate(req.params.spreadsheetId, data, valueInputOption);
    res.json(result);
  } catch (error) { next(error); }
});

// 10-14: Sheet Management
router.post('/:spreadsheetId/sheets/create', authenticate, initSheetsClient, async (req, res, next) => {
  try {
    const { title, ...options } = req.body;
    if (!title) return res.status(400).json({ success: false, error: 'Title is required' });
    const result = await req.sheetsClient.createSheet(req.params.spreadsheetId, title, options);
    res.json(result);
  } catch (error) { next(error); }
});

router.delete('/:spreadsheetId/sheets/:sheetId', authenticate, initSheetsClient, async (req, res, next) => {
  try {
    const result = await req.sheetsClient.deleteSheet(req.params.spreadsheetId, parseInt(req.params.sheetId));
    res.json(result);
  } catch (error) { next(error); }
});

router.post('/:spreadsheetId/sheets/:sheetId/copy', authenticate, initSheetsClient, async (req, res, next) => {
  try {
    const { destinationSpreadsheetId } = req.body;
    if (!destinationSpreadsheetId) return res.status(400).json({ success: false, error: 'Destination spreadsheet ID is required' });
    const result = await req.sheetsClient.copySheet(req.params.spreadsheetId, parseInt(req.params.sheetId), destinationSpreadsheetId);
    res.json(result);
  } catch (error) { next(error); }
});

router.get('/:spreadsheetId/sheets/:sheetId/properties', authenticate, initSheetsClient, async (req, res, next) => {
  try {
    const result = await req.sheetsClient.getSheetProperties(req.params.spreadsheetId, parseInt(req.params.sheetId));
    res.json(result);
  } catch (error) { next(error); }
});

router.patch('/:spreadsheetId/sheets/:sheetId/properties', authenticate, initSheetsClient, async (req, res, next) => {
  try {
    const result = await req.sheetsClient.updateSheetProperties(req.params.spreadsheetId, parseInt(req.params.sheetId), req.body);
    res.json(result);
  } catch (error) { next(error); }
});

// 15-18: Row/Column Operations
router.post('/:spreadsheetId/sheets/:sheetId/rows/add', authenticate, initSheetsClient, async (req, res, next) => {
  try {
    const { startIndex, endIndex } = req.body;
    if (startIndex === undefined || endIndex === undefined) return res.status(400).json({ success: false, error: 'Start and end index are required' });
    const result = await req.sheetsClient.addRows(req.params.spreadsheetId, parseInt(req.params.sheetId), startIndex, endIndex);
    res.json(result);
  } catch (error) { next(error); }
});

router.delete('/:spreadsheetId/sheets/:sheetId/rows', authenticate, initSheetsClient, async (req, res, next) => {
  try {
    const { startIndex, endIndex } = req.body;
    if (startIndex === undefined || endIndex === undefined) return res.status(400).json({ success: false, error: 'Start and end index are required' });
    const result = await req.sheetsClient.deleteRows(req.params.spreadsheetId, parseInt(req.params.sheetId), startIndex, endIndex);
    res.json(result);
  } catch (error) { next(error); }
});

router.post('/:spreadsheetId/sheets/:sheetId/columns/add', authenticate, initSheetsClient, async (req, res, next) => {
  try {
    const { startIndex, endIndex } = req.body;
    if (startIndex === undefined || endIndex === undefined) return res.status(400).json({ success: false, error: 'Start and end index are required' });
    const result = await req.sheetsClient.addColumns(req.params.spreadsheetId, parseInt(req.params.sheetId), startIndex, endIndex);
    res.json(result);
  } catch (error) { next(error); }
});

router.delete('/:spreadsheetId/sheets/:sheetId/columns', authenticate, initSheetsClient, async (req, res, next) => {
  try {
    const { startIndex, endIndex } = req.body;
    if (startIndex === undefined || endIndex === undefined) return res.status(400).json({ success: false, error: 'Start and end index are required' });
    const result = await req.sheetsClient.deleteColumns(req.params.spreadsheetId, parseInt(req.params.sheetId), startIndex, endIndex);
    res.json(result);
  } catch (error) { next(error); }
});

// 19-20: Formatting
router.post('/:spreadsheetId/sheets/:sheetId/format', authenticate, initSheetsClient, async (req, res, next) => {
  try {
    const { startRowIndex, endRowIndex, startColumnIndex, endColumnIndex, format } = req.body;
    if (startRowIndex === undefined || endRowIndex === undefined || startColumnIndex === undefined || endColumnIndex === undefined || !format) {
      return res.status(400).json({ success: false, error: 'All range parameters and format are required' });
    }
    const result = await req.sheetsClient.formatCells(req.params.spreadsheetId, parseInt(req.params.sheetId), startRowIndex, endRowIndex, startColumnIndex, endColumnIndex, format);
    res.json(result);
  } catch (error) { next(error); }
});

router.get('/:spreadsheetId/format/:range', authenticate, initSheetsClient, async (req, res, next) => {
  try {
    const result = await req.sheetsClient.getCellFormat(req.params.spreadsheetId, req.params.range);
    res.json(result);
  } catch (error) { next(error); }
});

module.exports = router;
