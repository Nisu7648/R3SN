const express = require('express');
const router = express.Router();
const AWSLambdaIntegration = require('../integrations/aws-lambda');

const getLambda = (req) => new AWSLambdaIntegration({
  accessKeyId: req.body.accessKeyId || req.headers['x-aws-access-key-id'],
  secretAccessKey: req.body.secretAccessKey || req.headers['x-aws-secret-access-key'],
  region: req.body.region || req.headers['x-aws-region']
});

router.get('/functions', async (req, res) => {
  try {
    const { maxItems } = req.query;
    const lambda = getLambda(req);
    const result = await lambda.listFunctions(parseInt(maxItems) || 50);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/functions/:functionName', async (req, res) => {
  try {
    const lambda = getLambda(req);
    const result = await lambda.getFunction(req.params.functionName);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/functions', async (req, res) => {
  try {
    const { functionName, runtime, handler, code, role, ...options } = req.body;
    const lambda = getLambda(req);
    const result = await lambda.createFunction(functionName, runtime, handler, code, role, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/functions/:functionName/code', async (req, res) => {
  try {
    const lambda = getLambda(req);
    const result = await lambda.updateFunctionCode(req.params.functionName, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/functions/:functionName/configuration', async (req, res) => {
  try {
    const lambda = getLambda(req);
    const result = await lambda.updateFunctionConfiguration(req.params.functionName, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/functions/:functionName/invoke', async (req, res) => {
  try {
    const { payload, invocationType } = req.body;
    const lambda = getLambda(req);
    const result = await lambda.invokeFunction(req.params.functionName, payload, invocationType);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/functions/:functionName', async (req, res) => {
  try {
    const lambda = getLambda(req);
    const result = await lambda.deleteFunction(req.params.functionName);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/functions/:functionName/aliases', async (req, res) => {
  try {
    const { aliasName, version } = req.body;
    const lambda = getLambda(req);
    const result = await lambda.createAlias(req.params.functionName, aliasName, version);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/functions/:functionName/aliases', async (req, res) => {
  try {
    const lambda = getLambda(req);
    const result = await lambda.listAliases(req.params.functionName);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/functions/:functionName/versions', async (req, res) => {
  try {
    const { description } = req.body;
    const lambda = getLambda(req);
    const result = await lambda.publishVersion(req.params.functionName, description);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/functions/:functionName/versions', async (req, res) => {
  try {
    const lambda = getLambda(req);
    const result = await lambda.listVersions(req.params.functionName);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/functions/:functionName/permissions', async (req, res) => {
  try {
    const { statementId, principal, action, sourceArn } = req.body;
    const lambda = getLambda(req);
    const result = await lambda.addPermission(req.params.functionName, statementId, principal, action, sourceArn);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/functions/:functionName/permissions/:statementId', async (req, res) => {
  try {
    const lambda = getLambda(req);
    const result = await lambda.removePermission(req.params.functionName, req.params.statementId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/functions/:functionName/policy', async (req, res) => {
  try {
    const lambda = getLambda(req);
    const result = await lambda.getPolicy(req.params.functionName);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/event-source-mappings', async (req, res) => {
  try {
    const { functionName, eventSourceArn, ...options } = req.body;
    const lambda = getLambda(req);
    const result = await lambda.createEventSourceMapping(functionName, eventSourceArn, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/event-source-mappings', async (req, res) => {
  try {
    const { functionName } = req.query;
    const lambda = getLambda(req);
    const result = await lambda.listEventSourceMappings(functionName);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/event-source-mappings/:uuid', async (req, res) => {
  try {
    const lambda = getLambda(req);
    const result = await lambda.deleteEventSourceMapping(req.params.uuid);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/account-settings', async (req, res) => {
  try {
    const lambda = getLambda(req);
    const result = await lambda.getAccountSettings();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
