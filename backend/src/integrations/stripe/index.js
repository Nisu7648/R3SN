/**
 * Stripe Integration
 * Real Stripe Payment API implementation
 */

const axios = require('axios');
const qs = require('querystring');

class StripeIntegration {
  constructor(config) {
    this.config = config;
    this.validateConfig();
    this.baseUrl = 'https://api.stripe.com/v1';
  }

  validateConfig() {
    if (!this.config.secretKey) {
      throw new Error('Stripe Secret Key is required');
    }
    if (!this.config.secretKey.startsWith('sk_')) {
      throw new Error('Invalid Stripe Secret Key format');
    }
  }

  getHeaders() {
    return {
      'Authorization': `Bearer ${this.config.secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    };
  }

  async execute(action, params) {
    const actions = {
      createPaymentIntent: this.createPaymentIntent.bind(this),
      createCustomer: this.createCustomer.bind(this),
      getCustomer: this.getCustomer.bind(this),
      listCustomers: this.listCustomers.bind(this),
      createSubscription: this.createSubscription.bind(this),
      cancelSubscription: this.cancelSubscription.bind(this),
      createInvoice: this.createInvoice.bind(this),
      listCharges: this.listCharges.bind(this),
      refundPayment: this.refundPayment.bind(this),
      createProduct: this.createProduct.bind(this),
      createPrice: this.createPrice.bind(this),
    };

    if (!actions[action]) {
      throw new Error(`Unknown action: ${action}`);
    }

    return await actions[action](params);
  }

  async createPaymentIntent(params) {
    const { amount, currency = 'usd', description, customerId } = params;
    
    if (!amount) {
      throw new Error('Amount is required');
    }

    try {
      const data = qs.stringify({
        amount,
        currency,
        ...(description && { description }),
        ...(customerId && { customer: customerId })
      });

      const response = await axios.post(
        `${this.baseUrl}/payment_intents`,
        data,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          id: response.data.id,
          amount: response.data.amount,
          currency: response.data.currency,
          status: response.data.status,
          clientSecret: response.data.client_secret
        }
      };
    } catch (error) {
      throw new Error(`Stripe API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async createCustomer(params) {
    const { email, name, description } = params;

    try {
      const data = qs.stringify({
        ...(email && { email }),
        ...(name && { name }),
        ...(description && { description })
      });

      const response = await axios.post(
        `${this.baseUrl}/customers`,
        data,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          id: response.data.id,
          email: response.data.email,
          name: response.data.name,
          created: response.data.created
        }
      };
    } catch (error) {
      throw new Error(`Stripe API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async getCustomer(params) {
    const { customerId } = params;
    
    if (!customerId) {
      throw new Error('Customer ID is required');
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/customers/${customerId}`,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          id: response.data.id,
          email: response.data.email,
          name: response.data.name,
          balance: response.data.balance,
          created: response.data.created
        }
      };
    } catch (error) {
      throw new Error(`Stripe API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async listCustomers(params) {
    const { limit = 10 } = params;

    try {
      const response = await axios.get(
        `${this.baseUrl}/customers`,
        {
          headers: this.getHeaders(),
          params: { limit }
        }
      );

      return {
        success: true,
        data: response.data.data.map(c => ({
          id: c.id,
          email: c.email,
          name: c.name,
          created: c.created
        }))
      };
    } catch (error) {
      throw new Error(`Stripe API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async createSubscription(params) {
    const { customerId, priceId, trialDays } = params;
    
    if (!customerId || !priceId) {
      throw new Error('Customer ID and Price ID are required');
    }

    try {
      const data = qs.stringify({
        customer: customerId,
        'items[0][price]': priceId,
        ...(trialDays && { trial_period_days: trialDays })
      });

      const response = await axios.post(
        `${this.baseUrl}/subscriptions`,
        data,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          id: response.data.id,
          status: response.data.status,
          currentPeriodEnd: response.data.current_period_end
        }
      };
    } catch (error) {
      throw new Error(`Stripe API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async cancelSubscription(params) {
    const { subscriptionId } = params;
    
    if (!subscriptionId) {
      throw new Error('Subscription ID is required');
    }

    try {
      const response = await axios.delete(
        `${this.baseUrl}/subscriptions/${subscriptionId}`,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          id: response.data.id,
          status: response.data.status,
          canceledAt: response.data.canceled_at
        }
      };
    } catch (error) {
      throw new Error(`Stripe API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async createInvoice(params) {
    const { customerId, description } = params;
    
    if (!customerId) {
      throw new Error('Customer ID is required');
    }

    try {
      const data = qs.stringify({
        customer: customerId,
        ...(description && { description })
      });

      const response = await axios.post(
        `${this.baseUrl}/invoices`,
        data,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          id: response.data.id,
          status: response.data.status,
          total: response.data.total,
          hostedInvoiceUrl: response.data.hosted_invoice_url
        }
      };
    } catch (error) {
      throw new Error(`Stripe API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async listCharges(params) {
    const { limit = 10, customerId } = params;

    try {
      const response = await axios.get(
        `${this.baseUrl}/charges`,
        {
          headers: this.getHeaders(),
          params: {
            limit,
            ...(customerId && { customer: customerId })
          }
        }
      );

      return {
        success: true,
        data: response.data.data.map(c => ({
          id: c.id,
          amount: c.amount,
          currency: c.currency,
          status: c.status,
          created: c.created
        }))
      };
    } catch (error) {
      throw new Error(`Stripe API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async refundPayment(params) {
    const { paymentIntentId, amount } = params;
    
    if (!paymentIntentId) {
      throw new Error('Payment Intent ID is required');
    }

    try {
      const data = qs.stringify({
        payment_intent: paymentIntentId,
        ...(amount && { amount })
      });

      const response = await axios.post(
        `${this.baseUrl}/refunds`,
        data,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          id: response.data.id,
          amount: response.data.amount,
          status: response.data.status
        }
      };
    } catch (error) {
      throw new Error(`Stripe API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async createProduct(params) {
    const { name, description } = params;
    
    if (!name) {
      throw new Error('Product name is required');
    }

    try {
      const data = qs.stringify({
        name,
        ...(description && { description })
      });

      const response = await axios.post(
        `${this.baseUrl}/products`,
        data,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          id: response.data.id,
          name: response.data.name,
          description: response.data.description
        }
      };
    } catch (error) {
      throw new Error(`Stripe API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async createPrice(params) {
    const { productId, unitAmount, currency = 'usd', recurring } = params;
    
    if (!productId || !unitAmount) {
      throw new Error('Product ID and unit amount are required');
    }

    try {
      const data = qs.stringify({
        product: productId,
        unit_amount: unitAmount,
        currency,
        ...(recurring && { 'recurring[interval]': recurring })
      });

      const response = await axios.post(
        `${this.baseUrl}/prices`,
        data,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          id: response.data.id,
          unitAmount: response.data.unit_amount,
          currency: response.data.currency
        }
      };
    } catch (error) {
      throw new Error(`Stripe API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

module.exports = StripeIntegration;
