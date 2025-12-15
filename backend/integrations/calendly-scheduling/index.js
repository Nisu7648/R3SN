/**
 * Calendly Scheduling Integration
 */

const axios = require('axios');

class CalendlyIntegration {
  constructor(config) {
    this.apiKey = config.apiKey || process.env.CALENDLY_API_KEY;
    if (!this.apiKey) throw new Error('Calendly API key required');
    
    this.baseURL = 'https://api.calendly.com';
  }

  async makeRequest(method, endpoint, data = null) {
    const config = {
      method,
      url: `${this.baseURL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    };

    if (data) config.data = data;

    try {
      const response = await axios(config);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message };
    }
  }

  async getCurrentUser() {
    return await this.makeRequest('GET', '/users/me');
  }

  async getEventTypes(userUri) {
    return await this.makeRequest('GET', `/event_types?user=${encodeURIComponent(userUri)}`);
  }

  async getEventType(uuid) {
    return await this.makeRequest('GET', `/event_types/${uuid}`);
  }

  async getScheduledEvents(userUri, status = 'active') {
    return await this.makeRequest('GET', `/scheduled_events?user=${encodeURIComponent(userUri)}&status=${status}`);
  }

  async getScheduledEvent(uuid) {
    return await this.makeRequest('GET', `/scheduled_events/${uuid}`);
  }

  async getEventInvitees(eventUuid) {
    return await this.makeRequest('GET', `/scheduled_events/${eventUuid}/invitees`);
  }

  async getInvitee(inviteeUuid) {
    return await this.makeRequest('GET', `/scheduled_events/invitees/${inviteeUuid}`);
  }

  async cancelEvent(eventUuid, reason = '') {
    return await this.makeRequest('POST', `/scheduled_events/${eventUuid}/cancellation`, {
      reason
    });
  }

  async createWebhook(url, events, userUri, scope = 'user') {
    return await this.makeRequest('POST', '/webhook_subscriptions', {
      url,
      events,
      organization: userUri,
      scope
    });
  }

  async getWebhooks(scope = 'user', organization) {
    return await this.makeRequest('GET', `/webhook_subscriptions?scope=${scope}&organization=${encodeURIComponent(organization)}`);
  }

  async deleteWebhook(webhookUuid) {
    return await this.makeRequest('DELETE', `/webhook_subscriptions/${webhookUuid}`);
  }
}

module.exports = CalendlyIntegration;
