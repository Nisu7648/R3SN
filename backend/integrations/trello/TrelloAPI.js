/**
 * Trello API Integration
 * Complete project management with all endpoints
 */

const axios = require('axios');

class TrelloAPI {
  constructor(apiKey, token) {
    this.apiKey = apiKey || process.env.TRELLO_API_KEY;
    this.token = token || process.env.TRELLO_TOKEN;
    this.baseURL = 'https://api.trello.com/1';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      params: {
        key: this.apiKey,
        token: this.token
      }
    });
  }

  // ==================== BOARDS ====================

  async createBoard(data) {
    const params = {
      name: data.name,
      ...(data.desc && { desc: data.desc }),
      ...(data.defaultLists !== undefined && { defaultLists: data.defaultLists }),
      ...(data.prefs_background && { prefs_background: data.prefs_background }),
      ...(data.prefs_permissionLevel && { prefs_permissionLevel: data.prefs_permissionLevel })
    };

    const response = await this.client.post('/boards', null, { params });
    return { success: true, board: response.data };
  }

  async getBoard(boardId, options = {}) {
    const params = {
      ...(options.fields && { fields: options.fields }),
      ...(options.lists && { lists: options.lists }),
      ...(options.cards && { cards: options.cards })
    };

    const response = await this.client.get(`/boards/${boardId}`, { params });
    return { success: true, board: response.data };
  }

  async updateBoard(boardId, data) {
    const response = await this.client.put(`/boards/${boardId}`, null, { params: data });
    return { success: true, board: response.data };
  }

  async deleteBoard(boardId) {
    await this.client.delete(`/boards/${boardId}`);
    return { success: true, deleted: true };
  }

  async getBoardLists(boardId, options = {}) {
    const params = {
      filter: options.filter || 'open',
      ...(options.fields && { fields: options.fields })
    };

    const response = await this.client.get(`/boards/${boardId}/lists`, { params });
    return { success: true, lists: response.data };
  }

  async getBoardCards(boardId, options = {}) {
    const params = {
      ...(options.filter && { filter: options.filter }),
      ...(options.fields && { fields: options.fields })
    };

    const response = await this.client.get(`/boards/${boardId}/cards`, { params });
    return { success: true, cards: response.data };
  }

  async getBoardMembers(boardId) {
    const response = await this.client.get(`/boards/${boardId}/members`);
    return { success: true, members: response.data };
  }

  async addBoardMember(boardId, data) {
    const params = {
      email: data.email,
      type: data.type || 'normal'
    };

    const response = await this.client.put(`/boards/${boardId}/members`, null, { params });
    return { success: true, member: response.data };
  }

  async removeBoardMember(boardId, memberId) {
    await this.client.delete(`/boards/${boardId}/members/${memberId}`);
    return { success: true, deleted: true };
  }

  // ==================== LISTS ====================

  async createList(data) {
    const params = {
      name: data.name,
      idBoard: data.idBoard,
      ...(data.pos && { pos: data.pos })
    };

    const response = await this.client.post('/lists', null, { params });
    return { success: true, list: response.data };
  }

  async getList(listId, options = {}) {
    const params = {
      ...(options.fields && { fields: options.fields }),
      ...(options.cards && { cards: options.cards })
    };

    const response = await this.client.get(`/lists/${listId}`, { params });
    return { success: true, list: response.data };
  }

  async updateList(listId, data) {
    const response = await this.client.put(`/lists/${listId}`, null, { params: data });
    return { success: true, list: response.data };
  }

  async archiveList(listId) {
    const params = { closed: true };
    const response = await this.client.put(`/lists/${listId}/closed`, null, { params });
    return { success: true, list: response.data };
  }

  async getListCards(listId, options = {}) {
    const params = {
      ...(options.fields && { fields: options.fields })
    };

    const response = await this.client.get(`/lists/${listId}/cards`, { params });
    return { success: true, cards: response.data };
  }

  async moveList(listId, data) {
    const params = {
      ...(data.idBoard && { idBoard: data.idBoard }),
      ...(data.pos && { pos: data.pos })
    };

    const response = await this.client.put(`/lists/${listId}`, null, { params });
    return { success: true, list: response.data };
  }

  // ==================== CARDS ====================

  async createCard(data) {
    const params = {
      name: data.name,
      idList: data.idList,
      ...(data.desc && { desc: data.desc }),
      ...(data.pos && { pos: data.pos }),
      ...(data.due && { due: data.due }),
      ...(data.dueComplete !== undefined && { dueComplete: data.dueComplete }),
      ...(data.idMembers && { idMembers: data.idMembers }),
      ...(data.idLabels && { idLabels: data.idLabels }),
      ...(data.urlSource && { urlSource: data.urlSource })
    };

    const response = await this.client.post('/cards', null, { params });
    return { success: true, card: response.data };
  }

  async getCard(cardId, options = {}) {
    const params = {
      ...(options.fields && { fields: options.fields }),
      ...(options.attachments && { attachments: options.attachments }),
      ...(options.members && { members: options.members }),
      ...(options.checklists && { checklists: options.checklists })
    };

    const response = await this.client.get(`/cards/${cardId}`, { params });
    return { success: true, card: response.data };
  }

  async updateCard(cardId, data) {
    const response = await this.client.put(`/cards/${cardId}`, null, { params: data });
    return { success: true, card: response.data };
  }

  async deleteCard(cardId) {
    await this.client.delete(`/cards/${cardId}`);
    return { success: true, deleted: true };
  }

  async moveCard(cardId, data) {
    const params = {
      ...(data.idList && { idList: data.idList }),
      ...(data.idBoard && { idBoard: data.idBoard }),
      ...(data.pos && { pos: data.pos })
    };

    const response = await this.client.put(`/cards/${cardId}`, null, { params });
    return { success: true, card: response.data };
  }

  async addCardMember(cardId, memberId) {
    const params = { value: memberId };
    const response = await this.client.post(`/cards/${cardId}/idMembers`, null, { params });
    return { success: true, members: response.data };
  }

  async removeCardMember(cardId, memberId) {
    await this.client.delete(`/cards/${cardId}/idMembers/${memberId}`);
    return { success: true, deleted: true };
  }

  async addCardLabel(cardId, labelId) {
    const params = { value: labelId };
    const response = await this.client.post(`/cards/${cardId}/idLabels`, null, { params });
    return { success: true, labels: response.data };
  }

  async removeCardLabel(cardId, labelId) {
    await this.client.delete(`/cards/${cardId}/idLabels/${labelId}`);
    return { success: true, deleted: true };
  }

  // ==================== CHECKLISTS ====================

  async createChecklist(data) {
    const params = {
      idCard: data.idCard,
      name: data.name,
      ...(data.pos && { pos: data.pos })
    };

    const response = await this.client.post('/checklists', null, { params });
    return { success: true, checklist: response.data };
  }

  async getChecklist(checklistId) {
    const response = await this.client.get(`/checklists/${checklistId}`);
    return { success: true, checklist: response.data };
  }

  async updateChecklist(checklistId, data) {
    const response = await this.client.put(`/checklists/${checklistId}`, null, { params: data });
    return { success: true, checklist: response.data };
  }

  async deleteChecklist(checklistId) {
    await this.client.delete(`/checklists/${checklistId}`);
    return { success: true, deleted: true };
  }

  async createCheckItem(checklistId, data) {
    const params = {
      name: data.name,
      ...(data.pos && { pos: data.pos }),
      ...(data.checked !== undefined && { checked: data.checked })
    };

    const response = await this.client.post(`/checklists/${checklistId}/checkItems`, null, { params });
    return { success: true, checkItem: response.data };
  }

  async updateCheckItem(cardId, checkItemId, data) {
    const response = await this.client.put(`/cards/${cardId}/checkItem/${checkItemId}`, null, { params: data });
    return { success: true, checkItem: response.data };
  }

  async deleteCheckItem(checklistId, checkItemId) {
    await this.client.delete(`/checklists/${checklistId}/checkItems/${checkItemId}`);
    return { success: true, deleted: true };
  }

  // ==================== LABELS ====================

  async createLabel(data) {
    const params = {
      name: data.name,
      color: data.color,
      idBoard: data.idBoard
    };

    const response = await this.client.post('/labels', null, { params });
    return { success: true, label: response.data };
  }

  async getLabel(labelId) {
    const response = await this.client.get(`/labels/${labelId}`);
    return { success: true, label: response.data };
  }

  async updateLabel(labelId, data) {
    const response = await this.client.put(`/labels/${labelId}`, null, { params: data });
    return { success: true, label: response.data };
  }

  async deleteLabel(labelId) {
    await this.client.delete(`/labels/${labelId}`);
    return { success: true, deleted: true };
  }

  async getBoardLabels(boardId) {
    const response = await this.client.get(`/boards/${boardId}/labels`);
    return { success: true, labels: response.data };
  }

  // ==================== ATTACHMENTS ====================

  async addAttachment(cardId, data) {
    const params = {
      ...(data.url && { url: data.url }),
      ...(data.name && { name: data.name }),
      ...(data.mimeType && { mimeType: data.mimeType })
    };

    const response = await this.client.post(`/cards/${cardId}/attachments`, null, { params });
    return { success: true, attachment: response.data };
  }

  async getAttachment(cardId, attachmentId) {
    const response = await this.client.get(`/cards/${cardId}/attachments/${attachmentId}`);
    return { success: true, attachment: response.data };
  }

  async deleteAttachment(cardId, attachmentId) {
    await this.client.delete(`/cards/${cardId}/attachments/${attachmentId}`);
    return { success: true, deleted: true };
  }

  async getCardAttachments(cardId) {
    const response = await this.client.get(`/cards/${cardId}/attachments`);
    return { success: true, attachments: response.data };
  }

  // ==================== COMMENTS ====================

  async addComment(cardId, text) {
    const params = { text };
    const response = await this.client.post(`/cards/${cardId}/actions/comments`, null, { params });
    return { success: true, comment: response.data };
  }

  async updateComment(cardId, commentId, text) {
    const params = { text };
    const response = await this.client.put(`/cards/${cardId}/actions/${commentId}/comments`, null, { params });
    return { success: true, comment: response.data };
  }

  async deleteComment(cardId, commentId) {
    await this.client.delete(`/cards/${cardId}/actions/${commentId}/comments`);
    return { success: true, deleted: true };
  }

  // ==================== MEMBERS ====================

  async getMember(memberId, options = {}) {
    const params = {
      ...(options.fields && { fields: options.fields }),
      ...(options.boards && { boards: options.boards })
    };

    const response = await this.client.get(`/members/${memberId}`, { params });
    return { success: true, member: response.data };
  }

  async getMemberBoards(memberId, options = {}) {
    const params = {
      filter: options.filter || 'open',
      ...(options.fields && { fields: options.fields })
    };

    const response = await this.client.get(`/members/${memberId}/boards`, { params });
    return { success: true, boards: response.data };
  }

  async getMemberCards(memberId, options = {}) {
    const params = {
      filter: options.filter || 'open',
      ...(options.fields && { fields: options.fields })
    };

    const response = await this.client.get(`/members/${memberId}/cards`, { params });
    return { success: true, cards: response.data };
  }

  // ==================== ORGANIZATIONS ====================

  async getOrganization(orgId) {
    const response = await this.client.get(`/organizations/${orgId}`);
    return { success: true, organization: response.data };
  }

  async getOrganizationBoards(orgId) {
    const response = await this.client.get(`/organizations/${orgId}/boards`);
    return { success: true, boards: response.data };
  }

  async getOrganizationMembers(orgId) {
    const response = await this.client.get(`/organizations/${orgId}/members`);
    return { success: true, members: response.data };
  }

  // ==================== SEARCH ====================

  async search(query, options = {}) {
    const params = {
      query,
      ...(options.modelTypes && { modelTypes: options.modelTypes }),
      ...(options.idBoards && { idBoards: options.idBoards }),
      ...(options.idOrganizations && { idOrganizations: options.idOrganizations }),
      ...(options.partial !== undefined && { partial: options.partial })
    };

    const response = await this.client.get('/search', { params });
    return { success: true, results: response.data };
  }

  async searchCards(query, options = {}) {
    const params = {
      query,
      modelTypes: 'cards',
      ...(options.idBoards && { idBoards: options.idBoards })
    };

    const response = await this.client.get('/search', { params });
    return { success: true, cards: response.data.cards };
  }

  async searchBoards(query, options = {}) {
    const params = {
      query,
      modelTypes: 'boards',
      ...(options.idOrganizations && { idOrganizations: options.idOrganizations })
    };

    const response = await this.client.get('/search', { params });
    return { success: true, boards: response.data.boards };
  }
}

module.exports = TrelloAPI;
