/**
 * ClickUp Integration - Complete Implementation
 * 25 endpoints for full ClickUp functionality
 */

const axios = require('axios');

class ClickUpIntegration {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.clickup.com/api/v2';
  }

  getHeaders() {
    return {
      'Authorization': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  async getTeams() {
    try {
      const response = await axios.get(`${this.baseUrl}/team`, { headers: this.getHeaders() });
      return { success: true, teams: response.data.teams };
    } catch (error) {
      throw new Error(`Failed to get teams: ${error.response?.data?.err || error.message}`);
    }
  }

  async getSpaces(teamId) {
    try {
      const response = await axios.get(`${this.baseUrl}/team/${teamId}/space`, { headers: this.getHeaders() });
      return { success: true, spaces: response.data.spaces };
    } catch (error) {
      throw new Error(`Failed to get spaces: ${error.response?.data?.err || error.message}`);
    }
  }

  async createSpace(teamId, name, options = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/team/${teamId}/space`,
        { name, ...options },
        { headers: this.getHeaders() }
      );
      return { success: true, space: response.data };
    } catch (error) {
      throw new Error(`Failed to create space: ${error.response?.data?.err || error.message}`);
    }
  }

  async getSpace(spaceId) {
    try {
      const response = await axios.get(`${this.baseUrl}/space/${spaceId}`, { headers: this.getHeaders() });
      return { success: true, space: response.data };
    } catch (error) {
      throw new Error(`Failed to get space: ${error.response?.data?.err || error.message}`);
    }
  }

  async updateSpace(spaceId, updates) {
    try {
      const response = await axios.put(`${this.baseUrl}/space/${spaceId}`,
        updates,
        { headers: this.getHeaders() }
      );
      return { success: true, space: response.data };
    } catch (error) {
      throw new Error(`Failed to update space: ${error.response?.data?.err || error.message}`);
    }
  }

  async deleteSpace(spaceId) {
    try {
      await axios.delete(`${this.baseUrl}/space/${spaceId}`, { headers: this.getHeaders() });
      return { success: true, message: 'Space deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete space: ${error.response?.data?.err || error.message}`);
    }
  }

  async getFolders(spaceId) {
    try {
      const response = await axios.get(`${this.baseUrl}/space/${spaceId}/folder`, { headers: this.getHeaders() });
      return { success: true, folders: response.data.folders };
    } catch (error) {
      throw new Error(`Failed to get folders: ${error.response?.data?.err || error.message}`);
    }
  }

  async createFolder(spaceId, name) {
    try {
      const response = await axios.post(`${this.baseUrl}/space/${spaceId}/folder`,
        { name },
        { headers: this.getHeaders() }
      );
      return { success: true, folder: response.data };
    } catch (error) {
      throw new Error(`Failed to create folder: ${error.response?.data?.err || error.message}`);
    }
  }

  async getLists(folderId) {
    try {
      const response = await axios.get(`${this.baseUrl}/folder/${folderId}/list`, { headers: this.getHeaders() });
      return { success: true, lists: response.data.lists };
    } catch (error) {
      throw new Error(`Failed to get lists: ${error.response?.data?.err || error.message}`);
    }
  }

  async createList(folderId, name, options = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/folder/${folderId}/list`,
        { name, ...options },
        { headers: this.getHeaders() }
      );
      return { success: true, list: response.data };
    } catch (error) {
      throw new Error(`Failed to create list: ${error.response?.data?.err || error.message}`);
    }
  }

  async getList(listId) {
    try {
      const response = await axios.get(`${this.baseUrl}/list/${listId}`, { headers: this.getHeaders() });
      return { success: true, list: response.data };
    } catch (error) {
      throw new Error(`Failed to get list: ${error.response?.data?.err || error.message}`);
    }
  }

  async getTasks(listId, options = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}/list/${listId}/task`, {
        headers: this.getHeaders(),
        params: options,
      });
      return { success: true, tasks: response.data.tasks };
    } catch (error) {
      throw new Error(`Failed to get tasks: ${error.response?.data?.err || error.message}`);
    }
  }

  async createTask(listId, name, options = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/list/${listId}/task`,
        { name, ...options },
        { headers: this.getHeaders() }
      );
      return { success: true, task: response.data };
    } catch (error) {
      throw new Error(`Failed to create task: ${error.response?.data?.err || error.message}`);
    }
  }

  async getTask(taskId) {
    try {
      const response = await axios.get(`${this.baseUrl}/task/${taskId}`, { headers: this.getHeaders() });
      return { success: true, task: response.data };
    } catch (error) {
      throw new Error(`Failed to get task: ${error.response?.data?.err || error.message}`);
    }
  }

  async updateTask(taskId, updates) {
    try {
      const response = await axios.put(`${this.baseUrl}/task/${taskId}`,
        updates,
        { headers: this.getHeaders() }
      );
      return { success: true, task: response.data };
    } catch (error) {
      throw new Error(`Failed to update task: ${error.response?.data?.err || error.message}`);
    }
  }

  async deleteTask(taskId) {
    try {
      await axios.delete(`${this.baseUrl}/task/${taskId}`, { headers: this.getHeaders() });
      return { success: true, message: 'Task deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete task: ${error.response?.data?.err || error.message}`);
    }
  }

  async addComment(taskId, commentText) {
    try {
      const response = await axios.post(`${this.baseUrl}/task/${taskId}/comment`,
        { comment_text: commentText },
        { headers: this.getHeaders() }
      );
      return { success: true, comment: response.data };
    } catch (error) {
      throw new Error(`Failed to add comment: ${error.response?.data?.err || error.message}`);
    }
  }

  async getComments(taskId) {
    try {
      const response = await axios.get(`${this.baseUrl}/task/${taskId}/comment`, { headers: this.getHeaders() });
      return { success: true, comments: response.data.comments };
    } catch (error) {
      throw new Error(`Failed to get comments: ${error.response?.data?.err || error.message}`);
    }
  }

  async createChecklist(taskId, name) {
    try {
      const response = await axios.post(`${this.baseUrl}/task/${taskId}/checklist`,
        { name },
        { headers: this.getHeaders() }
      );
      return { success: true, checklist: response.data };
    } catch (error) {
      throw new Error(`Failed to create checklist: ${error.response?.data?.err || error.message}`);
    }
  }

  async addAttachment(taskId, attachment) {
    try {
      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('attachment', attachment);

      const response = await axios.post(`${this.baseUrl}/task/${taskId}/attachment`,
        formData,
        {
          headers: {
            ...this.getHeaders(),
            ...formData.getHeaders(),
          },
        }
      );
      return { success: true, attachment: response.data };
    } catch (error) {
      throw new Error(`Failed to add attachment: ${error.response?.data?.err || error.message}`);
    }
  }

  async getTimeEntries(teamId, options = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}/team/${teamId}/time_entries`, {
        headers: this.getHeaders(),
        params: options,
      });
      return { success: true, timeEntries: response.data.data };
    } catch (error) {
      throw new Error(`Failed to get time entries: ${error.response?.data?.err || error.message}`);
    }
  }

  async createTimeEntry(teamId, taskId, duration, start) {
    try {
      const response = await axios.post(`${this.baseUrl}/team/${teamId}/time_entries`,
        { tid: taskId, duration, start },
        { headers: this.getHeaders() }
      );
      return { success: true, timeEntry: response.data };
    } catch (error) {
      throw new Error(`Failed to create time entry: ${error.response?.data?.err || error.message}`);
    }
  }

  async getMembers(teamId) {
    try {
      const response = await axios.get(`${this.baseUrl}/team/${teamId}/user`, { headers: this.getHeaders() });
      return { success: true, members: response.data.members };
    } catch (error) {
      throw new Error(`Failed to get members: ${error.response?.data?.err || error.message}`);
    }
  }

  async getTags(spaceId) {
    try {
      const response = await axios.get(`${this.baseUrl}/space/${spaceId}/tag`, { headers: this.getHeaders() });
      return { success: true, tags: response.data.tags };
    } catch (error) {
      throw new Error(`Failed to get tags: ${error.response?.data?.err || error.message}`);
    }
  }

  async createTag(spaceId, name, tagFg, tagBg) {
    try {
      const response = await axios.post(`${this.baseUrl}/space/${spaceId}/tag`,
        { tag: { name, tag_fg: tagFg, tag_bg: tagBg } },
        { headers: this.getHeaders() }
      );
      return { success: true, tag: response.data };
    } catch (error) {
      throw new Error(`Failed to create tag: ${error.response?.data?.err || error.message}`);
    }
  }
}

module.exports = ClickUpIntegration;
