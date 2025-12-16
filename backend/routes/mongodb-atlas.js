const express = require('express');
const router = express.Router();
const MongoDBAtlasIntegration = require('../integrations/mongodb-atlas');

const getMongoDB = (req) => new MongoDBAtlasIntegration({
  uri: req.body.uri || req.headers['x-mongodb-uri']
});

router.post('/connect', async (req, res) => {
  try {
    const mongodb = getMongoDB(req);
    const result = await mongodb.connect();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/disconnect', async (req, res) => {
  try {
    const mongodb = getMongoDB(req);
    const result = await mongodb.disconnect();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/insert-one', async (req, res) => {
  try {
    const { database, collection, document } = req.body;
    const mongodb = getMongoDB(req);
    const result = await mongodb.insertOne(database, collection, document);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/insert-many', async (req, res) => {
  try {
    const { database, collection, documents } = req.body;
    const mongodb = getMongoDB(req);
    const result = await mongodb.insertMany(database, collection, documents);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/find-one', async (req, res) => {
  try {
    const { database, collection, query } = req.body;
    const mongodb = getMongoDB(req);
    const result = await mongodb.findOne(database, collection, query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/find', async (req, res) => {
  try {
    const { database, collection, query, options } = req.body;
    const mongodb = getMongoDB(req);
    const result = await mongodb.find(database, collection, query, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/update-one', async (req, res) => {
  try {
    const { database, collection, filter, update } = req.body;
    const mongodb = getMongoDB(req);
    const result = await mongodb.updateOne(database, collection, filter, update);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/update-many', async (req, res) => {
  try {
    const { database, collection, filter, update } = req.body;
    const mongodb = getMongoDB(req);
    const result = await mongodb.updateMany(database, collection, filter, update);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/delete-one', async (req, res) => {
  try {
    const { database, collection, filter } = req.body;
    const mongodb = getMongoDB(req);
    const result = await mongodb.deleteOne(database, collection, filter);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/delete-many', async (req, res) => {
  try {
    const { database, collection, filter } = req.body;
    const mongodb = getMongoDB(req);
    const result = await mongodb.deleteMany(database, collection, filter);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/count', async (req, res) => {
  try {
    const { database, collection, query } = req.body;
    const mongodb = getMongoDB(req);
    const result = await mongodb.countDocuments(database, collection, query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/aggregate', async (req, res) => {
  try {
    const { database, collection, pipeline } = req.body;
    const mongodb = getMongoDB(req);
    const result = await mongodb.aggregate(database, collection, pipeline);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/create-index', async (req, res) => {
  try {
    const { database, collection, keys, options } = req.body;
    const mongodb = getMongoDB(req);
    const result = await mongodb.createIndex(database, collection, keys, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/list-indexes', async (req, res) => {
  try {
    const { database, collection } = req.query;
    const mongodb = getMongoDB(req);
    const result = await mongodb.listIndexes(database, collection);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/drop-index', async (req, res) => {
  try {
    const { database, collection, indexName } = req.body;
    const mongodb = getMongoDB(req);
    const result = await mongodb.dropIndex(database, collection, indexName);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/list-collections', async (req, res) => {
  try {
    const { database } = req.query;
    const mongodb = getMongoDB(req);
    const result = await mongodb.listCollections(database);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/create-collection', async (req, res) => {
  try {
    const { database, collectionName, options } = req.body;
    const mongodb = getMongoDB(req);
    const result = await mongodb.createCollection(database, collectionName, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
