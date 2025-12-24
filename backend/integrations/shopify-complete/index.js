const axios = require('axios');

class ShopifyIntegration {
  constructor(shopName, accessToken) {
    this.shopName = shopName;
    this.accessToken = accessToken;
    this.baseURL = `https://${shopName}.myshopify.com/admin/api/2024-01`;
    this.headers = { 'X-Shopify-Access-Token': accessToken, 'Content-Type': 'application/json' };
  }

  async getProducts(limit = 50) {
    const response = await axios.get(`${this.baseURL}/products.json`, {
      headers: this.headers,
      params: { limit }
    });
    return response.data;
  }

  async getProduct(productId) {
    const response = await axios.get(`${this.baseURL}/products/${productId}.json`, {
      headers: this.headers
    });
    return response.data;
  }

  async createProduct(title, bodyHtml, vendor, productType, price) {
    const response = await axios.post(
      `${this.baseURL}/products.json`,
      {
        product: {
          title,
          body_html: bodyHtml,
          vendor,
          product_type: productType,
          variants: [{ price }]
        }
      },
      { headers: this.headers }
    );
    return response.data;
  }

  async updateProduct(productId, updates) {
    const response = await axios.put(
      `${this.baseURL}/products/${productId}.json`,
      { product: updates },
      { headers: this.headers }
    );
    return response.data;
  }

  async deleteProduct(productId) {
    const response = await axios.delete(`${this.baseURL}/products/${productId}.json`, {
      headers: this.headers
    });
    return response.data;
  }

  async getOrders(limit = 50) {
    const response = await axios.get(`${this.baseURL}/orders.json`, {
      headers: this.headers,
      params: { limit }
    });
    return response.data;
  }

  async getOrder(orderId) {
    const response = await axios.get(`${this.baseURL}/orders/${orderId}.json`, {
      headers: this.headers
    });
    return response.data;
  }

  async getCustomers(limit = 50) {
    const response = await axios.get(`${this.baseURL}/customers.json`, {
      headers: this.headers,
      params: { limit }
    });
    return response.data;
  }
}

module.exports = ShopifyIntegration;
