const axios = require('axios');

/**
 * Monday.com Integration
 * FREE Premium App - Work operating system
 * Sign up at: https://monday.com
 * Get API token: https://monday.com/admin/integrations/api
 * 
 * Features:
 * - Boards and items
 * - Columns and values
 * - Groups
 * - Updates (comments)
 * - Files
 * - Webhooks
 * - Workspaces
 * 
 * FREE Plan: Up to 2 seats, unlimited boards
 */
class MondayIntegration {
  constructor(apiToken) {
    this.apiToken = apiToken;
    this.baseUrl = 'https://api.monday.com/v2';
  }

  /**
   * Execute GraphQL query
   */
  async query(query, variables = {}) {
    try {
      const response = await axios.post(this.baseUrl, {
        query,
        variables
      }, {
        headers: {
          'Authorization': this.apiToken,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.errors) {
        return {
          success: false,
          error: response.data.errors[0].message
        };
      }

      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error_message || error.message
      };
    }
  }

  /**
   * Get current user
   */
  async getMe() {
    const query = `
      query {
        me {
          id
          name
          email
          photo_thumb
          is_admin
          is_guest
        }
      }
    `;

    return await this.query(query);
  }

  /**
   * Get all boards
   */
  async getBoards(limit = 50) {
    const query = `
      query ($limit: Int!) {
        boards(limit: $limit) {
          id
          name
          description
          state
          board_kind
          permissions
        }
      }
    `;

    return await this.query(query, { limit });
  }

  /**
   * Get board by ID
   */
  async getBoard(boardId) {
    const query = `
      query ($boardId: [ID!]) {
        boards(ids: $boardId) {
          id
          name
          description
          state
          board_kind
          columns {
            id
            title
            type
          }
          groups {
            id
            title
            color
          }
        }
      }
    `;

    return await this.query(query, { boardId: [boardId] });
  }

  /**
   * Create board
   */
  async createBoard(name, kind = 'public', description = '') {
    const query = `
      mutation ($name: String!, $kind: BoardKind!, $description: String) {
        create_board(board_name: $name, board_kind: $kind, description: $description) {
          id
          name
        }
      }
    `;

    return await this.query(query, { name, kind, description });
  }

  /**
   * Delete board
   */
  async deleteBoard(boardId) {
    const query = `
      mutation ($boardId: ID!) {
        delete_board(board_id: $boardId) {
          id
        }
      }
    `;

    return await this.query(query, { boardId });
  }

  /**
   * Get items on board
   */
  async getItems(boardId, limit = 50) {
    const query = `
      query ($boardId: [ID!], $limit: Int!) {
        boards(ids: $boardId) {
          items_page(limit: $limit) {
            items {
              id
              name
              state
              column_values {
                id
                text
                value
              }
            }
          }
        }
      }
    `;

    return await this.query(query, { boardId: [boardId], limit });
  }

  /**
   * Get item by ID
   */
  async getItem(itemId) {
    const query = `
      query ($itemId: [ID!]) {
        items(ids: $itemId) {
          id
          name
          state
          board {
            id
            name
          }
          group {
            id
            title
          }
          column_values {
            id
            title
            text
            value
          }
        }
      }
    `;

    return await this.query(query, { itemId: [itemId] });
  }

  /**
   * Create item
   */
  async createItem(boardId, itemName, groupId = null, columnValues = {}) {
    const query = `
      mutation ($boardId: ID!, $itemName: String!, $groupId: String, $columnValues: JSON) {
        create_item(
          board_id: $boardId,
          item_name: $itemName,
          group_id: $groupId,
          column_values: $columnValues
        ) {
          id
          name
        }
      }
    `;

    return await this.query(query, {
      boardId,
      itemName,
      groupId,
      columnValues: JSON.stringify(columnValues)
    });
  }

  /**
   * Update item
   */
  async updateItem(itemId, columnValues) {
    const query = `
      mutation ($itemId: ID!, $columnValues: JSON!) {
        change_multiple_column_values(
          item_id: $itemId,
          board_id: null,
          column_values: $columnValues
        ) {
          id
        }
      }
    `;

    return await this.query(query, {
      itemId,
      columnValues: JSON.stringify(columnValues)
    });
  }

  /**
   * Delete item
   */
  async deleteItem(itemId) {
    const query = `
      mutation ($itemId: ID!) {
        delete_item(item_id: $itemId) {
          id
        }
      }
    `;

    return await this.query(query, { itemId });
  }

  /**
   * Create group
   */
  async createGroup(boardId, groupName) {
    const query = `
      mutation ($boardId: ID!, $groupName: String!) {
        create_group(board_id: $boardId, group_name: $groupName) {
          id
          title
        }
      }
    `;

    return await this.query(query, { boardId, groupName });
  }

  /**
   * Delete group
   */
  async deleteGroup(boardId, groupId) {
    const query = `
      mutation ($boardId: ID!, $groupId: String!) {
        delete_group(board_id: $boardId, group_id: $groupId) {
          id
        }
      }
    `;

    return await this.query(query, { boardId, groupId });
  }

  /**
   * Create column
   */
  async createColumn(boardId, title, columnType = 'text') {
    const query = `
      mutation ($boardId: ID!, $title: String!, $columnType: ColumnType!) {
        create_column(board_id: $boardId, title: $title, column_type: $columnType) {
          id
          title
          type
        }
      }
    `;

    return await this.query(query, { boardId, title, columnType });
  }

  /**
   * Get updates (comments) for item
   */
  async getUpdates(itemId, limit = 25) {
    const query = `
      query ($itemId: [ID!], $limit: Int!) {
        items(ids: $itemId) {
          updates(limit: $limit) {
            id
            body
            created_at
            creator {
              id
              name
            }
          }
        }
      }
    `;

    return await this.query(query, { itemId: [itemId], limit });
  }

  /**
   * Create update (comment)
   */
  async createUpdate(itemId, body) {
    const query = `
      mutation ($itemId: ID!, $body: String!) {
        create_update(item_id: $itemId, body: $body) {
          id
          body
        }
      }
    `;

    return await this.query(query, { itemId, body });
  }

  /**
   * Delete update
   */
  async deleteUpdate(updateId) {
    const query = `
      mutation ($updateId: ID!) {
        delete_update(id: $updateId) {
          id
        }
      }
    `;

    return await this.query(query, { updateId });
  }

  /**
   * Search items
   */
  async searchItems(boardId, query) {
    const graphqlQuery = `
      query ($boardId: [ID!], $query: String!) {
        boards(ids: $boardId) {
          items_page(query_params: {rules: [{column_id: "name", compare_value: [$query]}]}) {
            items {
              id
              name
              column_values {
                id
                text
              }
            }
          }
        }
      }
    `;

    return await this.query(graphqlQuery, { boardId: [boardId], query });
  }

  /**
   * Get workspaces
   */
  async getWorkspaces() {
    const query = `
      query {
        workspaces {
          id
          name
          kind
          description
        }
      }
    `;

    return await this.query(query);
  }

  /**
   * Create workspace
   */
  async createWorkspace(name, kind = 'open', description = '') {
    const query = `
      mutation ($name: String!, $kind: WorkspaceKind!, $description: String) {
        create_workspace(name: $name, kind: $kind, description: $description) {
          id
          name
        }
      }
    `;

    return await this.query(query, { name, kind, description });
  }

  /**
   * Helper: Create task item
   */
  async createTask(boardId, taskName, status = 'Working on it', dueDate = null) {
    const columnValues = {
      status: { label: status }
    };

    if (dueDate) {
      columnValues.date = { date: dueDate };
    }

    return await this.createItem(boardId, taskName, null, columnValues);
  }

  /**
   * Helper: Update task status
   */
  async updateTaskStatus(itemId, status) {
    return await this.updateItem(itemId, {
      status: { label: status }
    });
  }

  /**
   * Helper: Add comment to task
   */
  async addComment(itemId, comment) {
    return await this.createUpdate(itemId, comment);
  }
}

module.exports = MondayIntegration;
