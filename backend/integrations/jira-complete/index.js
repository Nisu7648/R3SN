const axios = require('axios');

class JiraIntegration {
  constructor(domain, email, apiToken) {
    this.domain = domain;
    this.email = email;
    this.apiToken = apiToken;
    this.baseURL = `https://${domain}.atlassian.net/rest/api/3`;
    this.auth = Buffer.from(`${email}:${apiToken}`).toString('base64');
    this.headers = { 'Authorization': `Basic ${this.auth}`, 'Content-Type': 'application/json' };
  }

  async getProjects() {
    const response = await axios.get(`${this.baseURL}/project`, {
      headers: this.headers
    });
    return response.data;
  }

  async getProject(projectKey) {
    const response = await axios.get(`${this.baseURL}/project/${projectKey}`, {
      headers: this.headers
    });
    return response.data;
  }

  async getIssues(jql, maxResults = 50) {
    const response = await axios.get(`${this.baseURL}/search`, {
      headers: this.headers,
      params: { jql, maxResults }
    });
    return response.data;
  }

  async getIssue(issueKey) {
    const response = await axios.get(`${this.baseURL}/issue/${issueKey}`, {
      headers: this.headers
    });
    return response.data;
  }

  async createIssue(projectKey, summary, description, issueType = 'Task') {
    const response = await axios.post(
      `${this.baseURL}/issue`,
      {
        fields: {
          project: { key: projectKey },
          summary,
          description: { type: 'doc', version: 1, content: [{ type: 'paragraph', content: [{ type: 'text', text: description }] }] },
          issuetype: { name: issueType }
        }
      },
      { headers: this.headers }
    );
    return response.data;
  }

  async updateIssue(issueKey, updates) {
    const response = await axios.put(
      `${this.baseURL}/issue/${issueKey}`,
      { fields: updates },
      { headers: this.headers }
    );
    return response.data;
  }

  async deleteIssue(issueKey) {
    const response = await axios.delete(`${this.baseURL}/issue/${issueKey}`, {
      headers: this.headers
    });
    return response.data;
  }

  async addComment(issueKey, comment) {
    const response = await axios.post(
      `${this.baseURL}/issue/${issueKey}/comment`,
      { body: { type: 'doc', version: 1, content: [{ type: 'paragraph', content: [{ type: 'text', text: comment }] }] } },
      { headers: this.headers }
    );
    return response.data;
  }
}

module.exports = JiraIntegration;
