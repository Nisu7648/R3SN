/**
 * Unsplash Free Integration
 * FREE high-quality images API - Free tier: 50 requests/hour
 */

const axios = require('axios');

class UnsplashFreeIntegration {
  constructor(config) {
    this.config = config;
    this.validateConfig();
    this.baseUrl = 'https://api.unsplash.com';
  }

  validateConfig() {
    if (!this.config.accessKey) {
      throw new Error('Unsplash Access Key is required (FREE at unsplash.com/developers)');
    }
  }

  getHeaders() {
    return {
      'Authorization': `Client-ID ${this.config.accessKey}`,
      'Content-Type': 'application/json'
    };
  }

  async execute(action, params) {
    const actions = {
      searchPhotos: this.searchPhotos.bind(this),
      getRandomPhoto: this.getRandomPhoto.bind(this),
      getPhoto: this.getPhoto.bind(this),
      listPhotos: this.listPhotos.bind(this),
      searchCollections: this.searchCollections.bind(this),
    };

    if (!actions[action]) {
      throw new Error(`Unknown action: ${action}`);
    }

    return await actions[action](params);
  }

  async searchPhotos(params) {
    const { query, page = 1, perPage = 10 } = params;
    
    if (!query) {
      throw new Error('Search query is required');
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/search/photos`,
        {
          headers: this.getHeaders(),
          params: {
            query,
            page,
            per_page: perPage
          }
        }
      );

      return {
        success: true,
        data: {
          total: response.data.total,
          photos: response.data.results.map(photo => ({
            id: photo.id,
            description: photo.description,
            altDescription: photo.alt_description,
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
            user: {
              name: photo.user.name,
              username: photo.user.username,
              profileImage: photo.user.profile_image.medium
            }
          }))
        }
      };
    } catch (error) {
      throw new Error(`Unsplash API error: ${error.response?.data?.errors?.[0] || error.message}`);
    }
  }

  async getRandomPhoto(params) {
    const { query, orientation, count = 1 } = params;

    try {
      const response = await axios.get(
        `${this.baseUrl}/photos/random`,
        {
          headers: this.getHeaders(),
          params: {
            ...(query && { query }),
            ...(orientation && { orientation }),
            count
          }
        }
      );

      const photos = Array.isArray(response.data) ? response.data : [response.data];

      return {
        success: true,
        data: {
          photos: photos.map(photo => ({
            id: photo.id,
            description: photo.description,
            altDescription: photo.alt_description,
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
            user: {
              name: photo.user.name,
              username: photo.user.username
            }
          }))
        }
      };
    } catch (error) {
      throw new Error(`Unsplash API error: ${error.response?.data?.errors?.[0] || error.message}`);
    }
  }

  async getPhoto(params) {
    const { photoId } = params;
    
    if (!photoId) {
      throw new Error('Photo ID is required');
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/photos/${photoId}`,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          id: response.data.id,
          description: response.data.description,
          altDescription: response.data.alt_description,
          urls: response.data.urls,
          width: response.data.width,
          height: response.data.height,
          color: response.data.color,
          likes: response.data.likes,
          downloads: response.data.downloads,
          views: response.data.views,
          user: {
            name: response.data.user.name,
            username: response.data.user.username,
            bio: response.data.user.bio
          }
        }
      };
    } catch (error) {
      throw new Error(`Unsplash API error: ${error.response?.data?.errors?.[0] || error.message}`);
    }
  }

  async listPhotos(params) {
    const { page = 1, perPage = 10, orderBy = 'latest' } = params;

    try {
      const response = await axios.get(
        `${this.baseUrl}/photos`,
        {
          headers: this.getHeaders(),
          params: {
            page,
            per_page: perPage,
            order_by: orderBy
          }
        }
      );

      return {
        success: true,
        data: {
          photos: response.data.map(photo => ({
            id: photo.id,
            description: photo.description,
            urls: {
              regular: photo.urls.regular,
              small: photo.urls.small,
              thumb: photo.urls.thumb
            },
            likes: photo.likes,
            user: {
              name: photo.user.name,
              username: photo.user.username
            }
          }))
        }
      };
    } catch (error) {
      throw new Error(`Unsplash API error: ${error.response?.data?.errors?.[0] || error.message}`);
    }
  }

  async searchCollections(params) {
    const { query, page = 1, perPage = 10 } = params;
    
    if (!query) {
      throw new Error('Search query is required');
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/search/collections`,
        {
          headers: this.getHeaders(),
          params: {
            query,
            page,
            per_page: perPage
          }
        }
      );

      return {
        success: true,
        data: {
          collections: response.data.results.map(collection => ({
            id: collection.id,
            title: collection.title,
            description: collection.description,
            totalPhotos: collection.total_photos,
            coverPhoto: {
              urls: collection.cover_photo.urls
            }
          }))
        }
      };
    } catch (error) {
      throw new Error(`Unsplash API error: ${error.response?.data?.errors?.[0] || error.message}`);
    }
  }
}

module.exports = UnsplashFreeIntegration;
