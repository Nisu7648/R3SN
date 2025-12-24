const axios = require('axios');

class TrelloIntegration {
  constructor(apiKey, token) {
    this.apiKey = apiKey;
    this.token = token;
    this.baseURL = 'https://api.trello.com/1';
  }

  async getBoards() {
    const response = await axios.get(`${this.baseURL}/members/me/boards`, {
      params: { key: this.apiKey, token: this.token }
    });
    return response.data;
  }

  async getBoard(boardId) {
    const response = await axios.get(`${this.baseURL}/boards/${boardId}`, {
      params: { key: this.apiKey, token: this.token }
    });
    return response.data;
  }

  async createBoard(name, desc = '') {
    const response = await axios.post(`${this.baseURL}/boards`, null, {
      params: { key: this.apiKey, token: this.token, name, desc }
    });
    return response.data;
  }

  async getLists(boardId) {
    const response = await axios.get(`${this.baseURL}/boards/${boardId}/lists`, {
      params: { key: this.apiKey, token: this.token }
    });
    return response.data;
  }

  async createList(boardId, name) {
    const response = await axios.post(`${this.baseURL}/lists`, null, {
      params: { key: this.apiKey, token: this.token, idBoard: boardId, name }
    });
    return response.data;
  }

  async getCards(listId) {
    const response = await axios.get(`${this.baseURL}/lists/${listId}/cards`, {
      params: { key: this.apiKey, token: this.token }
    });
    return response.data;
  }

  async createCard(listId, name, desc = '') {
    const response = await axios.post(`${this.baseURL}/cards`, null, {
      params: { key: this.apiKey, token: this.token, idList: listId, name, desc }
    });
    return response.data;
  }

  async updateCard(cardId, updates) {
    const response = await axios.put(`${this.baseURL}/cards/${cardId}`, null, {
      params: { key: this.apiKey, token: this.token, ...updates }
    });
    return response.data;
  }

  async deleteCard(cardId) {
    const response = await axios.delete(`${this.baseURL}/cards/${cardId}`, {
      params: { key: this.apiKey, token: this.token }
    });
    return response.data;
  }
}

module.exports = TrelloIntegration;
