/**
 * Trello Integration - Complete Implementation
 * 15 endpoints for full Trello functionality
 */

const axios = require('axios');

class TrelloIntegration {
  constructor(apiKey, token) {
    this.apiKey = apiKey;
    this.token = token;
    this.baseUrl = 'https://api.trello.com/1';
  }

  getAuthParams() {
    return { key: this.apiKey, token: this.token };
  }

  async listBoards() {
    try {
      const response = await axios.get(`${this.baseUrl}/members/me/boards`, {
        params: this.getAuthParams(),
      });
      return { success: true, boards: response.data };
    } catch (error) {
      throw new Error(`Failed to list boards: ${error.response?.data || error.message}`);
    }
  }

  async createBoard(name, options = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/boards`, null, {
        params: { ...this.getAuthParams(), name, ...options },
      });
      return { success: true, board: response.data };
    } catch (error) {
      throw new Error(`Failed to create board: ${error.response?.data || error.message}`);
    }
  }

  async getBoard(boardId) {
    try {
      const response = await axios.get(`${this.baseUrl}/boards/${boardId}`, {
        params: this.getAuthParams(),
      });
      return { success: true, board: response.data };
    } catch (error) {
      throw new Error(`Failed to get board: ${error.response?.data || error.message}`);
    }
  }

  async listLists(boardId) {
    try {
      const response = await axios.get(`${this.baseUrl}/boards/${boardId}/lists`, {
        params: this.getAuthParams(),
      });
      return { success: true, lists: response.data };
    } catch (error) {
      throw new Error(`Failed to list lists: ${error.response?.data || error.message}`);
    }
  }

  async createList(name, boardId, options = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/lists`, null, {
        params: { ...this.getAuthParams(), name, idBoard: boardId, ...options },
      });
      return { success: true, list: response.data };
    } catch (error) {
      throw new Error(`Failed to create list: ${error.response?.data || error.message}`);
    }
  }

  async listCards(listId) {
    try {
      const response = await axios.get(`${this.baseUrl}/lists/${listId}/cards`, {
        params: this.getAuthParams(),
      });
      return { success: true, cards: response.data };
    } catch (error) {
      throw new Error(`Failed to list cards: ${error.response?.data || error.message}`);
    }
  }

  async createCard(name, listId, options = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/cards`, null, {
        params: { ...this.getAuthParams(), name, idList: listId, ...options },
      });
      return { success: true, card: response.data };
    } catch (error) {
      throw new Error(`Failed to create card: ${error.response?.data || error.message}`);
    }
  }

  async getCard(cardId) {
    try {
      const response = await axios.get(`${this.baseUrl}/cards/${cardId}`, {
        params: this.getAuthParams(),
      });
      return { success: true, card: response.data };
    } catch (error) {
      throw new Error(`Failed to get card: ${error.response?.data || error.message}`);
    }
  }

  async updateCard(cardId, updates) {
    try {
      const response = await axios.put(`${this.baseUrl}/cards/${cardId}`, null, {
        params: { ...this.getAuthParams(), ...updates },
      });
      return { success: true, card: response.data };
    } catch (error) {
      throw new Error(`Failed to update card: ${error.response?.data || error.message}`);
    }
  }

  async deleteCard(cardId) {
    try {
      await axios.delete(`${this.baseUrl}/cards/${cardId}`, {
        params: this.getAuthParams(),
      });
      return { success: true, message: 'Card deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete card: ${error.response?.data || error.message}`);
    }
  }

  async addMember(cardId, memberId) {
    try {
      const response = await axios.post(`${this.baseUrl}/cards/${cardId}/idMembers`, null, {
        params: { ...this.getAuthParams(), value: memberId },
      });
      return { success: true, result: response.data };
    } catch (error) {
      throw new Error(`Failed to add member: ${error.response?.data || error.message}`);
    }
  }

  async addLabel(cardId, labelId) {
    try {
      const response = await axios.post(`${this.baseUrl}/cards/${cardId}/idLabels`, null, {
        params: { ...this.getAuthParams(), value: labelId },
      });
      return { success: true, result: response.data };
    } catch (error) {
      throw new Error(`Failed to add label: ${error.response?.data || error.message}`);
    }
  }

  async addChecklist(cardId, name) {
    try {
      const response = await axios.post(`${this.baseUrl}/cards/${cardId}/checklists`, null, {
        params: { ...this.getAuthParams(), name },
      });
      return { success: true, checklist: response.data };
    } catch (error) {
      throw new Error(`Failed to add checklist: ${error.response?.data || error.message}`);
    }
  }

  async addAttachment(cardId, url, options = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/cards/${cardId}/attachments`, null, {
        params: { ...this.getAuthParams(), url, ...options },
      });
      return { success: true, attachment: response.data };
    } catch (error) {
      throw new Error(`Failed to add attachment: ${error.response?.data || error.message}`);
    }
  }

  async addComment(cardId, text) {
    try {
      const response = await axios.post(`${this.baseUrl}/cards/${cardId}/actions/comments`, null, {
        params: { ...this.getAuthParams(), text },
      });
      return { success: true, comment: response.data };
    } catch (error) {
      throw new Error(`Failed to add comment: ${error.response?.data || error.message}`);
    }
  }
}

module.exports = TrelloIntegration;
