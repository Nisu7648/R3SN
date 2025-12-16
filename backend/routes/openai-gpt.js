const express = require('express');
const router = express.Router();
const OpenAIIntegration = require('../integrations/openai-gpt');

const getOpenAI = (req) => new OpenAIIntegration({
  apiKey: req.body.apiKey || req.headers['x-openai-api-key']
});

router.post('/chat', async (req, res) => {
  try {
    const { messages, model, ...options } = req.body;
    const openai = getOpenAI(req);
    const result = await openai.createChatCompletion(messages, model, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/completion', async (req, res) => {
  try {
    const { prompt, model, ...options } = req.body;
    const openai = getOpenAI(req);
    const result = await openai.createCompletion(prompt, model, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/images/generate', async (req, res) => {
  try {
    const { prompt, size, n } = req.body;
    const openai = getOpenAI(req);
    const result = await openai.generateImage(prompt, size, n);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/images/edit', async (req, res) => {
  try {
    const { image, prompt, mask, size } = req.body;
    const openai = getOpenAI(req);
    const result = await openai.editImage(image, prompt, mask, size);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/images/variation', async (req, res) => {
  try {
    const { image, n, size } = req.body;
    const openai = getOpenAI(req);
    const result = await openai.createImageVariation(image, n, size);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/embeddings', async (req, res) => {
  try {
    const { input, model } = req.body;
    const openai = getOpenAI(req);
    const result = await openai.createEmbedding(input, model);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/audio/transcribe', async (req, res) => {
  try {
    const { file, ...options } = req.body;
    const openai = getOpenAI(req);
    const result = await openai.transcribeAudio(file, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/audio/translate', async (req, res) => {
  try {
    const { file, ...options } = req.body;
    const openai = getOpenAI(req);
    const result = await openai.translateAudio(file, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/audio/speech', async (req, res) => {
  try {
    const { text, voice, model } = req.body;
    const openai = getOpenAI(req);
    const result = await openai.createSpeech(text, voice, model);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/moderations', async (req, res) => {
  try {
    const { input } = req.body;
    const openai = getOpenAI(req);
    const result = await openai.moderateContent(input);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/fine-tunes', async (req, res) => {
  try {
    const { trainingFile, model } = req.body;
    const openai = getOpenAI(req);
    const result = await openai.createFineTune(trainingFile, model);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/fine-tunes', async (req, res) => {
  try {
    const openai = getOpenAI(req);
    const result = await openai.listFineTunes();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/fine-tunes/:jobId', async (req, res) => {
  try {
    const openai = getOpenAI(req);
    const result = await openai.getFineTune(req.params.jobId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/fine-tunes/:jobId/cancel', async (req, res) => {
  try {
    const openai = getOpenAI(req);
    const result = await openai.cancelFineTune(req.params.jobId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/models', async (req, res) => {
  try {
    const openai = getOpenAI(req);
    const result = await openai.listModels();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/models/:modelId', async (req, res) => {
  try {
    const openai = getOpenAI(req);
    const result = await openai.getModel(req.params.modelId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
