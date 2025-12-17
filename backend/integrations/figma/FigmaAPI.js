/**
 * Figma API Integration
 * Complete design collaboration and file management
 */

const axios = require('axios');

class FigmaAPI {
  constructor(accessToken) {
    this.accessToken = accessToken || process.env.FIGMA_ACCESS_TOKEN;
    this.baseURL = 'https://api.figma.com/v1';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'X-Figma-Token': this.accessToken,
        'Content-Type': 'application/json'
      }
    });
  }

  // ==================== FILES ====================

  async getFile(fileKey, options = {}) {
    const params = {
      ...(options.version && { version: options.version }),
      ...(options.ids && { ids: options.ids.join(',') }),
      ...(options.depth && { depth: options.depth }),
      ...(options.geometry && { geometry: options.geometry }),
      ...(options.plugin_data && { plugin_data: options.plugin_data }),
      ...(options.branch_data && { branch_data: options.branch_data })
    };

    const response = await this.client.get(`/files/${fileKey}`, { params });
    return { success: true, file: response.data };
  }

  async getFileNodes(fileKey, nodeIds, options = {}) {
    const params = {
      ids: nodeIds.join(','),
      ...(options.version && { version: options.version }),
      ...(options.depth && { depth: options.depth }),
      ...(options.geometry && { geometry: options.geometry }),
      ...(options.plugin_data && { plugin_data: options.plugin_data })
    };

    const response = await this.client.get(`/files/${fileKey}/nodes`, { params });
    return { success: true, nodes: response.data.nodes };
  }

  async getImages(fileKey, options = {}) {
    const params = {
      ids: options.ids.join(','),
      scale: options.scale || 1,
      format: options.format || 'png',
      ...(options.svg_include_id && { svg_include_id: options.svg_include_id }),
      ...(options.svg_simplify_stroke && { svg_simplify_stroke: options.svg_simplify_stroke }),
      ...(options.use_absolute_bounds && { use_absolute_bounds: options.use_absolute_bounds }),
      ...(options.version && { version: options.version })
    };

    const response = await this.client.get(`/images/${fileKey}`, { params });
    return { success: true, images: response.data.images };
  }

  async getImageFills(fileKey) {
    const response = await this.client.get(`/files/${fileKey}/images`);
    return { success: true, meta: response.data.meta };
  }

  // ==================== COMMENTS ====================

  async getComments(fileKey) {
    const response = await this.client.get(`/files/${fileKey}/comments`);
    return { success: true, comments: response.data.comments };
  }

  async postComment(fileKey, data) {
    const payload = {
      message: data.message,
      client_meta: data.client_meta,
      ...(data.comment_id && { comment_id: data.comment_id })
    };

    const response = await this.client.post(`/files/${fileKey}/comments`, payload);
    return { success: true, comment: response.data };
  }

  async deleteComment(fileKey, commentId) {
    await this.client.delete(`/files/${fileKey}/comments/${commentId}`);
    return { success: true, message: 'Comment deleted successfully' };
  }

  async getCommentReactions(fileKey, commentId) {
    const response = await this.client.get(`/files/${fileKey}/comments/${commentId}/reactions`);
    return { success: true, reactions: response.data.reactions };
  }

  async postCommentReaction(fileKey, commentId, emoji) {
    const payload = { emoji };
    const response = await this.client.post(`/files/${fileKey}/comments/${commentId}/reactions`, payload);
    return { success: true, reaction: response.data };
  }

  async deleteCommentReaction(fileKey, commentId, emoji) {
    await this.client.delete(`/files/${fileKey}/comments/${commentId}/reactions`, {
      data: { emoji }
    });
    return { success: true, message: 'Reaction deleted successfully' };
  }

  // ==================== USERS ====================

  async getMe() {
    const response = await this.client.get('/me');
    return { success: true, user: response.data };
  }

  // ==================== VERSION HISTORY ====================

  async getFileVersions(fileKey) {
    const response = await this.client.get(`/files/${fileKey}/versions`);
    return { success: true, versions: response.data.versions };
  }

  // ==================== PROJECTS ====================

  async getTeamProjects(teamId, options = {}) {
    const params = {
      ...(options.page_size && { page_size: options.page_size })
    };

    const response = await this.client.get(`/teams/${teamId}/projects`, { params });
    return { success: true, projects: response.data.projects };
  }

  async getProjectFiles(projectId, options = {}) {
    const params = {
      ...(options.branch_data && { branch_data: options.branch_data })
    };

    const response = await this.client.get(`/projects/${projectId}/files`, { params });
    return { success: true, files: response.data.files };
  }

  // ==================== COMPONENTS ====================

  async getTeamComponents(teamId, options = {}) {
    const params = {
      ...(options.page_size && { page_size: options.page_size }),
      ...(options.after && { after: options.after }),
      ...(options.before && { before: options.before })
    };

    const response = await this.client.get(`/teams/${teamId}/components`, { params });
    return { success: true, components: response.data.meta.components };
  }

  async getFileComponents(fileKey) {
    const response = await this.client.get(`/files/${fileKey}/components`);
    return { success: true, components: response.data.meta.components };
  }

  async getComponent(componentKey) {
    const response = await this.client.get(`/components/${componentKey}`);
    return { success: true, component: response.data.meta };
  }

  // ==================== COMPONENT SETS ====================

  async getTeamComponentSets(teamId, options = {}) {
    const params = {
      ...(options.page_size && { page_size: options.page_size }),
      ...(options.after && { after: options.after }),
      ...(options.before && { before: options.before })
    };

    const response = await this.client.get(`/teams/${teamId}/component_sets`, { params });
    return { success: true, component_sets: response.data.meta.component_sets };
  }

  async getFileComponentSets(fileKey) {
    const response = await this.client.get(`/files/${fileKey}/component_sets`);
    return { success: true, component_sets: response.data.meta.component_sets };
  }

  async getComponentSet(componentSetKey) {
    const response = await this.client.get(`/component_sets/${componentSetKey}`);
    return { success: true, component_set: response.data.meta };
  }

  // ==================== STYLES ====================

  async getTeamStyles(teamId, options = {}) {
    const params = {
      ...(options.page_size && { page_size: options.page_size }),
      ...(options.after && { after: options.after }),
      ...(options.before && { before: options.before })
    };

    const response = await this.client.get(`/teams/${teamId}/styles`, { params });
    return { success: true, styles: response.data.meta.styles };
  }

  async getFileStyles(fileKey) {
    const response = await this.client.get(`/files/${fileKey}/styles`);
    return { success: true, styles: response.data.meta.styles };
  }

  async getStyle(styleKey) {
    const response = await this.client.get(`/styles/${styleKey}`);
    return { success: true, style: response.data.meta };
  }

  // ==================== WEBHOOKS ====================

  async createWebhook(data) {
    const payload = {
      event_type: data.event_type,
      team_id: data.team_id,
      endpoint: data.endpoint,
      passcode: data.passcode,
      ...(data.description && { description: data.description })
    };

    const response = await this.client.post('/webhooks', payload);
    return { success: true, webhook: response.data };
  }

  async getWebhook(webhookId) {
    const response = await this.client.get(`/webhooks/${webhookId}`);
    return { success: true, webhook: response.data };
  }

  async updateWebhook(webhookId, data) {
    const payload = {
      ...(data.event_type && { event_type: data.event_type }),
      ...(data.endpoint && { endpoint: data.endpoint }),
      ...(data.passcode && { passcode: data.passcode }),
      ...(data.description && { description: data.description }),
      ...(data.status && { status: data.status })
    };

    const response = await this.client.put(`/webhooks/${webhookId}`, payload);
    return { success: true, webhook: response.data };
  }

  async deleteWebhook(webhookId) {
    await this.client.delete(`/webhooks/${webhookId}`);
    return { success: true, message: 'Webhook deleted successfully' };
  }

  async listWebhooks(teamId) {
    const response = await this.client.get(`/teams/${teamId}/webhooks`);
    return { success: true, webhooks: response.data.webhooks };
  }

  async getWebhookRequests(webhookId) {
    const response = await this.client.get(`/webhooks/${webhookId}/requests`);
    return { success: true, requests: response.data.requests };
  }

  // ==================== ACTIVITY LOGS ====================

  async getActivityLogs(teamId, options = {}) {
    const params = {
      ...(options.page_size && { page_size: options.page_size }),
      ...(options.cursor && { cursor: options.cursor })
    };

    const response = await this.client.get(`/teams/${teamId}/activity_logs`, { params });
    return { success: true, activity_logs: response.data.activity_logs };
  }

  // ==================== PAYMENTS ====================

  async getPaymentInformation(teamId) {
    const response = await this.client.get(`/teams/${teamId}/payment_information`);
    return { success: true, payment_info: response.data };
  }

  // ==================== LIBRARY ANALYTICS ====================

  async getLibraryAnalyticsComponentActions(teamId, options = {}) {
    const params = {
      ...(options.component_key && { component_key: options.component_key }),
      ...(options.start_date && { start_date: options.start_date }),
      ...(options.end_date && { end_date: options.end_date })
    };

    const response = await this.client.get(`/teams/${teamId}/library_analytics/component_actions`, { params });
    return { success: true, actions: response.data.actions };
  }

  async getLibraryAnalyticsComponentUsages(teamId, options = {}) {
    const params = {
      ...(options.component_key && { component_key: options.component_key }),
      ...(options.start_date && { start_date: options.start_date }),
      ...(options.end_date && { end_date: options.end_date })
    };

    const response = await this.client.get(`/teams/${teamId}/library_analytics/component_usages`, { params });
    return { success: true, usages: response.data.usages };
  }

  async getLibraryAnalyticsStyleActions(teamId, options = {}) {
    const params = {
      ...(options.style_key && { style_key: options.style_key }),
      ...(options.start_date && { start_date: options.start_date }),
      ...(options.end_date && { end_date: options.end_date })
    };

    const response = await this.client.get(`/teams/${teamId}/library_analytics/style_actions`, { params });
    return { success: true, actions: response.data.actions };
  }

  async getLibraryAnalyticsStyleUsages(teamId, options = {}) {
    const params = {
      ...(options.style_key && { style_key: options.style_key }),
      ...(options.start_date && { start_date: options.start_date }),
      ...(options.end_date && { end_date: options.end_date })
    };

    const response = await this.client.get(`/teams/${teamId}/library_analytics/style_usages`, { params });
    return { success: true, usages: response.data.usages };
  }

  // ==================== DEV RESOURCES ====================

  async getDevResources(fileKey, options = {}) {
    const params = {
      ...(options.node_id && { node_id: options.node_id })
    };

    const response = await this.client.get(`/files/${fileKey}/dev_resources`, { params });
    return { success: true, dev_resources: response.data.dev_resources };
  }

  async createDevResource(fileKey, data) {
    const payload = {
      node_id: data.node_id,
      name: data.name,
      url: data.url,
      ...(data.description && { description: data.description })
    };

    const response = await this.client.post(`/files/${fileKey}/dev_resources`, payload);
    return { success: true, dev_resource: response.data };
  }

  async updateDevResource(fileKey, devResourceId, data) {
    const payload = {
      ...(data.name && { name: data.name }),
      ...(data.url && { url: data.url }),
      ...(data.description && { description: data.description })
    };

    const response = await this.client.put(`/files/${fileKey}/dev_resources/${devResourceId}`, payload);
    return { success: true, dev_resource: response.data };
  }

  async deleteDevResource(fileKey, devResourceId) {
    await this.client.delete(`/files/${fileKey}/dev_resources/${devResourceId}`);
    return { success: true, message: 'Dev resource deleted successfully' };
  }

  // ==================== VARIABLES ====================

  async getLocalVariables(fileKey) {
    const response = await this.client.get(`/files/${fileKey}/variables/local`);
    return { success: true, variables: response.data.meta.variables };
  }

  async getPublishedVariables(fileKey) {
    const response = await this.client.get(`/files/${fileKey}/variables/published`);
    return { success: true, variables: response.data.meta.variables };
  }

  async postVariables(fileKey, data) {
    const payload = {
      variable_collections: data.variable_collections,
      variable_modes: data.variable_modes,
      variables: data.variables
    };

    const response = await this.client.post(`/files/${fileKey}/variables`, payload);
    return { success: true, result: response.data };
  }
}

module.exports = FigmaAPI;
