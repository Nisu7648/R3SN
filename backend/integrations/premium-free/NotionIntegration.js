const axios = require('axios');

/**
 * Notion Integration
 * FREE Premium App - Complete workspace management
 * Sign up at: https://www.notion.so
 * Get API key: https://www.notion.so/my-integrations
 * 
 * Features:
 * - Create/read/update pages
 * - Database management
 * - Block operations
 * - Search functionality
 * - User management
 * - Comments
 * 
 * 100% FREE - No cost, unlimited usage
 */
class NotionIntegration {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.notion.com/v1';
    this.version = '2022-06-28';
  }

  /**
   * Get headers for API requests
   */
  getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Notion-Version': this.version,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Search across workspace
   */
  async search(query, filter = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/search`, {
        query,
        filter,
        sort: {
          direction: 'descending',
          timestamp: 'last_edited_time'
        }
      }, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        results: response.data.results,
        hasMore: response.data.has_more,
        nextCursor: response.data.next_cursor
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Get page by ID
   */
  async getPage(pageId) {
    try {
      const response = await axios.get(`${this.baseUrl}/pages/${pageId}`, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        page: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Create a new page
   */
  async createPage(parentId, properties, children = []) {
    try {
      const response = await axios.post(`${this.baseUrl}/pages`, {
        parent: { page_id: parentId },
        properties,
        children
      }, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        page: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Update page properties
   */
  async updatePage(pageId, properties) {
    try {
      const response = await axios.patch(`${this.baseUrl}/pages/${pageId}`, {
        properties
      }, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        page: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Get database
   */
  async getDatabase(databaseId) {
    try {
      const response = await axios.get(`${this.baseUrl}/databases/${databaseId}`, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        database: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Query database
   */
  async queryDatabase(databaseId, filter = {}, sorts = []) {
    try {
      const response = await axios.post(`${this.baseUrl}/databases/${databaseId}/query`, {
        filter,
        sorts
      }, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        results: response.data.results,
        hasMore: response.data.has_more,
        nextCursor: response.data.next_cursor
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Create database
   */
  async createDatabase(parentId, title, properties) {
    try {
      const response = await axios.post(`${this.baseUrl}/databases`, {
        parent: { page_id: parentId },
        title: [{ text: { content: title } }],
        properties
      }, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        database: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Get block children
   */
  async getBlockChildren(blockId) {
    try {
      const response = await axios.get(`${this.baseUrl}/blocks/${blockId}/children`, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        blocks: response.data.results,
        hasMore: response.data.has_more,
        nextCursor: response.data.next_cursor
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Append block children
   */
  async appendBlockChildren(blockId, children) {
    try {
      const response = await axios.patch(`${this.baseUrl}/blocks/${blockId}/children`, {
        children
      }, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        blocks: response.data.results
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Get user
   */
  async getUser(userId) {
    try {
      const response = await axios.get(`${this.baseUrl}/users/${userId}`, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        user: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * List all users
   */
  async listUsers() {
    try {
      const response = await axios.get(`${this.baseUrl}/users`, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        users: response.data.results
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Get comments
   */
  async getComments(blockId) {
    try {
      const response = await axios.get(`${this.baseUrl}/comments`, {
        params: { block_id: blockId },
        headers: this.getHeaders()
      });

      return {
        success: true,
        comments: response.data.results
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Create comment
   */
  async createComment(pageId, text) {
    try {
      const response = await axios.post(`${this.baseUrl}/comments`, {
        parent: { page_id: pageId },
        rich_text: [{ text: { content: text } }]
      }, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        comment: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Helper: Create simple page with text
   */
  async createSimplePage(parentId, title, content) {
    const properties = {
      title: {
        title: [{ text: { content: title } }]
      }
    };

    const children = [
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ text: { content } }]
        }
      }
    ];

    return await this.createPage(parentId, properties, children);
  }

  /**
   * Helper: Create task in database
   */
  async createTask(databaseId, taskName, status = 'Not started', dueDate = null) {
    const properties = {
      Name: {
        title: [{ text: { content: taskName } }]
      },
      Status: {
        select: { name: status }
      }
    };

    if (dueDate) {
      properties.Due = {
        date: { start: dueDate }
      };
    }

    try {
      const response = await axios.post(`${this.baseUrl}/pages`, {
        parent: { database_id: databaseId },
        properties
      }, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        task: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }
}

module.exports = NotionIntegration;
