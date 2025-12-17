/**
 * Mistral AI Integration
 * Real Mistral AI API for LLM models
 */

const axios = require('axios');

class MistralIntegration {
  constructor(config) {
    this.config = config;
    this.validateConfig();
    this.baseUrl = 'https://api.mistral.ai/v1';
  }

  validateConfig() {
    if (!this.config.apiKey) {
      throw new Error('Mistral AI API Key is required');
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
      createEmbedding: this.createEmbedding.bind(this),
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
      model = 'mistral-small-latest',
      temperature = 0.7,
      maxTokens = 1000,
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
          usage: response.data.usage
        }
      };
    } catch (error) {
      throw new Error(`Mistral API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async createEmbedding(params) {
    const { input, model = 'mistral-embed' } = params;
    
    if (!input) {
      throw new Error('Input text is required');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/embeddings`,
        {
          model,
          input: Array.isArray(input) ? input : [input]
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          embeddings: response.data.data.map(item => item.embedding),
          usage: response.data.usage
        }
      };
    } catch (error) {
      throw new Error(`Mistral API error: ${error.response?.data?.message || error.message}`);
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
            ownedBy: model.owned_by
          }))
        }
      };
    } catch (error) {
      throw new Error(`Mistral API error: ${error.response?.data?.message || error.message}`);
    }
  }
}

module.exports = MistralIntegration;
