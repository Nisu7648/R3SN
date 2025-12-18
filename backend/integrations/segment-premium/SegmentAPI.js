/**
 * Segment Premium API Integration
 * Complete customer data platform and analytics
 * PREMIUM FEATURES - FREE ACCESS (normally $120/month)
 */

const axios = require('axios');

class SegmentAPI {
  constructor(writeKey, apiToken) {
    this.writeKey = writeKey || process.env.SEGMENT_WRITE_KEY;
    this.apiToken = apiToken || process.env.SEGMENT_API_TOKEN;
    this.trackingURL = 'https://api.segment.io/v1';
    this.configURL = 'https://api.segmentapis.com/v1beta';
    
    this.trackingClient = axios.create({
      baseURL: this.trackingURL,
      auth: {
        username: this.writeKey,
        password: ''
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.configClient = axios.create({
      baseURL: this.configURL,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // ==================== TRACKING API (PREMIUM) ====================

  async identify(data) {
    const payload = {
      userId: data.userId,
      ...(data.anonymousId && { anonymousId: data.anonymousId }),
      ...(data.traits && { traits: data.traits }),
      ...(data.context && { context: data.context }),
      ...(data.timestamp && { timestamp: data.timestamp }),
      ...(data.integrations && { integrations: data.integrations })
    };

    const response = await this.trackingClient.post('/identify', payload);
    return { success: true, result: response.data };
  }

  async track(data) {
    const payload = {
      userId: data.userId,
      event: data.event,
      ...(data.anonymousId && { anonymousId: data.anonymousId }),
      ...(data.properties && { properties: data.properties }),
      ...(data.context && { context: data.context }),
      ...(data.timestamp && { timestamp: data.timestamp }),
      ...(data.integrations && { integrations: data.integrations })
    };

    const response = await this.trackingClient.post('/track', payload);
    return { success: true, result: response.data };
  }

  async page(data) {
    const payload = {
      userId: data.userId,
      ...(data.anonymousId && { anonymousId: data.anonymousId }),
      ...(data.name && { name: data.name }),
      ...(data.category && { category: data.category }),
      ...(data.properties && { properties: data.properties }),
      ...(data.context && { context: data.context }),
      ...(data.timestamp && { timestamp: data.timestamp }),
      ...(data.integrations && { integrations: data.integrations })
    };

    const response = await this.trackingClient.post('/page', payload);
    return { success: true, result: response.data };
  }

  async screen(data) {
    const payload = {
      userId: data.userId,
      ...(data.anonymousId && { anonymousId: data.anonymousId }),
      ...(data.name && { name: data.name }),
      ...(data.category && { category: data.category }),
      ...(data.properties && { properties: data.properties }),
      ...(data.context && { context: data.context }),
      ...(data.timestamp && { timestamp: data.timestamp }),
      ...(data.integrations && { integrations: data.integrations })
    };

    const response = await this.trackingClient.post('/screen', payload);
    return { success: true, result: response.data };
  }

  async group(data) {
    const payload = {
      userId: data.userId,
      groupId: data.groupId,
      ...(data.anonymousId && { anonymousId: data.anonymousId }),
      ...(data.traits && { traits: data.traits }),
      ...(data.context && { context: data.context }),
      ...(data.timestamp && { timestamp: data.timestamp }),
      ...(data.integrations && { integrations: data.integrations })
    };

    const response = await this.trackingClient.post('/group', payload);
    return { success: true, result: response.data };
  }

  async alias(data) {
    const payload = {
      userId: data.userId,
      previousId: data.previousId,
      ...(data.context && { context: data.context }),
      ...(data.timestamp && { timestamp: data.timestamp }),
      ...(data.integrations && { integrations: data.integrations })
    };

    const response = await this.trackingClient.post('/alias', payload);
    return { success: true, result: response.data };
  }

  async batch(data) {
    const payload = {
      batch: data.batch,
      ...(data.context && { context: data.context }),
      ...(data.integrations && { integrations: data.integrations })
    };

    const response = await this.trackingClient.post('/batch', payload);
    return { success: true, result: response.data };
  }

  // ==================== SOURCES (PREMIUM) ====================

  async listSources(workspaceId) {
    const response = await this.configClient.get(`/workspaces/${workspaceId}/sources`);
    return { success: true, sources: response.data.sources };
  }

  async getSource(workspaceId, sourceId) {
    const response = await this.configClient.get(`/workspaces/${workspaceId}/sources/${sourceId}`);
    return { success: true, source: response.data.source };
  }

  async createSource(workspaceId, data) {
    const payload = {
      name: data.name,
      slug: data.slug,
      catalogId: data.catalogId,
      ...(data.enabled !== undefined && { enabled: data.enabled }),
      ...(data.settings && { settings: data.settings })
    };

    const response = await this.configClient.post(`/workspaces/${workspaceId}/sources`, payload);
    return { success: true, source: response.data.source };
  }

  async updateSource(workspaceId, sourceId, data) {
    const response = await this.configClient.patch(`/workspaces/${workspaceId}/sources/${sourceId}`, data);
    return { success: true, source: response.data.source };
  }

  async deleteSource(workspaceId, sourceId) {
    await this.configClient.delete(`/workspaces/${workspaceId}/sources/${sourceId}`);
    return { success: true, message: 'Source deleted successfully' };
  }

  // ==================== DESTINATIONS (PREMIUM) ====================

  async listDestinations(workspaceId, sourceId) {
    const response = await this.configClient.get(`/workspaces/${workspaceId}/sources/${sourceId}/destinations`);
    return { success: true, destinations: response.data.destinations };
  }

  async getDestination(workspaceId, sourceId, destinationId) {
    const response = await this.configClient.get(`/workspaces/${workspaceId}/sources/${sourceId}/destinations/${destinationId}`);
    return { success: true, destination: response.data.destination };
  }

  async createDestination(workspaceId, sourceId, data) {
    const payload = {
      name: data.name,
      catalogId: data.catalogId,
      ...(data.enabled !== undefined && { enabled: data.enabled }),
      ...(data.settings && { settings: data.settings }),
      ...(data.connectionMode && { connectionMode: data.connectionMode })
    };

    const response = await this.configClient.post(`/workspaces/${workspaceId}/sources/${sourceId}/destinations`, payload);
    return { success: true, destination: response.data.destination };
  }

  async updateDestination(workspaceId, sourceId, destinationId, data) {
    const response = await this.configClient.patch(`/workspaces/${workspaceId}/sources/${sourceId}/destinations/${destinationId}`, data);
    return { success: true, destination: response.data.destination };
  }

  async deleteDestination(workspaceId, sourceId, destinationId) {
    await this.configClient.delete(`/workspaces/${workspaceId}/sources/${sourceId}/destinations/${destinationId}`);
    return { success: true, message: 'Destination deleted successfully' };
  }

  // ==================== TRACKING PLANS (PREMIUM) ====================

  async listTrackingPlans(workspaceId) {
    const response = await this.configClient.get(`/workspaces/${workspaceId}/tracking-plans`);
    return { success: true, trackingPlans: response.data.trackingPlans };
  }

  async getTrackingPlan(workspaceId, trackingPlanId) {
    const response = await this.configClient.get(`/workspaces/${workspaceId}/tracking-plans/${trackingPlanId}`);
    return { success: true, trackingPlan: response.data.trackingPlan };
  }

  async createTrackingPlan(workspaceId, data) {
    const payload = {
      name: data.name,
      ...(data.description && { description: data.description }),
      ...(data.rules && { rules: data.rules })
    };

    const response = await this.configClient.post(`/workspaces/${workspaceId}/tracking-plans`, payload);
    return { success: true, trackingPlan: response.data.trackingPlan };
  }

  async updateTrackingPlan(workspaceId, trackingPlanId, data) {
    const response = await this.configClient.patch(`/workspaces/${workspaceId}/tracking-plans/${trackingPlanId}`, data);
    return { success: true, trackingPlan: response.data.trackingPlan };
  }

  async deleteTrackingPlan(workspaceId, trackingPlanId) {
    await this.configClient.delete(`/workspaces/${workspaceId}/tracking-plans/${trackingPlanId}`);
    return { success: true, message: 'Tracking plan deleted successfully' };
  }

  // ==================== FUNCTIONS (PREMIUM) ====================

  async listFunctions(workspaceId) {
    const response = await this.configClient.get(`/workspaces/${workspaceId}/functions`);
    return { success: true, functions: response.data.functions };
  }

  async getFunction(workspaceId, functionId) {
    const response = await this.configClient.get(`/workspaces/${workspaceId}/functions/${functionId}`);
    return { success: true, function: response.data.function };
  }

  async createFunction(workspaceId, data) {
    const payload = {
      name: data.name,
      code: data.code,
      ...(data.description && { description: data.description }),
      ...(data.settings && { settings: data.settings })
    };

    const response = await this.configClient.post(`/workspaces/${workspaceId}/functions`, payload);
    return { success: true, function: response.data.function };
  }

  async updateFunction(workspaceId, functionId, data) {
    const response = await this.configClient.patch(`/workspaces/${workspaceId}/functions/${functionId}`, data);
    return { success: true, function: response.data.function };
  }

  async deleteFunction(workspaceId, functionId) {
    await this.configClient.delete(`/workspaces/${workspaceId}/functions/${functionId}`);
    return { success: true, message: 'Function deleted successfully' };
  }

  // ==================== WAREHOUSES (PREMIUM) ====================

  async listWarehouses(workspaceId) {
    const response = await this.configClient.get(`/workspaces/${workspaceId}/warehouses`);
    return { success: true, warehouses: response.data.warehouses };
  }

  async getWarehouse(workspaceId, warehouseId) {
    const response = await this.configClient.get(`/workspaces/${workspaceId}/warehouses/${warehouseId}`);
    return { success: true, warehouse: response.data.warehouse };
  }

  async createWarehouse(workspaceId, data) {
    const payload = {
      name: data.name,
      catalogId: data.catalogId,
      ...(data.enabled !== undefined && { enabled: data.enabled }),
      ...(data.settings && { settings: data.settings })
    };

    const response = await this.configClient.post(`/workspaces/${workspaceId}/warehouses`, payload);
    return { success: true, warehouse: response.data.warehouse };
  }

  async updateWarehouse(workspaceId, warehouseId, data) {
    const response = await this.configClient.patch(`/workspaces/${workspaceId}/warehouses/${warehouseId}`, data);
    return { success: true, warehouse: response.data.warehouse };
  }

  async deleteWarehouse(workspaceId, warehouseId) {
    await this.configClient.delete(`/workspaces/${workspaceId}/warehouses/${warehouseId}`);
    return { success: true, message: 'Warehouse deleted successfully' };
  }

  // ==================== TRANSFORMATIONS (PREMIUM) ====================

  async listTransformations(workspaceId) {
    const response = await this.configClient.get(`/workspaces/${workspaceId}/transformations`);
    return { success: true, transformations: response.data.transformations };
  }

  async getTransformation(workspaceId, transformationId) {
    const response = await this.configClient.get(`/workspaces/${workspaceId}/transformations/${transformationId}`);
    return { success: true, transformation: response.data.transformation };
  }

  async createTransformation(workspaceId, data) {
    const payload = {
      name: data.name,
      sourceId: data.sourceId,
      destinationId: data.destinationId,
      code: data.code,
      ...(data.enabled !== undefined && { enabled: data.enabled })
    };

    const response = await this.configClient.post(`/workspaces/${workspaceId}/transformations`, payload);
    return { success: true, transformation: response.data.transformation };
  }

  async updateTransformation(workspaceId, transformationId, data) {
    const response = await this.configClient.patch(`/workspaces/${workspaceId}/transformations/${transformationId}`, data);
    return { success: true, transformation: response.data.transformation };
  }

  async deleteTransformation(workspaceId, transformationId) {
    await this.configClient.delete(`/workspaces/${workspaceId}/transformations/${transformationId}`);
    return { success: true, message: 'Transformation deleted successfully' };
  }

  // ==================== AUDIENCES (PREMIUM) ====================

  async listAudiences(workspaceId) {
    const response = await this.configClient.get(`/workspaces/${workspaceId}/audiences`);
    return { success: true, audiences: response.data.audiences };
  }

  async getAudience(workspaceId, audienceId) {
    const response = await this.configClient.get(`/workspaces/${workspaceId}/audiences/${audienceId}`);
    return { success: true, audience: response.data.audience };
  }

  async createAudience(workspaceId, data) {
    const payload = {
      name: data.name,
      definition: data.definition,
      ...(data.description && { description: data.description })
    };

    const response = await this.configClient.post(`/workspaces/${workspaceId}/audiences`, payload);
    return { success: true, audience: response.data.audience };
  }

  async updateAudience(workspaceId, audienceId, data) {
    const response = await this.configClient.patch(`/workspaces/${workspaceId}/audiences/${audienceId}`, data);
    return { success: true, audience: response.data.audience };
  }

  async deleteAudience(workspaceId, audienceId) {
    await this.configClient.delete(`/workspaces/${workspaceId}/audiences/${audienceId}`);
    return { success: true, message: 'Audience deleted successfully' };
  }

  // ==================== COMPUTED TRAITS (PREMIUM) ====================

  async listComputedTraits(workspaceId) {
    const response = await this.configClient.get(`/workspaces/${workspaceId}/computed-traits`);
    return { success: true, computedTraits: response.data.computedTraits };
  }

  async getComputedTrait(workspaceId, traitId) {
    const response = await this.configClient.get(`/workspaces/${workspaceId}/computed-traits/${traitId}`);
    return { success: true, computedTrait: response.data.computedTrait };
  }

  async createComputedTrait(workspaceId, data) {
    const payload = {
      name: data.name,
      definition: data.definition,
      ...(data.description && { description: data.description })
    };

    const response = await this.configClient.post(`/workspaces/${workspaceId}/computed-traits`, payload);
    return { success: true, computedTrait: response.data.computedTrait };
  }

  async updateComputedTrait(workspaceId, traitId, data) {
    const response = await this.configClient.patch(`/workspaces/${workspaceId}/computed-traits/${traitId}`, data);
    return { success: true, computedTrait: response.data.computedTrait };
  }

  async deleteComputedTrait(workspaceId, traitId) {
    await this.configClient.delete(`/workspaces/${workspaceId}/computed-traits/${traitId}`);
    return { success: true, message: 'Computed trait deleted successfully' };
  }

  // ==================== LABELS (PREMIUM) ====================

  async listLabels(workspaceId) {
    const response = await this.configClient.get(`/workspaces/${workspaceId}/labels`);
    return { success: true, labels: response.data.labels };
  }

  async createLabel(workspaceId, data) {
    const payload = {
      name: data.name,
      ...(data.description && { description: data.description }),
      ...(data.color && { color: data.color })
    };

    const response = await this.configClient.post(`/workspaces/${workspaceId}/labels`, payload);
    return { success: true, label: response.data.label };
  }

  async updateLabel(workspaceId, labelId, data) {
    const response = await this.configClient.patch(`/workspaces/${workspaceId}/labels/${labelId}`, data);
    return { success: true, label: response.data.label };
  }

  async deleteLabel(workspaceId, labelId) {
    await this.configClient.delete(`/workspaces/${workspaceId}/labels/${labelId}`);
    return { success: true, message: 'Label deleted successfully' };
  }

  // ==================== USERS (PREMIUM) ====================

  async listUsers(workspaceId) {
    const response = await this.configClient.get(`/workspaces/${workspaceId}/users`);
    return { success: true, users: response.data.users };
  }

  async inviteUser(workspaceId, data) {
    const payload = {
      email: data.email,
      role: data.role
    };

    const response = await this.configClient.post(`/workspaces/${workspaceId}/users/invite`, payload);
    return { success: true, user: response.data.user };
  }

  async updateUserRole(workspaceId, userId, role) {
    const payload = { role };
    const response = await this.configClient.patch(`/workspaces/${workspaceId}/users/${userId}`, payload);
    return { success: true, user: response.data.user };
  }

  async removeUser(workspaceId, userId) {
    await this.configClient.delete(`/workspaces/${workspaceId}/users/${userId}`);
    return { success: true, message: 'User removed successfully' };
  }

  // ==================== WORKSPACES (PREMIUM) ====================

  async listWorkspaces() {
    const response = await this.configClient.get('/workspaces');
    return { success: true, workspaces: response.data.workspaces };
  }

  async getWorkspace(workspaceId) {
    const response = await this.configClient.get(`/workspaces/${workspaceId}`);
    return { success: true, workspace: response.data.workspace };
  }

  async updateWorkspace(workspaceId, data) {
    const response = await this.configClient.patch(`/workspaces/${workspaceId}`, data);
    return { success: true, workspace: response.data.workspace };
  }
}

module.exports = SegmentAPI;
