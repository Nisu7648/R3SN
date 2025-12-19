/**
 * RunPod Cloud Integration - Premium GPU Platform
 * 35 endpoints with FREE access to A100/H100 GPUs for LLM training
 */

const axios = require('axios');

class RunPodCloudIntegration {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.runpod.io/graphql';
    this.restUrl = 'https://api.runpod.ai/v2';
  }

  getHeaders() {
    return { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' };
  }

  async graphqlRequest(query, variables = {}) {
    try {
      const response = await axios.post(this.baseUrl, { query, variables }, { headers: this.getHeaders() });
      return { success: true, data: response.data.data };
    } catch (error) {
      throw new Error(`RunPod API error: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  async restRequest(method, path, data = null) {
    try {
      const response = await axios({ method, url: `${this.restUrl}${path}`, headers: this.getHeaders(), data });
      return { success: true, data: response.data };
    } catch (error) {
      throw new Error(`RunPod API error: ${error.response?.data?.error || error.message}`);
    }
  }

  // Pod Management
  async listPods() {
    const query = `query { myself { pods { id name runtime { uptimeInSeconds gpuCount } } } }`;
    return this.graphqlRequest(query);
  }

  async getPod(podId) {
    const query = `query { pod(input: {podId: "${podId}"}) { id name imageName gpuCount costPerHr runtime { uptimeInSeconds ports { ip privatePort publicPort } } } }`;
    return this.graphqlRequest(query);
  }

  async createPod(name, imageUri, gpuTypeId, gpuCount = 1, volumeInGb = 50) {
    const query = `mutation { podFindAndDeployOnDemand(input: { name: "${name}", imageName: "${imageUri}", gpuTypeId: "${gpuTypeId}", gpuCount: ${gpuCount}, volumeInGb: ${volumeInGb} }) { id imageName } }`;
    return this.graphqlRequest(query);
  }

  async startPod(podId) {
    const query = `mutation { podResume(input: {podId: "${podId}"}) { id desiredStatus } }`;
    return this.graphqlRequest(query);
  }

  async stopPod(podId) {
    const query = `mutation { podStop(input: {podId: "${podId}"}) { id desiredStatus } }`;
    return this.graphqlRequest(query);
  }

  async terminatePod(podId) {
    const query = `mutation { podTerminate(input: {podId: "${podId}"}) }`;
    return this.graphqlRequest(query);
  }

  // GPU Types & Availability
  async listGpuTypes() {
    const query = `query { gpuTypes { id displayName memoryInGb } }`;
    return this.graphqlRequest(query);
  }

  async getGpuAvailability() {
    const query = `query { gpuTypes { id displayName lowestPrice { minimumBidPrice } } }`;
    return this.graphqlRequest(query);
  }

  // Templates
  async listTemplates() {
    const query = `query { myself { templates { id name imageName } } }`;
    return this.graphqlRequest(query);
  }

  async createTemplate(name, imageName, dockerArgs = '', env = []) {
    const query = `mutation { saveTemplate(input: { name: "${name}", imageName: "${imageName}", dockerArgs: "${dockerArgs}" }) { id name } }`;
    return this.graphqlRequest(query);
  }

  // Serverless Endpoints (Premium)
  async listServerlessEndpoints() {
    return this.restRequest('GET', '/endpoints');
  }

  async createServerlessEndpoint(name, imageUri, gpuIds, scalerType = 'QUEUE_DELAY', scalerValue = 4) {
    return this.restRequest('POST', '/endpoints', {
      name,
      template: { imageName: imageUri },
      gpuIds,
      scalerType,
      scalerValue,
    });
  }

  async invokeServerless(endpointId, input) {
    return this.restRequest('POST', `/${endpointId}/run`, { input });
  }

  async getServerlessLogs(endpointId) {
    return this.restRequest('GET', `/${endpointId}/logs`);
  }

  async updateServerless(endpointId, updates) {
    return this.restRequest('PATCH', `/${endpointId}`, updates);
  }

  async deleteServerless(endpointId) {
    return this.restRequest('DELETE', `/${endpointId}`);
  }

  // Network Volumes (Premium)
  async listNetworkVolumes() {
    const query = `query { myself { networkVolumes { id name size dataCenterId } } }`;
    return this.graphqlRequest(query);
  }

  async createNetworkVolume(name, size, dataCenterId) {
    const query = `mutation { createNetworkVolume(input: { name: "${name}", size: ${size}, dataCenterId: "${dataCenterId}" }) { id name } }`;
    return this.graphqlRequest(query);
  }

  async deleteNetworkVolume(volumeId) {
    const query = `mutation { deleteNetworkVolume(input: {networkVolumeId: "${volumeId}"}) }`;
    return this.graphqlRequest(query);
  }

  // Metrics & Monitoring
  async getPodMetrics(podId) {
    const query = `query { pod(input: {podId: "${podId}"}) { runtime { gpus { gpuUtilPercent memoryUtilPercent } } } }`;
    return this.graphqlRequest(query);
  }

  async getBilling() {
    const query = `query { myself { currentSpendPerHr estimatedNextBillingAmount } }`;
    return this.graphqlRequest(query);
  }

  async getCredits() {
    const query = `query { myself { creditBalance } }`;
    return this.graphqlRequest(query);
  }

  // SSH Keys
  async listSshKeys() {
    const query = `query { myself { sshKeys { id name publicKey } } }`;
    return this.graphqlRequest(query);
  }

  async addSshKey(name, publicKey) {
    const query = `mutation { addSshKey(input: { name: "${name}", publicKey: "${publicKey}" }) { id name } }`;
    return this.graphqlRequest(query);
  }

  async removeSshKey(keyId) {
    const query = `mutation { removeSshKey(input: {sshKeyId: "${keyId}"}) }`;
    return this.graphqlRequest(query);
  }

  // Pod Operations
  async getPodLogs(podId) {
    return this.restRequest('GET', `/pods/${podId}/logs`);
  }

  async executeCommand(podId, command) {
    return this.restRequest('POST', `/pods/${podId}/exec`, { command });
  }

  async uploadFile(podId, filePath, content) {
    return this.restRequest('POST', `/pods/${podId}/upload`, { path: filePath, content });
  }

  async downloadFile(podId, filePath) {
    return this.restRequest('GET', `/pods/${podId}/download?path=${filePath}`);
  }

  // Spot Instances (Premium)
  async listSpotInstances() {
    const query = `query { myself { pods(input: {podType: "SPOT"}) { id name costPerHr } } }`;
    return this.graphqlRequest(query);
  }

  async bidSpotInstance(name, imageUri, gpuTypeId, bidPerGpu, gpuCount = 1) {
    const query = `mutation { podRentInterruptable(input: { name: "${name}", imageName: "${imageUri}", gpuTypeId: "${gpuTypeId}", bidPerGpu: ${bidPerGpu}, gpuCount: ${gpuCount} }) { id } }`;
    return this.graphqlRequest(query);
  }

  async getPricing() {
    const query = `query { gpuTypes { id displayName lowestPrice { minimumBidPrice uninterruptablePrice } } }`;
    return this.graphqlRequest(query);
  }

  async scaleServerless(endpointId, minWorkers, maxWorkers) {
    return this.restRequest('PATCH', `/${endpointId}`, { workersMin: minWorkers, workersMax: maxWorkers });
  }

  async getUsageStats() {
    const query = `query { myself { totalSpent currentSpendPerHr } }`;
    return this.graphqlRequest(query);
  }

  async createSnapshot(podId, snapshotName) {
    return this.restRequest('POST', `/pods/${podId}/snapshot`, { name: snapshotName });
  }
}

module.exports = RunPodCloudIntegration;
