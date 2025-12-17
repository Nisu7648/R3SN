const axios = require('axios');

class ZohoCRMIntegration {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseUrl = 'https://www.zohoapis.com/crm/v2';
  }

  getHeaders() {
    return { 'Authorization': `Zoho-oauthtoken ${this.accessToken}`, 'Content-Type': 'application/json' };
  }

  async request(method, path, data = null) {
    try {
      const response = await axios({ method, url: `${this.baseUrl}${path}`, headers: this.getHeaders(), data });
      return { success: true, data: response.data.data };
    } catch (error) {
      throw new Error(`Zoho CRM error: ${error.response?.data?.message || error.message}`);
    }
  }

  async listLeads() { return this.request('GET', '/Leads'); }
  async getLead(id) { return this.request('GET', `/Leads/${id}`); }
  async createLead(data) { return this.request('POST', '/Leads', { data: [data] }); }
  async updateLead(id, data) { return this.request('PUT', `/Leads/${id}`, { data: [data] }); }
  async deleteLead(id) { return this.request('DELETE', `/Leads/${id}`); }
  async listContacts() { return this.request('GET', '/Contacts'); }
  async getContact(id) { return this.request('GET', `/Contacts/${id}`); }
  async createContact(data) { return this.request('POST', '/Contacts', { data: [data] }); }
  async updateContact(id, data) { return this.request('PUT', `/Contacts/${id}`, { data: [data] }); }
  async listAccounts() { return this.request('GET', '/Accounts'); }
  async getAccount(id) { return this.request('GET', `/Accounts/${id}`); }
  async createAccount(data) { return this.request('POST', '/Accounts', { data: [data] }); }
  async updateAccount(id, data) { return this.request('PUT', `/Accounts/${id}`, { data: [data] }); }
  async listDeals() { return this.request('GET', '/Deals'); }
  async getDeal(id) { return this.request('GET', `/Deals/${id}`); }
  async createDeal(data) { return this.request('POST', '/Deals', { data: [data] }); }
  async updateDeal(id, data) { return this.request('PUT', `/Deals/${id}`, { data: [data] }); }
  async listTasks() { return this.request('GET', '/Tasks'); }
  async createTask(data) { return this.request('POST', '/Tasks', { data: [data] }); }
  async listNotes() { return this.request('GET', '/Notes'); }
  async createNote(data) { return this.request('POST', '/Notes', { data: [data] }); }
  async listCalls() { return this.request('GET', '/Calls'); }
  async createCall(data) { return this.request('POST', '/Calls', { data: [data] }); }
  async listUsers() { return this.request('GET', '/users'); }
  async searchRecords(module, criteria) { return this.request('GET', `/${module}/search?criteria=${criteria}`); }
}

module.exports = ZohoCRMIntegration;
