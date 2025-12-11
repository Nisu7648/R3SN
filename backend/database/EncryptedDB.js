/**
 * EncryptedDB.js - AES-256-GCM Encrypted Database
 * File-based encrypted storage with CRUD operations
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class EncryptedDB {
  constructor(config) {
    this.config = config;
    this.data = new Map();
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32;
    this.ivLength = 16;
  }

  async initialize() {
    await this.ensureDirectory();
    await this.loadData();
  }

  async ensureDirectory() {
    try {
      await fs.access(this.config.path);
    } catch {
      await fs.mkdir(this.config.path, { recursive: true });
    }
  }

  async loadData() {
    try {
      const files = await fs.readdir(this.config.path);
      
      for (const file of files) {
        if (file.endsWith('.enc') || file.endsWith('.json')) {
          const collection = file.replace(/\.(enc|json)$/, '');
          const data = await this.readCollection(collection);
          this.data.set(collection, data);
          console.log(`📂 Loaded collection: ${collection} (${data.length} items)`);
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error.message);
    }
  }

  async query(collection, filter = {}) {
    const data = this.data.get(collection) || [];

    if (Object.keys(filter).length === 0) {
      return data;
    }

    return data.filter(item => {
      return Object.entries(filter).every(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          // Support operators like { $gt: 5 }
          if (value.$gt !== undefined) return item[key] > value.$gt;
          if (value.$lt !== undefined) return item[key] < value.$lt;
          if (value.$gte !== undefined) return item[key] >= value.$gte;
          if (value.$lte !== undefined) return item[key] <= value.$lte;
          if (value.$ne !== undefined) return item[key] !== value.$ne;
          if (value.$in !== undefined) return value.$in.includes(item[key]);
        }
        return item[key] === value;
      });
    });
  }

  async insert(collection, item) {
    const data = this.data.get(collection) || [];

    const newItem = {
      ...item,
      _id: this.generateId(),
      _createdAt: Date.now(),
      _updatedAt: Date.now()
    };

    data.push(newItem);
    this.data.set(collection, data);

    await this.saveCollection(collection);

    return newItem;
  }

  async update(collection, filter, updates) {
    const data = this.data.get(collection) || [];
    let updated = 0;

    for (const item of data) {
      const matches = Object.entries(filter).every(([key, value]) => {
        return item[key] === value;
      });

      if (matches) {
        Object.assign(item, updates, {
          _updatedAt: Date.now()
        });
        updated++;
      }
    }

    if (updated > 0) {
      await this.saveCollection(collection);
    }

    return { updated };
  }

  async delete(collection, filter) {
    const data = this.data.get(collection) || [];
    const before = data.length;

    const filtered = data.filter(item => {
      return !Object.entries(filter).every(([key, value]) => {
        return item[key] === value;
      });
    });

    this.data.set(collection, filtered);

    const deleted = before - filtered.length;

    if (deleted > 0) {
      await this.saveCollection(collection);
    }

    return { deleted };
  }

  async readCollection(collection) {
    const encPath = path.join(this.config.path, `${collection}.enc`);
    const jsonPath = path.join(this.config.path, `${collection}.json`);

    try {
      // Try encrypted file first
      try {
        const encrypted = await fs.readFile(encPath, 'utf8');
        if (this.config.encryption) {
          const decrypted = this.decrypt(encrypted);
          return JSON.parse(decrypted);
        }
      } catch {
        // Try JSON file
        const content = await fs.readFile(jsonPath, 'utf8');
        return JSON.parse(content);
      }
    } catch (error) {
      return [];
    }
  }

  async saveCollection(collection) {
    const data = this.data.get(collection) || [];
    const filePath = path.join(
      this.config.path,
      `${collection}.${this.config.encryption ? 'enc' : 'json'}`
    );

    let content = JSON.stringify(data, null, 2);

    if (this.config.encryption) {
      content = this.encrypt(content);
    }

    await fs.writeFile(filePath, content, 'utf8');
  }

  encrypt(text) {
    const iv = crypto.randomBytes(this.ivLength);
    const key = this.getKey();

    const cipher = crypto.createCipheriv(this.algorithm, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return JSON.stringify({
      iv: iv.toString('hex'),
      encrypted,
      authTag: authTag.toString('hex'),
      algorithm: this.algorithm
    });
  }

  decrypt(encryptedData) {
    const { iv, encrypted, authTag } = JSON.parse(encryptedData);
    const key = this.getKey();

    const decipher = crypto.createDecipheriv(
      this.algorithm,
      key,
      Buffer.from(iv, 'hex')
    );

    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  getKey() {
    const key = this.config.encryptionKey;
    
    if (!key || key === 'default-key-change-in-production') {
      console.warn('⚠️  WARNING: Using default encryption key. Set ENCRYPTION_KEY in .env');
    }

    return crypto.scryptSync(key, 'salt', this.keyLength);
  }

  generateId() {
    return crypto.randomBytes(16).toString('hex');
  }

  async close() {
    // Save all collections
    for (const collection of this.data.keys()) {
      await this.saveCollection(collection);
    }
  }

  async backup(backupPath) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(backupPath, `backup-${timestamp}`);
    
    await fs.mkdir(backupDir, { recursive: true });

    for (const [collection, data] of this.data.entries()) {
      const filePath = path.join(backupDir, `${collection}.json`);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    }

    return {
      success: true,
      backupPath: backupDir,
      collections: this.data.size,
      timestamp
    };
  }

  getStats() {
    const collections = Array.from(this.data.entries());
    
    return {
      totalCollections: this.data.size,
      totalDocuments: collections.reduce((sum, [, data]) => sum + data.length, 0),
      collections: collections.map(([name, data]) => ({
        name,
        documents: data.length
      })),
      encryption: this.config.encryption,
      algorithm: this.algorithm
    };
  }
}

module.exports = EncryptedDB;
