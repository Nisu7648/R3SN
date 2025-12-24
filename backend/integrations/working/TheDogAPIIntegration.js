/**
 * THEDOGAPI INTEGRATION - FULLY WORKING
 * Dog images and breeds integration
 * 
 * FREE TIER: 10,000 requests/month
 * Get API key: https://thedogapi.com/signup
 * 
 * Usage:
 *   const dogs = new TheDogAPIIntegration({ apiKey: 'xxx' });
 *   const images = await dogs.searchImages(10);
 *   const breeds = await dogs.getAllBreeds();
 */

const BaseIntegration = require('../core/BaseIntegration');

class TheDogAPIIntegration extends BaseIntegration {
  constructor(config = {}) {
    super({
      name: 'thedogapi',
      baseURL: 'https://api.thedogapi.com/v1',
      ...config
    });
  }

  getDefaultHeaders() {
    return {
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Search dog images
   */
  async searchImages(limit = 10, breedId = null, size = 'med') {
    this.validateApiKey();
    
    const params = { limit, size };
    if (breedId) params.breed_id = breedId;

    const response = await this.get('/images/search', params);

    return {
      success: true,
      images: response.data.map(img => ({
        id: img.id,
        url: img.url,
        width: img.width,
        height: img.height,
        breeds: img.breeds
      }))
    };
  }

  /**
   * Get all breeds
   */
  async getAllBreeds() {
    this.validateApiKey();
    const response = await this.get('/breeds');

    return {
      success: true,
      breeds: response.data.map(breed => ({
        id: breed.id,
        name: breed.name,
        bredFor: breed.bred_for,
        breedGroup: breed.breed_group,
        lifeSpan: breed.life_span,
        temperament: breed.temperament,
        origin: breed.origin,
        weight: breed.weight,
        height: breed.height,
        image: breed.image?.url
      }))
    };
  }

  /**
   * Get breed by ID
   */
  async getBreedById(breedId) {
    this.validateApiKey();
    const response = await this.get(`/breeds/${breedId}`);

    const breed = response.data;
    return {
      success: true,
      breed: {
        id: breed.id,
        name: breed.name,
        bredFor: breed.bred_for,
        breedGroup: breed.breed_group,
        lifeSpan: breed.life_span,
        temperament: breed.temperament,
        origin: breed.origin,
        weight: breed.weight,
        height: breed.height
      }
    };
  }

  /**
   * Search breeds
   */
  async searchBreeds(query) {
    this.validateApiKey();
    const response = await this.get('/breeds/search', { q: query });

    return {
      success: true,
      breeds: response.data.map(breed => ({
        id: breed.id,
        name: breed.name,
        temperament: breed.temperament,
        origin: breed.origin
      }))
    };
  }

  /**
   * Get random dog image
   */
  async getRandomImage() {
    const result = await this.searchImages(1);
    return {
      success: true,
      image: result.images[0]
    };
  }

  /**
   * Get images by breed
   */
  async getImagesByBreed(breedId, limit = 10) {
    return this.searchImages(limit, breedId);
  }

  /**
   * Get image by ID
   */
  async getImageById(imageId) {
    this.validateApiKey();
    const response = await this.get(`/images/${imageId}`);

    return {
      success: true,
      image: {
        id: response.data.id,
        url: response.data.url,
        width: response.data.width,
        height: response.data.height,
        breeds: response.data.breeds
      }
    };
  }

  /**
   * Upload image
   */
  async uploadImage(file, subId = null) {
    this.validateApiKey();
    
    const formData = new FormData();
    formData.append('file', file);
    if (subId) formData.append('sub_id', subId);

    const response = await this.post('/images/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    return {
      success: response.data.approved === 1,
      imageId: response.data.id,
      url: response.data.url
    };
  }

  /**
   * Vote on image
   */
  async voteImage(imageId, value) {
    this.validateApiKey();
    
    const response = await this.post('/votes', {
      image_id: imageId,
      value: value // 1 for upvote, -1 for downvote
    });

    return {
      success: true,
      voteId: response.data.id,
      message: response.data.message
    };
  }

  /**
   * Favorite image
   */
  async favoriteImage(imageId) {
    this.validateApiKey();
    
    const response = await this.post('/favourites', {
      image_id: imageId
    });

    return {
      success: true,
      favoriteId: response.data.id
    };
  }

  async testConnection() {
    try {
      await this.searchImages(1);
      return { success: true, integration: this.name, message: 'Connection successful' };
    } catch (error) {
      return { success: false, integration: this.name, error: error.message };
    }
  }
}

module.exports = TheDogAPIIntegration;
