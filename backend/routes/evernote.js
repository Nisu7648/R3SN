const express = require('express');
const router = express.Router();
const EvernoteIntegration = require('../integrations/evernote');

const getEvernote = (req) => new EvernoteIntegration({
  token: req.body.token || req.headers['x-evernote-token'],
  sandbox: req.body.sandbox || req.headers['x-evernote-sandbox']
});

router.post('/notes', async (req, res) => {
  try {
    const { title, content, notebookGuid, tags } = req.body;
    const evernote = getEvernote(req);
    const result = await evernote.createNote(title, content, notebookGuid, tags);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/notes/:noteGuid', async (req, res) => {
  try {
    const { withContent, withResourcesData } = req.query;
    const evernote = getEvernote(req);
    const result = await evernote.getNote(
      req.params.noteGuid,
      withContent !== 'false',
      withResourcesData === 'true'
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/notes/:noteGuid', async (req, res) => {
  try {
    const evernote = getEvernote(req);
    const result = await evernote.updateNote(req.params.noteGuid, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/notes/:noteGuid', async (req, res) => {
  try {
    const evernote = getEvernote(req);
    const result = await evernote.deleteNote(req.params.noteGuid);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/notes/search', async (req, res) => {
  try {
    const { query, maxResults } = req.query;
    const evernote = getEvernote(req);
    const result = await evernote.searchNotes(query, parseInt(maxResults) || 50);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/notebooks', async (req, res) => {
  try {
    const evernote = getEvernote(req);
    const result = await evernote.listNotebooks();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/notebooks', async (req, res) => {
  try {
    const { name, stack } = req.body;
    const evernote = getEvernote(req);
    const result = await evernote.createNotebook(name, stack);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/notebooks/:notebookGuid/notes', async (req, res) => {
  try {
    const { maxResults } = req.query;
    const evernote = getEvernote(req);
    const result = await evernote.getNotesInNotebook(
      req.params.notebookGuid,
      parseInt(maxResults) || 50
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/tags', async (req, res) => {
  try {
    const evernote = getEvernote(req);
    const result = await evernote.listTags();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/tags', async (req, res) => {
  try {
    const { name, parentGuid } = req.body;
    const evernote = getEvernote(req);
    const result = await evernote.createTag(name, parentGuid);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/tags/:tagGuid/notes', async (req, res) => {
  try {
    const { maxResults } = req.query;
    const evernote = getEvernote(req);
    const result = await evernote.getNotesByTag(
      req.params.tagGuid,
      parseInt(maxResults) || 50
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/user', async (req, res) => {
  try {
    const evernote = getEvernote(req);
    const result = await evernote.getUserInfo();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
