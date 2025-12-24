const axios = require('axios');

/**
 * Stripe Payment Integration
 * Complete payment processing with subscriptions, invoices, and webhooks
 */
class StripeIntegration {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.stripe.com/v1';
    this.headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    };
  }

  // Create a customer
  async createCustomer(email, name, metadata = {}) {
    const params = new URLSearchParams({
      email,
      name,
      ...Object.entries(metadata).reduce((acc, [key, val]) => {
        acc[`metadata[${key}]`] = val;
        return acc;
      }, {})
    });

    const response = await axios.post(`${this.baseURL}/customers`, params, {
      headers: this.headers
    });
    return response.data;
  }

  // Create a payment intent
  async createPaymentIntent(amount, currency = 'usd', customerId = null) {
    const params = new URLSearchParams({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      ...(customerId && { customer: customerId })
    });

    const response = await axios.post(`${this.baseURL}/payment_intents`, params, {
      headers: this.headers
    });
    return response.data;
  }

  // Create a subscription
  async createSubscription(customerId, priceId, trialDays = 0) {
    const params = new URLSearchParams({
      customer: customerId,
      items: [{ price: priceId }],
      ...(trialDays > 0 && { trial_period_days: trialDays })
    });

    const response = await axios.post(`${this.baseURL}/subscriptions`, params, {
      headers: this.headers
    });
    return response.data;
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId) {
    const response = await axios.delete(`${this.baseURL}/subscriptions/${subscriptionId}`, {
      headers: this.headers
    });
    return response.data;
  }

  // Create a product
  async createProduct(name, description, metadata = {}) {
    const params = new URLSearchParams({
      name,
      description,
      ...Object.entries(metadata).reduce((acc, [key, val]) => {
        acc[`metadata[${key}]`] = val;
        return acc;
      }, {})
    });

    const response = await axios.post(`${this.baseURL}/products`, params, {
      headers: this.headers
    });
    return response.data;
  }

  // Create a price
  async createPrice(productId, amount, currency = 'usd', recurring = null) {
    const params = new URLSearchParams({
      product: productId,
      unit_amount: Math.round(amount * 100),
      currency,
      ...(recurring && {
        'recurring[interval]': recurring.interval,
        'recurring[interval_count]': recurring.interval_count || 1
      })
    });

    const response = await axios.post(`${this.baseURL}/prices`, params, {
      headers: this.headers
    });
    return response.data;
  }

  // Get customer
  async getCustomer(customerId) {
    const response = await axios.get(`${this.baseURL}/customers/${customerId}`, {
      headers: this.headers
    });
    return response.data;
  }

  // List customers
  async listCustomers(limit = 10) {
    const response = await axios.get(`${this.baseURL}/customers`, {
      headers: this.headers,
      params: { limit }
    });
    return response.data;
  }

  // Get payment intent
  async getPaymentIntent(paymentIntentId) {
    const response = await axios.get(`${this.baseURL}/payment_intents/${paymentIntentId}`, {
      headers: this.headers
    });
    return response.data;
  }

  // Create refund
  async createRefund(paymentIntentId, amount = null) {
    const params = new URLSearchParams({
      payment_intent: paymentIntentId,
      ...(amount && { amount: Math.round(amount * 100) })
    });

    const response = await axios.post(`${this.baseURL}/refunds`, params, {
      headers: this.headers
    });
    return response.data;
  }

  // Get balance
  async getBalance() {
    const response = await axios.get(`${this.baseURL}/balance`, {
      headers: this.headers
    });
    return response.data;
  }

  // List charges
  async listCharges(limit = 10, customerId = null) {
    const response = await axios.get(`${this.baseURL}/charges`, {
      headers: this.headers,
      params: {
        limit,
        ...(customerId && { customer: customerId })
      }
    });
    return response.data;
  }

  // Create invoice
  async createInvoice(customerId, description = null) {
    const params = new URLSearchParams({
      customer: customerId,
      ...(description && { description })
    });

    const response = await axios.post(`${this.baseURL}/invoices`, params, {
      headers: this.headers
    });
    return response.data;
  }

  // Get subscription
  async getSubscription(subscriptionId) {
    const response = await axios.get(`${this.baseURL}/subscriptions/${subscriptionId}`, {
      headers: this.headers
    });
    return response.data;
  }

  // List subscriptions
  async listSubscriptions(customerId = null, limit = 10) {
    const response = await axios.get(`${this.baseURL}/subscriptions`, {
      headers: this.headers,
      params: {
        limit,
        ...(customerId && { customer: customerId })
      }
    });
    return response.data;
  }
}

module.exports = StripeIntegration;
