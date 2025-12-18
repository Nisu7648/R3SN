/**
 * LaunchDarkly Premium API Integration
 * Complete feature flag management and experimentation platform
 * PREMIUM FEATURES - FREE ACCESS (normally $75/month)
 */

const axios = require('axios');

class LaunchDarklyAPI {
  constructor(apiToken) {
    this.apiToken = apiToken || process.env.LAUNCHDARKLY_API_TOKEN;
    this.baseURL = 'https://app.launchdarkly.com/api/v2';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': this.apiToken,
        'Content-Type': 'application/json'
      }
    });
  }

  // ==================== FEATURE FLAGS (PREMIUM) ====================

  async createFeatureFlag(projectKey, data) {
    const payload = {
      name: data.name,
      key: data.key,
      ...(data.description && { description: data.description }),
      ...(data.variations && { variations: data.variations }),
      ...(data.temporary && { temporary: data.temporary }),
      ...(data.tags && { tags: data.tags }),
      ...(data.includeInSnippet && { includeInSnippet: data.includeInSnippet }),
      ...(data.clientSideAvailability && { clientSideAvailability: data.clientSideAvailability }),
      ...(data.defaults && { defaults: data.defaults })
    };

    const response = await this.client.post(`/flags/${projectKey}`, payload);
    return { success: true, flag: response.data };
  }

  async getFeatureFlag(projectKey, flagKey, env = null) {
    const url = env 
      ? `/flags/${projectKey}/${flagKey}?env=${env}`
      : `/flags/${projectKey}/${flagKey}`;

    const response = await this.client.get(url);
    return { success: true, flag: response.data };
  }

  async updateFeatureFlag(projectKey, flagKey, patch) {
    const response = await this.client.patch(`/flags/${projectKey}/${flagKey}`, patch, {
      headers: { 'Content-Type': 'application/json; domain-model=launchdarkly.semanticpatch' }
    });
    return { success: true, flag: response.data };
  }

  async deleteFeatureFlag(projectKey, flagKey) {
    await this.client.delete(`/flags/${projectKey}/${flagKey}`);
    return { success: true, message: 'Feature flag deleted successfully' };
  }

  async listFeatureFlags(projectKey, options = {}) {
    const params = {
      ...(options.env && { env: options.env }),
      ...(options.tag && { tag: options.tag }),
      ...(options.limit && { limit: options.limit }),
      ...(options.offset && { offset: options.offset }),
      ...(options.archived && { archived: options.archived }),
      ...(options.summary && { summary: options.summary }),
      ...(options.filter && { filter: options.filter }),
      ...(options.sort && { sort: options.sort })
    };

    const response = await this.client.get(`/flags/${projectKey}`, { params });
    return { success: true, flags: response.data.items };
  }

  async copyFeatureFlag(projectKey, flagKey, data) {
    const payload = {
      source: data.source,
      target: data.target,
      ...(data.comment && { comment: data.comment }),
      ...(data.includedActions && { includedActions: data.includedActions }),
      ...(data.excludedActions && { excludedActions: data.excludedActions })
    };

    const response = await this.client.post(`/flags/${projectKey}/${flagKey}/copy`, payload);
    return { success: true, flag: response.data };
  }

  // ==================== FLAG TARGETING (PREMIUM) ====================

  async updateFlagTargeting(projectKey, envKey, flagKey, data) {
    const payload = {
      ...(data.on !== undefined && { on: data.on }),
      ...(data.targets && { targets: data.targets }),
      ...(data.rules && { rules: data.rules }),
      ...(data.fallthrough && { fallthrough: data.fallthrough }),
      ...(data.offVariation !== undefined && { offVariation: data.offVariation }),
      ...(data.prerequisites && { prerequisites: data.prerequisites }),
      ...(data.contextKind && { contextKind: data.contextKind })
    };

    const response = await this.client.put(`/flags/${projectKey}/${flagKey}/targeting/${envKey}`, payload);
    return { success: true, targeting: response.data };
  }

  async getFlagStatus(projectKey, envKey, flagKey) {
    const response = await this.client.get(`/flag-statuses/${projectKey}/${envKey}/${flagKey}`);
    return { success: true, status: response.data };
  }

  async getFlagStatusAcrossEnvironments(projectKey, flagKey) {
    const response = await this.client.get(`/flag-status/${projectKey}/${flagKey}`);
    return { success: true, statuses: response.data };
  }

  // ==================== PROJECTS (PREMIUM) ====================

  async createProject(data) {
    const payload = {
      name: data.name,
      key: data.key,
      ...(data.tags && { tags: data.tags }),
      ...(data.includeInSnippetByDefault && { includeInSnippetByDefault: data.includeInSnippetByDefault })
    };

    const response = await this.client.post('/projects', payload);
    return { success: true, project: response.data };
  }

  async getProject(projectKey) {
    const response = await this.client.get(`/projects/${projectKey}`);
    return { success: true, project: response.data };
  }

  async updateProject(projectKey, patch) {
    const response = await this.client.patch(`/projects/${projectKey}`, patch);
    return { success: true, project: response.data };
  }

  async deleteProject(projectKey) {
    await this.client.delete(`/projects/${projectKey}`);
    return { success: true, message: 'Project deleted successfully' };
  }

  async listProjects(options = {}) {
    const params = {
      ...(options.limit && { limit: options.limit }),
      ...(options.offset && { offset: options.offset })
    };

    const response = await this.client.get('/projects', { params });
    return { success: true, projects: response.data.items };
  }

  // ==================== ENVIRONMENTS (PREMIUM) ====================

  async createEnvironment(projectKey, data) {
    const payload = {
      name: data.name,
      key: data.key,
      color: data.color,
      ...(data.tags && { tags: data.tags }),
      ...(data.defaultTtl && { defaultTtl: data.defaultTtl }),
      ...(data.secureMode && { secureMode: data.secureMode }),
      ...(data.defaultTrackEvents && { defaultTrackEvents: data.defaultTrackEvents }),
      ...(data.confirmChanges && { confirmChanges: data.confirmChanges }),
      ...(data.requireComments && { requireComments: data.requireComments })
    };

    const response = await this.client.post(`/projects/${projectKey}/environments`, payload);
    return { success: true, environment: response.data };
  }

  async getEnvironment(projectKey, envKey) {
    const response = await this.client.get(`/projects/${projectKey}/environments/${envKey}`);
    return { success: true, environment: response.data };
  }

  async updateEnvironment(projectKey, envKey, patch) {
    const response = await this.client.patch(`/projects/${projectKey}/environments/${envKey}`, patch);
    return { success: true, environment: response.data };
  }

  async deleteEnvironment(projectKey, envKey) {
    await this.client.delete(`/projects/${projectKey}/environments/${envKey}`);
    return { success: true, message: 'Environment deleted successfully' };
  }

  async resetEnvironmentSDKKey(projectKey, envKey) {
    const response = await this.client.post(`/projects/${projectKey}/environments/${envKey}/apiKey`);
    return { success: true, environment: response.data };
  }

  async resetEnvironmentMobileKey(projectKey, envKey) {
    const response = await this.client.post(`/projects/${projectKey}/environments/${envKey}/mobileKey`);
    return { success: true, environment: response.data };
  }

  // ==================== SEGMENTS (PREMIUM) ====================

  async createSegment(projectKey, envKey, data) {
    const payload = {
      name: data.name,
      key: data.key,
      ...(data.description && { description: data.description }),
      ...(data.tags && { tags: data.tags }),
      ...(data.rules && { rules: data.rules }),
      ...(data.unbounded && { unbounded: data.unbounded })
    };

    const response = await this.client.post(`/segments/${projectKey}/${envKey}`, payload);
    return { success: true, segment: response.data };
  }

  async getSegment(projectKey, envKey, segmentKey) {
    const response = await this.client.get(`/segments/${projectKey}/${envKey}/${segmentKey}`);
    return { success: true, segment: response.data };
  }

  async updateSegment(projectKey, envKey, segmentKey, patch) {
    const response = await this.client.patch(`/segments/${projectKey}/${envKey}/${segmentKey}`, patch);
    return { success: true, segment: response.data };
  }

  async deleteSegment(projectKey, envKey, segmentKey) {
    await this.client.delete(`/segments/${projectKey}/${envKey}/${segmentKey}`);
    return { success: true, message: 'Segment deleted successfully' };
  }

  async listSegments(projectKey, envKey, options = {}) {
    const params = {
      ...(options.limit && { limit: options.limit }),
      ...(options.offset && { offset: options.offset })
    };

    const response = await this.client.get(`/segments/${projectKey}/${envKey}`, { params });
    return { success: true, segments: response.data.items };
  }

  // ==================== USERS (PREMIUM) ====================

  async getUser(projectKey, envKey, userKey) {
    const response = await this.client.get(`/users/${projectKey}/${envKey}/${userKey}`);
    return { success: true, user: response.data };
  }

  async listUsers(projectKey, envKey, options = {}) {
    const params = {
      ...(options.limit && { limit: options.limit }),
      ...(options.searchAfter && { searchAfter: options.searchAfter })
    };

    const response = await this.client.get(`/users/${projectKey}/${envKey}`, { params });
    return { success: true, users: response.data.items };
  }

  async searchUsers(projectKey, envKey, query, options = {}) {
    const params = {
      q: query,
      ...(options.limit && { limit: options.limit }),
      ...(options.offset && { offset: options.offset }),
      ...(options.after && { after: options.after }),
      ...(options.sort && { sort: options.sort })
    };

    const response = await this.client.get(`/user-search/${projectKey}/${envKey}`, { params });
    return { success: true, users: response.data.items };
  }

  async deleteUser(projectKey, envKey, userKey) {
    await this.client.delete(`/users/${projectKey}/${envKey}/${userKey}`);
    return { success: true, message: 'User deleted successfully' };
  }

  // ==================== METRICS (PREMIUM) ====================

  async createMetric(projectKey, data) {
    const payload = {
      key: data.key,
      name: data.name,
      kind: data.kind,
      ...(data.description && { description: data.description }),
      ...(data.tags && { tags: data.tags }),
      ...(data.isNumeric && { isNumeric: data.isNumeric }),
      ...(data.successCriteria && { successCriteria: data.successCriteria }),
      ...(data.unit && { unit: data.unit }),
      ...(data.eventKey && { eventKey: data.eventKey })
    };

    const response = await this.client.post(`/metrics/${projectKey}`, payload);
    return { success: true, metric: response.data };
  }

  async getMetric(projectKey, metricKey) {
    const response = await this.client.get(`/metrics/${projectKey}/${metricKey}`);
    return { success: true, metric: response.data };
  }

  async updateMetric(projectKey, metricKey, patch) {
    const response = await this.client.patch(`/metrics/${projectKey}/${metricKey}`, patch);
    return { success: true, metric: response.data };
  }

  async deleteMetric(projectKey, metricKey) {
    await this.client.delete(`/metrics/${projectKey}/${metricKey}`);
    return { success: true, message: 'Metric deleted successfully' };
  }

  async listMetrics(projectKey, options = {}) {
    const params = {
      ...(options.limit && { limit: options.limit }),
      ...(options.offset && { offset: options.offset })
    };

    const response = await this.client.get(`/metrics/${projectKey}`, { params });
    return { success: true, metrics: response.data.items };
  }

  // ==================== EXPERIMENTS (PREMIUM) ====================

  async createExperiment(projectKey, envKey, data) {
    const payload = {
      name: data.name,
      key: data.key,
      iteration: data.iteration,
      ...(data.description && { description: data.description }),
      ...(data.maintainerId && { maintainerId: data.maintainerId }),
      ...(data.metrics && { metrics: data.metrics })
    };

    const response = await this.client.post(`/projects/${projectKey}/environments/${envKey}/experiments`, payload);
    return { success: true, experiment: response.data };
  }

  async getExperiment(projectKey, envKey, experimentKey) {
    const response = await this.client.get(`/projects/${projectKey}/environments/${envKey}/experiments/${experimentKey}`);
    return { success: true, experiment: response.data };
  }

  async updateExperiment(projectKey, envKey, experimentKey, patch) {
    const response = await this.client.patch(`/projects/${projectKey}/environments/${envKey}/experiments/${experimentKey}`, patch);
    return { success: true, experiment: response.data };
  }

  async deleteExperiment(projectKey, envKey, experimentKey) {
    await this.client.delete(`/projects/${projectKey}/environments/${envKey}/experiments/${experimentKey}`);
    return { success: true, message: 'Experiment deleted successfully' };
  }

  async listExperiments(projectKey, envKey, options = {}) {
    const params = {
      ...(options.limit && { limit: options.limit }),
      ...(options.offset && { offset: options.offset })
    };

    const response = await this.client.get(`/projects/${projectKey}/environments/${envKey}/experiments`, { params });
    return { success: true, experiments: response.data.items };
  }

  async getExperimentResults(projectKey, envKey, experimentKey, metricKey) {
    const response = await this.client.get(`/projects/${projectKey}/environments/${envKey}/experiments/${experimentKey}/metrics/${metricKey}/results`);
    return { success: true, results: response.data };
  }

  // ==================== MEMBERS (PREMIUM) ====================

  async inviteMember(data) {
    const payload = {
      email: data.email,
      role: data.role,
      ...(data.customRoles && { customRoles: data.customRoles }),
      ...(data.teamKeys && { teamKeys: data.teamKeys })
    };

    const response = await this.client.post('/members', payload);
    return { success: true, member: response.data };
  }

  async getMember(memberId) {
    const response = await this.client.get(`/members/${memberId}`);
    return { success: true, member: response.data };
  }

  async updateMember(memberId, patch) {
    const response = await this.client.patch(`/members/${memberId}`, patch);
    return { success: true, member: response.data };
  }

  async deleteMember(memberId) {
    await this.client.delete(`/members/${memberId}`);
    return { success: true, message: 'Member deleted successfully' };
  }

  async listMembers(options = {}) {
    const params = {
      ...(options.limit && { limit: options.limit }),
      ...(options.offset && { offset: options.offset }),
      ...(options.filter && { filter: options.filter })
    };

    const response = await this.client.get('/members', { params });
    return { success: true, members: response.data.items };
  }

  // ==================== TEAMS (PREMIUM) ====================

  async createTeam(data) {
    const payload = {
      name: data.name,
      key: data.key,
      ...(data.description && { description: data.description }),
      ...(data.customRoleKeys && { customRoleKeys: data.customRoleKeys }),
      ...(data.memberIDs && { memberIDs: data.memberIDs })
    };

    const response = await this.client.post('/teams', payload);
    return { success: true, team: response.data };
  }

  async getTeam(teamKey) {
    const response = await this.client.get(`/teams/${teamKey}`);
    return { success: true, team: response.data };
  }

  async updateTeam(teamKey, patch) {
    const response = await this.client.patch(`/teams/${teamKey}`, patch);
    return { success: true, team: response.data };
  }

  async deleteTeam(teamKey) {
    await this.client.delete(`/teams/${teamKey}`);
    return { success: true, message: 'Team deleted successfully' };
  }

  async listTeams(options = {}) {
    const params = {
      ...(options.limit && { limit: options.limit }),
      ...(options.offset && { offset: options.offset })
    };

    const response = await this.client.get('/teams', { params });
    return { success: true, teams: response.data.items };
  }

  // ==================== CUSTOM ROLES (PREMIUM) ====================

  async createCustomRole(data) {
    const payload = {
      name: data.name,
      key: data.key,
      ...(data.description && { description: data.description }),
      ...(data.policy && { policy: data.policy })
    };

    const response = await this.client.post('/roles', payload);
    return { success: true, role: response.data };
  }

  async getCustomRole(roleKey) {
    const response = await this.client.get(`/roles/${roleKey}`);
    return { success: true, role: response.data };
  }

  async updateCustomRole(roleKey, patch) {
    const response = await this.client.patch(`/roles/${roleKey}`, patch);
    return { success: true, role: response.data };
  }

  async deleteCustomRole(roleKey) {
    await this.client.delete(`/roles/${roleKey}`);
    return { success: true, message: 'Custom role deleted successfully' };
  }

  async listCustomRoles(options = {}) {
    const params = {
      ...(options.limit && { limit: options.limit }),
      ...(options.offset && { offset: options.offset })
    };

    const response = await this.client.get('/roles', { params });
    return { success: true, roles: response.data.items };
  }

  // ==================== WEBHOOKS (PREMIUM) ====================

  async createWebhook(data) {
    const payload = {
      url: data.url,
      sign: data.sign || false,
      on: data.on || true,
      ...(data.name && { name: data.name }),
      ...(data.statements && { statements: data.statements }),
      ...(data.tags && { tags: data.tags }),
      ...(data.secret && { secret: data.secret })
    };

    const response = await this.client.post('/webhooks', payload);
    return { success: true, webhook: response.data };
  }

  async getWebhook(webhookId) {
    const response = await this.client.get(`/webhooks/${webhookId}`);
    return { success: true, webhook: response.data };
  }

  async updateWebhook(webhookId, patch) {
    const response = await this.client.patch(`/webhooks/${webhookId}`, patch);
    return { success: true, webhook: response.data };
  }

  async deleteWebhook(webhookId) {
    await this.client.delete(`/webhooks/${webhookId}`);
    return { success: true, message: 'Webhook deleted successfully' };
  }

  async listWebhooks(options = {}) {
    const params = {
      ...(options.limit && { limit: options.limit }),
      ...(options.offset && { offset: options.offset })
    };

    const response = await this.client.get('/webhooks', { params });
    return { success: true, webhooks: response.data.items };
  }

  // ==================== AUDIT LOG (PREMIUM) ====================

  async getAuditLog(options = {}) {
    const params = {
      ...(options.before && { before: options.before }),
      ...(options.after && { after: options.after }),
      ...(options.q && { q: options.q }),
      ...(options.limit && { limit: options.limit }),
      ...(options.spec && { spec: options.spec })
    };

    const response = await this.client.get('/auditlog', { params });
    return { success: true, entries: response.data.items };
  }

  async getAuditLogEntry(entryId) {
    const response = await this.client.get(`/auditlog/${entryId}`);
    return { success: true, entry: response.data };
  }

  // ==================== INTEGRATIONS (PREMIUM) ====================

  async listIntegrations() {
    const response = await this.client.get('/integrations');
    return { success: true, integrations: response.data.items };
  }

  async getIntegration(integrationKey) {
    const response = await this.client.get(`/integrations/${integrationKey}`);
    return { success: true, integration: response.data };
  }

  // ==================== RELAY PROXY (PREMIUM) ====================

  async createRelayProxyConfig(data) {
    const payload = {
      name: data.name,
      policy: data.policy
    };

    const response = await this.client.post('/relay-auto-configs', payload);
    return { success: true, config: response.data };
  }

  async getRelayProxyConfig(configId) {
    const response = await this.client.get(`/relay-auto-configs/${configId}`);
    return { success: true, config: response.data };
  }

  async updateRelayProxyConfig(configId, patch) {
    const response = await this.client.patch(`/relay-auto-configs/${configId}`, patch);
    return { success: true, config: response.data };
  }

  async deleteRelayProxyConfig(configId) {
    await this.client.delete(`/relay-auto-configs/${configId}`);
    return { success: true, message: 'Relay proxy config deleted successfully' };
  }

  async listRelayProxyConfigs() {
    const response = await this.client.get('/relay-auto-configs');
    return { success: true, configs: response.data.items };
  }

  async resetRelayProxyConfigKey(configId) {
    const response = await this.client.post(`/relay-auto-configs/${configId}/reset`);
    return { success: true, config: response.data };
  }
}

module.exports = LaunchDarklyAPI;
