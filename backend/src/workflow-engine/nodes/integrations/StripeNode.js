/**
 * Stripe Node - Real Stripe Payment API Integration
 * Process payments, manage customers, subscriptions, invoices
 */

const axios = require('axios');

class StripeNode {
  constructor() {
    this.type = 'stripe.action';
    this.name = 'Stripe Payments';
    this.description = 'Process payments, manage customers and subscriptions';
    this.category = 'payment';
    this.icon = '💳';
    this.color = '#635BFF';

    this.parameters = [
      {
        name: 'secretKey',
        type: 'string',
        required: true,
        sensitive: true,
        description: 'Stripe Secret Key (sk_...)'
      },
      {
        name: 'action',
        type: 'select',
        required: true,
        options: [
          'create_payment_intent',
          'create_customer',
          'get_customer',
          'create_subscription',
          'cancel_subscription',
          'create_invoice',
          'list_charges',
          'refund_payment'
        ],
        description: 'Action to perform'
      },
      {
        name: 'amount',
        type: 'number',
        required: false,
        description: 'Amount in cents (e.g., 1000 = $10.00)'
      },
      {
        name: 'currency',
        type: 'string',
        default: 'usd',
        description: 'Currency code (usd, eur, gbp, etc.)'
      },
      {
        name: 'email',
        type: 'string',
        required: false,
        description: 'Customer email'
      },
      {
        name: 'customerId',
        type: 'string',
        required: false,
        description: 'Stripe customer ID'
      },
      {
        name: 'priceId',
        type: 'string',
        required: false,
        description: 'Stripe price ID for subscription'
      },
      {
        name: 'subscriptionId',
        type: 'string',
        required: false,
        description: 'Subscription ID'
      },
      {
        name: 'paymentIntentId',
        type: 'string',
        required: false,
        description: 'Payment Intent ID for refund'
      },
      {
        name: 'description',
        type: 'string',
        required: false,
        description: 'Payment description'
      }
    ];
  }

  async execute(inputs, parameters, context) {
    const {
      secretKey,
      action,
      amount,
      currency,
      email,
      customerId,
      priceId,
      subscriptionId,
      paymentIntentId,
      description
    } = parameters;

    if (!secretKey) {
      throw new Error('Stripe Secret Key is required');
    }

    const headers = {
      'Authorization': `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    try {
      switch (action) {
        case 'create_payment_intent':
          return await this.createPaymentIntent(headers, amount, currency, description);
        
        case 'create_customer':
          return await this.createCustomer(headers, email, description);
        
        case 'get_customer':
          return await this.getCustomer(headers, customerId);
        
        case 'create_subscription':
          return await this.createSubscription(headers, customerId, priceId);
        
        case 'cancel_subscription':
          return await this.cancelSubscription(headers, subscriptionId);
        
        case 'create_invoice':
          return await this.createInvoice(headers, customerId);
        
        case 'list_charges':
          return await this.listCharges(headers);
        
        case 'refund_payment':
          return await this.refundPayment(headers, paymentIntentId);
        
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      if (error.response) {
        throw new Error(`Stripe API error: ${error.response.data.error?.message || error.response.statusText}`);
      }
      throw new Error(`Stripe error: ${error.message}`);
    }
  }

  async createPaymentIntent(headers, amount, currency = 'usd', description) {
    const params = new URLSearchParams({
      amount: amount.toString(),
      currency,
      ...(description && { description })
    });

    const response = await axios.post(
      'https://api.stripe.com/v1/payment_intents',
      params,
      { headers }
    );
    
    return {
      success: true,
      paymentIntent: {
        id: response.data.id,
        amount: response.data.amount,
        currency: response.data.currency,
        status: response.data.status,
        clientSecret: response.data.client_secret
      }
    };
  }

  async createCustomer(headers, email, description) {
    const params = new URLSearchParams({
      ...(email && { email }),
      ...(description && { description })
    });

    const response = await axios.post(
      'https://api.stripe.com/v1/customers',
      params,
      { headers }
    );
    
    return {
      success: true,
      customer: {
        id: response.data.id,
        email: response.data.email,
        created: response.data.created
      }
    };
  }

  async getCustomer(headers, customerId) {
    if (!customerId) throw new Error('Customer ID is required');

    const response = await axios.get(
      `https://api.stripe.com/v1/customers/${customerId}`,
      { headers }
    );
    
    return {
      success: true,
      customer: {
        id: response.data.id,
        email: response.data.email,
        balance: response.data.balance,
        created: response.data.created
      }
    };
  }

  async createSubscription(headers, customerId, priceId) {
    if (!customerId || !priceId) {
      throw new Error('Customer ID and Price ID are required');
    }

    const params = new URLSearchParams({
      customer: customerId,
      'items[0][price]': priceId
    });

    const response = await axios.post(
      'https://api.stripe.com/v1/subscriptions',
      params,
      { headers }
    );
    
    return {
      success: true,
      subscription: {
        id: response.data.id,
        status: response.data.status,
        currentPeriodEnd: response.data.current_period_end
      }
    };
  }

  async cancelSubscription(headers, subscriptionId) {
    if (!subscriptionId) throw new Error('Subscription ID is required');

    const response = await axios.delete(
      `https://api.stripe.com/v1/subscriptions/${subscriptionId}`,
      { headers }
    );
    
    return {
      success: true,
      subscription: {
        id: response.data.id,
        status: response.data.status,
        canceledAt: response.data.canceled_at
      }
    };
  }

  async createInvoice(headers, customerId) {
    if (!customerId) throw new Error('Customer ID is required');

    const params = new URLSearchParams({
      customer: customerId
    });

    const response = await axios.post(
      'https://api.stripe.com/v1/invoices',
      params,
      { headers }
    );
    
    return {
      success: true,
      invoice: {
        id: response.data.id,
        status: response.data.status,
        total: response.data.total,
        hostedInvoiceUrl: response.data.hosted_invoice_url
      }
    };
  }

  async listCharges(headers) {
    const response = await axios.get(
      'https://api.stripe.com/v1/charges',
      { headers, params: { limit: 100 } }
    );
    
    return {
      success: true,
      charges: response.data.data.map(c => ({
        id: c.id,
        amount: c.amount,
        currency: c.currency,
        status: c.status,
        created: c.created
      }))
    };
  }

  async refundPayment(headers, paymentIntentId) {
    if (!paymentIntentId) throw new Error('Payment Intent ID is required');

    const params = new URLSearchParams({
      payment_intent: paymentIntentId
    });

    const response = await axios.post(
      'https://api.stripe.com/v1/refunds',
      params,
      { headers }
    );
    
    return {
      success: true,
      refund: {
        id: response.data.id,
        amount: response.data.amount,
        status: response.data.status
      }
    };
  }
}

module.exports = StripeNode;
