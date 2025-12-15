/**
 * Shopify Integration
 * Real Shopify Admin API for e-commerce
 */

const axios = require('axios');

class ShopifyIntegration {
  constructor(config) {
    this.config = config;
    this.validateConfig();
    this.baseUrl = `https://${this.config.shopName}.myshopify.com/admin/api/2024-01`;
  }

  validateConfig() {
    if (!this.config.shopName || !this.config.accessToken) {
      throw new Error('Shop name and access token are required');
    }
  }

  getHeaders() {
    return {
      'X-Shopify-Access-Token': this.config.accessToken,
      'Content-Type': 'application/json'
    };
  }

  async execute(action, params) {
    const actions = {
      listProducts: this.listProducts.bind(this),
      getProduct: this.getProduct.bind(this),
      createProduct: this.createProduct.bind(this),
      updateProduct: this.updateProduct.bind(this),
      deleteProduct: this.deleteProduct.bind(this),
      listOrders: this.listOrders.bind(this),
      getOrder: this.getOrder.bind(this),
      createOrder: this.createOrder.bind(this),
      listCustomers: this.listCustomers.bind(this),
      getCustomer: this.getCustomer.bind(this),
      createCustomer: this.createCustomer.bind(this),
    };

    if (!actions[action]) {
      throw new Error(`Unknown action: ${action}`);
    }

    return await actions[action](params);
  }

  async listProducts(params) {
    const { limit = 50, status = 'active' } = params;

    try {
      const response = await axios.get(
        `${this.baseUrl}/products.json`,
        {
          headers: this.getHeaders(),
          params: { limit, status }
        }
      );

      return {
        success: true,
        data: response.data.products.map(product => ({
          id: product.id,
          title: product.title,
          status: product.status,
          vendor: product.vendor,
          productType: product.product_type,
          createdAt: product.created_at
        }))
      };
    } catch (error) {
      throw new Error(`Shopify API error: ${error.response?.data?.errors || error.message}`);
    }
  }

  async getProduct(params) {
    const { productId } = params;
    
    if (!productId) {
      throw new Error('Product ID is required');
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/products/${productId}.json`,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          id: response.data.product.id,
          title: response.data.product.title,
          bodyHtml: response.data.product.body_html,
          vendor: response.data.product.vendor,
          productType: response.data.product.product_type,
          variants: response.data.product.variants
        }
      };
    } catch (error) {
      throw new Error(`Shopify API error: ${error.response?.data?.errors || error.message}`);
    }
  }

  async createProduct(params) {
    const { title, bodyHtml, vendor, productType, variants } = params;
    
    if (!title) {
      throw new Error('Product title is required');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/products.json`,
        {
          product: {
            title,
            body_html: bodyHtml,
            vendor,
            product_type: productType,
            variants
          }
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          id: response.data.product.id,
          title: response.data.product.title,
          status: response.data.product.status
        }
      };
    } catch (error) {
      throw new Error(`Shopify API error: ${error.response?.data?.errors || error.message}`);
    }
  }

  async updateProduct(params) {
    const { productId, title, bodyHtml, vendor, productType } = params;
    
    if (!productId) {
      throw new Error('Product ID is required');
    }

    try {
      const response = await axios.put(
        `${this.baseUrl}/products/${productId}.json`,
        {
          product: {
            id: productId,
            ...(title && { title }),
            ...(bodyHtml && { body_html: bodyHtml }),
            ...(vendor && { vendor }),
            ...(productType && { product_type: productType })
          }
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          id: response.data.product.id,
          title: response.data.product.title
        }
      };
    } catch (error) {
      throw new Error(`Shopify API error: ${error.response?.data?.errors || error.message}`);
    }
  }

  async deleteProduct(params) {
    const { productId } = params;
    
    if (!productId) {
      throw new Error('Product ID is required');
    }

    try {
      await axios.delete(
        `${this.baseUrl}/products/${productId}.json`,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: { deleted: true, productId }
      };
    } catch (error) {
      throw new Error(`Shopify API error: ${error.response?.data?.errors || error.message}`);
    }
  }

  async listOrders(params) {
    const { limit = 50, status = 'any' } = params;

    try {
      const response = await axios.get(
        `${this.baseUrl}/orders.json`,
        {
          headers: this.getHeaders(),
          params: { limit, status }
        }
      );

      return {
        success: true,
        data: response.data.orders.map(order => ({
          id: order.id,
          orderNumber: order.order_number,
          email: order.email,
          totalPrice: order.total_price,
          financialStatus: order.financial_status,
          fulfillmentStatus: order.fulfillment_status,
          createdAt: order.created_at
        }))
      };
    } catch (error) {
      throw new Error(`Shopify API error: ${error.response?.data?.errors || error.message}`);
    }
  }

  async getOrder(params) {
    const { orderId } = params;
    
    if (!orderId) {
      throw new Error('Order ID is required');
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/orders/${orderId}.json`,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          id: response.data.order.id,
          orderNumber: response.data.order.order_number,
          email: response.data.order.email,
          totalPrice: response.data.order.total_price,
          lineItems: response.data.order.line_items,
          customer: response.data.order.customer
        }
      };
    } catch (error) {
      throw new Error(`Shopify API error: ${error.response?.data?.errors || error.message}`);
    }
  }

  async createOrder(params) {
    const { lineItems, customer, email } = params;
    
    if (!lineItems || !Array.isArray(lineItems)) {
      throw new Error('Line items array is required');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/orders.json`,
        {
          order: {
            line_items: lineItems,
            ...(customer && { customer }),
            ...(email && { email })
          }
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          id: response.data.order.id,
          orderNumber: response.data.order.order_number,
          totalPrice: response.data.order.total_price
        }
      };
    } catch (error) {
      throw new Error(`Shopify API error: ${error.response?.data?.errors || error.message}`);
    }
  }

  async listCustomers(params) {
    const { limit = 50 } = params;

    try {
      const response = await axios.get(
        `${this.baseUrl}/customers.json`,
        {
          headers: this.getHeaders(),
          params: { limit }
        }
      );

      return {
        success: true,
        data: response.data.customers.map(customer => ({
          id: customer.id,
          email: customer.email,
          firstName: customer.first_name,
          lastName: customer.last_name,
          ordersCount: customer.orders_count,
          totalSpent: customer.total_spent
        }))
      };
    } catch (error) {
      throw new Error(`Shopify API error: ${error.response?.data?.errors || error.message}`);
    }
  }

  async getCustomer(params) {
    const { customerId } = params;
    
    if (!customerId) {
      throw new Error('Customer ID is required');
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/customers/${customerId}.json`,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          id: response.data.customer.id,
          email: response.data.customer.email,
          firstName: response.data.customer.first_name,
          lastName: response.data.customer.last_name,
          phone: response.data.customer.phone,
          ordersCount: response.data.customer.orders_count,
          totalSpent: response.data.customer.total_spent
        }
      };
    } catch (error) {
      throw new Error(`Shopify API error: ${error.response?.data?.errors || error.message}`);
    }
  }

  async createCustomer(params) {
    const { email, firstName, lastName, phone } = params;
    
    if (!email) {
      throw new Error('Email is required');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/customers.json`,
        {
          customer: {
            email,
            first_name: firstName,
            last_name: lastName,
            phone
          }
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          id: response.data.customer.id,
          email: response.data.customer.email
        }
      };
    } catch (error) {
      throw new Error(`Shopify API error: ${error.response?.data?.errors || error.message}`);
    }
  }
}

module.exports = ShopifyIntegration;
