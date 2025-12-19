/**
 * Groq AI Free Integration
 * Ultra-fast LLM inference - FREE tier with premium features
 */

const axios = require('axios');

class GroqAIIntegration {
  constructor(config) {
    this.config = config;
    this.validateConfig();
    this.baseUrl = 'https://api.groq.com/openai/v1';
  }

  validateConfig() {
    if (!this.config.apiKey) {
      throw new Error('Groq API Key is required (FREE at console.groq.com)');
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
      chatCompletion: this.chatCompletion.bind(this),
      streamChat: this.streamChat.bind(this),
      listModels: this.listModels.bind(this),
    };

    if (!actions[action]) {
      throw new Error(`Unknown action: ${action}`);
    }

    return await actions[action](params);
  }

  async chatCompletion(params) {
    const { 
      messages, 
      model = 'llama3-70b-8192',
      temperature = 0.7,
      maxTokens = 1024,
      topP = 1
    } = params;
    
    if (!messages || !Array.isArray(messages)) {
      throw new Error('Messages array is required');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          top_p: topP
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          content: response.data.choices[0].message.content,
          role: response.data.choices[0].message.role,
          finishReason: response.data.choices[0].finish_reason,
          usage: response.data.usage,
          model: response.data.model
        }
      };
    } catch (error) {
      throw new Error(`Groq API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async streamChat(params) {
    const { 
      messages, 
      model = 'llama3-70b-8192',
      temperature = 0.7
    } = params;
    
    if (!messages || !Array.isArray(messages)) {
      throw new Error('Messages array is required');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model,
          messages,
          temperature,
          stream: true
        },
        { 
          headers: this.getHeaders(),
          responseType: 'stream'
        }
      );

      return {
        success: true,
        data: {
          stream: response.data
        }
      };
    } catch (error) {
      throw new Error(`Groq API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async listModels(params) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/models`,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          models: response.data.data.map(model => ({
            id: model.id,
            created: model.created,
            ownedBy: model.owned_by,
            active: model.active
          }))
        }
      };
    } catch (error) {
      throw new Error(`Groq API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

module.exports = GroqAIIntegration;
