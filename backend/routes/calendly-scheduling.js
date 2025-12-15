const express = require('express');
const router = express.Router();
const CalendlyIntegration = require('../integrations/calendly-scheduling');

const getCalendly = (req) => new CalendlyIntegration({
  apiKey: req.body.apiKey || req.headers['x-calendly-api-key']
});

router.get('/me', async (req, res) => {
  try {
    const calendly = getCalendly(req);
    const result = await calendly.getCurrentUser();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/event-types', async (req, res) => {
  try {
    const { userUri } = req.query;
    const calendly = getCalendly(req);
    const result = await calendly.getEventTypes(userUri);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/event-types/:uuid', async (req, res) => {
  try {
    const calendly = getCalendly(req);
    const result = await calendly.getEventType(req.params.uuid);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/scheduled-events', async (req, res) => {
  try {
    const { userUri, status } = req.query;
    const calendly = getCalendly(req);
    const result = await calendly.getScheduledEvents(userUri, status);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/scheduled-events/:uuid', async (req, res) => {
  try {
    const calendly = getCalendly(req);
    const result = await calendly.getScheduledEvent(req.params.uuid);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/scheduled-events/:uuid/invitees', async (req, res) => {
  try {
    const calendly = getCalendly(req);
    const result = await calendly.getEventInvitees(req.params.uuid);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/invitees/:uuid', async (req, res) => {
  try {
    const calendly = getCalendly(req);
    const result = await calendly.getInvitee(req.params.uuid);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/scheduled-events/:uuid/cancel', async (req, res) => {
  try {
    const { reason } = req.body;
    const calendly = getCalendly(req);
    const result = await calendly.cancelEvent(req.params.uuid, reason);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/webhooks', async (req, res) => {
  try {
    const { url, events, userUri, scope } = req.body;
    const calendly = getCalendly(req);
    const result = await calendly.createWebhook(url, events, userUri, scope);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/webhooks', async (req, res) => {
  try {
    const { scope, organization } = req.query;
    const calendly = getCalendly(req);
    const result = await calendly.getWebhooks(scope, organization);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/webhooks/:uuid', async (req, res) => {
  try {
    const calendly = getCalendly(req);
    const result = await calendly.deleteWebhook(req.params.uuid);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
