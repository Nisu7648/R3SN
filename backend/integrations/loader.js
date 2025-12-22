/**
 * Integration Loader
 * Dynamically loads all integrations from the integrations directory
 * Connects all 148 integrations including the 7 new premium ones
 */

const fs = require('fs');
const path = require('path');

class IntegrationLoader {
  constructor() {
    this.integrations = new Map();
    this.categories = new Map();
    this.loadAllIntegrations();
  }

  /**
   * Load all integrations from the integrations directory
   */
  loadAllIntegrations() {
    console.log('\n🔄 Loading integrations...\n');
    
    const integrationsDir = __dirname;
    let loaded = 0;
    let failed = 0;

    try {
      const folders = fs.readdirSync(integrationsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      for (const folder of folders) {
        try {
          const configPath = path.join(integrationsDir, folder, 'config.json');
          const indexPath = path.join(integrationsDir, folder, 'index.js');

          // Check if both config and implementation exist
          if (fs.existsSync(configPath) && fs.existsSync(indexPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            const IntegrationClass = require(indexPath);

            // Store integration
            this.integrations.set(folder, {
              id: folder,
              config,
              class: IntegrationClass,
              loadedAt: new Date()
            });

            // Categorize
            const category = config.category || 'other';
            if (!this.categories.has(category)) {
              this.categories.set(category, []);
            }
            this.categories.get(category).push(folder);

            console.log(`✅ ${config.name}`);
            loaded++;
          }
        } catch (error) {
          console.error(`❌ Failed to load ${folder}:`, error.message);
          failed++;
        }
      }

      console.log(`\n📦 Integration Loading Complete:`);
      console.log(`   ✅ Loaded: ${loaded}`);
      console.log(`   ❌ Failed: ${failed}`);
      console.log(`   📊 Categories: ${this.categories.size}`);
      console.log(`   💾 Total: ${this.integrations.size}\n`);

      // Show premium integrations
      const premium = this.getPremiumIntegrations();
      if (premium.length > 0) {
        console.log(`💎 Premium Integrations (${premium.length}):`);
        premium.forEach(int => {
          console.log(`   • ${int.name} - ${int.savingsPerMonth || 'FREE'}`);
        });
        console.log('');
      }

    } catch (error) {
      console.error('❌ Critical error loading integrations:', error);
    }
  }

  /**
   * Get integration by ID
   */
  getIntegration(id) {
    return this.integrations.get(id);
  }

  /**
   * Get all integrations
   */
  getAllIntegrations() {
    return Array.from(this.integrations.values()).map(int => ({
      id: int.id,
      name: int.config.name,
      description: int.config.description,
      category: int.config.category,
      version: int.config.version,
      isPremium: int.config.isPremium || false,
      isFree: int.config.isFree || false,
      savingsPerMonth: int.config.savingsPerMonth,
      authentication: int.config.authentication
    }));
  }

  /**
   * Get integrations by category
   */
  getByCategory(category) {
    const ids = this.categories.get(category) || [];
    return ids.map(id => this.getIntegration(id)).filter(Boolean);
  }

  /**
   * Get all categories
   */
  getCategories() {
    const categories = {};
    
    for (const [category, ids] of this.categories.entries()) {
      categories[category] = {
        count: ids.length,
        integrations: ids
      };
    }
    
    return categories;
  }

  /**
   * Get premium integrations
   */
  getPremiumIntegrations() {
    return this.getAllIntegrations().filter(int => int.isPremium);
  }

  /**
   * Get free integrations
   */
  getFreeIntegrations() {
    return this.getAllIntegrations().filter(int => int.isFree);
  }

  /**
   * Search integrations
   */
  search(query) {
    const lowerQuery = query.toLowerCase();
    
    return this.getAllIntegrations().filter(int => 
      int.name.toLowerCase().includes(lowerQuery) ||
      int.description.toLowerCase().includes(lowerQuery) ||
      int.category.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Create integration instance
   */
  createInstance(id, apiKey, ...args) {
    const integration = this.integrations.get(id);
    
    if (!integration) {
      throw new Error(`Integration '${id}' not found`);
    }

    try {
      return new integration.class(apiKey, ...args);
    } catch (error) {
      throw new Error(`Failed to create instance of '${id}': ${error.message}`);
    }
  }

  /**
   * Get integration config
   */
  getConfig(id) {
    const integration = this.integrations.get(id);
    return integration ? integration.config : null;
  }

  /**
   * Get integration endpoints
   */
  getEndpoints(id) {
    const config = this.getConfig(id);
    return config ? config.endpoints : null;
  }

  /**
   * Get integration features
   */
  getFeatures(id) {
    const config = this.getConfig(id);
    return config ? config.features : null;
  }

  /**
   * Get statistics
   */
  getStats() {
    const all = this.getAllIntegrations();
    const premium = this.getPremiumIntegrations();
    const free = this.getFreeIntegrations();

    // Calculate total savings
    const totalSavings = premium
      .filter(int => int.savingsPerMonth)
      .reduce((sum, int) => {
        const savings = parseInt(int.savingsPerMonth.replace(/[^0-9]/g, '')) || 0;
        return sum + savings;
      }, 0);

    return {
      total: all.length,
      premium: premium.length,
      free: free.length,
      categories: this.categories.size,
      totalSavings: `$${totalSavings}+/month`,
      byCategory: Object.fromEntries(
        Array.from(this.categories.entries()).map(([cat, ids]) => [cat, ids.length])
      )
    };
  }

  /**
   * Validate integration
   */
  validate(id) {
    const integration = this.integrations.get(id);
    
    if (!integration) {
      return {
        valid: false,
        error: 'Integration not found'
      };
    }

    const errors = [];

    // Check required config fields
    if (!integration.config.name) errors.push('Missing name');
    if (!integration.config.description) errors.push('Missing description');
    if (!integration.config.category) errors.push('Missing category');
    if (!integration.config.authentication) errors.push('Missing authentication');

    // Check class
    if (typeof integration.class !== 'function') {
      errors.push('Invalid integration class');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * Reload integration
   */
  reload(id) {
    const integration = this.integrations.get(id);
    
    if (!integration) {
      throw new Error(`Integration '${id}' not found`);
    }

    try {
      // Clear require cache
      const configPath = path.join(__dirname, id, 'config.json');
      const indexPath = path.join(__dirname, id, 'index.js');
      
      delete require.cache[require.resolve(indexPath)];

      // Reload
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      const IntegrationClass = require(indexPath);

      this.integrations.set(id, {
        id,
        config,
        class: IntegrationClass,
        loadedAt: new Date()
      });

      return {
        success: true,
        message: `Integration '${id}' reloaded successfully`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get integration count
   */
  count() {
    return this.integrations.size;
  }

  /**
   * Check if integration exists
   */
  has(id) {
    return this.integrations.has(id);
  }

  /**
   * Get integration IDs
   */
  getIds() {
    return Array.from(this.integrations.keys());
  }
}

// Create singleton instance
const loader = new IntegrationLoader();

module.exports = loader;
