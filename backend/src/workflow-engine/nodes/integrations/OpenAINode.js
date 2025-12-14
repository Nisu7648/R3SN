/**
 * OpenAI Node - Real OpenAI API Integration
 * GPT-4, GPT-3.5, DALL-E, Whisper, Embeddings
 */

const axios = require('axios');

class OpenAINode {
  constructor() {
    this.type = 'openai.action';
    this.name = 'OpenAI';
    this.description = 'Use GPT-4, DALL-E, Whisper, and other OpenAI models';
    this.category = 'ai';
    this.icon = '🤖';
    this.color = '#10A37F';

    this.parameters = [
      {
        name: 'apiKey',
        type: 'string',
        required: true,
        sensitive: true,
        description: 'OpenAI API Key'
      },
      {
        name: 'action',
        type: 'select',
        required: true,
        options: [
          'chat_completion',
          'text_completion',
          'create_image',
          'create_embedding',
          'moderate_content',
          'transcribe_audio'
        ],
        description: 'Action to perform'
      },
      {
        name: 'model',
        type: 'select',
        options: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'dall-e-3', 'dall-e-2', 'whisper-1', 'text-embedding-ada-002'],
        default: 'gpt-3.5-turbo',
        description: 'Model to use'
      },
      {
        name: 'prompt',
        type: 'code',
        required: false,
        description: 'Prompt or message'
      },
      {
        name: 'messages',
        type: 'array',
        required: false,
        description: 'Chat messages array'
      },
      {
        name: 'temperature',
        type: 'number',
        default: 0.7,
        min: 0,
        max: 2,
        description: 'Sampling temperature'
      },
      {
        name: 'maxTokens',
        type: 'number',
        default: 1000,
        description: 'Maximum tokens to generate'
      },
      {
        name: 'imageSize',
        type: 'select',
        options: ['256x256', '512x512', '1024x1024', '1792x1024', '1024x1792'],
        default: '1024x1024',
        description: 'Image size for DALL-E'
      },
      {
        name: 'n',
        type: 'number',
        default: 1,
        description: 'Number of completions/images'
      }
    ];
  }

  async execute(inputs, parameters, context) {
    const {
      apiKey,
      action,
      model,
      prompt,
      messages,
      temperature,
      maxTokens,
      imageSize,
      n
    } = parameters;

    if (!apiKey) {
      throw new Error('OpenAI API Key is required');
    }

    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };

    try {
      switch (action) {
        case 'chat_completion':
          return await this.chatCompletion(headers, model, messages || [{ role: 'user', content: prompt }], temperature, maxTokens);
        
        case 'text_completion':
          return await this.textCompletion(headers, model, prompt, temperature, maxTokens);
        
        case 'create_image':
          return await this.createImage(headers, model, prompt, imageSize, n);
        
        case 'create_embedding':
          return await this.createEmbedding(headers, prompt);
        
        case 'moderate_content':
          return await this.moderateContent(headers, prompt);
        
        case 'transcribe_audio':
          return await this.transcribeAudio(headers, prompt);
        
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      if (error.response) {
        throw new Error(`OpenAI API error: ${error.response.data.error?.message || error.response.statusText}`);
      }
      throw new Error(`OpenAI error: ${error.message}`);
    }
  }

  async chatCompletion(headers, model, messages, temperature, maxTokens) {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: model || 'gpt-3.5-turbo',
        messages,
        temperature,
        max_tokens: maxTokens
      },
      { headers }
    );
    
    return {
      success: true,
      response: response.data.choices[0].message.content,
      usage: response.data.usage,
      model: response.data.model
    };
  }

  async textCompletion(headers, model, prompt, temperature, maxTokens) {
    const response = await axios.post(
      'https://api.openai.com/v1/completions',
      {
        model: model || 'gpt-3.5-turbo-instruct',
        prompt,
        temperature,
        max_tokens: maxTokens
      },
      { headers }
    );
    
    return {
      success: true,
      response: response.data.choices[0].text,
      usage: response.data.usage
    };
  }

  async createImage(headers, model, prompt, size, n) {
    if (!prompt) throw new Error('Prompt is required for image generation');

    const response = await axios.post(
      'https://api.openai.com/v1/images/generations',
      {
        model: model || 'dall-e-3',
        prompt,
        size: size || '1024x1024',
        n: n || 1
      },
      { headers }
    );
    
    return {
      success: true,
      images: response.data.data.map(img => ({
        url: img.url,
        revisedPrompt: img.revised_prompt
      }))
    };
  }

  async createEmbedding(headers, input) {
    if (!input) throw new Error('Input text is required');

    const response = await axios.post(
      'https://api.openai.com/v1/embeddings',
      {
        model: 'text-embedding-ada-002',
        input
      },
      { headers }
    );
    
    return {
      success: true,
      embedding: response.data.data[0].embedding,
      usage: response.data.usage
    };
  }

  async moderateContent(headers, input) {
    if (!input) throw new Error('Input text is required');

    const response = await axios.post(
      'https://api.openai.com/v1/moderations',
      { input },
      { headers }
    );
    
    return {
      success: true,
      results: response.data.results[0]
    };
  }

  async transcribeAudio(headers, audioUrl) {
    if (!audioUrl) throw new Error('Audio URL is required');

    // Note: This requires multipart/form-data with actual audio file
    // This is a simplified version
    throw new Error('Audio transcription requires file upload - use Whisper API directly');
  }
}

module.exports = OpenAINode;
