const express = require('express');
const router = express.Router();
const GoogleAnalyticsIntegration = require('../integrations/google-analytics');

const getGA = (req) => new GoogleAnalyticsIntegration({
  propertyId: req.body.propertyId || req.headers['x-ga-property-id'],
  credentials: req.body.credentials || req.headers['x-ga-credentials']
});

router.post('/report', async (req, res) => {
  try {
    const { dimensions, metrics, dateRanges } = req.body;
    const ga = getGA(req);
    const result = await ga.runReport(dimensions, metrics, dateRanges);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/pageviews', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const ga = getGA(req);
    const result = await ga.getPageViews(startDate, endDate);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const ga = getGA(req);
    const result = await ga.getUserMetrics(startDate, endDate);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/traffic-sources', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const ga = getGA(req);
    const result = await ga.getTrafficSources(startDate, endDate);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/devices', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const ga = getGA(req);
    const result = await ga.getDeviceMetrics(startDate, endDate);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/top-pages', async (req, res) => {
  try {
    const { startDate, endDate, limit } = req.query;
    const ga = getGA(req);
    const result = await ga.getTopPages(startDate, endDate, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/conversions', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const ga = getGA(req);
    const result = await ga.getConversionMetrics(startDate, endDate);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/geographic', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const ga = getGA(req);
    const result = await ga.getGeographicData(startDate, endDate);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/events', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const ga = getGA(req);
    const result = await ga.getEventMetrics(startDate, endDate);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/realtime', async (req, res) => {
  try {
    const ga = getGA(req);
    const result = await ga.getRealTimeReport();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
