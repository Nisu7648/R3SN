/**
 * WorkflowStore.js - Workflow Persistence Layer
 */

class WorkflowStore {
  constructor(db) {
    this.db = db;
    this.collection = 'workflows';
  }

  async create(workflow) {
    return await this.db.insert(this.collection, {
      ...workflow,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
      status: 'active'
    });
  }

  async findById(id) {
    const results = await this.db.query(this.collection, { _id: id });
    return results[0] || null;
  }

  async findAll(filter = {}) {
    return await this.db.query(this.collection, filter);
  }

  async findByName(name) {
    const results = await this.db.query(this.collection, { name });
    return results[0] || null;
  }

  async update(id, updates) {
    const workflow = await this.findById(id);
    
    if (!workflow) {
      throw new Error(`Workflow not found: ${id}`);
    }

    return await this.db.update(
      this.collection,
      { _id: id },
      {
        ...updates,
        updatedAt: Date.now(),
        version: workflow.version + 1
      }
    );
  }

  async delete(id) {
    return await this.db.delete(this.collection, { _id: id });
  }

  async archive(id) {
    return await this.update(id, { status: 'archived' });
  }

  async activate(id) {
    return await this.update(id, { status: 'active' });
  }

  async getRecent(limit = 10) {
    const all = await this.findAll();
    return all
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, limit);
  }

  async search(query) {
    const all = await this.findAll();
    const queryLower = query.toLowerCase();
    
    return all.filter(workflow => {
      return (
        workflow.name?.toLowerCase().includes(queryLower) ||
        workflow.description?.toLowerCase().includes(queryLower)
      );
    });
  }
}

module.exports = WorkflowStore;
