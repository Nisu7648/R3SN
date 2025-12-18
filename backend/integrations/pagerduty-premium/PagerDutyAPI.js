/**
 * PagerDuty Premium API Integration
 * Complete incident management and on-call scheduling
 * PREMIUM FEATURES - FREE ACCESS (normally $21/user/month)
 */

const axios = require('axios');

class PagerDutyAPI {
  constructor(apiToken, email) {
    this.apiToken = apiToken || process.env.PAGERDUTY_API_TOKEN;
    this.email = email || process.env.PAGERDUTY_EMAIL;
    this.baseURL = 'https://api.pagerduty.com';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Token token=${this.apiToken}`,
        'Accept': 'application/vnd.pagerduty+json;version=2',
        'Content-Type': 'application/json',
        'From': this.email
      }
    });
  }

  // ==================== INCIDENTS (PREMIUM) ====================

  async createIncident(data) {
    const payload = {
      incident: {
        type: 'incident',
        title: data.title,
        service: {
          id: data.service_id,
          type: 'service_reference'
        },
        ...(data.urgency && { urgency: data.urgency }),
        ...(data.incident_key && { incident_key: data.incident_key }),
        ...(data.body && { body: data.body }),
        ...(data.escalation_policy && { escalation_policy: data.escalation_policy }),
        ...(data.assignments && { assignments: data.assignments }),
        ...(data.priority && { priority: data.priority })
      }
    };

    const response = await this.client.post('/incidents', payload);
    return { success: true, incident: response.data.incident };
  }

  async getIncident(incidentId, options = {}) {
    const params = {
      ...(options.include && { include: options.include })
    };

    const response = await this.client.get(`/incidents/${incidentId}`, { params });
    return { success: true, incident: response.data.incident };
  }

  async updateIncident(incidentId, data) {
    const payload = {
      incident: data
    };

    const response = await this.client.put(`/incidents/${incidentId}`, payload);
    return { success: true, incident: response.data.incident };
  }

  async listIncidents(options = {}) {
    const params = {
      ...(options.limit && { limit: options.limit }),
      ...(options.offset && { offset: options.offset }),
      ...(options.total && { total: options.total }),
      ...(options.time_zone && { time_zone: options.time_zone }),
      ...(options.statuses && { 'statuses[]': options.statuses }),
      ...(options.incident_key && { incident_key: options.incident_key }),
      ...(options.service_ids && { 'service_ids[]': options.service_ids }),
      ...(options.team_ids && { 'team_ids[]': options.team_ids }),
      ...(options.user_ids && { 'user_ids[]': options.user_ids }),
      ...(options.urgencies && { 'urgencies[]': options.urgencies }),
      ...(options.since && { since: options.since }),
      ...(options.until && { until: options.until }),
      ...(options.date_range && { date_range: options.date_range }),
      ...(options.sort_by && { sort_by: options.sort_by }),
      ...(options.include && { 'include[]': options.include })
    };

    const response = await this.client.get('/incidents', { params });
    return { 
      success: true, 
      incidents: response.data.incidents,
      more: response.data.more,
      total: response.data.total
    };
  }

  async mergeIncidents(incidentId, sourceIncidentIds) {
    const payload = {
      source_incidents: sourceIncidentIds.map(id => ({
        id,
        type: 'incident_reference'
      }))
    };

    const response = await this.client.put(`/incidents/${incidentId}/merge`, payload);
    return { success: true, incident: response.data.incident };
  }

  async snoozeIncident(incidentId, duration) {
    const payload = {
      duration
    };

    const response = await this.client.post(`/incidents/${incidentId}/snooze`, payload);
    return { success: true, incident: response.data.incident };
  }

  async createIncidentNote(incidentId, content) {
    const payload = {
      note: {
        content
      }
    };

    const response = await this.client.post(`/incidents/${incidentId}/notes`, payload);
    return { success: true, note: response.data.note };
  }

  async listIncidentNotes(incidentId) {
    const response = await this.client.get(`/incidents/${incidentId}/notes`);
    return { success: true, notes: response.data.notes };
  }

  async listIncidentAlerts(incidentId, options = {}) {
    const params = {
      ...(options.limit && { limit: options.limit }),
      ...(options.offset && { offset: options.offset }),
      ...(options.statuses && { 'statuses[]': options.statuses })
    };

    const response = await this.client.get(`/incidents/${incidentId}/alerts`, { params });
    return { success: true, alerts: response.data.alerts };
  }

  async manageIncidentAlerts(incidentId, alertIds, action) {
    const payload = {
      alerts: alertIds.map(id => ({
        id,
        type: 'alert_reference',
        status: action
      }))
    };

    const response = await this.client.put(`/incidents/${incidentId}/alerts`, payload);
    return { success: true, alerts: response.data.alerts };
  }

  // ==================== SERVICES (PREMIUM) ====================

  async createService(data) {
    const payload = {
      service: {
        type: 'service',
        name: data.name,
        ...(data.description && { description: data.description }),
        ...(data.auto_resolve_timeout && { auto_resolve_timeout: data.auto_resolve_timeout }),
        ...(data.acknowledgement_timeout && { acknowledgement_timeout: data.acknowledgement_timeout }),
        ...(data.status && { status: data.status }),
        ...(data.escalation_policy && { escalation_policy: data.escalation_policy }),
        ...(data.incident_urgency_rule && { incident_urgency_rule: data.incident_urgency_rule }),
        ...(data.support_hours && { support_hours: data.support_hours }),
        ...(data.scheduled_actions && { scheduled_actions: data.scheduled_actions }),
        ...(data.alert_creation && { alert_creation: data.alert_creation }),
        ...(data.alert_grouping_parameters && { alert_grouping_parameters: data.alert_grouping_parameters })
      }
    };

    const response = await this.client.post('/services', payload);
    return { success: true, service: response.data.service };
  }

  async getService(serviceId, options = {}) {
    const params = {
      ...(options.include && { 'include[]': options.include })
    };

    const response = await this.client.get(`/services/${serviceId}`, { params });
    return { success: true, service: response.data.service };
  }

  async updateService(serviceId, data) {
    const payload = {
      service: data
    };

    const response = await this.client.put(`/services/${serviceId}`, payload);
    return { success: true, service: response.data.service };
  }

  async deleteService(serviceId) {
    await this.client.delete(`/services/${serviceId}`);
    return { success: true, message: 'Service deleted successfully' };
  }

  async listServices(options = {}) {
    const params = {
      ...(options.limit && { limit: options.limit }),
      ...(options.offset && { offset: options.offset }),
      ...(options.total && { total: options.total }),
      ...(options.team_ids && { 'team_ids[]': options.team_ids }),
      ...(options.time_zone && { time_zone: options.time_zone }),
      ...(options.sort_by && { sort_by: options.sort_by }),
      ...(options.query && { query: options.query }),
      ...(options.include && { 'include[]': options.include })
    };

    const response = await this.client.get('/services', { params });
    return { 
      success: true, 
      services: response.data.services,
      more: response.data.more
    };
  }

  // ==================== ESCALATION POLICIES (PREMIUM) ====================

  async createEscalationPolicy(data) {
    const payload = {
      escalation_policy: {
        type: 'escalation_policy',
        name: data.name,
        escalation_rules: data.escalation_rules,
        ...(data.description && { description: data.description }),
        ...(data.num_loops && { num_loops: data.num_loops }),
        ...(data.teams && { teams: data.teams })
      }
    };

    const response = await this.client.post('/escalation_policies', payload);
    return { success: true, escalation_policy: response.data.escalation_policy };
  }

  async getEscalationPolicy(policyId) {
    const response = await this.client.get(`/escalation_policies/${policyId}`);
    return { success: true, escalation_policy: response.data.escalation_policy };
  }

  async updateEscalationPolicy(policyId, data) {
    const payload = {
      escalation_policy: data
    };

    const response = await this.client.put(`/escalation_policies/${policyId}`, payload);
    return { success: true, escalation_policy: response.data.escalation_policy };
  }

  async deleteEscalationPolicy(policyId) {
    await this.client.delete(`/escalation_policies/${policyId}`);
    return { success: true, message: 'Escalation policy deleted successfully' };
  }

  async listEscalationPolicies(options = {}) {
    const params = {
      ...(options.limit && { limit: options.limit }),
      ...(options.offset && { offset: options.offset }),
      ...(options.query && { query: options.query }),
      ...(options.user_ids && { 'user_ids[]': options.user_ids }),
      ...(options.team_ids && { 'team_ids[]': options.team_ids }),
      ...(options.include && { 'include[]': options.include })
    };

    const response = await this.client.get('/escalation_policies', { params });
    return { 
      success: true, 
      escalation_policies: response.data.escalation_policies,
      more: response.data.more
    };
  }

  // ==================== SCHEDULES (PREMIUM) ====================

  async createSchedule(data) {
    const payload = {
      schedule: {
        type: 'schedule',
        name: data.name,
        time_zone: data.time_zone,
        schedule_layers: data.schedule_layers,
        ...(data.description && { description: data.description }),
        ...(data.teams && { teams: data.teams }),
        ...(data.overflow && { overflow: data.overflow })
      }
    };

    const response = await this.client.post('/schedules', payload);
    return { success: true, schedule: response.data.schedule };
  }

  async getSchedule(scheduleId, options = {}) {
    const params = {
      ...(options.time_zone && { time_zone: options.time_zone }),
      ...(options.since && { since: options.since }),
      ...(options.until && { until: options.until })
    };

    const response = await this.client.get(`/schedules/${scheduleId}`, { params });
    return { success: true, schedule: response.data.schedule };
  }

  async updateSchedule(scheduleId, data) {
    const payload = {
      schedule: data
    };

    const response = await this.client.put(`/schedules/${scheduleId}`, payload);
    return { success: true, schedule: response.data.schedule };
  }

  async deleteSchedule(scheduleId) {
    await this.client.delete(`/schedules/${scheduleId}`);
    return { success: true, message: 'Schedule deleted successfully' };
  }

  async listSchedules(options = {}) {
    const params = {
      ...(options.limit && { limit: options.limit }),
      ...(options.offset && { offset: options.offset }),
      ...(options.query && { query: options.query }),
      ...(options.include && { 'include[]': options.include })
    };

    const response = await this.client.get('/schedules', { params });
    return { 
      success: true, 
      schedules: response.data.schedules,
      more: response.data.more
    };
  }

  async listScheduleOverrides(scheduleId, options = {}) {
    const params = {
      since: options.since,
      until: options.until,
      ...(options.editable && { editable: options.editable }),
      ...(options.overflow && { overflow: options.overflow })
    };

    const response = await this.client.get(`/schedules/${scheduleId}/overrides`, { params });
    return { success: true, overrides: response.data.overrides };
  }

  async createScheduleOverride(scheduleId, data) {
    const payload = {
      override: {
        start: data.start,
        end: data.end,
        user: {
          id: data.user_id,
          type: 'user_reference'
        },
        ...(data.time_zone && { time_zone: data.time_zone })
      }
    };

    const response = await this.client.post(`/schedules/${scheduleId}/overrides`, payload);
    return { success: true, override: response.data.override };
  }

  async deleteScheduleOverride(scheduleId, overrideId) {
    await this.client.delete(`/schedules/${scheduleId}/overrides/${overrideId}`);
    return { success: true, message: 'Override deleted successfully' };
  }

  async listOnCalls(options = {}) {
    const params = {
      ...(options.limit && { limit: options.limit }),
      ...(options.offset && { offset: options.offset }),
      ...(options.time_zone && { time_zone: options.time_zone }),
      ...(options.include && { 'include[]': options.include }),
      ...(options.user_ids && { 'user_ids[]': options.user_ids }),
      ...(options.escalation_policy_ids && { 'escalation_policy_ids[]': options.escalation_policy_ids }),
      ...(options.schedule_ids && { 'schedule_ids[]': options.schedule_ids }),
      ...(options.since && { since: options.since }),
      ...(options.until && { until: options.until }),
      ...(options.earliest && { earliest: options.earliest })
    };

    const response = await this.client.get('/oncalls', { params });
    return { 
      success: true, 
      oncalls: response.data.oncalls,
      more: response.data.more
    };
  }

  // ==================== USERS (PREMIUM) ====================

  async createUser(data) {
    const payload = {
      user: {
        type: 'user',
        name: data.name,
        email: data.email,
        ...(data.time_zone && { time_zone: data.time_zone }),
        ...(data.color && { color: data.color }),
        ...(data.role && { role: data.role }),
        ...(data.job_title && { job_title: data.job_title }),
        ...(data.description && { description: data.description })
      }
    };

    const response = await this.client.post('/users', payload);
    return { success: true, user: response.data.user };
  }

  async getUser(userId, options = {}) {
    const params = {
      ...(options.include && { 'include[]': options.include })
    };

    const response = await this.client.get(`/users/${userId}`, { params });
    return { success: true, user: response.data.user };
  }

  async updateUser(userId, data) {
    const payload = {
      user: data
    };

    const response = await this.client.put(`/users/${userId}`, payload);
    return { success: true, user: response.data.user };
  }

  async deleteUser(userId) {
    await this.client.delete(`/users/${userId}`);
    return { success: true, message: 'User deleted successfully' };
  }

  async listUsers(options = {}) {
    const params = {
      ...(options.limit && { limit: options.limit }),
      ...(options.offset && { offset: options.offset }),
      ...(options.query && { query: options.query }),
      ...(options.team_ids && { 'team_ids[]': options.team_ids }),
      ...(options.include && { 'include[]': options.include })
    };

    const response = await this.client.get('/users', { params });
    return { 
      success: true, 
      users: response.data.users,
      more: response.data.more
    };
  }

  async getCurrentUser(options = {}) {
    const params = {
      ...(options.include && { 'include[]': options.include })
    };

    const response = await this.client.get('/users/me', { params });
    return { success: true, user: response.data.user };
  }

  // ==================== TEAMS (PREMIUM) ====================

  async createTeam(data) {
    const payload = {
      team: {
        type: 'team',
        name: data.name,
        ...(data.description && { description: data.description }),
        ...(data.parent && { parent: data.parent })
      }
    };

    const response = await this.client.post('/teams', payload);
    return { success: true, team: response.data.team };
  }

  async getTeam(teamId) {
    const response = await this.client.get(`/teams/${teamId}`);
    return { success: true, team: response.data.team };
  }

  async updateTeam(teamId, data) {
    const payload = {
      team: data
    };

    const response = await this.client.put(`/teams/${teamId}`, payload);
    return { success: true, team: response.data.team };
  }

  async deleteTeam(teamId) {
    await this.client.delete(`/teams/${teamId}`);
    return { success: true, message: 'Team deleted successfully' };
  }

  async listTeams(options = {}) {
    const params = {
      ...(options.limit && { limit: options.limit }),
      ...(options.offset && { offset: options.offset }),
      ...(options.query && { query: options.query })
    };

    const response = await this.client.get('/teams', { params });
    return { 
      success: true, 
      teams: response.data.teams,
      more: response.data.more
    };
  }

  // ==================== NOTIFICATIONS (PREMIUM) ====================

  async listNotifications(options = {}) {
    const params = {
      ...(options.limit && { limit: options.limit }),
      ...(options.offset && { offset: options.offset }),
      ...(options.time_zone && { time_zone: options.time_zone }),
      ...(options.since && { since: options.since }),
      ...(options.until && { until: options.until }),
      ...(options.filter && { filter: options.filter }),
      ...(options.include && { 'include[]': options.include })
    };

    const response = await this.client.get('/notifications', { params });
    return { 
      success: true, 
      notifications: response.data.notifications,
      more: response.data.more
    };
  }

  // ==================== PRIORITIES (PREMIUM) ====================

  async listPriorities() {
    const response = await this.client.get('/priorities');
    return { success: true, priorities: response.data.priorities };
  }

  // ==================== RESPONSE PLAYS (PREMIUM) ====================

  async createResponsePlay(data) {
    const payload = {
      response_play: {
        type: 'response_play',
        name: data.name,
        ...(data.description && { description: data.description }),
        ...(data.team && { team: data.team }),
        ...(data.subscribers && { subscribers: data.subscribers }),
        ...(data.subscribers_message && { subscribers_message: data.subscribers_message }),
        ...(data.responders && { responders: data.responders }),
        ...(data.responders_message && { responders_message: data.responders_message }),
        ...(data.runnability && { runnability: data.runnability }),
        ...(data.conference_number && { conference_number: data.conference_number }),
        ...(data.conference_url && { conference_url: data.conference_url })
      }
    };

    const response = await this.client.post('/response_plays', payload);
    return { success: true, response_play: response.data.response_play };
  }

  async getResponsePlay(responsePlayId) {
    const response = await this.client.get(`/response_plays/${responsePlayId}`);
    return { success: true, response_play: response.data.response_play };
  }

  async updateResponsePlay(responsePlayId, data) {
    const payload = {
      response_play: data
    };

    const response = await this.client.put(`/response_plays/${responsePlayId}`, payload);
    return { success: true, response_play: response.data.response_play };
  }

  async deleteResponsePlay(responsePlayId) {
    await this.client.delete(`/response_plays/${responsePlayId}`);
    return { success: true, message: 'Response play deleted successfully' };
  }

  async listResponsePlays(options = {}) {
    const params = {
      ...(options.limit && { limit: options.limit }),
      ...(options.offset && { offset: options.offset }),
      ...(options.query && { query: options.query }),
      ...(options.filter_for_manual_run && { filter_for_manual_run: options.filter_for_manual_run })
    };

    const response = await this.client.get('/response_plays', { params });
    return { 
      success: true, 
      response_plays: response.data.response_plays,
      more: response.data.more
    };
  }

  async runResponsePlay(responsePlayId, incidentId) {
    const payload = {
      incident: {
        id: incidentId,
        type: 'incident_reference'
      }
    };

    const response = await this.client.post(`/response_plays/${responsePlayId}/run`, payload);
    return { success: true, result: response.data };
  }

  // ==================== ANALYTICS (PREMIUM) ====================

  async getAnalyticsIncidents(options = {}) {
    const params = {
      ...(options.aggregate_unit && { aggregate_unit: options.aggregate_unit }),
      ...(options.time_zone && { time_zone: options.time_zone }),
      ...(options.created_at_start && { created_at_start: options.created_at_start }),
      ...(options.created_at_end && { created_at_end: options.created_at_end }),
      ...(options.service_ids && { 'service_ids[]': options.service_ids }),
      ...(options.team_ids && { 'team_ids[]': options.team_ids }),
      ...(options.urgency && { urgency: options.urgency }),
      ...(options.priority_ids && { 'priority_ids[]': options.priority_ids }),
      ...(options.priority_names && { 'priority_names[]': options.priority_names })
    };

    const response = await this.client.get('/analytics/metrics/incidents/all', { params });
    return { success: true, data: response.data };
  }

  async getAnalyticsResponders(options = {}) {
    const params = {
      ...(options.aggregate_unit && { aggregate_unit: options.aggregate_unit }),
      ...(options.time_zone && { time_zone: options.time_zone }),
      ...(options.created_at_start && { created_at_start: options.created_at_start }),
      ...(options.created_at_end && { created_at_end: options.created_at_end }),
      ...(options.team_ids && { 'team_ids[]': options.team_ids })
    };

    const response = await this.client.get('/analytics/metrics/incidents/responders', { params });
    return { success: true, data: response.data };
  }

  async getAnalyticsServices(options = {}) {
    const params = {
      ...(options.aggregate_unit && { aggregate_unit: options.aggregate_unit }),
      ...(options.time_zone && { time_zone: options.time_zone }),
      ...(options.created_at_start && { created_at_start: options.created_at_start }),
      ...(options.created_at_end && { created_at_end: options.created_at_end }),
      ...(options.service_ids && { 'service_ids[]': options.service_ids }),
      ...(options.team_ids && { 'team_ids[]': options.team_ids })
    };

    const response = await this.client.get('/analytics/metrics/incidents/services', { params });
    return { success: true, data: response.data };
  }

  async getAnalyticsTeams(options = {}) {
    const params = {
      ...(options.aggregate_unit && { aggregate_unit: options.aggregate_unit }),
      ...(options.time_zone && { time_zone: options.time_zone }),
      ...(options.created_at_start && { created_at_start: options.created_at_start }),
      ...(options.created_at_end && { created_at_end: options.created_at_end }),
      ...(options.team_ids && { 'team_ids[]': options.team_ids })
    };

    const response = await this.client.get('/analytics/metrics/incidents/teams', { params });
    return { success: true, data: response.data };
  }

  // ==================== WEBHOOKS (PREMIUM) ====================

  async createWebhook(data) {
    const payload = {
      webhook_subscription: {
        type: 'webhook_subscription',
        delivery_method: {
          type: 'http_delivery_method',
          url: data.url,
          ...(data.custom_headers && { custom_headers: data.custom_headers })
        },
        description: data.description,
        events: data.events,
        filter: data.filter,
        ...(data.active !== undefined && { active: data.active })
      }
    };

    const response = await this.client.post('/webhook_subscriptions', payload);
    return { success: true, webhook: response.data.webhook_subscription };
  }

  async getWebhook(webhookId) {
    const response = await this.client.get(`/webhook_subscriptions/${webhookId}`);
    return { success: true, webhook: response.data.webhook_subscription };
  }

  async updateWebhook(webhookId, data) {
    const payload = {
      webhook_subscription: data
    };

    const response = await this.client.put(`/webhook_subscriptions/${webhookId}`, payload);
    return { success: true, webhook: response.data.webhook_subscription };
  }

  async deleteWebhook(webhookId) {
    await this.client.delete(`/webhook_subscriptions/${webhookId}`);
    return { success: true, message: 'Webhook deleted successfully' };
  }

  async listWebhooks(options = {}) {
    const params = {
      ...(options.limit && { limit: options.limit }),
      ...(options.offset && { offset: options.offset }),
      ...(options.filter && { filter: options.filter })
    };

    const response = await this.client.get('/webhook_subscriptions', { params });
    return { 
      success: true, 
      webhooks: response.data.webhook_subscriptions,
      more: response.data.more
    };
  }

  async testWebhook(webhookId) {
    const response = await this.client.post(`/webhook_subscriptions/${webhookId}/ping`);
    return { success: true, result: response.data };
  }

  // ==================== EXTENSIONS (PREMIUM) ====================

  async createExtension(data) {
    const payload = {
      extension: {
        name: data.name,
        endpoint_url: data.endpoint_url,
        extension_objects: data.extension_objects,
        extension_schema: {
          id: data.extension_schema_id,
          type: 'extension_schema_reference'
        },
        ...(data.config && { config: data.config })
      }
    };

    const response = await this.client.post('/extensions', payload);
    return { success: true, extension: response.data.extension };
  }

  async getExtension(extensionId) {
    const response = await this.client.get(`/extensions/${extensionId}`);
    return { success: true, extension: response.data.extension };
  }

  async updateExtension(extensionId, data) {
    const payload = {
      extension: data
    };

    const response = await this.client.put(`/extensions/${extensionId}`, payload);
    return { success: true, extension: response.data.extension };
  }

  async deleteExtension(extensionId) {
    await this.client.delete(`/extensions/${extensionId}`);
    return { success: true, message: 'Extension deleted successfully' };
  }

  async listExtensions(options = {}) {
    const params = {
      ...(options.limit && { limit: options.limit }),
      ...(options.offset && { offset: options.offset }),
      ...(options.query && { query: options.query }),
      ...(options.extension_object_id && { extension_object_id: options.extension_object_id }),
      ...(options.extension_schema_id && { extension_schema_id: options.extension_schema_id }),
      ...(options.include && { 'include[]': options.include })
    };

    const response = await this.client.get('/extensions', { params });
    return { 
      success: true, 
      extensions: response.data.extensions,
      more: response.data.more
    };
  }

  async enableExtension(extensionId) {
    const payload = {
      extension: {
        temporarily_disabled: false
      }
    };

    const response = await this.client.put(`/extensions/${extensionId}`, payload);
    return { success: true, extension: response.data.extension };
  }

  // ==================== BUSINESS SERVICES (PREMIUM) ====================

  async createBusinessService(data) {
    const payload = {
      name: data.name,
      ...(data.description && { description: data.description }),
      ...(data.point_of_contact && { point_of_contact: data.point_of_contact }),
      ...(data.team && { team: data.team })
    };

    const response = await this.client.post('/business_services', payload);
    return { success: true, business_service: response.data.business_service };
  }

  async getBusinessService(businessServiceId) {
    const response = await this.client.get(`/business_services/${businessServiceId}`);
    return { success: true, business_service: response.data.business_service };
  }

  async updateBusinessService(businessServiceId, data) {
    const response = await this.client.put(`/business_services/${businessServiceId}`, data);
    return { success: true, business_service: response.data.business_service };
  }

  async deleteBusinessService(businessServiceId) {
    await this.client.delete(`/business_services/${businessServiceId}`);
    return { success: true, message: 'Business service deleted successfully' };
  }

  async listBusinessServices(options = {}) {
    const params = {
      ...(options.limit && { limit: options.limit }),
      ...(options.offset && { offset: options.offset })
    };

    const response = await this.client.get('/business_services', { params });
    return { 
      success: true, 
      business_services: response.data.business_services,
      more: response.data.more
    };
  }

  // ==================== EVENT RULES (PREMIUM) ====================

  async createEventRule(data) {
    const payload = {
      rule: {
        condition: data.condition,
        actions: data.actions,
        ...(data.position && { position: data.position }),
        ...(data.disabled && { disabled: data.disabled }),
        ...(data.catch_all && { catch_all: data.catch_all })
      }
    };

    const response = await this.client.post('/event_rules', payload);
    return { success: true, rule: response.data.rule };
  }

  async getEventRule(ruleId) {
    const response = await this.client.get(`/event_rules/${ruleId}`);
    return { success: true, rule: response.data.rule };
  }

  async updateEventRule(ruleId, data) {
    const payload = {
      rule: data
    };

    const response = await this.client.put(`/event_rules/${ruleId}`, payload);
    return { success: true, rule: response.data.rule };
  }

  async deleteEventRule(ruleId) {
    await this.client.delete(`/event_rules/${ruleId}`);
    return { success: true, message: 'Event rule deleted successfully' };
  }

  async listEventRules() {
    const response = await this.client.get('/event_rules');
    return { success: true, rules: response.data.rules };
  }

  // ==================== MAINTENANCE WINDOWS (PREMIUM) ====================

  async createMaintenanceWindow(data) {
    const payload = {
      maintenance_window: {
        type: 'maintenance_window',
        start_time: data.start_time,
        end_time: data.end_time,
        services: data.services,
        ...(data.description && { description: data.description })
      }
    };

    const response = await this.client.post('/maintenance_windows', payload);
    return { success: true, maintenance_window: response.data.maintenance_window };
  }

  async getMaintenanceWindow(windowId) {
    const response = await this.client.get(`/maintenance_windows/${windowId}`);
    return { success: true, maintenance_window: response.data.maintenance_window };
  }

  async updateMaintenanceWindow(windowId, data) {
    const payload = {
      maintenance_window: data
    };

    const response = await this.client.put(`/maintenance_windows/${windowId}`, payload);
    return { success: true, maintenance_window: response.data.maintenance_window };
  }

  async deleteMaintenanceWindow(windowId) {
    await this.client.delete(`/maintenance_windows/${windowId}`);
    return { success: true, message: 'Maintenance window deleted successfully' };
  }

  async listMaintenanceWindows(options = {}) {
    const params = {
      ...(options.limit && { limit: options.limit }),
      ...(options.offset && { offset: options.offset }),
      ...(options.query && { query: options.query }),
      ...(options.filter && { filter: options.filter }),
      ...(options.include && { 'include[]': options.include })
    };

    const response = await this.client.get('/maintenance_windows', { params });
    return { 
      success: true, 
      maintenance_windows: response.data.maintenance_windows,
      more: response.data.more
    };
  }
}

module.exports = PagerDutyAPI;
