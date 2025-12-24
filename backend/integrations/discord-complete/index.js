const axios = require('axios');

/**
 * Discord Complete Integration
 * Messages, channels, guilds, and bot management
 */
class DiscordIntegration {
  constructor(botToken) {
    this.botToken = botToken;
    this.baseURL = 'https://discord.com/api/v10';
    this.headers = {
      'Authorization': `Bot ${this.botToken}`,
      'Content-Type': 'application/json'
    };
  }

  // Send message
  async sendMessage(channelId, content, embeds = null) {
    const data = {
      content,
      ...(embeds && { embeds })
    };

    const response = await axios.post(
      `${this.baseURL}/channels/${channelId}/messages`,
      data,
      { headers: this.headers }
    );
    return response.data;
  }

  // Edit message
  async editMessage(channelId, messageId, content, embeds = null) {
    const data = {
      content,
      ...(embeds && { embeds })
    };

    const response = await axios.patch(
      `${this.baseURL}/channels/${channelId}/messages/${messageId}`,
      data,
      { headers: this.headers }
    );
    return response.data;
  }

  // Delete message
  async deleteMessage(channelId, messageId) {
    const response = await axios.delete(
      `${this.baseURL}/channels/${channelId}/messages/${messageId}`,
      { headers: this.headers }
    );
    return response.data;
  }

  // Create channel
  async createChannel(guildId, name, type = 0) {
    const data = { name, type };
    const response = await axios.post(
      `${this.baseURL}/guilds/${guildId}/channels`,
      data,
      { headers: this.headers }
    );
    return response.data;
  }

  // Get channel
  async getChannel(channelId) {
    const response = await axios.get(
      `${this.baseURL}/channels/${channelId}`,
      { headers: this.headers }
    );
    return response.data;
  }

  // Get guild
  async getGuild(guildId) {
    const response = await axios.get(
      `${this.baseURL}/guilds/${guildId}`,
      { headers: this.headers }
    );
    return response.data;
  }

  // List guild channels
  async listGuildChannels(guildId) {
    const response = await axios.get(
      `${this.baseURL}/guilds/${guildId}/channels`,
      { headers: this.headers }
    );
    return response.data;
  }

  // Create role
  async createRole(guildId, name, permissions = '0', color = 0) {
    const data = { name, permissions, color };
    const response = await axios.post(
      `${this.baseURL}/guilds/${guildId}/roles`,
      data,
      { headers: this.headers }
    );
    return response.data;
  }

  // Add role to member
  async addRoleToMember(guildId, userId, roleId) {
    const response = await axios.put(
      `${this.baseURL}/guilds/${guildId}/members/${userId}/roles/${roleId}`,
      {},
      { headers: this.headers }
    );
    return response.data;
  }

  // Get guild member
  async getGuildMember(guildId, userId) {
    const response = await axios.get(
      `${this.baseURL}/guilds/${guildId}/members/${userId}`,
      { headers: this.headers }
    );
    return response.data;
  }

  // List guild members
  async listGuildMembers(guildId, limit = 100) {
    const response = await axios.get(
      `${this.baseURL}/guilds/${guildId}/members`,
      {
        headers: this.headers,
        params: { limit }
      }
    );
    return response.data;
  }

  // Create webhook
  async createWebhook(channelId, name) {
    const data = { name };
    const response = await axios.post(
      `${this.baseURL}/channels/${channelId}/webhooks`,
      data,
      { headers: this.headers }
    );
    return response.data;
  }
}

module.exports = DiscordIntegration;
