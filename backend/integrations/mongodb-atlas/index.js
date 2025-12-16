/**
 * MongoDB Atlas Database Management Integration
 */

const { MongoClient } = require('mongodb');

class MongoDBAtlasIntegration {
  constructor(config) {
    this.uri = config.uri || process.env.MONGODB_URI;
    if (!this.uri) throw new Error('MongoDB URI required');
    
    this.client = new MongoClient(this.uri);
    this.connected = false;
  }

  async connect() {
    if (this.connected) return { success: true };
    
    try {
      await this.client.connect();
      this.connected = true;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async disconnect() {
    try {
      await this.client.close();
      this.connected = false;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async insertOne(database, collection, document) {
    try {
      await this.connect();
      const db = this.client.db(database);
      const coll = db.collection(collection);
      const result = await coll.insertOne(document);
      
      return {
        success: true,
        insertedId: result.insertedId
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async insertMany(database, collection, documents) {
    try {
      await this.connect();
      const db = this.client.db(database);
      const coll = db.collection(collection);
      const result = await coll.insertMany(documents);
      
      return {
        success: true,
        insertedCount: result.insertedCount,
        insertedIds: result.insertedIds
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async findOne(database, collection, query) {
    try {
      await this.connect();
      const db = this.client.db(database);
      const coll = db.collection(collection);
      const document = await coll.findOne(query);
      
      return {
        success: true,
        document
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async find(database, collection, query = {}, options = {}) {
    try {
      await this.connect();
      const db = this.client.db(database);
      const coll = db.collection(collection);
      const documents = await coll.find(query, options).toArray();
      
      return {
        success: true,
        documents,
        count: documents.length
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateOne(database, collection, filter, update) {
    try {
      await this.connect();
      const db = this.client.db(database);
      const coll = db.collection(collection);
      const result = await coll.updateOne(filter, { $set: update });
      
      return {
        success: true,
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateMany(database, collection, filter, update) {
    try {
      await this.connect();
      const db = this.client.db(database);
      const coll = db.collection(collection);
      const result = await coll.updateMany(filter, { $set: update });
      
      return {
        success: true,
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteOne(database, collection, filter) {
    try {
      await this.connect();
      const db = this.client.db(database);
      const coll = db.collection(collection);
      const result = await coll.deleteOne(filter);
      
      return {
        success: true,
        deletedCount: result.deletedCount
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteMany(database, collection, filter) {
    try {
      await this.connect();
      const db = this.client.db(database);
      const coll = db.collection(collection);
      const result = await coll.deleteMany(filter);
      
      return {
        success: true,
        deletedCount: result.deletedCount
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async countDocuments(database, collection, query = {}) {
    try {
      await this.connect();
      const db = this.client.db(database);
      const coll = db.collection(collection);
      const count = await coll.countDocuments(query);
      
      return {
        success: true,
        count
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async aggregate(database, collection, pipeline) {
    try {
      await this.connect();
      const db = this.client.db(database);
      const coll = db.collection(collection);
      const results = await coll.aggregate(pipeline).toArray();
      
      return {
        success: true,
        results
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createIndex(database, collection, keys, options = {}) {
    try {
      await this.connect();
      const db = this.client.db(database);
      const coll = db.collection(collection);
      const indexName = await coll.createIndex(keys, options);
      
      return {
        success: true,
        indexName
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async listIndexes(database, collection) {
    try {
      await this.connect();
      const db = this.client.db(database);
      const coll = db.collection(collection);
      const indexes = await coll.indexes();
      
      return {
        success: true,
        indexes
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async dropIndex(database, collection, indexName) {
    try {
      await this.connect();
      const db = this.client.db(database);
      const coll = db.collection(collection);
      await coll.dropIndex(indexName);
      
      return {
        success: true
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async listCollections(database) {
    try {
      await this.connect();
      const db = this.client.db(database);
      const collections = await db.listCollections().toArray();
      
      return {
        success: true,
        collections: collections.map(c => c.name)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createCollection(database, collectionName, options = {}) {
    try {
      await this.connect();
      const db = this.client.db(database);
      await db.createCollection(collectionName, options);
      
      return {
        success: true
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async dropCollection(database, collectionName) {
    try {
      await this.connect();
      const db = this.client.db(database);
      await db.dropCollection(collectionName);
      
      return {
        success: true
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = MongoDBAtlasIntegration;
