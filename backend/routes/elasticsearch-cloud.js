const express = require('express');
const router = express.Router();
const ElasticsearchCloudIntegration = require('../integrations/elasticsearch-cloud');

const getElastic = (req) => new ElasticsearchCloudIntegration({
  cloudId: req.body.cloudId || req.headers['x-elastic-cloud-id'],
  apiKey: req.body.apiKey || req.headers['x-elastic-api-key'],
  username: req.body.username || req.headers['x-elastic-username'],
  password: req.body.password || req.headers['x-elastic-password']
});

router.post('/index/:index/document', async (req, res) => {
  try {
    const { document, id } = req.body;
    const elastic = getElastic(req);
    const result = await elastic.indexDocument(req.params.index, document, id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/index/:index/bulk', async (req, res) => {
  try {
    const { documents } = req.body;
    const elastic = getElastic(req);
    const result = await elastic.bulkIndex(req.params.index, documents);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/index/:index/search', async (req, res) => {
  try {
    const { query, options } = req.body;
    const elastic = getElastic(req);
    const result = await elastic.search(req.params.index, query, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/index/:index/document/:id', async (req, res) => {
  try {
    const elastic = getElastic(req);
    const result = await elastic.getDocument(req.params.index, req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/index/:index/document/:id', async (req, res) => {
  try {
    const { doc } = req.body;
    const elastic = getElastic(req);
    const result = await elastic.updateDocument(req.params.index, req.params.id, doc);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/index/:index/document/:id', async (req, res) => {
  try {
    const elastic = getElastic(req);
    const result = await elastic.deleteDocument(req.params.index, req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/index/:index', async (req, res) => {
  try {
    const { mappings, settings } = req.body;
    const elastic = getElastic(req);
    const result = await elastic.createIndex(req.params.index, mappings, settings);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/index/:index', async (req, res) => {
  try {
    const elastic = getElastic(req);
    const result = await elastic.deleteIndex(req.params.index);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/index/:index/stats', async (req, res) => {
  try {
    const elastic = getElastic(req);
    const result = await elastic.getIndexStats(req.params.index);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/index/:index/aggregate', async (req, res) => {
  try {
    const { aggregations } = req.body;
    const elastic = getElastic(req);
    const result = await elastic.aggregate(req.params.index, aggregations);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/index/:index/count', async (req, res) => {
  try {
    const { query } = req.body;
    const elastic = getElastic(req);
    const result = await elastic.count(req.params.index, query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/index/:index/scroll', async (req, res) => {
  try {
    const { query, scrollTime } = req.body;
    const elastic = getElastic(req);
    const result = await elastic.scroll(req.params.index, query, scrollTime);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/scroll/:scrollId', async (req, res) => {
  try {
    const elastic = getElastic(req);
    const result = await elastic.clearScroll(req.params.scrollId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/reindex', async (req, res) => {
  try {
    const { sourceIndex, destIndex } = req.body;
    const elastic = getElastic(req);
    const result = await elastic.reindex(sourceIndex, destIndex);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/cluster/health', async (req, res) => {
  try {
    const elastic = getElastic(req);
    const result = await elastic.getClusterHealth();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
