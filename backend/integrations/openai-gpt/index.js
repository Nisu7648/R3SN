/**
 * OpenAI GPT Integration
 * Complete AI capabilities
 */

const OpenAI = require('openai');

class OpenAIIntegration {
  constructor(config) {
    this.apiKey = config.apiKey || process.env.OPENAI_API_KEY;
    if (!this.apiKey) throw new Error('OpenAI API key required');
    
    this.client = new OpenAI({ apiKey: this.apiKey });
  }

  async createChatCompletion(messages, model = 'gpt-4', options = {}) {
    try {
      const completion = await this.client.chat.completions.create({
        model,
        messages,
        ...options
      });
      
      return {
        success: true,
        response: completion.choices[0].message.content,
        usage: completion.usage,
        model: completion.model
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createCompletion(prompt, model = 'gpt-3.5-turbo-instruct', options = {}) {
    try {
      const completion = await this.client.completions.create({
        model,
        prompt,
        ...options
      });
      
      return {
        success: true,
        response: completion.choices[0].text,
        usage: completion.usage
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async generateImage(prompt, size = '1024x1024', n = 1) {
    try {
      const response = await this.client.images.generate({
        prompt,
        n,
        size
      });
      
      return {
        success: true,
        images: response.data.map(img => img.url)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async editImage(image, prompt, mask = null, size = '1024x1024') {
    try {
      const params = { image, prompt, size };
      if (mask) params.mask = mask;
      
      const response = await this.client.images.edit(params);
      
      return {
        success: true,
        images: response.data.map(img => img.url)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createImageVariation(image, n = 1, size = '1024x1024') {
    try {
      const response = await this.client.images.createVariation({
        image,
        n,
        size
      });
      
      return {
        success: true,
        images: response.data.map(img => img.url)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createEmbedding(input, model = 'text-embedding-ada-002') {
    try {
      const response = await this.client.embeddings.create({
        model,
        input
      });
      
      return {
        success: true,
        embeddings: response.data.map(d => d.embedding),
        usage: response.usage
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async transcribeAudio(file, options = {}) {
    try {
      const transcription = await this.client.audio.transcriptions.create({
        file,
        model: 'whisper-1',
        ...options
      });
      
      return {
        success: true,
        text: transcription.text
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async translateAudio(file, options = {}) {
    try {
      const translation = await this.client.audio.translations.create({
        file,
        model: 'whisper-1',
        ...options
      });
      
      return {
        success: true,
        text: translation.text
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createSpeech(text, voice = 'alloy', model = 'tts-1') {
    try {
      const mp3 = await this.client.audio.speech.create({
        model,
        voice,
        input: text
      });
      
      return {
        success: true,
        audio: mp3
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async moderateContent(input) {
    try {
      const moderation = await this.client.moderations.create({
        input
      });
      
      return {
        success: true,
        results: moderation.results[0]
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createFineTune(trainingFile, model = 'gpt-3.5-turbo') {
    try {
      const fineTune = await this.client.fineTuning.jobs.create({
        training_file: trainingFile,
        model
      });
      
      return {
        success: true,
        job: fineTune
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async listFineTunes() {
    try {
      const fineTunes = await this.client.fineTuning.jobs.list();
      
      return {
        success: true,
        jobs: fineTunes.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getFineTune(jobId) {
    try {
      const fineTune = await this.client.fineTuning.jobs.retrieve(jobId);
      
      return {
        success: true,
        job: fineTune
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async cancelFineTune(jobId) {
    try {
      const fineTune = await this.client.fineTuning.jobs.cancel(jobId);
      
      return {
        success: true,
        job: fineTune
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async listModels() {
    try {
      const models = await this.client.models.list();
      
      return {
        success: true,
        models: models.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getModel(modelId) {
    try {
      const model = await this.client.models.retrieve(modelId);
      
      return {
        success: true,
        model
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = OpenAIIntegration;
