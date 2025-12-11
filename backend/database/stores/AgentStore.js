/**
 * AgentStore.js - Agent Data Persistence
 */

class AgentStore {
  constructor(db) {
    this.db = db;
    this.collection = 'agents';
  }

  async create(agent) {
    return await this.db.insert(this.collection, {
      ...agent,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  }

  async findById(id) {
    const results = await this.db.query(this.collection, { agentId: id });
    return results[0] || null;
  }

  async findAll() {
    return await this.db.query(this.collection, {});
  }

  async findByType(type) {
    return await this.db.query(this.collection, { type });
  }

  async update(id, updates) {
    return await this.db.update(
      this.collection,
      { agentId: id },
      {
        ...updates,
        updatedAt: Date.now()
      }
    );
  }

  async delete(id) {
    return await this.db.delete(this.collection, { agentId: id });
  }

  async incrementExecutionCount(id) {
    const agent = await this.findById(id);
    
    if (agent) {
      return await this.update(id, {
        executionCount: (agent.executionCount || 0) + 1,
        lastExecution: Date.now()
      });
    }
  }

  async getStats() {
    const all = await this.findAll();
    
    return {
      total: all.length,
      byType: all.reduce((acc, agent) => {
        acc[agent.type] = (acc[agent.type] || 0) + 1;
        return acc;
      }, {}),
      totalExecutions: all.reduce((sum, a) => sum + (a.executionCount || 0), 0)
    };
  }
}

module.exports = AgentStore;
