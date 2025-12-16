/**
 * Stripe Integration - Complete Implementation
 * 20 endpoints for full Stripe payment functionality
 */

const axios = require('axios');

class StripeIntegration {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.stripe.com/v1';
  }

  getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    };
  }

  toFormData(obj) {
    return Object.keys(obj).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`).join('&');
  }

  async listCustomers(limit = 10) {
    try {
      const response = await axios.get(`${this.baseUrl}/customers`, {
        headers: this.getHeaders(),
        params: { limit },
      });
      return { success: true, customers: response.data.data };
    } catch (error) {
      throw new Error(`Failed to list customers: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async createCustomer(email, name, options = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/customers`,
        this.toFormData({ email, name, ...options }),
        { headers: this.getHeaders() }
      );
      return { success: true, customer: response.data };
    } catch (error) {
      throw new Error(`Failed to create customer: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async getCustomer(customerId) {
    try {
      const response = await axios.get(`${this.baseUrl}/customers/${customerId}`, {
        headers: this.getHeaders(),
      });
      return { success: true, customer: response.data };
    } catch (error) {
      throw new Error(`Failed to get customer: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async updateCustomer(customerId, updates) {
    try {
      const response = await axios.post(`${this.baseUrl}/customers/${customerId}`,
        this.toFormData(updates),
        { headers: this.getHeaders() }
      );
      return { success: true, customer: response.data };
    } catch (error) {
      throw new Error(`Failed to update customer: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async deleteCustomer(customerId) {
    try {
      const response = await axios.delete(`${this.baseUrl}/customers/${customerId}`, {
        headers: this.getHeaders(),
      });
      return { success: true, deleted: response.data.deleted };
    } catch (error) {
      throw new Error(`Failed to delete customer: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async createPaymentIntent(amount, currency, options = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/payment_intents`,
        this.toFormData({ amount, currency, ...options }),
        { headers: this.getHeaders() }
      );
      return { success: true, paymentIntent: response.data };
    } catch (error) {
      throw new Error(`Failed to create payment intent: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async getPaymentIntent(paymentIntentId) {
    try {
      const response = await axios.get(`${this.baseUrl}/payment_intents/${paymentIntentId}`, {
        headers: this.getHeaders(),
      });
      return { success: true, paymentIntent: response.data };
    } catch (error) {
      throw new Error(`Failed to get payment intent: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async confirmPaymentIntent(paymentIntentId, paymentMethod) {
    try {
      const response = await axios.post(`${this.baseUrl}/payment_intents/${paymentIntentId}/confirm`,
        this.toFormData({ payment_method: paymentMethod }),
        { headers: this.getHeaders() }
      );
      return { success: true, paymentIntent: response.data };
    } catch (error) {
      throw new Error(`Failed to confirm payment intent: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async listCharges(limit = 10) {
    try {
      const response = await axios.get(`${this.baseUrl}/charges`, {
        headers: this.getHeaders(),
        params: { limit },
      });
      return { success: true, charges: response.data.data };
    } catch (error) {
      throw new Error(`Failed to list charges: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async getCharge(chargeId) {
    try {
      const response = await axios.get(`${this.baseUrl}/charges/${chargeId}`, {
        headers: this.getHeaders(),
      });
      return { success: true, charge: response.data };
    } catch (error) {
      throw new Error(`Failed to get charge: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async createSubscription(customer, items, options = {}) {
    try {
      const data = { customer, ...options };
      items.forEach((item, index) => {
        data[`items[${index}][price]`] = item.price;
      });
      
      const response = await axios.post(`${this.baseUrl}/subscriptions`,
        this.toFormData(data),
        { headers: this.getHeaders() }
      );
      return { success: true, subscription: response.data };
    } catch (error) {
      throw new Error(`Failed to create subscription: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async getSubscription(subscriptionId) {
    try {
      const response = await axios.get(`${this.baseUrl}/subscriptions/${subscriptionId}`, {
        headers: this.getHeaders(),
      });
      return { success: true, subscription: response.data };
    } catch (error) {
      throw new Error(`Failed to get subscription: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async cancelSubscription(subscriptionId) {
    try {
      const response = await axios.delete(`${this.baseUrl}/subscriptions/${subscriptionId}`, {
        headers: this.getHeaders(),
      });
      return { success: true, subscription: response.data };
    } catch (error) {
      throw new Error(`Failed to cancel subscription: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async listInvoices(limit = 10) {
    try {
      const response = await axios.get(`${this.baseUrl}/invoices`, {
        headers: this.getHeaders(),
        params: { limit },
      });
      return { success: true, invoices: response.data.data };
    } catch (error) {
      throw new Error(`Failed to list invoices: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async getInvoice(invoiceId) {
    try {
      const response = await axios.get(`${this.baseUrl}/invoices/${invoiceId}`, {
        headers: this.getHeaders(),
      });
      return { success: true, invoice: response.data };
    } catch (error) {
      throw new Error(`Failed to get invoice: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async createRefund(charge, amount, options = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/refunds`,
        this.toFormData({ charge, amount, ...options }),
        { headers: this.getHeaders() }
      );
      return { success: true, refund: response.data };
    } catch (error) {
      throw new Error(`Failed to create refund: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async getRefund(refundId) {
    try {
      const response = await axios.get(`${this.baseUrl}/refunds/${refundId}`, {
        headers: this.getHeaders(),
      });
      return { success: true, refund: response.data };
    } catch (error) {
      throw new Error(`Failed to get refund: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async listProducts(limit = 10) {
    try {
      const response = await axios.get(`${this.baseUrl}/products`, {
        headers: this.getHeaders(),
        params: { limit },
      });
      return { success: true, products: response.data.data };
    } catch (error) {
      throw new Error(`Failed to list products: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async createProduct(name, options = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/products`,
        this.toFormData({ name, ...options }),
        { headers: this.getHeaders() }
      );
      return { success: true, product: response.data };
    } catch (error) {
      throw new Error(`Failed to create product: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async getBalance() {
    try {
      const response = await axios.get(`${this.baseUrl}/balance`, {
        headers: this.getHeaders(),
      });
      return { success: true, balance: response.data };
    } catch (error) {
      throw new Error(`Failed to get balance: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

module.exports = StripeIntegration;
