const axios = require('axios');

class CalendlyIntegration {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.calendly.com';
    this.headers = { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' };
  }

  async getCurrentUser() {
    const response = await axios.get(`${this.baseURL}/users/me`, {
      headers: this.headers
    });
    return response.data;
  }

  async getEventTypes(userUri) {
    const response = await axios.get(`${this.baseURL}/event_types`, {
      headers: this.headers,
      params: { user: userUri }
    });
    return response.data;
  }

  async getScheduledEvents(userUri) {
    const response = await axios.get(`${this.baseURL}/scheduled_events`, {
      headers: this.headers,
      params: { user: userUri }
    });
    return response.data;
  }

  async getEvent(eventUuid) {
    const response = await axios.get(`${this.baseURL}/scheduled_events/${eventUuid}`, {
      headers: this.headers
    });
    return response.data;
  }

  async getInvitees(eventUuid) {
    const response = await axios.get(`${this.baseURL}/scheduled_events/${eventUuid}/invitees`, {
      headers: this.headers
    });
    return response.data;
  }

  async cancelEvent(eventUuid, reason = '') {
    const response = await axios.post(
      `${this.baseURL}/scheduled_events/${eventUuid}/cancellation`,
      { reason },
      { headers: this.headers }
    );
    return response.data;
  }

  async getWebhooks(organizationUri, scope = 'organization') {
    const response = await axios.get(`${this.baseURL}/webhook_subscriptions`, {
      headers: this.headers,
      params: { organization: organizationUri, scope }
    });
    return response.data;
  }

  async createWebhook(url, events, organizationUri, scope = 'organization') {
    const response = await axios.post(
      `${this.baseURL}/webhook_subscriptions`,
      { url, events, organization: organizationUri, scope },
      { headers: this.headers }
    );
    return response.data;
  }
}

module.exports = CalendlyIntegration;
