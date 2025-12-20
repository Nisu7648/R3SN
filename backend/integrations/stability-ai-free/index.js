/**
 * Stability AI FREE Integration
 * FREE Image Generation with Stable Diffusion
 * Sign in to R3SN = Everything FREE!
 */

const axios = require('axios');

class StabilityAIFreeIntegration {
  constructor(config) {
    this.config = config;
    this.validateConfig();
    this.baseUrl = 'https://api.stability.ai/v1';
  }

  validateConfig() {
    if (!this.config.apiKey) {
      throw new Error('Stability AI API Key required (FREE at platform.stability.ai)');
    }
  }

  getHeaders() {
    return {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  async execute(action, params) {
    const actions = {
      textToImage: this.textToImage.bind(this),
      imageToImage: this.imageToImage.bind(this),
      upscale: this.upscale.bind(this),
      listEngines: this.listEngines.bind(this),
    };

    if (!actions[action]) {
      throw new Error(`Unknown action: ${action}`);
    }

    return await actions[action](params);
  }

  async textToImage(params) {
    const {
      prompt,
      negativePrompt = '',
      width = 512,
      height = 512,
      samples = 1,
      steps = 30,
      cfgScale = 7,
      engine = 'stable-diffusion-xl-1024-v1-0'
    } = params;

    try {
      const response = await axios.post(
        `${this.baseUrl}/generation/${engine}/text-to-image`,
        {
          text_prompts: [
            {
              text: prompt,
              weight: 1
            },
            ...(negativePrompt ? [{
              text: negativePrompt,
              weight: -1
            }] : [])
          ],
          cfg_scale: cfgScale,
          height,
          width,
          samples,
          steps
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          images: response.data.artifacts.map(artifact => ({
            base64: artifact.base64,
            seed: artifact.seed,
            finishReason: artifact.finishReason
          })),
          prompt,
          engine
        }
      };
    } catch (error) {
      throw new Error(`Stability AI error: ${error.response?.data?.message || error.message}`);
    }
  }

  async imageToImage(params) {
    const {
      initImage,
      prompt,
      strength = 0.5,
      steps = 30,
      cfgScale = 7,
      engine = 'stable-diffusion-xl-1024-v1-0'
    } = params;

    try {
      const formData = new FormData();
      formData.append('init_image', initImage);
      formData.append('text_prompts[0][text]', prompt);
      formData.append('text_prompts[0][weight]', '1');
      formData.append('cfg_scale', cfgScale.toString());
      formData.append('image_strength', strength.toString());
      formData.append('steps', steps.toString());

      const response = await axios.post(
        `${this.baseUrl}/generation/${engine}/image-to-image`,
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
        data: {
          images: response.data.artifacts.map(artifact => ({
            base64: artifact.base64,
            seed: artifact.seed
          })),
          engine
        }
      };
    } catch (error) {
      throw new Error(`Stability AI error: ${error.response?.data?.message || error.message}`);
    }
  }

  async upscale(params) {
    const { image, width, height, engine = 'esrgan-v1-x2plus' } = params;

    try {
      const formData = new FormData();
      formData.append('image', image);
      if (width) formData.append('width', width.toString());
      if (height) formData.append('height', height.toString());

      const response = await axios.post(
        `${this.baseUrl}/generation/${engine}/image-to-image/upscale`,
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
        data: {
          image: response.data.artifacts[0].base64,
          engine
        }
      };
    } catch (error) {
      throw new Error(`Stability AI error: ${error.response?.data?.message || error.message}`);
    }
  }

  async listEngines(params) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/engines/list`,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          engines: response.data.map(engine => ({
            id: engine.id,
            name: engine.name,
            description: engine.description,
            type: engine.type
          }))
        }
      };
    } catch (error) {
      throw new Error(`Stability AI error: ${error.response?.data?.message || error.message}`);
    }
  }
}

module.exports = StabilityAIFreeIntegration;
