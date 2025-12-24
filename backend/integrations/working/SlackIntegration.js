/**
 * SLACK INTEGRATION - FULLY WORKING
 * Team communication integration
 * 
 * FREE TIER: Unlimited for small teams
 * Get webhook: https://api.slack.com/messaging/webhooks
 * 
 * Usage:
 *   const slack = new SlackIntegration({ 
 *     token: 'xoxb-xxx',
 *     webhookUrl: 'https://hooks.slack.com/services/xxx'
 *   });
 *   await slack.sendMessage('#general', 'Hello World');
 */

const BaseIntegration = require('../core/BaseIntegration');

class SlackIntegration extends BaseIntegration {
  constructor(config = {}) {
    super({
      name: 'slack',
      baseURL: 'https://slack.com/api',
      ...config
    });
    this.webhookUrl = config.webhookUrl;
  }

  getDefaultHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Send message to channel
   */
  async sendMessage(channel, text, blocks = null) {
    this.validateApiKey();
    
    const payload = {
      channel: channel,
      text: text
    };

    if (blocks) {
      payload.blocks = blocks;
    }

    const response = await this.post('/chat.postMessage', payload);
    return {
      success: response.data.ok,
      timestamp: response.data.ts,
      channel: response.data.channel
    };
  }

  /**
   * Send message via webhook (simpler, no auth needed)
   */
  async sendWebhook(text, blocks = null) {
    if (!this.webhookUrl) {
      throw new Error('Webhook URL not configured');
    }

    const payload = { text };
    if (blocks) payload.blocks = blocks;

    const response = await this.client.post(this.webhookUrl, payload);
    return { success: true, message: 'Message sent via webhook' };
  }

  /**
   * List channels
   */
  async listChannels(limit = 100) {
    this.validateApiKey();
    const response = await this.get('/conversations.list', { 
      limit,
      types: 'public_channel,private_channel'
    });
    return {
      success: true,
      channels: response.data.channels.map(ch => ({
        id: ch.id,
        name: ch.name,
        isPrivate: ch.is_private,
        memberCount: ch.num_members
      }))
    };
  }

  /**
   * Get channel history
   */
  async getChannelHistory(channel, limit = 10) {
    this.validateApiKey();
    const response = await this.get('/conversations.history', {
      channel,
      limit
    });
    return {
      success: true,
      messages: response.data.messages
    };
  }

  /**
   * Upload file
   */
  async uploadFile(channels, file, filename, title = null) {
    this.validateApiKey();
    
    const formData = new FormData();
    formData.append('channels', channels);
    formData.append('file', file);
    formData.append('filename', filename);
    if (title) formData.append('title', title);

    const response = await this.post('/files.upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    return {
      success: response.data.ok,
      file: response.data.file
    };
  }

  /**
   * Get user info
   */
  async getUserInfo(userId) {
    this.validateApiKey();
    const response = await this.get('/users.info', { user: userId });
    return {
      success: true,
      user: {
        id: response.data.user.id,
        name: response.data.user.name,
        realName: response.data.user.real_name,
        email: response.data.user.profile.email,
        isAdmin: response.data.user.is_admin
      }
    };
  }

  /**
   * List users
   */
  async listUsers(limit = 100) {
    this.validateApiKey();
    const response = await this.get('/users.list', { limit });
    return {
      success: true,
      users: response.data.members.map(user => ({
        id: user.id,
        name: user.name,
        realName: user.real_name,
        isBot: user.is_bot
      }))
    };
  }

  /**
   * Add reaction to message
   */
  async addReaction(channel, timestamp, emoji) {
    this.validateApiKey();
    const response = await this.post('/reactions.add', {
      channel,
      timestamp,
      name: emoji
    });
    return { success: response.data.ok };
  }

  async testConnection() {
    try {
      const response = await this.get('/auth.test');
      return { 
        success: response.data.ok, 
        integration: this.name, 
        message: 'Connection successful',
        team: response.data.team
      };
    } catch (error) {
      return { success: false, integration: this.name, error: error.message };
    }
  }
}

module.exports = SlackIntegration;
