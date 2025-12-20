/**
 * Cohere AI FREE Integration
 * FREE NLP & LLM Platform
 * Sign in to R3SN = Everything FREE!
 */

const axios = require('axios');

class CohereAIFreeIntegration {
  constructor(config) {
    this.config = config;
    this.validateConfig();
    this.baseUrl = 'https://api.cohere.ai/v1';
  }

  validateConfig() {
    if (!this.config.apiKey) {
      throw new Error('Cohere API Key required (FREE at dashboard.cohere.com)');
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
      generate: this.generate.bind(this),
      chat: this.chat.bind(this),
      embed: this.embed.bind(this),
      classify: this.classify.bind(this),
      summarize: this.summarize.bind(this),
      rerank: this.rerank.bind(this),
      detectLanguage: this.detectLanguage.bind(this),
    };

    if (!actions[action]) {
      throw new Error(`Unknown action: ${action}`);
    }

    return await actions[action](params);
  }

  async generate(params) {
    const {
      prompt,
      model = 'command',
      maxTokens = 300,
      temperature = 0.9,
      k = 0,
      p = 0.75
    } = params;

    try {
      const response = await axios.post(
        `${this.baseUrl}/generate`,
        {
          model,
          prompt,
          max_tokens: maxTokens,
          temperature,
          k,
          p
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          text: response.data.generations[0].text,
          id: response.data.id,
          model
        }
      };
    } catch (error) {
      throw new Error(`Cohere error: ${error.response?.data?.message || error.message}`);
    }
  }

  async chat(params) {
    const {
      message,
      conversationId,
      model = 'command',
      temperature = 0.3
    } = params;

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat`,
        {
          message,
          model,
          temperature,
          ...(conversationId && { conversation_id: conversationId })
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          text: response.data.text,
          conversationId: response.data.conversation_id,
          responseId: response.data.response_id
        }
      };
    } catch (error) {
      throw new Error(`Cohere error: ${error.response?.data?.message || error.message}`);
    }
  }

  async embed(params) {
    const { texts, model = 'embed-english-v3.0', inputType = 'search_document' } = params;

    try {
      const response = await axios.post(
        `${this.baseUrl}/embed`,
        {
          texts,
          model,
          input_type: inputType
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          embeddings: response.data.embeddings,
          id: response.data.id
        }
      };
    } catch (error) {
      throw new Error(`Cohere error: ${error.response?.data?.message || error.message}`);
    }
  }

  async classify(params) {
    const { inputs, examples, model = 'embed-english-v3.0' } = params;

    try {
      const response = await axios.post(
        `${this.baseUrl}/classify`,
        {
          inputs,
          examples,
          model
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          classifications: response.data.classifications
        }
      };
    } catch (error) {
      throw new Error(`Cohere error: ${error.response?.data?.message || error.message}`);
    }
  }

  async summarize(params) {
    const { text, length = 'medium', format = 'paragraph', model = 'command' } = params;

    try {
      const response = await axios.post(
        `${this.baseUrl}/summarize`,
        {
          text,
          length,
          format,
          model
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          summary: response.data.summary,
          id: response.data.id
        }
      };
    } catch (error) {
      throw new Error(`Cohere error: ${error.response?.data?.message || error.message}`);
    }
  }

  async rerank(params) {
    const { query, documents, topN = 3, model = 'rerank-english-v2.0' } = params;

    try {
      const response = await axios.post(
        `${this.baseUrl}/rerank`,
        {
          query,
          documents,
          top_n: topN,
          model
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          results: response.data.results
        }
      };
    } catch (error) {
      throw new Error(`Cohere error: ${error.response?.data?.message || error.message}`);
    }
  }

  async detectLanguage(params) {
    const { texts } = params;

    try {
      const response = await axios.post(
        `${this.baseUrl}/detect-language`,
        { texts },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          results: response.data.results
        }
      };
    } catch (error) {
      throw new Error(`Cohere error: ${error.response?.data?.message || error.message}`);
    }
  }
}

module.exports = CohereAIFreeIntegration;
