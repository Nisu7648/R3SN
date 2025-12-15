/**
 * Razorpay API Routes
 * Complete payment gateway endpoints
 */

const express = require('express');
const router = express.Router();
const RazorpayIntegration = require('../integrations/razorpay');

// Initialize Razorpay
const getRazorpay = (req) => {
  const config = {
    keyId: req.body.keyId || req.headers['x-razorpay-key-id'],
    keySecret: req.body.keySecret || req.headers['x-razorpay-key-secret']
  };
  return new RazorpayIntegration(config);
};

/**
 * Create payment order
 * POST /api/razorpay/orders
 */
router.post('/orders', async (req, res) => {
  try {
    const { amount, currency, receipt, notes } = req.body;
    
    if (!amount) {
      return res.status(400).json({
        success: false,
        error: 'Amount is required'
      });
    }

    const razorpay = getRazorpay(req);
    const result = await razorpay.createOrder(amount, currency, receipt, notes);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get order details
 * GET /api/razorpay/orders/:orderId
 */
router.get('/orders/:orderId', async (req, res) => {
  try {
    const razorpay = getRazorpay(req);
    const result = await razorpay.getOrder(req.params.orderId);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get payment details
 * GET /api/razorpay/payments/:paymentId
 */
router.get('/payments/:paymentId', async (req, res) => {
  try {
    const razorpay = getRazorpay(req);
    const result = await razorpay.getPayment(req.params.paymentId);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Capture payment
 * POST /api/razorpay/payments/:paymentId/capture
 */
router.post('/payments/:paymentId/capture', async (req, res) => {
  try {
    const { amount, currency } = req.body;
    
    if (!amount) {
      return res.status(400).json({
        success: false,
        error: 'Amount is required'
      });
    }

    const razorpay = getRazorpay(req);
    const result = await razorpay.capturePayment(req.params.paymentId, amount, currency);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Create refund
 * POST /api/razorpay/refunds
 */
router.post('/refunds', async (req, res) => {
  try {
    const { paymentId, amount, notes } = req.body;
    
    if (!paymentId) {
      return res.status(400).json({
        success: false,
        error: 'Payment ID is required'
      });
    }

    const razorpay = getRazorpay(req);
    const result = await razorpay.createRefund(paymentId, amount, notes);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get refund details
 * GET /api/razorpay/refunds/:refundId
 */
router.get('/refunds/:refundId', async (req, res) => {
  try {
    const razorpay = getRazorpay(req);
    const result = await razorpay.getRefund(req.params.refundId);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Create payment link
 * POST /api/razorpay/payment-links
 */
router.post('/payment-links', async (req, res) => {
  try {
    const { amount, currency, description, customer, options } = req.body;
    
    if (!amount || !description) {
      return res.status(400).json({
        success: false,
        error: 'Amount and description are required'
      });
    }

    const razorpay = getRazorpay(req);
    const result = await razorpay.createPaymentLink(amount, currency, description, customer, options);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Create subscription
 * POST /api/razorpay/subscriptions
 */
router.post('/subscriptions', async (req, res) => {
  try {
    const { planId, customerId, totalCount, options } = req.body;
    
    if (!planId || !customerId || !totalCount) {
      return res.status(400).json({
        success: false,
        error: 'Plan ID, customer ID, and total count are required'
      });
    }

    const razorpay = getRazorpay(req);
    const result = await razorpay.createSubscription(planId, customerId, totalCount, options);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Cancel subscription
 * POST /api/razorpay/subscriptions/:subscriptionId/cancel
 */
router.post('/subscriptions/:subscriptionId/cancel', async (req, res) => {
  try {
    const { cancelAtCycleEnd } = req.body;

    const razorpay = getRazorpay(req);
    const result = await razorpay.cancelSubscription(req.params.subscriptionId, cancelAtCycleEnd);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Create customer
 * POST /api/razorpay/customers
 */
router.post('/customers', async (req, res) => {
  try {
    const { name, email, contact, notes } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required'
      });
    }

    const razorpay = getRazorpay(req);
    const result = await razorpay.createCustomer(name, email, contact, notes);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get customer details
 * GET /api/razorpay/customers/:customerId
 */
router.get('/customers/:customerId', async (req, res) => {
  try {
    const razorpay = getRazorpay(req);
    const result = await razorpay.getCustomer(req.params.customerId);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Verify payment signature
 * POST /api/razorpay/verify
 */
router.post('/verify', async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;
    
    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({
        success: false,
        error: 'Order ID, payment ID, and signature are required'
      });
    }

    const razorpay = getRazorpay(req);
    const result = razorpay.verifyPaymentSignature(orderId, paymentId, signature);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get settlements
 * GET /api/razorpay/settlements
 */
router.get('/settlements', async (req, res) => {
  try {
    const { count = 10, skip = 0 } = req.query;

    const razorpay = getRazorpay(req);
    const result = await razorpay.getSettlements(parseInt(count), parseInt(skip));
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Create virtual account
 * POST /api/razorpay/virtual-accounts
 */
router.post('/virtual-accounts', async (req, res) => {
  try {
    const { customerId, receivers, description, notes } = req.body;
    
    if (!receivers || !description) {
      return res.status(400).json({
        success: false,
        error: 'Receivers and description are required'
      });
    }

    const razorpay = getRazorpay(req);
    const result = await razorpay.createVirtualAccount(customerId, receivers, description, notes);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
