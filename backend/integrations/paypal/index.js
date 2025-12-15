/**
 * PayPal Payment Integration
 * Complete payment processing
 */

const axios = require('axios');

class PayPalIntegration {
  constructor(config) {
    this.clientId = config.clientId || process.env.PAYPAL_CLIENT_ID;
    this.clientSecret = config.clientSecret || process.env.PAYPAL_CLIENT_SECRET;
    this.mode = config.mode || process.env.PAYPAL_MODE || 'sandbox';
    
    this.baseURL = this.mode === 'live' 
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
    
    this.accessToken = null;
  }

  async getAccessToken() {
    if (this.accessToken) return this.accessToken;

    try {
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await axios.post(
        `${this.baseURL}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      return this.accessToken;
    } catch (error) {
      throw new Error(`Failed to get access token: ${error.message}`);
    }
  }

  async makeRequest(method, endpoint, data = null) {
    const token = await this.getAccessToken();
    
    const config = {
      method,
      url: `${this.baseURL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    if (data) config.data = data;

    try {
      const response = await axios(config);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  async createOrder(amount, currency = 'USD', description = '') {
    return await this.makeRequest('POST', '/v2/checkout/orders', {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: amount.toString()
        },
        description
      }]
    });
  }

  async captureOrder(orderId) {
    return await this.makeRequest('POST', `/v2/checkout/orders/${orderId}/capture`);
  }

  async getOrder(orderId) {
    return await this.makeRequest('GET', `/v2/checkout/orders/${orderId}`);
  }

  async createRefund(captureId, amount = null, currency = 'USD') {
    const data = {};
    if (amount) {
      data.amount = {
        value: amount.toString(),
        currency_code: currency
      };
    }
    return await this.makeRequest('POST', `/v2/payments/captures/${captureId}/refund`, data);
  }

  async getRefund(refundId) {
    return await this.makeRequest('GET', `/v2/payments/refunds/${refundId}`);
  }

  async createSubscription(planId, subscriberInfo) {
    return await this.makeRequest('POST', '/v1/billing/subscriptions', {
      plan_id: planId,
      subscriber: subscriberInfo
    });
  }

  async getSubscription(subscriptionId) {
    return await this.makeRequest('GET', `/v1/billing/subscriptions/${subscriptionId}`);
  }

  async cancelSubscription(subscriptionId, reason = '') {
    return await this.makeRequest('POST', `/v1/billing/subscriptions/${subscriptionId}/cancel`, {
      reason
    });
  }

  async createInvoice(invoiceData) {
    return await this.makeRequest('POST', '/v2/invoicing/invoices', invoiceData);
  }

  async sendInvoice(invoiceId) {
    return await this.makeRequest('POST', `/v2/invoicing/invoices/${invoiceId}/send`);
  }

  async createPayout(senderBatchId, items) {
    return await this.makeRequest('POST', '/v1/payments/payouts', {
      sender_batch_header: {
        sender_batch_id: senderBatchId,
        email_subject: 'You have a payout!',
        email_message: 'You have received a payout.'
      },
      items
    });
  }

  async getPayout(payoutBatchId) {
    return await this.makeRequest('GET', `/v1/payments/payouts/${payoutBatchId}`);
  }
}

module.exports = PayPalIntegration;
