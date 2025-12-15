/**
 * Mailchimp API Routes
 * Email marketing automation endpoints
 */

const express = require('express');
const router = express.Router();
const MailchimpIntegration = require('../integrations/mailchimp');

const getMailchimp = (req) => {
  const config = {
    apiKey: req.body.apiKey || req.headers['x-mailchimp-api-key'],
    server: req.body.server || req.headers['x-mailchimp-server']
  };
  return new MailchimpIntegration(config);
};

// Lists/Audiences
router.get('/lists', async (req, res) => {
  try {
    const { count = 10, offset = 0 } = req.query;
    const mailchimp = getMailchimp(req);
    const result = await mailchimp.getLists(parseInt(count), parseInt(offset));
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/lists/:listId', async (req, res) => {
  try {
    const mailchimp = getMailchimp(req);
    const result = await mailchimp.getList(req.params.listId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Members
router.post('/lists/:listId/members', async (req, res) => {
  try {
    const { email, status, mergeFields, tags } = req.body;
    const mailchimp = getMailchimp(req);
    const result = await mailchimp.addMember(req.params.listId, email, status, mergeFields, tags);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/lists/:listId/members/:email', async (req, res) => {
  try {
    const mailchimp = getMailchimp(req);
    const result = await mailchimp.getMember(req.params.listId, req.params.email);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/lists/:listId/members/:email', async (req, res) => {
  try {
    const mailchimp = getMailchimp(req);
    const result = await mailchimp.updateMember(req.params.listId, req.params.email, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/lists/:listId/members/:email', async (req, res) => {
  try {
    const mailchimp = getMailchimp(req);
    const result = await mailchimp.removeMember(req.params.listId, req.params.email);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Campaigns
router.post('/campaigns', async (req, res) => {
  try {
    const { type, listId, subject, fromName, replyTo, settings } = req.body;
    const mailchimp = getMailchimp(req);
    const result = await mailchimp.createCampaign(type, listId, subject, fromName, replyTo, settings);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/campaigns', async (req, res) => {
  try {
    const { count = 10, offset = 0, status } = req.query;
    const mailchimp = getMailchimp(req);
    const result = await mailchimp.getCampaigns(parseInt(count), parseInt(offset), status);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/campaigns/:campaignId/content', async (req, res) => {
  try {
    const { html, plainText } = req.body;
    const mailchimp = getMailchimp(req);
    const result = await mailchimp.setCampaignContent(req.params.campaignId, html, plainText);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/campaigns/:campaignId/send', async (req, res) => {
  try {
    const mailchimp = getMailchimp(req);
    const result = await mailchimp.sendCampaign(req.params.campaignId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/campaigns/:campaignId/report', async (req, res) => {
  try {
    const mailchimp = getMailchimp(req);
    const result = await mailchimp.getCampaignReport(req.params.campaignId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Templates
router.post('/templates', async (req, res) => {
  try {
    const { name, html } = req.body;
    const mailchimp = getMailchimp(req);
    const result = await mailchimp.createTemplate(name, html);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/templates', async (req, res) => {
  try {
    const { count = 10, offset = 0 } = req.query;
    const mailchimp = getMailchimp(req);
    const result = await mailchimp.getTemplates(parseInt(count), parseInt(offset));
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Automations
router.get('/automations', async (req, res) => {
  try {
    const { count = 10, offset = 0 } = req.query;
    const mailchimp = getMailchimp(req);
    const result = await mailchimp.getAutomations(parseInt(count), parseInt(offset));
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/automations/:workflowId/pause', async (req, res) => {
  try {
    const mailchimp = getMailchimp(req);
    const result = await mailchimp.pauseAutomation(req.params.workflowId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
