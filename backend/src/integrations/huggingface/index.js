/**
 * Hugging Face Integration
 * Real Hugging Face API for AI models
 */

const axios = require('axios');

class HuggingFaceIntegration {
  constructor(config) {
    this.config = config;
    this.validateConfig();
    this.baseUrl = 'https://api-inference.huggingface.co';
  }

  validateConfig() {
    if (!this.config.apiKey) {
      throw new Error('Hugging Face API Key is required');
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
      textGeneration: this.textGeneration.bind(this),
      textClassification: this.textClassification.bind(this),
      tokenClassification: this.tokenClassification.bind(this),
      questionAnswering: this.questionAnswering.bind(this),
      summarization: this.summarization.bind(this),
      translation: this.translation.bind(this),
      sentimentAnalysis: this.sentimentAnalysis.bind(this),
      imageClassification: this.imageClassification.bind(this),
      objectDetection: this.objectDetection.bind(this),
      imageToText: this.imageToText.bind(this),
    };

    if (!actions[action]) {
      throw new Error(`Unknown action: ${action}`);
    }

    return await actions[action](params);
  }

  async textGeneration(params) {
    const { 
      text, 
      model = 'gpt2',
      maxLength = 100,
      temperature = 1.0
    } = params;
    
    if (!text) {
      throw new Error('Text is required');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/models/${model}`,
        {
          inputs: text,
          parameters: {
            max_length: maxLength,
            temperature
          }
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          generatedText: response.data[0].generated_text,
          model: model
        }
      };
    } catch (error) {
      throw new Error(`Hugging Face API error: ${error.response?.data?.error || error.message}`);
    }
  }

  async textClassification(params) {
    const { text, model = 'distilbert-base-uncased-finetuned-sst-2-english' } = params;
    
    if (!text) {
      throw new Error('Text is required');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/models/${model}`,
        { inputs: text },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          classifications: response.data[0]
        }
      };
    } catch (error) {
      throw new Error(`Hugging Face API error: ${error.response?.data?.error || error.message}`);
    }
  }

  async tokenClassification(params) {
    const { text, model = 'dbmdz/bert-large-cased-finetuned-conll03-english' } = params;
    
    if (!text) {
      throw new Error('Text is required');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/models/${model}`,
        { inputs: text },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          entities: response.data
        }
      };
    } catch (error) {
      throw new Error(`Hugging Face API error: ${error.response?.data?.error || error.message}`);
    }
  }

  async questionAnswering(params) {
    const { question, context, model = 'deepset/roberta-base-squad2' } = params;
    
    if (!question || !context) {
      throw new Error('Question and context are required');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/models/${model}`,
        {
          inputs: {
            question,
            context
          }
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          answer: response.data.answer,
          score: response.data.score
        }
      };
    } catch (error) {
      throw new Error(`Hugging Face API error: ${error.response?.data?.error || error.message}`);
    }
  }

  async summarization(params) {
    const { text, model = 'facebook/bart-large-cnn', maxLength = 130 } = params;
    
    if (!text) {
      throw new Error('Text is required');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/models/${model}`,
        {
          inputs: text,
          parameters: { max_length: maxLength }
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          summary: response.data[0].summary_text
        }
      };
    } catch (error) {
      throw new Error(`Hugging Face API error: ${error.response?.data?.error || error.message}`);
    }
  }

  async translation(params) {
    const { text, model = 't5-base' } = params;
    
    if (!text) {
      throw new Error('Text is required');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/models/${model}`,
        { inputs: text },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          translatedText: response.data[0].translation_text
        }
      };
    } catch (error) {
      throw new Error(`Hugging Face API error: ${error.response?.data?.error || error.message}`);
    }
  }

  async sentimentAnalysis(params) {
    const { text, model = 'distilbert-base-uncased-finetuned-sst-2-english' } = params;
    
    if (!text) {
      throw new Error('Text is required');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/models/${model}`,
        { inputs: text },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          sentiment: response.data[0][0].label,
          score: response.data[0][0].score
        }
      };
    } catch (error) {
      throw new Error(`Hugging Face API error: ${error.response?.data?.error || error.message}`);
    }
  }

  async imageClassification(params) {
    const { imageUrl, model = 'google/vit-base-patch16-224' } = params;
    
    if (!imageUrl) {
      throw new Error('Image URL is required');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/models/${model}`,
        { inputs: imageUrl },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          classifications: response.data
        }
      };
    } catch (error) {
      throw new Error(`Hugging Face API error: ${error.response?.data?.error || error.message}`);
    }
  }

  async objectDetection(params) {
    const { imageUrl, model = 'facebook/detr-resnet-50' } = params;
    
    if (!imageUrl) {
      throw new Error('Image URL is required');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/models/${model}`,
        { inputs: imageUrl },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          objects: response.data
        }
      };
    } catch (error) {
      throw new Error(`Hugging Face API error: ${error.response?.data?.error || error.message}`);
    }
  }

  async imageToText(params) {
    const { imageUrl, model = 'nlpconnect/vit-gpt2-image-captioning' } = params;
    
    if (!imageUrl) {
      throw new Error('Image URL is required');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/models/${model}`,
        { inputs: imageUrl },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          caption: response.data[0].generated_text
        }
      };
    } catch (error) {
      throw new Error(`Hugging Face API error: ${error.response?.data?.error || error.message}`);
    }
  }
}

module.exports = HuggingFaceIntegration;
