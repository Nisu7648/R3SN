/**
 * UNSPLASH INTEGRATION - FULLY WORKING
 * This is a REAL implementation that makes actual API calls
 * 
 * FREE API: https://unsplash.com/developers
 * Sign up for free API key at: https://unsplash.com/oauth/applications
 * 
 * Usage:
 *   const unsplash = new UnsplashIntegration({ apiKey: 'your-key' });
 *   const photos = await unsplash.searchPhotos('nature', 10);
 *   const random = await unsplash.getRandomPhoto('landscape');
 */

const BaseIntegration = require('../core/BaseIntegration');

class UnsplashIntegration extends BaseIntegration {
  constructor(config = {}) {
    super({
      name: 'unsplash',
      baseURL: 'https://api.unsplash.com',
      ...config
    });
  }

  /**
   * Override default headers for Unsplash
   */
  getDefaultHeaders() {
    return {
      'Accept-Version': 'v1',
      'Authorization': `Client-ID ${this.apiKey}`
    };
  }

  /**
   * Search photos
   * @param {string} query - Search query
   * @param {number} perPage - Results per page (max 30)
   * @param {number} page - Page number
   * @returns {Promise<Object>} Search results
   */
  async searchPhotos(query, perPage = 10, page = 1) {
    this.validateApiKey();
    
    const response = await this.get('/search/photos', {
      query: query,
      per_page: Math.min(perPage, 30),
      page: page
    });

    return {
      success: true,
      total: response.data.total,
      totalPages: response.data.total_pages,
      results: response.data.results.map(photo => ({
        id: photo.id,
        description: photo.description || photo.alt_description,
        urls: {
          raw: photo.urls.raw,
          full: photo.urls.full,
          regular: photo.urls.regular,
          small: photo.urls.small,
          thumb: photo.urls.thumb
        },
        width: photo.width,
        height: photo.height,
        color: photo.color,
        likes: photo.likes,
        author: {
          name: photo.user.name,
          username: photo.user.username,
          portfolio: photo.user.portfolio_url
        },
        downloadUrl: photo.links.download
      }))
    };
  }

  /**
   * Get random photo
   * @param {string} query - Optional search query
   * @param {string} orientation - portrait, landscape, squarish
   * @returns {Promise<Object>} Random photo
   */
  async getRandomPhoto(query = null, orientation = null) {
    this.validateApiKey();
    
    const params = {};
    if (query) params.query = query;
    if (orientation) params.orientation = orientation;

    const response = await this.get('/photos/random', params);

    const photo = response.data;
    return {
      success: true,
      id: photo.id,
      description: photo.description || photo.alt_description,
      urls: {
        raw: photo.urls.raw,
        full: photo.urls.full,
        regular: photo.urls.regular,
        small: photo.urls.small,
        thumb: photo.urls.thumb
      },
      width: photo.width,
      height: photo.height,
      color: photo.color,
      likes: photo.likes,
      author: {
        name: photo.user.name,
        username: photo.user.username,
        portfolio: photo.user.portfolio_url
      },
      downloadUrl: photo.links.download
    };
  }

  /**
   * Get photo by ID
   * @param {string} photoId - Photo ID
   * @returns {Promise<Object>} Photo details
   */
  async getPhoto(photoId) {
    this.validateApiKey();
    
    const response = await this.get(`/photos/${photoId}`);
    const photo = response.data;

    return {
      success: true,
      id: photo.id,
      description: photo.description || photo.alt_description,
      urls: photo.urls,
      width: photo.width,
      height: photo.height,
      color: photo.color,
      likes: photo.likes,
      downloads: photo.downloads,
      views: photo.views,
      author: {
        name: photo.user.name,
        username: photo.user.username,
        bio: photo.user.bio,
        portfolio: photo.user.portfolio_url
      },
      location: photo.location,
      exif: photo.exif,
      tags: photo.tags?.map(tag => tag.title) || []
    };
  }

  /**
   * Get list of curated photos
   * @param {number} perPage - Results per page
   * @param {number} page - Page number
   * @returns {Promise<Object>} Curated photos
   */
  async getCuratedPhotos(perPage = 10, page = 1) {
    this.validateApiKey();
    
    const response = await this.get('/photos', {
      per_page: Math.min(perPage, 30),
      page: page
    });

    return {
      success: true,
      photos: response.data.map(photo => ({
        id: photo.id,
        description: photo.description || photo.alt_description,
        urls: photo.urls,
        author: {
          name: photo.user.name,
          username: photo.user.username
        },
        likes: photo.likes
      }))
    };
  }

  /**
   * Download photo (tracks download for Unsplash)
   * @param {string} photoId - Photo ID
   * @returns {Promise<Object>} Download URL
   */
  async trackDownload(photoId) {
    this.validateApiKey();
    
    const response = await this.get(`/photos/${photoId}/download`);

    return {
      success: true,
      url: response.data.url
    };
  }

  /**
   * Test connection
   */
  async testConnection() {
    try {
      await this.getRandomPhoto();
      return {
        success: true,
        integration: this.name,
        message: 'Connection successful'
      };
    } catch (error) {
      return {
        success: false,
        integration: this.name,
        error: error.message
      };
    }
  }
}

module.exports = UnsplashIntegration;
