/**
 * Basecamp Integration - Complete Implementation
 * 20 endpoints for full Basecamp functionality
 */

const axios = require('axios');

class BasecampIntegration {
  constructor(accessToken, accountId) {
    this.accessToken = accessToken;
    this.accountId = accountId;
    this.baseUrl = `https://3.basecampapi.com/${accountId}`;
  }

  getHeaders() {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      'User-Agent': 'R3SN Integration (contact@r3sn.com)',
    };
  }

  async getProjects() {
    try {
      const response = await axios.get(`${this.baseUrl}/projects.json`, { headers: this.getHeaders() });
      return { success: true, projects: response.data };
    } catch (error) {
      throw new Error(`Failed to get projects: ${error.response?.data?.error || error.message}`);
    }
  }

  async getProject(projectId) {
    try {
      const response = await axios.get(`${this.baseUrl}/projects/${projectId}.json`, { headers: this.getHeaders() });
      return { success: true, project: response.data };
    } catch (error) {
      throw new Error(`Failed to get project: ${error.response?.data?.error || error.message}`);
    }
  }

  async createProject(name, description = '') {
    try {
      const response = await axios.post(`${this.baseUrl}/projects.json`,
        { name, description },
        { headers: this.getHeaders() }
      );
      return { success: true, project: response.data };
    } catch (error) {
      throw new Error(`Failed to create project: ${error.response?.data?.error || error.message}`);
    }
  }

  async updateProject(projectId, updates) {
    try {
      const response = await axios.put(`${this.baseUrl}/projects/${projectId}.json`,
        updates,
        { headers: this.getHeaders() }
      );
      return { success: true, project: response.data };
    } catch (error) {
      throw new Error(`Failed to update project: ${error.response?.data?.error || error.message}`);
    }
  }

  async getTodoLists(bucketId) {
    try {
      const response = await axios.get(`${this.baseUrl}/buckets/${bucketId}/todolists.json`, { headers: this.getHeaders() });
      return { success: true, todolists: response.data };
    } catch (error) {
      throw new Error(`Failed to get todo lists: ${error.response?.data?.error || error.message}`);
    }
  }

  async createTodoList(bucketId, name, description = '') {
    try {
      const response = await axios.post(`${this.baseUrl}/buckets/${bucketId}/todolists.json`,
        { name, description },
        { headers: this.getHeaders() }
      );
      return { success: true, todolist: response.data };
    } catch (error) {
      throw new Error(`Failed to create todo list: ${error.response?.data?.error || error.message}`);
    }
  }

  async getTodos(bucketId, todolistId) {
    try {
      const response = await axios.get(`${this.baseUrl}/buckets/${bucketId}/todolists/${todolistId}/todos.json`, { headers: this.getHeaders() });
      return { success: true, todos: response.data };
    } catch (error) {
      throw new Error(`Failed to get todos: ${error.response?.data?.error || error.message}`);
    }
  }

  async createTodo(bucketId, todolistId, content, options = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/buckets/${bucketId}/todolists/${todolistId}/todos.json`,
        { content, ...options },
        { headers: this.getHeaders() }
      );
      return { success: true, todo: response.data };
    } catch (error) {
      throw new Error(`Failed to create todo: ${error.response?.data?.error || error.message}`);
    }
  }

  async updateTodo(bucketId, todoId, updates) {
    try {
      const response = await axios.put(`${this.baseUrl}/buckets/${bucketId}/todos/${todoId}.json`,
        updates,
        { headers: this.getHeaders() }
      );
      return { success: true, todo: response.data };
    } catch (error) {
      throw new Error(`Failed to update todo: ${error.response?.data?.error || error.message}`);
    }
  }

  async completeTodo(bucketId, todoId) {
    try {
      const response = await axios.post(`${this.baseUrl}/buckets/${bucketId}/todos/${todoId}/completion.json`,
        {},
        { headers: this.getHeaders() }
      );
      return { success: true, completion: response.data };
    } catch (error) {
      throw new Error(`Failed to complete todo: ${error.response?.data?.error || error.message}`);
    }
  }

  async getMessages(bucketId, messageBoardId) {
    try {
      const response = await axios.get(`${this.baseUrl}/buckets/${bucketId}/message_boards/${messageBoardId}/messages.json`, { headers: this.getHeaders() });
      return { success: true, messages: response.data };
    } catch (error) {
      throw new Error(`Failed to get messages: ${error.response?.data?.error || error.message}`);
    }
  }

  async createMessage(bucketId, messageBoardId, subject, content) {
    try {
      const response = await axios.post(`${this.baseUrl}/buckets/${bucketId}/message_boards/${messageBoardId}/messages.json`,
        { subject, content },
        { headers: this.getHeaders() }
      );
      return { success: true, message: response.data };
    } catch (error) {
      throw new Error(`Failed to create message: ${error.response?.data?.error || error.message}`);
    }
  }

  async getComments(bucketId, recordingId) {
    try {
      const response = await axios.get(`${this.baseUrl}/buckets/${bucketId}/recordings/${recordingId}/comments.json`, { headers: this.getHeaders() });
      return { success: true, comments: response.data };
    } catch (error) {
      throw new Error(`Failed to get comments: ${error.response?.data?.error || error.message}`);
    }
  }

  async createComment(bucketId, recordingId, content) {
    try {
      const response = await axios.post(`${this.baseUrl}/buckets/${bucketId}/recordings/${recordingId}/comments.json`,
        { content },
        { headers: this.getHeaders() }
      );
      return { success: true, comment: response.data };
    } catch (error) {
      throw new Error(`Failed to create comment: ${error.response?.data?.error || error.message}`);
    }
  }

  async getPeople(projectId) {
    try {
      const response = await axios.get(`${this.baseUrl}/projects/${projectId}/people.json`, { headers: this.getHeaders() });
      return { success: true, people: response.data };
    } catch (error) {
      throw new Error(`Failed to get people: ${error.response?.data?.error || error.message}`);
    }
  }

  async getSchedules(bucketId, scheduleId) {
    try {
      const response = await axios.get(`${this.baseUrl}/buckets/${bucketId}/schedules/${scheduleId}/entries.json`, { headers: this.getHeaders() });
      return { success: true, entries: response.data };
    } catch (error) {
      throw new Error(`Failed to get schedules: ${error.response?.data?.error || error.message}`);
    }
  }

  async createScheduleEntry(bucketId, scheduleId, summary, startsAt, endsAt) {
    try {
      const response = await axios.post(`${this.baseUrl}/buckets/${bucketId}/schedules/${scheduleId}/entries.json`,
        { summary, starts_at: startsAt, ends_at: endsAt },
        { headers: this.getHeaders() }
      );
      return { success: true, entry: response.data };
    } catch (error) {
      throw new Error(`Failed to create schedule entry: ${error.response?.data?.error || error.message}`);
    }
  }

  async getDocuments(bucketId, vaultId) {
    try {
      const response = await axios.get(`${this.baseUrl}/buckets/${bucketId}/vaults/${vaultId}/documents.json`, { headers: this.getHeaders() });
      return { success: true, documents: response.data };
    } catch (error) {
      throw new Error(`Failed to get documents: ${error.response?.data?.error || error.message}`);
    }
  }

  async uploadFile(bucketId, vaultId, file) {
    try {
      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${this.baseUrl}/buckets/${bucketId}/vaults/${vaultId}/uploads.json`,
        formData,
        {
          headers: {
            ...this.getHeaders(),
            ...formData.getHeaders(),
          },
        }
      );
      return { success: true, upload: response.data };
    } catch (error) {
      throw new Error(`Failed to upload file: ${error.response?.data?.error || error.message}`);
    }
  }

  async getCampfire(bucketId, chatId) {
    try {
      const response = await axios.get(`${this.baseUrl}/buckets/${bucketId}/chats/${chatId}/lines.json`, { headers: this.getHeaders() });
      return { success: true, lines: response.data };
    } catch (error) {
      throw new Error(`Failed to get campfire: ${error.response?.data?.error || error.message}`);
    }
  }
}

module.exports = BasecampIntegration;
