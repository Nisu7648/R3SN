/**
 * Sentry Premium API Integration
 * Complete error tracking and performance monitoring
 * PREMIUM FEATURES - FREE ACCESS (normally $26/month)
 */

const axios = require('axios');

class SentryAPI {
  constructor(authToken, organization) {
    this.authToken = authToken || process.env.SENTRY_AUTH_TOKEN;
    this.organization = organization || process.env.SENTRY_ORGANIZATION;
    this.baseURL = 'https://sentry.io/api/0';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // ==================== PROJECTS (PREMIUM) ====================

  async createProject(team, data) {
    const payload = {
      name: data.name,
      slug: data.slug,
      platform: data.platform || 'javascript',
      ...(data.default_rules && { default_rules: data.default_rules })
    };

    const response = await this.client.post(`/teams/${this.organization}/${team}/projects/`, payload);
    return { success: true, project: response.data };
  }

  async getProject(projectSlug) {
    const response = await this.client.get(`/projects/${this.organization}/${projectSlug}/`);
    return { success: true, project: response.data };
  }

  async updateProject(projectSlug, data) {
    const response = await this.client.put(`/projects/${this.organization}/${projectSlug}/`, data);
    return { success: true, project: response.data };
  }

  async deleteProject(projectSlug) {
    await this.client.delete(`/projects/${this.organization}/${projectSlug}/`);
    return { success: true, message: 'Project deleted successfully' };
  }

  async listProjects() {
    const response = await this.client.get(`/organizations/${this.organization}/projects/`);
    return { success: true, projects: response.data };
  }

  async getProjectStats(projectSlug, stat, options = {}) {
    const params = {
      stat,
      ...(options.since && { since: options.since }),
      ...(options.until && { until: options.until }),
      ...(options.resolution && { resolution: options.resolution })
    };

    const response = await this.client.get(`/projects/${this.organization}/${projectSlug}/stats/`, { params });
    return { success: true, stats: response.data };
  }

  // ==================== ISSUES (PREMIUM) ====================

  async listIssues(projectSlug, options = {}) {
    const params = {
      ...(options.statsPeriod && { statsPeriod: options.statsPeriod }),
      ...(options.shortIdLookup && { shortIdLookup: options.shortIdLookup }),
      ...(options.query && { query: options.query }),
      ...(options.sort && { sort: options.sort }),
      ...(options.cursor && { cursor: options.cursor }),
      ...(options.limit && { limit: options.limit })
    };

    const response = await this.client.get(`/projects/${this.organization}/${projectSlug}/issues/`, { params });
    return { success: true, issues: response.data };
  }

  async getIssue(issueId) {
    const response = await this.client.get(`/issues/${issueId}/`);
    return { success: true, issue: response.data };
  }

  async updateIssue(issueId, data) {
    const payload = {
      ...(data.status && { status: data.status }),
      ...(data.assignedTo && { assignedTo: data.assignedTo }),
      ...(data.hasSeen && { hasSeen: data.hasSeen }),
      ...(data.isBookmarked && { isBookmarked: data.isBookmarked }),
      ...(data.isSubscribed && { isSubscribed: data.isSubscribed }),
      ...(data.isPublic && { isPublic: data.isPublic })
    };

    const response = await this.client.put(`/issues/${issueId}/`, payload);
    return { success: true, issue: response.data };
  }

  async deleteIssue(issueId) {
    await this.client.delete(`/issues/${issueId}/`);
    return { success: true, message: 'Issue deleted successfully' };
  }

  async bulkUpdateIssues(data) {
    const payload = {
      ...(data.status && { status: data.status }),
      ...(data.assignedTo && { assignedTo: data.assignedTo }),
      ...(data.hasSeen && { hasSeen: data.hasSeen }),
      ...(data.isBookmarked && { isBookmarked: data.isBookmarked }),
      ...(data.isSubscribed && { isSubscribed: data.isSubscribed }),
      ...(data.isPublic && { isPublic: data.isPublic }),
      ...(data.merge && { merge: data.merge })
    };

    const response = await this.client.put(`/organizations/${this.organization}/issues/`, payload);
    return { success: true, result: response.data };
  }

  async bulkDeleteIssues(issueIds) {
    const params = { id: issueIds };
    await this.client.delete(`/organizations/${this.organization}/issues/`, { params });
    return { success: true, message: 'Issues deleted successfully' };
  }

  async getIssueEvents(issueId, options = {}) {
    const params = {
      ...(options.full && { full: options.full }),
      ...(options.cursor && { cursor: options.cursor })
    };

    const response = await this.client.get(`/issues/${issueId}/events/`, { params });
    return { success: true, events: response.data };
  }

  async getIssueHashes(issueId, options = {}) {
    const params = {
      ...(options.cursor && { cursor: options.cursor }),
      ...(options.limit && { limit: options.limit })
    };

    const response = await this.client.get(`/issues/${issueId}/hashes/`, { params });
    return { success: true, hashes: response.data };
  }

  async getIssueTags(issueId) {
    const response = await this.client.get(`/issues/${issueId}/tags/`);
    return { success: true, tags: response.data };
  }

  // ==================== EVENTS (PREMIUM) ====================

  async getEvent(projectSlug, eventId) {
    const response = await this.client.get(`/projects/${this.organization}/${projectSlug}/events/${eventId}/`);
    return { success: true, event: response.data };
  }

  async listEvents(projectSlug, options = {}) {
    const params = {
      ...(options.full && { full: options.full }),
      ...(options.cursor && { cursor: options.cursor })
    };

    const response = await this.client.get(`/projects/${this.organization}/${projectSlug}/events/`, { params });
    return { success: true, events: response.data };
  }

  // ==================== RELEASES (PREMIUM) ====================

  async createRelease(data) {
    const payload = {
      version: data.version,
      ...(data.ref && { ref: data.ref }),
      ...(data.url && { url: data.url }),
      ...(data.projects && { projects: data.projects }),
      ...(data.dateReleased && { dateReleased: data.dateReleased }),
      ...(data.commits && { commits: data.commits }),
      ...(data.refs && { refs: data.refs })
    };

    const response = await this.client.post(`/organizations/${this.organization}/releases/`, payload);
    return { success: true, release: response.data };
  }

  async getRelease(version) {
    const response = await this.client.get(`/organizations/${this.organization}/releases/${version}/`);
    return { success: true, release: response.data };
  }

  async updateRelease(version, data) {
    const response = await this.client.put(`/organizations/${this.organization}/releases/${version}/`, data);
    return { success: true, release: response.data };
  }

  async deleteRelease(version) {
    await this.client.delete(`/organizations/${this.organization}/releases/${version}/`);
    return { success: true, message: 'Release deleted successfully' };
  }

  async listReleases(options = {}) {
    const params = {
      ...(options.query && { query: options.query }),
      ...(options.cursor && { cursor: options.cursor })
    };

    const response = await this.client.get(`/organizations/${this.organization}/releases/`, { params });
    return { success: true, releases: response.data };
  }

  async createDeploy(version, data) {
    const payload = {
      environment: data.environment,
      ...(data.name && { name: data.name }),
      ...(data.url && { url: data.url }),
      ...(data.dateStarted && { dateStarted: data.dateStarted }),
      ...(data.dateFinished && { dateFinished: data.dateFinished })
    };

    const response = await this.client.post(`/organizations/${this.organization}/releases/${version}/deploys/`, payload);
    return { success: true, deploy: response.data };
  }

  async listDeploys(version) {
    const response = await this.client.get(`/organizations/${this.organization}/releases/${version}/deploys/`);
    return { success: true, deploys: response.data };
  }

  async uploadSourceMaps(version, files) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('file', file.content, file.name);
    });

    const response = await this.client.post(
      `/organizations/${this.organization}/releases/${version}/files/`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return { success: true, files: response.data };
  }

  // ==================== TEAMS (PREMIUM) ====================

  async createTeam(data) {
    const payload = {
      name: data.name,
      slug: data.slug
    };

    const response = await this.client.post(`/organizations/${this.organization}/teams/`, payload);
    return { success: true, team: response.data };
  }

  async getTeam(teamSlug) {
    const response = await this.client.get(`/teams/${this.organization}/${teamSlug}/`);
    return { success: true, team: response.data };
  }

  async updateTeam(teamSlug, data) {
    const response = await this.client.put(`/teams/${this.organization}/${teamSlug}/`, data);
    return { success: true, team: response.data };
  }

  async deleteTeam(teamSlug) {
    await this.client.delete(`/teams/${this.organization}/${teamSlug}/`);
    return { success: true, message: 'Team deleted successfully' };
  }

  async listTeams() {
    const response = await this.client.get(`/organizations/${this.organization}/teams/`);
    return { success: true, teams: response.data };
  }

  // ==================== MEMBERS (PREMIUM) ====================

  async listMembers() {
    const response = await this.client.get(`/organizations/${this.organization}/members/`);
    return { success: true, members: response.data };
  }

  async getMember(memberId) {
    const response = await this.client.get(`/organizations/${this.organization}/members/${memberId}/`);
    return { success: true, member: response.data };
  }

  async updateMember(memberId, data) {
    const response = await this.client.put(`/organizations/${this.organization}/members/${memberId}/`, data);
    return { success: true, member: response.data };
  }

  async deleteMember(memberId) {
    await this.client.delete(`/organizations/${this.organization}/members/${memberId}/`);
    return { success: true, message: 'Member removed successfully' };
  }

  // ==================== ALERTS (PREMIUM) ====================

  async createAlertRule(projectSlug, data) {
    const payload = {
      name: data.name,
      conditions: data.conditions,
      actions: data.actions,
      actionMatch: data.actionMatch || 'all',
      frequency: data.frequency || 30,
      ...(data.environment && { environment: data.environment })
    };

    const response = await this.client.post(`/projects/${this.organization}/${projectSlug}/rules/`, payload);
    return { success: true, rule: response.data };
  }

  async getAlertRule(projectSlug, ruleId) {
    const response = await this.client.get(`/projects/${this.organization}/${projectSlug}/rules/${ruleId}/`);
    return { success: true, rule: response.data };
  }

  async updateAlertRule(projectSlug, ruleId, data) {
    const response = await this.client.put(`/projects/${this.organization}/${projectSlug}/rules/${ruleId}/`, data);
    return { success: true, rule: response.data };
  }

  async deleteAlertRule(projectSlug, ruleId) {
    await this.client.delete(`/projects/${this.organization}/${projectSlug}/rules/${ruleId}/`);
    return { success: true, message: 'Alert rule deleted successfully' };
  }

  async listAlertRules(projectSlug) {
    const response = await this.client.get(`/projects/${this.organization}/${projectSlug}/rules/`);
    return { success: true, rules: response.data };
  }

  // ==================== MONITORS (PREMIUM) ====================

  async createMonitor(data) {
    const payload = {
      name: data.name,
      type: data.type,
      config: data.config,
      ...(data.project && { project: data.project }),
      ...(data.environment && { environment: data.environment })
    };

    const response = await this.client.post(`/organizations/${this.organization}/monitors/`, payload);
    return { success: true, monitor: response.data };
  }

  async getMonitor(monitorId) {
    const response = await this.client.get(`/organizations/${this.organization}/monitors/${monitorId}/`);
    return { success: true, monitor: response.data };
  }

  async updateMonitor(monitorId, data) {
    const response = await this.client.put(`/organizations/${this.organization}/monitors/${monitorId}/`, data);
    return { success: true, monitor: response.data };
  }

  async deleteMonitor(monitorId) {
    await this.client.delete(`/organizations/${this.organization}/monitors/${monitorId}/`);
    return { success: true, message: 'Monitor deleted successfully' };
  }

  async listMonitors(options = {}) {
    const params = {
      ...(options.project && { project: options.project }),
      ...(options.environment && { environment: options.environment })
    };

    const response = await this.client.get(`/organizations/${this.organization}/monitors/`, { params });
    return { success: true, monitors: response.data };
  }

  async checkInMonitor(monitorId, data) {
    const payload = {
      status: data.status,
      ...(data.duration && { duration: data.duration }),
      ...(data.environment && { environment: data.environment })
    };

    const response = await this.client.post(`/organizations/${this.organization}/monitors/${monitorId}/checkins/`, payload);
    return { success: true, checkin: response.data };
  }

  // ==================== PERFORMANCE (PREMIUM) ====================

  async getTransactionStats(projectSlug, options = {}) {
    const params = {
      ...(options.statsPeriod && { statsPeriod: options.statsPeriod }),
      ...(options.query && { query: options.query }),
      ...(options.field && { field: options.field }),
      ...(options.orderby && { orderby: options.orderby })
    };

    const response = await this.client.get(`/organizations/${this.organization}/events-stats/`, { params });
    return { success: true, stats: response.data };
  }

  async getTransactionSummary(projectSlug, transactionName, options = {}) {
    const params = {
      project: projectSlug,
      transaction: transactionName,
      ...(options.statsPeriod && { statsPeriod: options.statsPeriod })
    };

    const response = await this.client.get(`/organizations/${this.organization}/events/`, { params });
    return { success: true, summary: response.data };
  }

  // ==================== DISCOVER (PREMIUM) ====================

  async discoverQuery(data) {
    const payload = {
      projects: data.projects,
      field: data.fields,
      ...(data.query && { query: data.query }),
      ...(data.sort && { sort: data.sort }),
      ...(data.statsPeriod && { statsPeriod: data.statsPeriod }),
      ...(data.start && { start: data.start }),
      ...(data.end && { end: data.end }),
      ...(data.limit && { limit: data.limit })
    };

    const response = await this.client.post(`/organizations/${this.organization}/eventsv2/`, payload);
    return { success: true, results: response.data };
  }

  // ==================== INTEGRATIONS (PREMIUM) ====================

  async listIntegrations() {
    const response = await this.client.get(`/organizations/${this.organization}/integrations/`);
    return { success: true, integrations: response.data };
  }

  async getIntegration(integrationId) {
    const response = await this.client.get(`/organizations/${this.organization}/integrations/${integrationId}/`);
    return { success: true, integration: response.data };
  }

  async updateIntegration(integrationId, data) {
    const response = await this.client.put(`/organizations/${this.organization}/integrations/${integrationId}/`, data);
    return { success: true, integration: response.data };
  }

  async deleteIntegration(integrationId) {
    await this.client.delete(`/organizations/${this.organization}/integrations/${integrationId}/`);
    return { success: true, message: 'Integration deleted successfully' };
  }

  // ==================== REPOSITORIES (PREMIUM) ====================

  async listRepositories() {
    const response = await this.client.get(`/organizations/${this.organization}/repos/`);
    return { success: true, repositories: response.data };
  }

  async getRepository(repoId) {
    const response = await this.client.get(`/organizations/${this.organization}/repos/${repoId}/`);
    return { success: true, repository: response.data };
  }

  // ==================== DASHBOARDS (PREMIUM) ====================

  async createDashboard(data) {
    const payload = {
      title: data.title,
      ...(data.widgets && { widgets: data.widgets }),
      ...(data.projects && { projects: data.projects })
    };

    const response = await this.client.post(`/organizations/${this.organization}/dashboards/`, payload);
    return { success: true, dashboard: response.data };
  }

  async getDashboard(dashboardId) {
    const response = await this.client.get(`/organizations/${this.organization}/dashboards/${dashboardId}/`);
    return { success: true, dashboard: response.data };
  }

  async updateDashboard(dashboardId, data) {
    const response = await this.client.put(`/organizations/${this.organization}/dashboards/${dashboardId}/`, data);
    return { success: true, dashboard: response.data };
  }

  async deleteDashboard(dashboardId) {
    await this.client.delete(`/organizations/${this.organization}/dashboards/${dashboardId}/`);
    return { success: true, message: 'Dashboard deleted successfully' };
  }

  async listDashboards() {
    const response = await this.client.get(`/organizations/${this.organization}/dashboards/`);
    return { success: true, dashboards: response.data };
  }

  // ==================== ENVIRONMENTS (PREMIUM) ====================

  async listEnvironments(projectSlug) {
    const response = await this.client.get(`/projects/${this.organization}/${projectSlug}/environments/`);
    return { success: true, environments: response.data };
  }

  async getEnvironment(projectSlug, environmentName) {
    const response = await this.client.get(`/projects/${this.organization}/${projectSlug}/environments/${environmentName}/`);
    return { success: true, environment: response.data };
  }

  async updateEnvironment(projectSlug, environmentName, data) {
    const response = await this.client.put(`/projects/${this.organization}/${projectSlug}/environments/${environmentName}/`, data);
    return { success: true, environment: response.data };
  }

  // ==================== KEYS (PREMIUM) ====================

  async listProjectKeys(projectSlug) {
    const response = await this.client.get(`/projects/${this.organization}/${projectSlug}/keys/`);
    return { success: true, keys: response.data };
  }

  async createProjectKey(projectSlug, data) {
    const payload = {
      name: data.name,
      ...(data.rateLimit && { rateLimit: data.rateLimit })
    };

    const response = await this.client.post(`/projects/${this.organization}/${projectSlug}/keys/`, payload);
    return { success: true, key: response.data };
  }

  async updateProjectKey(projectSlug, keyId, data) {
    const response = await this.client.put(`/projects/${this.organization}/${projectSlug}/keys/${keyId}/`, data);
    return { success: true, key: response.data };
  }

  async deleteProjectKey(projectSlug, keyId) {
    await this.client.delete(`/projects/${this.organization}/${projectSlug}/keys/${keyId}/`);
    return { success: true, message: 'Project key deleted successfully' };
  }
}

module.exports = SentryAPI;
