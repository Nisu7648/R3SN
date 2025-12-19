const express = require('express');
const router = express.Router();
const SnowflakeDataIntegration = require('../integrations/snowflake-data');

const getSnowflake = (req) => new SnowflakeDataIntegration({
  account: req.body.account || req.headers['x-snowflake-account'],
  username: req.body.username || req.headers['x-snowflake-username'],
  password: req.body.password || req.headers['x-snowflake-password'],
  database: req.body.database || req.headers['x-snowflake-database'],
  schema: req.body.schema || req.headers['x-snowflake-schema'],
  warehouse: req.body.warehouse || req.headers['x-snowflake-warehouse']
});

router.post('/connect', async (req, res) => {
  try {
    const snowflake = getSnowflake(req);
    const result = await snowflake.connect();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/query', async (req, res) => {
  try {
    const { sqlText, binds } = req.body;
    const snowflake = getSnowflake(req);
    const result = await snowflake.executeQuery(sqlText, binds);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/tables', async (req, res) => {
  try {
    const { tableName, columns } = req.body;
    const snowflake = getSnowflake(req);
    const result = await snowflake.createTable(tableName, columns);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/tables/:tableName/insert', async (req, res) => {
  try {
    const { data } = req.body;
    const snowflake = getSnowflake(req);
    const result = await snowflake.insertData(req.params.tableName, data);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/tables/:tableName/select', async (req, res) => {
  try {
    const { where, limit } = req.query;
    const snowflake = getSnowflake(req);
    const result = await snowflake.selectData(req.params.tableName, where, parseInt(limit) || 100);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/tables/:tableName/update', async (req, res) => {
  try {
    const { updates, where } = req.body;
    const snowflake = getSnowflake(req);
    const result = await snowflake.updateData(req.params.tableName, updates, where);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/tables/:tableName/delete', async (req, res) => {
  try {
    const { where } = req.body;
    const snowflake = getSnowflake(req);
    const result = await snowflake.deleteData(req.params.tableName, where);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/databases', async (req, res) => {
  try {
    const { databaseName } = req.body;
    const snowflake = getSnowflake(req);
    const result = await snowflake.createDatabase(databaseName);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/schemas', async (req, res) => {
  try {
    const { schemaName } = req.body;
    const snowflake = getSnowflake(req);
    const result = await snowflake.createSchema(schemaName);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/warehouses', async (req, res) => {
  try {
    const { warehouseName, size } = req.body;
    const snowflake = getSnowflake(req);
    const result = await snowflake.createWarehouse(warehouseName, size);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/tables', async (req, res) => {
  try {
    const snowflake = getSnowflake(req);
    const result = await snowflake.listTables();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/databases', async (req, res) => {
  try {
    const snowflake = getSnowflake(req);
    const result = await snowflake.listDatabases();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/warehouses', async (req, res) => {
  try {
    const snowflake = getSnowflake(req);
    const result = await snowflake.listWarehouses();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/tables/:tableName/info', async (req, res) => {
  try {
    const snowflake = getSnowflake(req);
    const result = await snowflake.getTableInfo(req.params.tableName);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/tables/:tableName/copy', async (req, res) => {
  try {
    const { stageName, fileFormat } = req.body;
    const snowflake = getSnowflake(req);
    const result = await snowflake.copyIntoTable(req.params.tableName, stageName, fileFormat);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/stages', async (req, res) => {
  try {
    const { stageName, url } = req.body;
    const snowflake = getSnowflake(req);
    const result = await snowflake.createStage(stageName, url);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/disconnect', async (req, res) => {
  try {
    const snowflake = getSnowflake(req);
    const result = await snowflake.disconnect();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
