const axios = require('axios');

/**
 * Todoist Integration
 * FREE Premium App - Simple, powerful task management
 * Sign up at: https://todoist.com
 * Get API token: https://todoist.com/prefs/integrations
 * 
 * Features:
 * - Projects
 * - Tasks with subtasks
 * - Labels
 * - Filters
 * - Comments
 * - Attachments
 * - Recurring tasks
 * - Priority levels
 * 
 * FREE Plan: 300 active projects, 5 people per project
 */
class TodoistIntegration {
  constructor(apiToken) {
    this.apiToken = apiToken;
    this.baseUrl = 'https://api.todoist.com/rest/v2';
    this.syncUrl = 'https://api.todoist.com/sync/v9';
  }

  /**
   * Get headers
   */
  getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Get all projects
   */
  async getProjects() {
    try {
      const response = await axios.get(`${this.baseUrl}/projects`, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        projects: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Get project by ID
   */
  async getProject(projectId) {
    try {
      const response = await axios.get(`${this.baseUrl}/projects/${projectId}`, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        project: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Create project
   */
  async createProject(name, color = 'grey', favorite = false) {
    try {
      const response = await axios.post(`${this.baseUrl}/projects`, {
        name,
        color,
        is_favorite: favorite
      }, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        project: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Update project
   */
  async updateProject(projectId, updates) {
    try {
      const response = await axios.post(`${this.baseUrl}/projects/${projectId}`, updates, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        project: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Delete project
   */
  async deleteProject(projectId) {
    try {
      await axios.delete(`${this.baseUrl}/projects/${projectId}`, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        message: 'Project deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Get all tasks
   */
  async getTasks(filter = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}/tasks`, {
        headers: this.getHeaders(),
        params: filter
      });

      return {
        success: true,
        tasks: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Get task by ID
   */
  async getTask(taskId) {
    try {
      const response = await axios.get(`${this.baseUrl}/tasks/${taskId}`, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        task: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Create task
   */
  async createTask(content, options = {}) {
    try {
      const taskData = {
        content,
        ...options
      };

      const response = await axios.post(`${this.baseUrl}/tasks`, taskData, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        task: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Update task
   */
  async updateTask(taskId, updates) {
    try {
      const response = await axios.post(`${this.baseUrl}/tasks/${taskId}`, updates, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        task: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Complete task
   */
  async completeTask(taskId) {
    try {
      await axios.post(`${this.baseUrl}/tasks/${taskId}/close`, {}, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        message: 'Task completed successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Reopen task
   */
  async reopenTask(taskId) {
    try {
      await axios.post(`${this.baseUrl}/tasks/${taskId}/reopen`, {}, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        message: 'Task reopened successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Delete task
   */
  async deleteTask(taskId) {
    try {
      await axios.delete(`${this.baseUrl}/tasks/${taskId}`, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        message: 'Task deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Get all labels
   */
  async getLabels() {
    try {
      const response = await axios.get(`${this.baseUrl}/labels`, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        labels: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Create label
   */
  async createLabel(name, color = 'grey') {
    try {
      const response = await axios.post(`${this.baseUrl}/labels`, {
        name,
        color
      }, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        label: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Update label
   */
  async updateLabel(labelId, updates) {
    try {
      const response = await axios.post(`${this.baseUrl}/labels/${labelId}`, updates, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        label: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Delete label
   */
  async deleteLabel(labelId) {
    try {
      await axios.delete(`${this.baseUrl}/labels/${labelId}`, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        message: 'Label deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Get comments for task
   */
  async getComments(taskId) {
    try {
      const response = await axios.get(`${this.baseUrl}/comments`, {
        headers: this.getHeaders(),
        params: { task_id: taskId }
      });

      return {
        success: true,
        comments: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Add comment to task
   */
  async addComment(taskId, content) {
    try {
      const response = await axios.post(`${this.baseUrl}/comments`, {
        task_id: taskId,
        content
      }, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        comment: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Update comment
   */
  async updateComment(commentId, content) {
    try {
      const response = await axios.post(`${this.baseUrl}/comments/${commentId}`, {
        content
      }, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        comment: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Delete comment
   */
  async deleteComment(commentId) {
    try {
      await axios.delete(`${this.baseUrl}/comments/${commentId}`, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        message: 'Comment deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Get sections in project
   */
  async getSections(projectId) {
    try {
      const response = await axios.get(`${this.baseUrl}/sections`, {
        headers: this.getHeaders(),
        params: { project_id: projectId }
      });

      return {
        success: true,
        sections: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Create section
   */
  async createSection(projectId, name) {
    try {
      const response = await axios.post(`${this.baseUrl}/sections`, {
        project_id: projectId,
        name
      }, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        section: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Helper: Create task with due date
   */
  async createTaskWithDue(content, projectId, dueString) {
    return await this.createTask(content, {
      project_id: projectId,
      due_string: dueString
    });
  }

  /**
   * Helper: Create task with priority
   */
  async createTaskWithPriority(content, projectId, priority = 1) {
    return await this.createTask(content, {
      project_id: projectId,
      priority
    });
  }

  /**
   * Helper: Get today's tasks
   */
  async getTodayTasks() {
    return await this.getTasks({ filter: 'today' });
  }

  /**
   * Helper: Get overdue tasks
   */
  async getOverdueTasks() {
    return await this.getTasks({ filter: 'overdue' });
  }
}

module.exports = TodoistIntegration;
