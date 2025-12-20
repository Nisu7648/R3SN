const axios = require('axios');

/**
 * Trello Integration
 * FREE Premium App - Complete project management
 * Sign up at: https://trello.com
 * Get API key: https://trello.com/app-key
 * 
 * Features:
 * - Board management
 * - List operations
 * - Card CRUD
 * - Checklists
 * - Labels
 * - Members
 * - Attachments
 * - Comments
 * 
 * 100% FREE - Unlimited boards, lists, cards
 */
class TrelloIntegration {
  constructor(apiKey, token) {
    this.apiKey = apiKey;
    this.token = token;
    this.baseUrl = 'https://api.trello.com/1';
  }

  /**
   * Get auth params
   */
  getAuthParams() {
    return {
      key: this.apiKey,
      token: this.token
    };
  }

  /**
   * Get all boards
   */
  async getBoards(memberId = 'me') {
    try {
      const response = await axios.get(`${this.baseUrl}/members/${memberId}/boards`, {
        params: this.getAuthParams()
      });

      return {
        success: true,
        boards: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Get board by ID
   */
  async getBoard(boardId) {
    try {
      const response = await axios.get(`${this.baseUrl}/boards/${boardId}`, {
        params: this.getAuthParams()
      });

      return {
        success: true,
        board: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Create new board
   */
  async createBoard(name, desc = '', defaultLists = true) {
    try {
      const response = await axios.post(`${this.baseUrl}/boards`, null, {
        params: {
          ...this.getAuthParams(),
          name,
          desc,
          defaultLists
        }
      });

      return {
        success: true,
        board: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Update board
   */
  async updateBoard(boardId, updates) {
    try {
      const response = await axios.put(`${this.baseUrl}/boards/${boardId}`, null, {
        params: {
          ...this.getAuthParams(),
          ...updates
        }
      });

      return {
        success: true,
        board: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Delete board
   */
  async deleteBoard(boardId) {
    try {
      await axios.delete(`${this.baseUrl}/boards/${boardId}`, {
        params: this.getAuthParams()
      });

      return {
        success: true,
        message: 'Board deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Get lists on board
   */
  async getLists(boardId) {
    try {
      const response = await axios.get(`${this.baseUrl}/boards/${boardId}/lists`, {
        params: this.getAuthParams()
      });

      return {
        success: true,
        lists: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Create list
   */
  async createList(boardId, name, pos = 'bottom') {
    try {
      const response = await axios.post(`${this.baseUrl}/lists`, null, {
        params: {
          ...this.getAuthParams(),
          name,
          idBoard: boardId,
          pos
        }
      });

      return {
        success: true,
        list: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Update list
   */
  async updateList(listId, updates) {
    try {
      const response = await axios.put(`${this.baseUrl}/lists/${listId}`, null, {
        params: {
          ...this.getAuthParams(),
          ...updates
        }
      });

      return {
        success: true,
        list: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Archive list
   */
  async archiveList(listId) {
    try {
      const response = await axios.put(`${this.baseUrl}/lists/${listId}/closed`, null, {
        params: {
          ...this.getAuthParams(),
          value: true
        }
      });

      return {
        success: true,
        list: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Get cards on list
   */
  async getCards(listId) {
    try {
      const response = await axios.get(`${this.baseUrl}/lists/${listId}/cards`, {
        params: this.getAuthParams()
      });

      return {
        success: true,
        cards: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Get card by ID
   */
  async getCard(cardId) {
    try {
      const response = await axios.get(`${this.baseUrl}/cards/${cardId}`, {
        params: this.getAuthParams()
      });

      return {
        success: true,
        card: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Create card
   */
  async createCard(listId, name, desc = '', pos = 'bottom') {
    try {
      const response = await axios.post(`${this.baseUrl}/cards`, null, {
        params: {
          ...this.getAuthParams(),
          idList: listId,
          name,
          desc,
          pos
        }
      });

      return {
        success: true,
        card: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Update card
   */
  async updateCard(cardId, updates) {
    try {
      const response = await axios.put(`${this.baseUrl}/cards/${cardId}`, null, {
        params: {
          ...this.getAuthParams(),
          ...updates
        }
      });

      return {
        success: true,
        card: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Move card to list
   */
  async moveCard(cardId, listId) {
    return await this.updateCard(cardId, { idList: listId });
  }

  /**
   * Delete card
   */
  async deleteCard(cardId) {
    try {
      await axios.delete(`${this.baseUrl}/cards/${cardId}`, {
        params: this.getAuthParams()
      });

      return {
        success: true,
        message: 'Card deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Add comment to card
   */
  async addComment(cardId, text) {
    try {
      const response = await axios.post(`${this.baseUrl}/cards/${cardId}/actions/comments`, null, {
        params: {
          ...this.getAuthParams(),
          text
        }
      });

      return {
        success: true,
        comment: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Get card comments
   */
  async getComments(cardId) {
    try {
      const response = await axios.get(`${this.baseUrl}/cards/${cardId}/actions`, {
        params: {
          ...this.getAuthParams(),
          filter: 'commentCard'
        }
      });

      return {
        success: true,
        comments: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Add checklist to card
   */
  async addChecklist(cardId, name) {
    try {
      const response = await axios.post(`${this.baseUrl}/cards/${cardId}/checklists`, null, {
        params: {
          ...this.getAuthParams(),
          name
        }
      });

      return {
        success: true,
        checklist: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Add checklist item
   */
  async addChecklistItem(checklistId, name, checked = false) {
    try {
      const response = await axios.post(`${this.baseUrl}/checklists/${checklistId}/checkItems`, null, {
        params: {
          ...this.getAuthParams(),
          name,
          checked
        }
      });

      return {
        success: true,
        item: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Update checklist item
   */
  async updateChecklistItem(cardId, checkItemId, state) {
    try {
      const response = await axios.put(
        `${this.baseUrl}/cards/${cardId}/checkItem/${checkItemId}`,
        null,
        {
          params: {
            ...this.getAuthParams(),
            state
          }
        }
      );

      return {
        success: true,
        item: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Add label to card
   */
  async addLabel(cardId, color, name = '') {
    try {
      const response = await axios.post(`${this.baseUrl}/cards/${cardId}/labels`, null, {
        params: {
          ...this.getAuthParams(),
          color,
          name
        }
      });

      return {
        success: true,
        label: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Add member to card
   */
  async addMember(cardId, memberId) {
    try {
      const response = await axios.post(`${this.baseUrl}/cards/${cardId}/idMembers`, null, {
        params: {
          ...this.getAuthParams(),
          value: memberId
        }
      });

      return {
        success: true,
        members: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Set due date
   */
  async setDueDate(cardId, dueDate) {
    return await this.updateCard(cardId, { due: dueDate });
  }

  /**
   * Search cards
   */
  async searchCards(query, boardIds = []) {
    try {
      const params = {
        ...this.getAuthParams(),
        query,
        modelTypes: 'cards',
        card_fields: 'all'
      };

      if (boardIds.length > 0) {
        params.idBoards = boardIds.join(',');
      }

      const response = await axios.get(`${this.baseUrl}/search`, { params });

      return {
        success: true,
        cards: response.data.cards
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }
}

module.exports = TrelloIntegration;
