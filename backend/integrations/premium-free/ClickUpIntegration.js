const axios = require('axios');

/**
 * ClickUp Integration
 * FREE Premium App - All-in-one productivity platform
 * Sign up at: https://clickup.com
 * Get API token: https://app.clickup.com/settings/apps
 * 
 * Features:
 * - Workspace/Team management
 * - Spaces and folders
 * - Lists and tasks
 * - Custom fields
 * - Time tracking
 * - Goals
 * - Comments
 * - Attachments
 * 
 * FREE Plan: Unlimited tasks and members
 */
class ClickUpIntegration {
  constructor(apiToken) {
    this.apiToken = apiToken;
    this.baseUrl = 'https://api.clickup.com/api/v2';
  }

  /**
   * Get headers
   */
  getHeaders() {
    return {
      'Authorization': this.apiToken,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Get authorized user
   */
  async getUser() {
    try {
      const response = await axios.get(`${this.baseUrl}/user`, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        user: response.data.user
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.err || error.message
      };
    }
  }

  /**
   * Get teams (workspaces)
   */
  async getTeams() {
    try {
      const response = await axios.get(`${this.baseUrl}/team`, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        teams: response.data.teams
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.err || error.message
      };
    }
  }

  /**
   * Get spaces
   */
  async getSpaces(teamId) {
    try {
      const response = await axios.get(`${this.baseUrl}/team/${teamId}/space`, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        spaces: response.data.spaces
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.err || error.message
      };
    }
  }

  /**
   * Create space
   */
  async createSpace(teamId, name, features = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/team/${teamId}/space`, {
        name,
        features
      }, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        space: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.err || error.message
      };
    }
  }

  /**
   * Get folders
   */
  async getFolders(spaceId) {
    try {
      const response = await axios.get(`${this.baseUrl}/space/${spaceId}/folder`, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        folders: response.data.folders
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.err || error.message
      };
    }
  }

  /**
   * Create folder
   */
  async createFolder(spaceId, name) {
    try {
      const response = await axios.post(`${this.baseUrl}/space/${spaceId}/folder`, {
        name
      }, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        folder: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.err || error.message
      };
    }
  }

  /**
   * Get lists
   */
  async getLists(folderId) {
    try {
      const response = await axios.get(`${this.baseUrl}/folder/${folderId}/list`, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        lists: response.data.lists
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.err || error.message
      };
    }
  }

  /**
   * Get folderless lists
   */
  async getFolderlessLists(spaceId) {
    try {
      const response = await axios.get(`${this.baseUrl}/space/${spaceId}/list`, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        lists: response.data.lists
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.err || error.message
      };
    }
  }

  /**
   * Create list
   */
  async createList(folderId, name, content = '', dueDate = null) {
    try {
      const data = { name, content };
      if (dueDate) data.due_date = dueDate;

      const response = await axios.post(`${this.baseUrl}/folder/${folderId}/list`, data, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        list: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.err || error.message
      };
    }
  }

  /**
   * Get tasks
   */
  async getTasks(listId, options = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}/list/${listId}/task`, {
        headers: this.getHeaders(),
        params: options
      });

      return {
        success: true,
        tasks: response.data.tasks
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.err || error.message
      };
    }
  }

  /**
   * Get task by ID
   */
  async getTask(taskId) {
    try {
      const response = await axios.get(`${this.baseUrl}/task/${taskId}`, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        task: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.err || error.message
      };
    }
  }

  /**
   * Create task
   */
  async createTask(listId, name, description = '', options = {}) {
    try {
      const taskData = {
        name,
        description,
        ...options
      };

      const response = await axios.post(`${this.baseUrl}/list/${listId}/task`, taskData, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        task: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.err || error.message
      };
    }
  }

  /**
   * Update task
   */
  async updateTask(taskId, updates) {
    try {
      const response = await axios.put(`${this.baseUrl}/task/${taskId}`, updates, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        task: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.err || error.message
      };
    }
  }

  /**
   * Delete task
   */
  async deleteTask(taskId) {
    try {
      await axios.delete(`${this.baseUrl}/task/${taskId}`, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        message: 'Task deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.err || error.message
      };
    }
  }

  /**
   * Add comment to task
   */
  async addComment(taskId, commentText) {
    try {
      const response = await axios.post(`${this.baseUrl}/task/${taskId}/comment`, {
        comment_text: commentText
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
        error: error.response?.data?.err || error.message
      };
    }
  }

  /**
   * Get task comments
   */
  async getComments(taskId) {
    try {
      const response = await axios.get(`${this.baseUrl}/task/${taskId}/comment`, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        comments: response.data.comments
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.err || error.message
      };
    }
  }

  /**
   * Create checklist
   */
  async createChecklist(taskId, name) {
    try {
      const response = await axios.post(`${this.baseUrl}/task/${taskId}/checklist`, {
        name
      }, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        checklist: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.err || error.message
      };
    }
  }

  /**
   * Create checklist item
   */
  async createChecklistItem(checklistId, name, assignee = null) {
    try {
      const data = { name };
      if (assignee) data.assignee = assignee;

      const response = await axios.post(`${this.baseUrl}/checklist/${checklistId}/checklist_item`, data, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        item: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.err || error.message
      };
    }
  }

  /**
   * Start time tracking
   */
  async startTimeTracking(taskId, description = '') {
    try {
      const response = await axios.post(`${this.baseUrl}/task/${taskId}/time`, {
        description
      }, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        timer: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.err || error.message
      };
    }
  }

  /**
   * Stop time tracking
   */
  async stopTimeTracking(taskId) {
    try {
      const response = await axios.delete(`${this.baseUrl}/task/${taskId}/time`, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.err || error.message
      };
    }
  }

  /**
   * Get time entries
   */
  async getTimeEntries(taskId) {
    try {
      const response = await axios.get(`${this.baseUrl}/task/${taskId}/time`, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        entries: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.err || error.message
      };
    }
  }

  /**
   * Search tasks
   */
  async searchTasks(teamId, query) {
    try {
      const response = await axios.get(`${this.baseUrl}/team/${teamId}/task`, {
        headers: this.getHeaders(),
        params: { query }
      });

      return {
        success: true,
        tasks: response.data.tasks
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.err || error.message
      };
    }
  }

  /**
   * Get goals
   */
  async getGoals(teamId) {
    try {
      const response = await axios.get(`${this.baseUrl}/team/${teamId}/goal`, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        goals: response.data.goals
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.err || error.message
      };
    }
  }

  /**
   * Create goal
   */
  async createGoal(teamId, name, dueDate, description = '') {
    try {
      const response = await axios.post(`${this.baseUrl}/team/${teamId}/goal`, {
        name,
        due_date: dueDate,
        description
      }, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        goal: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.err || error.message
      };
    }
  }
}

module.exports = ClickUpIntegration;
