const express = require('express');
const router = express.Router();
const ResendIntegration = require('../integrations/resend-email');

const getResend = (req) => new ResendIntegration({
  apiKey: req.body.apiKey || req.headers['x-resend-api-key']
});

router.post('/send', async (req, res) => {
  try {
    const { from, to, subject, html, ...options } = req.body;
    const resend = getResend(req);
    const result = await resend.sendEmail(from, to, subject, html, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/send-batch', async (req, res) => {
  try {
    const { emails } = req.body;
    const resend = getResend(req);
    const result = await resend.sendBatch(emails);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/emails/:emailId', async (req, res) => {
  try {
    const resend = getResend(req);
    const result = await resend.getEmail(req.params.emailId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/domains', async (req, res) => {
  try {
    const { name } = req.body;
    const resend = getResend(req);
    const result = await resend.createDomain(name);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/domains/:domainId', async (req, res) => {
  try {
    const resend = getResend(req);
    const result = await resend.getDomain(req.params.domainId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/domains', async (req, res) => {
  try {
    const resend = getResend(req);
    const result = await resend.listDomains();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/domains/:domainId/verify', async (req, res) => {
  try {
    const resend = getResend(req);
    const result = await resend.verifyDomain(req.params.domainId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/domains/:domainId', async (req, res) => {
  try {
    const resend = getResend(req);
    const result = await resend.deleteDomain(req.params.domainId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/api-keys', async (req, res) => {
  try {
    const { name, permission } = req.body;
    const resend = getResend(req);
    const result = await resend.createApiKey(name, permission);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/api-keys', async (req, res) => {
  try {
    const resend = getResend(req);
    const result = await resend.listApiKeys();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/api-keys/:apiKeyId', async (req, res) => {
  try {
    const resend = getResend(req);
    const result = await resend.deleteApiKey(req.params.apiKeyId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
