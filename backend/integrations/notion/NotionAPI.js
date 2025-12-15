/**
 * Notion API Integration
 * Complete workspace management with all endpoints
 */

const axios = require('axios');

class NotionAPI {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.NOTION_API_KEY;
    this.baseURL = 'https://api.notion.com/v1';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      }
    });
  }

  // ==================== PAGES ====================

  async createPage(data) {
    const payload = {
      parent: data.parent,
      properties: data.properties,
      ...(data.children && { children: data.children }),
      ...(data.icon && { icon: data.icon }),
      ...(data.cover && { cover: data.cover })
    };

    const response = await this.client.post('/pages', payload);
    return { success: true, page: response.data };
  }

  async getPage(pageId) {
    const response = await this.client.get(`/pages/${pageId}`);
    return { success: true, page: response.data };
  }

  async updatePage(pageId, data) {
    const payload = {
      ...(data.properties && { properties: data.properties }),
      ...(data.archived !== undefined && { archived: data.archived }),
      ...(data.icon && { icon: data.icon }),
      ...(data.cover && { cover: data.cover })
    };

    const response = await this.client.patch(`/pages/${pageId}`, payload);
    return { success: true, page: response.data };
  }

  async getPageProperty(pageId, propertyId) {
    const response = await this.client.get(`/pages/${pageId}/properties/${propertyId}`);
    return { success: true, property: response.data };
  }

  // ==================== DATABASES ====================

  async createDatabase(data) {
    const payload = {
      parent: data.parent,
      title: data.title,
      properties: data.properties,
      ...(data.icon && { icon: data.icon }),
      ...(data.cover && { cover: data.cover })
    };

    const response = await this.client.post('/databases', payload);
    return { success: true, database: response.data };
  }

  async getDatabase(databaseId) {
    const response = await this.client.get(`/databases/${databaseId}`);
    return { success: true, database: response.data };
  }

  async updateDatabase(databaseId, data) {
    const payload = {
      ...(data.title && { title: data.title }),
      ...(data.description && { description: data.description }),
      ...(data.properties && { properties: data.properties })
    };

    const response = await this.client.patch(`/databases/${databaseId}`, payload);
    return { success: true, database: response.data };
  }

  async queryDatabase(databaseId, options = {}) {
    const payload = {
      ...(options.filter && { filter: options.filter }),
      ...(options.sorts && { sorts: options.sorts }),
      ...(options.start_cursor && { start_cursor: options.start_cursor }),
      page_size: options.page_size || 100
    };

    const response = await this.client.post(`/databases/${databaseId}/query`, payload);
    return { 
      success: true, 
      results: response.data.results,
      has_more: response.data.has_more,
      next_cursor: response.data.next_cursor
    };
  }

  // ==================== BLOCKS ====================

  async getBlock(blockId) {
    const response = await this.client.get(`/blocks/${blockId}`);
    return { success: true, block: response.data };
  }

  async getBlockChildren(blockId, options = {}) {
    const params = new URLSearchParams({
      page_size: options.page_size || 100,
      ...(options.start_cursor && { start_cursor: options.start_cursor })
    });

    const response = await this.client.get(`/blocks/${blockId}/children?${params}`);
    return { 
      success: true, 
      results: response.data.results,
      has_more: response.data.has_more,
      next_cursor: response.data.next_cursor
    };
  }

  async appendBlockChildren(blockId, children) {
    const payload = { children };
    const response = await this.client.patch(`/blocks/${blockId}/children`, payload);
    return { success: true, results: response.data.results };
  }

  async updateBlock(blockId, data) {
    const response = await this.client.patch(`/blocks/${blockId}`, data);
    return { success: true, block: response.data };
  }

  async deleteBlock(blockId) {
    const response = await this.client.delete(`/blocks/${blockId}`);
    return { success: true, block: response.data };
  }

  // ==================== USERS ====================

  async getUser(userId) {
    const response = await this.client.get(`/users/${userId}`);
    return { success: true, user: response.data };
  }

  async listUsers(options = {}) {
    const params = new URLSearchParams({
      page_size: options.page_size || 100,
      ...(options.start_cursor && { start_cursor: options.start_cursor })
    });

    const response = await this.client.get(`/users?${params}`);
    return { 
      success: true, 
      results: response.data.results,
      has_more: response.data.has_more,
      next_cursor: response.data.next_cursor
    };
  }

  async getMe() {
    const response = await this.client.get('/users/me');
    return { success: true, user: response.data };
  }

  // ==================== SEARCH ====================

  async search(options = {}) {
    const payload = {
      ...(options.query && { query: options.query }),
      ...(options.filter && { filter: options.filter }),
      ...(options.sort && { sort: options.sort }),
      ...(options.start_cursor && { start_cursor: options.start_cursor }),
      page_size: options.page_size || 100
    };

    const response = await this.client.post('/search', payload);
    return { 
      success: true, 
      results: response.data.results,
      has_more: response.data.has_more,
      next_cursor: response.data.next_cursor
    };
  }

  // ==================== COMMENTS ====================

  async createComment(data) {
    const payload = {
      parent: data.parent,
      rich_text: data.rich_text,
      ...(data.discussion_id && { discussion_id: data.discussion_id })
    };

    const response = await this.client.post('/comments', payload);
    return { success: true, comment: response.data };
  }

  async getComments(options = {}) {
    const params = new URLSearchParams({
      block_id: options.block_id,
      ...(options.start_cursor && { start_cursor: options.start_cursor }),
      page_size: options.page_size || 100
    });

    const response = await this.client.get(`/comments?${params}`);
    return { 
      success: true, 
      results: response.data.results,
      has_more: response.data.has_more,
      next_cursor: response.data.next_cursor
    };
  }

  // ==================== HELPER METHODS ====================

  async createTextPage(parentId, title, content) {
    return this.createPage({
      parent: { page_id: parentId },
      properties: {
        title: {
          title: [{ text: { content: title } }]
        }
      },
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{ text: { content } }]
          }
        }
      ]
    });
  }

  async createDatabaseEntry(databaseId, properties) {
    return this.createPage({
      parent: { database_id: databaseId },
      properties
    });
  }

  async addParagraph(blockId, text) {
    return this.appendBlockChildren(blockId, [
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ text: { content: text } }]
        }
      }
    ]);
  }

  async addHeading(blockId, text, level = 1) {
    const type = `heading_${level}`;
    return this.appendBlockChildren(blockId, [
      {
        object: 'block',
        type,
        [type]: {
          rich_text: [{ text: { content: text } }]
        }
      }
    ]);
  }

  async addBulletList(blockId, items) {
    const children = items.map(item => ({
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: {
        rich_text: [{ text: { content: item } }]
      }
    }));

    return this.appendBlockChildren(blockId, children);
  }

  async addNumberedList(blockId, items) {
    const children = items.map(item => ({
      object: 'block',
      type: 'numbered_list_item',
      numbered_list_item: {
        rich_text: [{ text: { content: item } }]
      }
    }));

    return this.appendBlockChildren(blockId, children);
  }

  async addTodo(blockId, text, checked = false) {
    return this.appendBlockChildren(blockId, [
      {
        object: 'block',
        type: 'to_do',
        to_do: {
          rich_text: [{ text: { content: text } }],
          checked
        }
      }
    ]);
  }

  async addCode(blockId, code, language = 'javascript') {
    return this.appendBlockChildren(blockId, [
      {
        object: 'block',
        type: 'code',
        code: {
          rich_text: [{ text: { content: code } }],
          language
        }
      }
    ]);
  }
}

module.exports = NotionAPI;
