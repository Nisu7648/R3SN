/**
 * GitHub Node - Real GitHub API Integration
 * Manage repos, issues, PRs, commits, releases
 */

const axios = require('axios');

class GitHubNode {
  constructor() {
    this.type = 'github.action';
    this.name = 'GitHub';
    this.description = 'Manage repositories, issues, PRs, and more';
    this.category = 'development';
    this.icon = '🐙';
    this.color = '#181717';

    this.parameters = [
      {
        name: 'token',
        type: 'string',
        required: true,
        sensitive: true,
        description: 'GitHub Personal Access Token'
      },
      {
        name: 'action',
        type: 'select',
        required: true,
        options: [
          'create_issue',
          'create_pr',
          'list_repos',
          'get_repo',
          'create_repo',
          'list_issues',
          'comment_issue',
          'close_issue',
          'merge_pr',
          'create_release'
        ],
        description: 'Action to perform'
      },
      {
        name: 'owner',
        type: 'string',
        required: false,
        description: 'Repository owner'
      },
      {
        name: 'repo',
        type: 'string',
        required: false,
        description: 'Repository name'
      },
      {
        name: 'title',
        type: 'string',
        required: false,
        description: 'Issue/PR title'
      },
      {
        name: 'body',
        type: 'code',
        required: false,
        description: 'Issue/PR body'
      },
      {
        name: 'issueNumber',
        type: 'number',
        required: false,
        description: 'Issue/PR number'
      },
      {
        name: 'head',
        type: 'string',
        required: false,
        description: 'Head branch for PR'
      },
      {
        name: 'base',
        type: 'string',
        required: false,
        description: 'Base branch for PR'
      },
      {
        name: 'tagName',
        type: 'string',
        required: false,
        description: 'Release tag name'
      }
    ];
  }

  async execute(inputs, parameters, context) {
    const { token, action, owner, repo, title, body, issueNumber, head, base, tagName } = parameters;

    if (!token) {
      throw new Error('GitHub token is required');
    }

    const headers = {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    };

    try {
      switch (action) {
        case 'create_issue':
          return await this.createIssue(headers, owner, repo, title, body);
        
        case 'create_pr':
          return await this.createPR(headers, owner, repo, title, body, head, base);
        
        case 'list_repos':
          return await this.listRepos(headers);
        
        case 'get_repo':
          return await this.getRepo(headers, owner, repo);
        
        case 'create_repo':
          return await this.createRepo(headers, repo, body);
        
        case 'list_issues':
          return await this.listIssues(headers, owner, repo);
        
        case 'comment_issue':
          return await this.commentIssue(headers, owner, repo, issueNumber, body);
        
        case 'close_issue':
          return await this.closeIssue(headers, owner, repo, issueNumber);
        
        case 'merge_pr':
          return await this.mergePR(headers, owner, repo, issueNumber);
        
        case 'create_release':
          return await this.createRelease(headers, owner, repo, tagName, title, body);
        
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      if (error.response) {
        throw new Error(`GitHub API error: ${error.response.data.message || error.response.statusText}`);
      }
      throw new Error(`GitHub error: ${error.message}`);
    }
  }

  async createIssue(headers, owner, repo, title, body) {
    const response = await axios.post(
      `https://api.github.com/repos/${owner}/${repo}/issues`,
      { title, body },
      { headers }
    );
    
    return {
      success: true,
      issue: {
        number: response.data.number,
        url: response.data.html_url,
        state: response.data.state
      }
    };
  }

  async createPR(headers, owner, repo, title, body, head, base) {
    const response = await axios.post(
      `https://api.github.com/repos/${owner}/${repo}/pulls`,
      { title, body, head, base },
      { headers }
    );
    
    return {
      success: true,
      pr: {
        number: response.data.number,
        url: response.data.html_url,
        state: response.data.state
      }
    };
  }

  async listRepos(headers) {
    const response = await axios.get(
      'https://api.github.com/user/repos',
      { headers, params: { per_page: 100, sort: 'updated' } }
    );
    
    return {
      success: true,
      repos: response.data.map(r => ({
        name: r.name,
        fullName: r.full_name,
        url: r.html_url,
        private: r.private,
        stars: r.stargazers_count
      }))
    };
  }

  async getRepo(headers, owner, repo) {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers }
    );
    
    return {
      success: true,
      repo: {
        name: response.data.name,
        fullName: response.data.full_name,
        description: response.data.description,
        url: response.data.html_url,
        stars: response.data.stargazers_count,
        forks: response.data.forks_count,
        language: response.data.language
      }
    };
  }

  async createRepo(headers, name, description) {
    const response = await axios.post(
      'https://api.github.com/user/repos',
      { name, description, private: false },
      { headers }
    );
    
    return {
      success: true,
      repo: {
        name: response.data.name,
        url: response.data.html_url
      }
    };
  }

  async listIssues(headers, owner, repo) {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/issues`,
      { headers, params: { state: 'open', per_page: 100 } }
    );
    
    return {
      success: true,
      issues: response.data.map(i => ({
        number: i.number,
        title: i.title,
        state: i.state,
        url: i.html_url
      }))
    };
  }

  async commentIssue(headers, owner, repo, issueNumber, body) {
    const response = await axios.post(
      `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments`,
      { body },
      { headers }
    );
    
    return {
      success: true,
      comment: {
        id: response.data.id,
        url: response.data.html_url
      }
    };
  }

  async closeIssue(headers, owner, repo, issueNumber) {
    const response = await axios.patch(
      `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`,
      { state: 'closed' },
      { headers }
    );
    
    return {
      success: true,
      issue: {
        number: response.data.number,
        state: response.data.state
      }
    };
  }

  async mergePR(headers, owner, repo, pullNumber) {
    const response = await axios.put(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/merge`,
      {},
      { headers }
    );
    
    return {
      success: true,
      merged: response.data.merged,
      message: response.data.message
    };
  }

  async createRelease(headers, owner, repo, tagName, name, body) {
    const response = await axios.post(
      `https://api.github.com/repos/${owner}/${repo}/releases`,
      { tag_name: tagName, name, body },
      { headers }
    );
    
    return {
      success: true,
      release: {
        id: response.data.id,
        url: response.data.html_url,
        tagName: response.data.tag_name
      }
    };
  }
}

module.exports = GitHubNode;
