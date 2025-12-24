/**
 * Figma Integration - Complete Implementation
 * Design and prototyping platform
 */

const axios = require('axios');

class FigmaIntegration {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseUrl = 'https://api.figma.com/v1';
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'X-Figma-Token': accessToken,
        'Content-Type': 'application/json'
      }
    });
  }

  async getFile(fileKey) {
    const response = await this.client.get(`/files/${fileKey}`);
    return response.data;
  }

  async getFileNodes(fileKey, nodeIds) {
    const response = await this.client.get(`/files/${fileKey}/nodes`, {
      params: { ids: nodeIds.join(',') }
    });
    return response.data;
  }

  async getFileImages(fileKey, nodeIds, options = {}) {
    const response = await this.client.get(`/images/${fileKey}`, {
      params: {
        ids: nodeIds.join(','),
        scale: options.scale || 1,
        format: options.format || 'png'
      }
    });
    return response.data;
  }

  async getComments(fileKey) {
    const response = await this.client.get(`/files/${fileKey}/comments`);
    return response.data.comments;
  }

  async postComment(fileKey, message, clientMeta) {
    const response = await this.client.post(`/files/${fileKey}/comments`, {
      message,
      client_meta: clientMeta
    });
    return response.data;
  }

  async getTeamProjects(teamId) {
    const response = await this.client.get(`/teams/${teamId}/projects`);
    return response.data.projects;
  }

  async getProjectFiles(projectId) {
    const response = await this.client.get(`/projects/${projectId}/files`);
    return response.data.files;
  }

  async getMe() {
    const response = await this.client.get('/me');
    return response.data;
  }
}

module.exports = FigmaIntegration;
