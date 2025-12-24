/**
 * GITHUB INTEGRATION - FULLY WORKING
 * Code repository integration
 * 
 * FREE: Unlimited public repos
 * Get token: https://github.com/settings/tokens
 * 
 * Usage:
 *   const github = new GitHubIntegration({ token: 'ghp_xxx' });
 *   const repos = await github.listRepos('username');
 *   const issues = await github.listIssues('owner/repo');
 */

const BaseIntegration = require('../core/BaseIntegration');

class GitHubIntegration extends BaseIntegration {
  constructor(config = {}) {
    super({
      name: 'github',
      baseURL: 'https://api.github.com',
      ...config
    });
  }

  getDefaultHeaders() {
    return {
      'Authorization': `token ${this.apiKey}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'R3SN-Integration'
    };
  }

  /**
   * Get user info
   */
  async getUser(username = null) {
    this.validateApiKey();
    const endpoint = username ? `/users/${username}` : '/user';
    const response = await this.get(endpoint);
    return { success: true, user: response.data };
  }

  /**
   * List repositories
   */
  async listRepos(username = null, type = 'all') {
    this.validateApiKey();
    const endpoint = username ? `/users/${username}/repos` : '/user/repos';
    const response = await this.get(endpoint, { type, per_page: 30 });
    return {
      success: true,
      repos: response.data.map(repo => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        private: repo.private,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language,
        url: repo.html_url
      }))
    };
  }

  /**
   * Get repository
   */
  async getRepo(owner, repo) {
    this.validateApiKey();
    const response = await this.get(`/repos/${owner}/${repo}`);
    return { success: true, repo: response.data };
  }

  /**
   * List issues
   */
  async listIssues(repo, state = 'open') {
    this.validateApiKey();
    const response = await this.get(`/repos/${repo}/issues`, { 
      state, 
      per_page: 30 
    });
    return {
      success: true,
      issues: response.data.map(issue => ({
        number: issue.number,
        title: issue.title,
        state: issue.state,
        user: issue.user.login,
        labels: issue.labels.map(l => l.name),
        createdAt: issue.created_at
      }))
    };
  }

  /**
   * Create issue
   */
  async createIssue(repo, title, body, labels = []) {
    this.validateApiKey();
    const response = await this.post(`/repos/${repo}/issues`, {
      title,
      body,
      labels
    });
    return { success: true, issue: response.data };
  }

  /**
   * List pull requests
   */
  async listPullRequests(repo, state = 'open') {
    this.validateApiKey();
    const response = await this.get(`/repos/${repo}/pulls`, { 
      state, 
      per_page: 30 
    });
    return {
      success: true,
      pullRequests: response.data.map(pr => ({
        number: pr.number,
        title: pr.title,
        state: pr.state,
        user: pr.user.login,
        createdAt: pr.created_at,
        url: pr.html_url
      }))
    };
  }

  /**
   * Get commits
   */
  async listCommits(repo, branch = null) {
    this.validateApiKey();
    const params = { per_page: 30 };
    if (branch) params.sha = branch;
    
    const response = await this.get(`/repos/${repo}/commits`, params);
    return {
      success: true,
      commits: response.data.map(commit => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author.name,
        date: commit.commit.author.date,
        url: commit.html_url
      }))
    };
  }

  /**
   * Search repositories
   */
  async searchRepos(query, sort = 'stars') {
    this.validateApiKey();
    const response = await this.get('/search/repositories', {
      q: query,
      sort,
      per_page: 30
    });
    return {
      success: true,
      total: response.data.total_count,
      repos: response.data.items.map(repo => ({
        name: repo.full_name,
        description: repo.description,
        stars: repo.stargazers_count,
        language: repo.language,
        url: repo.html_url
      }))
    };
  }

  /**
   * Get repository contents
   */
  async getContents(repo, path = '') {
    this.validateApiKey();
    const response = await this.get(`/repos/${repo}/contents/${path}`);
    return { success: true, contents: response.data };
  }

  async testConnection() {
    try {
      await this.getUser();
      return { success: true, integration: this.name, message: 'Connection successful' };
    } catch (error) {
      return { success: false, integration: this.name, error: error.message };
    }
  }
}

module.exports = GitHubIntegration;
