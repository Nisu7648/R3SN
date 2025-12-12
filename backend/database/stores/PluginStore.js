/**
 * PluginStore.js - Plugin Metadata Storage
 */

class PluginStore {
  constructor(db) {
    this.db = db;
    this.collection = 'plugins';
  }

  async create(plugin) {
    return await this.db.insert(this.collection, {
      ...plugin,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      executionCount: 0
    });
  }

  async findById(id) {
    const results = await this.db.query(this.collection, { pluginId: id });
    return results[0] || null;
  }

  async findAll() {
    return await this.db.query(this.collection, {});
  }

  async update(id, updates) {
    return await this.db.update(
      this.collection,
      { pluginId: id },
      {
        ...updates,
        updatedAt: Date.now()
      }
    );
  }

  async delete(id) {
    return await this.db.delete(this.collection, { pluginId: id });
  }

  async incrementExecutionCount(id) {
    const plugin = await this.findById(id);
    
    if (plugin) {
      return await this.update(id, {
        executionCount: (plugin.executionCount || 0) + 1,
        lastExecution: Date.now()
      });
    }
  }

  async getStats() {
    const all = await this.findAll();
    
    return {
      total: all.length,
      premium: all.filter(p => p.premium).length,
      totalExecutions: all.reduce((sum, p) => sum + (p.executionCount || 0), 0)
    };
  }
}

module.exports = PluginStore;
