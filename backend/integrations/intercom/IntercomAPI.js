/**
 * Intercom API Integration
 * Complete customer messaging and support platform
 */

const axios = require('axios');

class IntercomAPI {
  constructor(accessToken) {
    this.accessToken = accessToken || process.env.INTERCOM_ACCESS_TOKEN;
    this.baseURL = 'https://api.intercom.io';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  }

  // ==================== CONTACTS ====================

  async createContact(data) {
    const payload = {
      role: data.role || 'user',
      ...(data.external_id && { external_id: data.external_id }),
      ...(data.email && { email: data.email }),
      ...(data.phone && { phone: data.phone }),
      ...(data.name && { name: data.name }),
      ...(data.avatar && { avatar: data.avatar }),
      ...(data.signed_up_at && { signed_up_at: data.signed_up_at }),
      ...(data.last_seen_at && { last_seen_at: data.last_seen_at }),
      ...(data.owner_id && { owner_id: data.owner_id }),
      ...(data.custom_attributes && { custom_attributes: data.custom_attributes })
    };

    const response = await this.client.post('/contacts', payload);
    return { success: true, contact: response.data };
  }

  async getContact(contactId) {
    const response = await this.client.get(`/contacts/${contactId}`);
    return { success: true, contact: response.data };
  }

  async updateContact(contactId, data) {
    const response = await this.client.put(`/contacts/${contactId}`, data);
    return { success: true, contact: response.data };
  }

  async deleteContact(contactId) {
    const response = await this.client.delete(`/contacts/${contactId}`);
    return { success: true, deleted: true };
  }

  async listContacts(options = {}) {
    const params = {
      per_page: options.per_page || 50,
      ...(options.starting_after && { starting_after: options.starting_after })
    };

    const response = await this.client.get('/contacts', { params });
    return { 
      success: true, 
      contacts: response.data.data,
      pages: response.data.pages
    };
  }

  async searchContacts(query) {
    const payload = { query };
    const response = await this.client.post('/contacts/search', payload);
    return { success: true, contacts: response.data.data };
  }

  async mergeContacts(leadId, userId) {
    const payload = {
      from: leadId,
      into: userId
    };

    const response = await this.client.post('/contacts/merge', payload);
    return { success: true, contact: response.data };
  }

  // ==================== COMPANIES ====================

  async createCompany(data) {
    const payload = {
      ...(data.company_id && { company_id: data.company_id }),
      ...(data.name && { name: data.name }),
      ...(data.website && { website: data.website }),
      ...(data.plan && { plan: data.plan }),
      ...(data.size && { size: data.size }),
      ...(data.industry && { industry: data.industry }),
      ...(data.custom_attributes && { custom_attributes: data.custom_attributes }),
      ...(data.monthly_spend && { monthly_spend: data.monthly_spend })
    };

    const response = await this.client.post('/companies', payload);
    return { success: true, company: response.data };
  }

  async getCompany(companyId) {
    const response = await this.client.get(`/companies/${companyId}`);
    return { success: true, company: response.data };
  }

  async updateCompany(companyId, data) {
    const response = await this.client.put(`/companies/${companyId}`, data);
    return { success: true, company: response.data };
  }

  async deleteCompany(companyId) {
    const response = await this.client.delete(`/companies/${companyId}`);
    return { success: true, deleted: true };
  }

  async listCompanies(options = {}) {
    const params = {
      per_page: options.per_page || 50,
      ...(options.starting_after && { starting_after: options.starting_after })
    };

    const response = await this.client.get('/companies', { params });
    return { 
      success: true, 
      companies: response.data.data,
      pages: response.data.pages
    };
  }

  async attachContactToCompany(contactId, companyId) {
    const payload = {
      id: companyId
    };

    const response = await this.client.post(`/contacts/${contactId}/companies`, payload);
    return { success: true, contact: response.data };
  }

  async detachContactFromCompany(contactId, companyId) {
    const response = await this.client.delete(`/contacts/${contactId}/companies/${companyId}`);
    return { success: true, deleted: true };
  }

  // ==================== CONVERSATIONS ====================

  async createConversation(data) {
    const payload = {
      from: data.from,
      body: data.body,
      ...(data.subject && { subject: data.subject }),
      ...(data.template_id && { template_id: data.template_id }),
      ...(data.create_conversation_without_contact_reply && { 
        create_conversation_without_contact_reply: data.create_conversation_without_contact_reply 
      })
    };

    const response = await this.client.post('/conversations', payload);
    return { success: true, conversation: response.data };
  }

  async getConversation(conversationId) {
    const response = await this.client.get(`/conversations/${conversationId}`);
    return { success: true, conversation: response.data };
  }

  async listConversations(options = {}) {
    const params = {
      per_page: options.per_page || 20,
      ...(options.starting_after && { starting_after: options.starting_after })
    };

    const response = await this.client.get('/conversations', { params });
    return { 
      success: true, 
      conversations: response.data.conversations,
      pages: response.data.pages
    };
  }

  async searchConversations(query) {
    const payload = { query };
    const response = await this.client.post('/conversations/search', payload);
    return { success: true, conversations: response.data.conversations };
  }

  async replyToConversation(conversationId, data) {
    const payload = {
      message_type: data.message_type || 'comment',
      type: data.type || 'admin',
      admin_id: data.admin_id,
      body: data.body,
      ...(data.attachment_urls && { attachment_urls: data.attachment_urls })
    };

    const response = await this.client.post(`/conversations/${conversationId}/reply`, payload);
    return { success: true, conversation: response.data };
  }

  async assignConversation(conversationId, data) {
    const payload = {
      type: data.type || 'admin',
      admin_id: data.admin_id,
      assignee_id: data.assignee_id
    };

    const response = await this.client.post(`/conversations/${conversationId}/parts`, payload);
    return { success: true, conversation: response.data };
  }

  async closeConversation(conversationId, adminId) {
    const payload = {
      type: 'admin',
      admin_id: adminId,
      message_type: 'close'
    };

    const response = await this.client.post(`/conversations/${conversationId}/parts`, payload);
    return { success: true, conversation: response.data };
  }

  async openConversation(conversationId, adminId) {
    const payload = {
      type: 'admin',
      admin_id: adminId,
      message_type: 'open'
    };

    const response = await this.client.post(`/conversations/${conversationId}/parts`, payload);
    return { success: true, conversation: response.data };
  }

  async snoozeConversation(conversationId, adminId, snoozedUntil) {
    const payload = {
      type: 'admin',
      admin_id: adminId,
      message_type: 'snoozed',
      snoozed_until: snoozedUntil
    };

    const response = await this.client.post(`/conversations/${conversationId}/parts`, payload);
    return { success: true, conversation: response.data };
  }

  async addTagToConversation(conversationId, tagId, adminId) {
    const payload = {
      type: 'admin',
      admin_id: adminId,
      message_type: 'tag',
      tag_id: tagId
    };

    const response = await this.client.post(`/conversations/${conversationId}/parts`, payload);
    return { success: true, conversation: response.data };
  }

  // ==================== MESSAGES ====================

  async sendMessage(data) {
    const payload = {
      message_type: data.message_type || 'inapp',
      from: data.from,
      to: data.to,
      body: data.body,
      ...(data.subject && { subject: data.subject }),
      ...(data.template_id && { template_id: data.template_id })
    };

    const response = await this.client.post('/messages', payload);
    return { success: true, message: response.data };
  }

  // ==================== ADMINS ====================

  async listAdmins() {
    const response = await this.client.get('/admins');
    return { success: true, admins: response.data.admins };
  }

  async getAdmin(adminId) {
    const response = await this.client.get(`/admins/${adminId}`);
    return { success: true, admin: response.data };
  }

  async setAdminAway(adminId, away) {
    const payload = {
      away_mode_enabled: away,
      away_mode_reassign: away
    };

    const response = await this.client.put(`/admins/${adminId}/away`, payload);
    return { success: true, admin: response.data };
  }

  // ==================== TEAMS ====================

  async listTeams() {
    const response = await this.client.get('/teams');
    return { success: true, teams: response.data.teams };
  }

  async getTeam(teamId) {
    const response = await this.client.get(`/teams/${teamId}`);
    return { success: true, team: response.data };
  }

  // ==================== TAGS ====================

  async createTag(name) {
    const payload = { name };
    const response = await this.client.post('/tags', payload);
    return { success: true, tag: response.data };
  }

  async getTag(tagId) {
    const response = await this.client.get(`/tags/${tagId}`);
    return { success: true, tag: response.data };
  }

  async updateTag(tagId, name) {
    const payload = { name };
    const response = await this.client.put(`/tags/${tagId}`, payload);
    return { success: true, tag: response.data };
  }

  async deleteTag(tagId) {
    const response = await this.client.delete(`/tags/${tagId}`);
    return { success: true, deleted: true };
  }

  async listTags() {
    const response = await this.client.get('/tags');
    return { success: true, tags: response.data.data };
  }

  async tagContact(contactId, tagId) {
    const payload = {
      id: tagId
    };

    const response = await this.client.post(`/contacts/${contactId}/tags`, payload);
    return { success: true, contact: response.data };
  }

  async untagContact(contactId, tagId) {
    const response = await this.client.delete(`/contacts/${contactId}/tags/${tagId}`);
    return { success: true, deleted: true };
  }

  async tagCompany(companyId, tagId) {
    const payload = {
      id: tagId
    };

    const response = await this.client.post(`/companies/${companyId}/tags`, payload);
    return { success: true, company: response.data };
  }

  async untagCompany(companyId, tagId) {
    const response = await this.client.delete(`/companies/${companyId}/tags/${tagId}`);
    return { success: true, deleted: true };
  }

  // ==================== SEGMENTS ====================

  async listSegments() {
    const response = await this.client.get('/segments');
    return { success: true, segments: response.data.segments };
  }

  async getSegment(segmentId) {
    const response = await this.client.get(`/segments/${segmentId}`);
    return { success: true, segment: response.data };
  }

  // ==================== NOTES ====================

  async createNote(data) {
    const payload = {
      admin_id: data.admin_id,
      body: data.body,
      contact: {
        id: data.contact_id
      }
    };

    const response = await this.client.post('/notes', payload);
    return { success: true, note: response.data };
  }

  async getNote(noteId) {
    const response = await this.client.get(`/notes/${noteId}`);
    return { success: true, note: response.data };
  }

  async listNotes(contactId) {
    const params = {
      contact_id: contactId
    };

    const response = await this.client.get('/notes', { params });
    return { success: true, notes: response.data.data };
  }

  // ==================== EVENTS ====================

  async createEvent(data) {
    const payload = {
      event_name: data.event_name,
      created_at: data.created_at || Math.floor(Date.now() / 1000),
      ...(data.user_id && { user_id: data.user_id }),
      ...(data.email && { email: data.email }),
      ...(data.metadata && { metadata: data.metadata })
    };

    const response = await this.client.post('/events', payload);
    return { success: true, message: 'Event created successfully' };
  }

  async listEvents(options = {}) {
    const params = {
      type: options.type || 'user',
      ...(options.user_id && { user_id: options.user_id }),
      ...(options.email && { email: options.email }),
      per_page: options.per_page || 50
    };

    const response = await this.client.get('/events', { params });
    return { success: true, events: response.data.events };
  }

  // ==================== DATA ATTRIBUTES ====================

  async createDataAttribute(data) {
    const payload = {
      name: data.name,
      model: data.model,
      data_type: data.data_type,
      ...(data.description && { description: data.description }),
      ...(data.options && { options: data.options })
    };

    const response = await this.client.post('/data_attributes', payload);
    return { success: true, data_attribute: response.data };
  }

  async updateDataAttribute(attributeId, data) {
    const response = await this.client.put(`/data_attributes/${attributeId}`, data);
    return { success: true, data_attribute: response.data };
  }

  async listDataAttributes(options = {}) {
    const params = {
      ...(options.model && { model: options.model }),
      ...(options.include_archived && { include_archived: options.include_archived })
    };

    const response = await this.client.get('/data_attributes', { params });
    return { success: true, data_attributes: response.data.data };
  }

  // ==================== ARTICLES ====================

  async createArticle(data) {
    const payload = {
      title: data.title,
      body: data.body,
      author_id: data.author_id,
      ...(data.description && { description: data.description }),
      ...(data.state && { state: data.state }),
      ...(data.parent_id && { parent_id: data.parent_id })
    };

    const response = await this.client.post('/articles', payload);
    return { success: true, article: response.data };
  }

  async getArticle(articleId) {
    const response = await this.client.get(`/articles/${articleId}`);
    return { success: true, article: response.data };
  }

  async updateArticle(articleId, data) {
    const response = await this.client.put(`/articles/${articleId}`, data);
    return { success: true, article: response.data };
  }

  async deleteArticle(articleId) {
    const response = await this.client.delete(`/articles/${articleId}`);
    return { success: true, deleted: true };
  }

  async listArticles(options = {}) {
    const params = {
      per_page: options.per_page || 50,
      ...(options.page && { page: options.page })
    };

    const response = await this.client.get('/articles', { params });
    return { success: true, articles: response.data.data };
  }

  // ==================== COLLECTIONS ====================

  async listCollections() {
    const response = await this.client.get('/help_center/collections');
    return { success: true, collections: response.data.data };
  }

  async getCollection(collectionId) {
    const response = await this.client.get(`/help_center/collections/${collectionId}`);
    return { success: true, collection: response.data };
  }

  // ==================== SUBSCRIPTIONS ====================

  async createSubscription(data) {
    const payload = {
      url: data.url,
      topics: data.topics,
      ...(data.metadata && { metadata: data.metadata })
    };

    const response = await this.client.post('/subscriptions', payload);
    return { success: true, subscription: response.data };
  }

  async listSubscriptions() {
    const response = await this.client.get('/subscriptions');
    return { success: true, subscriptions: response.data.data };
  }

  async deleteSubscription(subscriptionId) {
    const response = await this.client.delete(`/subscriptions/${subscriptionId}`);
    return { success: true, deleted: true };
  }
}

module.exports = IntercomAPI;
