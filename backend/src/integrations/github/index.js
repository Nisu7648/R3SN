/**
 * GitHub Integration
 * Real GitHub REST API v3 implementation
 */

const axios = require('axios');

class GitHubIntegration {
  constructor(config) {
    this.config = config;
    this.validateConfig();
    this.baseUrl = 'https://api.github.com';
  }

  validateConfig() {
    if (!this.config.token) {
      throw new Error('GitHub Personal Access Token is required');
    }
  }

  getHeaders() {
    return {
      'Authorization': `token ${this.config.token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    };
  }

  async execute(action, params) {
    const actions = {
      createRepo: this.createRepo.bind(this),
      getRepo: this.getRepo.bind(this),
      listRepos: this.listRepos.bind(this),
      createIssue: this.createIssue.bind(this),
      listIssues: this.listIssues.bind(this),
      closeIssue: this.closeIssue.bind(this),
      commentIssue: this.commentIssue.bind(this),
      createPR: this.createPR.bind(this),
      mergePR: this.mergePR.bind(this),
      createRelease: this.createRelease.bind(this),
      getCommits: this.getCommits.bind(this),
      createBranch: this.createBranch.bind(this),
    };

    if (!actions[action]) {
      throw new Error(`Unknown action: ${action}`);
    }

    return await actions[action](params);
  }

  async createRepo(params) {
    const { name, description, private: isPrivate = false } = params;
    
    if (!name) {
      throw new Error('Repository name is required');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/user/repos`,
        { name, description, private: isPrivate },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          id: response.data.id,
          name: response.data.name,
          fullName: response.data.full_name,
          url: response.data.html_url,
          cloneUrl: response.data.clone_url
        }
      };
    } catch (error) {
      throw new Error(`GitHub API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async getRepo(params) {
    const { owner, repo } = params;
    
    if (!owner || !repo) {
      throw new Error('Owner and repo are required');
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/repos/${owner}/${repo}`,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          id: response.data.id,
          name: response.data.name,
          fullName: response.data.full_name,
          description: response.data.description,
          url: response.data.html_url,
          stars: response.data.stargazers_count,
          forks: response.data.forks_count,
          language: response.data.language,
          defaultBranch: response.data.default_branch
        }
      };
    } catch (error) {
      throw new Error(`GitHub API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async listRepos(params) {
    const { type = 'owner', sort = 'updated', perPage = 30 } = params;

    try {
      const response = await axios.get(
        `${this.baseUrl}/user/repos`,
        {
          headers: this.getHeaders(),
          params: { type, sort, per_page: perPage }
        }
      );

      return {
        success: true,
        data: response.data.map(repo => ({
          id: repo.id,
          name: repo.name,
          fullName: repo.full_name,
          url: repo.html_url,
          private: repo.private,
          stars: repo.stargazers_count
        }))
      };
    } catch (error) {
      throw new Error(`GitHub API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async createIssue(params) {
    const { owner, repo, title, body, labels, assignees } = params;
    
    if (!owner || !repo || !title) {
      throw new Error('Owner, repo, and title are required');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/repos/${owner}/${repo}/issues`,
        { title, body, labels, assignees },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          number: response.data.number,
          title: response.data.title,
          url: response.data.html_url,
          state: response.data.state
        }
      };
    } catch (error) {
      throw new Error(`GitHub API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async listIssues(params) {
    const { owner, repo, state = 'open', perPage = 30 } = params;
    
    if (!owner || !repo) {
      throw new Error('Owner and repo are required');
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/repos/${owner}/${repo}/issues`,
        {
          headers: this.getHeaders(),
          params: { state, per_page: perPage }
        }
      );

      return {
        success: true,
        data: response.data.map(issue => ({
          number: issue.number,
          title: issue.title,
          state: issue.state,
          url: issue.html_url,
          createdAt: issue.created_at
        }))
      };
    } catch (error) {
      throw new Error(`GitHub API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async closeIssue(params) {
    const { owner, repo, issueNumber } = params;
    
    if (!owner || !repo || !issueNumber) {
      throw new Error('Owner, repo, and issue number are required');
    }

    try {
      const response = await axios.patch(
        `${this.baseUrl}/repos/${owner}/${repo}/issues/${issueNumber}`,
        { state: 'closed' },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          number: response.data.number,
          state: response.data.state
        }
      };
    } catch (error) {
      throw new Error(`GitHub API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async commentIssue(params) {
    const { owner, repo, issueNumber, body } = params;
    
    if (!owner || !repo || !issueNumber || !body) {
      throw new Error('Owner, repo, issue number, and body are required');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/repos/${owner}/${repo}/issues/${issueNumber}/comments`,
        { body },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          id: response.data.id,
          url: response.data.html_url
        }
      };
    } catch (error) {
      throw new Error(`GitHub API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async createPR(params) {
    const { owner, repo, title, body, head, base } = params;
    
    if (!owner || !repo || !title || !head || !base) {
      throw new Error('Owner, repo, title, head, and base are required');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/repos/${owner}/${repo}/pulls`,
        { title, body, head, base },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          number: response.data.number,
          title: response.data.title,
          url: response.data.html_url,
          state: response.data.state
        }
      };
    } catch (error) {
      throw new Error(`GitHub API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async mergePR(params) {
    const { owner, repo, pullNumber, commitMessage } = params;
    
    if (!owner || !repo || !pullNumber) {
      throw new Error('Owner, repo, and pull number are required');
    }

    try {
      const response = await axios.put(
        `${this.baseUrl}/repos/${owner}/${repo}/pulls/${pullNumber}/merge`,
        { commit_message: commitMessage },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          merged: response.data.merged,
          message: response.data.message,
          sha: response.data.sha
        }
      };
    } catch (error) {
      throw new Error(`GitHub API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async createRelease(params) {
    const { owner, repo, tagName, name, body, draft = false } = params;
    
    if (!owner || !repo || !tagName) {
      throw new Error('Owner, repo, and tag name are required');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/repos/${owner}/${repo}/releases`,
        { tag_name: tagName, name, body, draft },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          id: response.data.id,
          tagName: response.data.tag_name,
          url: response.data.html_url
        }
      };
    } catch (error) {
      throw new Error(`GitHub API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async getCommits(params) {
    const { owner, repo, perPage = 30 } = params;
    
    if (!owner || !repo) {
      throw new Error('Owner and repo are required');
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/repos/${owner}/${repo}/commits`,
        {
          headers: this.getHeaders(),
          params: { per_page: perPage }
        }
      );

      return {
        success: true,
        data: response.data.map(commit => ({
          sha: commit.sha,
          message: commit.commit.message,
          author: commit.commit.author.name,
          date: commit.commit.author.date,
          url: commit.html_url
        }))
      };
    } catch (error) {
      throw new Error(`GitHub API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async createBranch(params) {
    const { owner, repo, branch, fromBranch = 'main' } = params;
    
    if (!owner || !repo || !branch) {
      throw new Error('Owner, repo, and branch name are required');
    }

    try {
      // Get SHA of the from branch
      const refResponse = await axios.get(
        `${this.baseUrl}/repos/${owner}/${repo}/git/refs/heads/${fromBranch}`,
        { headers: this.getHeaders() }
      );

      const sha = refResponse.data.object.sha;

      // Create new branch
      const response = await axios.post(
        `${this.baseUrl}/repos/${owner}/${repo}/git/refs`,
        {
          ref: `refs/heads/${branch}`,
          sha
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          ref: response.data.ref,
          sha: response.data.object.sha
        }
      };
    } catch (error) {
      throw new Error(`GitHub API error: ${error.response?.data?.message || error.message}`);
    }
  }
}

module.exports = GitHubIntegration;
