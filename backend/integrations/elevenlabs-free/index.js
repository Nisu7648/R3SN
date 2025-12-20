/**
 * ElevenLabs FREE Integration
 * FREE Voice Synthesis & Cloning
 * Sign in to R3SN = Everything FREE!
 */

const axios = require('axios');

class ElevenLabsFreeIntegration {
  constructor(config) {
    this.config = config;
    this.validateConfig();
    this.baseUrl = 'https://api.elevenlabs.io/v1';
  }

  validateConfig() {
    if (!this.config.apiKey) {
      throw new Error('ElevenLabs API Key required (FREE at elevenlabs.io)');
    }
  }

  getHeaders() {
    return {
      'xi-api-key': this.config.apiKey,
      'Content-Type': 'application/json'
    };
  }

  async execute(action, params) {
    const actions = {
      textToSpeech: this.textToSpeech.bind(this),
      getVoices: this.getVoices.bind(this),
      getVoice: this.getVoice.bind(this),
      getUserInfo: this.getUserInfo.bind(this),
      getHistory: this.getHistory.bind(this),
    };

    if (!actions[action]) {
      throw new Error(`Unknown action: ${action}`);
    }

    return await actions[action](params);
  }

  async textToSpeech(params) {
    const {
      text,
      voiceId = '21m00Tcm4TlvDq8ikWAM',
      modelId = 'eleven_monolingual_v1',
      stability = 0.5,
      similarityBoost = 0.5
    } = params;

    try {
      const response = await axios.post(
        `${this.baseUrl}/text-to-speech/${voiceId}`,
        {
          text,
          model_id: modelId,
          voice_settings: {
            stability,
            similarity_boost: similarityBoost
          }
        },
        {
          headers: this.getHeaders(),
          responseType: 'arraybuffer'
        }
      );

      const base64Audio = Buffer.from(response.data, 'binary').toString('base64');

      return {
        success: true,
        data: {
          audio: `data:audio/mpeg;base64,${base64Audio}`,
          voiceId,
          text
        }
      };
    } catch (error) {
      throw new Error(`ElevenLabs error: ${error.response?.data?.detail?.message || error.message}`);
    }
  }

  async getVoices(params) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/voices`,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          voices: response.data.voices.map(voice => ({
            voiceId: voice.voice_id,
            name: voice.name,
            category: voice.category,
            description: voice.description,
            previewUrl: voice.preview_url
          }))
        }
      };
    } catch (error) {
      throw new Error(`ElevenLabs error: ${error.response?.data?.detail?.message || error.message}`);
    }
  }

  async getVoice(params) {
    const { voiceId } = params;

    try {
      const response = await axios.get(
        `${this.baseUrl}/voices/${voiceId}`,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          voiceId: response.data.voice_id,
          name: response.data.name,
          category: response.data.category,
          description: response.data.description,
          settings: response.data.settings
        }
      };
    } catch (error) {
      throw new Error(`ElevenLabs error: ${error.response?.data?.detail?.message || error.message}`);
    }
  }

  async getUserInfo(params) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/user`,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          subscription: response.data.subscription,
          characterCount: response.data.character_count,
          characterLimit: response.data.character_limit
        }
      };
    } catch (error) {
      throw new Error(`ElevenLabs error: ${error.response?.data?.detail?.message || error.message}`);
    }
  }

  async getHistory(params) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/history`,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          history: response.data.history.map(item => ({
            historyItemId: item.history_item_id,
            text: item.text,
            voiceName: item.voice_name,
            dateUnix: item.date_unix
          }))
        }
      };
    } catch (error) {
      throw new Error(`ElevenLabs error: ${error.response?.data?.detail?.message || error.message}`);
    }
  }
}

module.exports = ElevenLabsFreeIntegration;
