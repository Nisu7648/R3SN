/**
 * Trello Integration API Routes
 * 15 endpoints for complete Trello functionality
 */

const express = require('express');
const router = express.Router();
const TrelloIntegration = require('../../integrations/trello');
const { authenticate } = require('../../middleware/auth');

const initTrelloClient = (req, res, next) => {
  const apiKey = req.body.apiKey || req.query.apiKey || req.headers['x-trello-key'];
  const token = req.body.token || req.query.token || req.headers['x-trello-token'];
  if (!apiKey || !token) return res.status(400).json({ success: false, error: 'Trello API key and token are required' });
  req.trelloClient = new TrelloIntegration(apiKey, token);
  next();
};

router.get('/boards/list', authenticate, initTrelloClient, async (req, res, next) => {
  try {
    const result = await req.trelloClient.listBoards();
    res.json(result);
  } catch (error) { next(error); }
});

router.post('/boards/create', authenticate, initTrelloClient, async (req, res, next) => {
  try {
    const { name, ...options } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Name is required' });
    const result = await req.trelloClient.createBoard(name, options);
    res.json(result);
  } catch (error) { next(error); }
});

router.get('/boards/:id', authenticate, initTrelloClient, async (req, res, next) => {
  try {
    const result = await req.trelloClient.getBoard(req.params.id);
    res.json(result);
  } catch (error) { next(error); }
});

router.get('/boards/:id/lists', authenticate, initTrelloClient, async (req, res, next) => {
  try {
    const result = await req.trelloClient.listLists(req.params.id);
    res.json(result);
  } catch (error) { next(error); }
});

router.post('/lists/create', authenticate, initTrelloClient, async (req, res, next) => {
  try {
    const { name, idBoard, ...options } = req.body;
    if (!name || !idBoard) return res.status(400).json({ success: false, error: 'Name and board ID are required' });
    const result = await req.trelloClient.createList(name, idBoard, options);
    res.json(result);
  } catch (error) { next(error); }
});

router.get('/lists/:id/cards', authenticate, initTrelloClient, async (req, res, next) => {
  try {
    const result = await req.trelloClient.listCards(req.params.id);
    res.json(result);
  } catch (error) { next(error); }
});

router.post('/cards/create', authenticate, initTrelloClient, async (req, res, next) => {
  try {
    const { name, idList, ...options } = req.body;
    if (!name || !idList) return res.status(400).json({ success: false, error: 'Name and list ID are required' });
    const result = await req.trelloClient.createCard(name, idList, options);
    res.json(result);
  } catch (error) { next(error); }
});

router.get('/cards/:id', authenticate, initTrelloClient, async (req, res, next) => {
  try {
    const result = await req.trelloClient.getCard(req.params.id);
    res.json(result);
  } catch (error) { next(error); }
});

router.put('/cards/:id', authenticate, initTrelloClient, async (req, res, next) => {
  try {
    const result = await req.trelloClient.updateCard(req.params.id, req.body);
    res.json(result);
  } catch (error) { next(error); }
});

router.delete('/cards/:id', authenticate, initTrelloClient, async (req, res, next) => {
  try {
    const result = await req.trelloClient.deleteCard(req.params.id);
    res.json(result);
  } catch (error) { next(error); }
});

router.post('/cards/:id/members', authenticate, initTrelloClient, async (req, res, next) => {
  try {
    const { memberId } = req.body;
    if (!memberId) return res.status(400).json({ success: false, error: 'Member ID is required' });
    const result = await req.trelloClient.addMember(req.params.id, memberId);
    res.json(result);
  } catch (error) { next(error); }
});

router.post('/cards/:id/labels', authenticate, initTrelloClient, async (req, res, next) => {
  try {
    const { labelId } = req.body;
    if (!labelId) return res.status(400).json({ success: false, error: 'Label ID is required' });
    const result = await req.trelloClient.addLabel(req.params.id, labelId);
    res.json(result);
  } catch (error) { next(error); }
});

router.post('/cards/:id/checklists', authenticate, initTrelloClient, async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Name is required' });
    const result = await req.trelloClient.addChecklist(req.params.id, name);
    res.json(result);
  } catch (error) { next(error); }
});

router.post('/cards/:id/attachments', authenticate, initTrelloClient, async (req, res, next) => {
  try {
    const { url, ...options } = req.body;
    if (!url) return res.status(400).json({ success: false, error: 'URL is required' });
    const result = await req.trelloClient.addAttachment(req.params.id, url, options);
    res.json(result);
  } catch (error) { next(error); }
});

router.post('/cards/:id/comments', authenticate, initTrelloClient, async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, error: 'Text is required' });
    const result = await req.trelloClient.addComment(req.params.id, text);
    res.json(result);
  } catch (error) { next(error); }
});

module.exports = router;
