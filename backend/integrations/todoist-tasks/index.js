/**
 * Todoist Task Management Integration
 * Complete task and project management
 */

const axios = require('axios');

class TodoistIntegration {
  constructor(config) {
    this.apiToken = config.apiToken || process.env.TODOIST_API_TOKEN;
    if (!this.apiToken) throw new Error('Todoist API token required');
    
    this.baseURL = 'https://api.todoist.com/rest/v2';
  }

  async makeRequest(method, endpoint, data = null) {
    const config = {
      method,
      url: `${this.baseURL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
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

  async getTasks(filter = {}) {
    const params = new URLSearchParams(filter).toString();
    return await this.makeRequest('GET', `/tasks${params ? '?' + params : ''}`);
  }

  async getTask(taskId) {
    return await this.makeRequest('GET', `/tasks/${taskId}`);
  }

  async createTask(content, options = {}) {
    return await this.makeRequest('POST', '/tasks', {
      content,
      ...options
    });
  }

  async updateTask(taskId, updates) {
    return await this.makeRequest('POST', `/tasks/${taskId}`, updates);
  }

  async closeTask(taskId) {
    return await this.makeRequest('POST', `/tasks/${taskId}/close`);
  }

  async reopenTask(taskId) {
    return await this.makeRequest('POST', `/tasks/${taskId}/reopen`);
  }

  async deleteTask(taskId) {
    return await this.makeRequest('DELETE', `/tasks/${taskId}`);
  }

  async getProjects() {
    return await this.makeRequest('GET', '/projects');
  }

  async getProject(projectId) {
    return await this.makeRequest('GET', `/projects/${projectId}`);
  }

  async createProject(name, options = {}) {
    return await this.makeRequest('POST', '/projects', {
      name,
      ...options
    });
  }

  async updateProject(projectId, updates) {
    return await this.makeRequest('POST', `/projects/${projectId}`, updates);
  }

  async deleteProject(projectId) {
    return await this.makeRequest('DELETE', `/projects/${projectId}`);
  }

  async getSections(projectId = null) {
    const params = projectId ? `?project_id=${projectId}` : '';
    return await this.makeRequest('GET', `/sections${params}`);
  }

  async createSection(name, projectId) {
    return await this.makeRequest('POST', '/sections', {
      name,
      project_id: projectId
    });
  }

  async updateSection(sectionId, name) {
    return await this.makeRequest('POST', `/sections/${sectionId}`, { name });
  }

  async deleteSection(sectionId) {
    return await this.makeRequest('DELETE', `/sections/${sectionId}`);
  }

  async getLabels() {
    return await this.makeRequest('GET', '/labels');
  }

  async createLabel(name, options = {}) {
    return await this.makeRequest('POST', '/labels', {
      name,
      ...options
    });
  }

  async updateLabel(labelId, updates) {
    return await this.makeRequest('POST', `/labels/${labelId}`, updates);
  }

  async deleteLabel(labelId) {
    return await this.makeRequest('DELETE', `/labels/${labelId}`);
  }

  async getComments(taskId = null, projectId = null) {
    let params = '';
    if (taskId) params = `?task_id=${taskId}`;
    else if (projectId) params = `?project_id=${projectId}`;
    
    return await this.makeRequest('GET', `/comments${params}`);
  }

  async createComment(content, taskId = null, projectId = null) {
    const data = { content };
    if (taskId) data.task_id = taskId;
    if (projectId) data.project_id = projectId;
    
    return await this.makeRequest('POST', '/comments', data);
  }

  async updateComment(commentId, content) {
    return await this.makeRequest('POST', `/comments/${commentId}`, { content });
  }

  async deleteComment(commentId) {
    return await this.makeRequest('DELETE', `/comments/${commentId}`);
  }
}

module.exports = TodoistIntegration;
