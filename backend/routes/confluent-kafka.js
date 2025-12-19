const express = require('express');
const router = express.Router();
const ConfluentKafkaIntegration = require('../integrations/confluent-kafka');

const getKafka = (req) => new ConfluentKafkaIntegration({
  apiKey: req.body.apiKey || req.headers['x-confluent-api-key'],
  apiSecret: req.body.apiSecret || req.headers['x-confluent-api-secret'],
  bootstrapServers: req.body.bootstrapServers || req.headers['x-confluent-bootstrap-servers']
});

router.post('/producer/create', async (req, res) => {
  try {
    const kafka = getKafka(req);
    const result = await kafka.createProducer();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/messages/send', async (req, res) => {
  try {
    const { topic, messages } = req.body;
    const kafka = getKafka(req);
    const result = await kafka.sendMessage(topic, messages);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/consumer/create', async (req, res) => {
  try {
    const { groupId } = req.body;
    const kafka = getKafka(req);
    const result = await kafka.createConsumer(groupId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/consumer/subscribe', async (req, res) => {
  try {
    const { topics } = req.body;
    const kafka = getKafka(req);
    const result = await kafka.subscribe(topics);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/topics', async (req, res) => {
  try {
    const { topicName, partitions, replicationFactor } = req.body;
    const kafka = getKafka(req);
    const result = await kafka.createTopic(topicName, partitions, replicationFactor);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/topics', async (req, res) => {
  try {
    const kafka = getKafka(req);
    const result = await kafka.listTopics();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/topics/:topicName', async (req, res) => {
  try {
    const kafka = getKafka(req);
    const result = await kafka.deleteTopic(req.params.topicName);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/topics/:topicName/metadata', async (req, res) => {
  try {
    const kafka = getKafka(req);
    const result = await kafka.getTopicMetadata(req.params.topicName);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/clusters', async (req, res) => {
  try {
    const kafka = getKafka(req);
    const result = await kafka.listClusters();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/clusters/:clusterId', async (req, res) => {
  try {
    const kafka = getKafka(req);
    const result = await kafka.getCluster(req.params.clusterId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/environments', async (req, res) => {
  try {
    const kafka = getKafka(req);
    const result = await kafka.listEnvironments();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/connectors', async (req, res) => {
  try {
    const kafka = getKafka(req);
    const result = await kafka.createConnector(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/connectors', async (req, res) => {
  try {
    const kafka = getKafka(req);
    const result = await kafka.listConnectors();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/connectors/:connectorName', async (req, res) => {
  try {
    const kafka = getKafka(req);
    const result = await kafka.getConnector(req.params.connectorName);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/connectors/:connectorName', async (req, res) => {
  try {
    const kafka = getKafka(req);
    const result = await kafka.deleteConnector(req.params.connectorName);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/disconnect', async (req, res) => {
  try {
    const kafka = getKafka(req);
    const result = await kafka.disconnect();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
