/**
 * Slack Node - Send messages and manage Slack workspace
 * Integrates with Slack API
 */

const axios = require('axios');

class SlackNode {
  constructor() {
    this.type = 'slack.message';
    this.name = 'Slack Message';
    this.description = 'Send messages to Slack channels and users';
    this.category = 'communication';
    this.icon = '💬';
    this.color = '#4A154B';

    this.inputs = [
      {
        name: 'message',
        type: 'string',
        required: false
      },
      {
        name: 'channel',
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
        name: 'timestamp',
        type: 'string'
      }
    ];

    this.parameters = [
      {
        name: 'token',
        type: 'string',
        required: true,
        sensitive: true,
        placeholder: 'xoxb-your-slack-bot-token',
        description: 'Slack Bot Token'
      },
      {
        name: 'channel',
        type: 'string',
        required: false,
        placeholder: '#general',
        description: 'Channel ID or name'
      },
      {
        name: 'message',
        type: 'code',
        required: false,
        placeholder: 'Hello from R3SN!',
        description: 'Message text'
      },
      {
        name: 'username',
        type: 'string',
        required: false,
        description: 'Bot username override'
      },
      {
        name: 'iconEmoji',
        type: 'string',
        required: false,
        placeholder: ':robot_face:',
        description: 'Bot icon emoji'
      },
      {
        name: 'attachments',
        type: 'array',
        required: false,
        description: 'Message attachments'
      },
      {
        name: 'blocks',
        type: 'array',
        required: false,
        description: 'Block Kit blocks'
      },
      {
        name: 'threadTs',
        type: 'string',
        required: false,
        description: 'Thread timestamp for replies'
      }
    ];
  }

  /**
   * Execute the node
   */
  async execute(inputs, parameters, context) {
    const {
      token,
      channel: paramChannel,
      message: paramMessage,
      username,
      iconEmoji,
      attachments,
      blocks,
      threadTs
    } = parameters;

    const channel = inputs.channel || paramChannel;
    const message = inputs.message || paramMessage;

    if (!token) {
      throw new Error('Slack token is required');
    }

    if (!channel) {
      throw new Error('Channel is required');
    }

    if (!message && !blocks) {
      throw new Error('Message text or blocks are required');
    }

    try {
      const payload = {
        channel,
        text: message
      };

      if (username) payload.username = username;
      if (iconEmoji) payload.icon_emoji = iconEmoji;
      if (attachments) payload.attachments = attachments;
      if (blocks) payload.blocks = blocks;
      if (threadTs) payload.thread_ts = threadTs;

      const response = await axios.post(
        'https://slack.com/api/chat.postMessage',
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data.ok) {
        throw new Error(`Slack API error: ${response.data.error}`);
      }

      return {
        success: true,
        timestamp: response.data.ts,
        channel: response.data.channel,
        message: response.data.message
      };

    } catch (error) {
      throw new Error(`Slack message failed: ${error.message}`);
    }
  }

  /**
   * Get channel list
   */
  async getChannels(token) {
    try {
      const response = await axios.get(
        'https://slack.com/api/conversations.list',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.data.ok) {
        throw new Error(`Slack API error: ${response.data.error}`);
      }

      return response.data.channels;
    } catch (error) {
      throw new Error(`Failed to get channels: ${error.message}`);
    }
  }

  /**
   * Get user list
   */
  async getUsers(token) {
    try {
      const response = await axios.get(
        'https://slack.com/api/users.list',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.data.ok) {
        throw new Error(`Slack API error: ${response.data.error}`);
      }

      return response.data.members;
    } catch (error) {
      throw new Error(`Failed to get users: ${error.message}`);
    }
  }
}

module.exports = SlackNode;
