/**
 * GitHub API Integration - REAL IMPLEMENTATION
 * Repos, issues, PRs, commits, actions
 */

const axios = require('axios');

class GitHubAPI {
    constructor(token) {
        this.token = token || process.env.GITHUB_TOKEN;
        this.baseUrl = 'https://api.github.com';
    }

    /**
     * Make authenticated request
     */
    async request(method, endpoint, data = null) {
        const config = {
            method,
            url: `${this.baseUrl}${endpoint}`,
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            }
        };

        if (data) {
            if (method === 'GET') {
                config.params = data;
            } else {
                config.data = data;
            }
        }

        const response = await axios(config);
        return response.data;
    }

    // ============================================
    // REPOSITORIES
    // ============================================

    /**
     * List user repos
     */
    async listRepos(username = null, options = {}) {
        const endpoint = username ? `/users/${username}/repos` : '/user/repos';
        return await this.request('GET', endpoint, options);
    }

    /**
     * Get repo
     */
    async getRepo(owner, repo) {
        return await this.request('GET', `/repos/${owner}/${repo}`);
    }

    /**
     * Create repo
     */
    async createRepo(name, options = {}) {
        return await this.request('POST', '/user/repos', {
            name,
            ...options
        });
    }

    /**
     * Update repo
     */
    async updateRepo(owner, repo, updates) {
        return await this.request('PATCH', `/repos/${owner}/${repo}`, updates);
    }

    /**
     * Delete repo
     */
    async deleteRepo(owner, repo) {
        return await this.request('DELETE', `/repos/${owner}/${repo}`);
    }

    /**
     * Fork repo
     */
    async forkRepo(owner, repo) {
        return await this.request('POST', `/repos/${owner}/${repo}/forks`);
    }

    /**
     * Star repo
     */
    async starRepo(owner, repo) {
        return await this.request('PUT', `/user/starred/${owner}/${repo}`);
    }

    /**
     * Unstar repo
     */
    async unstarRepo(owner, repo) {
        return await this.request('DELETE', `/user/starred/${owner}/${repo}`);
    }

    // ============================================
    // ISSUES
    // ============================================

    /**
     * List issues
     */
    async listIssues(owner, repo, options = {}) {
        return await this.request('GET', `/repos/${owner}/${repo}/issues`, options);
    }

    /**
     * Get issue
     */
    async getIssue(owner, repo, issueNumber) {
        return await this.request('GET', `/repos/${owner}/${repo}/issues/${issueNumber}`);
    }

    /**
     * Create issue
     */
    async createIssue(owner, repo, title, body, options = {}) {
        return await this.request('POST', `/repos/${owner}/${repo}/issues`, {
            title,
            body,
            ...options
        });
    }

    /**
     * Update issue
     */
    async updateIssue(owner, repo, issueNumber, updates) {
        return await this.request('PATCH', `/repos/${owner}/${repo}/issues/${issueNumber}`, updates);
    }

    /**
     * Close issue
     */
    async closeIssue(owner, repo, issueNumber) {
        return await this.updateIssue(owner, repo, issueNumber, { state: 'closed' });
    }

    /**
     * Add comment to issue
     */
    async addIssueComment(owner, repo, issueNumber, body) {
        return await this.request('POST', `/repos/${owner}/${repo}/issues/${issueNumber}/comments`, { body });
    }

    /**
     * Add labels to issue
     */
    async addLabels(owner, repo, issueNumber, labels) {
        return await this.request('POST', `/repos/${owner}/${repo}/issues/${issueNumber}/labels`, {
            labels
        });
    }

    // ============================================
    // PULL REQUESTS
    // ============================================

    /**
     * List PRs
     */
    async listPRs(owner, repo, options = {}) {
        return await this.request('GET', `/repos/${owner}/${repo}/pulls`, options);
    }

    /**
     * Get PR
     */
    async getPR(owner, repo, prNumber) {
        return await this.request('GET', `/repos/${owner}/${repo}/pulls/${prNumber}`);
    }

    /**
     * Create PR
     */
    async createPR(owner, repo, title, head, base, body = '') {
        return await this.request('POST', `/repos/${owner}/${repo}/pulls`, {
            title,
            head,
            base,
            body
        });
    }

    /**
     * Update PR
     */
    async updatePR(owner, repo, prNumber, updates) {
        return await this.request('PATCH', `/repos/${owner}/${repo}/pulls/${prNumber}`, updates);
    }

    /**
     * Merge PR
     */
    async mergePR(owner, repo, prNumber, options = {}) {
        return await this.request('PUT', `/repos/${owner}/${repo}/pulls/${prNumber}/merge`, options);
    }

    /**
     * Request reviewers
     */
    async requestReviewers(owner, repo, prNumber, reviewers) {
        return await this.request('POST', `/repos/${owner}/${repo}/pulls/${prNumber}/requested_reviewers`, {
            reviewers
        });
    }

    /**
     * Add PR comment
     */
    async addPRComment(owner, repo, prNumber, body) {
        return await this.request('POST', `/repos/${owner}/${repo}/issues/${prNumber}/comments`, { body });
    }

    // ============================================
    // COMMITS
    // ============================================

    /**
     * List commits
     */
    async listCommits(owner, repo, options = {}) {
        return await this.request('GET', `/repos/${owner}/${repo}/commits`, options);
    }

    /**
     * Get commit
     */
    async getCommit(owner, repo, sha) {
        return await this.request('GET', `/repos/${owner}/${repo}/commits/${sha}`);
    }

    /**
     * Compare commits
     */
    async compareCommits(owner, repo, base, head) {
        return await this.request('GET', `/repos/${owner}/${repo}/compare/${base}...${head}`);
    }

    // ============================================
    // BRANCHES
    // ============================================

    /**
     * List branches
     */
    async listBranches(owner, repo) {
        return await this.request('GET', `/repos/${owner}/${repo}/branches`);
    }

    /**
     * Get branch
     */
    async getBranch(owner, repo, branch) {
        return await this.request('GET', `/repos/${owner}/${repo}/branches/${branch}`);
    }

    /**
     * Create branch
     */
    async createBranch(owner, repo, branch, sha) {
        return await this.request('POST', `/repos/${owner}/${repo}/git/refs`, {
            ref: `refs/heads/${branch}`,
            sha
        });
    }

    /**
     * Delete branch
     */
    async deleteBranch(owner, repo, branch) {
        return await this.request('DELETE', `/repos/${owner}/${repo}/git/refs/heads/${branch}`);
    }

    // ============================================
    // CONTENTS
    // ============================================

    /**
     * Get file content
     */
    async getFileContent(owner, repo, path, ref = 'main') {
        return await this.request('GET', `/repos/${owner}/${repo}/contents/${path}`, { ref });
    }

    /**
     * Create file
     */
    async createFile(owner, repo, path, message, content, branch = 'main') {
        return await this.request('PUT', `/repos/${owner}/${repo}/contents/${path}`, {
            message,
            content: Buffer.from(content).toString('base64'),
            branch
        });
    }

    /**
     * Update file
     */
    async updateFile(owner, repo, path, message, content, sha, branch = 'main') {
        return await this.request('PUT', `/repos/${owner}/${repo}/contents/${path}`, {
            message,
            content: Buffer.from(content).toString('base64'),
            sha,
            branch
        });
    }

    /**
     * Delete file
     */
    async deleteFile(owner, repo, path, message, sha, branch = 'main') {
        return await this.request('DELETE', `/repos/${owner}/${repo}/contents/${path}`, {
            message,
            sha,
            branch
        });
    }

    // ============================================
    // ACTIONS
    // ============================================

    /**
     * List workflows
     */
    async listWorkflows(owner, repo) {
        return await this.request('GET', `/repos/${owner}/${repo}/actions/workflows`);
    }

    /**
     * Trigger workflow
     */
    async triggerWorkflow(owner, repo, workflowId, ref = 'main', inputs = {}) {
        return await this.request('POST', `/repos/${owner}/${repo}/actions/workflows/${workflowId}/dispatches`, {
            ref,
            inputs
        });
    }

    /**
     * List workflow runs
     */
    async listWorkflowRuns(owner, repo, options = {}) {
        return await this.request('GET', `/repos/${owner}/${repo}/actions/runs`, options);
    }

    /**
     * Get workflow run
     */
    async getWorkflowRun(owner, repo, runId) {
        return await this.request('GET', `/repos/${owner}/${repo}/actions/runs/${runId}`);
    }

    /**
     * Cancel workflow run
     */
    async cancelWorkflowRun(owner, repo, runId) {
        return await this.request('POST', `/repos/${owner}/${repo}/actions/runs/${runId}/cancel`);
    }

    // ============================================
    // RELEASES
    // ============================================

    /**
     * List releases
     */
    async listReleases(owner, repo) {
        return await this.request('GET', `/repos/${owner}/${repo}/releases`);
    }

    /**
     * Get latest release
     */
    async getLatestRelease(owner, repo) {
        return await this.request('GET', `/repos/${owner}/${repo}/releases/latest`);
    }

    /**
     * Create release
     */
    async createRelease(owner, repo, tagName, name, body, options = {}) {
        return await this.request('POST', `/repos/${owner}/${repo}/releases`, {
            tag_name: tagName,
            name,
            body,
            ...options
        });
    }

    // ============================================
    // USERS
    // ============================================

    /**
     * Get authenticated user
     */
    async getAuthenticatedUser() {
        return await this.request('GET', '/user');
    }

    /**
     * Get user
     */
    async getUser(username) {
        return await this.request('GET', `/users/${username}`);
    }

    /**
     * List followers
     */
    async listFollowers(username = null) {
        const endpoint = username ? `/users/${username}/followers` : '/user/followers';
        return await this.request('GET', endpoint);
    }

    /**
     * List following
     */
    async listFollowing(username = null) {
        const endpoint = username ? `/users/${username}/following` : '/user/following';
        return await this.request('GET', endpoint);
    }

    /**
     * Follow user
     */
    async followUser(username) {
        return await this.request('PUT', `/user/following/${username}`);
    }

    /**
     * Unfollow user
     */
    async unfollowUser(username) {
        return await this.request('DELETE', `/user/following/${username}`);
    }

    // ============================================
    // GISTS
    // ============================================

    /**
     * List gists
     */
    async listGists(username = null) {
        const endpoint = username ? `/users/${username}/gists` : '/gists';
        return await this.request('GET', endpoint);
    }

    /**
     * Create gist
     */
    async createGist(description, files, isPublic = true) {
        return await this.request('POST', '/gists', {
            description,
            public: isPublic,
            files
        });
    }

    /**
     * Update gist
     */
    async updateGist(gistId, updates) {
        return await this.request('PATCH', `/gists/${gistId}`, updates);
    }

    /**
     * Delete gist
     */
    async deleteGist(gistId) {
        return await this.request('DELETE', `/gists/${gistId}`);
    }
}

module.exports = GitHubAPI;
