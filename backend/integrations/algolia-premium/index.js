const axios = require('axios');

class AlgoliaPremiumIntegration {
  constructor(appId, apiKey) {
    this.appId = appId;
    this.apiKey = apiKey;
    this.baseUrl = `https://${appId}-dsn.algolia.net/1`;
  }

  getHeaders() {
    return { 'X-Algolia-Application-Id': this.appId, 'X-Algolia-API-Key': this.apiKey, 'Content-Type': 'application/json' };
  }

  async request(method, path, data = null) {
    try {
      const response = await axios({ method, url: `${this.baseUrl}${path}`, headers: this.getHeaders(), data });
      return { success: true, data: response.data };
    } catch (error) {
      throw new Error(`Algolia API error: ${error.response?.data?.message || error.message}`);
    }
  }

  // Search Operations
  async search(index, query, params = {}) { return this.request('POST', `/indexes/${index}/query`, { query, ...params }); }
  async searchMultiple(queries) { return this.request('POST', '/indexes/*/queries', { requests: queries }); }
  async browse(index, params = {}) { return this.request('POST', `/indexes/${index}/browse`, params); }

  // Object Operations
  async addObject(index, object) { return this.request('POST', `/indexes/${index}`, object); }
  async updateObject(index, objectID, object) { return this.request('PUT', `/indexes/${index}/${objectID}`, object); }
  async partialUpdate(index, objectID, updates) { return this.request('POST', `/indexes/${index}/${objectID}/partial`, updates); }
  async deleteObject(index, objectID) { return this.request('DELETE', `/indexes/${index}/${objectID}`); }
  async batch(index, operations) { return this.request('POST', `/indexes/${index}/batch`, { requests: operations }); }

  // Index Operations
  async clearIndex(index) { return this.request('POST', `/indexes/${index}/clear`); }
  async deleteIndex(index) { return this.request('DELETE', `/indexes/${index}`); }
  async listIndexes() { return this.request('GET', '/indexes'); }

  // Settings (Premium)
  async getSettings(index) { return this.request('GET', `/indexes/${index}/settings`); }
  async setSettings(index, settings) { return this.request('PUT', `/indexes/${index}/settings`, settings); }

  // Synonyms (Premium)
  async getSynonyms(index) { return this.request('GET', `/indexes/${index}/synonyms`); }
  async saveSynonym(index, objectID, synonyms) { return this.request('PUT', `/indexes/${index}/synonyms/${objectID}`, synonyms); }

  // Rules (Premium)
  async getRules(index) { return this.request('GET', `/indexes/${index}/rules`); }
  async saveRule(index, objectID, rule) { return this.request('PUT', `/indexes/${index}/rules/${objectID}`, rule); }

  // Personalization (Premium)
  async getPersonalization() { return this.request('GET', '/recommendation/personalization/strategy'); }
  async setPersonalization(strategy) { return this.request('POST', '/recommendation/personalization/strategy', strategy); }

  // A/B Testing (Premium)
  async getAbTests() { return this.request('GET', '/2/abtests'); }
  async createAbTest(data) { return this.request('POST', '/2/abtests', data); }

  // Analytics (Premium)
  async getAnalytics(params = {}) { return this.request('GET', `/2/searches?${new URLSearchParams(params)}`); }
  async getTopSearches(params = {}) { return this.request('GET', `/2/searches/noResults?${new URLSearchParams(params)}`); }

  // Query Suggestions (Premium)
  async getQuerySuggestions(index, query) { return this.request('POST', `/1/indexes/${index}/query`, { query, hitsPerPage: 5 }); }

  // Recommendations (Premium)
  async getRecommendations(requests) { return this.request('POST', '/1/indexes/*/recommendations', { requests }); }
}

module.exports = AlgoliaPremiumIntegration;
