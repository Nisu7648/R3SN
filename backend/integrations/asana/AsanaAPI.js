/**
 * Asana Integration - Complete Implementation
 * Project management and task tracking
 */

const axios = require('axios');

class AsanaIntegration {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseUrl = 'https://app.asana.com/api/1.0';
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // Workspaces
  async getWorkspaces() {
    const response = await this.client.get('/workspaces');
    return response.data.data;
  }

  async getWorkspace(workspaceId) {
    const response = await this.client.get(`/workspaces/${workspaceId}`);
    return response.data.data;
  }

  // Projects
  async getProjects(workspaceId) {
    const response = await this.client.get('/projects', {
      params: { workspace: workspaceId }
    });
    return response.data.data;
  }

  async createProject(workspaceId, name, notes = '') {
    const response = await this.client.post('/projects', {
      data: {
        workspace: workspaceId,
        name,
        notes,
        public: true
      }
    });
    return response.data.data;
  }

  async updateProject(projectId, updates) {
    const response = await this.client.put(`/projects/${projectId}`, {
      data: updates
    });
    return response.data.data;
  }

  async deleteProject(projectId) {
    await this.client.delete(`/projects/${projectId}`);
    return { success: true };
  }

  // Tasks
  async getTasks(projectId) {
    const response = await this.client.get('/tasks', {
      params: { project: projectId }
    });
    return response.data.data;
  }

  async getTask(taskId) {
    const response = await this.client.get(`/tasks/${taskId}`);
    return response.data.data;
  }

  async createTask(projectId, name, notes = '', assignee = null, dueOn = null) {
    const response = await this.client.post('/tasks', {
      data: {
        projects: [projectId],
        name,
        notes,
        assignee,
        due_on: dueOn
      }
    });
    return response.data.data;
  }

  async updateTask(taskId, updates) {
    const response = await this.client.put(`/tasks/${taskId}`, {
      data: updates
    });
    return response.data.data;
  }

  async deleteTask(taskId) {
    await this.client.delete(`/tasks/${taskId}`);
    return { success: true };
  }

  async completeTask(taskId) {
    return this.updateTask(taskId, { completed: true });
  }

  // Sections
  async getSections(projectId) {
    const response = await this.client.get(`/projects/${projectId}/sections`);
    return response.data.data;
  }

  async createSection(projectId, name) {
    const response = await this.client.post(`/projects/${projectId}/sections`, {
      data: { name }
    });
    return response.data.data;
  }

  // Tags
  async getTags(workspaceId) {
    const response = await this.client.get('/tags', {
      params: { workspace: workspaceId }
    });
    return response.data.data;
  }

  async createTag(workspaceId, name, color = 'light-green') {
    const response = await this.client.post('/tags', {
      data: {
        workspace: workspaceId,
        name,
        color
      }
    });
    return response.data.data;
  }

  // Users
  async getUsers(workspaceId) {
    const response = await this.client.get(`/workspaces/${workspaceId}/users`);
    return response.data.data;
  }

  async getMe() {
    const response = await this.client.get('/users/me');
    return response.data.data;
  }

  // Comments
  async addComment(taskId, text) {
    const response = await this.client.post(`/tasks/${taskId}/stories`, {
      data: { text }
    });
    return response.data.data;
  }

  async getComments(taskId) {
    const response = await this.client.get(`/tasks/${taskId}/stories`);
    return response.data.data;
  }

  // Attachments
  async addAttachment(taskId, fileUrl, name) {
    const response = await this.client.post(`/tasks/${taskId}/attachments`, {
      data: {
        resource_subtype: 'external',
        name,
        url: fileUrl
      }
    });
    return response.data.data;
  }

  async getAttachments(taskId) {
    const response = await this.client.get(`/tasks/${taskId}/attachments`);
    return response.data.data;
  }

  // Subtasks
  async getSubtasks(taskId) {
    const response = await this.client.get(`/tasks/${taskId}/subtasks`);
    return response.data.data;
  }

  async createSubtask(parentTaskId, name, notes = '') {
    const response = await this.client.post(`/tasks/${parentTaskId}/subtasks`, {
      data: { name, notes }
    });
    return response.data.data;
  }

  // Search
  async searchTasks(workspaceId, query) {
    const response = await this.client.get('/tasks', {
      params: {
        workspace: workspaceId,
        text: query
      }
    });
    return response.data.data;
  }

  // Portfolios
  async getPortfolios(workspaceId) {
    const response = await this.client.get('/portfolios', {
      params: { workspace: workspaceId }
    });
    return response.data.data;
  }

  async createPortfolio(workspaceId, name, color = 'light-green') {
    const response = await this.client.post('/portfolios', {
      data: {
        workspace: workspaceId,
        name,
        color
      }
    });
    return response.data.data;
  }

  // Teams
  async getTeams(organizationId) {
    const response = await this.client.get(`/organizations/${organizationId}/teams`);
    return response.data.data;
  }

  // Custom Fields
  async getCustomFields(workspaceId) {
    const response = await this.client.get('/custom_fields', {
      params: { workspace: workspaceId }
    });
    return response.data.data;
  }

  async createCustomField(workspaceId, name, type, options = []) {
    const response = await this.client.post('/custom_fields', {
      data: {
        workspace: workspaceId,
        name,
        resource_subtype: type,
        enum_options: options
      }
    });
    return response.data.data;
  }
}

module.exports = AsanaIntegration;
