/**
 * GIPHY INTEGRATION - FULLY WORKING
 * GIF search and sharing integration
 * 
 * FREE TIER: 42 requests/hour
 * Get API key: https://developers.giphy.com/
 * 
 * Usage:
 *   const giphy = new GiphyIntegration({ apiKey: 'xxx' });
 *   const gifs = await giphy.searchGifs('funny cat');
 *   const trending = await giphy.getTrending();
 */

const BaseIntegration = require('../core/BaseIntegration');

class GiphyIntegration extends BaseIntegration {
  constructor(config = {}) {
    super({
      name: 'giphy',
      baseURL: 'https://api.giphy.com/v1',
      ...config
    });
  }

  /**
   * Search GIFs
   */
  async searchGifs(query, limit = 25, offset = 0, rating = 'g') {
    this.validateApiKey();
    
    const response = await this.get('/gifs/search', {
      api_key: this.apiKey,
      q: query,
      limit,
      offset,
      rating
    });

    return {
      success: true,
      total: response.data.pagination.total_count,
      gifs: response.data.data.map(gif => ({
        id: gif.id,
        title: gif.title,
        url: gif.url,
        images: {
          original: gif.images.original.url,
          downsized: gif.images.downsized.url,
          preview: gif.images.preview_gif.url,
          fixed_height: gif.images.fixed_height.url
        },
        rating: gif.rating,
        username: gif.username
      }))
    };
  }

  /**
   * Get trending GIFs
   */
  async getTrending(limit = 25, offset = 0, rating = 'g') {
    this.validateApiKey();
    
    const response = await this.get('/gifs/trending', {
      api_key: this.apiKey,
      limit,
      offset,
      rating
    });

    return {
      success: true,
      gifs: response.data.data.map(gif => ({
        id: gif.id,
        title: gif.title,
        url: gif.url,
        images: {
          original: gif.images.original.url,
          downsized: gif.images.downsized.url,
          preview: gif.images.preview_gif.url
        }
      }))
    };
  }

  /**
   * Get GIF by ID
   */
  async getGifById(gifId) {
    this.validateApiKey();
    
    const response = await this.get(`/gifs/${gifId}`, {
      api_key: this.apiKey
    });

    const gif = response.data.data;
    return {
      success: true,
      gif: {
        id: gif.id,
        title: gif.title,
        url: gif.url,
        images: gif.images,
        rating: gif.rating,
        username: gif.username,
        importDatetime: gif.import_datetime
      }
    };
  }

  /**
   * Get random GIF
   */
  async getRandomGif(tag = null, rating = 'g') {
    this.validateApiKey();
    
    const params = {
      api_key: this.apiKey,
      rating
    };
    if (tag) params.tag = tag;

    const response = await this.get('/gifs/random', params);

    const gif = response.data.data;
    return {
      success: true,
      gif: {
        id: gif.id,
        title: gif.title,
        url: gif.url,
        images: {
          original: gif.images.original.url,
          downsized: gif.images.downsized.url
        }
      }
    };
  }

  /**
   * Search stickers
   */
  async searchStickers(query, limit = 25, offset = 0) {
    this.validateApiKey();
    
    const response = await this.get('/stickers/search', {
      api_key: this.apiKey,
      q: query,
      limit,
      offset
    });

    return {
      success: true,
      stickers: response.data.data.map(sticker => ({
        id: sticker.id,
        title: sticker.title,
        url: sticker.url,
        images: {
          original: sticker.images.original.url,
          downsized: sticker.images.downsized.url
        }
      }))
    };
  }

  /**
   * Get trending stickers
   */
  async getTrendingStickers(limit = 25, offset = 0) {
    this.validateApiKey();
    
    const response = await this.get('/stickers/trending', {
      api_key: this.apiKey,
      limit,
      offset
    });

    return {
      success: true,
      stickers: response.data.data.map(sticker => ({
        id: sticker.id,
        title: sticker.title,
        url: sticker.url,
        images: {
          original: sticker.images.original.url
        }
      }))
    };
  }

  /**
   * Translate text to GIF
   */
  async translateToGif(text) {
    this.validateApiKey();
    
    const response = await this.get('/gifs/translate', {
      api_key: this.apiKey,
      s: text
    });

    const gif = response.data.data;
    return {
      success: true,
      gif: {
        id: gif.id,
        title: gif.title,
        url: gif.url,
        images: {
          original: gif.images.original.url,
          downsized: gif.images.downsized.url
        }
      }
    };
  }

  async testConnection() {
    try {
      await this.getTrending(1);
      return { success: true, integration: this.name, message: 'Connection successful' };
    } catch (error) {
      return { success: false, integration: this.name, error: error.message };
    }
  }
}

module.exports = GiphyIntegration;
