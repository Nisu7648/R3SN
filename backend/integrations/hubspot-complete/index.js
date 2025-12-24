const axios = require('axios');

class HubSpotIntegration {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.hubapi.com';
    this.headers = { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' };
  }

  async getContacts(limit = 100) {
    const response = await axios.get(`${this.baseURL}/crm/v3/objects/contacts`, {
      headers: this.headers,
      params: { limit }
    });
    return response.data;
  }

  async createContact(properties) {
    const response = await axios.post(
      `${this.baseURL}/crm/v3/objects/contacts`,
      { properties },
      { headers: this.headers }
    );
    return response.data;
  }

  async updateContact(contactId, properties) {
    const response = await axios.patch(
      `${this.baseURL}/crm/v3/objects/contacts/${contactId}`,
      { properties },
      { headers: this.headers }
    );
    return response.data;
  }

  async getDeals(limit = 100) {
    const response = await axios.get(`${this.baseURL}/crm/v3/objects/deals`, {
      headers: this.headers,
      params: { limit }
    });
    return response.data;
  }

  async createDeal(properties) {
    const response = await axios.post(
      `${this.baseURL}/crm/v3/objects/deals`,
      { properties },
      { headers: this.headers }
    );
    return response.data;
  }

  async getCompanies(limit = 100) {
    const response = await axios.get(`${this.baseURL}/crm/v3/objects/companies`, {
      headers: this.headers,
      params: { limit }
    });
    return response.data;
  }

  async createCompany(properties) {
    const response = await axios.post(
      `${this.baseURL}/crm/v3/objects/companies`,
      { properties },
      { headers: this.headers }
    );
    return response.data;
  }
}

module.exports = HubSpotIntegration;
