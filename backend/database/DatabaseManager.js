/**
 * DatabaseManager.js - Main Database Interface
 * Manages encrypted database with multiple stores
 */

const EventEmitter = require('events');
const EncryptedDB = require('./EncryptedDB');
const WorkflowStore = require('./stores/WorkflowStore');
const ExecutionStore = require('./stores/ExecutionStore');
const AgentStore = require('./stores/AgentStore');
const PluginStore = require('./stores/PluginStore');

class DatabaseManager extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      path: config.path || './data/db',
      encryption: config.encryption !== false,
      encryptionKey: config.encryptionKey || process.env.ENCRYPTION_KEY || 'default-key-change-in-production'
    };

    this.db = new EncryptedDB(this.config);
    this.workflows = new WorkflowStore(this.db);
    this.executions = new ExecutionStore(this.db);
    this.agents = new AgentStore(this.db);
    this.plugins = new PluginStore(this.db);
  }

  async initialize() {
    console.log('🗄️  Initializing Database Manager...');
    
    await this.db.initialize();
    
    this.emit('initialized', {
      encryption: this.config.encryption,
      path: this.config.path
    });

    console.log(`✅ Database initialized at ${this.config.path}`);
    console.log(`🔒 Encryption: ${this.config.encryption ? 'ENABLED (AES-256-GCM)' : 'DISABLED'}`);
  }

  async query(collection, filter = {}) {
    return await this.db.query(collection, filter);
  }

  async insert(collection, data) {
    return await this.db.insert(collection, data);
  }

  async update(collection, filter, data) {
    return await this.db.update(collection, filter, data);
  }

  async delete(collection, filter) {
    return await this.db.delete(collection, filter);
  }

  async count(collection, filter = {}) {
    const results = await this.db.query(collection, filter);
    return results.length;
  }

  async close() {
    console.log('🛑 Closing database...');
    await this.db.close();
    this.emit('closed');
    console.log('✅ Database closed');
  }

  getStats() {
    return {
      collections: ['workflows', 'executions', 'agents', 'plugins'],
      encryption: this.config.encryption,
      path: this.config.path,
      stores: {
        workflows: this.workflows,
        executions: this.executions,
        agents: this.agents,
        plugins: this.plugins
      }
    };
  }
}

module.exports = DatabaseManager;
