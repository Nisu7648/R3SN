const axios = require('axios');

class GoogleColabProIntegration {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseUrl = 'https://colab.research.google.com/api/v1';
  }

  getHeaders() {
    return { 'Authorization': `Bearer ${this.accessToken}`, 'Content-Type': 'application/json' };
  }

  async request(method, path, data = null) {
    try {
      const response = await axios({ method, url: `${this.baseUrl}${path}`, headers: this.getHeaders(), data });
      return { success: true, data: response.data };
    } catch (error) {
      throw new Error(`Colab API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Notebook Management
  async listNotebooks() { return this.request('GET', '/notebooks'); }
  async getNotebook(notebookId) { return this.request('GET', `/notebooks/${notebookId}`); }
  async createNotebook(name, content = '') { return this.request('POST', '/notebooks', { name, content }); }
  async updateNotebook(notebookId, updates) { return this.request('PATCH', `/notebooks/${notebookId}`, updates); }
  async deleteNotebook(notebookId) { return this.request('DELETE', `/notebooks/${notebookId}`); }
  async executeCell(notebookId, cellId, code) {
    return this.request('POST', `/notebooks/${notebookId}/execute`, { cell_id: cellId, code });
  }

  // Runtime Management
  async getRuntime(runtimeId) { return this.request('GET', `/runtimes/${runtimeId}`); }
  async createRuntime(type = 'GPU') { return this.request('POST', '/runtimes', { runtime_type: type }); }
  async connectRuntime(runtimeId) { return this.request('POST', `/runtimes/${runtimeId}/connect`); }
  async disconnectRuntime(runtimeId) { return this.request('POST', `/runtimes/${runtimeId}/disconnect`); }
  async restartRuntime(runtimeId) { return this.request('POST', `/runtimes/${runtimeId}/restart`); }
  async changeRuntimeType(runtimeId, newType) {
    return this.request('POST', `/runtimes/${runtimeId}/change-type`, { runtime_type: newType });
  }

  // Hardware Info
  async getGpuInfo(runtimeId) { return this.request('GET', `/runtimes/${runtimeId}/gpu`); }
  async getTpuInfo(runtimeId) { return this.request('GET', `/runtimes/${runtimeId}/tpu`); }

  // File Management
  async uploadFile(file, path = '/content') {
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);
    return this.request('POST', '/files/upload', formData);
  }
  async downloadFile(fileId) { return this.request('GET', `/files/${fileId}/download`); }
  async listFiles() { return this.request('GET', '/files'); }
  async deleteFile(fileId) { return this.request('DELETE', `/files/${fileId}`); }

  // Google Drive Integration
  async mountDrive() { return this.request('POST', '/drive/mount'); }
  async unmountDrive() { return this.request('POST', '/drive/unmount'); }

  // Package Management
  async installPackage(packageName, version = 'latest') {
    return this.request('POST', '/packages/install', { package: packageName, version });
  }
  async listPackages() { return this.request('GET', '/packages'); }

  // System Info
  async getSystemInfo() { return this.request('GET', '/system/info'); }
  async getResourceUsage() { return this.request('GET', '/system/resources'); }

  // Sharing & Collaboration
  async shareNotebook(notebookId, email, role = 'reader') {
    return this.request('POST', `/notebooks/${notebookId}/share`, { email, role });
  }
  async cloneNotebook(notebookId) { return this.request('POST', `/notebooks/${notebookId}/clone`); }

  // Import/Export
  async exportNotebook(notebookId, format = 'ipynb') {
    return this.request('GET', `/notebooks/${notebookId}/export?format=${format}`);
  }
  async importNotebook(source, type = 'github') {
    return this.request('POST', '/notebooks/import', { source, type });
  }

  // Usage & Billing
  async getUsageStats() { return this.request('GET', '/usage'); }
  async getComputeUnits() { return this.request('GET', '/compute-units'); }
}

module.exports = GoogleColabProIntegration;
