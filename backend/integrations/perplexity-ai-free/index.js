/**
 * Perplexity AI FREE Integration
 * FREE AI-Powered Search
 * Sign in to R3SN = Everything FREE!
 */

const axios = require('axios');

class PerplexityAIFreeIntegration {
  constructor(config) {
    this.config = config;
    this.validateConfig();
    this.baseUrl = 'https://api.perplexity.ai';
  }

  validateConfig() {
    if (!this.config.apiKey) {
      throw new Error('Perplexity API Key required (FREE at perplexity.ai)');
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
      chat: this.chat.bind(this),
      search: this.search.bind(this),
    };

    if (!actions[action]) {
      throw new Error(`Unknown action: ${action}`);
    }

    return await actions[action](params);
  }

  async chat(params) {
    const {
      messages,
      model = 'llama-3.1-sonar-small-128k-online',
      temperature = 0.2,
      maxTokens = 1024
    } = params;

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model,
          messages,
          temperature,
          max_tokens: maxTokens
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          content: response.data.choices[0].message.content,
          role: response.data.choices[0].message.role,
          citations: response.data.citations || [],
          usage: response.data.usage,
          model: response.data.model
        }
      };
    } catch (error) {
      throw new Error(`Perplexity error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async search(params) {
    const {
      query,
      model = 'llama-3.1-sonar-small-128k-online'
    } = params;

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful search assistant. Provide accurate information with citations.'
            },
            {
              role: 'user',
              content: query
            }
          ]
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          answer: response.data.choices[0].message.content,
          citations: response.data.citations || [],
          sources: response.data.sources || [],
          model: response.data.model
        }
      };
    } catch (error) {
      throw new Error(`Perplexity error: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

module.exports = PerplexityAIFreeIntegration;
