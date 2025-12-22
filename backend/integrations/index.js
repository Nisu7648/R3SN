/**
 * Integration Loader
 * Dynamically loads all available integrations
 */

const fs = require('fs');
const path = require('path');

class IntegrationLoader {
  constructor() {
    this.integrations = new Map();
    this.loadAllIntegrations();
  }

  loadAllIntegrations() {
    const integrationsDir = __dirname;
    const items = fs.readdirSync(integrationsDir);

    items.forEach(item => {
      const itemPath = path.join(integrationsDir, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        try {
          const indexPath = path.join(itemPath, 'index.js');
          const metadataPath = path.join(itemPath, 'metadata.json');

          if (fs.existsSync(indexPath) && fs.existsSync(metadataPath)) {
            const Integration = require(indexPath);
            const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

            this.integrations.set(metadata.id, {
              Integration,
              metadata
            });

            console.log(`✅ Loaded integration: ${metadata.name}`);
          }
        } catch (error) {
          console.warn(`⚠️  Failed to load integration ${item}:`, error.message);
        }
      }
    });

    console.log(`\n📦 Total integrations loaded: ${this.integrations.size}\n`);
  }

  getIntegration(id) {
    return this.integrations.get(id);
  }

  getAllIntegrations() {
    return Array.from(this.integrations.values()).map(({ metadata }) => metadata);
  }

  executeIntegration(id, config, action, params) {
    const integration = this.integrations.get(id);
    
    if (!integration) {
      throw new Error(`Integration ${id} not found`);
    }

    const instance = new integration.Integration(config);
    return instance.execute(action, params);
  }
}

module.exports = new IntegrationLoader();
