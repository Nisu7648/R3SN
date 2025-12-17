/**
 * Google Gemini Integration
 * Real Google Gemini API for AI text generation
 */

const axios = require('axios');

class GoogleGeminiIntegration {
  constructor(config) {
    this.config = config;
    this.validateConfig();
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  }

  validateConfig() {
    if (!this.config.apiKey) {
      throw new Error('Google Gemini API Key is required');
    }
  }

  async execute(action, params) {
    const actions = {
      generateText: this.generateText.bind(this),
      generateChat: this.generateChat.bind(this),
      countTokens: this.countTokens.bind(this),
      embedContent: this.embedContent.bind(this),
      listModels: this.listModels.bind(this),
      getModel: this.getModel.bind(this),
    };

    if (!actions[action]) {
      throw new Error(`Unknown action: ${action}`);
    }

    return await actions[action](params);
  }

  async generateText(params) {
    const { prompt, model = 'gemini-pro', temperature = 0.7, maxTokens = 1024 } = params;
    
    if (!prompt) {
      throw new Error('Prompt is required');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/models/${model}:generateContent?key=${this.config.apiKey}`,
        {
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens
          }
        }
      );

      return {
        success: true,
        data: {
          text: response.data.candidates[0].content.parts[0].text,
          model: model,
          finishReason: response.data.candidates[0].finishReason
        }
      };
    } catch (error) {
      throw new Error(`Gemini API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async generateChat(params) {
    const { messages, model = 'gemini-pro', temperature = 0.7 } = params;
    
    if (!messages || !Array.isArray(messages)) {
      throw new Error('Messages array is required');
    }

    try {
      const contents = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const response = await axios.post(
        `${this.baseUrl}/models/${model}:generateContent?key=${this.config.apiKey}`,
        {
          contents,
          generationConfig: { temperature }
        }
      );

      return {
        success: true,
        data: {
          text: response.data.candidates[0].content.parts[0].text,
          role: 'model'
        }
      };
    } catch (error) {
      throw new Error(`Gemini API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async countTokens(params) {
    const { text, model = 'gemini-pro' } = params;
    
    if (!text) {
      throw new Error('Text is required');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/models/${model}:countTokens?key=${this.config.apiKey}`,
        {
          contents: [{
            parts: [{ text }]
          }]
        }
      );

      return {
        success: true,
        data: {
          totalTokens: response.data.totalTokens
        }
      };
    } catch (error) {
      throw new Error(`Gemini API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async embedContent(params) {
    const { text, model = 'embedding-001' } = params;
    
    if (!text) {
      throw new Error('Text is required');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/models/${model}:embedContent?key=${this.config.apiKey}`,
        {
          content: {
            parts: [{ text }]
          }
        }
      );

      return {
        success: true,
        data: {
          embedding: response.data.embedding.values
        }
      };
    } catch (error) {
      throw new Error(`Gemini API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async listModels(params) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/models?key=${this.config.apiKey}`
      );

      return {
        success: true,
        data: {
          models: response.data.models.map(model => ({
            name: model.name,
            displayName: model.displayName,
            description: model.description,
            supportedGenerationMethods: model.supportedGenerationMethods
          }))
        }
      };
    } catch (error) {
      throw new Error(`Gemini API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async getModel(params) {
    const { model = 'gemini-pro' } = params;

    try {
      const response = await axios.get(
        `${this.baseUrl}/models/${model}?key=${this.config.apiKey}`
      );

      return {
        success: true,
        data: {
          name: response.data.name,
          displayName: response.data.displayName,
          description: response.data.description,
          inputTokenLimit: response.data.inputTokenLimit,
          outputTokenLimit: response.data.outputTokenLimit
        }
      };
    } catch (error) {
      throw new Error(`Gemini API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

module.exports = GoogleGeminiIntegration;
