/**
 * Telegram Node - Real Telegram Bot API Integration
 * Send messages, photos, documents, manage chats
 */

const axios = require('axios');
const FormData = require('form-data');

class TelegramNode {
  constructor() {
    this.type = 'telegram.action';
    this.name = 'Telegram Bot';
    this.description = 'Send messages, photos, files via Telegram Bot API';
    this.category = 'messaging';
    this.icon = '✈️';
    this.color = '#0088cc';

    this.parameters = [
      {
        name: 'botToken',
        type: 'string',
        required: true,
        sensitive: true,
        description: 'Telegram Bot Token from @BotFather'
      },
      {
        name: 'action',
        type: 'select',
        required: true,
        options: [
          'send_message',
          'send_photo',
          'send_document',
          'send_location',
          'get_updates',
          'get_me',
          'delete_message',
          'edit_message'
        ],
        description: 'Action to perform'
      },
      {
        name: 'chatId',
        type: 'string',
        required: false,
        description: 'Chat ID or @username'
      },
      {
        name: 'text',
        type: 'code',
        required: false,
        description: 'Message text'
      },
      {
        name: 'photoUrl',
        type: 'string',
        required: false,
        description: 'Photo URL'
      },
      {
        name: 'documentUrl',
        type: 'string',
        required: false,
        description: 'Document URL'
      },
      {
        name: 'latitude',
        type: 'number',
        required: false,
        description: 'Location latitude'
      },
      {
        name: 'longitude',
        type: 'number',
        required: false,
        description: 'Location longitude'
      },
      {
        name: 'messageId',
        type: 'number',
        required: false,
        description: 'Message ID for edit/delete'
      },
      {
        name: 'parseMode',
        type: 'select',
        options: ['Markdown', 'HTML', 'MarkdownV2'],
        description: 'Message parse mode'
      }
    ];
  }

  async execute(inputs, parameters, context) {
    const {
      botToken,
      action,
      chatId,
      text,
      photoUrl,
      documentUrl,
      latitude,
      longitude,
      messageId,
      parseMode
    } = parameters;

    if (!botToken) {
      throw new Error('Telegram Bot Token is required');
    }

    const baseUrl = `https://api.telegram.org/bot${botToken}`;

    try {
      switch (action) {
        case 'send_message':
          return await this.sendMessage(baseUrl, chatId, text, parseMode);
        
        case 'send_photo':
          return await this.sendPhoto(baseUrl, chatId, photoUrl, text);
        
        case 'send_document':
          return await this.sendDocument(baseUrl, chatId, documentUrl, text);
        
        case 'send_location':
          return await this.sendLocation(baseUrl, chatId, latitude, longitude);
        
        case 'get_updates':
          return await this.getUpdates(baseUrl);
        
        case 'get_me':
          return await this.getMe(baseUrl);
        
        case 'delete_message':
          return await this.deleteMessage(baseUrl, chatId, messageId);
        
        case 'edit_message':
          return await this.editMessage(baseUrl, chatId, messageId, text, parseMode);
        
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      if (error.response) {
        throw new Error(`Telegram API error: ${error.response.data.description || error.response.statusText}`);
      }
      throw new Error(`Telegram error: ${error.message}`);
    }
  }

  async sendMessage(baseUrl, chatId, text, parseMode) {
    if (!chatId || !text) {
      throw new Error('Chat ID and text are required');
    }

    const response = await axios.post(`${baseUrl}/sendMessage`, {
      chat_id: chatId,
      text,
      ...(parseMode && { parse_mode: parseMode })
    });
    
    return {
      success: true,
      message: {
        messageId: response.data.result.message_id,
        chatId: response.data.result.chat.id,
        text: response.data.result.text,
        date: response.data.result.date
      }
    };
  }

  async sendPhoto(baseUrl, chatId, photoUrl, caption) {
    if (!chatId || !photoUrl) {
      throw new Error('Chat ID and photo URL are required');
    }

    const response = await axios.post(`${baseUrl}/sendPhoto`, {
      chat_id: chatId,
      photo: photoUrl,
      ...(caption && { caption })
    });
    
    return {
      success: true,
      message: {
        messageId: response.data.result.message_id,
        chatId: response.data.result.chat.id,
        photo: response.data.result.photo
      }
    };
  }

  async sendDocument(baseUrl, chatId, documentUrl, caption) {
    if (!chatId || !documentUrl) {
      throw new Error('Chat ID and document URL are required');
    }

    const response = await axios.post(`${baseUrl}/sendDocument`, {
      chat_id: chatId,
      document: documentUrl,
      ...(caption && { caption })
    });
    
    return {
      success: true,
      message: {
        messageId: response.data.result.message_id,
        chatId: response.data.result.chat.id,
        document: response.data.result.document
      }
    };
  }

  async sendLocation(baseUrl, chatId, latitude, longitude) {
    if (!chatId || !latitude || !longitude) {
      throw new Error('Chat ID, latitude, and longitude are required');
    }

    const response = await axios.post(`${baseUrl}/sendLocation`, {
      chat_id: chatId,
      latitude,
      longitude
    });
    
    return {
      success: true,
      message: {
        messageId: response.data.result.message_id,
        chatId: response.data.result.chat.id,
        location: response.data.result.location
      }
    };
  }

  async getUpdates(baseUrl) {
    const response = await axios.get(`${baseUrl}/getUpdates`);
    
    return {
      success: true,
      updates: response.data.result
    };
  }

  async getMe(baseUrl) {
    const response = await axios.get(`${baseUrl}/getMe`);
    
    return {
      success: true,
      bot: response.data.result
    };
  }

  async deleteMessage(baseUrl, chatId, messageId) {
    if (!chatId || !messageId) {
      throw new Error('Chat ID and message ID are required');
    }

    const response = await axios.post(`${baseUrl}/deleteMessage`, {
      chat_id: chatId,
      message_id: messageId
    });
    
    return {
      success: true,
      deleted: response.data.result
    };
  }

  async editMessage(baseUrl, chatId, messageId, text, parseMode) {
    if (!chatId || !messageId || !text) {
      throw new Error('Chat ID, message ID, and text are required');
    }

    const response = await axios.post(`${baseUrl}/editMessageText`, {
      chat_id: chatId,
      message_id: messageId,
      text,
      ...(parseMode && { parse_mode: parseMode })
    });
    
    return {
      success: true,
      message: {
        messageId: response.data.result.message_id,
        text: response.data.result.text
      }
    };
  }
}

module.exports = TelegramNode;
