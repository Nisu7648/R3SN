/**
 * Anthropic Claude API Integration
 * Complete AI conversations and completions with Claude models
 */

const axios = require('axios');

class AnthropicAPI {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY;
    this.baseURL = 'https://api.anthropic.com/v1';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      }
    });
  }

  // ==================== MESSAGES ====================

  async createMessage(data) {
    const payload = {
      model: data.model || 'claude-3-opus-20240229',
      messages: data.messages,
      max_tokens: data.max_tokens || 1024,
      ...(data.system && { system: data.system }),
      ...(data.temperature !== undefined && { temperature: data.temperature }),
      ...(data.top_p !== undefined && { top_p: data.top_p }),
      ...(data.top_k !== undefined && { top_k: data.top_k }),
      ...(data.stop_sequences && { stop_sequences: data.stop_sequences }),
      ...(data.stream !== undefined && { stream: data.stream }),
      ...(data.metadata && { metadata: data.metadata })
    };

    const response = await this.client.post('/messages', payload);
    return { success: true, message: response.data };
  }

  async createStreamingMessage(data, onChunk) {
    const payload = {
      model: data.model || 'claude-3-opus-20240229',
      messages: data.messages,
      max_tokens: data.max_tokens || 1024,
      stream: true,
      ...(data.system && { system: data.system }),
      ...(data.temperature !== undefined && { temperature: data.temperature })
    };

    const response = await this.client.post('/messages', payload, {
      responseType: 'stream'
    });

    return new Promise((resolve, reject) => {
      let fullContent = '';
      
      response.data.on('data', (chunk) => {
        const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const json = JSON.parse(line.slice(6));
              if (json.type === 'content_block_delta') {
                const content = json.delta?.text || '';
                fullContent += content;
                if (onChunk) onChunk(content);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      });

      response.data.on('end', () => {
        resolve({ success: true, content: fullContent });
      });

      response.data.on('error', reject);
    });
  }

  async createMessageWithVision(data) {
    const payload = {
      model: data.model || 'claude-3-opus-20240229',
      messages: data.messages.map(msg => ({
        role: msg.role,
        content: Array.isArray(msg.content) ? msg.content : [
          { type: 'text', text: msg.content }
        ]
      })),
      max_tokens: data.max_tokens || 1024,
      ...(data.system && { system: data.system })
    };

    const response = await this.client.post('/messages', payload);
    return { success: true, message: response.data };
  }

  // ==================== COMPLETIONS (Legacy) ====================

  async createCompletion(data) {
    const payload = {
      model: data.model || 'claude-2.1',
      prompt: data.prompt,
      max_tokens_to_sample: data.max_tokens || 1024,
      ...(data.temperature !== undefined && { temperature: data.temperature }),
      ...(data.top_p !== undefined && { top_p: data.top_p }),
      ...(data.top_k !== undefined && { top_k: data.top_k }),
      ...(data.stop_sequences && { stop_sequences: data.stop_sequences }),
      ...(data.stream !== undefined && { stream: data.stream })
    };

    const response = await this.client.post('/complete', payload);
    return { success: true, completion: response.data };
  }

  async createStreamingCompletion(data, onChunk) {
    const payload = {
      model: data.model || 'claude-2.1',
      prompt: data.prompt,
      max_tokens_to_sample: data.max_tokens || 1024,
      stream: true,
      ...(data.temperature !== undefined && { temperature: data.temperature })
    };

    const response = await this.client.post('/complete', payload, {
      responseType: 'stream'
    });

    return new Promise((resolve, reject) => {
      let fullCompletion = '';
      
      response.data.on('data', (chunk) => {
        const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const json = JSON.parse(line.slice(6));
              const content = json.completion || '';
              fullCompletion = content;
              if (onChunk) onChunk(content);
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      });

      response.data.on('end', () => {
        resolve({ success: true, completion: fullCompletion });
      });

      response.data.on('error', reject);
    });
  }

  // ==================== HELPER METHODS ====================

  async chat(messages, options = {}) {
    return this.createMessage({
      messages,
      model: options.model || 'claude-3-opus-20240229',
      max_tokens: options.max_tokens || 1024,
      temperature: options.temperature,
      system: options.system
    });
  }

  async chatStream(messages, onChunk, options = {}) {
    return this.createStreamingMessage({
      messages,
      model: options.model || 'claude-3-opus-20240229',
      max_tokens: options.max_tokens || 1024,
      temperature: options.temperature,
      system: options.system
    }, onChunk);
  }

  async analyzeImage(imageData, prompt, options = {}) {
    const messages = [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: imageData.media_type || 'image/jpeg',
            data: imageData.data
          }
        },
        {
          type: 'text',
          text: prompt
        }
      ]
    }];

    return this.createMessageWithVision({
      messages,
      model: options.model || 'claude-3-opus-20240229',
      max_tokens: options.max_tokens || 1024,
      system: options.system
    });
  }

  async analyzeMultipleImages(images, prompt, options = {}) {
    const content = [
      ...images.map(img => ({
        type: 'image',
        source: {
          type: 'base64',
          media_type: img.media_type || 'image/jpeg',
          data: img.data
        }
      })),
      {
        type: 'text',
        text: prompt
      }
    ];

    const messages = [{
      role: 'user',
      content
    }];

    return this.createMessageWithVision({
      messages,
      model: options.model || 'claude-3-opus-20240229',
      max_tokens: options.max_tokens || 1024,
      system: options.system
    });
  }

  async continueConversation(conversationHistory, newMessage, options = {}) {
    const messages = [
      ...conversationHistory,
      {
        role: 'user',
        content: newMessage
      }
    ];

    return this.createMessage({
      messages,
      model: options.model || 'claude-3-opus-20240229',
      max_tokens: options.max_tokens || 1024,
      temperature: options.temperature,
      system: options.system
    });
  }

  async generateWithContext(context, query, options = {}) {
    const systemPrompt = `You are a helpful assistant. Use the following context to answer the user's question:\n\n${context}`;

    return this.createMessage({
      messages: [{
        role: 'user',
        content: query
      }],
      system: systemPrompt,
      model: options.model || 'claude-3-opus-20240229',
      max_tokens: options.max_tokens || 1024,
      temperature: options.temperature
    });
  }

  async summarize(text, options = {}) {
    const prompt = options.customPrompt || `Please provide a concise summary of the following text:\n\n${text}`;

    return this.createMessage({
      messages: [{
        role: 'user',
        content: prompt
      }],
      model: options.model || 'claude-3-sonnet-20240229',
      max_tokens: options.max_tokens || 500,
      temperature: options.temperature || 0.3
    });
  }

  async extractInformation(text, fields, options = {}) {
    const prompt = `Extract the following information from the text below:\n\nFields to extract: ${fields.join(', ')}\n\nText:\n${text}\n\nProvide the extracted information in JSON format.`;

    return this.createMessage({
      messages: [{
        role: 'user',
        content: prompt
      }],
      model: options.model || 'claude-3-opus-20240229',
      max_tokens: options.max_tokens || 1024,
      temperature: options.temperature || 0.2
    });
  }

  async classify(text, categories, options = {}) {
    const prompt = `Classify the following text into one of these categories: ${categories.join(', ')}\n\nText: ${text}\n\nProvide only the category name.`;

    return this.createMessage({
      messages: [{
        role: 'user',
        content: prompt
      }],
      model: options.model || 'claude-3-sonnet-20240229',
      max_tokens: options.max_tokens || 100,
      temperature: options.temperature || 0.1
    });
  }

  async translate(text, targetLanguage, options = {}) {
    const prompt = `Translate the following text to ${targetLanguage}:\n\n${text}`;

    return this.createMessage({
      messages: [{
        role: 'user',
        content: prompt
      }],
      model: options.model || 'claude-3-sonnet-20240229',
      max_tokens: options.max_tokens || 1024,
      temperature: options.temperature || 0.3
    });
  }

  async codeGeneration(description, language, options = {}) {
    const prompt = `Generate ${language} code for the following requirement:\n\n${description}\n\nProvide only the code without explanations.`;

    return this.createMessage({
      messages: [{
        role: 'user',
        content: prompt
      }],
      model: options.model || 'claude-3-opus-20240229',
      max_tokens: options.max_tokens || 2048,
      temperature: options.temperature || 0.2
    });
  }

  async codeReview(code, language, options = {}) {
    const prompt = `Review the following ${language} code and provide feedback on:\n1. Code quality\n2. Potential bugs\n3. Performance improvements\n4. Best practices\n\nCode:\n${code}`;

    return this.createMessage({
      messages: [{
        role: 'user',
        content: prompt
      }],
      model: options.model || 'claude-3-opus-20240229',
      max_tokens: options.max_tokens || 2048,
      temperature: options.temperature || 0.3
    });
  }

  async explainCode(code, language, options = {}) {
    const prompt = `Explain what the following ${language} code does in simple terms:\n\n${code}`;

    return this.createMessage({
      messages: [{
        role: 'user',
        content: prompt
      }],
      model: options.model || 'claude-3-sonnet-20240229',
      max_tokens: options.max_tokens || 1024,
      temperature: options.temperature || 0.3
    });
  }

  async brainstorm(topic, count = 5, options = {}) {
    const prompt = `Generate ${count} creative ideas about: ${topic}`;

    return this.createMessage({
      messages: [{
        role: 'user',
        content: prompt
      }],
      model: options.model || 'claude-3-opus-20240229',
      max_tokens: options.max_tokens || 1024,
      temperature: options.temperature || 0.8
    });
  }

  async answerQuestion(question, context = null, options = {}) {
    let prompt = question;
    if (context) {
      prompt = `Context: ${context}\n\nQuestion: ${question}`;
    }

    return this.createMessage({
      messages: [{
        role: 'user',
        content: prompt
      }],
      model: options.model || 'claude-3-opus-20240229',
      max_tokens: options.max_tokens || 1024,
      temperature: options.temperature || 0.5
    });
  }

  async rewrite(text, style, options = {}) {
    const prompt = `Rewrite the following text in a ${style} style:\n\n${text}`;

    return this.createMessage({
      messages: [{
        role: 'user',
        content: prompt
      }],
      model: options.model || 'claude-3-sonnet-20240229',
      max_tokens: options.max_tokens || 1024,
      temperature: options.temperature || 0.7
    });
  }

  async sentiment(text, options = {}) {
    const prompt = `Analyze the sentiment of the following text and classify it as positive, negative, or neutral. Provide a brief explanation.\n\nText: ${text}`;

    return this.createMessage({
      messages: [{
        role: 'user',
        content: prompt
      }],
      model: options.model || 'claude-3-sonnet-20240229',
      max_tokens: options.max_tokens || 200,
      temperature: options.temperature || 0.2
    });
  }

  async compareTexts(text1, text2, options = {}) {
    const prompt = `Compare and contrast the following two texts:\n\nText 1:\n${text1}\n\nText 2:\n${text2}\n\nProvide key similarities and differences.`;

    return this.createMessage({
      messages: [{
        role: 'user',
        content: prompt
      }],
      model: options.model || 'claude-3-opus-20240229',
      max_tokens: options.max_tokens || 1024,
      temperature: options.temperature || 0.3
    });
  }

  async generateOutline(topic, options = {}) {
    const prompt = `Create a detailed outline for a document about: ${topic}`;

    return this.createMessage({
      messages: [{
        role: 'user',
        content: prompt
      }],
      model: options.model || 'claude-3-sonnet-20240229',
      max_tokens: options.max_tokens || 1024,
      temperature: options.temperature || 0.5
    });
  }

  async proofread(text, options = {}) {
    const prompt = `Proofread the following text and correct any grammar, spelling, or punctuation errors:\n\n${text}`;

    return this.createMessage({
      messages: [{
        role: 'user',
        content: prompt
      }],
      model: options.model || 'claude-3-sonnet-20240229',
      max_tokens: options.max_tokens || 1024,
      temperature: options.temperature || 0.2
    });
  }
}

module.exports = AnthropicAPI;
