/**
 * Zendesk API Integration
 * Complete customer service and ticketing platform
 */

const axios = require('axios');

class ZendeskAPI {
  constructor(subdomain, email, apiToken) {
    this.subdomain = subdomain || process.env.ZENDESK_SUBDOMAIN;
    this.email = email || process.env.ZENDESK_EMAIL;
    this.apiToken = apiToken || process.env.ZENDESK_API_TOKEN;
    this.baseURL = `https://${this.subdomain}.zendesk.com/api/v2`;
    
    const auth = Buffer.from(`${this.email}/token:${this.apiToken}`).toString('base64');
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // ==================== TICKETS ====================

  async createTicket(data) {
    const payload = {
      ticket: {
        subject: data.subject,
        comment: {
          body: data.body,
          ...(data.html_body && { html_body: data.html_body }),
          ...(data.public !== undefined && { public: data.public }),
          ...(data.uploads && { uploads: data.uploads })
        },
        ...(data.requester_id && { requester_id: data.requester_id }),
        ...(data.submitter_id && { submitter_id: data.submitter_id }),
        ...(data.assignee_id && { assignee_id: data.assignee_id }),
        ...(data.group_id && { group_id: data.group_id }),
        ...(data.priority && { priority: data.priority }),
        ...(data.status && { status: data.status }),
        ...(data.type && { type: data.type }),
        ...(data.tags && { tags: data.tags }),
        ...(data.custom_fields && { custom_fields: data.custom_fields }),
        ...(data.due_at && { due_at: data.due_at })
      }
    };

    const response = await this.client.post('/tickets.json', payload);
    return { success: true, ticket: response.data.ticket };
  }

  async getTicket(ticketId) {
    const response = await this.client.get(`/tickets/${ticketId}.json`);
    return { success: true, ticket: response.data.ticket };
  }

  async updateTicket(ticketId, data) {
    const payload = {
      ticket: data
    };

    const response = await this.client.put(`/tickets/${ticketId}.json`, payload);
    return { success: true, ticket: response.data.ticket };
  }

  async deleteTicket(ticketId) {
    await this.client.delete(`/tickets/${ticketId}.json`);
    return { success: true, message: 'Ticket deleted successfully' };
  }

  async listTickets(options = {}) {
    const params = {
      per_page: options.per_page || 100,
      ...(options.page && { page: options.page }),
      ...(options.sort_by && { sort_by: options.sort_by }),
      ...(options.sort_order && { sort_order: options.sort_order })
    };

    const response = await this.client.get('/tickets.json', { params });
    return { 
      success: true, 
      tickets: response.data.tickets,
      count: response.data.count,
      next_page: response.data.next_page,
      previous_page: response.data.previous_page
    };
  }

  async searchTickets(query, options = {}) {
    const params = {
      query,
      per_page: options.per_page || 100,
      ...(options.sort_by && { sort_by: options.sort_by }),
      ...(options.sort_order && { sort_order: options.sort_order })
    };

    const response = await this.client.get('/search.json', { params });
    return { success: true, results: response.data.results };
  }

  async bulkUpdateTickets(ticketIds, data) {
    const payload = {
      ticket: data,
      ids: ticketIds
    };

    const response = await this.client.put('/tickets/update_many.json', payload);
    return { success: true, job_status: response.data.job_status };
  }

  async mergeTickets(targetTicketId, sourceTicketIds) {
    const payload = {
      ids: sourceTicketIds,
      target_ticket_id: targetTicketId
    };

    const response = await this.client.post('/tickets/merge.json', payload);
    return { success: true, job_status: response.data.job_status };
  }

  // ==================== TICKET COMMENTS ====================

  async addComment(ticketId, data) {
    const payload = {
      ticket: {
        comment: {
          body: data.body,
          ...(data.html_body && { html_body: data.html_body }),
          ...(data.public !== undefined && { public: data.public }),
          ...(data.author_id && { author_id: data.author_id }),
          ...(data.uploads && { uploads: data.uploads })
        }
      }
    };

    const response = await this.client.put(`/tickets/${ticketId}.json`, payload);
    return { success: true, ticket: response.data.ticket };
  }

  async listComments(ticketId, options = {}) {
    const params = {
      per_page: options.per_page || 100,
      ...(options.sort_order && { sort_order: options.sort_order })
    };

    const response = await this.client.get(`/tickets/${ticketId}/comments.json`, { params });
    return { success: true, comments: response.data.comments };
  }

  // ==================== USERS ====================

  async createUser(data) {
    const payload = {
      user: {
        name: data.name,
        email: data.email,
        ...(data.role && { role: data.role }),
        ...(data.phone && { phone: data.phone }),
        ...(data.organization_id && { organization_id: data.organization_id }),
        ...(data.external_id && { external_id: data.external_id }),
        ...(data.user_fields && { user_fields: data.user_fields }),
        ...(data.tags && { tags: data.tags })
      }
    };

    const response = await this.client.post('/users.json', payload);
    return { success: true, user: response.data.user };
  }

  async getUser(userId) {
    const response = await this.client.get(`/users/${userId}.json`);
    return { success: true, user: response.data.user };
  }

  async updateUser(userId, data) {
    const payload = {
      user: data
    };

    const response = await this.client.put(`/users/${userId}.json`, payload);
    return { success: true, user: response.data.user };
  }

  async deleteUser(userId) {
    await this.client.delete(`/users/${userId}.json`);
    return { success: true, message: 'User deleted successfully' };
  }

  async listUsers(options = {}) {
    const params = {
      per_page: options.per_page || 100,
      ...(options.page && { page: options.page }),
      ...(options.role && { role: options.role })
    };

    const response = await this.client.get('/users.json', { params });
    return { 
      success: true, 
      users: response.data.users,
      count: response.data.count
    };
  }

  async searchUsers(query) {
    const params = { query };
    const response = await this.client.get('/users/search.json', { params });
    return { success: true, users: response.data.users };
  }

  async getCurrentUser() {
    const response = await this.client.get('/users/me.json');
    return { success: true, user: response.data.user };
  }

  // ==================== ORGANIZATIONS ====================

  async createOrganization(data) {
    const payload = {
      organization: {
        name: data.name,
        ...(data.domain_names && { domain_names: data.domain_names }),
        ...(data.details && { details: data.details }),
        ...(data.notes && { notes: data.notes }),
        ...(data.group_id && { group_id: data.group_id }),
        ...(data.external_id && { external_id: data.external_id }),
        ...(data.organization_fields && { organization_fields: data.organization_fields }),
        ...(data.tags && { tags: data.tags })
      }
    };

    const response = await this.client.post('/organizations.json', payload);
    return { success: true, organization: response.data.organization };
  }

  async getOrganization(organizationId) {
    const response = await this.client.get(`/organizations/${organizationId}.json`);
    return { success: true, organization: response.data.organization };
  }

  async updateOrganization(organizationId, data) {
    const payload = {
      organization: data
    };

    const response = await this.client.put(`/organizations/${organizationId}.json`, payload);
    return { success: true, organization: response.data.organization };
  }

  async deleteOrganization(organizationId) {
    await this.client.delete(`/organizations/${organizationId}.json`);
    return { success: true, message: 'Organization deleted successfully' };
  }

  async listOrganizations(options = {}) {
    const params = {
      per_page: options.per_page || 100,
      ...(options.page && { page: options.page })
    };

    const response = await this.client.get('/organizations.json', { params });
    return { 
      success: true, 
      organizations: response.data.organizations,
      count: response.data.count
    };
  }

  // ==================== GROUPS ====================

  async createGroup(data) {
    const payload = {
      group: {
        name: data.name,
        ...(data.description && { description: data.description })
      }
    };

    const response = await this.client.post('/groups.json', payload);
    return { success: true, group: response.data.group };
  }

  async getGroup(groupId) {
    const response = await this.client.get(`/groups/${groupId}.json`);
    return { success: true, group: response.data.group };
  }

  async updateGroup(groupId, data) {
    const payload = {
      group: data
    };

    const response = await this.client.put(`/groups/${groupId}.json`, payload);
    return { success: true, group: response.data.group };
  }

  async deleteGroup(groupId) {
    await this.client.delete(`/groups/${groupId}.json`);
    return { success: true, message: 'Group deleted successfully' };
  }

  async listGroups(options = {}) {
    const params = {
      per_page: options.per_page || 100,
      ...(options.page && { page: options.page })
    };

    const response = await this.client.get('/groups.json', { params });
    return { success: true, groups: response.data.groups };
  }

  // ==================== MACROS ====================

  async listMacros(options = {}) {
    const params = {
      per_page: options.per_page || 100,
      ...(options.page && { page: options.page })
    };

    const response = await this.client.get('/macros.json', { params });
    return { success: true, macros: response.data.macros };
  }

  async getMacro(macroId) {
    const response = await this.client.get(`/macros/${macroId}.json`);
    return { success: true, macro: response.data.macro };
  }

  async applyMacro(ticketId, macroId) {
    const response = await this.client.get(`/tickets/${ticketId}/macros/${macroId}/apply.json`);
    return { success: true, result: response.data.result };
  }

  // ==================== VIEWS ====================

  async listViews(options = {}) {
    const params = {
      per_page: options.per_page || 100,
      ...(options.page && { page: options.page })
    };

    const response = await this.client.get('/views.json', { params });
    return { success: true, views: response.data.views };
  }

  async getView(viewId) {
    const response = await this.client.get(`/views/${viewId}.json`);
    return { success: true, view: response.data.view };
  }

  async getViewTickets(viewId, options = {}) {
    const params = {
      per_page: options.per_page || 100,
      ...(options.page && { page: options.page })
    };

    const response = await this.client.get(`/views/${viewId}/tickets.json`, { params });
    return { success: true, tickets: response.data.tickets };
  }

  async getViewCount(viewId) {
    const response = await this.client.get(`/views/${viewId}/count.json`);
    return { success: true, count: response.data.view_count };
  }

  // ==================== TRIGGERS ====================

  async listTriggers(options = {}) {
    const params = {
      per_page: options.per_page || 100,
      ...(options.page && { page: options.page })
    };

    const response = await this.client.get('/triggers.json', { params });
    return { success: true, triggers: response.data.triggers };
  }

  async getTrigger(triggerId) {
    const response = await this.client.get(`/triggers/${triggerId}.json`);
    return { success: true, trigger: response.data.trigger };
  }

  async createTrigger(data) {
    const payload = {
      trigger: data
    };

    const response = await this.client.post('/triggers.json', payload);
    return { success: true, trigger: response.data.trigger };
  }

  async updateTrigger(triggerId, data) {
    const payload = {
      trigger: data
    };

    const response = await this.client.put(`/triggers/${triggerId}.json`, payload);
    return { success: true, trigger: response.data.trigger };
  }

  async deleteTrigger(triggerId) {
    await this.client.delete(`/triggers/${triggerId}.json`);
    return { success: true, message: 'Trigger deleted successfully' };
  }

  // ==================== AUTOMATIONS ====================

  async listAutomations(options = {}) {
    const params = {
      per_page: options.per_page || 100,
      ...(options.page && { page: options.page })
    };

    const response = await this.client.get('/automations.json', { params });
    return { success: true, automations: response.data.automations };
  }

  async getAutomation(automationId) {
    const response = await this.client.get(`/automations/${automationId}.json`);
    return { success: true, automation: response.data.automation };
  }

  async createAutomation(data) {
    const payload = {
      automation: data
    };

    const response = await this.client.post('/automations.json', payload);
    return { success: true, automation: response.data.automation };
  }

  async updateAutomation(automationId, data) {
    const payload = {
      automation: data
    };

    const response = await this.client.put(`/automations/${automationId}.json`, payload);
    return { success: true, automation: response.data.automation };
  }

  async deleteAutomation(automationId) {
    await this.client.delete(`/automations/${automationId}.json`);
    return { success: true, message: 'Automation deleted successfully' };
  }

  // ==================== SLA POLICIES ====================

  async listSLAPolicies() {
    const response = await this.client.get('/slas/policies.json');
    return { success: true, sla_policies: response.data.sla_policies };
  }

  async getSLAPolicy(policyId) {
    const response = await this.client.get(`/slas/policies/${policyId}.json`);
    return { success: true, sla_policy: response.data.sla_policy };
  }

  // ==================== SATISFACTION RATINGS ====================

  async listSatisfactionRatings(options = {}) {
    const params = {
      per_page: options.per_page || 100,
      ...(options.page && { page: options.page }),
      ...(options.score && { score: options.score })
    };

    const response = await this.client.get('/satisfaction_ratings.json', { params });
    return { success: true, satisfaction_ratings: response.data.satisfaction_ratings };
  }

  async getSatisfactionRating(ratingId) {
    const response = await this.client.get(`/satisfaction_ratings/${ratingId}.json`);
    return { success: true, satisfaction_rating: response.data.satisfaction_rating };
  }

  async createSatisfactionRating(ticketId, data) {
    const payload = {
      satisfaction_rating: {
        score: data.score,
        ...(data.comment && { comment: data.comment })
      }
    };

    const response = await this.client.post(`/tickets/${ticketId}/satisfaction_rating.json`, payload);
    return { success: true, satisfaction_rating: response.data.satisfaction_rating };
  }

  // ==================== ATTACHMENTS ====================

  async uploadAttachment(file, filename) {
    const formData = new FormData();
    formData.append('file', file, filename);

    const response = await this.client.post('/uploads.json', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params: { filename }
    });
    return { success: true, upload: response.data.upload };
  }

  async deleteAttachment(attachmentId) {
    await this.client.delete(`/attachments/${attachmentId}.json`);
    return { success: true, message: 'Attachment deleted successfully' };
  }

  // ==================== TAGS ====================

  async addTagsToTicket(ticketId, tags) {
    const payload = {
      ticket: {
        additional_tags: tags
      }
    };

    const response = await this.client.put(`/tickets/${ticketId}.json`, payload);
    return { success: true, ticket: response.data.ticket };
  }

  async removeTagsFromTicket(ticketId, tags) {
    const payload = {
      ticket: {
        remove_tags: tags
      }
    };

    const response = await this.client.put(`/tickets/${ticketId}.json`, payload);
    return { success: true, ticket: response.data.ticket };
  }

  async listTags() {
    const response = await this.client.get('/tags.json');
    return { success: true, tags: response.data.tags };
  }

  // ==================== TICKET FIELDS ====================

  async listTicketFields() {
    const response = await this.client.get('/ticket_fields.json');
    return { success: true, ticket_fields: response.data.ticket_fields };
  }

  async getTicketField(fieldId) {
    const response = await this.client.get(`/ticket_fields/${fieldId}.json`);
    return { success: true, ticket_field: response.data.ticket_field };
  }

  async createTicketField(data) {
    const payload = {
      ticket_field: data
    };

    const response = await this.client.post('/ticket_fields.json', payload);
    return { success: true, ticket_field: response.data.ticket_field };
  }

  async updateTicketField(fieldId, data) {
    const payload = {
      ticket_field: data
    };

    const response = await this.client.put(`/ticket_fields/${fieldId}.json`, payload);
    return { success: true, ticket_field: response.data.ticket_field };
  }

  async deleteTicketField(fieldId) {
    await this.client.delete(`/ticket_fields/${fieldId}.json`);
    return { success: true, message: 'Ticket field deleted successfully' };
  }

  // ==================== WEBHOOKS ====================

  async listWebhooks() {
    const response = await this.client.get('/webhooks.json');
    return { success: true, webhooks: response.data.webhooks };
  }

  async getWebhook(webhookId) {
    const response = await this.client.get(`/webhooks/${webhookId}.json`);
    return { success: true, webhook: response.data.webhook };
  }

  async createWebhook(data) {
    const payload = {
      webhook: data
    };

    const response = await this.client.post('/webhooks.json', payload);
    return { success: true, webhook: response.data.webhook };
  }

  async updateWebhook(webhookId, data) {
    const payload = {
      webhook: data
    };

    const response = await this.client.patch(`/webhooks/${webhookId}.json`, payload);
    return { success: true, webhook: response.data.webhook };
  }

  async deleteWebhook(webhookId) {
    await this.client.delete(`/webhooks/${webhookId}.json`);
    return { success: true, message: 'Webhook deleted successfully' };
  }

  async testWebhook(webhookId) {
    const response = await this.client.post(`/webhooks/${webhookId}/test.json`);
    return { success: true, result: response.data };
  }
}

module.exports = ZendeskAPI;
