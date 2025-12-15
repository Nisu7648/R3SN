/**
 * Notion Integration
 * Real Notion API for workspace management
 */

const axios = require('axios');

class NotionIntegration {
  constructor(config) {
    this.config = config;
    this.validateConfig();
    this.baseUrl = 'https://api.notion.com/v1';
  }

  validateConfig() {
    if (!this.config.apiKey) {
      throw new Error('Notion API Key is required');
    }
  }

  getHeaders() {
    return {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    };
  }

  async execute(action, params) {
    const actions = {
      createPage: this.createPage.bind(this),
      getPage: this.getPage.bind(this),
      updatePage: this.updatePage.bind(this),
      queryDatabase: this.queryDatabase.bind(this),
      createDatabase: this.createDatabase.bind(this),
      getDatabase: this.getDatabase.bind(this),
      addPageToDatabase: this.addPageToDatabase.bind(this),
      search: this.search.bind(this),
      getBlockChildren: this.getBlockChildren.bind(this),
      appendBlockChildren: this.appendBlockChildren.bind(this),
    };

    if (!actions[action]) {
      throw new Error(`Unknown action: ${action}`);
    }

    return await actions[action](params);
  }

  async createPage(params) {
    const { parent, properties, children } = params;
    
    if (!parent || !properties) {
      throw new Error('Parent and properties are required');
    }

    try {
      const payload = {
        parent,
        properties,
        ...(children && { children })
      };

      const response = await axios.post(
        `${this.baseUrl}/pages`,
        payload,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          id: response.data.id,
          url: response.data.url,
          createdTime: response.data.created_time
        }
      };
    } catch (error) {
      throw new Error(`Notion API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async getPage(params) {
    const { pageId } = params;
    
    if (!pageId) {
      throw new Error('Page ID is required');
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/pages/${pageId}`,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          id: response.data.id,
          url: response.data.url,
          properties: response.data.properties,
          createdTime: response.data.created_time,
          lastEditedTime: response.data.last_edited_time
        }
      };
    } catch (error) {
      throw new Error(`Notion API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async updatePage(params) {
    const { pageId, properties } = params;
    
    if (!pageId || !properties) {
      throw new Error('Page ID and properties are required');
    }

    try {
      const response = await axios.patch(
        `${this.baseUrl}/pages/${pageId}`,
        { properties },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          id: response.data.id,
          lastEditedTime: response.data.last_edited_time
        }
      };
    } catch (error) {
      throw new Error(`Notion API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async queryDatabase(params) {
    const { databaseId, filter, sorts, pageSize = 100 } = params;
    
    if (!databaseId) {
      throw new Error('Database ID is required');
    }

    try {
      const payload = {
        page_size: pageSize,
        ...(filter && { filter }),
        ...(sorts && { sorts })
      };

      const response = await axios.post(
        `${this.baseUrl}/databases/${databaseId}/query`,
        payload,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          results: response.data.results.map(page => ({
            id: page.id,
            url: page.url,
            properties: page.properties
          })),
          hasMore: response.data.has_more,
          nextCursor: response.data.next_cursor
        }
      };
    } catch (error) {
      throw new Error(`Notion API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async createDatabase(params) {
    const { parent, title, properties } = params;
    
    if (!parent || !title || !properties) {
      throw new Error('Parent, title, and properties are required');
    }

    try {
      const payload = {
        parent,
        title: [{ text: { content: title } }],
        properties
      };

      const response = await axios.post(
        `${this.baseUrl}/databases`,
        payload,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          id: response.data.id,
          url: response.data.url,
          title: response.data.title
        }
      };
    } catch (error) {
      throw new Error(`Notion API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async getDatabase(params) {
    const { databaseId } = params;
    
    if (!databaseId) {
      throw new Error('Database ID is required');
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/databases/${databaseId}`,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          id: response.data.id,
          url: response.data.url,
          title: response.data.title,
          properties: response.data.properties
        }
      };
    } catch (error) {
      throw new Error(`Notion API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async addPageToDatabase(params) {
    const { databaseId, properties } = params;
    
    if (!databaseId || !properties) {
      throw new Error('Database ID and properties are required');
    }

    try {
      const payload = {
        parent: { database_id: databaseId },
        properties
      };

      const response = await axios.post(
        `${this.baseUrl}/pages`,
        payload,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          id: response.data.id,
          url: response.data.url
        }
      };
    } catch (error) {
      throw new Error(`Notion API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async search(params) {
    const { query, filter, sort, pageSize = 100 } = params;

    try {
      const payload = {
        page_size: pageSize,
        ...(query && { query }),
        ...(filter && { filter }),
        ...(sort && { sort })
      };

      const response = await axios.post(
        `${this.baseUrl}/search`,
        payload,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          results: response.data.results.map(item => ({
            id: item.id,
            object: item.object,
            url: item.url
          })),
          hasMore: response.data.has_more
        }
      };
    } catch (error) {
      throw new Error(`Notion API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async getBlockChildren(params) {
    const { blockId, pageSize = 100 } = params;
    
    if (!blockId) {
      throw new Error('Block ID is required');
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/blocks/${blockId}/children`,
        {
          headers: this.getHeaders(),
          params: { page_size: pageSize }
        }
      );

      return {
        success: true,
        data: {
          results: response.data.results,
          hasMore: response.data.has_more
        }
      };
    } catch (error) {
      throw new Error(`Notion API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async appendBlockChildren(params) {
    const { blockId, children } = params;
    
    if (!blockId || !children) {
      throw new Error('Block ID and children are required');
    }

    try {
      const response = await axios.patch(
        `${this.baseUrl}/blocks/${blockId}/children`,
        { children },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          results: response.data.results
        }
      };
    } catch (error) {
      throw new Error(`Notion API error: ${error.response?.data?.message || error.message}`);
    }
  }
}

module.exports = NotionIntegration;
