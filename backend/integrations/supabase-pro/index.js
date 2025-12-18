const axios = require('axios');

class SupabaseProIntegration {
  constructor(projectRef, apiKey, serviceKey = null) {
    this.projectRef = projectRef;
    this.apiKey = apiKey;
    this.serviceKey = serviceKey || apiKey;
    this.baseUrl = `https://${projectRef}.supabase.co`;
  }

  getHeaders(useServiceKey = false) {
    return {
      'apikey': this.apiKey,
      'Authorization': `Bearer ${useServiceKey ? this.serviceKey : this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async request(method, path, data = null, useServiceKey = false) {
    try {
      const response = await axios({ method, url: `${this.baseUrl}${path}`, headers: this.getHeaders(useServiceKey), data });
      return { success: true, data: response.data };
    } catch (error) {
      throw new Error(`Supabase API error: ${error.response?.data?.message || error.message}`);
    }
  }

  // Database Operations
  async queryTable(table, params = {}) { return this.request('GET', `/rest/v1/${table}?${new URLSearchParams(params)}`); }
  async insertRow(table, data) { return this.request('POST', `/rest/v1/${table}`, data); }
  async updateRow(table, data, filter) { return this.request('PATCH', `/rest/v1/${table}?${filter}`, data); }
  async deleteRow(table, filter) { return this.request('DELETE', `/rest/v1/${table}?${filter}`); }
  async upsertRow(table, data) { return this.request('POST', `/rest/v1/${table}`, data, false); }
  async rpcCall(functionName, params = {}) { return this.request('POST', `/rest/v1/rpc/${functionName}`, params); }

  // Auth Operations (Premium)
  async signup(email, password, options = {}) { return this.request('POST', '/auth/v1/signup', { email, password, ...options }); }
  async signin(email, password) { return this.request('POST', '/auth/v1/token?grant_type=password', { email, password }); }
  async signout(token) { return this.request('POST', '/auth/v1/logout', null); }
  async getUser() { return this.request('GET', '/auth/v1/user'); }
  async updateUser(updates) { return this.request('PUT', '/auth/v1/user', updates); }
  async resetPassword(email) { return this.request('POST', '/auth/v1/recover', { email }); }
  async verifyOtp(phone, token, type = 'sms') { return this.request('POST', '/auth/v1/verify', { phone, token, type }); }

  // Storage Operations (Premium)
  async listBuckets() { return this.request('GET', '/storage/v1/bucket', null, true); }
  async createBucket(id, options = {}) { return this.request('POST', '/storage/v1/bucket', { id, ...options }, true); }
  async getBucket(id) { return this.request('GET', `/storage/v1/bucket/${id}`, null, true); }
  async deleteBucket(id) { return this.request('DELETE', `/storage/v1/bucket/${id}`, null, true); }
  async listFiles(bucket, path = '', options = {}) { return this.request('POST', `/storage/v1/object/list/${bucket}`, { prefix: path, ...options }); }
  async uploadFile(bucket, path, file) { return this.request('POST', `/storage/v1/object/${bucket}/${path}`, file); }
  async downloadFile(bucket, path) { return this.request('GET', `/storage/v1/object/${bucket}/${path}`); }
  async deleteFile(bucket, path) { return this.request('DELETE', `/storage/v1/object/${bucket}/${path}`); }
  async moveFile(bucket, fromPath, toPath) { return this.request('POST', '/storage/v1/object/move', { bucketId: bucket, sourceKey: fromPath, destinationKey: toPath }); }
  async copyFile(bucket, fromPath, toPath) { return this.request('POST', '/storage/v1/object/copy', { bucketId: bucket, sourceKey: fromPath, destinationKey: toPath }); }
  async createSignedUrl(bucket, path, expiresIn = 3600) { return this.request('POST', `/storage/v1/object/sign/${bucket}/${path}`, { expiresIn }); }

  // Edge Functions (Premium)
  async listEdgeFunctions() { return this.request('GET', '/functions/v1'); }
  async invokeFunction(functionName, body = {}) { return this.request('POST', `/functions/v1/${functionName}`, body); }

  // Realtime (Premium)
  async getRealtimeConfig() { return this.request('GET', '/realtime/v1/config'); }
  async subscribeChannel(channel, config = {}) { return this.request('POST', '/realtime/v1/channels', { channel, config }); }

  // Project Management (Premium)
  async getProjectSettings() { return this.request('GET', `/v1/projects/${this.projectRef}`, null, true); }
  async updateProjectSettings(updates) { return this.request('PATCH', `/v1/projects/${this.projectRef}`, updates, true); }
}

module.exports = SupabaseProIntegration;
