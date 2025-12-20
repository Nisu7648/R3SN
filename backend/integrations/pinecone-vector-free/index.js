const axios = require('axios');

/**
 * Pinecone Vector Database Premium Integration
 * FREE Vector Database for AI & ML
 * 100K vectors FREE (worth $70/month)
 * Perfect for embeddings, semantic search, RAG applications
 */
class PineconeIntegration {
  constructor(apiKey, environment = 'us-east-1-aws') {
    this.apiKey = apiKey || 'YOUR_PINECONE_API_KEY';
    this.environment = environment;
    this.baseURL = `https://controller.${environment}.pinecone.io`;
  }

  /**
   * Get index URL for data operations
   */
  getIndexURL(indexName) {
    return `https://${indexName}-${this.environment}.svc.pinecone.io`;
  }

  /**
   * Create a new index
   */
  async createIndex(name, dimension, metric = 'cosine', spec = null) {
    try {
      const payload = {
        name,
        dimension,
        metric,
        spec: spec || {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1'
          }
        }
      };

      const response = await axios.post(
        `${this.baseURL}/indexes`,
        payload,
        {
          headers: {
            'Api-Key': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        index: response.data
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  /**
   * List all indexes
   */
  async listIndexes() {
    try {
      const response = await axios.get(`${this.baseURL}/indexes`, {
        headers: {
          'Api-Key': this.apiKey
        }
      });

      return {
        success: true,
        data: response.data,
        indexes: response.data.indexes || []
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Describe an index
   */
  async describeIndex(indexName) {
    try {
      const response = await axios.get(
        `${this.baseURL}/indexes/${indexName}`,
        {
          headers: {
            'Api-Key': this.apiKey
          }
        }
      );

      return {
        success: true,
        data: response.data,
        index: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete an index
   */
  async deleteIndex(indexName) {
    try {
      await axios.delete(`${this.baseURL}/indexes/${indexName}`, {
        headers: {
          'Api-Key': this.apiKey
        }
      });

      return {
        success: true,
        message: `Index ${indexName} deleted successfully`
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Upsert vectors to an index
   */
  async upsertVectors(indexName, vectors, namespace = '') {
    try {
      const indexURL = this.getIndexURL(indexName);
      
      const response = await axios.post(
        `${indexURL}/vectors/upsert`,
        {
          vectors,
          namespace
        },
        {
          headers: {
            'Api-Key': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        upsertedCount: response.data.upsertedCount
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Query vectors (similarity search)
   */
  async queryVectors(indexName, vector, topK = 10, filter = null, namespace = '', includeMetadata = true, includeValues = false) {
    try {
      const indexURL = this.getIndexURL(indexName);
      
      const payload = {
        vector,
        topK,
        namespace,
        includeMetadata,
        includeValues
      };

      if (filter) {
        payload.filter = filter;
      }

      const response = await axios.post(
        `${indexURL}/query`,
        payload,
        {
          headers: {
            'Api-Key': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        matches: response.data.matches || []
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Query by ID
   */
  async queryById(indexName, id, topK = 10, namespace = '', includeMetadata = true) {
    try {
      const indexURL = this.getIndexURL(indexName);
      
      const response = await axios.post(
        `${indexURL}/query`,
        {
          id,
          topK,
          namespace,
          includeMetadata
        },
        {
          headers: {
            'Api-Key': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        matches: response.data.matches || []
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Fetch vectors by IDs
   */
  async fetchVectors(indexName, ids, namespace = '') {
    try {
      const indexURL = this.getIndexURL(indexName);
      
      const response = await axios.get(
        `${indexURL}/vectors/fetch`,
        {
          params: {
            ids: ids.join(','),
            namespace
          },
          headers: {
            'Api-Key': this.apiKey
          }
        }
      );

      return {
        success: true,
        data: response.data,
        vectors: response.data.vectors || {}
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update vector metadata
   */
  async updateVector(indexName, id, setMetadata = null, values = null, namespace = '') {
    try {
      const indexURL = this.getIndexURL(indexName);
      
      const payload = {
        id,
        namespace
      };

      if (setMetadata) payload.setMetadata = setMetadata;
      if (values) payload.values = values;

      const response = await axios.post(
        `${indexURL}/vectors/update`,
        payload,
        {
          headers: {
            'Api-Key': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete vectors
   */
  async deleteVectors(indexName, ids = null, deleteAll = false, namespace = '', filter = null) {
    try {
      const indexURL = this.getIndexURL(indexName);
      
      const payload = { namespace };

      if (deleteAll) {
        payload.deleteAll = true;
      } else if (ids) {
        payload.ids = ids;
      } else if (filter) {
        payload.filter = filter;
      }

      const response = await axios.post(
        `${indexURL}/vectors/delete`,
        payload,
        {
          headers: {
            'Api-Key': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get index statistics
   */
  async describeIndexStats(indexName, filter = null) {
    try {
      const indexURL = this.getIndexURL(indexName);
      
      const payload = {};
      if (filter) payload.filter = filter;

      const response = await axios.post(
        `${indexURL}/describe_index_stats`,
        payload,
        {
          headers: {
            'Api-Key': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        stats: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a collection (backup)
   */
  async createCollection(name, source) {
    try {
      const response = await axios.post(
        `${this.baseURL}/collections`,
        { name, source },
        {
          headers: {
            'Api-Key': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        collection: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List collections
   */
  async listCollections() {
    try {
      const response = await axios.get(`${this.baseURL}/collections`, {
        headers: {
          'Api-Key': this.apiKey
        }
      });

      return {
        success: true,
        data: response.data,
        collections: response.data.collections || []
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Describe a collection
   */
  async describeCollection(collectionName) {
    try {
      const response = await axios.get(
        `${this.baseURL}/collections/${collectionName}`,
        {
          headers: {
            'Api-Key': this.apiKey
          }
        }
      );

      return {
        success: true,
        data: response.data,
        collection: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a collection
   */
  async deleteCollection(collectionName) {
    try {
      await axios.delete(
        `${this.baseURL}/collections/${collectionName}`,
        {
          headers: {
            'Api-Key': this.apiKey
          }
        }
      );

      return {
        success: true,
        message: `Collection ${collectionName} deleted successfully`
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Helper: Create vector with metadata
   */
  createVector(id, values, metadata = {}) {
    return {
      id,
      values,
      metadata
    };
  }

  /**
   * Helper: Batch upsert with auto-chunking
   */
  async batchUpsert(indexName, vectors, namespace = '', batchSize = 100) {
    try {
      const results = [];
      
      for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        const result = await this.upsertVectors(indexName, batch, namespace);
        results.push(result);
      }

      const totalUpserted = results.reduce(
        (sum, r) => sum + (r.upsertedCount || 0), 
        0
      );

      return {
        success: true,
        totalUpserted,
        batches: results.length
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = PineconeIntegration;
