const express = require('express');
const router = express.Router();
const SupabaseFreeIntegration = require('../integrations/supabase-free');

const getSupabase = (req) => new SupabaseFreeIntegration({
  supabaseUrl: req.body.supabaseUrl || req.headers['x-supabase-url'],
  supabaseKey: req.body.supabaseKey || req.headers['x-supabase-key']
});

// Database Operations
router.post('/db/:table/select', async (req, res) => {
  try {
    const { filters } = req.body;
    const supabase = getSupabase(req);
    const result = await supabase.selectData(req.params.table, filters || {});
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/db/:table/insert', async (req, res) => {
  try {
    const { records } = req.body;
    const supabase = getSupabase(req);
    const result = await supabase.insertData(req.params.table, records);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/db/:table/update', async (req, res) => {
  try {
    const { updates, filters } = req.body;
    const supabase = getSupabase(req);
    const result = await supabase.updateData(req.params.table, updates, filters);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/db/:table/delete', async (req, res) => {
  try {
    const { filters } = req.body;
    const supabase = getSupabase(req);
    const result = await supabase.deleteData(req.params.table, filters);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/db/rpc/:functionName', async (req, res) => {
  try {
    const supabase = getSupabase(req);
    const result = await supabase.executeRPC(req.params.functionName, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Authentication
router.post('/auth/signup', async (req, res) => {
  try {
    const { email, password, metadata } = req.body;
    const supabase = getSupabase(req);
    const result = await supabase.signUp(email, password, metadata);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    const supabase = getSupabase(req);
    const result = await supabase.signIn(email, password);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/auth/signout', async (req, res) => {
  try {
    const supabase = getSupabase(req);
    const result = await supabase.signOut();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/auth/user', async (req, res) => {
  try {
    const supabase = getSupabase(req);
    const result = await supabase.getUser();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/auth/reset-password', async (req, res) => {
  try {
    const { email } = req.body;
    const supabase = getSupabase(req);
    const result = await supabase.resetPassword(email);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Storage Operations
router.post('/storage/:bucket/upload', async (req, res) => {
  try {
    const { path, file } = req.body;
    const supabase = getSupabase(req);
    const result = await supabase.uploadFile(req.params.bucket, path, file);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/storage/:bucket/download', async (req, res) => {
  try {
    const { path } = req.query;
    const supabase = getSupabase(req);
    const result = await supabase.downloadFile(req.params.bucket, path);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/storage/:bucket/list', async (req, res) => {
  try {
    const { path } = req.query;
    const supabase = getSupabase(req);
    const result = await supabase.listFiles(req.params.bucket, path);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/storage/:bucket/delete', async (req, res) => {
  try {
    const { paths } = req.body;
    const supabase = getSupabase(req);
    const result = await supabase.deleteFile(req.params.bucket, paths);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/storage/:bucket/public-url', async (req, res) => {
  try {
    const { path } = req.query;
    const supabase = getSupabase(req);
    const result = await supabase.getPublicUrl(req.params.bucket, path);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/storage/:bucket/signed-url', async (req, res) => {
  try {
    const { path, expiresIn } = req.body;
    const supabase = getSupabase(req);
    const result = await supabase.createSignedUrl(req.params.bucket, path, expiresIn);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
