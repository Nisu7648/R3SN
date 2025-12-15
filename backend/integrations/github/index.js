/**
 * GitHub Integration - Complete Implementation
 * 30 endpoints for full GitHub functionality
 */

const axios = require('axios');

class GitHubIntegration {
  constructor(token) {
    this.token = token;
    this.baseUrl = 'https://api.github.com';
  }

  getHeaders() {
    return {
      'Authorization': `token ${this.token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };
  }

  // REPOSITORIES (5 endpoints)
  async listRepos(options = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}/user/repos`, {
        headers: this.getHeaders(),
        params: { per_page: options.per_page || 30, ...options },
      });
      return { success: true, repositories: response.data };
    } catch (error) {
      throw new Error(`Failed to list repos: ${error.response?.data?.message || error.message}`);
    }
  }

  async createRepo(name, options = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/user/repos`, 
        { name, ...options },
        { headers: this.getHeaders() }
      );
      return { success: true, repository: response.data };
    } catch (error) {
      throw new Error(`Failed to create repo: ${error.response?.data?.message || error.message}`);
    }
  }

  async getRepo(owner, repo) {
    try {
      const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}`, {
        headers: this.getHeaders(),
      });
      return { success: true, repository: response.data };
    } catch (error) {
      throw new Error(`Failed to get repo: ${error.response?.data?.message || error.message}`);
    }
  }

  async updateRepo(owner, repo, updates) {
    try {
      const response = await axios.patch(`${this.baseUrl}/repos/${owner}/${repo}`,
        updates,
        { headers: this.getHeaders() }
      );
      return { success: true, repository: response.data };
    } catch (error) {
      throw new Error(`Failed to update repo: ${error.response?.data?.message || error.message}`);
    }
  }

  async deleteRepo(owner, repo) {
    try {
      await axios.delete(`${this.baseUrl}/repos/${owner}/${repo}`, {
        headers: this.getHeaders(),
      });
      return { success: true, message: 'Repository deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete repo: ${error.response?.data?.message || error.message}`);
    }
  }

  // BRANCHES (4 endpoints)
  async listBranches(owner, repo, options = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/branches`, {
        headers: this.getHeaders(),
        params: options,
      });
      return { success: true, branches: response.data };
    } catch (error) {
      throw new Error(`Failed to list branches: ${error.response?.data?.message || error.message}`);
    }
  }

  async createBranch(owner, repo, branch, sha) {
    try {
      const response = await axios.post(`${this.baseUrl}/repos/${owner}/${repo}/git/refs`,
        { ref: `refs/heads/${branch}`, sha },
        { headers: this.getHeaders() }
      );
      return { success: true, branch: response.data };
    } catch (error) {
      throw new Error(`Failed to create branch: ${error.response?.data?.message || error.message}`);
    }
  }

  async getBranch(owner, repo, branch) {
    try {
      const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/branches/${branch}`, {
        headers: this.getHeaders(),
      });
      return { success: true, branch: response.data };
    } catch (error) {
      throw new Error(`Failed to get branch: ${error.response?.data?.message || error.message}`);
    }
  }

  async deleteBranch(owner, repo, branch) {
    try {
      await axios.delete(`${this.baseUrl}/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
        headers: this.getHeaders(),
      });
      return { success: true, message: 'Branch deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete branch: ${error.response?.data?.message || error.message}`);
    }
  }

  // COMMITS (3 endpoints)
  async listCommits(owner, repo, options = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/commits`, {
        headers: this.getHeaders(),
        params: { per_page: options.per_page || 30, ...options },
      });
      return { success: true, commits: response.data };
    } catch (error) {
      throw new Error(`Failed to list commits: ${error.response?.data?.message || error.message}`);
    }
  }

  async getCommit(owner, repo, sha) {
    try {
      const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/commits/${sha}`, {
        headers: this.getHeaders(),
      });
      return { success: true, commit: response.data };
    } catch (error) {
      throw new Error(`Failed to get commit: ${error.response?.data?.message || error.message}`);
    }
  }

  async createCommit(owner, repo, message, tree, parents) {
    try {
      const response = await axios.post(`${this.baseUrl}/repos/${owner}/${repo}/git/commits`,
        { message, tree, parents },
        { headers: this.getHeaders() }
      );
      return { success: true, commit: response.data };
    } catch (error) {
      throw new Error(`Failed to create commit: ${error.response?.data?.message || error.message}`);
    }
  }

  // PULL REQUESTS (5 endpoints)
  async listPRs(owner, repo, options = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/pulls`, {
        headers: this.getHeaders(),
        params: { state: options.state || 'open', per_page: options.per_page || 30, ...options },
      });
      return { success: true, pull_requests: response.data };
    } catch (error) {
      throw new Error(`Failed to list PRs: ${error.response?.data?.message || error.message}`);
    }
  }

  async createPR(owner, repo, title, head, base, options = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/repos/${owner}/${repo}/pulls`,
        { title, head, base, ...options },
        { headers: this.getHeaders() }
      );
      return { success: true, pull_request: response.data };
    } catch (error) {
      throw new Error(`Failed to create PR: ${error.response?.data?.message || error.message}`);
    }
  }

  async getPR(owner, repo, number) {
    try {
      const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/pulls/${number}`, {
        headers: this.getHeaders(),
      });
      return { success: true, pull_request: response.data };
    } catch (error) {
      throw new Error(`Failed to get PR: ${error.response?.data?.message || error.message}`);
    }
  }

  async updatePR(owner, repo, number, updates) {
    try {
      const response = await axios.patch(`${this.baseUrl}/repos/${owner}/${repo}/pulls/${number}`,
        updates,
        { headers: this.getHeaders() }
      );
      return { success: true, pull_request: response.data };
    } catch (error) {
      throw new Error(`Failed to update PR: ${error.response?.data?.message || error.message}`);
    }
  }

  async mergePR(owner, repo, number, options = {}) {
    try {
      const response = await axios.put(`${this.baseUrl}/repos/${owner}/${repo}/pulls/${number}/merge`,
        options,
        { headers: this.getHeaders() }
      );
      return { success: true, merge: response.data };
    } catch (error) {
      throw new Error(`Failed to merge PR: ${error.response?.data?.message || error.message}`);
    }
  }

  // ISSUES (5 endpoints)
  async listIssues(owner, repo, options = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/issues`, {
        headers: this.getHeaders(),
        params: { state: options.state || 'open', per_page: options.per_page || 30, ...options },
      });
      return { success: true, issues: response.data };
    } catch (error) {
      throw new Error(`Failed to list issues: ${error.response?.data?.message || error.message}`);
    }
  }

  async createIssue(owner, repo, title, options = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/repos/${owner}/${repo}/issues`,
        { title, ...options },
        { headers: this.getHeaders() }
      );
      return { success: true, issue: response.data };
    } catch (error) {
      throw new Error(`Failed to create issue: ${error.response?.data?.message || error.message}`);
    }
  }

  async getIssue(owner, repo, number) {
    try {
      const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/issues/${number}`, {
        headers: this.getHeaders(),
      });
      return { success: true, issue: response.data };
    } catch (error) {
      throw new Error(`Failed to get issue: ${error.response?.data?.message || error.message}`);
    }
  }

  async updateIssue(owner, repo, number, updates) {
    try {
      const response = await axios.patch(`${this.baseUrl}/repos/${owner}/${repo}/issues/${number}`,
        updates,
        { headers: this.getHeaders() }
      );
      return { success: true, issue: response.data };
    } catch (error) {
      throw new Error(`Failed to update issue: ${error.response?.data?.message || error.message}`);
    }
  }

  async closeIssue(owner, repo, number) {
    try {
      const response = await axios.patch(`${this.baseUrl}/repos/${owner}/${repo}/issues/${number}`,
        { state: 'closed' },
        { headers: this.getHeaders() }
      );
      return { success: true, issue: response.data };
    } catch (error) {
      throw new Error(`Failed to close issue: ${error.response?.data?.message || error.message}`);
    }
  }

  // COMMENTS (2 endpoints)
  async addComment(owner, repo, number, body) {
    try {
      const response = await axios.post(`${this.baseUrl}/repos/${owner}/${repo}/issues/${number}/comments`,
        { body },
        { headers: this.getHeaders() }
      );
      return { success: true, comment: response.data };
    } catch (error) {
      throw new Error(`Failed to add comment: ${error.response?.data?.message || error.message}`);
    }
  }

  async listComments(owner, repo, number, options = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/issues/${number}/comments`, {
        headers: this.getHeaders(),
        params: options,
      });
      return { success: true, comments: response.data };
    } catch (error) {
      throw new Error(`Failed to list comments: ${error.response?.data?.message || error.message}`);
    }
  }

  // USERS & ORGS (4 endpoints)
  async getUser(username) {
    try {
      const response = await axios.get(`${this.baseUrl}/users/${username}`, {
        headers: this.getHeaders(),
      });
      return { success: true, user: response.data };
    } catch (error) {
      throw new Error(`Failed to get user: ${error.response?.data?.message || error.message}`);
    }
  }

  async listOrgs() {
    try {
      const response = await axios.get(`${this.baseUrl}/user/orgs`, {
        headers: this.getHeaders(),
      });
      return { success: true, organizations: response.data };
    } catch (error) {
      throw new Error(`Failed to list orgs: ${error.response?.data?.message || error.message}`);
    }
  }

  async getOrg(org) {
    try {
      const response = await axios.get(`${this.baseUrl}/orgs/${org}`, {
        headers: this.getHeaders(),
      });
      return { success: true, organization: response.data };
    } catch (error) {
      throw new Error(`Failed to get org: ${error.response?.data?.message || error.message}`);
    }
  }

  async listTeams(org) {
    try {
      const response = await axios.get(`${this.baseUrl}/orgs/${org}/teams`, {
        headers: this.getHeaders(),
      });
      return { success: true, teams: response.data };
    } catch (error) {
      throw new Error(`Failed to list teams: ${error.response?.data?.message || error.message}`);
    }
  }

  // WEBHOOKS (2 endpoints)
  async createWebhook(owner, repo, config, events = ['push']) {
    try {
      const response = await axios.post(`${this.baseUrl}/repos/${owner}/${repo}/hooks`,
        { config, events, active: true },
        { headers: this.getHeaders() }
      );
      return { success: true, webhook: response.data };
    } catch (error) {
      throw new Error(`Failed to create webhook: ${error.response?.data?.message || error.message}`);
    }
  }

  async listWebhooks(owner, repo) {
    try {
      const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/hooks`, {
        headers: this.getHeaders(),
      });
      return { success: true, webhooks: response.data };
    } catch (error) {
      throw new Error(`Failed to list webhooks: ${error.response?.data?.message || error.message}`);
    }
  }
}

module.exports = GitHubIntegration;
