/**
 * Razorpay Payment Gateway Integration
 * Complete payment processing for Indian market
 * 
 * Features:
 * - Create orders
 * - Process payments
 * - Refunds
 * - Subscriptions
 * - Payment links
 * - Customer management
 * - Settlements
 */

const Razorpay = require('razorpay');
const crypto = require('crypto');

class RazorpayIntegration {
  constructor(config) {
    this.keyId = config.keyId || process.env.RAZORPAY_KEY_ID;
    this.keySecret = config.keySecret || process.env.RAZORPAY_KEY_SECRET;
    
    if (!this.keyId || !this.keySecret) {
      throw new Error('Razorpay credentials not configured');
    }

    this.client = new Razorpay({
      key_id: this.keyId,
      key_secret: this.keySecret
    });
  }

  /**
   * Create a payment order
   */
  async createOrder(amount, currency = 'INR', receipt, notes = {}) {
    try {
      const order = await this.client.orders.create({
        amount: amount * 100, // Convert to paise
        currency,
        receipt,
        notes
      });

      return {
        success: true,
        order: {
          id: order.id,
          amount: order.amount / 100,
          currency: order.currency,
          receipt: order.receipt,
          status: order.status,
          createdAt: new Date(order.created_at * 1000)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Fetch order details
   */
  async getOrder(orderId) {
    try {
      const order = await this.client.orders.fetch(orderId);

      return {
        success: true,
        order: {
          id: order.id,
          amount: order.amount / 100,
          currency: order.currency,
          receipt: order.receipt,
          status: order.status,
          attempts: order.attempts,
          createdAt: new Date(order.created_at * 1000)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Fetch payment details
   */
  async getPayment(paymentId) {
    try {
      const payment = await this.client.payments.fetch(paymentId);

      return {
        success: true,
        payment: {
          id: payment.id,
          orderId: payment.order_id,
          amount: payment.amount / 100,
          currency: payment.currency,
          status: payment.status,
          method: payment.method,
          email: payment.email,
          contact: payment.contact,
          captured: payment.captured,
          createdAt: new Date(payment.created_at * 1000)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Capture a payment
   */
  async capturePayment(paymentId, amount, currency = 'INR') {
    try {
      const payment = await this.client.payments.capture(
        paymentId,
        amount * 100,
        currency
      );

      return {
        success: true,
        payment: {
          id: payment.id,
          amount: payment.amount / 100,
          currency: payment.currency,
          status: payment.status,
          captured: payment.captured
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create a refund
   */
  async createRefund(paymentId, amount = null, notes = {}) {
    try {
      const refundData = { notes };
      if (amount) {
        refundData.amount = amount * 100;
      }

      const refund = await this.client.payments.refund(paymentId, refundData);

      return {
        success: true,
        refund: {
          id: refund.id,
          paymentId: refund.payment_id,
          amount: refund.amount / 100,
          currency: refund.currency,
          status: refund.status,
          createdAt: new Date(refund.created_at * 1000)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get refund details
   */
  async getRefund(refundId) {
    try {
      const refund = await this.client.refunds.fetch(refundId);

      return {
        success: true,
        refund: {
          id: refund.id,
          paymentId: refund.payment_id,
          amount: refund.amount / 100,
          currency: refund.currency,
          status: refund.status,
          speedProcessed: refund.speed_processed,
          createdAt: new Date(refund.created_at * 1000)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create a payment link
   */
  async createPaymentLink(amount, currency = 'INR', description, customer = {}, options = {}) {
    try {
      const linkData = {
        amount: amount * 100,
        currency,
        description,
        customer,
        ...options
      };

      const link = await this.client.paymentLink.create(linkData);

      return {
        success: true,
        link: {
          id: link.id,
          shortUrl: link.short_url,
          amount: link.amount / 100,
          currency: link.currency,
          description: link.description,
          status: link.status,
          createdAt: new Date(link.created_at * 1000)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create a subscription
   */
  async createSubscription(planId, customerId, totalCount, options = {}) {
    try {
      const subscription = await this.client.subscriptions.create({
        plan_id: planId,
        customer_id: customerId,
        total_count: totalCount,
        ...options
      });

      return {
        success: true,
        subscription: {
          id: subscription.id,
          planId: subscription.plan_id,
          customerId: subscription.customer_id,
          status: subscription.status,
          currentStart: new Date(subscription.current_start * 1000),
          currentEnd: new Date(subscription.current_end * 1000),
          chargeAt: new Date(subscription.charge_at * 1000)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId, cancelAtCycleEnd = false) {
    try {
      const subscription = await this.client.subscriptions.cancel(
        subscriptionId,
        cancelAtCycleEnd
      );

      return {
        success: true,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          endedAt: subscription.ended_at ? new Date(subscription.ended_at * 1000) : null
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create a customer
   */
  async createCustomer(name, email, contact, notes = {}) {
    try {
      const customer = await this.client.customers.create({
        name,
        email,
        contact,
        notes
      });

      return {
        success: true,
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          contact: customer.contact,
          createdAt: new Date(customer.created_at * 1000)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get customer details
   */
  async getCustomer(customerId) {
    try {
      const customer = await this.client.customers.fetch(customerId);

      return {
        success: true,
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          contact: customer.contact,
          createdAt: new Date(customer.created_at * 1000)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verify payment signature
   */
  verifyPaymentSignature(orderId, paymentId, signature) {
    try {
      const text = `${orderId}|${paymentId}`;
      const generated = crypto
        .createHmac('sha256', this.keySecret)
        .update(text)
        .digest('hex');

      return {
        success: generated === signature,
        verified: generated === signature
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get all settlements
   */
  async getSettlements(count = 10, skip = 0) {
    try {
      const settlements = await this.client.settlements.all({
        count,
        skip
      });

      return {
        success: true,
        settlements: settlements.items.map(s => ({
          id: s.id,
          amount: s.amount / 100,
          status: s.status,
          fees: s.fees / 100,
          tax: s.tax / 100,
          utr: s.utr,
          createdAt: new Date(s.created_at * 1000)
        })),
        count: settlements.count
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create a virtual account
   */
  async createVirtualAccount(customerId, receivers, description, notes = {}) {
    try {
      const va = await this.client.virtualAccounts.create({
        receivers,
        description,
        customer_id: customerId,
        notes
      });

      return {
        success: true,
        virtualAccount: {
          id: va.id,
          name: va.name,
          status: va.status,
          description: va.description,
          receivers: va.receivers,
          createdAt: new Date(va.created_at * 1000)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = RazorpayIntegration;
