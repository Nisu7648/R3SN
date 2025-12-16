const express = require('express');
const router = express.Router();
const PlaidIntegration = require('../integrations/plaid-banking');

const getPlaid = (req) => new PlaidIntegration({
  clientId: req.body.clientId || req.headers['x-plaid-client-id'],
  secret: req.body.secret || req.headers['x-plaid-secret'],
  env: req.body.env || req.headers['x-plaid-env']
});

router.post('/link-token', async (req, res) => {
  try {
    const { userId, products } = req.body;
    const plaid = getPlaid(req);
    const result = await plaid.createLinkToken(userId, products);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/exchange-token', async (req, res) => {
  try {
    const { publicToken } = req.body;
    const plaid = getPlaid(req);
    const result = await plaid.exchangePublicToken(publicToken);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/accounts', async (req, res) => {
  try {
    const { accessToken } = req.body;
    const plaid = getPlaid(req);
    const result = await plaid.getAccounts(accessToken);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/balance', async (req, res) => {
  try {
    const { accessToken } = req.body;
    const plaid = getPlaid(req);
    const result = await plaid.getBalance(accessToken);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/transactions', async (req, res) => {
  try {
    const { accessToken, startDate, endDate } = req.body;
    const plaid = getPlaid(req);
    const result = await plaid.getTransactions(accessToken, startDate, endDate);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/identity', async (req, res) => {
  try {
    const { accessToken } = req.body;
    const plaid = getPlaid(req);
    const result = await plaid.getIdentity(accessToken);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/income', async (req, res) => {
  try {
    const { accessToken } = req.body;
    const plaid = getPlaid(req);
    const result = await plaid.getIncome(accessToken);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/assets', async (req, res) => {
  try {
    const { accessToken } = req.body;
    const plaid = getPlaid(req);
    const result = await plaid.getAssets(accessToken);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/investments/holdings', async (req, res) => {
  try {
    const { accessToken } = req.body;
    const plaid = getPlaid(req);
    const result = await plaid.getInvestments(accessToken);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/investments/transactions', async (req, res) => {
  try {
    const { accessToken, startDate, endDate } = req.body;
    const plaid = getPlaid(req);
    const result = await plaid.getInvestmentTransactions(accessToken, startDate, endDate);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/auth', async (req, res) => {
  try {
    const { accessToken } = req.body;
    const plaid = getPlaid(req);
    const result = await plaid.getAuth(accessToken);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/item', async (req, res) => {
  try {
    const { accessToken } = req.body;
    const plaid = getPlaid(req);
    const result = await plaid.removeItem(accessToken);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
