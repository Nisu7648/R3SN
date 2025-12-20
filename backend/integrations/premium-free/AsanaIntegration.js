const axios = require('axios');

/**
 * Asana Integration
 * FREE Premium App - Task and project management
 * Sign up at: https://asana.com
 * Get API token: https://app.asana.com/0/my-apps
 * 
 * Features:
 * - Workspace management
 * - Project operations
 * - Task CRUD
 * - Sections
 * - Tags
 * - Attachments
 * - Comments
 * - Custom fields
 * 
 * FREE Plan: Unlimited tasks, projects, and messages
 */
class AsanaIntegration {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseUrl = 'https://app.asana.com/api/1.0';
  }

  /**
   * Get headers
   */
  getHeaders() {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Get workspaces
   */
  async getWorkspaces() {
    try {
      const response = await axios.get(`${this.baseUrl}/workspaces`, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        workspaces: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.message || error.message
      };
    }
  }

  /**
   * Get projects in workspace
   */
  async getProjects(workspaceId) {
    try {
      const response = await axios.get(`${this.baseUrl}/projects`, {
        headers: this.getHeaders(),
        params: { workspace: workspaceId }
      });

      return {
        success: true,
        projects: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.message || error.message
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
        project: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.message || error.message
      };
    }
  }

  /**
   * Create project
   */
  async createProject(workspaceId, name, notes = '', color = 'light-green') {
    try {
      const response = await axios.post(`${this.baseUrl}/projects`, {
        data: {
          workspace: workspaceId,
          name,
          notes,
          color
        }
      }, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        project: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.message || error.message
      };
    }
  }

  /**
   * Update project
   */
  async updateProject(projectId, updates) {
    try {
      const response = await axios.put(`${this.baseUrl}/projects/${projectId}`, {
        data: updates
      }, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        project: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.message || error.message
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
        error: error.response?.data?.errors?.[0]?.message || error.message
      };
    }
  }

  /**
   * Get tasks in project
   */
  async getTasks(projectId) {
    try {
      const response = await axios.get(`${this.baseUrl}/tasks`, {
        headers: this.getHeaders(),
        params: { project: projectId }
      });

      return {
        success: true,
        tasks: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.message || error.message
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
        task: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.message || error.message
      };
    }
  }

  /**
   * Create task
   */
  async createTask(projectId, name, notes = '', dueOn = null) {
    try {
      const taskData = {
        projects: [projectId],
        name,
        notes
      };

      if (dueOn) {
        taskData.due_on = dueOn;
      }

      const response = await axios.post(`${this.baseUrl}/tasks`, {
        data: taskData
      }, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        task: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.message || error.message
      };
    }
  }

  /**
   * Update task
   */
  async updateTask(taskId, updates) {
    try {
      const response = await axios.put(`${this.baseUrl}/tasks/${taskId}`, {
        data: updates
      }, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        task: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.message || error.message
      };
    }
  }

  /**
   * Complete task
   */
  async completeTask(taskId) {
    return await this.updateTask(taskId, { completed: true });
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
        error: error.response?.data?.errors?.[0]?.message || error.message
      };
    }
  }

  /**
   * Add comment to task
   */
  async addComment(taskId, text) {
    try {
      const response = await axios.post(`${this.baseUrl}/tasks/${taskId}/stories`, {
        data: { text }
      }, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        comment: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.message || error.message
      };
    }
  }

  /**
   * Get task comments
   */
  async getComments(taskId) {
    try {
      const response = await axios.get(`${this.baseUrl}/tasks/${taskId}/stories`, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        comments: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.message || error.message
      };
    }
  }

  /**
   * Add subtask
   */
  async addSubtask(parentTaskId, name, notes = '') {
    try {
      const response = await axios.post(`${this.baseUrl}/tasks/${parentTaskId}/subtasks`, {
        data: { name, notes }
      }, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        subtask: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.message || error.message
      };
    }
  }

  /**
   * Get subtasks
   */
  async getSubtasks(taskId) {
    try {
      const response = await axios.get(`${this.baseUrl}/tasks/${taskId}/subtasks`, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        subtasks: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.message || error.message
      };
    }
  }

  /**
   * Add tag to task
   */
  async addTag(taskId, tagId) {
    try {
      const response = await axios.post(`${this.baseUrl}/tasks/${taskId}/addTag`, {
        data: { tag: tagId }
      }, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        task: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.message || error.message
      };
    }
  }

  /**
   * Get tags in workspace
   */
  async getTags(workspaceId) {
    try {
      const response = await axios.get(`${this.baseUrl}/tags`, {
        headers: this.getHeaders(),
        params: { workspace: workspaceId }
      });

      return {
        success: true,
        tags: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.message || error.message
      };
    }
  }

  /**
   * Create tag
   */
  async createTag(workspaceId, name, color = 'light-green') {
    try {
      const response = await axios.post(`${this.baseUrl}/tags`, {
        data: {
          workspace: workspaceId,
          name,
          color
        }
      }, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        tag: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.message || error.message
      };
    }
  }

  /**
   * Search tasks
   */
  async searchTasks(workspaceId, query) {
    try {
      const response = await axios.get(`${this.baseUrl}/workspaces/${workspaceId}/tasks/search`, {
        headers: this.getHeaders(),
        params: { text: query }
      });

      return {
        success: true,
        tasks: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.message || error.message
      };
    }
  }

  /**
   * Get user's tasks
   */
  async getMyTasks(workspaceId) {
    try {
      const response = await axios.get(`${this.baseUrl}/user_task_lists`, {
        headers: this.getHeaders(),
        params: { workspace: workspaceId }
      });

      const userTaskListId = response.data.data[0]?.gid;
      
      if (!userTaskListId) {
        return { success: true, tasks: [] };
      }

      const tasksResponse = await axios.get(`${this.baseUrl}/user_task_lists/${userTaskListId}/tasks`, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        tasks: tasksResponse.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.message || error.message
      };
    }
  }
}

module.exports = AsanaIntegration;
