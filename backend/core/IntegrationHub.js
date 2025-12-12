/**
 * IntegrationHub - REAL 800+ Integration Management
 * Uses IntegrationRegistry for actual API connections
 * All integrations have premium access and can do anything
 */

const IntegrationRegistry = require('./IntegrationRegistry');

class IntegrationHub {
  constructor() {
    this.registry = new IntegrationRegistry();
    this.initialized = false;
  }

  /**
   * Initialize the hub
   */
  async initialize() {
    if (this.initialized) return;
    
    await this.registry.initialize();
    this.initialized = true;
    
    console.log(`✅ IntegrationHub initialized with ${this.registry.integrations.size} integrations`);
  }

  /**
   * Execute integration action - REAL IMPLEMENTATION
   */
  async executeIntegration(integrationName, action, parameters = {}, userId = null) {
    if (!this.initialized) {
      await this.initialize();
    }

    console.log(`\n⚡ [IntegrationHub] Executing ${integrationName}.${action}`);
    console.log(`📋 Parameters:`, Object.keys(parameters));

    try {
      // Execute using registry
      const result = await this.registry.execute(integrationName, action, parameters, userId);

      console.log(`✅ [IntegrationHub] ${integrationName}.${action} completed`);

      return result;

    } catch (error) {
      console.error(`❌ [IntegrationHub] ${integrationName}.${action} failed:`, error.message);
      throw error;
    }
  }

  /**
   * Get integration by name
   */
  getIntegration(name) {
    return this.registry.getIntegration(name);
  }

  /**
   * Get integrations by category
   */
  getIntegrationsByCategory(category) {
    return this.registry.getIntegrationsByCategory(category);
  }

  /**
   * Get all integrations
   */
  getAllIntegrations() {
    return this.registry.getAllIntegrations();
  }

  /**
   * Get all categories
   */
  getAllCategories() {
    return this.registry.getAllCategories();
  }

  /**
   * Search integrations
   */
  searchIntegrations(query) {
    return this.registry.searchIntegrations(query);
  }

  /**
   * Check if integration exists
   */
  hasIntegration(name) {
    return this.registry.integrations.has(name);
  }

  /**
   * Get integration count
   */
  getIntegrationCount() {
    return this.registry.integrations.size;
  }

  /**
   * Get integration statistics
   */
  getStatistics() {
    const integrations = this.getAllIntegrations();
    const categories = this.getAllCategories();

    const stats = {
      total: integrations.length,
      categories: categories.length,
      premium: integrations.filter(i => i.premium).length,
      byCategory: {}
    };

    categories.forEach(category => {
      const categoryIntegrations = this.getIntegrationsByCategory(category);
      stats.byCategory[category] = categoryIntegrations.length;
    });

    return stats;
  }

  /**
   * Test integration connection
   */
  async testIntegration(integrationName) {
    try {
      const integration = this.getIntegration(integrationName);
      
      if (!integration) {
        return {
          success: false,
          error: 'Integration not found'
        };
      }

      // Try a simple list operation
      const result = await this.executeIntegration(integrationName, 'list', {}, null);

      return {
        success: true,
        integration: integrationName,
        message: 'Connection successful'
      };

    } catch (error) {
      return {
        success: false,
        integration: integrationName,
        error: error.message
      };
    }
  }

  /**
   * Batch execute multiple integrations
   */
  async batchExecute(operations) {
    const results = [];

    for (const operation of operations) {
      try {
        const result = await this.executeIntegration(
          operation.integration,
          operation.action,
          operation.parameters,
          operation.userId
        );
        results.push({ ...operation, result, success: true });
      } catch (error) {
        results.push({ ...operation, error: error.message, success: false });
      }
    }

    return results;
  }

  /**
   * Get integration capabilities
   */
  getCapabilities(integrationName) {
    const integration = this.getIntegration(integrationName);
    return integration ? integration.capabilities : [];
  }

  /**
   * Check if integration supports action
   */
  supportsAction(integrationName, action) {
    const capabilities = this.getCapabilities(integrationName);
    return capabilities.includes(action);
  }
}

module.exports = IntegrationHub;
