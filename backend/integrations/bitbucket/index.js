const axios = require('axios');

class BitbucketIntegration {
  constructor(username, appPassword) {
    this.username = username;
    this.appPassword = appPassword;
    this.baseUrl = 'https://api.bitbucket.org/2.0';
  }

  getHeaders() {
    const auth = Buffer.from(`${this.username}:${this.appPassword}`).toString('base64');
    return { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' };
  }

  async request(method, path, data = null) {
    try {
      const response = await axios({ method, url: `${this.baseUrl}${path}`, headers: this.getHeaders(), data });
      return { success: true, data: response.data };
    } catch (error) {
      throw new Error(`Bitbucket error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async listRepos(workspace) { return this.request('GET', `/repositories/${workspace}`); }
  async getRepo(workspace, repoSlug) { return this.request('GET', `/repositories/${workspace}/${repoSlug}`); }
  async createRepo(workspace, repoSlug, data) { return this.request('POST', `/repositories/${workspace}/${repoSlug}`, data); }
  async deleteRepo(workspace, repoSlug) { return this.request('DELETE', `/repositories/${workspace}/${repoSlug}`); }
  async listBranches(workspace, repoSlug) { return this.request('GET', `/repositories/${workspace}/${repoSlug}/refs/branches`); }
  async createBranch(workspace, repoSlug, name, target) { return this.request('POST', `/repositories/${workspace}/${repoSlug}/refs/branches`, { name, target }); }
  async listCommits(workspace, repoSlug) { return this.request('GET', `/repositories/${workspace}/${repoSlug}/commits`); }
  async getCommit(workspace, repoSlug, commit) { return this.request('GET', `/repositories/${workspace}/${repoSlug}/commit/${commit}`); }
  async listPRs(workspace, repoSlug) { return this.request('GET', `/repositories/${workspace}/${repoSlug}/pullrequests`); }
  async getPR(workspace, repoSlug, prId) { return this.request('GET', `/repositories/${workspace}/${repoSlug}/pullrequests/${prId}`); }
  async createPR(workspace, repoSlug, title, source, destination) { return this.request('POST', `/repositories/${workspace}/${repoSlug}/pullrequests`, { title, source: { branch: { name: source } }, destination: { branch: { name: destination } } }); }
  async updatePR(workspace, repoSlug, prId, updates) { return this.request('PUT', `/repositories/${workspace}/${repoSlug}/pullrequests/${prId}`, updates); }
  async mergePR(workspace, repoSlug, prId) { return this.request('POST', `/repositories/${workspace}/${repoSlug}/pullrequests/${prId}/merge`); }
  async declinePR(workspace, repoSlug, prId) { return this.request('POST', `/repositories/${workspace}/${repoSlug}/pullrequests/${prId}/decline`); }
  async listIssues(workspace, repoSlug) { return this.request('GET', `/repositories/${workspace}/${repoSlug}/issues`); }
  async getIssue(workspace, repoSlug, issueId) { return this.request('GET', `/repositories/${workspace}/${repoSlug}/issues/${issueId}`); }
  async createIssue(workspace, repoSlug, title, content) { return this.request('POST', `/repositories/${workspace}/${repoSlug}/issues`, { title, content: { raw: content } }); }
  async updateIssue(workspace, repoSlug, issueId, updates) { return this.request('PUT', `/repositories/${workspace}/${repoSlug}/issues/${issueId}`, updates); }
  async listPipelines(workspace, repoSlug) { return this.request('GET', `/repositories/${workspace}/${repoSlug}/pipelines`); }
  async getPipeline(workspace, repoSlug, pipelineUuid) { return this.request('GET', `/repositories/${workspace}/${repoSlug}/pipelines/${pipelineUuid}`); }
  async triggerPipeline(workspace, repoSlug, target) { return this.request('POST', `/repositories/${workspace}/${repoSlug}/pipelines`, { target }); }
  async listWebhooks(workspace, repoSlug) { return this.request('GET', `/repositories/${workspace}/${repoSlug}/hooks`); }
  async createWebhook(workspace, repoSlug, url, events) { return this.request('POST', `/repositories/${workspace}/${repoSlug}/hooks`, { url, events }); }
  async listDeployments(workspace, repoSlug) { return this.request('GET', `/repositories/${workspace}/${repoSlug}/deployments`); }
  async getUser() { return this.request('GET', '/user'); }
}

module.exports = BitbucketIntegration;
