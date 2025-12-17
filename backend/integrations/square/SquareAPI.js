/**
 * Square API Integration
 * Complete payment processing and point-of-sale system
 */

const axios = require('axios');

class SquareAPI {
  constructor(accessToken, environment = 'production') {
    this.accessToken = accessToken || process.env.SQUARE_ACCESS_TOKEN;
    this.environment = environment || process.env.SQUARE_ENVIRONMENT || 'production';
    this.baseURL = this.environment === 'production' 
      ? 'https://connect.squareup.com/v2'
      : 'https://connect.squareupsandbox.com/v2';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'Square-Version': '2024-01-18'
      }
    });
  }

  // ==================== PAYMENTS ====================

  async createPayment(data) {
    const payload = {
      source_id: data.source_id,
      idempotency_key: data.idempotency_key || this.generateIdempotencyKey(),
      amount_money: data.amount_money,
      ...(data.app_fee_money && { app_fee_money: data.app_fee_money }),
      ...(data.autocomplete !== undefined && { autocomplete: data.autocomplete }),
      ...(data.customer_id && { customer_id: data.customer_id }),
      ...(data.location_id && { location_id: data.location_id }),
      ...(data.reference_id && { reference_id: data.reference_id }),
      ...(data.note && { note: data.note }),
      ...(data.billing_address && { billing_address: data.billing_address }),
      ...(data.shipping_address && { shipping_address: data.shipping_address }),
      ...(data.buyer_email_address && { buyer_email_address: data.buyer_email_address }),
      ...(data.verification_token && { verification_token: data.verification_token })
    };

    const response = await this.client.post('/payments', payload);
    return { success: true, payment: response.data.payment };
  }

  async getPayment(paymentId) {
    const response = await this.client.get(`/payments/${paymentId}`);
    return { success: true, payment: response.data.payment };
  }

  async listPayments(options = {}) {
    const params = {
      ...(options.begin_time && { begin_time: options.begin_time }),
      ...(options.end_time && { end_time: options.end_time }),
      ...(options.sort_order && { sort_order: options.sort_order }),
      ...(options.cursor && { cursor: options.cursor }),
      ...(options.location_id && { location_id: options.location_id }),
      ...(options.total && { total: options.total }),
      ...(options.last_4 && { last_4: options.last_4 }),
      ...(options.card_brand && { card_brand: options.card_brand }),
      limit: options.limit || 100
    };

    const response = await this.client.get('/payments', { params });
    return { 
      success: true, 
      payments: response.data.payments,
      cursor: response.data.cursor
    };
  }

  async cancelPayment(paymentId) {
    const response = await this.client.post(`/payments/${paymentId}/cancel`);
    return { success: true, payment: response.data.payment };
  }

  async completePayment(paymentId) {
    const response = await this.client.post(`/payments/${paymentId}/complete`);
    return { success: true, payment: response.data.payment };
  }

  // ==================== REFUNDS ====================

  async createRefund(data) {
    const payload = {
      idempotency_key: data.idempotency_key || this.generateIdempotencyKey(),
      amount_money: data.amount_money,
      payment_id: data.payment_id,
      ...(data.reason && { reason: data.reason })
    };

    const response = await this.client.post('/refunds', payload);
    return { success: true, refund: response.data.refund };
  }

  async getRefund(refundId) {
    const response = await this.client.get(`/refunds/${refundId}`);
    return { success: true, refund: response.data.refund };
  }

  async listRefunds(options = {}) {
    const params = {
      ...(options.begin_time && { begin_time: options.begin_time }),
      ...(options.end_time && { end_time: options.end_time }),
      ...(options.sort_order && { sort_order: options.sort_order }),
      ...(options.cursor && { cursor: options.cursor }),
      ...(options.location_id && { location_id: options.location_id }),
      ...(options.status && { status: options.status }),
      ...(options.source_type && { source_type: options.source_type }),
      limit: options.limit || 100
    };

    const response = await this.client.get('/refunds', { params });
    return { 
      success: true, 
      refunds: response.data.refunds,
      cursor: response.data.cursor
    };
  }

  // ==================== CUSTOMERS ====================

  async createCustomer(data) {
    const payload = {
      idempotency_key: data.idempotency_key || this.generateIdempotencyKey(),
      ...(data.given_name && { given_name: data.given_name }),
      ...(data.family_name && { family_name: data.family_name }),
      ...(data.company_name && { company_name: data.company_name }),
      ...(data.nickname && { nickname: data.nickname }),
      ...(data.email_address && { email_address: data.email_address }),
      ...(data.address && { address: data.address }),
      ...(data.phone_number && { phone_number: data.phone_number }),
      ...(data.reference_id && { reference_id: data.reference_id }),
      ...(data.note && { note: data.note }),
      ...(data.birthday && { birthday: data.birthday })
    };

    const response = await this.client.post('/customers', payload);
    return { success: true, customer: response.data.customer };
  }

  async getCustomer(customerId) {
    const response = await this.client.get(`/customers/${customerId}`);
    return { success: true, customer: response.data.customer };
  }

  async updateCustomer(customerId, data) {
    const response = await this.client.put(`/customers/${customerId}`, data);
    return { success: true, customer: response.data.customer };
  }

  async deleteCustomer(customerId) {
    await this.client.delete(`/customers/${customerId}`);
    return { success: true, message: 'Customer deleted successfully' };
  }

  async listCustomers(options = {}) {
    const params = {
      ...(options.cursor && { cursor: options.cursor }),
      ...(options.sort_field && { sort_field: options.sort_field }),
      ...(options.sort_order && { sort_order: options.sort_order }),
      limit: options.limit || 100
    };

    const response = await this.client.get('/customers', { params });
    return { 
      success: true, 
      customers: response.data.customers,
      cursor: response.data.cursor
    };
  }

  async searchCustomers(query) {
    const payload = { query };
    const response = await this.client.post('/customers/search', payload);
    return { 
      success: true, 
      customers: response.data.customers,
      cursor: response.data.cursor
    };
  }

  // ==================== ORDERS ====================

  async createOrder(data) {
    const payload = {
      idempotency_key: data.idempotency_key || this.generateIdempotencyKey(),
      order: data.order
    };

    const response = await this.client.post('/orders', payload);
    return { success: true, order: response.data.order };
  }

  async getOrder(orderId) {
    const response = await this.client.get(`/orders/${orderId}`);
    return { success: true, order: response.data.order };
  }

  async updateOrder(orderId, data) {
    const payload = {
      idempotency_key: data.idempotency_key || this.generateIdempotencyKey(),
      order: data.order,
      ...(data.fields_to_clear && { fields_to_clear: data.fields_to_clear })
    };

    const response = await this.client.put(`/orders/${orderId}`, payload);
    return { success: true, order: response.data.order };
  }

  async payOrder(orderId, data) {
    const payload = {
      idempotency_key: data.idempotency_key || this.generateIdempotencyKey(),
      ...(data.payment_ids && { payment_ids: data.payment_ids })
    };

    const response = await this.client.post(`/orders/${orderId}/pay`, payload);
    return { success: true, order: response.data.order };
  }

  async searchOrders(query) {
    const payload = { query };
    const response = await this.client.post('/orders/search', payload);
    return { 
      success: true, 
      orders: response.data.orders,
      cursor: response.data.cursor
    };
  }

  // ==================== CATALOG ====================

  async listCatalog(options = {}) {
    const params = {
      ...(options.cursor && { cursor: options.cursor }),
      ...(options.types && { types: options.types }),
      ...(options.catalog_version && { catalog_version: options.catalog_version })
    };

    const response = await this.client.get('/catalog/list', { params });
    return { 
      success: true, 
      objects: response.data.objects,
      cursor: response.data.cursor
    };
  }

  async upsertCatalogObject(data) {
    const payload = {
      idempotency_key: data.idempotency_key || this.generateIdempotencyKey(),
      object: data.object
    };

    const response = await this.client.post('/catalog/object', payload);
    return { success: true, catalog_object: response.data.catalog_object };
  }

  async deleteCatalogObject(objectId) {
    await this.client.delete(`/catalog/object/${objectId}`);
    return { success: true, message: 'Catalog object deleted successfully' };
  }

  async retrieveCatalogObject(objectId, options = {}) {
    const params = {
      ...(options.include_related_objects && { include_related_objects: options.include_related_objects }),
      ...(options.catalog_version && { catalog_version: options.catalog_version })
    };

    const response = await this.client.get(`/catalog/object/${objectId}`, { params });
    return { success: true, object: response.data.object };
  }

  async searchCatalogObjects(query) {
    const payload = query;
    const response = await this.client.post('/catalog/search', payload);
    return { 
      success: true, 
      objects: response.data.objects,
      cursor: response.data.cursor
    };
  }

  async batchUpsertCatalogObjects(data) {
    const payload = {
      idempotency_key: data.idempotency_key || this.generateIdempotencyKey(),
      batches: data.batches
    };

    const response = await this.client.post('/catalog/batch-upsert', payload);
    return { success: true, objects: response.data.objects };
  }

  async batchDeleteCatalogObjects(objectIds) {
    const payload = { object_ids: objectIds };
    const response = await this.client.post('/catalog/batch-delete', payload);
    return { success: true, deleted_object_ids: response.data.deleted_object_ids };
  }

  async batchRetrieveCatalogObjects(data) {
    const payload = {
      object_ids: data.object_ids,
      ...(data.include_related_objects && { include_related_objects: data.include_related_objects }),
      ...(data.catalog_version && { catalog_version: data.catalog_version })
    };

    const response = await this.client.post('/catalog/batch-retrieve', payload);
    return { success: true, objects: response.data.objects };
  }

  // ==================== INVENTORY ====================

  async retrieveInventoryCount(catalogObjectId, options = {}) {
    const params = {
      ...(options.location_ids && { location_ids: options.location_ids }),
      ...(options.cursor && { cursor: options.cursor })
    };

    const response = await this.client.get(`/inventory/${catalogObjectId}`, { params });
    return { success: true, counts: response.data.counts };
  }

  async batchChangeInventory(data) {
    const payload = {
      idempotency_key: data.idempotency_key || this.generateIdempotencyKey(),
      changes: data.changes,
      ...(data.ignore_unchanged_counts && { ignore_unchanged_counts: data.ignore_unchanged_counts })
    };

    const response = await this.client.post('/inventory/batch-change', payload);
    return { success: true, counts: response.data.counts };
  }

  async batchRetrieveInventoryCounts(data) {
    const payload = {
      catalog_object_ids: data.catalog_object_ids,
      ...(data.location_ids && { location_ids: data.location_ids }),
      ...(data.updated_after && { updated_after: data.updated_after }),
      ...(data.cursor && { cursor: data.cursor })
    };

    const response = await this.client.post('/inventory/batch-retrieve-counts', payload);
    return { success: true, counts: response.data.counts };
  }

  // ==================== LOCATIONS ====================

  async listLocations() {
    const response = await this.client.get('/locations');
    return { success: true, locations: response.data.locations };
  }

  async getLocation(locationId) {
    const response = await this.client.get(`/locations/${locationId}`);
    return { success: true, location: response.data.location };
  }

  async updateLocation(locationId, data) {
    const payload = { location: data };
    const response = await this.client.put(`/locations/${locationId}`, payload);
    return { success: true, location: response.data.location };
  }

  // ==================== INVOICES ====================

  async createInvoice(data) {
    const payload = {
      invoice: data.invoice,
      idempotency_key: data.idempotency_key || this.generateIdempotencyKey()
    };

    const response = await this.client.post('/invoices', payload);
    return { success: true, invoice: response.data.invoice };
  }

  async getInvoice(invoiceId) {
    const response = await this.client.get(`/invoices/${invoiceId}`);
    return { success: true, invoice: response.data.invoice };
  }

  async updateInvoice(invoiceId, data) {
    const payload = {
      invoice: data.invoice,
      idempotency_key: data.idempotency_key || this.generateIdempotencyKey(),
      ...(data.fields_to_clear && { fields_to_clear: data.fields_to_clear })
    };

    const response = await this.client.put(`/invoices/${invoiceId}`, payload);
    return { success: true, invoice: response.data.invoice };
  }

  async deleteInvoice(invoiceId) {
    await this.client.delete(`/invoices/${invoiceId}`);
    return { success: true, message: 'Invoice deleted successfully' };
  }

  async listInvoices(locationId, options = {}) {
    const params = {
      location_id: locationId,
      ...(options.cursor && { cursor: options.cursor }),
      limit: options.limit || 100
    };

    const response = await this.client.get('/invoices', { params });
    return { 
      success: true, 
      invoices: response.data.invoices,
      cursor: response.data.cursor
    };
  }

  async publishInvoice(invoiceId, data) {
    const payload = {
      version: data.version,
      idempotency_key: data.idempotency_key || this.generateIdempotencyKey()
    };

    const response = await this.client.post(`/invoices/${invoiceId}/publish`, payload);
    return { success: true, invoice: response.data.invoice };
  }

  async cancelInvoice(invoiceId, data) {
    const payload = {
      version: data.version
    };

    const response = await this.client.post(`/invoices/${invoiceId}/cancel`, payload);
    return { success: true, invoice: response.data.invoice };
  }

  // ==================== SUBSCRIPTIONS ====================

  async createSubscription(data) {
    const payload = {
      idempotency_key: data.idempotency_key || this.generateIdempotencyKey(),
      location_id: data.location_id,
      plan_id: data.plan_id,
      customer_id: data.customer_id,
      ...(data.start_date && { start_date: data.start_date }),
      ...(data.canceled_date && { canceled_date: data.canceled_date }),
      ...(data.tax_percentage && { tax_percentage: data.tax_percentage }),
      ...(data.price_override_money && { price_override_money: data.price_override_money }),
      ...(data.card_id && { card_id: data.card_id }),
      ...(data.timezone && { timezone: data.timezone })
    };

    const response = await this.client.post('/subscriptions', payload);
    return { success: true, subscription: response.data.subscription };
  }

  async getSubscription(subscriptionId) {
    const response = await this.client.get(`/subscriptions/${subscriptionId}`);
    return { success: true, subscription: response.data.subscription };
  }

  async updateSubscription(subscriptionId, data) {
    const payload = {
      subscription: data.subscription
    };

    const response = await this.client.put(`/subscriptions/${subscriptionId}`, payload);
    return { success: true, subscription: response.data.subscription };
  }

  async cancelSubscription(subscriptionId) {
    const response = await this.client.post(`/subscriptions/${subscriptionId}/cancel`);
    return { success: true, subscription: response.data.subscription };
  }

  async listSubscriptions(options = {}) {
    const params = {
      ...(options.cursor && { cursor: options.cursor }),
      ...(options.customer_id && { customer_id: options.customer_id }),
      ...(options.location_id && { location_id: options.location_id }),
      limit: options.limit || 100
    };

    const response = await this.client.get('/subscriptions', { params });
    return { 
      success: true, 
      subscriptions: response.data.subscriptions,
      cursor: response.data.cursor
    };
  }

  async searchSubscriptions(query) {
    const payload = { query };
    const response = await this.client.post('/subscriptions/search', payload);
    return { 
      success: true, 
      subscriptions: response.data.subscriptions,
      cursor: response.data.cursor
    };
  }

  // ==================== CARDS ====================

  async createCard(data) {
    const payload = {
      idempotency_key: data.idempotency_key || this.generateIdempotencyKey(),
      source_id: data.source_id,
      card: data.card
    };

    const response = await this.client.post('/cards', payload);
    return { success: true, card: response.data.card };
  }

  async getCard(cardId) {
    const response = await this.client.get(`/cards/${cardId}`);
    return { success: true, card: response.data.card };
  }

  async disableCard(cardId) {
    const response = await this.client.post(`/cards/${cardId}/disable`);
    return { success: true, card: response.data.card };
  }

  async listCards(options = {}) {
    const params = {
      ...(options.cursor && { cursor: options.cursor }),
      ...(options.customer_id && { customer_id: options.customer_id }),
      ...(options.include_disabled && { include_disabled: options.include_disabled }),
      ...(options.reference_id && { reference_id: options.reference_id }),
      ...(options.sort_order && { sort_order: options.sort_order })
    };

    const response = await this.client.get('/cards', { params });
    return { 
      success: true, 
      cards: response.data.cards,
      cursor: response.data.cursor
    };
  }

  // ==================== HELPER METHODS ====================

  generateIdempotencyKey() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = SquareAPI;
