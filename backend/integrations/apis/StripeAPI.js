/**
 * Stripe API Integration - REAL IMPLEMENTATION
 * Payments, subscriptions, customers, invoices
 */

const axios = require('axios');

class StripeAPI {
    constructor(apiKey) {
        this.apiKey = apiKey || process.env.STRIPE_SECRET_KEY;
        this.baseUrl = 'https://api.stripe.com/v1';
    }

    /**
     * Make authenticated request
     */
    async request(method, endpoint, data = null) {
        const config = {
            method,
            url: `${this.baseUrl}${endpoint}`,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        if (data) {
            config.data = new URLSearchParams(data).toString();
        }

        const response = await axios(config);
        return response.data;
    }

    // ============================================
    // PAYMENTS
    // ============================================

    /**
     * Create payment intent
     */
    async createPaymentIntent(amount, currency = 'usd', options = {}) {
        return await this.request('POST', '/payment_intents', {
            amount: Math.round(amount * 100), // Convert to cents
            currency,
            ...options
        });
    }

    /**
     * Capture payment intent
     */
    async capturePayment(paymentIntentId) {
        return await this.request('POST', `/payment_intents/${paymentIntentId}/capture`);
    }

    /**
     * Create charge (legacy)
     */
    async createCharge(amount, currency, source, description) {
        return await this.request('POST', '/charges', {
            amount: Math.round(amount * 100),
            currency,
            source,
            description
        });
    }

    /**
     * Refund payment
     */
    async createRefund(chargeId, amount = null) {
        const data = { charge: chargeId };
        if (amount) data.amount = Math.round(amount * 100);
        return await this.request('POST', '/refunds', data);
    }

    // ============================================
    // CUSTOMERS
    // ============================================

    /**
     * Create customer
     */
    async createCustomer(email, name, metadata = {}) {
        return await this.request('POST', '/customers', {
            email,
            name,
            metadata
        });
    }

    /**
     * Get customer
     */
    async getCustomer(customerId) {
        return await this.request('GET', `/customers/${customerId}`);
    }

    /**
     * Update customer
     */
    async updateCustomer(customerId, updates) {
        return await this.request('POST', `/customers/${customerId}`, updates);
    }

    /**
     * Delete customer
     */
    async deleteCustomer(customerId) {
        return await this.request('DELETE', `/customers/${customerId}`);
    }

    /**
     * List customers
     */
    async listCustomers(limit = 10) {
        return await this.request('GET', `/customers?limit=${limit}`);
    }

    // ============================================
    // SUBSCRIPTIONS
    // ============================================

    /**
     * Create subscription
     */
    async createSubscription(customerId, priceId, options = {}) {
        return await this.request('POST', '/subscriptions', {
            customer: customerId,
            items: [{ price: priceId }],
            ...options
        });
    }

    /**
     * Get subscription
     */
    async getSubscription(subscriptionId) {
        return await this.request('GET', `/subscriptions/${subscriptionId}`);
    }

    /**
     * Update subscription
     */
    async updateSubscription(subscriptionId, updates) {
        return await this.request('POST', `/subscriptions/${subscriptionId}`, updates);
    }

    /**
     * Cancel subscription
     */
    async cancelSubscription(subscriptionId, immediately = false) {
        if (immediately) {
            return await this.request('DELETE', `/subscriptions/${subscriptionId}`);
        }
        return await this.request('POST', `/subscriptions/${subscriptionId}`, {
            cancel_at_period_end: true
        });
    }

    /**
     * List subscriptions
     */
    async listSubscriptions(customerId = null, limit = 10) {
        const params = new URLSearchParams({ limit });
        if (customerId) params.append('customer', customerId);
        return await this.request('GET', `/subscriptions?${params}`);
    }

    // ============================================
    // PRODUCTS & PRICES
    // ============================================

    /**
     * Create product
     */
    async createProduct(name, description, metadata = {}) {
        return await this.request('POST', '/products', {
            name,
            description,
            metadata
        });
    }

    /**
     * Create price
     */
    async createPrice(productId, amount, currency = 'usd', recurring = null) {
        const data = {
            product: productId,
            unit_amount: Math.round(amount * 100),
            currency
        };
        if (recurring) {
            data.recurring = recurring; // { interval: 'month' }
        }
        return await this.request('POST', '/prices', data);
    }

    /**
     * List products
     */
    async listProducts(limit = 10) {
        return await this.request('GET', `/products?limit=${limit}`);
    }

    // ============================================
    // INVOICES
    // ============================================

    /**
     * Create invoice
     */
    async createInvoice(customerId, options = {}) {
        return await this.request('POST', '/invoices', {
            customer: customerId,
            ...options
        });
    }

    /**
     * Finalize invoice
     */
    async finalizeInvoice(invoiceId) {
        return await this.request('POST', `/invoices/${invoiceId}/finalize`);
    }

    /**
     * Pay invoice
     */
    async payInvoice(invoiceId) {
        return await this.request('POST', `/invoices/${invoiceId}/pay`);
    }

    /**
     * List invoices
     */
    async listInvoices(customerId = null, limit = 10) {
        const params = new URLSearchParams({ limit });
        if (customerId) params.append('customer', customerId);
        return await this.request('GET', `/invoices?${params}`);
    }

    // ============================================
    // PAYMENT METHODS
    // ============================================

    /**
     * Attach payment method to customer
     */
    async attachPaymentMethod(paymentMethodId, customerId) {
        return await this.request('POST', `/payment_methods/${paymentMethodId}/attach`, {
            customer: customerId
        });
    }

    /**
     * Detach payment method
     */
    async detachPaymentMethod(paymentMethodId) {
        return await this.request('POST', `/payment_methods/${paymentMethodId}/detach`);
    }

    /**
     * List payment methods
     */
    async listPaymentMethods(customerId, type = 'card') {
        return await this.request('GET', `/payment_methods?customer=${customerId}&type=${type}`);
    }

    // ============================================
    // BALANCE & TRANSACTIONS
    // ============================================

    /**
     * Get balance
     */
    async getBalance() {
        return await this.request('GET', '/balance');
    }

    /**
     * List balance transactions
     */
    async listBalanceTransactions(limit = 10) {
        return await this.request('GET', `/balance_transactions?limit=${limit}`);
    }

    // ============================================
    // WEBHOOKS
    // ============================================

    /**
     * Construct webhook event
     */
    constructWebhookEvent(payload, signature, secret) {
        const stripe = require('stripe')(this.apiKey);
        return stripe.webhooks.constructEvent(payload, signature, secret);
    }

    // ============================================
    // CHECKOUT
    // ============================================

    /**
     * Create checkout session
     */
    async createCheckoutSession(lineItems, successUrl, cancelUrl, options = {}) {
        return await this.request('POST', '/checkout/sessions', {
            line_items: lineItems,
            mode: options.mode || 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
            ...options
        });
    }

    /**
     * Get checkout session
     */
    async getCheckoutSession(sessionId) {
        return await this.request('GET', `/checkout/sessions/${sessionId}`);
    }
}

module.exports = StripeAPI;
