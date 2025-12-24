/**
 * IMGUR INTEGRATION - FULLY WORKING
 * Image hosting integration
 * 
 * FREE TIER: 12,500 requests/day
 * Get client ID: https://api.imgur.com/oauth2/addclient
 * 
 * Usage:
 *   const imgur = new ImgurIntegration({ clientId: 'xxx' });
 *   const upload = await imgur.uploadImage(base64Image);
 *   const gallery = await imgur.getGallery('hot', 'viral');
 */

const BaseIntegration = require('../core/BaseIntegration');

class ImgurIntegration extends BaseIntegration {
  constructor(config = {}) {
    super({
      name: 'imgur',
      baseURL: 'https://api.imgur.com/3',
      ...config
    });
    this.clientId = config.clientId || this.apiKey;
  }

  getDefaultHeaders() {
    return {
      'Authorization': `Client-ID ${this.clientId}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Upload image
   */
  async uploadImage(image, title = null, description = null) {
    this.validateApiKey();
    
    const payload = { image };
    if (title) payload.title = title;
    if (description) payload.description = description;

    const response = await this.post('/image', payload);

    return {
      success: response.data.success,
      image: {
        id: response.data.data.id,
        link: response.data.data.link,
        deleteHash: response.data.data.deletehash,
        width: response.data.data.width,
        height: response.data.data.height,
        size: response.data.data.size,
        type: response.data.data.type
      }
    };
  }

  /**
   * Get image
   */
  async getImage(imageId) {
    this.validateApiKey();
    const response = await this.get(`/image/${imageId}`);

    return {
      success: response.data.success,
      image: {
        id: response.data.data.id,
        title: response.data.data.title,
        description: response.data.data.description,
        link: response.data.data.link,
        width: response.data.data.width,
        height: response.data.data.height,
        size: response.data.data.size,
        views: response.data.data.views,
        bandwidth: response.data.data.bandwidth
      }
    };
  }

  /**
   * Delete image
   */
  async deleteImage(deleteHash) {
    this.validateApiKey();
    const response = await this.delete(`/image/${deleteHash}`);

    return {
      success: response.data.success,
      message: 'Image deleted successfully'
    };
  }

  /**
   * Get gallery
   */
  async getGallery(section = 'hot', sort = 'viral', page = 0) {
    this.validateApiKey();
    const response = await this.get(`/gallery/${section}/${sort}/${page}`);

    return {
      success: response.data.success,
      images: response.data.data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        link: item.link,
        views: item.views,
        ups: item.ups,
        downs: item.downs,
        score: item.score,
        isAlbum: item.is_album
      }))
    };
  }

  /**
   * Search gallery
   */
  async searchGallery(query, sort = 'time', page = 0) {
    this.validateApiKey();
    const response = await this.get(`/gallery/search/${sort}/${page}`, { q: query });

    return {
      success: response.data.success,
      results: response.data.data.map(item => ({
        id: item.id,
        title: item.title,
        link: item.link,
        views: item.views,
        score: item.score
      }))
    };
  }

  /**
   * Create album
   */
  async createAlbum(images, title = null, description = null) {
    this.validateApiKey();
    
    const payload = { images };
    if (title) payload.title = title;
    if (description) payload.description = description;

    const response = await this.post('/album', payload);

    return {
      success: response.data.success,
      album: {
        id: response.data.data.id,
        deleteHash: response.data.data.deletehash
      }
    };
  }

  /**
   * Get album
   */
  async getAlbum(albumId) {
    this.validateApiKey();
    const response = await this.get(`/album/${albumId}`);

    return {
      success: response.data.success,
      album: {
        id: response.data.data.id,
        title: response.data.data.title,
        description: response.data.data.description,
        views: response.data.data.views,
        images: response.data.data.images
      }
    };
  }

  async testConnection() {
    try {
      await this.getGallery('hot', 'viral', 0);
      return { success: true, integration: this.name, message: 'Connection successful' };
    } catch (error) {
      return { success: false, integration: this.name, error: error.message };
    }
  }
}

module.exports = ImgurIntegration;
