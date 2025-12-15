/**
 * Discord Integration - Complete Implementation
 * 20 endpoints for full Discord functionality
 */

const axios = require('axios');

class DiscordIntegration {
  constructor(token) {
    this.token = token;
    this.baseUrl = 'https://discord.com/api/v10';
  }

  /**
   * Get headers for API requests
   */
  getHeaders() {
    return {
      'Authorization': `Bot ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * 1. Send Message
   * POST /channels/{channel_id}/messages
   */
  async sendMessage(channelId, content, options = {}) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/channels/${channelId}/messages`,
        {
          content,
          ...options,
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        message: response.data,
      };
    } catch (error) {
      throw new Error(`Failed to send message: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * 2. List Channels
   * GET /guilds/{guild_id}/channels
   */
  async listChannels(guildId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/guilds/${guildId}/channels`,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        channels: response.data,
      };
    } catch (error) {
      throw new Error(`Failed to list channels: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * 3. Create Channel
   * POST /guilds/{guild_id}/channels
   */
  async createChannel(guildId, name, type = 0, options = {}) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/guilds/${guildId}/channels`,
        {
          name,
          type,
          ...options,
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        channel: response.data,
      };
    } catch (error) {
      throw new Error(`Failed to create channel: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * 4. Get Guild
   * GET /guilds/{guild_id}
   */
  async getGuild(guildId, withCounts = true) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/guilds/${guildId}`,
        {
          headers: this.getHeaders(),
          params: { with_counts: withCounts },
        }
      );

      return {
        success: true,
        guild: response.data,
      };
    } catch (error) {
      throw new Error(`Failed to get guild: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * 5. List Members
   * GET /guilds/{guild_id}/members
   */
  async listMembers(guildId, options = {}) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/guilds/${guildId}/members`,
        {
          headers: this.getHeaders(),
          params: {
            limit: options.limit || 100,
            ...options,
          },
        }
      );

      return {
        success: true,
        members: response.data,
      };
    } catch (error) {
      throw new Error(`Failed to list members: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * 6. Create Role
   * POST /guilds/{guild_id}/roles
   */
  async createRole(guildId, name, options = {}) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/guilds/${guildId}/roles`,
        {
          name,
          ...options,
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        role: response.data,
      };
    } catch (error) {
      throw new Error(`Failed to create role: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * 7. Assign Role
   * PUT /guilds/{guild_id}/members/{user_id}/roles/{role_id}
   */
  async assignRole(guildId, userId, roleId) {
    try {
      await axios.put(
        `${this.baseUrl}/guilds/${guildId}/members/${userId}/roles/${roleId}`,
        {},
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        message: 'Role assigned successfully',
      };
    } catch (error) {
      throw new Error(`Failed to assign role: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * 8. Create Invite
   * POST /channels/{channel_id}/invites
   */
  async createInvite(channelId, options = {}) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/channels/${channelId}/invites`,
        {
          max_age: options.max_age || 86400,
          max_uses: options.max_uses || 0,
          temporary: options.temporary || false,
          ...options,
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        invite: response.data,
      };
    } catch (error) {
      throw new Error(`Failed to create invite: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * 9. List Invites
   * GET /guilds/{guild_id}/invites
   */
  async listInvites(guildId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/guilds/${guildId}/invites`,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        invites: response.data,
      };
    } catch (error) {
      throw new Error(`Failed to list invites: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * 10. Create Webhook
   * POST /channels/{channel_id}/webhooks
   */
  async createWebhook(channelId, name, options = {}) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/channels/${channelId}/webhooks`,
        {
          name,
          ...options,
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        webhook: response.data,
      };
    } catch (error) {
      throw new Error(`Failed to create webhook: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * 11. Execute Webhook
   * POST /webhooks/{webhook_id}/{webhook_token}
   */
  async executeWebhook(webhookId, webhookToken, content, options = {}) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/webhooks/${webhookId}/${webhookToken}`,
        {
          content,
          ...options,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        message: response.data,
      };
    } catch (error) {
      throw new Error(`Failed to execute webhook: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * 12. List Emojis
   * GET /guilds/{guild_id}/emojis
   */
  async listEmojis(guildId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/guilds/${guildId}/emojis`,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        emojis: response.data,
      };
    } catch (error) {
      throw new Error(`Failed to list emojis: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * 13. Create Emoji
   * POST /guilds/{guild_id}/emojis
   */
  async createEmoji(guildId, name, image, options = {}) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/guilds/${guildId}/emojis`,
        {
          name,
          image,
          ...options,
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        emoji: response.data,
      };
    } catch (error) {
      throw new Error(`Failed to create emoji: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * 14. Create Ban
   * PUT /guilds/{guild_id}/bans/{user_id}
   */
  async createBan(guildId, userId, options = {}) {
    try {
      await axios.put(
        `${this.baseUrl}/guilds/${guildId}/bans/${userId}`,
        {
          delete_message_days: options.delete_message_days || 0,
          ...options,
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        message: 'User banned successfully',
      };
    } catch (error) {
      throw new Error(`Failed to ban user: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * 15. List Bans
   * GET /guilds/{guild_id}/bans
   */
  async listBans(guildId, options = {}) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/guilds/${guildId}/bans`,
        {
          headers: this.getHeaders(),
          params: {
            limit: options.limit || 100,
            ...options,
          },
        }
      );

      return {
        success: true,
        bans: response.data,
      };
    } catch (error) {
      throw new Error(`Failed to list bans: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * 16. Kick Member
   * DELETE /guilds/{guild_id}/members/{user_id}
   */
  async kickMember(guildId, userId, reason) {
    try {
      await axios.delete(
        `${this.baseUrl}/guilds/${guildId}/members/${userId}`,
        {
          headers: {
            ...this.getHeaders(),
            'X-Audit-Log-Reason': reason || 'No reason provided',
          },
        }
      );

      return {
        success: true,
        message: 'Member kicked successfully',
      };
    } catch (error) {
      throw new Error(`Failed to kick member: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * 17. Get Audit Logs
   * GET /guilds/{guild_id}/audit-logs
   */
  async getAuditLogs(guildId, options = {}) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/guilds/${guildId}/audit-logs`,
        {
          headers: this.getHeaders(),
          params: {
            limit: options.limit || 50,
            ...options,
          },
        }
      );

      return {
        success: true,
        audit_logs: response.data,
      };
    } catch (error) {
      throw new Error(`Failed to get audit logs: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * 18. Create Thread
   * POST /channels/{channel_id}/threads
   */
  async createThread(channelId, name, options = {}) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/channels/${channelId}/threads`,
        {
          name,
          auto_archive_duration: options.auto_archive_duration || 60,
          type: options.type || 11,
          ...options,
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        thread: response.data,
      };
    } catch (error) {
      throw new Error(`Failed to create thread: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * 19. List Threads
   * GET /guilds/{guild_id}/threads/active
   */
  async listThreads(guildId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/guilds/${guildId}/threads/active`,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        threads: response.data.threads,
        members: response.data.members,
      };
    } catch (error) {
      throw new Error(`Failed to list threads: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * 20. Add Reaction
   * PUT /channels/{channel_id}/messages/{message_id}/reactions/{emoji}/@me
   */
  async addReaction(channelId, messageId, emoji) {
    try {
      await axios.put(
        `${this.baseUrl}/channels/${channelId}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}/@me`,
        {},
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        message: 'Reaction added successfully',
      };
    } catch (error) {
      throw new Error(`Failed to add reaction: ${error.response?.data?.message || error.message}`);
    }
  }
}

module.exports = DiscordIntegration;
