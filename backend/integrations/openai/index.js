/**
 * OpenAI Integration
 * GPT-4, GPT-3.5, DALL-E, Whisper, and more
 */

const axios = require('axios');

class OpenAIIntegration {
  constructor(config) {
    this.config = config;
    this.validateConfig();
    this.baseUrl = 'https://api.openai.com/v1';
  }

  validateConfig() {
    if (!this.config.apiKey) {
      throw new Error('OpenAI API Key required');
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
      createImage: this.createImage.bind(this),
      createEmbedding: this.createEmbedding.bind(this),
      transcribeAudio: this.transcribeAudio.bind(this),
      moderateContent: this.moderateContent.bind(this),
      listModels: this.listModels.bind(this),
    };

    if (!actions[action]) {
      throw new Error(`Unknown action: ${action}`);
    }

    return await actions[action](params);
  }

  async chatCompletion(params) {
    const { messages, model = 'gpt-3.5-turbo', temperature = 0.7, maxTokens } = params;

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
      data: response.data
    };
  }

  async createImage(params) {
    const { prompt, n = 1, size = '1024x1024' } = params;

    const response = await axios.post(
      `${this.baseUrl}/images/generations`,
      { prompt, n, size },
      { headers: this.getHeaders() }
    );

    return {
      success: true,
      data: response.data
    };
  }

  async createEmbedding(params) {
    const { input, model = 'text-embedding-ada-002' } = params;

    const response = await axios.post(
      `${this.baseUrl}/embeddings`,
      { input, model },
      { headers: this.getHeaders() }
    );

    return {
      success: true,
      data: response.data
    };
  }

  async transcribeAudio(params) {
    const { file, model = 'whisper-1' } = params;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', model);

    const response = await axios.post(
      `${this.baseUrl}/audio/transcriptions`,
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
      data: response.data
    };
  }

  async moderateContent(params) {
    const { input } = params;

    const response = await axios.post(
      `${this.baseUrl}/moderations`,
      { input },
      { headers: this.getHeaders() }
    );

    return {
      success: true,
      data: response.data
    };
  }

  async listModels() {
    const response = await axios.get(
      `${this.baseUrl}/models`,
      { headers: this.getHeaders() }
    );

    return {
      success: true,
      data: response.data
    };
  }
}

module.exports = OpenAIIntegration;
