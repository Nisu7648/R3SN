const express = require('express');
const router = express.Router();
const AsanaIntegration = require('../integrations/asana-pm');

const getAsana = (req) => new AsanaIntegration({
  accessToken: req.body.accessToken || req.headers['x-asana-access-token']
});

router.get('/workspaces', async (req, res) => {
  try {
    const asana = getAsana(req);
    const result = await asana.getWorkspaces();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/projects', async (req, res) => {
  try {
    const { workspaceId } = req.query;
    const asana = getAsana(req);
    const result = await asana.getProjects(workspaceId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/projects', async (req, res) => {
  try {
    const { workspaceId, name, notes } = req.body;
    const asana = getAsana(req);
    const result = await asana.createProject(workspaceId, name, notes);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/tasks', async (req, res) => {
  try {
    const { projectId } = req.query;
    const asana = getAsana(req);
    const result = await asana.getTasks(projectId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/tasks', async (req, res) => {
  try {
    const { workspaceId, name, notes, assignee } = req.body;
    const asana = getAsana(req);
    const result = await asana.createTask(workspaceId, name, notes, assignee);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/tasks/:taskId', async (req, res) => {
  try {
    const asana = getAsana(req);
    const result = await asana.updateTask(req.params.taskId, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/tasks/:taskId', async (req, res) => {
  try {
    const asana = getAsana(req);
    const result = await asana.deleteTask(req.params.taskId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/tasks/:taskId/comments', async (req, res) => {
  try {
    const { text } = req.body;
    const asana = getAsana(req);
    const result = await asana.addComment(req.params.taskId, text);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/tasks/:taskId/comments', async (req, res) => {
  try {
    const asana = getAsana(req);
    const result = await asana.getComments(req.params.taskId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/sections', async (req, res) => {
  try {
    const { projectId, name } = req.body;
    const asana = getAsana(req);
    const result = await asana.createSection(projectId, name);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/sections', async (req, res) => {
  try {
    const { projectId } = req.query;
    const asana = getAsana(req);
    const result = await asana.getSections(projectId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/sections/:sectionId/tasks', async (req, res) => {
  try {
    const { taskId } = req.body;
    const asana = getAsana(req);
    const result = await asana.addTaskToSection(taskId, req.params.sectionId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
