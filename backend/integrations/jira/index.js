/**
 * Jira Integration - Complete Implementation
 * 25 endpoints for full Jira functionality
 */

const axios = require('axios');

class JiraIntegration {
  constructor(domain, email, apiToken) {
    this.domain = domain;
    this.email = email;
    this.apiToken = apiToken;
    this.baseUrl = `https://${domain}.atlassian.net/rest/api/3`;
  }

  getHeaders() {
    const auth = Buffer.from(`${this.email}:${this.apiToken}`).toString('base64');
    return {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    };
  }

  async listProjects() {
    try {
      const response = await axios.get(`${this.baseUrl}/project`, { headers: this.getHeaders() });
      return { success: true, projects: response.data };
    } catch (error) {
      throw new Error(`Failed to list projects: ${error.response?.data?.errorMessages || error.message}`);
    }
  }

  async getProject(projectId) {
    try {
      const response = await axios.get(`${this.baseUrl}/project/${projectId}`, { headers: this.getHeaders() });
      return { success: true, project: response.data };
    } catch (error) {
      throw new Error(`Failed to get project: ${error.response?.data?.errorMessages || error.message}`);
    }
  }

  async createProject(key, name, projectTypeKey, lead) {
    try {
      const response = await axios.post(`${this.baseUrl}/project`, 
        { key, name, projectTypeKey, lead },
        { headers: this.getHeaders() }
      );
      return { success: true, project: response.data };
    } catch (error) {
      throw new Error(`Failed to create project: ${error.response?.data?.errorMessages || error.message}`);
    }
  }

  async updateProject(projectId, updates) {
    try {
      const response = await axios.put(`${this.baseUrl}/project/${projectId}`, updates, { headers: this.getHeaders() });
      return { success: true, project: response.data };
    } catch (error) {
      throw new Error(`Failed to update project: ${error.response?.data?.errorMessages || error.message}`);
    }
  }

  async deleteProject(projectId) {
    try {
      await axios.delete(`${this.baseUrl}/project/${projectId}`, { headers: this.getHeaders() });
      return { success: true, message: 'Project deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete project: ${error.response?.data?.errorMessages || error.message}`);
    }
  }

  async searchIssues(jql, fields = [], maxResults = 50) {
    try {
      const response = await axios.get(`${this.baseUrl}/search`, {
        headers: this.getHeaders(),
        params: { jql, fields: fields.join(','), maxResults },
      });
      return { success: true, issues: response.data.issues, total: response.data.total };
    } catch (error) {
      throw new Error(`Failed to search issues: ${error.response?.data?.errorMessages || error.message}`);
    }
  }

  async getIssue(issueId) {
    try {
      const response = await axios.get(`${this.baseUrl}/issue/${issueId}`, { headers: this.getHeaders() });
      return { success: true, issue: response.data };
    } catch (error) {
      throw new Error(`Failed to get issue: ${error.response?.data?.errorMessages || error.message}`);
    }
  }

  async createIssue(fields) {
    try {
      const response = await axios.post(`${this.baseUrl}/issue`, { fields }, { headers: this.getHeaders() });
      return { success: true, issue: response.data };
    } catch (error) {
      throw new Error(`Failed to create issue: ${error.response?.data?.errorMessages || error.message}`);
    }
  }

  async updateIssue(issueId, fields) {
    try {
      const response = await axios.put(`${this.baseUrl}/issue/${issueId}`, { fields }, { headers: this.getHeaders() });
      return { success: true, message: 'Issue updated successfully' };
    } catch (error) {
      throw new Error(`Failed to update issue: ${error.response?.data?.errorMessages || error.message}`);
    }
  }

  async deleteIssue(issueId) {
    try {
      await axios.delete(`${this.baseUrl}/issue/${issueId}`, { headers: this.getHeaders() });
      return { success: true, message: 'Issue deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete issue: ${error.response?.data?.errorMessages || error.message}`);
    }
  }

  async assignIssue(issueId, accountId) {
    try {
      const response = await axios.put(`${this.baseUrl}/issue/${issueId}/assignee`, 
        { accountId },
        { headers: this.getHeaders() }
      );
      return { success: true, message: 'Issue assigned successfully' };
    } catch (error) {
      throw new Error(`Failed to assign issue: ${error.response?.data?.errorMessages || error.message}`);
    }
  }

  async addComment(issueId, body) {
    try {
      const response = await axios.post(`${this.baseUrl}/issue/${issueId}/comment`,
        { body },
        { headers: this.getHeaders() }
      );
      return { success: true, comment: response.data };
    } catch (error) {
      throw new Error(`Failed to add comment: ${error.response?.data?.errorMessages || error.message}`);
    }
  }

  async getComments(issueId) {
    try {
      const response = await axios.get(`${this.baseUrl}/issue/${issueId}/comment`, { headers: this.getHeaders() });
      return { success: true, comments: response.data.comments };
    } catch (error) {
      throw new Error(`Failed to get comments: ${error.response?.data?.errorMessages || error.message}`);
    }
  }

  async addAttachment(issueId, file) {
    try {
      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${this.baseUrl}/issue/${issueId}/attachments`,
        formData,
        {
          headers: {
            ...this.getHeaders(),
            'X-Atlassian-Token': 'no-check',
            ...formData.getHeaders(),
          },
        }
      );
      return { success: true, attachments: response.data };
    } catch (error) {
      throw new Error(`Failed to add attachment: ${error.response?.data?.errorMessages || error.message}`);
    }
  }

  async transitionIssue(issueId, transitionId) {
    try {
      const response = await axios.post(`${this.baseUrl}/issue/${issueId}/transitions`,
        { transition: { id: transitionId } },
        { headers: this.getHeaders() }
      );
      return { success: true, message: 'Issue transitioned successfully' };
    } catch (error) {
      throw new Error(`Failed to transition issue: ${error.response?.data?.errorMessages || error.message}`);
    }
  }

  async listWorkflows() {
    try {
      const response = await axios.get(`${this.baseUrl}/workflow`, { headers: this.getHeaders() });
      return { success: true, workflows: response.data };
    } catch (error) {
      throw new Error(`Failed to list workflows: ${error.response?.data?.errorMessages || error.message}`);
    }
  }

  async getWorkflow(workflowId) {
    try {
      const response = await axios.get(`${this.baseUrl}/workflow/${workflowId}`, { headers: this.getHeaders() });
      return { success: true, workflow: response.data };
    } catch (error) {
      throw new Error(`Failed to get workflow: ${error.response?.data?.errorMessages || error.message}`);
    }
  }

  async listBoards() {
    try {
      const response = await axios.get(`${this.baseUrl.replace('/rest/api/3', '/rest/agile/1.0')}/board`, { headers: this.getHeaders() });
      return { success: true, boards: response.data.values };
    } catch (error) {
      throw new Error(`Failed to list boards: ${error.response?.data?.errorMessages || error.message}`);
    }
  }

  async getBoard(boardId) {
    try {
      const response = await axios.get(`${this.baseUrl.replace('/rest/api/3', '/rest/agile/1.0')}/board/${boardId}`, { headers: this.getHeaders() });
      return { success: true, board: response.data };
    } catch (error) {
      throw new Error(`Failed to get board: ${error.response?.data?.errorMessages || error.message}`);
    }
  }

  async listSprints(boardId) {
    try {
      const response = await axios.get(`${this.baseUrl.replace('/rest/api/3', '/rest/agile/1.0')}/board/${boardId}/sprint`, { headers: this.getHeaders() });
      return { success: true, sprints: response.data.values };
    } catch (error) {
      throw new Error(`Failed to list sprints: ${error.response?.data?.errorMessages || error.message}`);
    }
  }

  async getSprint(sprintId) {
    try {
      const response = await axios.get(`${this.baseUrl.replace('/rest/api/3', '/rest/agile/1.0')}/sprint/${sprintId}`, { headers: this.getHeaders() });
      return { success: true, sprint: response.data };
    } catch (error) {
      throw new Error(`Failed to get sprint: ${error.response?.data?.errorMessages || error.message}`);
    }
  }

  async createSprint(name, originBoardId, startDate, endDate) {
    try {
      const response = await axios.post(`${this.baseUrl.replace('/rest/api/3', '/rest/agile/1.0')}/sprint`,
        { name, originBoardId, startDate, endDate },
        { headers: this.getHeaders() }
      );
      return { success: true, sprint: response.data };
    } catch (error) {
      throw new Error(`Failed to create sprint: ${error.response?.data?.errorMessages || error.message}`);
    }
  }

  async listUsers(query) {
    try {
      const response = await axios.get(`${this.baseUrl}/users/search`, {
        headers: this.getHeaders(),
        params: { query },
      });
      return { success: true, users: response.data };
    } catch (error) {
      throw new Error(`Failed to list users: ${error.response?.data?.errorMessages || error.message}`);
    }
  }

  async getUser(accountId) {
    try {
      const response = await axios.get(`${this.baseUrl}/user`, {
        headers: this.getHeaders(),
        params: { accountId },
      });
      return { success: true, user: response.data };
    } catch (error) {
      throw new Error(`Failed to get user: ${error.response?.data?.errorMessages || error.message}`);
    }
  }

  async getMyself() {
    try {
      const response = await axios.get(`${this.baseUrl}/myself`, { headers: this.getHeaders() });
      return { success: true, user: response.data };
    } catch (error) {
      throw new Error(`Failed to get myself: ${error.response?.data?.errorMessages || error.message}`);
    }
  }
}

module.exports = JiraIntegration;
