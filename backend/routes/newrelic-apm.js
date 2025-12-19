const express = require('express');
const router = express.Router();
const NewRelicAPMIntegration = require('../integrations/newrelic-apm');

const getNewRelic = (req) => new NewRelicAPMIntegration({
  apiKey: req.body.apiKey || req.headers['x-newrelic-api-key'],
  accountId: req.body.accountId || req.headers['x-newrelic-account-id']
});

router.get('/applications', async (req, res) => {
  try {
    const newrelic = getNewRelic(req);
    const result = await newrelic.listApplications();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/applications/:appId', async (req, res) => {
  try {
    const newrelic = getNewRelic(req);
    const result = await newrelic.getApplication(req.params.appId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/applications/:appId/metrics', async (req, res) => {
  try {
    const { names, values } = req.body;
    const newrelic = getNewRelic(req);
    const result = await newrelic.getApplicationMetrics(req.params.appId, names, values);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/applications/:appId/transactions', async (req, res) => {
  try {
    const newrelic = getNewRelic(req);
    const result = await newrelic.getTransactions(req.params.appId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/applications/:appId/errors', async (req, res) => {
  try {
    const newrelic = getNewRelic(req);
    const result = await newrelic.getErrors(req.params.appId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/applications/:appId/hosts', async (req, res) => {
  try {
    const newrelic = getNewRelic(req);
    const result = await newrelic.getHosts(req.params.appId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/applications/:appId/instances', async (req, res) => {
  try {
    const newrelic = getNewRelic(req);
    const result = await newrelic.getInstances(req.params.appId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/alerts/policies/:policyId/conditions', async (req, res) => {
  try {
    const newrelic = getNewRelic(req);
    const result = await newrelic.createAlert(req.params.policyId, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/alerts/policies', async (req, res) => {
  try {
    const newrelic = getNewRelic(req);
    const result = await newrelic.listAlertPolicies();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/alerts/policies/:policyId', async (req, res) => {
  try {
    const newrelic = getNewRelic(req);
    const result = await newrelic.getAlertPolicy(req.params.policyId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/alerts/policies', async (req, res) => {
  try {
    const { name, incidentPreference } = req.body;
    const newrelic = getNewRelic(req);
    const result = await newrelic.createAlertPolicy(name, incidentPreference);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/dashboards', async (req, res) => {
  try {
    const newrelic = getNewRelic(req);
    const result = await newrelic.listDashboards();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/dashboards/:dashboardId', async (req, res) => {
  try {
    const newrelic = getNewRelic(req);
    const result = await newrelic.getDashboard(req.params.dashboardId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/dashboards', async (req, res) => {
  try {
    const newrelic = getNewRelic(req);
    const result = await newrelic.createDashboard(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/nrql', async (req, res) => {
  try {
    const { query } = req.body;
    const newrelic = getNewRelic(req);
    const result = await newrelic.runNRQL(query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/infrastructure/hosts', async (req, res) => {
  try {
    const newrelic = getNewRelic(req);
    const result = await newrelic.getInfrastructureHosts();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/synthetics/monitors', async (req, res) => {
  try {
    const newrelic = getNewRelic(req);
    const result = await newrelic.getSyntheticMonitors();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/synthetics/monitors', async (req, res) => {
  try {
    const newrelic = getNewRelic(req);
    const result = await newrelic.createSyntheticMonitor(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
