/**
 * Asana Project Management Integration
 */

const asana = require('asana');

class AsanaIntegration {
  constructor(config) {
    this.accessToken = config.accessToken || process.env.ASANA_ACCESS_TOKEN;
    if (!this.accessToken) throw new Error('Asana access token required');
    
    this.client = asana.Client.create().useAccessToken(this.accessToken);
  }

  async getWorkspaces() {
    try {
      const workspaces = await this.client.workspaces.findAll();
      return { success: true, workspaces: workspaces.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getProjects(workspaceId) {
    try {
      const projects = await this.client.projects.findByWorkspace(workspaceId);
      return { success: true, projects: projects.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createProject(workspaceId, name, notes = '') {
    try {
      const project = await this.client.projects.create({ workspace: workspaceId, name, notes });
      return { success: true, project: project };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getTasks(projectId) {
    try {
      const tasks = await this.client.tasks.findByProject(projectId);
      return { success: true, tasks: tasks.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createTask(workspaceId, name, notes = '', assignee = null) {
    try {
      const taskData = { workspace: workspaceId, name, notes };
      if (assignee) taskData.assignee = assignee;
      
      const task = await this.client.tasks.create(taskData);
      return { success: true, task: task };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateTask(taskId, updates) {
    try {
      const task = await this.client.tasks.update(taskId, updates);
      return { success: true, task: task };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteTask(taskId) {
    try {
      await this.client.tasks.delete(taskId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async addComment(taskId, text) {
    try {
      const story = await this.client.stories.createOnTask(taskId, { text });
      return { success: true, comment: story };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getComments(taskId) {
    try {
      const stories = await this.client.stories.findByTask(taskId);
      return { success: true, comments: stories.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createSection(projectId, name) {
    try {
      const section = await this.client.sections.createInProject(projectId, { name });
      return { success: true, section: section };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getSections(projectId) {
    try {
      const sections = await this.client.sections.findByProject(projectId);
      return { success: true, sections: sections.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async addTaskToSection(taskId, sectionId) {
    try {
      await this.client.sections.addTask(sectionId, { task: taskId });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = AsanaIntegration;
