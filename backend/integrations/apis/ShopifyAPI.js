/**
 * Shopify API Integration - COMPLETE IMPLEMENTATION
 * Products, Orders, Customers, Inventory, Collections
 */

const axios = require('axios');

class ShopifyAPI {
    constructor(shopName, accessToken, apiVersion = '2024-01') {
        this.shopName = shopName || process.env.SHOPIFY_SHOP_NAME;
        this.accessToken = accessToken || process.env.SHOPIFY_ACCESS_TOKEN;
        this.apiVersion = apiVersion;
        this.baseUrl = `https://${this.shopName}.myshopify.com/admin/api/${this.apiVersion}`;
    }

    /**
     * Make authenticated request
     */
    async request(method, endpoint, data = null) {
        const config = {
            method,
            url: `${this.baseUrl}${endpoint}`,
            headers: {
                'X-Shopify-Access-Token': this.accessToken,
                'Content-Type': 'application/json'
            }
        };

        if (data) {
            config.data = data;
        }

        const response = await axios(config);
        return response.data;
    }

    // ============================================
    // PRODUCTS
    // ============================================

    /**
     * Create product
     */
    async createProduct(title, bodyHtml, vendor, productType, options = {}) {
        return await this.request('POST', '/products.json', {
            product: {
                title,
                body_html: bodyHtml,
                vendor,
                product_type: productType,
                ...options
            }
        });
    }

    /**
     * Get product
     */
    async getProduct(productId) {
        return await this.request('GET', `/products/${productId}.json`);
    }

    /**
     * List products
     */
    async listProducts(options = {}) {
        const params = new URLSearchParams(options).toString();
        return await this.request('GET', `/products.json?${params}`);
    }

    /**
     * Update product
     */
    async updateProduct(productId, updates) {
        return await this.request('PUT', `/products/${productId}.json`, {
            product: updates
        });
    }

    /**
     * Delete product
     */
    async deleteProduct(productId) {
        return await this.request('DELETE', `/products/${productId}.json`);
    }

    /**
     * Count products
     */
    async countProducts(options = {}) {
        const params = new URLSearchParams(options).toString();
        return await this.request('GET', `/products/count.json?${params}`);
    }

    // ============================================
    // VARIANTS
    // ============================================

    /**
     * Create variant
     */
    async createVariant(productId, variant) {
        return await this.request('POST', `/products/${productId}/variants.json`, {
            variant
        });
    }

    /**
     * Get variant
     */
    async getVariant(variantId) {
        return await this.request('GET', `/variants/${variantId}.json`);
    }

    /**
     * Update variant
     */
    async updateVariant(variantId, updates) {
        return await this.request('PUT', `/variants/${variantId}.json`, {
            variant: updates
        });
    }

    /**
     * Delete variant
     */
    async deleteVariant(productId, variantId) {
        return await this.request('DELETE', `/products/${productId}/variants/${variantId}.json`);
    }

    // ============================================
    // ORDERS
    // ============================================

    /**
     * Create order
     */
    async createOrder(lineItems, customer, options = {}) {
        return await this.request('POST', '/orders.json', {
            order: {
                line_items: lineItems,
                customer,
                ...options
            }
        });
    }

    /**
     * Get order
     */
    async getOrder(orderId) {
        return await this.request('GET', `/orders/${orderId}.json`);
    }

    /**
     * List orders
     */
    async listOrders(options = {}) {
        const params = new URLSearchParams(options).toString();
        return await this.request('GET', `/orders.json?${params}`);
    }

    /**
     * Update order
     */
    async updateOrder(orderId, updates) {
        return await this.request('PUT', `/orders/${orderId}.json`, {
            order: updates
        });
    }

    /**
     * Cancel order
     */
    async cancelOrder(orderId, options = {}) {
        return await this.request('POST', `/orders/${orderId}/cancel.json`, options);
    }

    /**
     * Close order
     */
    async closeOrder(orderId) {
        return await this.request('POST', `/orders/${orderId}/close.json`);
    }

    /**
     * Count orders
     */
    async countOrders(options = {}) {
        const params = new URLSearchParams(options).toString();
        return await this.request('GET', `/orders/count.json?${params}`);
    }

    // ============================================
    // CUSTOMERS
    // ============================================

    /**
     * Create customer
     */
    async createCustomer(email, firstName, lastName, options = {}) {
        return await this.request('POST', '/customers.json', {
            customer: {
                email,
                first_name: firstName,
                last_name: lastName,
                ...options
            }
        });
    }

    /**
     * Get customer
     */
    async getCustomer(customerId) {
        return await this.request('GET', `/customers/${customerId}.json`);
    }

    /**
     * List customers
     */
    async listCustomers(options = {}) {
        const params = new URLSearchParams(options).toString();
        return await this.request('GET', `/customers.json?${params}`);
    }

    /**
     * Update customer
     */
    async updateCustomer(customerId, updates) {
        return await this.request('PUT', `/customers/${customerId}.json`, {
            customer: updates
        });
    }

    /**
     * Delete customer
     */
    async deleteCustomer(customerId) {
        return await this.request('DELETE', `/customers/${customerId}.json`);
    }

    /**
     * Search customers
     */
    async searchCustomers(query) {
        return await this.request('GET', `/customers/search.json?query=${encodeURIComponent(query)}`);
    }

    // ============================================
    // INVENTORY
    // ============================================

    /**
     * Get inventory level
     */
    async getInventoryLevel(inventoryItemId, locationId) {
        return await this.request('GET', 
            `/inventory_levels.json?inventory_item_ids=${inventoryItemId}&location_ids=${locationId}`
        );
    }

    /**
     * Set inventory level
     */
    async setInventoryLevel(inventoryItemId, locationId, available) {
        return await this.request('POST', '/inventory_levels/set.json', {
            inventory_item_id: inventoryItemId,
            location_id: locationId,
            available
        });
    }

    /**
     * Adjust inventory level
     */
    async adjustInventoryLevel(inventoryItemId, locationId, adjustment) {
        return await this.request('POST', '/inventory_levels/adjust.json', {
            inventory_item_id: inventoryItemId,
            location_id: locationId,
            available_adjustment: adjustment
        });
    }

    // ============================================
    // COLLECTIONS
    // ============================================

    /**
     * Create collection
     */
    async createCollection(title, options = {}) {
        return await this.request('POST', '/custom_collections.json', {
            custom_collection: {
                title,
                ...options
            }
        });
    }

    /**
     * Get collection
     */
    async getCollection(collectionId) {
        return await this.request('GET', `/custom_collections/${collectionId}.json`);
    }

    /**
     * List collections
     */
    async listCollections(options = {}) {
        const params = new URLSearchParams(options).toString();
        return await this.request('GET', `/custom_collections.json?${params}`);
    }

    /**
     * Update collection
     */
    async updateCollection(collectionId, updates) {
        return await this.request('PUT', `/custom_collections/${collectionId}.json`, {
            custom_collection: updates
        });
    }

    /**
     * Delete collection
     */
    async deleteCollection(collectionId) {
        return await this.request('DELETE', `/custom_collections/${collectionId}.json`);
    }

    /**
     * Add product to collection
     */
    async addProductToCollection(collectionId, productId) {
        return await this.request('POST', '/collects.json', {
            collect: {
                collection_id: collectionId,
                product_id: productId
            }
        });
    }

    // ============================================
    // DISCOUNTS
    // ============================================

    /**
     * Create discount code
     */
    async createDiscountCode(priceRuleId, code) {
        return await this.request('POST', `/price_rules/${priceRuleId}/discount_codes.json`, {
            discount_code: { code }
        });
    }

    /**
     * Create price rule
     */
    async createPriceRule(title, valueType, value, targetType, options = {}) {
        return await this.request('POST', '/price_rules.json', {
            price_rule: {
                title,
                value_type: valueType, // fixed_amount, percentage
                value,
                target_type: targetType, // line_item, shipping_line
                ...options
            }
        });
    }

    /**
     * List price rules
     */
    async listPriceRules() {
        return await this.request('GET', '/price_rules.json');
    }

    // ============================================
    // FULFILLMENTS
    // ============================================

    /**
     * Create fulfillment
     */
    async createFulfillment(orderId, lineItems, options = {}) {
        return await this.request('POST', `/orders/${orderId}/fulfillments.json`, {
            fulfillment: {
                line_items: lineItems,
                ...options
            }
        });
    }

    /**
     * Get fulfillment
     */
    async getFulfillment(orderId, fulfillmentId) {
        return await this.request('GET', `/orders/${orderId}/fulfillments/${fulfillmentId}.json`);
    }

    /**
     * Update fulfillment
     */
    async updateFulfillment(orderId, fulfillmentId, updates) {
        return await this.request('PUT', `/orders/${orderId}/fulfillments/${fulfillmentId}.json`, {
            fulfillment: updates
        });
    }

    /**
     * Cancel fulfillment
     */
    async cancelFulfillment(orderId, fulfillmentId) {
        return await this.request('POST', `/orders/${orderId}/fulfillments/${fulfillmentId}/cancel.json`);
    }

    // ============================================
    // SHOP
    // ============================================

    /**
     * Get shop info
     */
    async getShop() {
        return await this.request('GET', '/shop.json');
    }

    // ============================================
    // WEBHOOKS
    // ============================================

    /**
     * Create webhook
     */
    async createWebhook(topic, address, format = 'json') {
        return await this.request('POST', '/webhooks.json', {
            webhook: {
                topic,
                address,
                format
            }
        });
    }

    /**
     * List webhooks
     */
    async listWebhooks() {
        return await this.request('GET', '/webhooks.json');
    }

    /**
     * Delete webhook
     */
    async deleteWebhook(webhookId) {
        return await this.request('DELETE', `/webhooks/${webhookId}.json`);
    }

    // ============================================
    // ANALYTICS
    // ============================================

    /**
     * Get reports
     */
    async getReports() {
        return await this.request('GET', '/reports.json');
    }

    /**
     * Get report
     */
    async getReport(reportId) {
        return await this.request('GET', `/reports/${reportId}.json`);
    }
}

module.exports = ShopifyAPI;
