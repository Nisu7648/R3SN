/**
 * Discord Node - Send messages and manage Discord servers
 * Integrates with Discord API
 */

const axios = require('axios');

class DiscordNode {
  constructor() {
    this.type = 'discord.message';
    this.name = 'Discord Message';
    this.description = 'Send messages to Discord channels';
    this.category = 'communication';
    this.icon = '🎮';
    this.color = '#5865F2';

    this.inputs = [
      {
        name: 'message',
        type: 'string',
        required: false
      },
      {
        name: 'channelId',
        type: 'string',
        required: false
      }
    ];

    this.outputs = [
      {
        name: 'success',
        type: 'boolean'
      },
      {
        name: 'messageId',
        type: 'string'
      }
    ];

    this.parameters = [
      {
        name: 'token',
        type: 'string',
        required: true,
        sensitive: true,
        placeholder: 'Bot token',
        description: 'Discord Bot Token'
      },
      {
        name: 'channelId',
        type: 'string',
        required: false,
        placeholder: '123456789012345678',
        description: 'Channel ID'
      },
      {
        name: 'message',
        type: 'code',
        required: false,
        placeholder: 'Hello from R3SN!',
        description: 'Message content'
      },
      {
        name: 'embed',
        type: 'json',
        required: false,
        description: 'Embed object'
      },
      {
        name: 'embeds',
        type: 'array',
        required: false,
        description: 'Array of embed objects'
      },
      {
        name: 'tts',
        type: 'boolean',
        default: false,
        description: 'Text-to-speech'
      },
      {
        name: 'files',
        type: 'array',
        required: false,
        description: 'File attachments'
      }
    ];
  }

  /**
   * Execute the node
   */
  async execute(inputs, parameters, context) {
    const {
      token,
      channelId: paramChannelId,
      message: paramMessage,
      embed,
      embeds,
      tts,
      files
    } = parameters;

    const channelId = inputs.channelId || paramChannelId;
    const message = inputs.message || paramMessage;

    if (!token) {
      throw new Error('Discord token is required');
    }

    if (!channelId) {
      throw new Error('Channel ID is required');
    }

    if (!message && !embed && !embeds) {
      throw new Error('Message content, embed, or embeds are required');
    }

    try {
      const payload = {
        content: message || '',
        tts: tts || false
      };

      if (embed) {
        payload.embeds = [embed];
      } else if (embeds) {
        payload.embeds = embeds;
      }

      const response = await axios.post(
        `https://discord.com/api/v10/channels/${channelId}/messages`,
        payload,
        {
          headers: {
            'Authorization': `Bot ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        messageId: response.data.id,
        channelId: response.data.channel_id,
        timestamp: response.data.timestamp,
        content: response.data.content
      };

    } catch (error) {
      if (error.response) {
        throw new Error(`Discord API error: ${error.response.data.message || error.response.statusText}`);
      }
      throw new Error(`Discord message failed: ${error.message}`);
    }
  }

  /**
   * Get channel info
   */
  async getChannel(token, channelId) {
    try {
      const response = await axios.get(
        `https://discord.com/api/v10/channels/${channelId}`,
        {
          headers: {
            'Authorization': `Bot ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to get channel: ${error.message}`);
    }
  }

  /**
   * Get guild channels
   */
  async getGuildChannels(token, guildId) {
    try {
      const response = await axios.get(
        `https://discord.com/api/v10/guilds/${guildId}/channels`,
        {
          headers: {
            'Authorization': `Bot ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to get guild channels: ${error.message}`);
    }
  }

  /**
   * Delete message
   */
  async deleteMessage(token, channelId, messageId) {
    try {
      await axios.delete(
        `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`,
        {
          headers: {
            'Authorization': `Bot ${token}`
          }
        }
      );

      return { success: true };
    } catch (error) {
      throw new Error(`Failed to delete message: ${error.message}`);
    }
  }

  /**
   * Edit message
   */
  async editMessage(token, channelId, messageId, content) {
    try {
      const response = await axios.patch(
        `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`,
        { content },
        {
          headers: {
            'Authorization': `Bot ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to edit message: ${error.message}`);
    }
  }
}

module.exports = DiscordNode;
