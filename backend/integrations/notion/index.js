/**
 * Notion Integration - Complete Implementation
 * 20 endpoints for full Notion functionality
 */

const axios = require('axios');

class NotionIntegration {
  constructor(token) {
    this.token = token;
    this.baseUrl = 'https://api.notion.com/v1';
  }

  getHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    };
  }

  async listDatabases() {
    try {
      const response = await axios.post(`${this.baseUrl}/search`, 
        { filter: { property: 'object', value: 'database' } },
        { headers: this.getHeaders() }
      );
      return { success: true, databases: response.data.results };
    } catch (error) {
      throw new Error(`Failed to list databases: ${error.response?.data?.message || error.message}`);
    }
  }

  async getDatabase(databaseId) {
    try {
      const response = await axios.get(`${this.baseUrl}/databases/${databaseId}`, {
        headers: this.getHeaders(),
      });
      return { success: true, database: response.data };
    } catch (error) {
      throw new Error(`Failed to get database: ${error.response?.data?.message || error.message}`);
    }
  }

  async queryDatabase(databaseId, filter = {}, sorts = []) {
    try {
      const response = await axios.post(`${this.baseUrl}/databases/${databaseId}/query`,
        { filter, sorts },
        { headers: this.getHeaders() }
      );
      return { success: true, results: response.data.results };
    } catch (error) {
      throw new Error(`Failed to query database: ${error.response?.data?.message || error.message}`);
    }
  }

  async createDatabase(parentPageId, title, properties) {
    try {
      const response = await axios.post(`${this.baseUrl}/databases`,
        {
          parent: { type: 'page_id', page_id: parentPageId },
          title: [{ type: 'text', text: { content: title } }],
          properties,
        },
        { headers: this.getHeaders() }
      );
      return { success: true, database: response.data };
    } catch (error) {
      throw new Error(`Failed to create database: ${error.response?.data?.message || error.message}`);
    }
  }

  async updateDatabase(databaseId, updates) {
    try {
      const response = await axios.patch(`${this.baseUrl}/databases/${databaseId}`,
        updates,
        { headers: this.getHeaders() }
      );
      return { success: true, database: response.data };
    } catch (error) {
      throw new Error(`Failed to update database: ${error.response?.data?.message || error.message}`);
    }
  }

  async getPage(pageId) {
    try {
      const response = await axios.get(`${this.baseUrl}/pages/${pageId}`, {
        headers: this.getHeaders(),
      });
      return { success: true, page: response.data };
    } catch (error) {
      throw new Error(`Failed to get page: ${error.response?.data?.message || error.message}`);
    }
  }

  async createPage(parent, properties, children = []) {
    try {
      const response = await axios.post(`${this.baseUrl}/pages`,
        { parent, properties, children },
        { headers: this.getHeaders() }
      );
      return { success: true, page: response.data };
    } catch (error) {
      throw new Error(`Failed to create page: ${error.response?.data?.message || error.message}`);
    }
  }

  async updatePage(pageId, properties) {
    try {
      const response = await axios.patch(`${this.baseUrl}/pages/${pageId}`,
        { properties },
        { headers: this.getHeaders() }
      );
      return { success: true, page: response.data };
    } catch (error) {
      throw new Error(`Failed to update page: ${error.response?.data?.message || error.message}`);
    }
  }

  async archivePage(pageId) {
    try {
      const response = await axios.patch(`${this.baseUrl}/pages/${pageId}`,
        { archived: true },
        { headers: this.getHeaders() }
      );
      return { success: true, page: response.data };
    } catch (error) {
      throw new Error(`Failed to archive page: ${error.response?.data?.message || error.message}`);
    }
  }

  async getBlock(blockId) {
    try {
      const response = await axios.get(`${this.baseUrl}/blocks/${blockId}`, {
        headers: this.getHeaders(),
      });
      return { success: true, block: response.data };
    } catch (error) {
      throw new Error(`Failed to get block: ${error.response?.data?.message || error.message}`);
    }
  }

  async getBlockChildren(blockId) {
    try {
      const response = await axios.get(`${this.baseUrl}/blocks/${blockId}/children`, {
        headers: this.getHeaders(),
      });
      return { success: true, children: response.data.results };
    } catch (error) {
      throw new Error(`Failed to get block children: ${error.response?.data?.message || error.message}`);
    }
  }

  async appendBlockChildren(blockId, children) {
    try {
      const response = await axios.patch(`${this.baseUrl}/blocks/${blockId}/children`,
        { children },
        { headers: this.getHeaders() }
      );
      return { success: true, block: response.data };
    } catch (error) {
      throw new Error(`Failed to append block children: ${error.response?.data?.message || error.message}`);
    }
  }

  async updateBlock(blockId, updates) {
    try {
      const response = await axios.patch(`${this.baseUrl}/blocks/${blockId}`,
        updates,
        { headers: this.getHeaders() }
      );
      return { success: true, block: response.data };
    } catch (error) {
      throw new Error(`Failed to update block: ${error.response?.data?.message || error.message}`);
    }
  }

  async deleteBlock(blockId) {
    try {
      const response = await axios.delete(`${this.baseUrl}/blocks/${blockId}`, {
        headers: this.getHeaders(),
      });
      return { success: true, block: response.data };
    } catch (error) {
      throw new Error(`Failed to delete block: ${error.response?.data?.message || error.message}`);
    }
  }

  async listUsers() {
    try {
      const response = await axios.get(`${this.baseUrl}/users`, {
        headers: this.getHeaders(),
      });
      return { success: true, users: response.data.results };
    } catch (error) {
      throw new Error(`Failed to list users: ${error.response?.data?.message || error.message}`);
    }
  }

  async getUser(userId) {
    try {
      const response = await axios.get(`${this.baseUrl}/users/${userId}`, {
        headers: this.getHeaders(),
      });
      return { success: true, user: response.data };
    } catch (error) {
      throw new Error(`Failed to get user: ${error.response?.data?.message || error.message}`);
    }
  }

  async getMe() {
    try {
      const response = await axios.get(`${this.baseUrl}/users/me`, {
        headers: this.getHeaders(),
      });
      return { success: true, user: response.data };
    } catch (error) {
      throw new Error(`Failed to get me: ${error.response?.data?.message || error.message}`);
    }
  }

  async search(query, filter = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/search`,
        { query, filter },
        { headers: this.getHeaders() }
      );
      return { success: true, results: response.data.results };
    } catch (error) {
      throw new Error(`Failed to search: ${error.response?.data?.message || error.message}`);
    }
  }

  async addComment(pageId, richText) {
    try {
      const response = await axios.post(`${this.baseUrl}/comments`,
        {
          parent: { page_id: pageId },
          rich_text: richText,
        },
        { headers: this.getHeaders() }
      );
      return { success: true, comment: response.data };
    } catch (error) {
      throw new Error(`Failed to add comment: ${error.response?.data?.message || error.message}`);
    }
  }

  async getComments(blockId) {
    try {
      const response = await axios.get(`${this.baseUrl}/comments`, {
        headers: this.getHeaders(),
        params: { block_id: blockId },
      });
      return { success: true, comments: response.data.results };
    } catch (error) {
      throw new Error(`Failed to get comments: ${error.response?.data?.message || error.message}`);
    }
  }
}

module.exports = NotionIntegration;
