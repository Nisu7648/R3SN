/**
 * Shopify Integration - Complete Implementation
 * E-commerce platform
 */

const axios = require('axios');

class ShopifyIntegration {
  constructor(accessToken, shopDomain) {
    this.accessToken = accessToken;
    this.shopDomain = shopDomain;
    this.baseUrl = `https://${shopDomain}/admin/api/2024-01`;
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      }
    });
  }

  // Products
  async getProducts(params = {}) {
    const response = await this.client.get('/products.json', { params });
    return response.data.products;
  }

  async getProduct(productId) {
    const response = await this.client.get(`/products/${productId}.json`);
    return response.data.product;
  }

  async createProduct(productData) {
    const response = await this.client.post('/products.json', { product: productData });
    return response.data.product;
  }

  async updateProduct(productId, productData) {
    const response = await this.client.put(`/products/${productId}.json`, { product: productData });
    return response.data.product;
  }

  async deleteProduct(productId) {
    await this.client.delete(`/products/${productId}.json`);
    return { success: true };
  }

  // Orders
  async getOrders(params = {}) {
    const response = await this.client.get('/orders.json', { params });
    return response.data.orders;
  }

  async getOrder(orderId) {
    const response = await this.client.get(`/orders/${orderId}.json`);
    return response.data.order;
  }

  async createOrder(orderData) {
    const response = await this.client.post('/orders.json', { order: orderData });
    return response.data.order;
  }

  async updateOrder(orderId, orderData) {
    const response = await this.client.put(`/orders/${orderId}.json`, { order: orderData });
    return response.data.order;
  }

  async cancelOrder(orderId) {
    const response = await this.client.post(`/orders/${orderId}/cancel.json`);
    return response.data.order;
  }

  // Customers
  async getCustomers(params = {}) {
    const response = await this.client.get('/customers.json', { params });
    return response.data.customers;
  }

  async getCustomer(customerId) {
    const response = await this.client.get(`/customers/${customerId}.json`);
    return response.data.customer;
  }

  async createCustomer(customerData) {
    const response = await this.client.post('/customers.json', { customer: customerData });
    return response.data.customer;
  }

  async updateCustomer(customerId, customerData) {
    const response = await this.client.put(`/customers/${customerId}.json`, { customer: customerData });
    return response.data.customer;
  }

  // Inventory
  async getInventoryLevels(params = {}) {
    const response = await this.client.get('/inventory_levels.json', { params });
    return response.data.inventory_levels;
  }

  async adjustInventory(inventoryItemId, locationId, adjustment) {
    const response = await this.client.post('/inventory_levels/adjust.json', {
      inventory_item_id: inventoryItemId,
      location_id: locationId,
      available_adjustment: adjustment
    });
    return response.data.inventory_level;
  }

  // Collections
  async getCollections() {
    const response = await this.client.get('/custom_collections.json');
    return response.data.custom_collections;
  }

  async createCollection(collectionData) {
    const response = await this.client.post('/custom_collections.json', { custom_collection: collectionData });
    return response.data.custom_collection;
  }

  // Discounts
  async getPriceRules() {
    const response = await this.client.get('/price_rules.json');
    return response.data.price_rules;
  }

  async createPriceRule(priceRuleData) {
    const response = await this.client.post('/price_rules.json', { price_rule: priceRuleData });
    return response.data.price_rule;
  }

  // Shop
  async getShop() {
    const response = await this.client.get('/shop.json');
    return response.data.shop;
  }
}

module.exports = ShopifyIntegration;
