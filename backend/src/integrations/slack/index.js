/**
 * Slack Integration
 * Full implementation with mocked API calls for testing
 */

const axios = require('axios');

class SlackIntegration {
  constructor(config) {
    this.config = config;
    this.validateConfig();
  }

  /**
   * Validate configuration
   */
  validateConfig() {
    if (!this.config.token) {
      throw new Error('Slack token is required');
    }
    if (!this.config.token.startsWith('xoxb-') && !this.config.token.startsWith('xoxp-')) {
      throw new Error('Invalid Slack token format');
    }
  }

  /**
   * Execute integration action
   */
  async execute(action, params) {
    const actions = {
      sendMessage: this.sendMessage.bind(this),
      getChannels: this.getChannels.bind(this),
      getUserInfo: this.getUserInfo.bind(this),
      uploadFile: this.uploadFile.bind(this),
      createChannel: this.createChannel.bind(this),
      inviteUser: this.inviteUser.bind(this),
    };

    if (!actions[action]) {
      throw new Error(`Unknown action: ${action}`);
    }

    return await actions[action](params);
  }

  /**
   * Send message to channel
   */
  async sendMessage(params) {
    const { channel, text, attachments, blocks } = params;

    if (!channel) {
      throw new Error('Channel is required');
    }
    if (!text && !blocks) {
      throw new Error('Either text or blocks is required');
    }

    // Mock API call
    if (process.env.NODE_ENV === 'test' || this.config.mock) {
      return {
        ok: true,
        channel,
        ts: Date.now().toString(),
        message: {
          text,
          user: 'U123456',
          ts: Date.now().toString(),
        },
      };
    }

    // Real API call
    try {
      const response = await axios.post(
        'https://slack.com/api/chat.postMessage',
        {
          channel,
          text,
          attachments,
          blocks,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.data.ok) {
        throw new Error(response.data.error || 'Slack API error');
      }

      return response.data;
    } catch (error) {
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  /**
   * Get list of channels
   */
  async getChannels(params = {}) {
    const { limit = 100, cursor } = params;

    // Mock API call
    if (process.env.NODE_ENV === 'test' || this.config.mock) {
      return {
        ok: true,
        channels: [
          { id: 'C123456', name: 'general', is_member: true },
          { id: 'C234567', name: 'random', is_member: true },
          { id: 'C345678', name: 'engineering', is_member: false },
        ],
      };
    }

    // Real API call
    try {
      const response = await axios.get('https://slack.com/api/conversations.list', {
        params: { limit, cursor },
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
        },
      });

      if (!response.data.ok) {
        throw new Error(response.data.error || 'Slack API error');
      }

      return response.data;
    } catch (error) {
      throw new Error(`Failed to get channels: ${error.message}`);
    }
  }

  /**
   * Get user information
   */
  async getUserInfo(params) {
    const { user } = params;

    if (!user) {
      throw new Error('User ID is required');
    }

    // Mock API call
    if (process.env.NODE_ENV === 'test' || this.config.mock) {
      return {
        ok: true,
        user: {
          id: user,
          name: 'testuser',
          real_name: 'Test User',
          email: 'test@example.com',
          is_admin: false,
          is_bot: false,
        },
      };
    }

    // Real API call
    try {
      const response = await axios.get('https://slack.com/api/users.info', {
        params: { user },
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
        },
      });

      if (!response.data.ok) {
        throw new Error(response.data.error || 'Slack API error');
      }

      return response.data;
    } catch (error) {
      throw new Error(`Failed to get user info: ${error.message}`);
    }
  }

  /**
   * Upload file to channel
   */
  async uploadFile(params) {
    const { channels, file, filename, title, initial_comment } = params;

    if (!channels) {
      throw new Error('Channels are required');
    }
    if (!file) {
      throw new Error('File is required');
    }

    // Mock API call
    if (process.env.NODE_ENV === 'test' || this.config.mock) {
      return {
        ok: true,
        file: {
          id: 'F123456',
          name: filename || 'file.txt',
          title: title || filename,
          size: 1024,
          url_private: 'https://files.slack.com/files-pri/T123/F123/file.txt',
        },
      };
    }

    // Real API call
    try {
      const FormData = require('form-data');
      const formData = new FormData();
      
      formData.append('channels', channels);
      formData.append('file', file);
      if (filename) formData.append('filename', filename);
      if (title) formData.append('title', title);
      if (initial_comment) formData.append('initial_comment', initial_comment);

      const response = await axios.post(
        'https://slack.com/api/files.upload',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${this.config.token}`,
            ...formData.getHeaders(),
          },
        }
      );

      if (!response.data.ok) {
        throw new Error(response.data.error || 'Slack API error');
      }

      return response.data;
    } catch (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Create new channel
   */
  async createChannel(params) {
    const { name, is_private = false } = params;

    if (!name) {
      throw new Error('Channel name is required');
    }

    // Mock API call
    if (process.env.NODE_ENV === 'test' || this.config.mock) {
      return {
        ok: true,
        channel: {
          id: 'C' + Date.now(),
          name,
          is_private,
          created: Math.floor(Date.now() / 1000),
        },
      };
    }

    // Real API call
    try {
      const response = await axios.post(
        'https://slack.com/api/conversations.create',
        { name, is_private },
        {
          headers: {
            'Authorization': `Bearer ${this.config.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.data.ok) {
        throw new Error(response.data.error || 'Slack API error');
      }

      return response.data;
    } catch (error) {
      throw new Error(`Failed to create channel: ${error.message}`);
    }
  }

  /**
   * Invite user to channel
   */
  async inviteUser(params) {
    const { channel, users } = params;

    if (!channel) {
      throw new Error('Channel is required');
    }
    if (!users) {
      throw new Error('Users are required');
    }

    // Mock API call
    if (process.env.NODE_ENV === 'test' || this.config.mock) {
      return {
        ok: true,
        channel: {
          id: channel,
          name: 'test-channel',
        },
      };
    }

    // Real API call
    try {
      const response = await axios.post(
        'https://slack.com/api/conversations.invite',
        { channel, users },
        {
          headers: {
            'Authorization': `Bearer ${this.config.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.data.ok) {
        throw new Error(response.data.error || 'Slack API error');
      }

      return response.data;
    } catch (error) {
      throw new Error(`Failed to invite user: ${error.message}`);
    }
  }

  /**
   * Test connection
   */
  async testConnection() {
    try {
      // Mock test
      if (process.env.NODE_ENV === 'test' || this.config.mock) {
        return {
          ok: true,
          message: 'Connection test successful (mocked)',
        };
      }

      // Real test
      const response = await axios.post(
        'https://slack.com/api/auth.test',
        {},
        {
          headers: {
            'Authorization': `Bearer ${this.config.token}`,
          },
        }
      );

      if (!response.data.ok) {
        throw new Error(response.data.error || 'Authentication failed');
      }

      return {
        ok: true,
        message: 'Connection test successful',
        team: response.data.team,
        user: response.data.user,
      };
    } catch (error) {
      return {
        ok: false,
        message: `Connection test failed: ${error.message}`,
      };
    }
  }
}

module.exports = SlackIntegration;
