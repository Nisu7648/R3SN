const axios = require('axios');

class SalesforceIntegration {
  constructor(instanceUrl, accessToken) {
    this.instanceUrl = instanceUrl;
    this.accessToken = accessToken;
    this.baseURL = `${instanceUrl}/services/data/v57.0`;
    this.headers = { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' };
  }

  async query(soql) {
    const response = await axios.get(`${this.baseURL}/query`, {
      headers: this.headers,
      params: { q: soql }
    });
    return response.data;
  }

  async getAccounts() {
    return this.query('SELECT Id, Name, Industry FROM Account LIMIT 100');
  }

  async createAccount(name, industry = null) {
    const response = await axios.post(
      `${this.baseURL}/sobjects/Account`,
      { Name: name, Industry: industry },
      { headers: this.headers }
    );
    return response.data;
  }

  async getContacts() {
    return this.query('SELECT Id, FirstName, LastName, Email FROM Contact LIMIT 100');
  }

  async createContact(firstName, lastName, email, accountId = null) {
    const response = await axios.post(
      `${this.baseURL}/sobjects/Contact`,
      { FirstName: firstName, LastName: lastName, Email: email, AccountId: accountId },
      { headers: this.headers }
    );
    return response.data;
  }

  async getOpportunities() {
    return this.query('SELECT Id, Name, StageName, Amount FROM Opportunity LIMIT 100');
  }

  async createOpportunity(name, stageName, closeDate, accountId = null) {
    const response = await axios.post(
      `${this.baseURL}/sobjects/Opportunity`,
      { Name: name, StageName: stageName, CloseDate: closeDate, AccountId: accountId },
      { headers: this.headers }
    );
    return response.data;
  }
}

module.exports = SalesforceIntegration;
