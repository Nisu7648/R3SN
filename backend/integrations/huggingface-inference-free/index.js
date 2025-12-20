/**
 * Hugging Face Inference API - FREE
 * Access 100,000+ AI models for FREE
 * Just sign in to R3SN - Everything is FREE!
 */

const axios = require('axios');

class HuggingFaceInferenceIntegration {
  constructor(config) {
    this.config = config;
    this.validateConfig();
    this.baseUrl = 'https://api-inference.huggingface.co';
  }

  validateConfig() {
    if (!this.config.apiKey) {
      throw new Error('Hugging Face API Key required (FREE at huggingface.co)');
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
      textToImage: this.textToImage.bind(this),
      imageToText: this.imageToText.bind(this),
      translation: this.translation.bind(this),
      summarization: this.summarization.bind(this),
      questionAnswering: this.questionAnswering.bind(this),
      sentimentAnalysis: this.sentimentAnalysis.bind(this),
      zeroShotClassification: this.zeroShotClassification.bind(this),
      featureExtraction: this.featureExtraction.bind(this),
      textToSpeech: this.textToSpeech.bind(this),
      automaticSpeechRecognition: this.automaticSpeechRecognition.bind(this),
      objectDetection: this.objectDetection.bind(this),
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
      temperature = 1.0,
      topK = 50
    } = params;

    try {
      const response = await axios.post(
        `${this.baseUrl}/models/${model}`,
        {
          inputs: text,
          parameters: {
            max_length: maxLength,
            temperature,
            top_k: topK
          }
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          generatedText: response.data[0].generated_text,
          model
        }
      };
    } catch (error) {
      throw new Error(`HF API error: ${error.response?.data?.error || error.message}`);
    }
  }

  async textToImage(params) {
    const { 
      prompt, 
      model = 'stabilityai/stable-diffusion-2-1',
      negativePrompt = ''
    } = params;

    try {
      const response = await axios.post(
        `${this.baseUrl}/models/${model}`,
        {
          inputs: prompt,
          parameters: {
            negative_prompt: negativePrompt
          }
        },
        { 
          headers: this.getHeaders(),
          responseType: 'arraybuffer'
        }
      );

      const base64Image = Buffer.from(response.data, 'binary').toString('base64');

      return {
        success: true,
        data: {
          image: `data:image/png;base64,${base64Image}`,
          prompt,
          model
        }
      };
    } catch (error) {
      throw new Error(`HF API error: ${error.response?.data?.error || error.message}`);
    }
  }

  async imageToText(params) {
    const { imageUrl, model = 'nlpconnect/vit-gpt2-image-captioning' } = params;

    try {
      const response = await axios.post(
        `${this.baseUrl}/models/${model}`,
        { inputs: imageUrl },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          caption: response.data[0].generated_text,
          model
        }
      };
    } catch (error) {
      throw new Error(`HF API error: ${error.response?.data?.error || error.message}`);
    }
  }

  async translation(params) {
    const { text, model = 'Helsinki-NLP/opus-mt-en-es' } = params;

    try {
      const response = await axios.post(
        `${this.baseUrl}/models/${model}`,
        { inputs: text },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          translatedText: response.data[0].translation_text,
          model
        }
      };
    } catch (error) {
      throw new Error(`HF API error: ${error.response?.data?.error || error.message}`);
    }
  }

  async summarization(params) {
    const { text, model = 'facebook/bart-large-cnn', maxLength = 130 } = params;

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
          summary: response.data[0].summary_text,
          model
        }
      };
    } catch (error) {
      throw new Error(`HF API error: ${error.response?.data?.error || error.message}`);
    }
  }

  async questionAnswering(params) {
    const { question, context, model = 'deepset/roberta-base-squad2' } = params;

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
          score: response.data.score,
          model
        }
      };
    } catch (error) {
      throw new Error(`HF API error: ${error.response?.data?.error || error.message}`);
    }
  }

  async sentimentAnalysis(params) {
    const { text, model = 'distilbert-base-uncased-finetuned-sst-2-english' } = params;

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
          score: response.data[0][0].score,
          model
        }
      };
    } catch (error) {
      throw new Error(`HF API error: ${error.response?.data?.error || error.message}`);
    }
  }

  async zeroShotClassification(params) {
    const { text, labels, model = 'facebook/bart-large-mnli' } = params;

    try {
      const response = await axios.post(
        `${this.baseUrl}/models/${model}`,
        {
          inputs: text,
          parameters: { candidate_labels: labels }
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          labels: response.data.labels,
          scores: response.data.scores,
          model
        }
      };
    } catch (error) {
      throw new Error(`HF API error: ${error.response?.data?.error || error.message}`);
    }
  }

  async featureExtraction(params) {
    const { text, model = 'sentence-transformers/all-MiniLM-L6-v2' } = params;

    try {
      const response = await axios.post(
        `${this.baseUrl}/models/${model}`,
        { inputs: text },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          embeddings: response.data,
          model
        }
      };
    } catch (error) {
      throw new Error(`HF API error: ${error.response?.data?.error || error.message}`);
    }
  }

  async textToSpeech(params) {
    const { text, model = 'facebook/fastspeech2-en-ljspeech' } = params;

    try {
      const response = await axios.post(
        `${this.baseUrl}/models/${model}`,
        { inputs: text },
        { 
          headers: this.getHeaders(),
          responseType: 'arraybuffer'
        }
      );

      const base64Audio = Buffer.from(response.data, 'binary').toString('base64');

      return {
        success: true,
        data: {
          audio: `data:audio/wav;base64,${base64Audio}`,
          model
        }
      };
    } catch (error) {
      throw new Error(`HF API error: ${error.response?.data?.error || error.message}`);
    }
  }

  async automaticSpeechRecognition(params) {
    const { audioUrl, model = 'openai/whisper-large-v3' } = params;

    try {
      const response = await axios.post(
        `${this.baseUrl}/models/${model}`,
        { inputs: audioUrl },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          text: response.data.text,
          model
        }
      };
    } catch (error) {
      throw new Error(`HF API error: ${error.response?.data?.error || error.message}`);
    }
  }

  async objectDetection(params) {
    const { imageUrl, model = 'facebook/detr-resnet-50' } = params;

    try {
      const response = await axios.post(
        `${this.baseUrl}/models/${model}`,
        { inputs: imageUrl },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          objects: response.data,
          model
        }
      };
    } catch (error) {
      throw new Error(`HF API error: ${error.response?.data?.error || error.message}`);
    }
  }
}

module.exports = HuggingFaceInferenceIntegration;
