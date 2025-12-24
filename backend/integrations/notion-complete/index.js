const axios = require('axios');

class NotionIntegration {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.notion.com/v1';
    this.headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    };
  }

  async listDatabases() {
    const response = await axios.post(
      `${this.baseURL}/search`,
      { filter: { property: 'object', value: 'database' } },
      { headers: this.headers }
    );
    return response.data;
  }

  async getDatabase(databaseId) {
    const response = await axios.get(`${this.baseURL}/databases/${databaseId}`, {
      headers: this.headers
    });
    return response.data;
  }

  async queryDatabase(databaseId, filter = {}, sorts = []) {
    const response = await axios.post(
      `${this.baseURL}/databases/${databaseId}/query`,
      { filter, sorts },
      { headers: this.headers }
    );
    return response.data;
  }

  async createPage(databaseId, properties) {
    const response = await axios.post(
      `${this.baseURL}/pages`,
      { parent: { database_id: databaseId }, properties },
      { headers: this.headers }
    );
    return response.data;
  }

  async getPage(pageId) {
    const response = await axios.get(`${this.baseURL}/pages/${pageId}`, {
      headers: this.headers
    });
    return response.data;
  }

  async updatePage(pageId, properties) {
    const response = await axios.patch(
      `${this.baseURL}/pages/${pageId}`,
      { properties },
      { headers: this.headers }
    );
    return response.data;
  }

  async getBlockChildren(blockId) {
    const response = await axios.get(`${this.baseURL}/blocks/${blockId}/children`, {
      headers: this.headers
    });
    return response.data;
  }

  async appendBlockChildren(blockId, children) {
    const response = await axios.patch(
      `${this.baseURL}/blocks/${blockId}/children`,
      { children },
      { headers: this.headers }
    );
    return response.data;
  }
}

module.exports = NotionIntegration;
