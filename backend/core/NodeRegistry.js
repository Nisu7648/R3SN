/**
 * NodeRegistry.js - Node Type Registry
 * Manages all available node types and their executors
 */

const EventEmitter = require('events');

class NodeRegistry extends EventEmitter {
  constructor() {
    super();
    this.executors = new Map();
    this.schemas = new Map();
  }

  register(type, executor, schema = null) {
    if (typeof executor !== 'function') {
      throw new Error('Executor must be a function');
    }

    this.executors.set(type, executor);
    
    if (schema) {
      this.schemas.set(type, schema);
    }

    this.emit('registered', { type });
  }

  getExecutor(type) {
    return this.executors.get(type);
  }

  getSchema(type) {
    return this.schemas.get(type);
  }

  hasType(type) {
    return this.executors.has(type);
  }

  getRegisteredTypes() {
    return Array.from(this.executors.keys());
  }

  unregister(type) {
    this.executors.delete(type);
    this.schemas.delete(type);
    this.emit('unregistered', { type });
  }

  getStats() {
    return {
      totalTypes: this.executors.size,
      types: this.getRegisteredTypes()
    };
  }
}

module.exports = NodeRegistry;
