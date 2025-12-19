const axios = require('axios');

class LambdaLabsCloudIntegration {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://cloud.lambdalabs.com/api/v1';
  }

  getHeaders() {
    return { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' };
  }

  async request(method, path, data = null) {
    try {
      const response = await axios({ method, url: `${this.baseUrl}${path}`, headers: this.getHeaders(), data });
      return { success: true, data: response.data.data };
    } catch (error) {
      throw new Error(`Lambda Labs API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Instance Management
  async listInstances() { return this.request('GET', '/instances'); }
  async getInstance(instanceId) { return this.request('GET', `/instances/${instanceId}`); }
  async launchInstance(instanceTypeId, region, sshKeyIds, filesystemIds = []) {
    return this.request('POST', '/instance-operations/launch', {
      instance_type_name: instanceTypeId,
      region_name: region,
      ssh_key_names: sshKeyIds,
      file_system_names: filesystemIds,
    });
  }
  async terminateInstance(instanceIds) { return this.request('POST', '/instance-operations/terminate', { instance_ids: instanceIds }); }
  async restartInstance(instanceIds) { return this.request('POST', '/instance-operations/restart', { instance_ids: instanceIds }); }

  // Instance Types & Availability
  async listInstanceTypes() { return this.request('GET', '/instance-types'); }
  async getInstanceAvailability(instanceTypeId) { return this.request('GET', `/instance-types/${instanceTypeId}/availability`); }

  // SSH Keys
  async listSshKeys() { return this.request('GET', '/ssh-keys'); }
  async addSshKey(name, publicKey) { return this.request('POST', '/ssh-keys', { name, public_key: publicKey }); }
  async deleteSshKey(keyId) { return this.request('DELETE', `/ssh-keys/${keyId}`); }

  // Filesystems (Persistent Storage)
  async listFilesystems() { return this.request('GET', '/file-systems'); }
  async createFilesystem(name, region, sizeGb = 512) { return this.request('POST', '/file-systems', { name, region_name: region, size_gib: sizeGb }); }
  async deleteFilesystem(filesystemId) { return this.request('DELETE', `/file-systems/${filesystemId}`); }

  // Billing & Usage
  async getPricing() { return this.request('GET', '/pricing'); }
  async getUsage() { return this.request('GET', '/usage'); }
  async getBilling() { return this.request('GET', '/billing'); }

  // Team Management
  async listTeams() { return this.request('GET', '/teams'); }
  async createTeam(name) { return this.request('POST', '/teams', { name }); }
  async addTeamMember(teamId, email, role = 'member') { return this.request('POST', `/teams/${teamId}/members`, { email, role }); }
  async removeTeamMember(teamId, userId) { return this.request('DELETE', `/teams/${teamId}/members/${userId}`); }

  // Snapshots
  async listSnapshots() { return this.request('GET', '/snapshots'); }
  async createSnapshot(instanceId, name) { return this.request('POST', '/snapshots', { instance_id: instanceId, name }); }
  async deleteSnapshot(snapshotId) { return this.request('DELETE', `/snapshots/${snapshotId}`); }
  async restoreSnapshot(snapshotId, instanceTypeId, region) {
    return this.request('POST', `/snapshots/${snapshotId}/restore`, { instance_type_name: instanceTypeId, region_name: region });
  }

  // Monitoring
  async getMetrics(instanceId) { return this.request('GET', `/instances/${instanceId}/metrics`); }
  async getLogs(instanceId) { return this.request('GET', `/instances/${instanceId}/logs`); }

  // Regions & Quota
  async listRegions() { return this.request('GET', '/regions'); }
  async getQuota() { return this.request('GET', '/quota'); }
  async requestQuotaIncrease(instanceType, quantity, reason) {
    return this.request('POST', '/quota/increase', { instance_type: instanceType, quantity, reason });
  }

  // Status
  async getApiStatus() { return this.request('GET', '/status'); }
}

module.exports = LambdaLabsCloudIntegration;
