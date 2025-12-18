/**
 * Amplitude Premium API Integration
 * Complete product analytics and behavioral insights
 * PREMIUM FEATURES - FREE ACCESS (normally $995/month)
 */

const axios = require('axios');

class AmplitudeAPI {
  constructor(apiKey, secretKey) {
    this.apiKey = apiKey || process.env.AMPLITUDE_API_KEY;
    this.secretKey = secretKey || process.env.AMPLITUDE_SECRET_KEY;
    this.httpURL = 'https://api2.amplitude.com/2/httpapi';
    this.batchURL = 'https://api2.amplitude.com/batch';
    this.analyticsURL = 'https://amplitude.com/api/2';
    
    this.client = axios.create({
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.analyticsClient = axios.create({
      baseURL: this.analyticsURL,
      auth: {
        username: this.apiKey,
        password: this.secretKey
      }
    });
  }

  // ==================== EVENT TRACKING (PREMIUM) ====================

  async trackEvent(data) {
    const payload = {
      api_key: this.apiKey,
      events: [{
        user_id: data.user_id,
        event_type: data.event_type,
        ...(data.device_id && { device_id: data.device_id }),
        ...(data.time && { time: data.time }),
        ...(data.event_properties && { event_properties: data.event_properties }),
        ...(data.user_properties && { user_properties: data.user_properties }),
        ...(data.groups && { groups: data.groups }),
        ...(data.app_version && { app_version: data.app_version }),
        ...(data.platform && { platform: data.platform }),
        ...(data.os_name && { os_name: data.os_name }),
        ...(data.os_version && { os_version: data.os_version }),
        ...(data.device_brand && { device_brand: data.device_brand }),
        ...(data.device_manufacturer && { device_manufacturer: data.device_manufacturer }),
        ...(data.device_model && { device_model: data.device_model }),
        ...(data.carrier && { carrier: data.carrier }),
        ...(data.country && { country: data.country }),
        ...(data.region && { region: data.region }),
        ...(data.city && { city: data.city }),
        ...(data.dma && { dma: data.dma }),
        ...(data.language && { language: data.language }),
        ...(data.price && { price: data.price }),
        ...(data.quantity && { quantity: data.quantity }),
        ...(data.revenue && { revenue: data.revenue }),
        ...(data.productId && { productId: data.productId }),
        ...(data.revenueType && { revenueType: data.revenueType }),
        ...(data.location_lat && { location_lat: data.location_lat }),
        ...(data.location_lng && { location_lng: data.location_lng }),
        ...(data.ip && { ip: data.ip }),
        ...(data.idfa && { idfa: data.idfa }),
        ...(data.idfv && { idfv: data.idfv }),
        ...(data.adid && { adid: data.adid }),
        ...(data.android_id && { android_id: data.android_id }),
        ...(data.event_id && { event_id: data.event_id }),
        ...(data.session_id && { session_id: data.session_id }),
        ...(data.insert_id && { insert_id: data.insert_id })
      }],
      ...(data.options && { options: data.options })
    };

    const response = await this.client.post(this.httpURL, payload);
    return { success: true, result: response.data };
  }

  async trackBatch(events) {
    const payload = {
      api_key: this.apiKey,
      events: events.map(event => ({
        user_id: event.user_id,
        event_type: event.event_type,
        ...(event.device_id && { device_id: event.device_id }),
        ...(event.time && { time: event.time }),
        ...(event.event_properties && { event_properties: event.event_properties }),
        ...(event.user_properties && { user_properties: event.user_properties }),
        ...(event.groups && { groups: event.groups })
      }))
    };

    const response = await this.client.post(this.batchURL, payload);
    return { success: true, result: response.data };
  }

  async identifyUser(data) {
    const payload = {
      api_key: this.apiKey,
      identification: [{
        user_id: data.user_id,
        ...(data.device_id && { device_id: data.device_id }),
        user_properties: data.user_properties
      }]
    };

    const response = await this.client.post('https://api2.amplitude.com/identify', payload);
    return { success: true, result: response.data };
  }

  async setUserProperties(data) {
    const payload = {
      api_key: this.apiKey,
      identification: [{
        user_id: data.user_id,
        user_properties: {
          $set: data.set_properties
        }
      }]
    };

    const response = await this.client.post('https://api2.amplitude.com/identify', payload);
    return { success: true, result: response.data };
  }

  async setOnceUserProperties(data) {
    const payload = {
      api_key: this.apiKey,
      identification: [{
        user_id: data.user_id,
        user_properties: {
          $setOnce: data.set_once_properties
        }
      }]
    };

    const response = await this.client.post('https://api2.amplitude.com/identify', payload);
    return { success: true, result: response.data };
  }

  async addUserProperties(data) {
    const payload = {
      api_key: this.apiKey,
      identification: [{
        user_id: data.user_id,
        user_properties: {
          $add: data.add_properties
        }
      }]
    };

    const response = await this.client.post('https://api2.amplitude.com/identify', payload);
    return { success: true, result: response.data };
  }

  async appendUserProperties(data) {
    const payload = {
      api_key: this.apiKey,
      identification: [{
        user_id: data.user_id,
        user_properties: {
          $append: data.append_properties
        }
      }]
    };

    const response = await this.client.post('https://api2.amplitude.com/identify', payload);
    return { success: true, result: response.data };
  }

  async unsetUserProperties(data) {
    const payload = {
      api_key: this.apiKey,
      identification: [{
        user_id: data.user_id,
        user_properties: {
          $unset: data.unset_properties
        }
      }]
    };

    const response = await this.client.post('https://api2.amplitude.com/identify', payload);
    return { success: true, result: response.data };
  }

  // ==================== GROUP IDENTIFY (PREMIUM) ====================

  async identifyGroup(data) {
    const payload = {
      api_key: this.apiKey,
      identification: [{
        group_type: data.group_type,
        group_value: data.group_value,
        group_properties: data.group_properties
      }]
    };

    const response = await this.client.post('https://api2.amplitude.com/groupidentify', payload);
    return { success: true, result: response.data };
  }

  // ==================== DASHBOARD REST API (PREMIUM) ====================

  async getActiveUsers(start, end, options = {}) {
    const params = {
      start,
      end,
      ...(options.m && { m: options.m }),
      ...(options.i && { i: options.i }),
      ...(options.g && { g: options.g }),
      ...(options.s && { s: options.s })
    };

    const response = await this.analyticsClient.get('/users', { params });
    return { success: true, data: response.data };
  }

  async getNewUsers(start, end, options = {}) {
    const params = {
      start,
      end,
      ...(options.m && { m: options.m }),
      ...(options.i && { i: options.i }),
      ...(options.g && { g: options.g })
    };

    const response = await this.analyticsClient.get('/newusers', { params });
    return { success: true, data: response.data };
  }

  async getSessionLength(start, end) {
    const params = { start, end };
    const response = await this.analyticsClient.get('/sessions/length', { params });
    return { success: true, data: response.data };
  }

  async getAverageSessionLength(start, end) {
    const params = { start, end };
    const response = await this.analyticsClient.get('/sessions/average', { params });
    return { success: true, data: response.data };
  }

  async getEventsSegmentation(event, start, end, options = {}) {
    const params = {
      e: JSON.stringify(event),
      start,
      end,
      ...(options.m && { m: options.m }),
      ...(options.i && { i: options.i }),
      ...(options.s && { s: options.s }),
      ...(options.g && { g: options.g })
    };

    const response = await this.analyticsClient.get('/events/segmentation', { params });
    return { success: true, data: response.data };
  }

  async getEventsList(start, end) {
    const params = { start, end };
    const response = await this.analyticsClient.get('/events/list', { params });
    return { success: true, data: response.data };
  }

  async getFunnel(funnel, start, end, options = {}) {
    const params = {
      e: JSON.stringify(funnel),
      start,
      end,
      ...(options.mode && { mode: options.mode }),
      ...(options.s && { s: options.s }),
      ...(options.g && { g: options.g })
    };

    const response = await this.analyticsClient.get('/funnels', { params });
    return { success: true, data: response.data };
  }

  async getRetention(events, start, end, options = {}) {
    const params = {
      e: JSON.stringify(events),
      start,
      end,
      ...(options.rm && { rm: options.rm }),
      ...(options.rb && { rb: options.rb }),
      ...(options.s && { s: options.s }),
      ...(options.g && { g: options.g })
    };

    const response = await this.analyticsClient.get('/retention', { params });
    return { success: true, data: response.data };
  }

  async getUserActivity(user, options = {}) {
    const params = {
      user,
      ...(options.offset && { offset: options.offset }),
      ...(options.limit && { limit: options.limit })
    };

    const response = await this.analyticsClient.get('/useractivity', { params });
    return { success: true, data: response.data };
  }

  async getUserSearch(user) {
    const params = { user };
    const response = await this.analyticsClient.get('/usersearch', { params });
    return { success: true, data: response.data };
  }

  async getRealtime(options = {}) {
    const params = {
      ...(options.i && { i: options.i })
    };

    const response = await this.analyticsClient.get('/realtime', { params });
    return { success: true, data: response.data };
  }

  async getRevenue(start, end, options = {}) {
    const params = {
      start,
      end,
      ...(options.m && { m: options.m }),
      ...(options.i && { i: options.i }),
      ...(options.s && { s: options.s }),
      ...(options.g && { g: options.g })
    };

    const response = await this.analyticsClient.get('/revenue', { params });
    return { success: true, data: response.data };
  }

  async getRevenueAnalysis(start, end, options = {}) {
    const params = {
      start,
      end,
      ...(options.m && { m: options.m }),
      ...(options.i && { i: options.i })
    };

    const response = await this.analyticsClient.get('/revenue/analysis', { params });
    return { success: true, data: response.data };
  }

  async getRevenueLTV(start, end, options = {}) {
    const params = {
      start,
      end,
      ...(options.m && { m: options.m }),
      ...(options.i && { i: options.i })
    };

    const response = await this.analyticsClient.get('/revenue/ltv', { params });
    return { success: true, data: response.data };
  }

  // ==================== COHORTS (PREMIUM) ====================

  async listCohorts() {
    const response = await this.analyticsClient.get('/cohorts');
    return { success: true, cohorts: response.data.cohorts };
  }

  async getCohort(cohortId) {
    const response = await this.analyticsClient.get(`/cohorts/${cohortId}`);
    return { success: true, cohort: response.data };
  }

  async downloadCohort(cohortId, options = {}) {
    const params = {
      ...(options.props && { props: options.props })
    };

    const response = await this.analyticsClient.get(`/cohorts/${cohortId}/download`, { params });
    return { success: true, users: response.data };
  }

  // ==================== ANNOTATIONS (PREMIUM) ====================

  async createAnnotation(data) {
    const payload = {
      label: data.label,
      date: data.date,
      ...(data.details && { details: data.details })
    };

    const response = await this.analyticsClient.post('/annotations', payload);
    return { success: true, annotation: response.data };
  }

  async listAnnotations(start, end) {
    const params = { start, end };
    const response = await this.analyticsClient.get('/annotations', { params });
    return { success: true, annotations: response.data.data };
  }

  async updateAnnotation(annotationId, data) {
    const response = await this.analyticsClient.put(`/annotations/${annotationId}`, data);
    return { success: true, annotation: response.data };
  }

  async deleteAnnotation(annotationId) {
    await this.analyticsClient.delete(`/annotations/${annotationId}`);
    return { success: true, message: 'Annotation deleted successfully' };
  }

  // ==================== RELEASES (PREMIUM) ====================

  async createRelease(data) {
    const payload = {
      version: data.version,
      created_at: data.created_at,
      ...(data.title && { title: data.title }),
      ...(data.description && { description: data.description })
    };

    const response = await this.analyticsClient.post('/releases', payload);
    return { success: true, release: response.data };
  }

  async listReleases(start, end) {
    const params = { start, end };
    const response = await this.analyticsClient.get('/releases', { params });
    return { success: true, releases: response.data.data };
  }

  async updateRelease(releaseId, data) {
    const response = await this.analyticsClient.put(`/releases/${releaseId}`, data);
    return { success: true, release: response.data };
  }

  async deleteRelease(releaseId) {
    await this.analyticsClient.delete(`/releases/${releaseId}`);
    return { success: true, message: 'Release deleted successfully' };
  }

  // ==================== TAXONOMY (PREMIUM) ====================

  async getEventSchema() {
    const response = await this.analyticsClient.get('/taxonomy/event');
    return { success: true, events: response.data.data };
  }

  async getEventPropertySchema(eventType) {
    const response = await this.analyticsClient.get(`/taxonomy/event/${eventType}`);
    return { success: true, properties: response.data.data };
  }

  async getUserPropertySchema() {
    const response = await this.analyticsClient.get('/taxonomy/user-property');
    return { success: true, properties: response.data.data };
  }

  async createEventSchema(data) {
    const payload = {
      event_type: data.event_type,
      ...(data.category && { category: data.category }),
      ...(data.description && { description: data.description })
    };

    const response = await this.analyticsClient.post('/taxonomy/event', payload);
    return { success: true, event: response.data };
  }

  async updateEventSchema(eventType, data) {
    const response = await this.analyticsClient.put(`/taxonomy/event/${eventType}`, data);
    return { success: true, event: response.data };
  }

  async deleteEventSchema(eventType) {
    await this.analyticsClient.delete(`/taxonomy/event/${eventType}`);
    return { success: true, message: 'Event schema deleted successfully' };
  }

  // ==================== EXPORT API (PREMIUM) ====================

  async exportProjectData(start, end) {
    const params = {
      start,
      end
    };

    const response = await this.client.get('https://amplitude.com/api/2/export', {
      params,
      auth: {
        username: this.apiKey,
        password: this.secretKey
      },
      responseType: 'stream'
    });

    return { success: true, stream: response.data };
  }

  // ==================== SCIM API (PREMIUM) ====================

  async listSCIMUsers(options = {}) {
    const params = {
      ...(options.startIndex && { startIndex: options.startIndex }),
      ...(options.count && { count: options.count }),
      ...(options.filter && { filter: options.filter })
    };

    const response = await this.client.get('https://analytics.amplitude.com/api/2/scim/2/Users', {
      params,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    return { success: true, users: response.data.Resources };
  }

  async getSCIMUser(userId) {
    const response = await this.client.get(`https://analytics.amplitude.com/api/2/scim/2/Users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    return { success: true, user: response.data };
  }

  async createSCIMUser(data) {
    const payload = {
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
      userName: data.userName,
      ...(data.name && { name: data.name }),
      ...(data.emails && { emails: data.emails }),
      ...(data.active !== undefined && { active: data.active })
    };

    const response = await this.client.post('https://analytics.amplitude.com/api/2/scim/2/Users', payload, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    return { success: true, user: response.data };
  }

  async updateSCIMUser(userId, data) {
    const response = await this.client.put(`https://analytics.amplitude.com/api/2/scim/2/Users/${userId}`, data, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    return { success: true, user: response.data };
  }

  async deleteSCIMUser(userId) {
    await this.client.delete(`https://analytics.amplitude.com/api/2/scim/2/Users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    return { success: true, message: 'User deleted successfully' };
  }
}

module.exports = AmplitudeAPI;
