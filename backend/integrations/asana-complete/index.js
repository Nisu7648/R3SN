const axios = require('axios');

class AsanaIntegration {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseURL = 'https://app.asana.com/api/1.0';
    this.headers = { 'Authorization': `Bearer ${accessToken}` };
  }

  async getWorkspaces() {
    const response = await axios.get(`${this.baseURL}/workspaces`, {
      headers: this.headers
    });
    return response.data;
  }

  async getProjects(workspaceId) {
    const response = await axios.get(`${this.baseURL}/projects`, {
      headers: this.headers,
      params: { workspace: workspaceId }
    });
    return response.data;
  }

  async createProject(workspaceId, name, notes = '') {
    const response = await axios.post(
      `${this.baseURL}/projects`,
      { data: { workspace: workspaceId, name, notes } },
      { headers: this.headers }
    );
    return response.data;
  }

  async getTasks(projectId) {
    const response = await axios.get(`${this.baseURL}/tasks`, {
      headers: this.headers,
      params: { project: projectId }
    });
    return response.data;
  }

  async createTask(workspaceId, name, notes = '', assignee = null) {
    const response = await axios.post(
      `${this.baseURL}/tasks`,
      { data: { workspace: workspaceId, name, notes, assignee } },
      { headers: this.headers }
    );
    return response.data;
  }

  async updateTask(taskId, updates) {
    const response = await axios.put(
      `${this.baseURL}/tasks/${taskId}`,
      { data: updates },
      { headers: this.headers }
    );
    return response.data;
  }

  async deleteTask(taskId) {
    const response = await axios.delete(`${this.baseURL}/tasks/${taskId}`, {
      headers: this.headers
    });
    return response.data;
  }

  async getUsers(workspaceId) {
    const response = await axios.get(`${this.baseURL}/workspaces/${workspaceId}/users`, {
      headers: this.headers
    });
    return response.data;
  }
}

module.exports = AsanaIntegration;
