const express = require('express');
const router = express.Router();
const TelegramBotIntegration = require('../integrations/telegram-bot');

const getBot = (req) => new TelegramBotIntegration({
  token: req.body.token || req.headers['x-telegram-bot-token']
});

router.post('/send-message', async (req, res) => {
  try {
    const { chatId, text, options } = req.body;
    const bot = getBot(req);
    const result = await bot.sendMessage(chatId, text, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/send-photo', async (req, res) => {
  try {
    const { chatId, photo, options } = req.body;
    const bot = getBot(req);
    const result = await bot.sendPhoto(chatId, photo, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/send-document', async (req, res) => {
  try {
    const { chatId, document, options } = req.body;
    const bot = getBot(req);
    const result = await bot.sendDocument(chatId, document, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/send-video', async (req, res) => {
  try {
    const { chatId, video, options } = req.body;
    const bot = getBot(req);
    const result = await bot.sendVideo(chatId, video, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/send-audio', async (req, res) => {
  try {
    const { chatId, audio, options } = req.body;
    const bot = getBot(req);
    const result = await bot.sendAudio(chatId, audio, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/send-location', async (req, res) => {
  try {
    const { chatId, latitude, longitude, options } = req.body;
    const bot = getBot(req);
    const result = await bot.sendLocation(chatId, latitude, longitude, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/edit-message', async (req, res) => {
  try {
    const { text, options } = req.body;
    const bot = getBot(req);
    const result = await bot.editMessageText(text, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/delete-message', async (req, res) => {
  try {
    const { chatId, messageId } = req.body;
    const bot = getBot(req);
    const result = await bot.deleteMessage(chatId, messageId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/me', async (req, res) => {
  try {
    const bot = getBot(req);
    const result = await bot.getMe();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/chat/:chatId', async (req, res) => {
  try {
    const bot = getBot(req);
    const result = await bot.getChat(req.params.chatId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/chat/:chatId/member/:userId', async (req, res) => {
  try {
    const bot = getBot(req);
    const result = await bot.getChatMember(req.params.chatId, req.params.userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/chat/:chatId/kick/:userId', async (req, res) => {
  try {
    const bot = getBot(req);
    const result = await bot.kickChatMember(req.params.chatId, req.params.userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/chat/:chatId/unban/:userId', async (req, res) => {
  try {
    const bot = getBot(req);
    const result = await bot.unbanChatMember(req.params.chatId, req.params.userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/webhook', async (req, res) => {
  try {
    const { url, options } = req.body;
    const bot = getBot(req);
    const result = await bot.setWebhook(url, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/webhook', async (req, res) => {
  try {
    const bot = getBot(req);
    const result = await bot.deleteWebhook();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/webhook', async (req, res) => {
  try {
    const bot = getBot(req);
    const result = await bot.getWebhookInfo();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/send-poll', async (req, res) => {
  try {
    const { chatId, question, options, settings } = req.body;
    const bot = getBot(req);
    const result = await bot.sendPoll(chatId, question, options, settings);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/stop-poll', async (req, res) => {
  try {
    const { chatId, messageId } = req.body;
    const bot = getBot(req);
    const result = await bot.stopPoll(chatId, messageId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/send-invoice', async (req, res) => {
  try {
    const { chatId, title, description, payload, providerToken, currency, prices, options } = req.body;
    const bot = getBot(req);
    const result = await bot.sendInvoice(chatId, title, description, payload, providerToken, currency, prices, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/answer-callback', async (req, res) => {
  try {
    const { callbackQueryId, options } = req.body;
    const bot = getBot(req);
    const result = await bot.answerCallbackQuery(callbackQueryId, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
