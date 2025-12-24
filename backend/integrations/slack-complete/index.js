const axios = require('axios');

/**
 * Slack Complete Integration
 * Messages, channels, files, and workspace management
 */
class SlackIntegration {
  constructor(botToken) {
    this.botToken = botToken;
    this.baseURL = 'https://slack.com/api';
    this.headers = {
      'Authorization': `Bearer ${this.botToken}`,
      'Content-Type': 'application/json'
    };
  }

  // Send message
  async sendMessage(channel, text, blocks = null) {
    const data = {
      channel,
      text,
      ...(blocks && { blocks })
    };

    const response = await axios.post(`${this.baseURL}/chat.postMessage`, data, {
      headers: this.headers
    });
    return response.data;
  }

  // Update message
  async updateMessage(channel, ts, text, blocks = null) {
    const data = {
      channel,
      ts,
      text,
      ...(blocks && { blocks })
    };

    const response = await axios.post(`${this.baseURL}/chat.update`, data, {
      headers: this.headers
    });
    return response.data;
  }

  // Delete message
  async deleteMessage(channel, ts) {
    const data = { channel, ts };
    const response = await axios.post(`${this.baseURL}/chat.delete`, data, {
      headers: this.headers
    });
    return response.data;
  }

  // Create channel
  async createChannel(name, isPrivate = false) {
    const endpoint = isPrivate ? 'conversations.create' : 'conversations.create';
    const data = {
      name,
      is_private: isPrivate
    };

    const response = await axios.post(`${this.baseURL}/${endpoint}`, data, {
      headers: this.headers
    });
    return response.data;
  }

  // List channels
  async listChannels(types = 'public_channel,private_channel') {
    const response = await axios.get(`${this.baseURL}/conversations.list`, {
      headers: this.headers,
      params: { types }
    });
    return response.data;
  }

  // Get channel info
  async getChannelInfo(channel) {
    const response = await axios.get(`${this.baseURL}/conversations.info`, {
      headers: this.headers,
      params: { channel }
    });
    return response.data;
  }

  // Invite user to channel
  async inviteToChannel(channel, users) {
    const data = { channel, users };
    const response = await axios.post(`${this.baseURL}/conversations.invite`, data, {
      headers: this.headers
    });
    return response.data;
  }

  // Upload file
  async uploadFile(channels, content, filename, title = null) {
    const data = {
      channels,
      content,
      filename,
      ...(title && { title })
    };

    const response = await axios.post(`${this.baseURL}/files.upload`, data, {
      headers: this.headers
    });
    return response.data;
  }

  // List users
  async listUsers() {
    const response = await axios.get(`${this.baseURL}/users.list`, {
      headers: this.headers
    });
    return response.data;
  }

  // Get user info
  async getUserInfo(user) {
    const response = await axios.get(`${this.baseURL}/users.info`, {
      headers: this.headers,
      params: { user }
    });
    return response.data;
  }

  // Set channel topic
  async setChannelTopic(channel, topic) {
    const data = { channel, topic };
    const response = await axios.post(`${this.baseURL}/conversations.setTopic`, data, {
      headers: this.headers
    });
    return response.data;
  }

  // Add reaction
  async addReaction(channel, timestamp, name) {
    const data = {
      channel,
      timestamp,
      name
    };

    const response = await axios.post(`${this.baseURL}/reactions.add`, data, {
      headers: this.headers
    });
    return response.data;
  }
}

module.exports = SlackIntegration;
