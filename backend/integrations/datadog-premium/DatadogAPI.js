/**
 * Datadog Premium API Integration
 * Complete infrastructure monitoring and observability platform
 * PREMIUM FEATURES - FREE ACCESS (normally $15/host/month)
 */

const axios = require('axios');

class DatadogAPI {
  constructor(apiKey, appKey, site = 'datadoghq.com') {
    this.apiKey = apiKey || process.env.DATADOG_API_KEY;
    this.appKey = appKey || process.env.DATADOG_APP_KEY;
    this.site = site || process.env.DATADOG_SITE || 'datadoghq.com';
    this.baseURL = `https://api.${this.site}/api`;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'DD-API-KEY': this.apiKey,
        'DD-APPLICATION-KEY': this.appKey,
        'Content-Type': 'application/json'
      }
    });
  }

  // ==================== METRICS (PREMIUM) ====================

  async submitMetrics(data) {
    const payload = {
      series: data.series.map(metric => ({
        metric: metric.metric,
        points: metric.points,
        type: metric.type || 'gauge',
        ...(metric.host && { host: metric.host }),
        ...(metric.tags && { tags: metric.tags }),
        ...(metric.interval && { interval: metric.interval })
      }))
    };

    const response = await this.client.post('/v1/series', payload);
    return { success: true, status: response.data.status };
  }

  async queryMetrics(query, from, to) {
    const params = {
      query,
      from,
      to
    };

    const response = await this.client.get('/v1/query', { params });
    return { success: true, series: response.data.series };
  }

  async getActiveMetrics(from, host = null) {
    const params = {
      from,
      ...(host && { host })
    };

    const response = await this.client.get('/v1/metrics', { params });
    return { success: true, metrics: response.data.metrics };
  }

  async getMetricMetadata(metricName) {
    const response = await this.client.get(`/v1/metrics/${metricName}`);
    return { success: true, metadata: response.data };
  }

  async updateMetricMetadata(metricName, data) {
    const payload = {
      ...(data.type && { type: data.type }),
      ...(data.description && { description: data.description }),
      ...(data.short_name && { short_name: data.short_name }),
      ...(data.unit && { unit: data.unit }),
      ...(data.per_unit && { per_unit: data.per_unit }),
      ...(data.statsd_interval && { statsd_interval: data.statsd_interval })
    };

    const response = await this.client.put(`/v1/metrics/${metricName}`, payload);
    return { success: true, metadata: response.data };
  }

  async searchMetrics(query) {
    const params = { q: query };
    const response = await this.client.get('/v1/search', { params });
    return { success: true, results: response.data.results };
  }

  // ==================== EVENTS (PREMIUM) ====================

  async createEvent(data) {
    const payload = {
      title: data.title,
      text: data.text,
      ...(data.date_happened && { date_happened: data.date_happened }),
      ...(data.priority && { priority: data.priority }),
      ...(data.host && { host: data.host }),
      ...(data.tags && { tags: data.tags }),
      ...(data.alert_type && { alert_type: data.alert_type }),
      ...(data.aggregation_key && { aggregation_key: data.aggregation_key }),
      ...(data.source_type_name && { source_type_name: data.source_type_name })
    };

    const response = await this.client.post('/v1/events', payload);
    return { success: true, event: response.data.event };
  }

  async getEvent(eventId) {
    const response = await this.client.get(`/v1/events/${eventId}`);
    return { success: true, event: response.data.event };
  }

  async queryEvents(start, end, options = {}) {
    const params = {
      start,
      end,
      ...(options.priority && { priority: options.priority }),
      ...(options.sources && { sources: options.sources }),
      ...(options.tags && { tags: options.tags }),
      ...(options.unaggregated && { unaggregated: options.unaggregated })
    };

    const response = await this.client.get('/v1/events', { params });
    return { success: true, events: response.data.events };
  }

  // ==================== MONITORS (PREMIUM) ====================

  async createMonitor(data) {
    const payload = {
      type: data.type,
      query: data.query,
      name: data.name,
      message: data.message,
      ...(data.tags && { tags: data.tags }),
      ...(data.options && { options: data.options }),
      ...(data.priority && { priority: data.priority }),
      ...(data.restricted_roles && { restricted_roles: data.restricted_roles })
    };

    const response = await this.client.post('/v1/monitor', payload);
    return { success: true, monitor: response.data };
  }

  async getMonitor(monitorId, options = {}) {
    const params = {
      ...(options.group_states && { group_states: options.group_states }),
      ...(options.with_downtimes && { with_downtimes: options.with_downtimes })
    };

    const response = await this.client.get(`/v1/monitor/${monitorId}`, { params });
    return { success: true, monitor: response.data };
  }

  async updateMonitor(monitorId, data) {
    const response = await this.client.put(`/v1/monitor/${monitorId}`, data);
    return { success: true, monitor: response.data };
  }

  async deleteMonitor(monitorId, force = false) {
    const params = { force };
    await this.client.delete(`/v1/monitor/${monitorId}`, { params });
    return { success: true, message: 'Monitor deleted successfully' };
  }

  async listMonitors(options = {}) {
    const params = {
      ...(options.group_states && { group_states: options.group_states }),
      ...(options.name && { name: options.name }),
      ...(options.tags && { tags: options.tags }),
      ...(options.monitor_tags && { monitor_tags: options.monitor_tags }),
      ...(options.with_downtimes && { with_downtimes: options.with_downtimes }),
      ...(options.page && { page: options.page }),
      ...(options.page_size && { page_size: options.page_size })
    };

    const response = await this.client.get('/v1/monitor', { params });
    return { success: true, monitors: response.data };
  }

  async validateMonitor(data) {
    const response = await this.client.post('/v1/monitor/validate', data);
    return { success: true, valid: response.data };
  }

  async muteMonitor(monitorId, options = {}) {
    const payload = {
      ...(options.scope && { scope: options.scope }),
      ...(options.end && { end: options.end })
    };

    const response = await this.client.post(`/v1/monitor/${monitorId}/mute`, payload);
    return { success: true, monitor: response.data };
  }

  async unmuteMonitor(monitorId, scope = null) {
    const payload = scope ? { scope } : {};
    const response = await this.client.post(`/v1/monitor/${monitorId}/unmute`, payload);
    return { success: true, monitor: response.data };
  }

  async searchMonitors(query, options = {}) {
    const params = {
      query,
      ...(options.page && { page: options.page }),
      ...(options.per_page && { per_page: options.per_page }),
      ...(options.sort && { sort: options.sort })
    };

    const response = await this.client.get('/v1/monitor/search', { params });
    return { success: true, monitors: response.data.monitors };
  }

  // ==================== DASHBOARDS (PREMIUM) ====================

  async createDashboard(data) {
    const payload = {
      title: data.title,
      widgets: data.widgets,
      layout_type: data.layout_type,
      ...(data.description && { description: data.description }),
      ...(data.is_read_only && { is_read_only: data.is_read_only }),
      ...(data.notify_list && { notify_list: data.notify_list }),
      ...(data.template_variables && { template_variables: data.template_variables }),
      ...(data.reflow_type && { reflow_type: data.reflow_type })
    };

    const response = await this.client.post('/v1/dashboard', payload);
    return { success: true, dashboard: response.data };
  }

  async getDashboard(dashboardId) {
    const response = await this.client.get(`/v1/dashboard/${dashboardId}`);
    return { success: true, dashboard: response.data };
  }

  async updateDashboard(dashboardId, data) {
    const response = await this.client.put(`/v1/dashboard/${dashboardId}`, data);
    return { success: true, dashboard: response.data };
  }

  async deleteDashboard(dashboardId) {
    await this.client.delete(`/v1/dashboard/${dashboardId}`);
    return { success: true, message: 'Dashboard deleted successfully' };
  }

  async listDashboards() {
    const response = await this.client.get('/v1/dashboard');
    return { success: true, dashboards: response.data.dashboards };
  }

  // ==================== LOGS (PREMIUM) ====================

  async sendLogs(logs) {
    const payload = logs.map(log => ({
      message: log.message,
      ...(log.ddsource && { ddsource: log.ddsource }),
      ...(log.ddtags && { ddtags: log.ddtags }),
      ...(log.hostname && { hostname: log.hostname }),
      ...(log.service && { service: log.service }),
      ...(log.status && { status: log.status })
    }));

    const response = await this.client.post('/v2/logs', payload);
    return { success: true, status: response.data.status };
  }

  async searchLogs(query, options = {}) {
    const payload = {
      filter: {
        query,
        ...(options.from && { from: options.from }),
        ...(options.to && { to: options.to }),
        ...(options.indexes && { indexes: options.indexes })
      },
      ...(options.sort && { sort: options.sort }),
      ...(options.page && { page: options.page })
    };

    const response = await this.client.post('/v2/logs/events/search', payload);
    return { success: true, logs: response.data.data };
  }

  async aggregateLogs(query, options = {}) {
    const payload = {
      filter: {
        query,
        ...(options.from && { from: options.from }),
        ...(options.to && { to: options.to })
      },
      ...(options.compute && { compute: options.compute }),
      ...(options.group_by && { group_by: options.group_by })
    };

    const response = await this.client.post('/v2/logs/analytics/aggregate', payload);
    return { success: true, aggregates: response.data.data };
  }

  // ==================== TRACES (PREMIUM - APM) ====================

  async searchTraces(query, options = {}) {
    const payload = {
      filter: {
        query,
        ...(options.from && { from: options.from }),
        ...(options.to && { to: options.to })
      },
      ...(options.sort && { sort: options.sort }),
      ...(options.page && { page: options.page })
    };

    const response = await this.client.post('/v2/traces/search', payload);
    return { success: true, traces: response.data.data };
  }

  async getTrace(traceId) {
    const response = await this.client.get(`/v2/traces/${traceId}`);
    return { success: true, trace: response.data.data };
  }

  // ==================== SERVICE LEVEL OBJECTIVES (PREMIUM) ====================

  async createSLO(data) {
    const payload = {
      name: data.name,
      type: data.type,
      thresholds: data.thresholds,
      ...(data.description && { description: data.description }),
      ...(data.tags && { tags: data.tags }),
      ...(data.monitor_ids && { monitor_ids: data.monitor_ids }),
      ...(data.groups && { groups: data.groups }),
      ...(data.query && { query: data.query })
    };

    const response = await this.client.post('/v1/slo', payload);
    return { success: true, slo: response.data.data[0] };
  }

  async getSLO(sloId, options = {}) {
    const params = {
      ...(options.with_data && { with_data: options.with_data })
    };

    const response = await this.client.get(`/v1/slo/${sloId}`, { params });
    return { success: true, slo: response.data.data };
  }

  async updateSLO(sloId, data) {
    const response = await this.client.put(`/v1/slo/${sloId}`, data);
    return { success: true, slo: response.data.data[0] };
  }

  async deleteSLO(sloId, force = false) {
    const params = { force };
    await this.client.delete(`/v1/slo/${sloId}`, { params });
    return { success: true, message: 'SLO deleted successfully' };
  }

  async listSLOs(options = {}) {
    const params = {
      ...(options.ids && { ids: options.ids }),
      ...(options.query && { query: options.query }),
      ...(options.tags_query && { tags_query: options.tags_query }),
      ...(options.metrics_query && { metrics_query: options.metrics_query }),
      ...(options.limit && { limit: options.limit }),
      ...(options.offset && { offset: options.offset })
    };

    const response = await this.client.get('/v1/slo', { params });
    return { success: true, slos: response.data.data };
  }

  async getSLOHistory(sloId, from, to, target = null) {
    const params = {
      from_ts: from,
      to_ts: to,
      ...(target && { target })
    };

    const response = await this.client.get(`/v1/slo/${sloId}/history`, { params });
    return { success: true, history: response.data.data };
  }

  // ==================== SYNTHETICS (PREMIUM) ====================

  async createSyntheticTest(data) {
    const payload = {
      name: data.name,
      type: data.type,
      config: data.config,
      locations: data.locations,
      options: data.options,
      message: data.message,
      ...(data.tags && { tags: data.tags }),
      ...(data.status && { status: data.status })
    };

    const response = await this.client.post('/v1/synthetics/tests', payload);
    return { success: true, test: response.data };
  }

  async getSyntheticTest(testId) {
    const response = await this.client.get(`/v1/synthetics/tests/${testId}`);
    return { success: true, test: response.data };
  }

  async updateSyntheticTest(testId, data) {
    const response = await this.client.put(`/v1/synthetics/tests/${testId}`, data);
    return { success: true, test: response.data };
  }

  async deleteSyntheticTest(testId, force = false) {
    const params = { force };
    await this.client.delete(`/v1/synthetics/tests/${testId}`, { params });
    return { success: true, message: 'Synthetic test deleted successfully' };
  }

  async listSyntheticTests() {
    const response = await this.client.get('/v1/synthetics/tests');
    return { success: true, tests: response.data.tests };
  }

  async triggerSyntheticTest(testId) {
    const response = await this.client.get(`/v1/synthetics/tests/${testId}/trigger`);
    return { success: true, results: response.data.results };
  }

  async getSyntheticTestResults(testId, options = {}) {
    const params = {
      ...(options.from_ts && { from_ts: options.from_ts }),
      ...(options.to_ts && { to_ts: options.to_ts }),
      ...(options.probe_dc && { probe_dc: options.probe_dc })
    };

    const response = await this.client.get(`/v1/synthetics/tests/${testId}/results`, { params });
    return { success: true, results: response.data.results };
  }

  // ==================== DOWNTIMES (PREMIUM) ====================

  async createDowntime(data) {
    const payload = {
      scope: data.scope,
      ...(data.start && { start: data.start }),
      ...(data.end && { end: data.end }),
      ...(data.recurrence && { recurrence: data.recurrence }),
      ...(data.message && { message: data.message }),
      ...(data.timezone && { timezone: data.timezone }),
      ...(data.monitor_id && { monitor_id: data.monitor_id }),
      ...(data.monitor_tags && { monitor_tags: data.monitor_tags })
    };

    const response = await this.client.post('/v1/downtime', payload);
    return { success: true, downtime: response.data };
  }

  async getDowntime(downtimeId) {
    const response = await this.client.get(`/v1/downtime/${downtimeId}`);
    return { success: true, downtime: response.data };
  }

  async updateDowntime(downtimeId, data) {
    const response = await this.client.put(`/v1/downtime/${downtimeId}`, data);
    return { success: true, downtime: response.data };
  }

  async deleteDowntime(downtimeId) {
    await this.client.delete(`/v1/downtime/${downtimeId}`);
    return { success: true, message: 'Downtime deleted successfully' };
  }

  async listDowntimes(options = {}) {
    const params = {
      ...(options.current_only && { current_only: options.current_only }),
      ...(options.with_creator && { with_creator: options.with_creator })
    };

    const response = await this.client.get('/v1/downtime', { params });
    return { success: true, downtimes: response.data };
  }

  async cancelDowntimesByScope(scope) {
    const payload = { scope };
    const response = await this.client.post('/v1/downtime/cancel/by_scope', payload);
    return { success: true, cancelled: response.data };
  }

  // ==================== HOSTS (PREMIUM) ====================

  async listHosts(options = {}) {
    const params = {
      ...(options.filter && { filter: options.filter }),
      ...(options.sort_field && { sort_field: options.sort_field }),
      ...(options.sort_dir && { sort_dir: options.sort_dir }),
      ...(options.start && { start: options.start }),
      ...(options.count && { count: options.count }),
      ...(options.from && { from: options.from }),
      ...(options.include_muted_hosts_data && { include_muted_hosts_data: options.include_muted_hosts_data }),
      ...(options.include_hosts_metadata && { include_hosts_metadata: options.include_hosts_metadata })
    };

    const response = await this.client.get('/v1/hosts', { params });
    return { success: true, hosts: response.data.host_list };
  }

  async getHostTotals(from = null) {
    const params = from ? { from } : {};
    const response = await this.client.get('/v1/hosts/totals', { params });
    return { success: true, totals: response.data };
  }

  async muteHost(hostname, options = {}) {
    const payload = {
      ...(options.message && { message: options.message }),
      ...(options.end && { end: options.end }),
      ...(options.override && { override: options.override })
    };

    const response = await this.client.post(`/v1/host/${hostname}/mute`, payload);
    return { success: true, action: response.data.action };
  }

  async unmuteHost(hostname) {
    const response = await this.client.post(`/v1/host/${hostname}/unmute`);
    return { success: true, action: response.data.action };
  }

  // ==================== TAGS (PREMIUM) ====================

  async getHostTags(hostname, source = null) {
    const params = source ? { source } : {};
    const response = await this.client.get(`/v1/tags/hosts/${hostname}`, { params });
    return { success: true, tags: response.data.tags };
  }

  async updateHostTags(hostname, data) {
    const payload = {
      tags: data.tags,
      ...(data.source && { source: data.source })
    };

    const response = await this.client.put(`/v1/tags/hosts/${hostname}`, payload);
    return { success: true, tags: response.data.tags };
  }

  async addHostTags(hostname, data) {
    const payload = {
      tags: data.tags,
      ...(data.source && { source: data.source })
    };

    const response = await this.client.post(`/v1/tags/hosts/${hostname}`, payload);
    return { success: true, tags: response.data.tags };
  }

  async deleteHostTags(hostname, source = null) {
    const params = source ? { source } : {};
    await this.client.delete(`/v1/tags/hosts/${hostname}`, { params });
    return { success: true, message: 'Tags deleted successfully' };
  }

  async listTags(source = null) {
    const params = source ? { source } : {};
    const response = await this.client.get('/v1/tags/hosts', { params });
    return { success: true, tags: response.data.tags };
  }

  // ==================== INTEGRATIONS (PREMIUM) ====================

  async createIntegration(source, data) {
    const response = await this.client.post(`/v1/integration/${source}`, data);
    return { success: true, integration: response.data };
  }

  async getIntegration(source) {
    const response = await this.client.get(`/v1/integration/${source}`);
    return { success: true, integration: response.data };
  }

  async updateIntegration(source, data) {
    const response = await this.client.put(`/v1/integration/${source}`, data);
    return { success: true, integration: response.data };
  }

  async deleteIntegration(source) {
    await this.client.delete(`/v1/integration/${source}`);
    return { success: true, message: 'Integration deleted successfully' };
  }

  // ==================== USAGE (PREMIUM) ====================

  async getUsage(startMonth, endMonth = null, options = {}) {
    const params = {
      start_month: startMonth,
      ...(endMonth && { end_month: endMonth }),
      ...(options.include_org_details && { include_org_details: options.include_org_details })
    };

    const response = await this.client.get('/v1/usage/hosts', { params });
    return { success: true, usage: response.data.usage };
  }

  async getLogsUsage(startMonth, endMonth = null) {
    const params = {
      start_month: startMonth,
      ...(endMonth && { end_month: endMonth })
    };

    const response = await this.client.get('/v1/usage/logs', { params });
    return { success: true, usage: response.data.usage };
  }

  async getCustomMetricsUsage(startMonth, endMonth = null) {
    const params = {
      start_month: startMonth,
      ...(endMonth && { end_month: endMonth })
    };

    const response = await this.client.get('/v1/usage/timeseries', { params });
    return { success: true, usage: response.data.usage };
  }
}

module.exports = DatadogAPI;
