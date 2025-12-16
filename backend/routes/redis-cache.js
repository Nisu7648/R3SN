const express = require('express');
const router = express.Router();
const RedisIntegration = require('../integrations/redis-cache');

const getRedis = (req) => new RedisIntegration({
  host: req.body.host || req.headers['x-redis-host'],
  port: req.body.port || req.headers['x-redis-port'],
  password: req.body.password || req.headers['x-redis-password'],
  db: req.body.db || req.headers['x-redis-db']
});

router.post('/set', async (req, res) => {
  try {
    const { key, value, expirySeconds } = req.body;
    const redis = getRedis(req);
    const result = await redis.set(key, value, expirySeconds);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/get/:key', async (req, res) => {
  try {
    const redis = getRedis(req);
    const result = await redis.get(req.params.key);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/delete/:key', async (req, res) => {
  try {
    const redis = getRedis(req);
    const result = await redis.delete(req.params.key);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/exists/:key', async (req, res) => {
  try {
    const redis = getRedis(req);
    const result = await redis.exists(req.params.key);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/expire', async (req, res) => {
  try {
    const { key, seconds } = req.body;
    const redis = getRedis(req);
    const result = await redis.expire(key, seconds);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/ttl/:key', async (req, res) => {
  try {
    const redis = getRedis(req);
    const result = await redis.ttl(req.params.key);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/increment', async (req, res) => {
  try {
    const { key, amount } = req.body;
    const redis = getRedis(req);
    const result = await redis.increment(key, amount);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/decrement', async (req, res) => {
  try {
    const { key, amount } = req.body;
    const redis = getRedis(req);
    const result = await redis.decrement(key, amount);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/list/push', async (req, res) => {
  try {
    const { key, values } = req.body;
    const redis = getRedis(req);
    const result = await redis.listPush(key, ...values);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/list/pop', async (req, res) => {
  try {
    const { key } = req.body;
    const redis = getRedis(req);
    const result = await redis.listPop(key);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/list/range/:key', async (req, res) => {
  try {
    const { start, stop } = req.query;
    const redis = getRedis(req);
    const result = await redis.listRange(req.params.key, parseInt(start), parseInt(stop));
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/set/add', async (req, res) => {
  try {
    const { key, members } = req.body;
    const redis = getRedis(req);
    const result = await redis.setAdd(key, ...members);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/set/members/:key', async (req, res) => {
  try {
    const redis = getRedis(req);
    const result = await redis.setMembers(req.params.key);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/hash/set', async (req, res) => {
  try {
    const { key, field, value } = req.body;
    const redis = getRedis(req);
    const result = await redis.hashSet(key, field, value);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/hash/get/:key/:field', async (req, res) => {
  try {
    const redis = getRedis(req);
    const result = await redis.hashGet(req.params.key, req.params.field);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/hash/getall/:key', async (req, res) => {
  try {
    const redis = getRedis(req);
    const result = await redis.hashGetAll(req.params.key);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/keys', async (req, res) => {
  try {
    const { pattern } = req.query;
    const redis = getRedis(req);
    const result = await redis.keys(pattern);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/flush', async (req, res) => {
  try {
    const redis = getRedis(req);
    const result = await redis.flushAll();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/disconnect', async (req, res) => {
  try {
    const redis = getRedis(req);
    const result = await redis.disconnect();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
