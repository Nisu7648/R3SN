const express = require('express');
const router = express.Router();
const DatabricksPlatformIntegration = require('../integrations/databricks-platform');

const getDatabricks = (req) => new DatabricksPlatformIntegration({
  host: req.body.host || req.headers['x-databricks-host'],
  token: req.body.token || req.headers['x-databricks-token']
});

router.post('/clusters', async (req, res) => {
  try {
    const { clusterName, sparkVersion, nodeTypeId, numWorkers } = req.body;
    const databricks = getDatabricks(req);
    const result = await databricks.createCluster(clusterName, sparkVersion, nodeTypeId, numWorkers);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/clusters', async (req, res) => {
  try {
    const databricks = getDatabricks(req);
    const result = await databricks.listClusters();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/clusters/:clusterId', async (req, res) => {
  try {
    const databricks = getDatabricks(req);
    const result = await databricks.getCluster(req.params.clusterId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/clusters/:clusterId/start', async (req, res) => {
  try {
    const databricks = getDatabricks(req);
    const result = await databricks.startCluster(req.params.clusterId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/clusters/:clusterId/terminate', async (req, res) => {
  try {
    const databricks = getDatabricks(req);
    const result = await databricks.terminateCluster(req.params.clusterId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/jobs', async (req, res) => {
  try {
    const { jobName, tasks } = req.body;
    const databricks = getDatabricks(req);
    const result = await databricks.createJob(jobName, tasks);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/jobs', async (req, res) => {
  try {
    const databricks = getDatabricks(req);
    const result = await databricks.listJobs();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/jobs/:jobId/run', async (req, res) => {
  try {
    const databricks = getDatabricks(req);
    const result = await databricks.runJob(req.params.jobId, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/jobs/runs/:runId', async (req, res) => {
  try {
    const databricks = getDatabricks(req);
    const result = await databricks.getJobRun(req.params.runId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/jobs/runs/:runId/cancel', async (req, res) => {
  try {
    const databricks = getDatabricks(req);
    const result = await databricks.cancelJobRun(req.params.runId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/dbfs/upload', async (req, res) => {
  try {
    const { path, content } = req.body;
    const databricks = getDatabricks(req);
    const result = await databricks.uploadFile(path, content);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/dbfs/read', async (req, res) => {
  try {
    const { path } = req.query;
    const databricks = getDatabricks(req);
    const result = await databricks.readFile(path);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/dbfs/list', async (req, res) => {
  try {
    const { path } = req.query;
    const databricks = getDatabricks(req);
    const result = await databricks.listFiles(path);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/dbfs/delete', async (req, res) => {
  try {
    const { path } = req.body;
    const databricks = getDatabricks(req);
    const result = await databricks.deleteFile(path);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/sql/execute', async (req, res) => {
  try {
    const { warehouseId, statement } = req.body;
    const databricks = getDatabricks(req);
    const result = await databricks.executeSQL(warehouseId, statement);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/sql/statements/:statementId', async (req, res) => {
  try {
    const databricks = getDatabricks(req);
    const result = await databricks.getStatementResult(req.params.statementId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/workspace/notebooks', async (req, res) => {
  try {
    const { path, language } = req.body;
    const databricks = getDatabricks(req);
    const result = await databricks.createNotebook(path, language);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/workspace/notebooks', async (req, res) => {
  try {
    const { path } = req.query;
    const databricks = getDatabricks(req);
    const result = await databricks.listNotebooks(path);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/workspace/notebooks/export', async (req, res) => {
  try {
    const { path, format } = req.query;
    const databricks = getDatabricks(req);
    const result = await databricks.exportNotebook(path, format);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/workspace/notebooks/import', async (req, res) => {
  try {
    const { path, content, language } = req.body;
    const databricks = getDatabricks(req);
    const result = await databricks.importNotebook(path, content, language);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
