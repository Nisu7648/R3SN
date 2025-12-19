const express = require('express');
const router = express.Router();
const SplunkEnterpriseIntegration = require('../integrations/splunk-enterprise');

const getSplunk = (req) => new SplunkEnterpriseIntegration({
  host: req.body.host || req.headers['x-splunk-host'],
  port: req.body.port || req.headers['x-splunk-port'],
  username: req.body.username || req.headers['x-splunk-username'],
  password: req.body.password || req.headers['x-splunk-password']
});

router.post('/authenticate', async (req, res) => {
  try {
    const splunk = getSplunk(req);
    const result = await splunk.authenticate();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/search', async (req, res) => {
  try {
    const { search, earliestTime, latestTime } = req.body;
    const splunk = getSplunk(req);
    const result = await splunk.createSearch(search, earliestTime, latestTime);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/search/:searchId/results', async (req, res) => {
  try {
    const splunk = getSplunk(req);
    const result = await splunk.getSearchResults(req.params.searchId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/search/:searchId/status', async (req, res) => {
  try {
    const splunk = getSplunk(req);
    const result = await splunk.getSearchStatus(req.params.searchId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/search/:searchId', async (req, res) => {
  try {
    const splunk = getSplunk(req);
    const result = await splunk.cancelSearch(req.params.searchId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/searches', async (req, res) => {
  try {
    const splunk = getSplunk(req);
    const result = await splunk.listSearches();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/index/data', async (req, res) => {
  try {
    const { index, sourcetype, data } = req.body;
    const splunk = getSplunk(req);
    const result = await splunk.indexData(index, sourcetype, data);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/indexes', async (req, res) => {
  try {
    const splunk = getSplunk(req);
    const result = await splunk.listIndexes();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/indexes', async (req, res) => {
  try {
    const { name, datatype } = req.body;
    const splunk = getSplunk(req);
    const result = await splunk.createIndex(name, datatype);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/indexes/:name', async (req, res) => {
  try {
    const splunk = getSplunk(req);
    const result = await splunk.deleteIndex(req.params.name);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/saved-searches', async (req, res) => {
  try {
    const { name, search } = req.body;
    const splunk = getSplunk(req);
    const result = await splunk.createSavedSearch(name, search);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/saved-searches', async (req, res) => {
  try {
    const splunk = getSplunk(req);
    const result = await splunk.listSavedSearches();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/saved-searches/:name', async (req, res) => {
  try {
    const splunk = getSplunk(req);
    const result = await splunk.getSavedSearch(req.params.name);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/saved-searches/:name', async (req, res) => {
  try {
    const splunk = getSplunk(req);
    const result = await splunk.deleteSavedSearch(req.params.name);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/alerts', async (req, res) => {
  try {
    const { name, search, alertType } = req.body;
    const splunk = getSplunk(req);
    const result = await splunk.createAlert(name, search, alertType);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/alerts', async (req, res) => {
  try {
    const splunk = getSplunk(req);
    const result = await splunk.listAlerts();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/dashboards', async (req, res) => {
  try {
    const { name, panels } = req.body;
    const splunk = getSplunk(req);
    const result = await splunk.createDashboard(name, panels);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/dashboards', async (req, res) => {
  try {
    const splunk = getSplunk(req);
    const result = await splunk.listDashboards();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/dashboards/:name', async (req, res) => {
  try {
    const splunk = getSplunk(req);
    const result = await splunk.getDashboard(req.params.name);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/users', async (req, res) => {
  try {
    const { name, password, roles } = req.body;
    const splunk = getSplunk(req);
    const result = await splunk.createUser(name, password, roles);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const splunk = getSplunk(req);
    const result = await splunk.listUsers();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/server/info', async (req, res) => {
  try {
    const splunk = getSplunk(req);
    const result = await splunk.getServerInfo();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/server/health', async (req, res) => {
  try {
    const splunk = getSplunk(req);
    const result = await splunk.getServerHealth();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
