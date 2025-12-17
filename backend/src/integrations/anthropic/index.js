/**
 * Anthropic Claude Integration
 * Real Anthropic API for Claude AI models
 */

const axios = require('axios');

class AnthropicIntegration {
  constructor(config) {
    this.config = config;
    this.validateConfig();
    this.baseUrl = 'https://api.anthropic.com/v1';
  }

  validateConfig() {
    if (!this.config.apiKey) {
      throw new Error('Anthropic API Key is required');
    }
  }

  getHeaders() {
    return {
      'x-api-key': this.config.apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    };
  }

  async execute(action, params) {
    const actions = {
      createMessage: this.createMessage.bind(this),
      streamMessage: this.streamMessage.bind(this),
      countTokens: this.countTokens.bind(this),
    };

    if (!actions[action]) {
      throw new Error(`Unknown action: ${action}`);
    }

    return await actions[action](params);
  }

  async createMessage(params) {
    const { 
      messages, 
      model = 'claude-3-sonnet-20240229',
      maxTokens = 1024,
      temperature = 1,
      system
    } = params;
    
    if (!messages || !Array.isArray(messages)) {
      throw new Error('Messages array is required');
    }

    try {
      const payload = {
        model,
        max_tokens: maxTokens,
        messages,
        temperature
      };

      if (system) {
        payload.system = system;
      }

      const response = await axios.post(
        `${this.baseUrl}/messages`,
        payload,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          id: response.data.id,
          content: response.data.content[0].text,
          role: response.data.role,
          model: response.data.model,
          stopReason: response.data.stop_reason,
          usage: response.data.usage
        }
      };
    } catch (error) {
      throw new Error(`Anthropic API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async streamMessage(params) {
    const { 
      messages, 
      model = 'claude-3-sonnet-20240229',
      maxTokens = 1024,
      system
    } = params;
    
    if (!messages || !Array.isArray(messages)) {
      throw new Error('Messages array is required');
    }

    try {
      const payload = {
        model,
        max_tokens: maxTokens,
        messages,
        stream: true
      };

      if (system) {
        payload.system = system;
      }

      const response = await axios.post(
        `${this.baseUrl}/messages`,
        payload,
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
      throw new Error(`Anthropic API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async countTokens(params) {
    const { text, model = 'claude-3-sonnet-20240229' } = params;
    
    if (!text) {
      throw new Error('Text is required');
    }

    try {
      // Anthropic doesn't have a direct token counting endpoint
      // This is an approximation: ~4 characters per token
      const estimatedTokens = Math.ceil(text.length / 4);

      return {
        success: true,
        data: {
          tokens: estimatedTokens,
          model: model,
          note: 'Estimated token count (~4 chars per token)'
        }
      };
    } catch (error) {
      throw new Error(`Token counting error: ${error.message}`);
    }
  }
}

module.exports = AnthropicIntegration;
