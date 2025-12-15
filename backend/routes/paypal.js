const express = require('express');
const router = express.Router();
const PayPalIntegration = require('../integrations/paypal');

const getPayPal = (req) => new PayPalIntegration({
  clientId: req.body.clientId || req.headers['x-paypal-client-id'],
  clientSecret: req.body.clientSecret || req.headers['x-paypal-client-secret'],
  mode: req.body.mode || req.headers['x-paypal-mode']
});

router.post('/orders', async (req, res) => {
  try {
    const { amount, currency, description } = req.body;
    const paypal = getPayPal(req);
    const result = await paypal.createOrder(amount, currency, description);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/orders/:orderId/capture', async (req, res) => {
  try {
    const paypal = getPayPal(req);
    const result = await paypal.captureOrder(req.params.orderId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/orders/:orderId', async (req, res) => {
  try {
    const paypal = getPayPal(req);
    const result = await paypal.getOrder(req.params.orderId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/refunds', async (req, res) => {
  try {
    const { captureId, amount, currency } = req.body;
    const paypal = getPayPal(req);
    const result = await paypal.createRefund(captureId, amount, currency);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/refunds/:refundId', async (req, res) => {
  try {
    const paypal = getPayPal(req);
    const result = await paypal.getRefund(req.params.refundId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/subscriptions', async (req, res) => {
  try {
    const { planId, subscriber } = req.body;
    const paypal = getPayPal(req);
    const result = await paypal.createSubscription(planId, subscriber);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/subscriptions/:subscriptionId', async (req, res) => {
  try {
    const paypal = getPayPal(req);
    const result = await paypal.getSubscription(req.params.subscriptionId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/subscriptions/:subscriptionId/cancel', async (req, res) => {
  try {
    const { reason } = req.body;
    const paypal = getPayPal(req);
    const result = await paypal.cancelSubscription(req.params.subscriptionId, reason);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/invoices', async (req, res) => {
  try {
    const paypal = getPayPal(req);
    const result = await paypal.createInvoice(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/invoices/:invoiceId/send', async (req, res) => {
  try {
    const paypal = getPayPal(req);
    const result = await paypal.sendInvoice(req.params.invoiceId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/payouts', async (req, res) => {
  try {
    const { senderBatchId, items } = req.body;
    const paypal = getPayPal(req);
    const result = await paypal.createPayout(senderBatchId, items);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/payouts/:payoutBatchId', async (req, res) => {
  try {
    const paypal = getPayPal(req);
    const result = await paypal.getPayout(req.params.payoutBatchId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
