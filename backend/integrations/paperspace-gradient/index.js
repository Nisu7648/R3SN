const axios = require('axios');

class PaperspaceGradientIntegration {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.paperspace.io';
  }

  getHeaders() {
    return { 'X-API-Key': this.apiKey, 'Content-Type': 'application/json' };
  }

  async request(method, path, data = null, params = {}) {
    try {
      const response = await axios({ method, url: `${this.baseUrl}${path}`, headers: this.getHeaders(), data, params });
      return { success: true, data: response.data };
    } catch (error) {
      throw new Error(`Paperspace API error: ${error.response?.data?.error || error.message}`);
    }
  }

  // Machine Management
  async listMachines() { return this.request('GET', '/machines/getMachines'); }
  async getMachine(machineId) { return this.request('GET', '/machines/getMachinePublic', null, { machineId }); }
  async createMachine(region, machineType, size, billingType = 'hourly') {
    return this.request('POST', '/machines/createSingleMachinePublic', { region, machineType, size, billingType });
  }
  async startMachine(machineId) { return this.request('POST', `/machines/${machineId}/start`); }
  async stopMachine(machineId) { return this.request('POST', `/machines/${machineId}/stop`); }
  async destroyMachine(machineId) { return this.request('POST', `/machines/${machineId}/destroyMachine`); }

  // Notebooks (Jupyter)
  async listNotebooks() { return this.request('GET', '/notebooks/list'); }
  async createNotebook(machineType, container, name) {
    return this.request('POST', '/notebooks/create', { machineType, container, name });
  }
  async startNotebook(notebookId) { return this.request('POST', `/notebooks/${notebookId}/start`); }
  async stopNotebook(notebookId) { return this.request('POST', `/notebooks/${notebookId}/stop`); }
  async forkNotebook(notebookId) { return this.request('POST', `/notebooks/${notebookId}/fork`); }

  // Experiments (Training)
  async listExperiments(projectId) { return this.request('GET', '/experiments/list', null, { projectId }); }
  async createExperiment(projectId, experimentTypeId, workerContainer, workerMachineType, workerCommand) {
    return this.request('POST', '/experiments/createExperiment', {
      projectId,
      experimentTypeId,
      workerContainer,
      workerMachineType,
      workerCommand,
    });
  }
  async getExperiment(experimentId) { return this.request('GET', `/experiments/${experimentId}`); }
  async getExperimentLogs(experimentId) { return this.request('GET', `/experiments/${experimentId}/logs`); }

  // Jobs
  async listJobs(projectId) { return this.request('GET', '/jobs/list', null, { projectId }); }
  async createJob(projectId, name, machineType, container, command) {
    return this.request('POST', '/jobs/createJob', { projectId, name, machineType, container, command });
  }
  async getJob(jobId) { return this.request('GET', `/jobs/${jobId}`); }
  async cloneJob(jobId) { return this.request('POST', `/jobs/${jobId}/clone`); }

  // Deployments (Inference)
  async listDeployments() { return this.request('GET', '/deployments/list'); }
  async createDeployment(name, projectId, modelId, machineType, instanceCount = 1) {
    return this.request('POST', '/deployments/create', { name, projectId, modelId, machineType, instanceCount });
  }
  async getDeployment(deploymentId) { return this.request('GET', `/deployments/${deploymentId}`); }
  async updateDeployment(deploymentId, updates) { return this.request('PUT', `/deployments/${deploymentId}`, updates); }
  async deleteDeployment(deploymentId) { return this.request('DELETE', `/deployments/${deploymentId}`); }

  // Models
  async listModels(projectId) { return this.request('GET', '/models/list', null, { projectId }); }
  async createModel(name, projectId, modelPath) { return this.request('POST', '/models/create', { name, projectId, modelPath }); }
  async getModel(modelId) { return this.request('GET', `/models/${modelId}`); }

  // Datasets
  async listDatasets() { return this.request('GET', '/datasets/list'); }
  async createDataset(name, storageProviderId) { return this.request('POST', '/datasets/create', { name, storageProviderId }); }

  // Usage & Billing
  async getUsage() { return this.request('GET', '/usage'); }

  // Teams
  async listTeams() { return this.request('GET', '/teams/list'); }

  // API Keys
  async getApiKey() { return this.request('GET', '/apiKeys/list'); }
}

module.exports = PaperspaceGradientIntegration;
