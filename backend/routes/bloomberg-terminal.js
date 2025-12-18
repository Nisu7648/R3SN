const express = require('express');
const router = express.Router();
const BloombergTerminalIntegration = require('../integrations/bloomberg-terminal');

const getBloomberg = (req) => new BloombergTerminalIntegration({
  apiKey: req.body.apiKey || req.headers['x-bloomberg-api-key'],
  apiSecret: req.body.apiSecret || req.headers['x-bloomberg-api-secret']
});

router.post('/security-data', async (req, res) => {
  try {
    const { ticker, fields } = req.body;
    const bloomberg = getBloomberg(req);
    const result = await bloomberg.getSecurityData(ticker, fields);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/historical-data', async (req, res) => {
  try {
    const { ticker, startDate, endDate, fields } = req.body;
    const bloomberg = getBloomberg(req);
    const result = await bloomberg.getHistoricalData(ticker, startDate, endDate, fields);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/intraday-data', async (req, res) => {
  try {
    const { ticker, interval } = req.body;
    const bloomberg = getBloomberg(req);
    const result = await bloomberg.getIntradayData(ticker, interval);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/company-financials', async (req, res) => {
  try {
    const { ticker, statement } = req.body;
    const bloomberg = getBloomberg(req);
    const result = await bloomberg.getCompanyFinancials(ticker, statement);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/market-depth/:ticker', async (req, res) => {
  try {
    const bloomberg = getBloomberg(req);
    const result = await bloomberg.getMarketDepth(req.params.ticker);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/news/:ticker', async (req, res) => {
  try {
    const { maxResults } = req.query;
    const bloomberg = getBloomberg(req);
    const result = await bloomberg.getNews(req.params.ticker, parseInt(maxResults) || 20);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/analyst-ratings/:ticker', async (req, res) => {
  try {
    const bloomberg = getBloomberg(req);
    const result = await bloomberg.getAnalystRatings(req.params.ticker);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/earnings-calendar', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const bloomberg = getBloomberg(req);
    const result = await bloomberg.getEarningsCalendar(startDate, endDate);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/economic-indicators', async (req, res) => {
  try {
    const { indicators } = req.body;
    const bloomberg = getBloomberg(req);
    const result = await bloomberg.getEconomicIndicators(indicators);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/currency-rates', async (req, res) => {
  try {
    const { baseCurrency, targetCurrencies } = req.body;
    const bloomberg = getBloomberg(req);
    const result = await bloomberg.getCurrencyRates(baseCurrency, targetCurrencies);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/commodity-prices', async (req, res) => {
  try {
    const { commodities } = req.body;
    const bloomberg = getBloomberg(req);
    const result = await bloomberg.getCommodityPrices(commodities);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/index-data', async (req, res) => {
  try {
    const { indices } = req.body;
    const bloomberg = getBloomberg(req);
    const result = await bloomberg.getIndexData(indices);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/options/:ticker', async (req, res) => {
  try {
    const { expirationDate } = req.query;
    const bloomberg = getBloomberg(req);
    const result = await bloomberg.getOptionsChain(req.params.ticker, expirationDate);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/bonds/:isin', async (req, res) => {
  try {
    const bloomberg = getBloomberg(req);
    const result = await bloomberg.getBondData(req.params.isin);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/etf/:ticker/holdings', async (req, res) => {
  try {
    const bloomberg = getBloomberg(req);
    const result = await bloomberg.getETFHoldings(req.params.ticker);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/mutual-fund/:ticker', async (req, res) => {
  try {
    const bloomberg = getBloomberg(req);
    const result = await bloomberg.getMutualFundData(req.params.ticker);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/insider-transactions/:ticker', async (req, res) => {
  try {
    const bloomberg = getBloomberg(req);
    const result = await bloomberg.getInsiderTransactions(req.params.ticker);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/institutional-holdings/:ticker', async (req, res) => {
  try {
    const bloomberg = getBloomberg(req);
    const result = await bloomberg.getInstitutionalHoldings(req.params.ticker);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/screener', async (req, res) => {
  try {
    const bloomberg = getBloomberg(req);
    const result = await bloomberg.getScreenerResults(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/portfolio/analytics', async (req, res) => {
  try {
    const { holdings } = req.body;
    const bloomberg = getBloomberg(req);
    const result = await bloomberg.getPortfolioAnalytics(holdings);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
