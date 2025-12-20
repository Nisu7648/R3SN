/**
 * Mistral AI FREE Integration
 * FREE Open-source LLM Access
 * Sign in to R3SN = Everything FREE!
 */

const axios = require('axios');

class MistralAIFreeIntegration {
  constructor(config) {
    this.config = config;
    this.validateConfig();
    this.baseUrl = 'https://api.mistral.ai/v1';
  }

  validateConfig() {
    if (!this.config.apiKey) {
      throw new Error('Mistral AI API Key required (FREE at console.mistral.ai)');
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
      embeddings: this.embeddings.bind(this),
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
      model = 'mistral-tiny',
      temperature = 0.7,
      maxTokens = 1024,
      topP = 1
    } = params;

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
      throw new Error(`Mistral AI error: ${error.response?.data?.message || error.message}`);
    }
  }

  async embeddings(params) {
    const { input, model = 'mistral-embed' } = params;

    try {
      const response = await axios.post(
        `${this.baseUrl}/embeddings`,
        {
          model,
          input
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          embeddings: response.data.data.map(item => item.embedding),
          model: response.data.model,
          usage: response.data.usage
        }
      };
    } catch (error) {
      throw new Error(`Mistral AI error: ${error.response?.data?.message || error.message}`);
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
      throw new Error(`Mistral AI error: ${error.response?.data?.message || error.message}`);
    }
  }
}

module.exports = MistralAIFreeIntegration;
