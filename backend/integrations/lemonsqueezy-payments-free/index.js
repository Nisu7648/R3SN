const axios = require('axios');

/**
 * Lemon Squeezy Payments Premium Integration
 * FREE Payment Processing & Subscriptions
 * No monthly fees (saves $100+/month vs Stripe)
 * Perfect for SaaS, digital products, subscriptions
 */
class LemonSqueezyIntegration {
  constructor(apiKey) {
    this.apiKey = apiKey || 'YOUR_LEMONSQUEEZY_API_KEY';
    this.baseURL = 'https://api.lemonsqueezy.com/v1';
  }

  /**
   * Get authenticated user
   */
  async getUser() {
    try {
      const response = await axios.get(`${this.baseURL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json'
        }
      });

      return {
        success: true,
        data: response.data.data,
        user: response.data.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List all stores
   */
  async listStores() {
    try {
      const response = await axios.get(`${this.baseURL}/stores`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/vnd.api+json'
        }
      });

      return {
        success: true,
        data: response.data.data,
        stores: response.data.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get store by ID
   */
  async getStore(storeId) {
    try {
      const response = await axios.get(`${this.baseURL}/stores/${storeId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/vnd.api+json'
        }
      });

      return {
        success: true,
        data: response.data.data,
        store: response.data.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List all products
   */
  async listProducts(storeId = null) {
    try {
      const params = storeId ? { 'filter[store_id]': storeId } : {};
      
      const response = await axios.get(`${this.baseURL}/products`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/vnd.api+json'
        },
        params
      });

      return {
        success: true,
        data: response.data.data,
        products: response.data.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get product by ID
   */
  async getProduct(productId) {
    try {
      const response = await axios.get(`${this.baseURL}/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/vnd.api+json'
        }
      });

      return {
        success: true,
        data: response.data.data,
        product: response.data.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List all variants
   */
  async listVariants(productId = null) {
    try {
      const params = productId ? { 'filter[product_id]': productId } : {};
      
      const response = await axios.get(`${this.baseURL}/variants`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/vnd.api+json'
        },
        params
      });

      return {
        success: true,
        data: response.data.data,
        variants: response.data.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get variant by ID
   */
  async getVariant(variantId) {
    try {
      const response = await axios.get(`${this.baseURL}/variants/${variantId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/vnd.api+json'
        }
      });

      return {
        success: true,
        data: response.data.data,
        variant: response.data.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List all orders
   */
  async listOrders(storeId = null, page = 1, perPage = 10) {
    try {
      const params = {
        'page[number]': page,
        'page[size]': perPage
      };
      
      if (storeId) params['filter[store_id]'] = storeId;

      const response = await axios.get(`${this.baseURL}/orders`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/vnd.api+json'
        },
        params
      });

      return {
        success: true,
        data: response.data.data,
        orders: response.data.data,
        meta: response.data.meta
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId) {
    try {
      const response = await axios.get(`${this.baseURL}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/vnd.api+json'
        }
      });

      return {
        success: true,
        data: response.data.data,
        order: response.data.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List all subscriptions
   */
  async listSubscriptions(storeId = null, page = 1, perPage = 10) {
    try {
      const params = {
        'page[number]': page,
        'page[size]': perPage
      };
      
      if (storeId) params['filter[store_id]'] = storeId;

      const response = await axios.get(`${this.baseURL}/subscriptions`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/vnd.api+json'
        },
        params
      });

      return {
        success: true,
        data: response.data.data,
        subscriptions: response.data.data,
        meta: response.data.meta
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get subscription by ID
   */
  async getSubscription(subscriptionId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/subscriptions/${subscriptionId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/vnd.api+json'
          }
        }
      );

      return {
        success: true,
        data: response.data.data,
        subscription: response.data.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update subscription
   */
  async updateSubscription(subscriptionId, updates) {
    try {
      const response = await axios.patch(
        `${this.baseURL}/subscriptions/${subscriptionId}`,
        {
          data: {
            type: 'subscriptions',
            id: subscriptionId,
            attributes: updates
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/vnd.api+json',
            'Content-Type': 'application/vnd.api+json'
          }
        }
      );

      return {
        success: true,
        data: response.data.data,
        subscription: response.data.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId) {
    try {
      const response = await axios.delete(
        `${this.baseURL}/subscriptions/${subscriptionId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/vnd.api+json'
          }
        }
      );

      return {
        success: true,
        message: 'Subscription cancelled successfully',
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List all customers
   */
  async listCustomers(storeId = null, page = 1, perPage = 10) {
    try {
      const params = {
        'page[number]': page,
        'page[size]': perPage
      };
      
      if (storeId) params['filter[store_id]'] = storeId;

      const response = await axios.get(`${this.baseURL}/customers`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/vnd.api+json'
        },
        params
      });

      return {
        success: true,
        data: response.data.data,
        customers: response.data.data,
        meta: response.data.meta
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get customer by ID
   */
  async getCustomer(customerId) {
    try {
      const response = await axios.get(`${this.baseURL}/customers/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/vnd.api+json'
        }
      });

      return {
        success: true,
        data: response.data.data,
        customer: response.data.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create checkout
   */
  async createCheckout(storeId, variantId, checkoutData = {}) {
    try {
      const response = await axios.post(
        `${this.baseURL}/checkouts`,
        {
          data: {
            type: 'checkouts',
            attributes: {
              store_id: storeId,
              variant_id: variantId,
              ...checkoutData
            }
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/vnd.api+json',
            'Content-Type': 'application/vnd.api+json'
          }
        }
      );

      return {
        success: true,
        data: response.data.data,
        checkout: response.data.data,
        checkoutUrl: response.data.data.attributes.url
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List discounts
   */
  async listDiscounts(storeId = null) {
    try {
      const params = storeId ? { 'filter[store_id]': storeId } : {};

      const response = await axios.get(`${this.baseURL}/discounts`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/vnd.api+json'
        },
        params
      });

      return {
        success: true,
        data: response.data.data,
        discounts: response.data.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create discount
   */
  async createDiscount(storeId, discountData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/discounts`,
        {
          data: {
            type: 'discounts',
            attributes: {
              store_id: storeId,
              ...discountData
            }
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/vnd.api+json',
            'Content-Type': 'application/vnd.api+json'
          }
        }
      );

      return {
        success: true,
        data: response.data.data,
        discount: response.data.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List license keys
   */
  async listLicenseKeys(storeId = null, page = 1, perPage = 10) {
    try {
      const params = {
        'page[number]': page,
        'page[size]': perPage
      };
      
      if (storeId) params['filter[store_id]'] = storeId;

      const response = await axios.get(`${this.baseURL}/license-keys`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/vnd.api+json'
        },
        params
      });

      return {
        success: true,
        data: response.data.data,
        licenseKeys: response.data.data,
        meta: response.data.meta
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get license key by ID
   */
  async getLicenseKey(licenseKeyId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/license-keys/${licenseKeyId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/vnd.api+json'
          }
        }
      );

      return {
        success: true,
        data: response.data.data,
        licenseKey: response.data.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Validate license key
   */
  async validateLicense(licenseKey, instanceId = null) {
    try {
      const payload = { license_key: licenseKey };
      if (instanceId) payload.instance_id = instanceId;

      const response = await axios.post(
        `${this.baseURL}/license-keys/validate`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/vnd.api+json',
            'Content-Type': 'application/vnd.api+json'
          }
        }
      );

      return {
        success: true,
        valid: response.data.valid,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Activate license
   */
  async activateLicense(licenseKeyId, instanceName) {
    try {
      const response = await axios.post(
        `${this.baseURL}/license-keys/${licenseKeyId}/activate`,
        {
          data: {
            type: 'license-key-instances',
            attributes: {
              name: instanceName
            }
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/vnd.api+json',
            'Content-Type': 'application/vnd.api+json'
          }
        }
      );

      return {
        success: true,
        data: response.data.data,
        instance: response.data.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Deactivate license
   */
  async deactivateLicense(licenseKeyId, instanceId) {
    try {
      const response = await axios.delete(
        `${this.baseURL}/license-keys/${licenseKeyId}/deactivate`,
        {
          data: {
            data: {
              type: 'license-key-instances',
              id: instanceId
            }
          },
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/vnd.api+json',
            'Content-Type': 'application/vnd.api+json'
          }
        }
      );

      return {
        success: true,
        message: 'License deactivated successfully'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List webhooks
   */
  async listWebhooks(storeId = null) {
    try {
      const params = storeId ? { 'filter[store_id]': storeId } : {};

      const response = await axios.get(`${this.baseURL}/webhooks`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/vnd.api+json'
        },
        params
      });

      return {
        success: true,
        data: response.data.data,
        webhooks: response.data.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create webhook
   */
  async createWebhook(storeId, url, events, secret = null) {
    try {
      const response = await axios.post(
        `${this.baseURL}/webhooks`,
        {
          data: {
            type: 'webhooks',
            attributes: {
              store_id: storeId,
              url,
              events,
              ...(secret && { secret })
            }
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/vnd.api+json',
            'Content-Type': 'application/vnd.api+json'
          }
        }
      );

      return {
        success: true,
        data: response.data.data,
        webhook: response.data.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update webhook
   */
  async updateWebhook(webhookId, updates) {
    try {
      const response = await axios.patch(
        `${this.baseURL}/webhooks/${webhookId}`,
        {
          data: {
            type: 'webhooks',
            id: webhookId,
            attributes: updates
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/vnd.api+json',
            'Content-Type': 'application/vnd.api+json'
          }
        }
      );

      return {
        success: true,
        data: response.data.data,
        webhook: response.data.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(webhookId) {
    try {
      await axios.delete(`${this.baseURL}/webhooks/${webhookId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/vnd.api+json'
        }
      });

      return {
        success: true,
        message: 'Webhook deleted successfully'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = LemonSqueezyIntegration;
