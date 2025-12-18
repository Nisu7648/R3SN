/**
 * Mixpanel Premium API Integration
 * Complete product analytics and user behavior tracking
 * PREMIUM FEATURES - FREE ACCESS (normally $25/month)
 */

const axios = require('axios');

class MixpanelAPI {
  constructor(projectToken, apiSecret) {
    this.projectToken = projectToken || process.env.MIXPANEL_PROJECT_TOKEN;
    this.apiSecret = apiSecret || process.env.MIXPANEL_API_SECRET;
    this.baseURL = 'https://api.mixpanel.com';
    this.dataURL = 'https://data.mixpanel.com/api/2.0';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.dataClient = axios.create({
      baseURL: this.dataURL,
      auth: {
        username: this.apiSecret,
        password: ''
      }
    });
  }

  // ==================== EVENTS (PREMIUM) ====================

  async trackEvent(data) {
    const payload = {
      event: data.event,
      properties: {
        token: this.projectToken,
        distinct_id: data.distinct_id,
        time: data.time || Date.now(),
        ...(data.properties && data.properties)
      }
    };

    const encodedData = Buffer.from(JSON.stringify(payload)).toString('base64');
    const response = await this.client.get('/track', {
      params: { data: encodedData }
    });
    return { success: true, result: response.data };
  }

  async trackBatch(events) {
    const payload = events.map(event => ({
      event: event.event,
      properties: {
        token: this.projectToken,
        distinct_id: event.distinct_id,
        time: event.time || Date.now(),
        ...(event.properties && event.properties)
      }
    }));

    const encodedData = Buffer.from(JSON.stringify(payload)).toString('base64');
    const response = await this.client.get('/track', {
      params: { data: encodedData }
    });
    return { success: true, result: response.data };
  }

  async importEvent(data) {
    const payload = {
      event: data.event,
      properties: {
        token: this.projectToken,
        distinct_id: data.distinct_id,
        time: data.time,
        ...(data.properties && data.properties)
      }
    };

    const encodedData = Buffer.from(JSON.stringify(payload)).toString('base64');
    const response = await this.client.get('/import', {
      params: {
        data: encodedData,
        api_key: this.apiSecret
      }
    });
    return { success: true, result: response.data };
  }

  // ==================== PEOPLE (PREMIUM) ====================

  async setPeople(distinctId, properties) {
    const payload = {
      $token: this.projectToken,
      $distinct_id: distinctId,
      $set: properties
    };

    const encodedData = Buffer.from(JSON.stringify(payload)).toString('base64');
    const response = await this.client.get('/engage', {
      params: { data: encodedData }
    });
    return { success: true, result: response.data };
  }

  async setOncePeople(distinctId, properties) {
    const payload = {
      $token: this.projectToken,
      $distinct_id: distinctId,
      $set_once: properties
    };

    const encodedData = Buffer.from(JSON.stringify(payload)).toString('base64');
    const response = await this.client.get('/engage', {
      params: { data: encodedData }
    });
    return { success: true, result: response.data };
  }

  async incrementPeople(distinctId, properties) {
    const payload = {
      $token: this.projectToken,
      $distinct_id: distinctId,
      $add: properties
    };

    const encodedData = Buffer.from(JSON.stringify(payload)).toString('base64');
    const response = await this.client.get('/engage', {
      params: { data: encodedData }
    });
    return { success: true, result: response.data };
  }

  async appendPeople(distinctId, properties) {
    const payload = {
      $token: this.projectToken,
      $distinct_id: distinctId,
      $append: properties
    };

    const encodedData = Buffer.from(JSON.stringify(payload)).toString('base64');
    const response = await this.client.get('/engage', {
      params: { data: encodedData }
    });
    return { success: true, result: response.data };
  }

  async unionPeople(distinctId, properties) {
    const payload = {
      $token: this.projectToken,
      $distinct_id: distinctId,
      $union: properties
    };

    const encodedData = Buffer.from(JSON.stringify(payload)).toString('base64');
    const response = await this.client.get('/engage', {
      params: { data: encodedData }
    });
    return { success: true, result: response.data };
  }

  async removePeople(distinctId, properties) {
    const payload = {
      $token: this.projectToken,
      $distinct_id: distinctId,
      $remove: properties
    };

    const encodedData = Buffer.from(JSON.stringify(payload)).toString('base64');
    const response = await this.client.get('/engage', {
      params: { data: encodedData }
    });
    return { success: true, result: response.data };
  }

  async unsetPeople(distinctId, properties) {
    const payload = {
      $token: this.projectToken,
      $distinct_id: distinctId,
      $unset: properties
    };

    const encodedData = Buffer.from(JSON.stringify(payload)).toString('base64');
    const response = await this.client.get('/engage', {
      params: { data: encodedData }
    });
    return { success: true, result: response.data };
  }

  async deletePeople(distinctId) {
    const payload = {
      $token: this.projectToken,
      $distinct_id: distinctId,
      $delete: ''
    };

    const encodedData = Buffer.from(JSON.stringify(payload)).toString('base64');
    const response = await this.client.get('/engage', {
      params: { data: encodedData }
    });
    return { success: true, result: response.data };
  }

  // ==================== GROUPS (PREMIUM) ====================

  async setGroup(groupKey, groupId, properties) {
    const payload = {
      $token: this.projectToken,
      $group_key: groupKey,
      $group_id: groupId,
      $set: properties
    };

    const encodedData = Buffer.from(JSON.stringify(payload)).toString('base64');
    const response = await this.client.get('/groups', {
      params: { data: encodedData }
    });
    return { success: true, result: response.data };
  }

  async setOnceGroup(groupKey, groupId, properties) {
    const payload = {
      $token: this.projectToken,
      $group_key: groupKey,
      $group_id: groupId,
      $set_once: properties
    };

    const encodedData = Buffer.from(JSON.stringify(payload)).toString('base64');
    const response = await this.client.get('/groups', {
      params: { data: encodedData }
    });
    return { success: true, result: response.data };
  }

  async unionGroup(groupKey, groupId, properties) {
    const payload = {
      $token: this.projectToken,
      $group_key: groupKey,
      $group_id: groupId,
      $union: properties
    };

    const encodedData = Buffer.from(JSON.stringify(payload)).toString('base64');
    const response = await this.client.get('/groups', {
      params: { data: encodedData }
    });
    return { success: true, result: response.data };
  }

  async removeGroup(groupKey, groupId, properties) {
    const payload = {
      $token: this.projectToken,
      $group_key: groupKey,
      $group_id: groupId,
      $remove: properties
    };

    const encodedData = Buffer.from(JSON.stringify(payload)).toString('base64');
    const response = await this.client.get('/groups', {
      params: { data: encodedData }
    });
    return { success: true, result: response.data };
  }

  async deleteGroup(groupKey, groupId) {
    const payload = {
      $token: this.projectToken,
      $group_key: groupKey,
      $group_id: groupId,
      $delete: ''
    };

    const encodedData = Buffer.from(JSON.stringify(payload)).toString('base64');
    const response = await this.client.get('/groups', {
      params: { data: encodedData }
    });
    return { success: true, result: response.data };
  }

  // ==================== QUERY API (PREMIUM) ====================

  async queryEvents(params) {
    const response = await this.dataClient.get('/events', { params });
    return { success: true, data: response.data };
  }

  async queryTopEvents(params) {
    const response = await this.dataClient.get('/events/top', { params });
    return { success: true, data: response.data };
  }

  async queryEventNames(params) {
    const response = await this.dataClient.get('/events/names', { params });
    return { success: true, data: response.data };
  }

  async queryEventProperties(params) {
    const response = await this.dataClient.get('/events/properties', { params });
    return { success: true, data: response.data };
  }

  async queryEventPropertyValues(params) {
    const response = await this.dataClient.get('/events/properties/values', { params });
    return { success: true, data: response.data };
  }

  // ==================== FUNNELS (PREMIUM) ====================

  async queryFunnel(params) {
    const response = await this.dataClient.get('/funnels', { params });
    return { success: true, data: response.data };
  }

  async listFunnels(params) {
    const response = await this.dataClient.get('/funnels/list', { params });
    return { success: true, data: response.data };
  }

  // ==================== RETENTION (PREMIUM) ====================

  async queryRetention(params) {
    const response = await this.dataClient.get('/retention', { params });
    return { success: true, data: response.data };
  }

  // ==================== SEGMENTATION (PREMIUM) ====================

  async querySegmentation(params) {
    const response = await this.dataClient.get('/segmentation', { params });
    return { success: true, data: response.data };
  }

  async querySegmentationNumeric(params) {
    const response = await this.dataClient.get('/segmentation/numeric', { params });
    return { success: true, data: response.data };
  }

  async querySegmentationSum(params) {
    const response = await this.dataClient.get('/segmentation/sum', { params });
    return { success: true, data: response.data };
  }

  async querySegmentationAverage(params) {
    const response = await this.dataClient.get('/segmentation/average', { params });
    return { success: true, data: response.data };
  }

  // ==================== COHORTS (PREMIUM) ====================

  async createCohort(data) {
    const response = await this.dataClient.post('/cohorts/create', data);
    return { success: true, cohort: response.data };
  }

  async listCohorts() {
    const response = await this.dataClient.get('/cohorts/list');
    return { success: true, cohorts: response.data };
  }

  async updateCohort(cohortId, data) {
    const response = await this.dataClient.post(`/cohorts/${cohortId}/update`, data);
    return { success: true, cohort: response.data };
  }

  async deleteCohort(cohortId) {
    await this.dataClient.delete(`/cohorts/${cohortId}`);
    return { success: true, message: 'Cohort deleted successfully' };
  }

  // ==================== ANNOTATIONS (PREMIUM) ====================

  async createAnnotation(data) {
    const response = await this.dataClient.post('/annotations/create', data);
    return { success: true, annotation: response.data };
  }

  async listAnnotations(params) {
    const response = await this.dataClient.get('/annotations', { params });
    return { success: true, annotations: response.data };
  }

  async updateAnnotation(annotationId, data) {
    const response = await this.dataClient.post(`/annotations/${annotationId}/update`, data);
    return { success: true, annotation: response.data };
  }

  async deleteAnnotation(annotationId) {
    await this.dataClient.delete(`/annotations/${annotationId}`);
    return { success: true, message: 'Annotation deleted successfully' };
  }

  // ==================== EXPORTS (PREMIUM) ====================

  async exportEvents(params) {
    const response = await this.dataClient.get('/export', { params });
    return { success: true, data: response.data };
  }

  async exportPeople(params) {
    const response = await this.dataClient.post('/engage', params);
    return { success: true, data: response.data };
  }

  // ==================== JQL (PREMIUM) ====================

  async queryJQL(script) {
    const response = await this.dataClient.post('/jql', { script });
    return { success: true, data: response.data };
  }

  // ==================== INSIGHTS (PREMIUM) ====================

  async createInsight(data) {
    const response = await this.dataClient.post('/insights/create', data);
    return { success: true, insight: response.data };
  }

  async getInsight(insightId) {
    const response = await this.dataClient.get(`/insights/${insightId}`);
    return { success: true, insight: response.data };
  }

  async listInsights() {
    const response = await this.dataClient.get('/insights/list');
    return { success: true, insights: response.data };
  }

  async updateInsight(insightId, data) {
    const response = await this.dataClient.post(`/insights/${insightId}/update`, data);
    return { success: true, insight: response.data };
  }

  async deleteInsight(insightId) {
    await this.dataClient.delete(`/insights/${insightId}`);
    return { success: true, message: 'Insight deleted successfully' };
  }

  // ==================== BOARDS (PREMIUM) ====================

  async createBoard(data) {
    const response = await this.dataClient.post('/boards/create', data);
    return { success: true, board: response.data };
  }

  async getBoard(boardId) {
    const response = await this.dataClient.get(`/boards/${boardId}`);
    return { success: true, board: response.data };
  }

  async listBoards() {
    const response = await this.dataClient.get('/boards/list');
    return { success: true, boards: response.data };
  }

  async updateBoard(boardId, data) {
    const response = await this.dataClient.post(`/boards/${boardId}/update`, data);
    return { success: true, board: response.data };
  }

  async deleteBoard(boardId) {
    await this.dataClient.delete(`/boards/${boardId}`);
    return { success: true, message: 'Board deleted successfully' };
  }

  // ==================== LEXICON (PREMIUM) ====================

  async getEventSchema() {
    const response = await this.dataClient.get('/lexicon/events');
    return { success: true, schema: response.data };
  }

  async getPropertySchema() {
    const response = await this.dataClient.get('/lexicon/properties');
    return { success: true, schema: response.data };
  }

  async updateEventSchema(eventName, data) {
    const response = await this.dataClient.post(`/lexicon/events/${eventName}`, data);
    return { success: true, schema: response.data };
  }

  async updatePropertySchema(propertyName, data) {
    const response = await this.dataClient.post(`/lexicon/properties/${propertyName}`, data);
    return { success: true, schema: response.data };
  }

  // ==================== LOOKUP TABLES (PREMIUM) ====================

  async createLookupTable(data) {
    const response = await this.dataClient.post('/lookup-tables/create', data);
    return { success: true, table: response.data };
  }

  async getLookupTable(tableId) {
    const response = await this.dataClient.get(`/lookup-tables/${tableId}`);
    return { success: true, table: response.data };
  }

  async listLookupTables() {
    const response = await this.dataClient.get('/lookup-tables/list');
    return { success: true, tables: response.data };
  }

  async updateLookupTable(tableId, data) {
    const response = await this.dataClient.post(`/lookup-tables/${tableId}/update`, data);
    return { success: true, table: response.data };
  }

  async deleteLookupTable(tableId) {
    await this.dataClient.delete(`/lookup-tables/${tableId}`);
    return { success: true, message: 'Lookup table deleted successfully' };
  }

  async replaceLookupTableData(tableId, data) {
    const response = await this.dataClient.post(`/lookup-tables/${tableId}/replace`, data);
    return { success: true, result: response.data };
  }

  // ==================== IDENTITY MANAGEMENT (PREMIUM) ====================

  async createAlias(distinctId, alias) {
    const payload = {
      event: '$create_alias',
      properties: {
        token: this.projectToken,
        distinct_id: distinctId,
        alias: alias
      }
    };

    const encodedData = Buffer.from(JSON.stringify(payload)).toString('base64');
    const response = await this.client.get('/track', {
      params: { data: encodedData }
    });
    return { success: true, result: response.data };
  }

  async mergeIdentities(distinctId1, distinctId2) {
    const payload = {
      $token: this.projectToken,
      $distinct_ids: [distinctId1, distinctId2]
    };

    const response = await this.client.post('/identity/merge', payload);
    return { success: true, result: response.data };
  }
}

module.exports = MixpanelAPI;
