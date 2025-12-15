const express = require('express');
const router = express.Router();
const ZendeskIntegration = require('../integrations/zendesk-support');

const getZendesk = (req) => new ZendeskIntegration({
  subdomain: req.body.subdomain || req.headers['x-zendesk-subdomain'],
  email: req.body.email || req.headers['x-zendesk-email'],
  apiToken: req.body.apiToken || req.headers['x-zendesk-api-token']
});

router.get('/tickets', async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const zendesk = getZendesk(req);
    const result = await zendesk.getTickets(page);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/tickets/:ticketId', async (req, res) => {
  try {
    const zendesk = getZendesk(req);
    const result = await zendesk.getTicket(req.params.ticketId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/tickets', async (req, res) => {
  try {
    const { subject, description, requesterEmail, priority } = req.body;
    const zendesk = getZendesk(req);
    const result = await zendesk.createTicket(subject, description, requesterEmail, priority);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/tickets/:ticketId', async (req, res) => {
  try {
    const zendesk = getZendesk(req);
    const result = await zendesk.updateTicket(req.params.ticketId, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/tickets/:ticketId', async (req, res) => {
  try {
    const zendesk = getZendesk(req);
    const result = await zendesk.deleteTicket(req.params.ticketId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/tickets/:ticketId/comments', async (req, res) => {
  try {
    const { body, isPublic } = req.body;
    const zendesk = getZendesk(req);
    const result = await zendesk.addComment(req.params.ticketId, body, isPublic);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const zendesk = getZendesk(req);
    const result = await zendesk.getUsers(page);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/users/:userId', async (req, res) => {
  try {
    const zendesk = getZendesk(req);
    const result = await zendesk.getUser(req.params.userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/users', async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const zendesk = getZendesk(req);
    const result = await zendesk.createUser(name, email, role);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/users/:userId', async (req, res) => {
  try {
    const zendesk = getZendesk(req);
    const result = await zendesk.updateUser(req.params.userId, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const zendesk = getZendesk(req);
    const result = await zendesk.searchTickets(query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/organizations', async (req, res) => {
  try {
    const zendesk = getZendesk(req);
    const result = await zendesk.getOrganizations();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
