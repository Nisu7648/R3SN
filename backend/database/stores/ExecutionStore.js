/**
 * ExecutionStore.js - Workflow Execution History
 */

class ExecutionStore {
  constructor(db) {
    this.db = db;
    this.collection = 'executions';
  }

  async create(execution) {
    return await this.db.insert(this.collection, {
      ...execution,
      createdAt: Date.now()
    });
  }

  async findById(id) {
    const results = await this.db.query(this.collection, { executionId: id });
    return results[0] || null;
  }

  async findByWorkflow(workflowId) {
    return await this.db.query(this.collection, { workflowId });
  }

  async findRecent(limit = 10) {
    const all = await this.db.query(this.collection, {});
    return all
      .sort((a, b) => b._createdAt - a._createdAt)
      .slice(0, limit);
  }

  async findByStatus(status) {
    return await this.db.query(this.collection, { status });
  }

  async findByDateRange(startDate, endDate) {
    return await this.db.query(this.collection, {
      _createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    });
  }

  async getStats() {
    const all = await this.db.query(this.collection, {});
    
    return {
      total: all.length,
      completed: all.filter(e => e.status === 'completed').length,
      failed: all.filter(e => e.status === 'failed').length,
      running: all.filter(e => e.status === 'running').length,
      cancelled: all.filter(e => e.status === 'cancelled').length,
      averageDuration: all.length > 0
        ? all.reduce((sum, e) => sum + (e.duration || 0), 0) / all.length
        : 0
    };
  }

  async cleanup(olderThan) {
    const cutoff = Date.now() - olderThan;
    return await this.db.delete(this.collection, {
      _createdAt: { $lt: cutoff }
    });
  }
}

module.exports = ExecutionStore;
