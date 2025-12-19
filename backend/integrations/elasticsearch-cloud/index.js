/**
 * Elasticsearch Cloud Integration
 * Save $1000+/month - Enterprise search & analytics
 */

const { Client } = require('@elastic/elasticsearch');

class ElasticsearchCloudIntegration {
  constructor(config) {
    this.cloudId = config.cloudId || process.env.ELASTICSEARCH_CLOUD_ID;
    this.apiKey = config.apiKey || process.env.ELASTICSEARCH_API_KEY;
    this.username = config.username || process.env.ELASTICSEARCH_USERNAME;
    this.password = config.password || process.env.ELASTICSEARCH_PASSWORD;
    
    const clientConfig = {};
    
    if (this.cloudId) {
      clientConfig.cloud = { id: this.cloudId };
    }
    
    if (this.apiKey) {
      clientConfig.auth = { apiKey: this.apiKey };
    } else if (this.username && this.password) {
      clientConfig.auth = {
        username: this.username,
        password: this.password
      };
    }
    
    this.client = new Client(clientConfig);
  }

  async indexDocument(index, document, id = null) {
    try {
      const params = { index, body: document };
      if (id) params.id = id;
      
      const result = await this.client.index(params);
      
      return {
        success: true,
        id: result.body._id,
        result: result.body.result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async bulkIndex(index, documents) {
    try {
      const body = documents.flatMap(doc => [
        { index: { _index: index } },
        doc
      ]);
      
      const result = await this.client.bulk({ body });
      
      return {
        success: true,
        took: result.body.took,
        errors: result.body.errors,
        items: result.body.items.length
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async search(index, query, options = {}) {
    try {
      const result = await this.client.search({
        index,
        body: {
          query,
          ...options
        }
      });
      
      return {
        success: true,
        hits: result.body.hits.hits.map(hit => ({
          id: hit._id,
          score: hit._score,
          source: hit._source
        })),
        total: result.body.hits.total.value
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getDocument(index, id) {
    try {
      const result = await this.client.get({ index, id });
      
      return {
        success: true,
        document: result.body._source
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateDocument(index, id, doc) {
    try {
      const result = await this.client.update({
        index,
        id,
        body: { doc }
      });
      
      return {
        success: true,
        result: result.body.result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteDocument(index, id) {
    try {
      const result = await this.client.delete({ index, id });
      
      return {
        success: true,
        result: result.body.result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createIndex(index, mappings = {}, settings = {}) {
    try {
      const result = await this.client.indices.create({
        index,
        body: {
          mappings,
          settings
        }
      });
      
      return {
        success: true,
        acknowledged: result.body.acknowledged
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteIndex(index) {
    try {
      const result = await this.client.indices.delete({ index });
      
      return {
        success: true,
        acknowledged: result.body.acknowledged
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getIndexStats(index) {
    try {
      const result = await this.client.indices.stats({ index });
      
      return {
        success: true,
        stats: result.body.indices[index]
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async aggregate(index, aggregations) {
    try {
      const result = await this.client.search({
        index,
        body: {
          size: 0,
          aggs: aggregations
        }
      });
      
      return {
        success: true,
        aggregations: result.body.aggregations
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async count(index, query = {}) {
    try {
      const result = await this.client.count({
        index,
        body: { query }
      });
      
      return {
        success: true,
        count: result.body.count
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async scroll(index, query, scrollTime = '1m') {
    try {
      const result = await this.client.search({
        index,
        scroll: scrollTime,
        body: { query }
      });
      
      return {
        success: true,
        scrollId: result.body._scroll_id,
        hits: result.body.hits.hits
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async clearScroll(scrollId) {
    try {
      await this.client.clearScroll({
        scroll_id: scrollId
      });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async reindex(sourceIndex, destIndex) {
    try {
      const result = await this.client.reindex({
        body: {
          source: { index: sourceIndex },
          dest: { index: destIndex }
        }
      });
      
      return {
        success: true,
        total: result.body.total,
        created: result.body.created
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getClusterHealth() {
    try {
      const result = await this.client.cluster.health();
      
      return {
        success: true,
        health: result.body
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = ElasticsearchCloudIntegration;
