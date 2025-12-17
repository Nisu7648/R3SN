const express = require('express');
const router = express.Router();
const TodoistIntegration = require('../integrations/todoist-tasks');

const getTodoist = (req) => new TodoistIntegration({
  apiToken: req.body.apiToken || req.headers['x-todoist-api-token']
});

// Tasks
router.get('/tasks', async (req, res) => {
  try {
    const todoist = getTodoist(req);
    const result = await todoist.getTasks(req.query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/tasks/:taskId', async (req, res) => {
  try {
    const todoist = getTodoist(req);
    const result = await todoist.getTask(req.params.taskId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/tasks', async (req, res) => {
  try {
    const { content, ...options } = req.body;
    const todoist = getTodoist(req);
    const result = await todoist.createTask(content, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/tasks/:taskId', async (req, res) => {
  try {
    const todoist = getTodoist(req);
    const result = await todoist.updateTask(req.params.taskId, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/tasks/:taskId/close', async (req, res) => {
  try {
    const todoist = getTodoist(req);
    const result = await todoist.closeTask(req.params.taskId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/tasks/:taskId/reopen', async (req, res) => {
  try {
    const todoist = getTodoist(req);
    const result = await todoist.reopenTask(req.params.taskId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/tasks/:taskId', async (req, res) => {
  try {
    const todoist = getTodoist(req);
    const result = await todoist.deleteTask(req.params.taskId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Projects
router.get('/projects', async (req, res) => {
  try {
    const todoist = getTodoist(req);
    const result = await todoist.getProjects();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/projects/:projectId', async (req, res) => {
  try {
    const todoist = getTodoist(req);
    const result = await todoist.getProject(req.params.projectId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/projects', async (req, res) => {
  try {
    const { name, ...options } = req.body;
    const todoist = getTodoist(req);
    const result = await todoist.createProject(name, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/projects/:projectId', async (req, res) => {
  try {
    const todoist = getTodoist(req);
    const result = await todoist.updateProject(req.params.projectId, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/projects/:projectId', async (req, res) => {
  try {
    const todoist = getTodoist(req);
    const result = await todoist.deleteProject(req.params.projectId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Sections
router.get('/sections', async (req, res) => {
  try {
    const { projectId } = req.query;
    const todoist = getTodoist(req);
    const result = await todoist.getSections(projectId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/sections', async (req, res) => {
  try {
    const { name, projectId } = req.body;
    const todoist = getTodoist(req);
    const result = await todoist.createSection(name, projectId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Labels
router.get('/labels', async (req, res) => {
  try {
    const todoist = getTodoist(req);
    const result = await todoist.getLabels();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/labels', async (req, res) => {
  try {
    const { name, ...options } = req.body;
    const todoist = getTodoist(req);
    const result = await todoist.createLabel(name, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Comments
router.get('/comments', async (req, res) => {
  try {
    const { taskId, projectId } = req.query;
    const todoist = getTodoist(req);
    const result = await todoist.getComments(taskId, projectId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/comments', async (req, res) => {
  try {
    const { content, taskId, projectId } = req.body;
    const todoist = getTodoist(req);
    const result = await todoist.createComment(content, taskId, projectId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
