const axios = require('axios');

class WooCommerceIntegration {
  constructor(siteUrl, consumerKey, consumerSecret) {
    this.siteUrl = siteUrl;
    this.consumerKey = consumerKey;
    this.consumerSecret = consumerSecret;
    this.baseURL = `${siteUrl}/wp-json/wc/v3`;
    this.auth = { username: consumerKey, password: consumerSecret };
  }

  async getProducts(perPage = 50) {
    const response = await axios.get(`${this.baseURL}/products`, {
      auth: this.auth,
      params: { per_page: perPage }
    });
    return response.data;
  }

  async getProduct(productId) {
    const response = await axios.get(`${this.baseURL}/products/${productId}`, {
      auth: this.auth
    });
    return response.data;
  }

  async createProduct(name, type, regularPrice, description = '') {
    const response = await axios.post(
      `${this.baseURL}/products`,
      { name, type, regular_price: regularPrice, description },
      { auth: this.auth }
    );
    return response.data;
  }

  async updateProduct(productId, updates) {
    const response = await axios.put(
      `${this.baseURL}/products/${productId}`,
      updates,
      { auth: this.auth }
    );
    return response.data;
  }

  async deleteProduct(productId) {
    const response = await axios.delete(`${this.baseURL}/products/${productId}`, {
      auth: this.auth,
      params: { force: true }
    });
    return response.data;
  }

  async getOrders(perPage = 50) {
    const response = await axios.get(`${this.baseURL}/orders`, {
      auth: this.auth,
      params: { per_page: perPage }
    });
    return response.data;
  }

  async getOrder(orderId) {
    const response = await axios.get(`${this.baseURL}/orders/${orderId}`, {
      auth: this.auth
    });
    return response.data;
  }

  async getCustomers(perPage = 50) {
    const response = await axios.get(`${this.baseURL}/customers`, {
      auth: this.auth,
      params: { per_page: perPage }
    });
    return response.data;
  }
}

module.exports = WooCommerceIntegration;
