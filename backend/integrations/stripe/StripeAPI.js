/**
 * Stripe API Integration
 * Complete payment processing with all endpoints
 */

const axios = require('axios');

class StripeAPI {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.STRIPE_API_KEY;
    this.baseURL = 'https://api.stripe.com/v1';
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  }

  // ==================== CUSTOMERS ====================

  async createCustomer(data) {
    const params = new URLSearchParams({
      email: data.email,
      name: data.name,
      ...(data.description && { description: data.description }),
      ...(data.phone && { phone: data.phone }),
      ...(data.metadata && { metadata: JSON.stringify(data.metadata) })
    });

    const response = await this.client.post('/customers', params);
    return { success: true, customer: response.data };
  }

  async getCustomer(customerId) {
    const response = await this.client.get(`/customers/${customerId}`);
    return { success: true, customer: response.data };
  }

  async updateCustomer(customerId, data) {
    const params = new URLSearchParams(data);
    const response = await this.client.post(`/customers/${customerId}`, params);
    return { success: true, customer: response.data };
  }

  async deleteCustomer(customerId) {
    const response = await this.client.delete(`/customers/${customerId}`);
    return { success: true, deleted: response.data.deleted };
  }

  async listCustomers(options = {}) {
    const params = new URLSearchParams({
      limit: options.limit || 10,
      ...(options.starting_after && { starting_after: options.starting_after })
    });

    const response = await this.client.get(`/customers?${params}`);
    return { success: true, customers: response.data.data, has_more: response.data.has_more };
  }

  // ==================== PAYMENT INTENTS ====================

  async createPaymentIntent(data) {
    const params = new URLSearchParams({
      amount: data.amount,
      currency: data.currency || 'usd',
      ...(data.customer && { customer: data.customer }),
      ...(data.description && { description: data.description }),
      ...(data.payment_method && { payment_method: data.payment_method }),
      ...(data.metadata && { metadata: JSON.stringify(data.metadata) })
    });

    const response = await this.client.post('/payment_intents', params);
    return { success: true, payment_intent: response.data };
  }

  async getPaymentIntent(paymentIntentId) {
    const response = await this.client.get(`/payment_intents/${paymentIntentId}`);
    return { success: true, payment_intent: response.data };
  }

  async confirmPaymentIntent(paymentIntentId, data = {}) {
    const params = new URLSearchParams(data);
    const response = await this.client.post(`/payment_intents/${paymentIntentId}/confirm`, params);
    return { success: true, payment_intent: response.data };
  }

  async cancelPaymentIntent(paymentIntentId) {
    const response = await this.client.post(`/payment_intents/${paymentIntentId}/cancel`);
    return { success: true, payment_intent: response.data };
  }

  async listPaymentIntents(options = {}) {
    const params = new URLSearchParams({
      limit: options.limit || 10,
      ...(options.customer && { customer: options.customer })
    });

    const response = await this.client.get(`/payment_intents?${params}`);
    return { success: true, payment_intents: response.data.data };
  }

  // ==================== CHARGES ====================

  async createCharge(data) {
    const params = new URLSearchParams({
      amount: data.amount,
      currency: data.currency || 'usd',
      source: data.source,
      ...(data.customer && { customer: data.customer }),
      ...(data.description && { description: data.description })
    });

    const response = await this.client.post('/charges', params);
    return { success: true, charge: response.data };
  }

  async getCharge(chargeId) {
    const response = await this.client.get(`/charges/${chargeId}`);
    return { success: true, charge: response.data };
  }

  async listCharges(options = {}) {
    const params = new URLSearchParams({
      limit: options.limit || 10,
      ...(options.customer && { customer: options.customer })
    });

    const response = await this.client.get(`/charges?${params}`);
    return { success: true, charges: response.data.data };
  }

  // ==================== REFUNDS ====================

  async createRefund(data) {
    const params = new URLSearchParams({
      ...(data.charge && { charge: data.charge }),
      ...(data.payment_intent && { payment_intent: data.payment_intent }),
      ...(data.amount && { amount: data.amount }),
      ...(data.reason && { reason: data.reason })
    });

    const response = await this.client.post('/refunds', params);
    return { success: true, refund: response.data };
  }

  async getRefund(refundId) {
    const response = await this.client.get(`/refunds/${refundId}`);
    return { success: true, refund: response.data };
  }

  async listRefunds(options = {}) {
    const params = new URLSearchParams({
      limit: options.limit || 10,
      ...(options.charge && { charge: options.charge })
    });

    const response = await this.client.get(`/refunds?${params}`);
    return { success: true, refunds: response.data.data };
  }

  // ==================== SUBSCRIPTIONS ====================

  async createSubscription(data) {
    const params = new URLSearchParams({
      customer: data.customer,
      items: JSON.stringify(data.items),
      ...(data.trial_period_days && { trial_period_days: data.trial_period_days }),
      ...(data.metadata && { metadata: JSON.stringify(data.metadata) })
    });

    const response = await this.client.post('/subscriptions', params);
    return { success: true, subscription: response.data };
  }

  async getSubscription(subscriptionId) {
    const response = await this.client.get(`/subscriptions/${subscriptionId}`);
    return { success: true, subscription: response.data };
  }

  async updateSubscription(subscriptionId, data) {
    const params = new URLSearchParams(data);
    const response = await this.client.post(`/subscriptions/${subscriptionId}`, params);
    return { success: true, subscription: response.data };
  }

  async cancelSubscription(subscriptionId) {
    const response = await this.client.delete(`/subscriptions/${subscriptionId}`);
    return { success: true, subscription: response.data };
  }

  async listSubscriptions(options = {}) {
    const params = new URLSearchParams({
      limit: options.limit || 10,
      ...(options.customer && { customer: options.customer })
    });

    const response = await this.client.get(`/subscriptions?${params}`);
    return { success: true, subscriptions: response.data.data };
  }

  // ==================== PRODUCTS ====================

  async createProduct(data) {
    const params = new URLSearchParams({
      name: data.name,
      ...(data.description && { description: data.description }),
      ...(data.metadata && { metadata: JSON.stringify(data.metadata) })
    });

    const response = await this.client.post('/products', params);
    return { success: true, product: response.data };
  }

  async getProduct(productId) {
    const response = await this.client.get(`/products/${productId}`);
    return { success: true, product: response.data };
  }

  async updateProduct(productId, data) {
    const params = new URLSearchParams(data);
    const response = await this.client.post(`/products/${productId}`, params);
    return { success: true, product: response.data };
  }

  async deleteProduct(productId) {
    const response = await this.client.delete(`/products/${productId}`);
    return { success: true, deleted: response.data.deleted };
  }

  async listProducts(options = {}) {
    const params = new URLSearchParams({
      limit: options.limit || 10
    });

    const response = await this.client.get(`/products?${params}`);
    return { success: true, products: response.data.data };
  }

  // ==================== PRICES ====================

  async createPrice(data) {
    const params = new URLSearchParams({
      product: data.product,
      unit_amount: data.unit_amount,
      currency: data.currency || 'usd',
      ...(data.recurring && { recurring: JSON.stringify(data.recurring) })
    });

    const response = await this.client.post('/prices', params);
    return { success: true, price: response.data };
  }

  async getPrice(priceId) {
    const response = await this.client.get(`/prices/${priceId}`);
    return { success: true, price: response.data };
  }

  async listPrices(options = {}) {
    const params = new URLSearchParams({
      limit: options.limit || 10,
      ...(options.product && { product: options.product })
    });

    const response = await this.client.get(`/prices?${params}`);
    return { success: true, prices: response.data.data };
  }

  // ==================== INVOICES ====================

  async createInvoice(data) {
    const params = new URLSearchParams({
      customer: data.customer,
      ...(data.description && { description: data.description }),
      ...(data.metadata && { metadata: JSON.stringify(data.metadata) })
    });

    const response = await this.client.post('/invoices', params);
    return { success: true, invoice: response.data };
  }

  async getInvoice(invoiceId) {
    const response = await this.client.get(`/invoices/${invoiceId}`);
    return { success: true, invoice: response.data };
  }

  async finalizeInvoice(invoiceId) {
    const response = await this.client.post(`/invoices/${invoiceId}/finalize`);
    return { success: true, invoice: response.data };
  }

  async payInvoice(invoiceId) {
    const response = await this.client.post(`/invoices/${invoiceId}/pay`);
    return { success: true, invoice: response.data };
  }

  async listInvoices(options = {}) {
    const params = new URLSearchParams({
      limit: options.limit || 10,
      ...(options.customer && { customer: options.customer })
    });

    const response = await this.client.get(`/invoices?${params}`);
    return { success: true, invoices: response.data.data };
  }

  // ==================== BALANCE ====================

  async getBalance() {
    const response = await this.client.get('/balance');
    return { success: true, balance: response.data };
  }

  async getBalanceTransactions(options = {}) {
    const params = new URLSearchParams({
      limit: options.limit || 10
    });

    const response = await this.client.get(`/balance_transactions?${params}`);
    return { success: true, transactions: response.data.data };
  }

  // ==================== WEBHOOKS ====================

  async createWebhookEndpoint(data) {
    const params = new URLSearchParams({
      url: data.url,
      enabled_events: JSON.stringify(data.enabled_events)
    });

    const response = await this.client.post('/webhook_endpoints', params);
    return { success: true, webhook: response.data };
  }

  async listWebhookEndpoints() {
    const response = await this.client.get('/webhook_endpoints');
    return { success: true, webhooks: response.data.data };
  }

  async deleteWebhookEndpoint(webhookId) {
    const response = await this.client.delete(`/webhook_endpoints/${webhookId}`);
    return { success: true, deleted: response.data.deleted };
  }
}

module.exports = StripeAPI;
