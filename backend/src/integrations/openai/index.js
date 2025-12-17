/**
 * OpenAI Integration
 * Real OpenAI API for GPT models
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
      throw new Error('OpenAI API Key is required');
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
      textCompletion: this.textCompletion.bind(this),
      createImage: this.createImage.bind(this),
      createEmbedding: this.createEmbedding.bind(this),
      moderateContent: this.moderateContent.bind(this),
      listModels: this.listModels.bind(this),
      createSpeech: this.createSpeech.bind(this),
      transcribeAudio: this.transcribeAudio.bind(this),
    };

    if (!actions[action]) {
      throw new Error(`Unknown action: ${action}`);
    }

    return await actions[action](params);
  }

  async chatCompletion(params) {
    const { messages, model = 'gpt-3.5-turbo', temperature = 0.7, maxTokens = 1000 } = params;
    
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
          max_tokens: maxTokens
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
      throw new Error(`OpenAI API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async textCompletion(params) {
    const { prompt, model = 'gpt-3.5-turbo-instruct', temperature = 0.7, maxTokens = 1000 } = params;
    
    if (!prompt) {
      throw new Error('Prompt is required');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/completions`,
        {
          model,
          prompt,
          temperature,
          max_tokens: maxTokens
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          text: response.data.choices[0].text,
          finishReason: response.data.choices[0].finish_reason,
          usage: response.data.usage
        }
      };
    } catch (error) {
      throw new Error(`OpenAI API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async createImage(params) {
    const { prompt, model = 'dall-e-3', size = '1024x1024', n = 1 } = params;
    
    if (!prompt) {
      throw new Error('Prompt is required');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/images/generations`,
        {
          model,
          prompt,
          size,
          n
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          images: response.data.data.map(img => ({
            url: img.url,
            revisedPrompt: img.revised_prompt
          }))
        }
      };
    } catch (error) {
      throw new Error(`OpenAI API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async createEmbedding(params) {
    const { input, model = 'text-embedding-ada-002' } = params;
    
    if (!input) {
      throw new Error('Input text is required');
    }

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
          embedding: response.data.data[0].embedding,
          usage: response.data.usage
        }
      };
    } catch (error) {
      throw new Error(`OpenAI API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async moderateContent(params) {
    const { input } = params;
    
    if (!input) {
      throw new Error('Input text is required');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/moderations`,
        { input },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          flagged: response.data.results[0].flagged,
          categories: response.data.results[0].categories,
          categoryScores: response.data.results[0].category_scores
        }
      };
    } catch (error) {
      throw new Error(`OpenAI API error: ${error.response?.data?.error?.message || error.message}`);
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
      throw new Error(`OpenAI API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async createSpeech(params) {
    const { input, model = 'tts-1', voice = 'alloy' } = params;
    
    if (!input) {
      throw new Error('Input text is required');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/audio/speech`,
        {
          model,
          input,
          voice
        },
        { 
          headers: this.getHeaders(),
          responseType: 'arraybuffer'
        }
      );

      return {
        success: true,
        data: {
          audio: Buffer.from(response.data).toString('base64')
        }
      };
    } catch (error) {
      throw new Error(`OpenAI API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async transcribeAudio(params) {
    const { audioUrl, model = 'whisper-1' } = params;
    
    if (!audioUrl) {
      throw new Error('Audio URL is required');
    }

    try {
      // Note: This requires multipart/form-data with actual audio file
      // Simplified version - actual implementation needs FormData
      return {
        success: false,
        data: {
          message: 'Audio transcription requires file upload - use Whisper API directly with FormData'
        }
      };
    } catch (error) {
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }
}

module.exports = OpenAIIntegration;
