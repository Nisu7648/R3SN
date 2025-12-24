const axios = require('axios');

class MailchimpIntegration {
  constructor(apiKey, serverPrefix) {
    this.apiKey = apiKey;
    this.serverPrefix = serverPrefix;
    this.baseURL = `https://${serverPrefix}.api.mailchimp.com/3.0`;
    this.headers = { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' };
  }

  async getLists() {
    const response = await axios.get(`${this.baseURL}/lists`, {
      headers: this.headers
    });
    return response.data;
  }

  async getList(listId) {
    const response = await axios.get(`${this.baseURL}/lists/${listId}`, {
      headers: this.headers
    });
    return response.data;
  }

  async addMember(listId, email, status = 'subscribed', mergeFields = {}) {
    const response = await axios.post(
      `${this.baseURL}/lists/${listId}/members`,
      { email_address: email, status, merge_fields: mergeFields },
      { headers: this.headers }
    );
    return response.data;
  }

  async updateMember(listId, subscriberHash, updates) {
    const response = await axios.patch(
      `${this.baseURL}/lists/${listId}/members/${subscriberHash}`,
      updates,
      { headers: this.headers }
    );
    return response.data;
  }

  async deleteMember(listId, subscriberHash) {
    const response = await axios.delete(
      `${this.baseURL}/lists/${listId}/members/${subscriberHash}`,
      { headers: this.headers }
    );
    return response.data;
  }

  async getCampaigns() {
    const response = await axios.get(`${this.baseURL}/campaigns`, {
      headers: this.headers
    });
    return response.data;
  }

  async createCampaign(type, listId, subject, fromName, replyTo) {
    const response = await axios.post(
      `${this.baseURL}/campaigns`,
      {
        type,
        recipients: { list_id: listId },
        settings: { subject_line: subject, from_name: fromName, reply_to: replyTo }
      },
      { headers: this.headers }
    );
    return response.data;
  }

  async sendCampaign(campaignId) {
    const response = await axios.post(
      `${this.baseURL}/campaigns/${campaignId}/actions/send`,
      {},
      { headers: this.headers }
    );
    return response.data;
  }
}

module.exports = MailchimpIntegration;
