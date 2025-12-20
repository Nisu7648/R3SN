const axios = require('axios');

class OracleCloudFreeIntegration {
  constructor(tenancyId, userId, fingerprint, privateKey, region = 'us-ashburn-1') {
    this.tenancyId = tenancyId;
    this.userId = userId;
    this.fingerprint = fingerprint;
    this.privateKey = privateKey;
    this.region = region;
    this.baseUrl = `https://iaas.${region}.oraclecloud.com/20160918`;
  }

  getHeaders() {
    // Oracle Cloud uses request signing - simplified for demo
    return { 'Authorization': `Signature headers="date request-target"`, 'Content-Type': 'application/json' };
  }

  async request(method, path, data = null) {
    try {
      const response = await axios({ method, url: `${this.baseUrl}${path}`, headers: this.getHeaders(), data });
      return { success: true, data: response.data };
    } catch (error) {
      throw new Error(`Oracle Cloud API error: ${error.response?.data?.message || error.message}`);
    }
  }

  // Compute Instances (FREE: 4 ARM cores + 24GB RAM)
  async listInstances(compartmentId) { return this.request('GET', `/instances?compartmentId=${compartmentId}`); }
  async getInstance(instanceId) { return this.request('GET', `/instances/${instanceId}`); }
  async createInstance(compartmentId, shape, imageId, subnetId, displayName) {
    return this.request('POST', '/instances', {
      compartmentId, shape, imageId, createVnicDetails: { subnetId }, displayName
    });
  }
  async startInstance(instanceId) { return this.request('POST', `/instances/${instanceId}?action=START`); }
  async stopInstance(instanceId) { return this.request('POST', `/instances/${instanceId}?action=STOP`); }
  async rebootInstance(instanceId) { return this.request('POST', `/instances/${instanceId}?action=REBOOT`); }
  async terminateInstance(instanceId) { return this.request('DELETE', `/instances/${instanceId}`); }

  // Shapes & Images
  async listShapes(compartmentId) { return this.request('GET', `/shapes?compartmentId=${compartmentId}`); }
  async listImages(compartmentId) { return this.request('GET', `/images?compartmentId=${compartmentId}`); }

  // Block Volumes (FREE: 200GB)
  async listVolumes(compartmentId) { return this.request('GET', `/volumes?compartmentId=${compartmentId}`); }
  async createVolume(compartmentId, availabilityDomain, sizeInGBs, displayName) {
    return this.request('POST', '/volumes', { compartmentId, availabilityDomain, sizeInGBs, displayName });
  }
  async attachVolume(instanceId, volumeId) {
    return this.request('POST', '/volumeAttachments', { instanceId, volumeId, type: 'paravirtualized' });
  }
  async detachVolume(attachmentId) { return this.request('DELETE', `/volumeAttachments/${attachmentId}`); }
  async deleteVolume(volumeId) { return this.request('DELETE', `/volumes/${volumeId}`); }

  // Networking (FREE: VCN, Subnets)
  async listVcns(compartmentId) { return this.request('GET', `/vcns?compartmentId=${compartmentId}`); }
  async createVcn(compartmentId, cidrBlock, displayName) {
    return this.request('POST', '/vcns', { compartmentId, cidrBlock, displayName });
  }
  async listSubnets(compartmentId) { return this.request('GET', `/subnets?compartmentId=${compartmentId}`); }
  async createSubnet(compartmentId, vcnId, cidrBlock, availabilityDomain, displayName) {
    return this.request('POST', '/subnets', { compartmentId, vcnId, cidrBlock, availabilityDomain, displayName });
  }

  // Security Lists
  async listSecurityLists(compartmentId) { return this.request('GET', `/securityLists?compartmentId=${compartmentId}`); }
  async createSecurityList(compartmentId, vcnId, egressRules, ingressRules, displayName) {
    return this.request('POST', '/securityLists', { compartmentId, vcnId, egressSecurityRules: egressRules, ingressSecurityRules: ingressRules, displayName });
  }

  // Object Storage (FREE: 10GB)
  async listBuckets(namespace, compartmentId) {
    return this.request('GET', `/n/${namespace}/b?compartmentId=${compartmentId}`);
  }
  async createBucket(namespace, compartmentId, name) {
    return this.request('POST', `/n/${namespace}/b`, { compartmentId, name });
  }
  async uploadObject(namespace, bucket, object, data) {
    return this.request('PUT', `/n/${namespace}/b/${bucket}/o/${object}`, data);
  }
  async downloadObject(namespace, bucket, object) {
    return this.request('GET', `/n/${namespace}/b/${bucket}/o/${object}`);
  }
  async deleteObject(namespace, bucket, object) {
    return this.request('DELETE', `/n/${namespace}/b/${bucket}/o/${object}`);
  }

  // Autonomous Database (FREE: 2 instances)
  async listDatabases(compartmentId) { return this.request('GET', `/autonomousDatabases?compartmentId=${compartmentId}`); }
  async createDatabase(compartmentId, dbName, cpuCoreCount, dataStorageSizeInTBs) {
    return this.request('POST', '/autonomousDatabases', { compartmentId, dbName, cpuCoreCount, dataStorageSizeInTBs, isFreeTier: true });
  }
  async startDatabase(dbId) { return this.request('POST', `/autonomousDatabases/${dbId}/actions/start`); }
  async stopDatabase(dbId) { return this.request('POST', `/autonomousDatabases/${dbId}/actions/stop`); }

  // Load Balancer (FREE: 1 instance)
  async listLoadBalancers(compartmentId) { return this.request('GET', `/loadBalancers?compartmentId=${compartmentId}`); }
  async createLoadBalancer(compartmentId, displayName, shape, subnetIds) {
    return this.request('POST', '/loadBalancers', { compartmentId, displayName, shapeName: shape, subnetIds });
  }

  // Functions
  async listFunctions(compartmentId) { return this.request('GET', `/functions?compartmentId=${compartmentId}`); }
  async createFunction(applicationId, displayName, image, memory) {
    return this.request('POST', '/functions', { applicationId, displayName, image, memoryInMBs: memory });
  }
  async invokeFunction(functionId, payload) {
    return this.request('POST', `/functions/${functionId}/actions/invoke`, payload);
  }

  // Usage & Monitoring
  async getUsage() { return this.request('GET', '/usage'); }
  async getCost() { return this.request('GET', '/costAnalysis'); }
  async getLimits(compartmentId) { return this.request('GET', `/limits?compartmentId=${compartmentId}`); }

  // Tenancy Info
  async listAvailabilityDomains(compartmentId) {
    return this.request('GET', `/availabilityDomains?compartmentId=${compartmentId}`);
  }
  async getTenancy() { return this.request('GET', `/tenancies/${this.tenancyId}`); }
  async getFreeTierStatus() { return this.request('GET', '/freeTier/status'); }
}

module.exports = OracleCloudFreeIntegration;
