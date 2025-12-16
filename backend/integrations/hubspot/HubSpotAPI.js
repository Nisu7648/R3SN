/**
 * HubSpot API Integration
 * Complete CRM and marketing automation platform
 */

const axios = require('axios');

class HubSpotAPI {
  constructor(accessToken) {
    this.accessToken = accessToken || process.env.HUBSPOT_ACCESS_TOKEN;
    this.baseURL = 'https://api.hubapi.com';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // ==================== CONTACTS ====================

  async createContact(data) {
    const payload = {
      properties: data
    };

    const response = await this.client.post('/crm/v3/objects/contacts', payload);
    return { success: true, contact: response.data };
  }

  async getContact(contactId) {
    const response = await this.client.get(`/crm/v3/objects/contacts/${contactId}`);
    return { success: true, contact: response.data };
  }

  async updateContact(contactId, data) {
    const payload = {
      properties: data
    };

    const response = await this.client.patch(`/crm/v3/objects/contacts/${contactId}`, payload);
    return { success: true, contact: response.data };
  }

  async deleteContact(contactId) {
    await this.client.delete(`/crm/v3/objects/contacts/${contactId}`);
    return { success: true, message: 'Contact deleted successfully' };
  }

  async listContacts(options = {}) {
    const params = {
      limit: options.limit || 100,
      ...(options.after && { after: options.after }),
      ...(options.properties && { properties: options.properties.join(',') })
    };

    const response = await this.client.get('/crm/v3/objects/contacts', { params });
    return { 
      success: true, 
      contacts: response.data.results,
      paging: response.data.paging
    };
  }

  async searchContacts(filters, options = {}) {
    const payload = {
      filterGroups: filters,
      ...(options.sorts && { sorts: options.sorts }),
      ...(options.properties && { properties: options.properties }),
      limit: options.limit || 100,
      ...(options.after && { after: options.after })
    };

    const response = await this.client.post('/crm/v3/objects/contacts/search', payload);
    return { 
      success: true, 
      contacts: response.data.results,
      total: response.data.total
    };
  }

  async batchCreateContacts(contacts) {
    const payload = {
      inputs: contacts.map(contact => ({ properties: contact }))
    };

    const response = await this.client.post('/crm/v3/objects/contacts/batch/create', payload);
    return { success: true, results: response.data.results };
  }

  async batchUpdateContacts(updates) {
    const payload = {
      inputs: updates
    };

    const response = await this.client.post('/crm/v3/objects/contacts/batch/update', payload);
    return { success: true, results: response.data.results };
  }

  // ==================== COMPANIES ====================

  async createCompany(data) {
    const payload = {
      properties: data
    };

    const response = await this.client.post('/crm/v3/objects/companies', payload);
    return { success: true, company: response.data };
  }

  async getCompany(companyId) {
    const response = await this.client.get(`/crm/v3/objects/companies/${companyId}`);
    return { success: true, company: response.data };
  }

  async updateCompany(companyId, data) {
    const payload = {
      properties: data
    };

    const response = await this.client.patch(`/crm/v3/objects/companies/${companyId}`, payload);
    return { success: true, company: response.data };
  }

  async deleteCompany(companyId) {
    await this.client.delete(`/crm/v3/objects/companies/${companyId}`);
    return { success: true, message: 'Company deleted successfully' };
  }

  async listCompanies(options = {}) {
    const params = {
      limit: options.limit || 100,
      ...(options.after && { after: options.after }),
      ...(options.properties && { properties: options.properties.join(',') })
    };

    const response = await this.client.get('/crm/v3/objects/companies', { params });
    return { 
      success: true, 
      companies: response.data.results,
      paging: response.data.paging
    };
  }

  async searchCompanies(filters, options = {}) {
    const payload = {
      filterGroups: filters,
      ...(options.sorts && { sorts: options.sorts }),
      ...(options.properties && { properties: options.properties }),
      limit: options.limit || 100,
      ...(options.after && { after: options.after })
    };

    const response = await this.client.post('/crm/v3/objects/companies/search', payload);
    return { 
      success: true, 
      companies: response.data.results,
      total: response.data.total
    };
  }

  // ==================== DEALS ====================

  async createDeal(data) {
    const payload = {
      properties: data
    };

    const response = await this.client.post('/crm/v3/objects/deals', payload);
    return { success: true, deal: response.data };
  }

  async getDeal(dealId) {
    const response = await this.client.get(`/crm/v3/objects/deals/${dealId}`);
    return { success: true, deal: response.data };
  }

  async updateDeal(dealId, data) {
    const payload = {
      properties: data
    };

    const response = await this.client.patch(`/crm/v3/objects/deals/${dealId}`, payload);
    return { success: true, deal: response.data };
  }

  async deleteDeal(dealId) {
    await this.client.delete(`/crm/v3/objects/deals/${dealId}`);
    return { success: true, message: 'Deal deleted successfully' };
  }

  async listDeals(options = {}) {
    const params = {
      limit: options.limit || 100,
      ...(options.after && { after: options.after }),
      ...(options.properties && { properties: options.properties.join(',') })
    };

    const response = await this.client.get('/crm/v3/objects/deals', { params });
    return { 
      success: true, 
      deals: response.data.results,
      paging: response.data.paging
    };
  }

  async searchDeals(filters, options = {}) {
    const payload = {
      filterGroups: filters,
      ...(options.sorts && { sorts: options.sorts }),
      ...(options.properties && { properties: options.properties }),
      limit: options.limit || 100,
      ...(options.after && { after: options.after })
    };

    const response = await this.client.post('/crm/v3/objects/deals/search', payload);
    return { 
      success: true, 
      deals: response.data.results,
      total: response.data.total
    };
  }

  // ==================== TICKETS ====================

  async createTicket(data) {
    const payload = {
      properties: data
    };

    const response = await this.client.post('/crm/v3/objects/tickets', payload);
    return { success: true, ticket: response.data };
  }

  async getTicket(ticketId) {
    const response = await this.client.get(`/crm/v3/objects/tickets/${ticketId}`);
    return { success: true, ticket: response.data };
  }

  async updateTicket(ticketId, data) {
    const payload = {
      properties: data
    };

    const response = await this.client.patch(`/crm/v3/objects/tickets/${ticketId}`, payload);
    return { success: true, ticket: response.data };
  }

  async deleteTicket(ticketId) {
    await this.client.delete(`/crm/v3/objects/tickets/${ticketId}`);
    return { success: true, message: 'Ticket deleted successfully' };
  }

  async listTickets(options = {}) {
    const params = {
      limit: options.limit || 100,
      ...(options.after && { after: options.after }),
      ...(options.properties && { properties: options.properties.join(',') })
    };

    const response = await this.client.get('/crm/v3/objects/tickets', { params });
    return { 
      success: true, 
      tickets: response.data.results,
      paging: response.data.paging
    };
  }

  // ==================== ASSOCIATIONS ====================

  async createAssociation(fromObjectType, fromObjectId, toObjectType, toObjectId, associationType) {
    const response = await this.client.put(
      `/crm/v3/objects/${fromObjectType}/${fromObjectId}/associations/${toObjectType}/${toObjectId}/${associationType}`
    );
    return { success: true, association: response.data };
  }

  async deleteAssociation(fromObjectType, fromObjectId, toObjectType, toObjectId, associationType) {
    await this.client.delete(
      `/crm/v3/objects/${fromObjectType}/${fromObjectId}/associations/${toObjectType}/${toObjectId}/${associationType}`
    );
    return { success: true, message: 'Association deleted successfully' };
  }

  async listAssociations(objectType, objectId, toObjectType) {
    const response = await this.client.get(
      `/crm/v3/objects/${objectType}/${objectId}/associations/${toObjectType}`
    );
    return { success: true, associations: response.data.results };
  }

  // ==================== PIPELINES ====================

  async listPipelines(objectType) {
    const response = await this.client.get(`/crm/v3/pipelines/${objectType}`);
    return { success: true, pipelines: response.data.results };
  }

  async getPipeline(objectType, pipelineId) {
    const response = await this.client.get(`/crm/v3/pipelines/${objectType}/${pipelineId}`);
    return { success: true, pipeline: response.data };
  }

  async createPipeline(objectType, data) {
    const response = await this.client.post(`/crm/v3/pipelines/${objectType}`, data);
    return { success: true, pipeline: response.data };
  }

  async updatePipeline(objectType, pipelineId, data) {
    const response = await this.client.patch(`/crm/v3/pipelines/${objectType}/${pipelineId}`, data);
    return { success: true, pipeline: response.data };
  }

  async deletePipeline(objectType, pipelineId) {
    await this.client.delete(`/crm/v3/pipelines/${objectType}/${pipelineId}`);
    return { success: true, message: 'Pipeline deleted successfully' };
  }

  // ==================== OWNERS ====================

  async listOwners(options = {}) {
    const params = {
      limit: options.limit || 100,
      ...(options.after && { after: options.after }),
      ...(options.email && { email: options.email })
    };

    const response = await this.client.get('/crm/v3/owners', { params });
    return { 
      success: true, 
      owners: response.data.results,
      paging: response.data.paging
    };
  }

  async getOwner(ownerId) {
    const response = await this.client.get(`/crm/v3/owners/${ownerId}`);
    return { success: true, owner: response.data };
  }

  // ==================== PROPERTIES ====================

  async listProperties(objectType) {
    const response = await this.client.get(`/crm/v3/properties/${objectType}`);
    return { success: true, properties: response.data.results };
  }

  async getProperty(objectType, propertyName) {
    const response = await this.client.get(`/crm/v3/properties/${objectType}/${propertyName}`);
    return { success: true, property: response.data };
  }

  async createProperty(objectType, data) {
    const response = await this.client.post(`/crm/v3/properties/${objectType}`, data);
    return { success: true, property: response.data };
  }

  async updateProperty(objectType, propertyName, data) {
    const response = await this.client.patch(`/crm/v3/properties/${objectType}/${propertyName}`, data);
    return { success: true, property: response.data };
  }

  async deleteProperty(objectType, propertyName) {
    await this.client.delete(`/crm/v3/properties/${objectType}/${propertyName}`);
    return { success: true, message: 'Property deleted successfully' };
  }

  // ==================== EMAILS ====================

  async sendEmail(data) {
    const payload = {
      emailId: data.emailId,
      message: {
        to: data.to,
        ...(data.cc && { cc: data.cc }),
        ...(data.bcc && { bcc: data.bcc }),
        ...(data.from && { from: data.from }),
        ...(data.replyTo && { replyTo: data.replyTo }),
        ...(data.sendId && { sendId: data.sendId })
      },
      ...(data.contactProperties && { contactProperties: data.contactProperties }),
      ...(data.customProperties && { customProperties: data.customProperties })
    };

    const response = await this.client.post('/marketing/v3/transactional/single-email/send', payload);
    return { success: true, result: response.data };
  }

  // ==================== FORMS ====================

  async listForms(options = {}) {
    const params = {
      limit: options.limit || 50,
      ...(options.after && { after: options.after })
    };

    const response = await this.client.get('/marketing/v3/forms', { params });
    return { 
      success: true, 
      forms: response.data.results,
      paging: response.data.paging
    };
  }

  async getForm(formId) {
    const response = await this.client.get(`/marketing/v3/forms/${formId}`);
    return { success: true, form: response.data };
  }

  async submitForm(portalId, formGuid, data) {
    const payload = {
      fields: data.fields,
      ...(data.context && { context: data.context }),
      ...(data.legalConsentOptions && { legalConsentOptions: data.legalConsentOptions })
    };

    const response = await this.client.post(
      `/submissions/v3/integration/submit/${portalId}/${formGuid}`,
      payload
    );
    return { success: true, result: response.data };
  }

  // ==================== WORKFLOWS ====================

  async listWorkflows(options = {}) {
    const params = {
      limit: options.limit || 100,
      ...(options.after && { after: options.after })
    };

    const response = await this.client.get('/automation/v4/flows', { params });
    return { 
      success: true, 
      workflows: response.data.results,
      paging: response.data.paging
    };
  }

  async getWorkflow(workflowId) {
    const response = await this.client.get(`/automation/v4/flows/${workflowId}`);
    return { success: true, workflow: response.data };
  }

  // ==================== LISTS ====================

  async createList(data) {
    const payload = {
      name: data.name,
      ...(data.dynamic && { dynamic: data.dynamic }),
      ...(data.filterBranch && { filterBranch: data.filterBranch })
    };

    const response = await this.client.post('/contacts/v1/lists', payload);
    return { success: true, list: response.data };
  }

  async getList(listId) {
    const response = await this.client.get(`/contacts/v1/lists/${listId}`);
    return { success: true, list: response.data };
  }

  async updateList(listId, data) {
    const response = await this.client.post(`/contacts/v1/lists/${listId}`, data);
    return { success: true, list: response.data };
  }

  async deleteList(listId) {
    await this.client.delete(`/contacts/v1/lists/${listId}`);
    return { success: true, message: 'List deleted successfully' };
  }

  async listLists(options = {}) {
    const params = {
      count: options.count || 100,
      ...(options.offset && { offset: options.offset })
    };

    const response = await this.client.get('/contacts/v1/lists', { params });
    return { 
      success: true, 
      lists: response.data.lists,
      has_more: response.data['has-more']
    };
  }

  async addContactsToList(listId, contactIds) {
    const payload = {
      vids: contactIds
    };

    const response = await this.client.post(`/contacts/v1/lists/${listId}/add`, payload);
    return { success: true, result: response.data };
  }

  async removeContactsFromList(listId, contactIds) {
    const payload = {
      vids: contactIds
    };

    const response = await this.client.post(`/contacts/v1/lists/${listId}/remove`, payload);
    return { success: true, result: response.data };
  }

  // ==================== ENGAGEMENTS ====================

  async createEngagement(data) {
    const payload = {
      engagement: {
        active: true,
        type: data.type,
        timestamp: data.timestamp || Date.now()
      },
      associations: data.associations || {},
      metadata: data.metadata || {}
    };

    const response = await this.client.post('/engagements/v1/engagements', payload);
    return { success: true, engagement: response.data };
  }

  async getEngagement(engagementId) {
    const response = await this.client.get(`/engagements/v1/engagements/${engagementId}`);
    return { success: true, engagement: response.data };
  }

  async updateEngagement(engagementId, data) {
    const response = await this.client.patch(`/engagements/v1/engagements/${engagementId}`, data);
    return { success: true, engagement: response.data };
  }

  async deleteEngagement(engagementId) {
    await this.client.delete(`/engagements/v1/engagements/${engagementId}`);
    return { success: true, message: 'Engagement deleted successfully' };
  }

  // ==================== ANALYTICS ====================

  async getAnalytics(options = {}) {
    const params = {
      start: options.start,
      end: options.end,
      ...(options.frequency && { frequency: options.frequency }),
      ...(options.metrics && { metrics: options.metrics.join(',') })
    };

    const response = await this.client.get('/analytics/v2/reports', { params });
    return { success: true, analytics: response.data };
  }

  // ==================== WEBHOOKS ====================

  async createWebhook(data) {
    const payload = {
      subscriptionDetails: {
        subscriptionType: data.subscriptionType,
        propertyName: data.propertyName
      },
      webhookUrl: data.webhookUrl,
      ...(data.maxConcurrentRequests && { maxConcurrentRequests: data.maxConcurrentRequests })
    };

    const response = await this.client.post('/webhooks/v3/subscriptions', payload);
    return { success: true, webhook: response.data };
  }

  async listWebhooks(options = {}) {
    const params = {
      limit: options.limit || 100,
      ...(options.after && { after: options.after })
    };

    const response = await this.client.get('/webhooks/v3/subscriptions', { params });
    return { 
      success: true, 
      webhooks: response.data.results,
      paging: response.data.paging
    };
  }

  async getWebhook(webhookId) {
    const response = await this.client.get(`/webhooks/v3/subscriptions/${webhookId}`);
    return { success: true, webhook: response.data };
  }

  async updateWebhook(webhookId, data) {
    const response = await this.client.patch(`/webhooks/v3/subscriptions/${webhookId}`, data);
    return { success: true, webhook: response.data };
  }

  async deleteWebhook(webhookId) {
    await this.client.delete(`/webhooks/v3/subscriptions/${webhookId}`);
    return { success: true, message: 'Webhook deleted successfully' };
  }
}

module.exports = HubSpotAPI;
