/**
 * Llama Integration
 * Meta's open-source LLM via Replicate API
 */

const axios = require('axios');

class LlamaIntegration {
  constructor(config) {
    this.config = config;
    this.validateConfig();
    this.baseUrl = 'https://api.replicate.com/v1';
  }

  validateConfig() {
    if (!this.config.apiKey) {
      throw new Error('Replicate API Key is required for Llama');
    }
  }

  getHeaders() {
    return {
      'Authorization': `Token ${this.config.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  async execute(action, params) {
    const actions = {
      generateText: this.generateText.bind(this),
      generateChat: this.generateChat.bind(this),
      streamGenerate: this.streamGenerate.bind(this),
    };

    if (!actions[action]) {
      throw new Error(`Unknown action: ${action}`);
    }

    return await actions[action](params);
  }

  async generateText(params) {
    const { 
      prompt, 
      model = 'meta/llama-2-70b-chat',
      temperature = 0.7,
      maxTokens = 500,
      topP = 0.9
    } = params;
    
    if (!prompt) {
      throw new Error('Prompt is required');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/predictions`,
        {
          version: model,
          input: {
            prompt,
            temperature,
            max_new_tokens: maxTokens,
            top_p: topP
          }
        },
        { headers: this.getHeaders() }
      );

      // Wait for completion
      let prediction = response.data;
      while (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const statusResponse = await axios.get(
          prediction.urls.get,
          { headers: this.getHeaders() }
        );
        prediction = statusResponse.data;
      }

      if (prediction.status === 'failed') {
        throw new Error('Prediction failed');
      }

      return {
        success: true,
        data: {
          text: prediction.output.join(''),
          model: model,
          status: prediction.status
        }
      };
    } catch (error) {
      throw new Error(`Llama API error: ${error.response?.data?.detail || error.message}`);
    }
  }

  async generateChat(params) {
    const { 
      messages, 
      model = 'meta/llama-2-70b-chat',
      temperature = 0.7,
      maxTokens = 500
    } = params;
    
    if (!messages || !Array.isArray(messages)) {
      throw new Error('Messages array is required');
    }

    try {
      // Convert messages to Llama format
      const prompt = messages.map(msg => 
        `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
      ).join('\n') + '\nAssistant:';

      const response = await axios.post(
        `${this.baseUrl}/predictions`,
        {
          version: model,
          input: {
            prompt,
            temperature,
            max_new_tokens: maxTokens
          }
        },
        { headers: this.getHeaders() }
      );

      // Wait for completion
      let prediction = response.data;
      while (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const statusResponse = await axios.get(
          prediction.urls.get,
          { headers: this.getHeaders() }
        );
        prediction = statusResponse.data;
      }

      return {
        success: true,
        data: {
          text: prediction.output.join(''),
          role: 'assistant'
        }
      };
    } catch (error) {
      throw new Error(`Llama API error: ${error.response?.data?.detail || error.message}`);
    }
  }

  async streamGenerate(params) {
    const { prompt, model = 'meta/llama-2-70b-chat' } = params;
    
    if (!prompt) {
      throw new Error('Prompt is required');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/predictions`,
        {
          version: model,
          input: { prompt },
          stream: true
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          predictionId: response.data.id,
          streamUrl: response.data.urls.stream
        }
      };
    } catch (error) {
      throw new Error(`Llama API error: ${error.response?.data?.detail || error.message}`);
    }
  }
}

module.exports = LlamaIntegration;
