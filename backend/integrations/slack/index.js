/**
 * Slack Integration - Complete Implementation
 * 20 endpoints for full Slack functionality
 */

const axios = require('axios');

class SlackIntegration {
  constructor(token) {
    this.token = token;
    this.baseUrl = 'https://slack.com/api';
  }

  /**
   * Get headers for API requests
   */
  getHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * 1. Send Message
   * POST /chat.postMessage
   */
  async sendMessage(channel, text, options = {}) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/chat.postMessage`,
        {
          channel,
          text,
          ...options,
        },
        { headers: this.getHeaders() }
      );

      if (!response.data.ok) {
        throw new Error(response.data.error);
      }

      return {
        success: true,
        message: response.data,
      };
    } catch (error) {
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  /**
   * 2. List Channels
   * GET /conversations.list
   */
  async listChannels(options = {}) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/conversations.list`,
        {
          headers: this.getHeaders(),
          params: {
            limit: options.limit || 100,
            types: options.types || 'public_channel,private_channel',
            ...options,
          },
        }
      );

      if (!response.data.ok) {
        throw new Error(response.data.error);
      }

      return {
        success: true,
        channels: response.data.channels,
        response_metadata: response.data.response_metadata,
      };
    } catch (error) {
      throw new Error(`Failed to list channels: ${error.message}`);
    }
  }

  /**
   * 3. Create Channel
   * POST /conversations.create
   */
  async createChannel(name, isPrivate = false) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/conversations.create`,
        {
          name,
          is_private: isPrivate,
        },
        { headers: this.getHeaders() }
      );

      if (!response.data.ok) {
        throw new Error(response.data.error);
      }

      return {
        success: true,
        channel: response.data.channel,
      };
    } catch (error) {
      throw new Error(`Failed to create channel: ${error.message}`);
    }
  }

  /**
   * 4. List Users
   * GET /users.list
   */
  async listUsers(options = {}) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/users.list`,
        {
          headers: this.getHeaders(),
          params: {
            limit: options.limit || 100,
            ...options,
          },
        }
      );

      if (!response.data.ok) {
        throw new Error(response.data.error);
      }

      return {
        success: true,
        users: response.data.members,
        response_metadata: response.data.response_metadata,
      };
    } catch (error) {
      throw new Error(`Failed to list users: ${error.message}`);
    }
  }

  /**
   * 5. Get User
   * GET /users.info
   */
  async getUser(userId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/users.info`,
        {
          headers: this.getHeaders(),
          params: { user: userId },
        }
      );

      if (!response.data.ok) {
        throw new Error(response.data.error);
      }

      return {
        success: true,
        user: response.data.user,
      };
    } catch (error) {
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }

  /**
   * 6. Upload File
   * POST /files.upload
   */
  async uploadFile(channels, file, options = {}) {
    try {
      const FormData = require('form-data');
      const formData = new FormData();

      formData.append('channels', channels);
      formData.append('file', file);
      
      if (options.filename) formData.append('filename', options.filename);
      if (options.title) formData.append('title', options.title);
      if (options.initial_comment) formData.append('initial_comment', options.initial_comment);

      const response = await axios.post(
        `${this.baseUrl}/files.upload`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            ...formData.getHeaders(),
          },
        }
      );

      if (!response.data.ok) {
        throw new Error(response.data.error);
      }

      return {
        success: true,
        file: response.data.file,
      };
    } catch (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * 7. Get Conversation History
   * GET /conversations.history
   */
  async getConversationHistory(channel, options = {}) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/conversations.history`,
        {
          headers: this.getHeaders(),
          params: {
            channel,
            limit: options.limit || 100,
            ...options,
          },
        }
      );

      if (!response.data.ok) {
        throw new Error(response.data.error);
      }

      return {
        success: true,
        messages: response.data.messages,
        has_more: response.data.has_more,
        response_metadata: response.data.response_metadata,
      };
    } catch (error) {
      throw new Error(`Failed to get conversation history: ${error.message}`);
    }
  }

  /**
   * 8. Invite to Conversation
   * POST /conversations.invite
   */
  async inviteToConversation(channel, users) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/conversations.invite`,
        {
          channel,
          users,
        },
        { headers: this.getHeaders() }
      );

      if (!response.data.ok) {
        throw new Error(response.data.error);
      }

      return {
        success: true,
        channel: response.data.channel,
      };
    } catch (error) {
      throw new Error(`Failed to invite to conversation: ${error.message}`);
    }
  }

  /**
   * 9. Add Reaction
   * POST /reactions.add
   */
  async addReaction(channel, timestamp, name) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/reactions.add`,
        {
          channel,
          timestamp,
          name,
        },
        { headers: this.getHeaders() }
      );

      if (!response.data.ok) {
        throw new Error(response.data.error);
      }

      return {
        success: true,
      };
    } catch (error) {
      throw new Error(`Failed to add reaction: ${error.message}`);
    }
  }

  /**
   * 10. Get Team Info
   * GET /team.info
   */
  async getTeamInfo() {
    try {
      const response = await axios.get(
        `${this.baseUrl}/team.info`,
        { headers: this.getHeaders() }
      );

      if (!response.data.ok) {
        throw new Error(response.data.error);
      }

      return {
        success: true,
        team: response.data.team,
      };
    } catch (error) {
      throw new Error(`Failed to get team info: ${error.message}`);
    }
  }

  /**
   * 11. Add Reminder
   * POST /reminders.add
   */
  async addReminder(text, time, options = {}) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/reminders.add`,
        {
          text,
          time,
          ...options,
        },
        { headers: this.getHeaders() }
      );

      if (!response.data.ok) {
        throw new Error(response.data.error);
      }

      return {
        success: true,
        reminder: response.data.reminder,
      };
    } catch (error) {
      throw new Error(`Failed to add reminder: ${error.message}`);
    }
  }

  /**
   * 12. List Reminders
   * GET /reminders.list
   */
  async listReminders() {
    try {
      const response = await axios.get(
        `${this.baseUrl}/reminders.list`,
        { headers: this.getHeaders() }
      );

      if (!response.data.ok) {
        throw new Error(response.data.error);
      }

      return {
        success: true,
        reminders: response.data.reminders,
      };
    } catch (error) {
      throw new Error(`Failed to list reminders: ${error.message}`);
    }
  }

  /**
   * 13. Add Pin
   * POST /pins.add
   */
  async addPin(channel, timestamp) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/pins.add`,
        {
          channel,
          timestamp,
        },
        { headers: this.getHeaders() }
      );

      if (!response.data.ok) {
        throw new Error(response.data.error);
      }

      return {
        success: true,
      };
    } catch (error) {
      throw new Error(`Failed to add pin: ${error.message}`);
    }
  }

  /**
   * 14. List Pins
   * GET /pins.list
   */
  async listPins(channel) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/pins.list`,
        {
          headers: this.getHeaders(),
          params: { channel },
        }
      );

      if (!response.data.ok) {
        throw new Error(response.data.error);
      }

      return {
        success: true,
        items: response.data.items,
      };
    } catch (error) {
      throw new Error(`Failed to list pins: ${error.message}`);
    }
  }

  /**
   * 15. Add Bookmark
   * POST /bookmarks.add
   */
  async addBookmark(channel, title, type, link) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/bookmarks.add`,
        {
          channel_id: channel,
          title,
          type,
          link,
        },
        { headers: this.getHeaders() }
      );

      if (!response.data.ok) {
        throw new Error(response.data.error);
      }

      return {
        success: true,
        bookmark: response.data.bookmark,
      };
    } catch (error) {
      throw new Error(`Failed to add bookmark: ${error.message}`);
    }
  }

  /**
   * 16. Search Messages
   * GET /search.messages
   */
  async searchMessages(query, options = {}) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/search.messages`,
        {
          headers: this.getHeaders(),
          params: {
            query,
            count: options.count || 20,
            ...options,
          },
        }
      );

      if (!response.data.ok) {
        throw new Error(response.data.error);
      }

      return {
        success: true,
        messages: response.data.messages,
      };
    } catch (error) {
      throw new Error(`Failed to search messages: ${error.message}`);
    }
  }

  /**
   * 17. Create User Group
   * POST /usergroups.create
   */
  async createUserGroup(name, options = {}) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/usergroups.create`,
        {
          name,
          ...options,
        },
        { headers: this.getHeaders() }
      );

      if (!response.data.ok) {
        throw new Error(response.data.error);
      }

      return {
        success: true,
        usergroup: response.data.usergroup,
      };
    } catch (error) {
      throw new Error(`Failed to create user group: ${error.message}`);
    }
  }

  /**
   * 18. List User Groups
   * GET /usergroups.list
   */
  async listUserGroups(options = {}) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/usergroups.list`,
        {
          headers: this.getHeaders(),
          params: options,
        }
      );

      if (!response.data.ok) {
        throw new Error(response.data.error);
      }

      return {
        success: true,
        usergroups: response.data.usergroups,
      };
    } catch (error) {
      throw new Error(`Failed to list user groups: ${error.message}`);
    }
  }

  /**
   * 19. Trigger Workflow
   * POST /workflows.stepCompleted
   */
  async triggerWorkflow(workflowStepExecuteId, outputs) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/workflows.stepCompleted`,
        {
          workflow_step_execute_id: workflowStepExecuteId,
          outputs,
        },
        { headers: this.getHeaders() }
      );

      if (!response.data.ok) {
        throw new Error(response.data.error);
      }

      return {
        success: true,
      };
    } catch (error) {
      throw new Error(`Failed to trigger workflow: ${error.message}`);
    }
  }

  /**
   * 20. Get Analytics
   * GET /admin.analytics.getFile
   */
  async getAnalytics(type, date) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/admin.analytics.getFile`,
        {
          headers: this.getHeaders(),
          params: {
            type,
            date,
          },
        }
      );

      if (!response.data.ok) {
        throw new Error(response.data.error);
      }

      return {
        success: true,
        file: response.data.file,
      };
    } catch (error) {
      throw new Error(`Failed to get analytics: ${error.message}`);
    }
  }
}

module.exports = SlackIntegration;
