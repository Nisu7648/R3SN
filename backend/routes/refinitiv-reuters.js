const express = require('express');
const router = express.Router();
const RefinitivReutersIntegration = require('../integrations/refinitiv-reuters');

const getRefinitiv = (req) => new RefinitivReutersIntegration({
  apiKey: req.body.apiKey || req.headers['x-refinitiv-api-key'],
  username: req.body.username || req.headers['x-refinitiv-username'],
  password: req.body.password || req.headers['x-refinitiv-password']
});

router.post('/authenticate', async (req, res) => {
  try {
    const refinitiv = getRefinitiv(req);
    const result = await refinitiv.authenticate();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/market-data', async (req, res) => {
  try {
    const { rics, fields } = req.body;
    const refinitiv = getRefinitiv(req);
    const result = await refinitiv.getMarketData(rics, fields);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/historical-pricing/:ric', async (req, res) => {
  try {
    const { startDate, endDate, interval } = req.query;
    const refinitiv = getRefinitiv(req);
    const result = await refinitiv.getHistoricalPricing(req.params.ric, startDate, endDate, interval);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/intraday-pricing/:ric', async (req, res) => {
  try {
    const { interval } = req.query;
    const refinitiv = getRefinitiv(req);
    const result = await refinitiv.getIntradayPricing(req.params.ric, interval);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/news', async (req, res) => {
  try {
    const { query, maxResults } = req.body;
    const refinitiv = getRefinitiv(req);
    const result = await refinitiv.getNews(query, maxResults);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/news/:storyId', async (req, res) => {
  try {
    const refinitiv = getRefinitiv(req);
    const result = await refinitiv.getNewsStory(req.params.storyId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/fundamentals/:ric', async (req, res) => {
  try {
    const refinitiv = getRefinitiv(req);
    const result = await refinitiv.getCompanyFundamentals(req.params.ric);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/esg-scores/:ric', async (req, res) => {
  try {
    const refinitiv = getRefinitiv(req);
    const result = await refinitiv.getESGScores(req.params.ric);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/analyst-recommendations/:ric', async (req, res) => {
  try {
    const refinitiv = getRefinitiv(req);
    const result = await refinitiv.getAnalystRecommendations(req.params.ric);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/earnings-estimates/:ric', async (req, res) => {
  try {
    const refinitiv = getRefinitiv(req);
    const result = await refinitiv.getEarningsEstimates(req.params.ric);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/ownership/:ric', async (req, res) => {
  try {
    const refinitiv = getRefinitiv(req);
    const result = await refinitiv.getOwnershipData(req.params.ric);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/corporate-actions/:ric', async (req, res) => {
  try {
    const refinitiv = getRefinitiv(req);
    const result = await refinitiv.getCorporateActions(req.params.ric);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/symbology', async (req, res) => {
  try {
    const { identifiers, identifierType } = req.body;
    const refinitiv = getRefinitiv(req);
    const result = await refinitiv.getSymbology(identifiers, identifierType);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/search', async (req, res) => {
  try {
    const { query } = req.body;
    const refinitiv = getRefinitiv(req);
    const result = await refinitiv.searchInstruments(query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/quotes', async (req, res) => {
  try {
    const { rics } = req.body;
    const refinitiv = getRefinitiv(req);
    const result = await refinitiv.getQuotes(rics);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/chain/:chainRic', async (req, res) => {
  try {
    const refinitiv = getRefinitiv(req);
    const result = await refinitiv.getChainConstituents(req.params.chainRic);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/timeseries', async (req, res) => {
  try {
    const { ric, fields, startDate, endDate } = req.body;
    const refinitiv = getRefinitiv(req);
    const result = await refinitiv.getTimeSeriesData(ric, fields, startDate, endDate);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/world-check/screening', async (req, res) => {
  try {
    const { name, entityType } = req.body;
    const refinitiv = getRefinitiv(req);
    const result = await refinitiv.getWorldCheckScreening(name, entityType);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
