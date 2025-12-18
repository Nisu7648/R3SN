const axios = require('axios');

class CloudflareEnterpriseIntegration {
  constructor(email, apiKey, accountId = null) {
    this.email = email;
    this.apiKey = apiKey;
    this.accountId = accountId;
    this.baseUrl = 'https://api.cloudflare.com/client/v4';
  }

  getHeaders() {
    return { 'X-Auth-Email': this.email, 'X-Auth-Key': this.apiKey, 'Content-Type': 'application/json' };
  }

  async request(method, path, data = null) {
    try {
      const response = await axios({ method, url: `${this.baseUrl}${path}`, headers: this.getHeaders(), data });
      return { success: true, data: response.data.result };
    } catch (error) {
      throw new Error(`Cloudflare API error: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  // Zone Management
  async listZones() { return this.request('GET', '/zones'); }
  async getZone(zoneId) { return this.request('GET', `/zones/${zoneId}`); }
  async createZone(name, accountId) { return this.request('POST', '/zones', { name, account: { id: accountId } }); }
  async deleteZone(zoneId) { return this.request('DELETE', `/zones/${zoneId}`); }
  async purgeCache(zoneId, options = {}) { return this.request('POST', `/zones/${zoneId}/purge_cache`, options); }

  // DNS Management
  async listDnsRecords(zoneId) { return this.request('GET', `/zones/${zoneId}/dns_records`); }
  async createDnsRecord(zoneId, type, name, content, options = {}) { return this.request('POST', `/zones/${zoneId}/dns_records`, { type, name, content, ...options }); }
  async updateDnsRecord(zoneId, recordId, updates) { return this.request('PUT', `/zones/${zoneId}/dns_records/${recordId}`, updates); }
  async deleteDnsRecord(zoneId, recordId) { return this.request('DELETE', `/zones/${zoneId}/dns_records/${recordId}`); }

  // Workers (Premium)
  async listWorkers() { return this.request('GET', `/accounts/${this.accountId}/workers/scripts`); }
  async uploadWorker(scriptName, script) { return this.request('PUT', `/accounts/${this.accountId}/workers/scripts/${scriptName}`, script); }
  async deleteWorker(scriptName) { return this.request('DELETE', `/accounts/${this.accountId}/workers/scripts/${scriptName}`); }

  // Workers KV (Premium)
  async listKvNamespaces() { return this.request('GET', `/accounts/${this.accountId}/storage/kv/namespaces`); }
  async createKvNamespace(title) { return this.request('POST', `/accounts/${this.accountId}/storage/kv/namespaces`, { title }); }
  async deleteKvNamespace(namespaceId) { return this.request('DELETE', `/accounts/${this.accountId}/storage/kv/namespaces/${namespaceId}`); }
  async readKvValue(namespaceId, key) { return this.request('GET', `/accounts/${this.accountId}/storage/kv/namespaces/${namespaceId}/values/${key}`); }
  async writeKvValue(namespaceId, key, value) { return this.request('PUT', `/accounts/${this.accountId}/storage/kv/namespaces/${namespaceId}/values/${key}`, value); }
  async deleteKvValue(namespaceId, key) { return this.request('DELETE', `/accounts/${this.accountId}/storage/kv/namespaces/${namespaceId}/values/${key}`); }

  // Firewall (Premium)
  async listFirewallRules(zoneId) { return this.request('GET', `/zones/${zoneId}/firewall/rules`); }
  async createFirewallRule(zoneId, filter, action) { return this.request('POST', `/zones/${zoneId}/firewall/rules`, [{ filter, action }]); }
  async updateFirewallRule(zoneId, ruleId, updates) { return this.request('PUT', `/zones/${zoneId}/firewall/rules/${ruleId}`, updates); }
  async deleteFirewallRule(zoneId, ruleId) { return this.request('DELETE', `/zones/${zoneId}/firewall/rules/${ruleId}`); }

  // Rate Limiting (Premium)
  async listRateLimits(zoneId) { return this.request('GET', `/zones/${zoneId}/rate_limits`); }
  async createRateLimit(zoneId, data) { return this.request('POST', `/zones/${zoneId}/rate_limits`, data); }

  // Analytics (Premium)
  async getAnalytics(zoneId, params = {}) { return this.request('GET', `/zones/${zoneId}/analytics/dashboard?${new URLSearchParams(params)}`); }

  // Load Balancing (Premium)
  async listLoadBalancers(zoneId) { return this.request('GET', `/zones/${zoneId}/load_balancers`); }
  async createLoadBalancer(zoneId, data) { return this.request('POST', `/zones/${zoneId}/load_balancers`, data); }

  // Page Rules (Premium)
  async listPageRules(zoneId) { return this.request('GET', `/zones/${zoneId}/pagerules`); }
  async createPageRule(zoneId, targets, actions) { return this.request('POST', `/zones/${zoneId}/pagerules`, { targets, actions }); }

  // WAF (Premium)
  async listWafRules(zoneId) { return this.request('GET', `/zones/${zoneId}/firewall/waf/packages`); }

  // SSL/TLS (Premium)
  async getSslSettings(zoneId) { return this.request('GET', `/zones/${zoneId}/settings/ssl`); }
  async updateSslSettings(zoneId, value) { return this.request('PATCH', `/zones/${zoneId}/settings/ssl`, { value }); }
  async listCertificates(zoneId) { return this.request('GET', `/zones/${zoneId}/ssl/certificate_packs`); }

  // Zone Settings
  async getZoneSettings(zoneId) { return this.request('GET', `/zones/${zoneId}/settings`); }
  async updateZoneSettings(zoneId, items) { return this.request('PATCH', `/zones/${zoneId}/settings`, { items }); }
}

module.exports = CloudflareEnterpriseIntegration;
