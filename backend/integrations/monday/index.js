/**
 * Monday.com Integration - Complete Implementation
 * 20 endpoints using GraphQL API
 */

const axios = require('axios');

class MondayIntegration {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.monday.com/v2';
  }

  async query(query, variables = {}) {
    try {
      const response = await axios.post(this.baseUrl,
        { query, variables },
        {
          headers: {
            'Authorization': this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data.data;
    } catch (error) {
      throw new Error(`Monday.com API error: ${error.response?.data?.error_message || error.message}`);
    }
  }

  async getBoards(limit = 50) {
    const query = `query { boards(limit: ${limit}) { id name description state } }`;
    const data = await this.query(query);
    return { success: true, boards: data.boards };
  }

  async createBoard(name, boardKind, options = {}) {
    const query = `mutation { create_board(board_name: "${name}", board_kind: ${boardKind}) { id name } }`;
    const data = await this.query(query);
    return { success: true, board: data.create_board };
  }

  async getBoard(boardId) {
    const query = `query { boards(ids: [${boardId}]) { id name description state columns { id title type } groups { id title } } }`;
    const data = await this.query(query);
    return { success: true, board: data.boards[0] };
  }

  async archiveBoard(boardId) {
    const query = `mutation { archive_board(board_id: ${boardId}) { id } }`;
    const data = await this.query(query);
    return { success: true, board: data.archive_board };
  }

  async getItems(boardId, limit = 50) {
    const query = `query { boards(ids: [${boardId}]) { items(limit: ${limit}) { id name state column_values { id text } } } }`;
    const data = await this.query(query);
    return { success: true, items: data.boards[0]?.items || [] };
  }

  async createItem(boardId, itemName, groupId = null) {
    const groupParam = groupId ? `, group_id: "${groupId}"` : '';
    const query = `mutation { create_item(board_id: ${boardId}, item_name: "${itemName}"${groupParam}) { id name } }`;
    const data = await this.query(query);
    return { success: true, item: data.create_item };
  }

  async getItem(itemId) {
    const query = `query { items(ids: [${itemId}]) { id name state board { id name } column_values { id text } } }`;
    const data = await this.query(query);
    return { success: true, item: data.items[0] };
  }

  async updateItem(itemId, columnId, value) {
    const query = `mutation { change_column_value(item_id: ${itemId}, column_id: "${columnId}", value: "${value}") { id } }`;
    const data = await this.query(query);
    return { success: true, item: data.change_column_value };
  }

  async deleteItem(itemId) {
    const query = `mutation { delete_item(item_id: ${itemId}) { id } }`;
    const data = await this.query(query);
    return { success: true, item: data.delete_item };
  }

  async getColumns(boardId) {
    const query = `query { boards(ids: [${boardId}]) { columns { id title type settings_str } } }`;
    const data = await this.query(query);
    return { success: true, columns: data.boards[0]?.columns || [] };
  }

  async createColumn(boardId, title, columnType) {
    const query = `mutation { create_column(board_id: ${boardId}, title: "${title}", column_type: ${columnType}) { id title } }`;
    const data = await this.query(query);
    return { success: true, column: data.create_column };
  }

  async updateColumn(itemId, columnId, value) {
    const query = `mutation { change_column_value(item_id: ${itemId}, column_id: "${columnId}", value: "${value}") { id } }`;
    const data = await this.query(query);
    return { success: true, result: data.change_column_value };
  }

  async getGroups(boardId) {
    const query = `query { boards(ids: [${boardId}]) { groups { id title color position } } }`;
    const data = await this.query(query);
    return { success: true, groups: data.boards[0]?.groups || [] };
  }

  async createGroup(boardId, groupName) {
    const query = `mutation { create_group(board_id: ${boardId}, group_name: "${groupName}") { id title } }`;
    const data = await this.query(query);
    return { success: true, group: data.create_group };
  }

  async getUpdates(itemId, limit = 50) {
    const query = `query { items(ids: [${itemId}]) { updates(limit: ${limit}) { id body created_at creator { id name } } } }`;
    const data = await this.query(query);
    return { success: true, updates: data.items[0]?.updates || [] };
  }

  async createUpdate(itemId, body) {
    const query = `mutation { create_update(item_id: ${itemId}, body: "${body}") { id body } }`;
    const data = await this.query(query);
    return { success: true, update: data.create_update };
  }

  async getUsers() {
    const query = `query { users { id name email } }`;
    const data = await this.query(query);
    return { success: true, users: data.users };
  }

  async getTeams() {
    const query = `query { teams { id name } }`;
    const data = await this.query(query);
    return { success: true, teams: data.teams };
  }

  async getTags() {
    const query = `query { tags { id name color } }`;
    const data = await this.query(query);
    return { success: true, tags: data.tags };
  }

  async getWorkspaces() {
    const query = `query { workspaces { id name kind description } }`;
    const data = await this.query(query);
    return { success: true, workspaces: data.workspaces };
  }
}

module.exports = MondayIntegration;
