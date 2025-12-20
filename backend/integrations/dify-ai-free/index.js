/**
 * Dify AI FREE Integration
 * FREE LLM Application Platform
 * Sign in to R3SN = Everything FREE!
 */

const axios = require('axios');

class DifyAIFreeIntegration {
  constructor(config) {
    this.config = config;
    this.validateConfig();
    this.baseUrl = config.baseUrl || 'https://api.dify.ai/v1';
  }

  validateConfig() {
    if (!this.config.apiKey) {
      throw new Error('Dify API Key required (FREE at dify.ai)');
    }
  }

  getHeaders() {
    return {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  async execute(action, params) {
    const actions = {
      chatMessages: this.chatMessages.bind(this),
      completionMessages: this.completionMessages.bind(this),
      feedbackMessage: this.feedbackMessage.bind(this),
      getConversations: this.getConversations.bind(this),
      getMessages: this.getMessages.bind(this),
      uploadFile: this.uploadFile.bind(this),
    };

    if (!actions[action]) {
      throw new Error(`Unknown action: ${action}`);
    }

    return await actions[action](params);
  }

  async chatMessages(params) {
    const {
      query,
      user,
      conversationId,
      inputs = {},
      responseMode = 'blocking'
    } = params;

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat-messages`,
        {
          query,
          user,
          conversation_id: conversationId,
          inputs,
          response_mode: responseMode
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          answer: response.data.answer,
          conversationId: response.data.conversation_id,
          messageId: response.data.message_id,
          createdAt: response.data.created_at
        }
      };
    } catch (error) {
      throw new Error(`Dify error: ${error.response?.data?.message || error.message}`);
    }
  }

  async completionMessages(params) {
    const {
      prompt,
      user,
      inputs = {},
      responseMode = 'blocking'
    } = params;

    try {
      const response = await axios.post(
        `${this.baseUrl}/completion-messages`,
        {
          prompt,
          user,
          inputs,
          response_mode: responseMode
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          answer: response.data.answer,
          messageId: response.data.message_id,
          createdAt: response.data.created_at
        }
      };
    } catch (error) {
      throw new Error(`Dify error: ${error.response?.data?.message || error.message}`);
    }
  }

  async feedbackMessage(params) {
    const { messageId, rating, user } = params;

    try {
      const response = await axios.post(
        `${this.baseUrl}/messages/${messageId}/feedbacks`,
        {
          rating,
          user
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          result: 'success'
        }
      };
    } catch (error) {
      throw new Error(`Dify error: ${error.response?.data?.message || error.message}`);
    }
  }

  async getConversations(params) {
    const { user, limit = 20, lastId } = params;

    try {
      const response = await axios.get(
        `${this.baseUrl}/conversations`,
        {
          headers: this.getHeaders(),
          params: {
            user,
            limit,
            ...(lastId && { last_id: lastId })
          }
        }
      );

      return {
        success: true,
        data: {
          conversations: response.data.data,
          hasMore: response.data.has_more,
          limit: response.data.limit
        }
      };
    } catch (error) {
      throw new Error(`Dify error: ${error.response?.data?.message || error.message}`);
    }
  }

  async getMessages(params) {
    const { conversationId, user, limit = 20, lastId } = params;

    try {
      const response = await axios.get(
        `${this.baseUrl}/messages`,
        {
          headers: this.getHeaders(),
          params: {
            conversation_id: conversationId,
            user,
            limit,
            ...(lastId && { last_id: lastId })
          }
        }
      );

      return {
        success: true,
        data: {
          messages: response.data.data,
          hasMore: response.data.has_more,
          limit: response.data.limit
        }
      };
    } catch (error) {
      throw new Error(`Dify error: ${error.response?.data?.message || error.message}`);
    }
  }

  async uploadFile(params) {
    const { file, user } = params;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user', user);

      const response = await axios.post(
        `${this.baseUrl}/files/upload`,
        formData,
        {
          headers: {
            ...this.getHeaders(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return {
        success: true,
        data: {
          id: response.data.id,
          name: response.data.name,
          size: response.data.size,
          mimeType: response.data.mime_type,
          createdAt: response.data.created_at
        }
      };
    } catch (error) {
      throw new Error(`Dify error: ${error.response?.data?.message || error.message}`);
    }
  }
}

module.exports = DifyAIFreeIntegration;
