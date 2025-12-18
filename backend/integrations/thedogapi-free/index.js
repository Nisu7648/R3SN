/**
 * The Dog API Free Integration
 * FREE dog images API - Free tier available
 */

const axios = require('axios');

class TheDogAPIFreeIntegration {
  constructor(config = {}) {
    this.config = config;
    this.baseUrl = 'https://api.thedogapi.com/v1';
  }

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.config.apiKey) {
      headers['x-api-key'] = this.config.apiKey;
    }
    return headers;
  }

  async execute(action, params) {
    const actions = {
      getRandomDogs: this.getRandomDogs.bind(this),
      searchByBreed: this.searchByBreed.bind(this),
      getAllBreeds: this.getAllBreeds.bind(this),
      getBreedInfo: this.getBreedInfo.bind(this),
    };

    if (!actions[action]) {
      throw new Error(`Unknown action: ${action}`);
    }

    return await actions[action](params);
  }

  async getRandomDogs(params) {
    const { limit = 10 } = params;

    try {
      const response = await axios.get(
        `${this.baseUrl}/images/search`,
        {
          headers: this.getHeaders(),
          params: { limit }
        }
      );

      return {
        success: true,
        data: {
          dogs: response.data.map(dog => ({
            id: dog.id,
            url: dog.url,
            width: dog.width,
            height: dog.height
          })),
          count: response.data.length
        }
      };
    } catch (error) {
      throw new Error(`The Dog API error: ${error.message}`);
    }
  }

  async searchByBreed(params) {
    const { breedId, limit = 10 } = params;
    
    if (!breedId) {
      throw new Error('Breed ID is required');
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/images/search`,
        {
          headers: this.getHeaders(),
          params: {
            breed_ids: breedId,
            limit
          }
        }
      );

      return {
        success: true,
        data: {
          dogs: response.data.map(dog => ({
            id: dog.id,
            url: dog.url,
            breeds: dog.breeds
          }))
        }
      };
    } catch (error) {
      throw new Error(`The Dog API error: ${error.message}`);
    }
  }

  async getAllBreeds(params) {
    const { limit = 20 } = params;

    try {
      const response = await axios.get(
        `${this.baseUrl}/breeds`,
        {
          headers: this.getHeaders(),
          params: { limit }
        }
      );

      return {
        success: true,
        data: {
          breeds: response.data.map(breed => ({
            id: breed.id,
            name: breed.name,
            temperament: breed.temperament,
            lifeSpan: breed.life_span,
            weight: breed.weight.metric,
            height: breed.height.metric
          })),
          count: response.data.length
        }
      };
    } catch (error) {
      throw new Error(`The Dog API error: ${error.message}`);
    }
  }

  async getBreedInfo(params) {
    const { breedId } = params;
    
    if (!breedId) {
      throw new Error('Breed ID is required');
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/breeds/${breedId}`,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          id: response.data.id,
          name: response.data.name,
          temperament: response.data.temperament,
          origin: response.data.origin,
          lifeSpan: response.data.life_span,
          weight: response.data.weight.metric,
          height: response.data.height.metric,
          bredFor: response.data.bred_for
        }
      };
    } catch (error) {
      throw new Error(`The Dog API error: ${error.message}`);
    }
  }
}

module.exports = TheDogAPIFreeIntegration;
