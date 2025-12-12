/**
 * Discord Integration
 * Full implementation with mocked API calls for testing
 */

const axios = require('axios');

class DiscordIntegration {
  constructor(config) {
    this.config = config;
    this.baseURL = 'https://discord.com/api/v10';
    this.validateConfig();
  }

  validateConfig() {
    if (!this.config.token) {
      throw new Error('Discord bot token is required');
    }
  }

  async execute(action, params) {
    const actions = {
      sendMessage: this.sendMessage.bind(this),
      getChannels: this.getChannels.bind(this),
      createChannel: this.createChannel.bind(this),
      getGuildInfo: this.getGuildInfo.bind(this),
      addRole: this.addRole.bind(this),
      kickMember: this.kickMember.bind(this),
    };

    if (!actions[action]) {
      throw new Error(`Unknown action: ${action}`);
    }

    return await actions[action](params);
  }

  async sendMessage(params) {
    const { channel_id, content, embeds, components } = params;

    if (!channel_id) {
      throw new Error('Channel ID is required');
    }
    if (!content && !embeds) {
      throw new Error('Either content or embeds is required');
    }

    if (process.env.NODE_ENV === 'test' || this.config.mock) {
      return {
        id: Date.now().toString(),
        channel_id,
        content,
        timestamp: new Date().toISOString(),
        author: {
          id: '123456789',
          username: 'TestBot',
          bot: true,
        },
      };
    }

    try {
      const response = await axios.post(
        `${this.baseURL}/channels/${channel_id}/messages`,
        { content, embeds, components },
        {
          headers: {
            'Authorization': `Bot ${this.config.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  async getChannels(params) {
    const { guild_id } = params;

    if (!guild_id) {
      throw new Error('Guild ID is required');
    }

    if (process.env.NODE_ENV === 'test' || this.config.mock) {
      return [
        { id: '123', name: 'general', type: 0 },
        { id: '456', name: 'announcements', type: 0 },
        { id: '789', name: 'voice-channel', type: 2 },
      ];
    }

    try {
      const response = await axios.get(
        `${this.baseURL}/guilds/${guild_id}/channels`,
        {
          headers: {
            'Authorization': `Bot ${this.config.token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to get channels: ${error.message}`);
    }
  }

  async createChannel(params) {
    const { guild_id, name, type = 0, topic, parent_id } = params;

    if (!guild_id || !name) {
      throw new Error('Guild ID and name are required');
    }

    if (process.env.NODE_ENV === 'test' || this.config.mock) {
      return {
        id: Date.now().toString(),
        name,
        type,
        guild_id,
        position: 0,
      };
    }

    try {
      const response = await axios.post(
        `${this.baseURL}/guilds/${guild_id}/channels`,
        { name, type, topic, parent_id },
        {
          headers: {
            'Authorization': `Bot ${this.config.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to create channel: ${error.message}`);
    }
  }

  async getGuildInfo(params) {
    const { guild_id } = params;

    if (!guild_id) {
      throw new Error('Guild ID is required');
    }

    if (process.env.NODE_ENV === 'test' || this.config.mock) {
      return {
        id: guild_id,
        name: 'Test Server',
        owner_id: '123456',
        member_count: 100,
        icon: null,
      };
    }

    try {
      const response = await axios.get(
        `${this.baseURL}/guilds/${guild_id}?with_counts=true`,
        {
          headers: {
            'Authorization': `Bot ${this.config.token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to get guild info: ${error.message}`);
    }
  }

  async addRole(params) {
    const { guild_id, user_id, role_id } = params;

    if (!guild_id || !user_id || !role_id) {
      throw new Error('Guild ID, user ID, and role ID are required');
    }

    if (process.env.NODE_ENV === 'test' || this.config.mock) {
      return { success: true, message: 'Role added successfully' };
    }

    try {
      await axios.put(
        `${this.baseURL}/guilds/${guild_id}/members/${user_id}/roles/${role_id}`,
        {},
        {
          headers: {
            'Authorization': `Bot ${this.config.token}`,
          },
        }
      );

      return { success: true, message: 'Role added successfully' };
    } catch (error) {
      throw new Error(`Failed to add role: ${error.message}`);
    }
  }

  async kickMember(params) {
    const { guild_id, user_id, reason } = params;

    if (!guild_id || !user_id) {
      throw new Error('Guild ID and user ID are required');
    }

    if (process.env.NODE_ENV === 'test' || this.config.mock) {
      return { success: true, message: 'Member kicked successfully' };
    }

    try {
      await axios.delete(
        `${this.baseURL}/guilds/${guild_id}/members/${user_id}`,
        {
          headers: {
            'Authorization': `Bot ${this.config.token}`,
            'X-Audit-Log-Reason': reason || 'No reason provided',
          },
        }
      );

      return { success: true, message: 'Member kicked successfully' };
    } catch (error) {
      throw new Error(`Failed to kick member: ${error.message}`);
    }
  }

  async testConnection() {
    try {
      if (process.env.NODE_ENV === 'test' || this.config.mock) {
        return {
          ok: true,
          message: 'Connection test successful (mocked)',
        };
      }

      const response = await axios.get(`${this.baseURL}/users/@me`, {
        headers: {
          'Authorization': `Bot ${this.config.token}`,
        },
      });

      return {
        ok: true,
        message: 'Connection test successful',
        bot: response.data,
      };
    } catch (error) {
      return {
        ok: false,
        message: `Connection test failed: ${error.message}`,
      };
    }
  }
}

module.exports = DiscordIntegration;
