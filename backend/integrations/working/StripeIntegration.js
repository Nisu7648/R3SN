/**
 * STRIPE INTEGRATION - FULLY WORKING
 * Payment processing integration
 * 
 * FREE TEST MODE - NO COST!
 * Get API key: https://dashboard.stripe.com/test/apikeys
 * 
 * Usage:
 *   const stripe = new StripeIntegration({ apiKey: 'sk_test_...' });
 *   const customer = await stripe.createCustomer({ email: 'user@example.com' });
 *   const payment = await stripe.createPaymentIntent({ amount: 1000, currency: 'usd' });
 */

const BaseIntegration = require('../core/BaseIntegration');

class StripeIntegration extends BaseIntegration {
  constructor(config = {}) {
    super({
      name: 'stripe',
      baseURL: 'https://api.stripe.com/v1',
      ...config
    });
  }

  getDefaultHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    };
  }

  /**
   * Create a customer
   */
  async createCustomer(data) {
    this.validateApiKey();
    const response = await this.post('/customers', this.buildFormData({
      email: data.email,
      name: data.name,
      description: data.description,
      metadata: data.metadata
    }));
    return { success: true, customer: response.data };
  }

  /**
   * Get customer by ID
   */
  async getCustomer(customerId) {
    this.validateApiKey();
    const response = await this.get(`/customers/${customerId}`);
    return { success: true, customer: response.data };
  }

  /**
   * Create payment intent
   */
  async createPaymentIntent(data) {
    this.validateApiKey();
    const response = await this.post('/payment_intents', this.buildFormData({
      amount: data.amount,
      currency: data.currency || 'usd',
      customer: data.customer,
      description: data.description,
      metadata: data.metadata
    }));
    return { success: true, paymentIntent: response.data };
  }

  /**
   * Create a charge
   */
  async createCharge(data) {
    this.validateApiKey();
    const response = await this.post('/charges', this.buildFormData({
      amount: data.amount,
      currency: data.currency || 'usd',
      source: data.source,
      customer: data.customer,
      description: data.description
    }));
    return { success: true, charge: response.data };
  }

  /**
   * List all customers
   */
  async listCustomers(limit = 10) {
    this.validateApiKey();
    const response = await this.get('/customers', { limit });
    return { success: true, customers: response.data.data, hasMore: response.data.has_more };
  }

  /**
   * Create product
   */
  async createProduct(data) {
    this.validateApiKey();
    const response = await this.post('/products', this.buildFormData({
      name: data.name,
      description: data.description,
      metadata: data.metadata
    }));
    return { success: true, product: response.data };
  }

  /**
   * Create price
   */
  async createPrice(data) {
    this.validateApiKey();
    const response = await this.post('/prices', this.buildFormData({
      product: data.product,
      unit_amount: data.amount,
      currency: data.currency || 'usd',
      recurring: data.recurring
    }));
    return { success: true, price: response.data };
  }

  buildFormData(data) {
    return Object.keys(data)
      .filter(key => data[key] !== undefined)
      .map(key => {
        if (typeof data[key] === 'object') {
          return Object.keys(data[key])
            .map(subKey => `${key}[${subKey}]=${encodeURIComponent(data[key][subKey])}`)
            .join('&');
        }
        return `${key}=${encodeURIComponent(data[key])}`;
      })
      .join('&');
  }

  async testConnection() {
    try {
      await this.listCustomers(1);
      return { success: true, integration: this.name, message: 'Connection successful' };
    } catch (error) {
      return { success: false, integration: this.name, error: error.message };
    }
  }
}

module.exports = StripeIntegration;
