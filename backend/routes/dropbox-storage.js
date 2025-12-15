const express = require('express');
const router = express.Router();
const DropboxIntegration = require('../integrations/dropbox-storage');

const getDropbox = (req) => new DropboxIntegration({
  accessToken: req.body.accessToken || req.headers['x-dropbox-access-token']
});

router.post('/upload', async (req, res) => {
  try {
    const { path, contents } = req.body;
    const dropbox = getDropbox(req);
    const result = await dropbox.uploadFile(path, contents);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/download', async (req, res) => {
  try {
    const { path } = req.body;
    const dropbox = getDropbox(req);
    const result = await dropbox.downloadFile(path);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/list', async (req, res) => {
  try {
    const { path = '' } = req.query;
    const dropbox = getDropbox(req);
    const result = await dropbox.listFolder(path);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/create-folder', async (req, res) => {
  try {
    const { path } = req.body;
    const dropbox = getDropbox(req);
    const result = await dropbox.createFolder(path);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/delete', async (req, res) => {
  try {
    const { path } = req.body;
    const dropbox = getDropbox(req);
    const result = await dropbox.deleteFile(path);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/move', async (req, res) => {
  try {
    const { fromPath, toPath } = req.body;
    const dropbox = getDropbox(req);
    const result = await dropbox.moveFile(fromPath, toPath);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/copy', async (req, res) => {
  try {
    const { fromPath, toPath } = req.body;
    const dropbox = getDropbox(req);
    const result = await dropbox.copyFile(fromPath, toPath);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/metadata', async (req, res) => {
  try {
    const { path } = req.query;
    const dropbox = getDropbox(req);
    const result = await dropbox.getMetadata(path);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/share', async (req, res) => {
  try {
    const { path } = req.body;
    const dropbox = getDropbox(req);
    const result = await dropbox.createSharedLink(path);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const dropbox = getDropbox(req);
    const result = await dropbox.searchFiles(query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/space-usage', async (req, res) => {
  try {
    const dropbox = getDropbox(req);
    const result = await dropbox.getSpaceUsage();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/account', async (req, res) => {
  try {
    const dropbox = getDropbox(req);
    const result = await dropbox.getCurrentAccount();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
