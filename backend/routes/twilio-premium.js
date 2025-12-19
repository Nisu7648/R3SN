const express = require('express');
const router = express.Router();
const TwilioPremiumIntegration = require('../integrations/twilio-premium');

const getTwilio = (req) => new TwilioPremiumIntegration({
  accountSid: req.body.accountSid || req.headers['x-twilio-account-sid'],
  authToken: req.body.authToken || req.headers['x-twilio-auth-token']
});

router.post('/sms', async (req, res) => {
  try {
    const { to, from, body } = req.body;
    const twilio = getTwilio(req);
    const result = await twilio.sendSMS(to, from, body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/whatsapp', async (req, res) => {
  try {
    const { to, from, body } = req.body;
    const twilio = getTwilio(req);
    const result = await twilio.sendWhatsApp(to, from, body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/call', async (req, res) => {
  try {
    const { to, from, url } = req.body;
    const twilio = getTwilio(req);
    const result = await twilio.makeCall(to, from, url);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/video/rooms', async (req, res) => {
  try {
    const { uniqueName, type } = req.body;
    const twilio = getTwilio(req);
    const result = await twilio.createVideoRoom(uniqueName, type);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/video/rooms', async (req, res) => {
  try {
    const twilio = getTwilio(req);
    const result = await twilio.getVideoRooms();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/video/token', async (req, res) => {
  try {
    const { identity, roomName } = req.body;
    const twilio = getTwilio(req);
    const result = await twilio.createAccessToken(identity, roomName);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/email', async (req, res) => {
  try {
    const { to, from, subject, text, html } = req.body;
    const twilio = getTwilio(req);
    const result = await twilio.sendEmail(to, from, subject, text, html);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/messages', async (req, res) => {
  try {
    const { limit } = req.query;
    const twilio = getTwilio(req);
    const result = await twilio.getMessages(parseInt(limit) || 20);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/calls', async (req, res) => {
  try {
    const { limit } = req.query;
    const twilio = getTwilio(req);
    const result = await twilio.getCalls(parseInt(limit) || 20);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/recordings', async (req, res) => {
  try {
    const { limit } = req.query;
    const twilio = getTwilio(req);
    const result = await twilio.getRecordings(parseInt(limit) || 20);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/verify/start', async (req, res) => {
  try {
    const { to, channel } = req.body;
    const twilio = getTwilio(req);
    const result = await twilio.createVerification(to, channel);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/verify/check', async (req, res) => {
  try {
    const { to, code } = req.body;
    const twilio = getTwilio(req);
    const result = await twilio.checkVerification(to, code);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/conversations', async (req, res) => {
  try {
    const { friendlyName } = req.body;
    const twilio = getTwilio(req);
    const result = await twilio.createConversation(friendlyName);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/conversations/:conversationSid/participants', async (req, res) => {
  try {
    const { identity } = req.body;
    const twilio = getTwilio(req);
    const result = await twilio.addParticipant(req.params.conversationSid, identity);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/conversations/:conversationSid/messages', async (req, res) => {
  try {
    const { author, body } = req.body;
    const twilio = getTwilio(req);
    const result = await twilio.sendConversationMessage(req.params.conversationSid, author, body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/account/balance', async (req, res) => {
  try {
    const twilio = getTwilio(req);
    const result = await twilio.getAccountBalance();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
