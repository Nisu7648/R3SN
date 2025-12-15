/**
 * GitHub Integration API Routes
 * 30 endpoints for complete GitHub functionality
 */

const express = require('express');
const router = express.Router();
const GitHubIntegration = require('../../integrations/github');
const { authenticate } = require('../../middleware/auth');

const initGitHubClient = (req, res, next) => {
  const token = req.body.token || req.query.token || req.headers['x-github-token'];
  if (!token) return res.status(400).json({ success: false, error: 'GitHub token is required' });
  req.githubClient = new GitHubIntegration(token);
  next();
};

// REPOSITORIES
router.get('/repos/list', authenticate, initGitHubClient, async (req, res, next) => {
  try {
    const result = await req.githubClient.listRepos(req.query);
    res.json(result);
  } catch (error) { next(error); }
});

router.post('/repos/create', authenticate, initGitHubClient, async (req, res, next) => {
  try {
    const { name, ...options } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Name is required' });
    const result = await req.githubClient.createRepo(name, options);
    res.json(result);
  } catch (error) { next(error); }
});

router.get('/repos/:owner/:repo', authenticate, initGitHubClient, async (req, res, next) => {
  try {
    const result = await req.githubClient.getRepo(req.params.owner, req.params.repo);
    res.json(result);
  } catch (error) { next(error); }
});

router.patch('/repos/:owner/:repo', authenticate, initGitHubClient, async (req, res, next) => {
  try {
    const result = await req.githubClient.updateRepo(req.params.owner, req.params.repo, req.body);
    res.json(result);
  } catch (error) { next(error); }
});

router.delete('/repos/:owner/:repo', authenticate, initGitHubClient, async (req, res, next) => {
  try {
    const result = await req.githubClient.deleteRepo(req.params.owner, req.params.repo);
    res.json(result);
  } catch (error) { next(error); }
});

// BRANCHES
router.get('/repos/:owner/:repo/branches', authenticate, initGitHubClient, async (req, res, next) => {
  try {
    const result = await req.githubClient.listBranches(req.params.owner, req.params.repo, req.query);
    res.json(result);
  } catch (error) { next(error); }
});

router.post('/repos/:owner/:repo/branches', authenticate, initGitHubClient, async (req, res, next) => {
  try {
    const { branch, sha } = req.body;
    if (!branch || !sha) return res.status(400).json({ success: false, error: 'Branch and SHA are required' });
    const result = await req.githubClient.createBranch(req.params.owner, req.params.repo, branch, sha);
    res.json(result);
  } catch (error) { next(error); }
});

router.get('/repos/:owner/:repo/branches/:branch', authenticate, initGitHubClient, async (req, res, next) => {
  try {
    const result = await req.githubClient.getBranch(req.params.owner, req.params.repo, req.params.branch);
    res.json(result);
  } catch (error) { next(error); }
});

router.delete('/repos/:owner/:repo/branches/:branch', authenticate, initGitHubClient, async (req, res, next) => {
  try {
    const result = await req.githubClient.deleteBranch(req.params.owner, req.params.repo, req.params.branch);
    res.json(result);
  } catch (error) { next(error); }
});

// COMMITS
router.get('/repos/:owner/:repo/commits', authenticate, initGitHubClient, async (req, res, next) => {
  try {
    const result = await req.githubClient.listCommits(req.params.owner, req.params.repo, req.query);
    res.json(result);
  } catch (error) { next(error); }
});

router.get('/repos/:owner/:repo/commits/:sha', authenticate, initGitHubClient, async (req, res, next) => {
  try {
    const result = await req.githubClient.getCommit(req.params.owner, req.params.repo, req.params.sha);
    res.json(result);
  } catch (error) { next(error); }
});

router.post('/repos/:owner/:repo/commits', authenticate, initGitHubClient, async (req, res, next) => {
  try {
    const { message, tree, parents } = req.body;
    if (!message || !tree || !parents) return res.status(400).json({ success: false, error: 'Message, tree, and parents are required' });
    const result = await req.githubClient.createCommit(req.params.owner, req.params.repo, message, tree, parents);
    res.json(result);
  } catch (error) { next(error); }
});

// PULL REQUESTS
router.get('/repos/:owner/:repo/pulls', authenticate, initGitHubClient, async (req, res, next) => {
  try {
    const result = await req.githubClient.listPRs(req.params.owner, req.params.repo, req.query);
    res.json(result);
  } catch (error) { next(error); }
});

router.post('/repos/:owner/:repo/pulls', authenticate, initGitHubClient, async (req, res, next) => {
  try {
    const { title, head, base, ...options } = req.body;
    if (!title || !head || !base) return res.status(400).json({ success: false, error: 'Title, head, and base are required' });
    const result = await req.githubClient.createPR(req.params.owner, req.params.repo, title, head, base, options);
    res.json(result);
  } catch (error) { next(error); }
});

router.get('/repos/:owner/:repo/pulls/:number', authenticate, initGitHubClient, async (req, res, next) => {
  try {
    const result = await req.githubClient.getPR(req.params.owner, req.params.repo, req.params.number);
    res.json(result);
  } catch (error) { next(error); }
});

router.patch('/repos/:owner/:repo/pulls/:number', authenticate, initGitHubClient, async (req, res, next) => {
  try {
    const result = await req.githubClient.updatePR(req.params.owner, req.params.repo, req.params.number, req.body);
    res.json(result);
  } catch (error) { next(error); }
});

router.put('/repos/:owner/:repo/pulls/:number/merge', authenticate, initGitHubClient, async (req, res, next) => {
  try {
    const result = await req.githubClient.mergePR(req.params.owner, req.params.repo, req.params.number, req.body);
    res.json(result);
  } catch (error) { next(error); }
});

// ISSUES
router.get('/repos/:owner/:repo/issues', authenticate, initGitHubClient, async (req, res, next) => {
  try {
    const result = await req.githubClient.listIssues(req.params.owner, req.params.repo, req.query);
    res.json(result);
  } catch (error) { next(error); }
});

router.post('/repos/:owner/:repo/issues', authenticate, initGitHubClient, async (req, res, next) => {
  try {
    const { title, ...options } = req.body;
    if (!title) return res.status(400).json({ success: false, error: 'Title is required' });
    const result = await req.githubClient.createIssue(req.params.owner, req.params.repo, title, options);
    res.json(result);
  } catch (error) { next(error); }
});

router.get('/repos/:owner/:repo/issues/:number', authenticate, initGitHubClient, async (req, res, next) => {
  try {
    const result = await req.githubClient.getIssue(req.params.owner, req.params.repo, req.params.number);
    res.json(result);
  } catch (error) { next(error); }
});

router.patch('/repos/:owner/:repo/issues/:number', authenticate, initGitHubClient, async (req, res, next) => {
  try {
    const result = await req.githubClient.updateIssue(req.params.owner, req.params.repo, req.params.number, req.body);
    res.json(result);
  } catch (error) { next(error); }
});

router.post('/repos/:owner/:repo/issues/:number/close', authenticate, initGitHubClient, async (req, res, next) => {
  try {
    const result = await req.githubClient.closeIssue(req.params.owner, req.params.repo, req.params.number);
    res.json(result);
  } catch (error) { next(error); }
});

// COMMENTS
router.post('/repos/:owner/:repo/issues/:number/comments', authenticate, initGitHubClient, async (req, res, next) => {
  try {
    const { body } = req.body;
    if (!body) return res.status(400).json({ success: false, error: 'Body is required' });
    const result = await req.githubClient.addComment(req.params.owner, req.params.repo, req.params.number, body);
    res.json(result);
  } catch (error) { next(error); }
});

router.get('/repos/:owner/:repo/issues/:number/comments', authenticate, initGitHubClient, async (req, res, next) => {
  try {
    const result = await req.githubClient.listComments(req.params.owner, req.params.repo, req.params.number, req.query);
    res.json(result);
  } catch (error) { next(error); }
});

// USERS & ORGS
router.get('/users/:username', authenticate, initGitHubClient, async (req, res, next) => {
  try {
    const result = await req.githubClient.getUser(req.params.username);
    res.json(result);
  } catch (error) { next(error); }
});

router.get('/user/orgs', authenticate, initGitHubClient, async (req, res, next) => {
  try {
    const result = await req.githubClient.listOrgs();
    res.json(result);
  } catch (error) { next(error); }
});

router.get('/orgs/:org', authenticate, initGitHubClient, async (req, res, next) => {
  try {
    const result = await req.githubClient.getOrg(req.params.org);
    res.json(result);
  } catch (error) { next(error); }
});

router.get('/orgs/:org/teams', authenticate, initGitHubClient, async (req, res, next) => {
  try {
    const result = await req.githubClient.listTeams(req.params.org);
    res.json(result);
  } catch (error) { next(error); }
});

// WEBHOOKS
router.post('/repos/:owner/:repo/hooks', authenticate, initGitHubClient, async (req, res, next) => {
  try {
    const { config, events } = req.body;
    if (!config) return res.status(400).json({ success: false, error: 'Config is required' });
    const result = await req.githubClient.createWebhook(req.params.owner, req.params.repo, config, events);
    res.json(result);
  } catch (error) { next(error); }
});

router.get('/repos/:owner/:repo/hooks', authenticate, initGitHubClient, async (req, res, next) => {
  try {
    const result = await req.githubClient.listWebhooks(req.params.owner, req.params.repo);
    res.json(result);
  } catch (error) { next(error); }
});

module.exports = router;
