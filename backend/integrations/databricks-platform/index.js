/**
 * Databricks Data & AI Platform Integration
 * Save $1500+/month - Unified analytics platform
 */

const axios = require('axios');

class DatabricksPlatformIntegration {
  constructor(config) {
    this.host = config.host || process.env.DATABRICKS_HOST;
    this.token = config.token || process.env.DATABRICKS_TOKEN;
    
    if (!this.host || !this.token) {
      throw new Error('Databricks credentials required');
    }
    
    this.baseURL = `https://${this.host}/api/2.0`;
  }

  async makeRequest(method, endpoint, data = null) {
    const config = {
      method,
      url: `${this.baseURL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    };

    if (data) config.data = data;

    try {
      const response = await axios(config);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message };
    }
  }

  async createCluster(clusterName, sparkVersion, nodeTypeId, numWorkers = 2) {
    return await this.makeRequest('POST', '/clusters/create', {
      cluster_name: clusterName,
      spark_version: sparkVersion,
      node_type_id: nodeTypeId,
      num_workers: numWorkers,
      autotermination_minutes: 120
    });
  }

  async listClusters() {
    return await this.makeRequest('GET', '/clusters/list');
  }

  async getCluster(clusterId) {
    return await this.makeRequest('GET', `/clusters/get?cluster_id=${clusterId}`);
  }

  async startCluster(clusterId) {
    return await this.makeRequest('POST', '/clusters/start', { cluster_id: clusterId });
  }

  async terminateCluster(clusterId) {
    return await this.makeRequest('POST', '/clusters/delete', { cluster_id: clusterId });
  }

  async createJob(jobName, tasks) {
    return await this.makeRequest('POST', '/jobs/create', {
      name: jobName,
      tasks
    });
  }

  async listJobs() {
    return await this.makeRequest('GET', '/jobs/list');
  }

  async runJob(jobId, params = {}) {
    return await this.makeRequest('POST', '/jobs/run-now', {
      job_id: jobId,
      ...params
    });
  }

  async getJobRun(runId) {
    return await this.makeRequest('GET', `/jobs/runs/get?run_id=${runId}`);
  }

  async cancelJobRun(runId) {
    return await this.makeRequest('POST', '/jobs/runs/cancel', { run_id: runId });
  }

  async uploadFile(path, content) {
    return await this.makeRequest('POST', '/dbfs/put', {
      path,
      contents: Buffer.from(content).toString('base64'),
      overwrite: true
    });
  }

  async readFile(path) {
    return await this.makeRequest('GET', `/dbfs/read?path=${path}`);
  }

  async listFiles(path) {
    return await this.makeRequest('GET', `/dbfs/list?path=${path}`);
  }

  async deleteFile(path) {
    return await this.makeRequest('POST', '/dbfs/delete', { path, recursive: false });
  }

  async executeSQL(warehouseId, statement) {
    return await this.makeRequest('POST', '/sql/statements', {
      warehouse_id: warehouseId,
      statement
    });
  }

  async getStatementResult(statementId) {
    return await this.makeRequest('GET', `/sql/statements/${statementId}`);
  }

  async createNotebook(path, language = 'PYTHON') {
    return await this.makeRequest('POST', '/workspace/mkdirs', { path });
  }

  async listNotebooks(path) {
    return await this.makeRequest('GET', `/workspace/list?path=${path}`);
  }

  async exportNotebook(path, format = 'SOURCE') {
    return await this.makeRequest('GET', `/workspace/export?path=${path}&format=${format}`);
  }

  async importNotebook(path, content, language = 'PYTHON') {
    return await this.makeRequest('POST', '/workspace/import', {
      path,
      content: Buffer.from(content).toString('base64'),
      language,
      format: 'SOURCE',
      overwrite: true
    });
  }
}

module.exports = DatabricksPlatformIntegration;
