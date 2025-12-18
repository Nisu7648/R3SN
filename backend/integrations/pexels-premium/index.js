const axios = require('axios');

class PexelsIntegration {
  constructor(apiKey) {
    this.apiKey = apiKey || 'YOUR_FREE_PEXELS_API_KEY';
    this.baseURL = 'https://api.pexels.com/v1';
    this.videoURL = 'https://api.pexels.com/videos';
  }

  // Search Photos
  async searchPhotos(query, perPage = 15, page = 1, orientation = null, size = null, color = null) {
    try {
      const params = {
        query,
        per_page: perPage,
        page,
        ...(orientation && { orientation }),
        ...(size && { size }),
        ...(color && { color })
      };

      const response = await axios.get(`${this.baseURL}/search`, {
        headers: { Authorization: this.apiKey },
        params
      });

      return {
        success: true,
        data: response.data,
        photos: response.data.photos,
        total: response.data.total_results,
        page: response.data.page,
        per_page: response.data.per_page
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get Curated Photos
  async getCuratedPhotos(perPage = 15, page = 1) {
    try {
      const response = await axios.get(`${this.baseURL}/curated`, {
        headers: { Authorization: this.apiKey },
        params: { per_page: perPage, page }
      });

      return {
        success: true,
        data: response.data,
        photos: response.data.photos,
        page: response.data.page
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get Photo by ID
  async getPhotoById(id) {
    try {
      const response = await axios.get(`${this.baseURL}/photos/${id}`, {
        headers: { Authorization: this.apiKey }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Search Videos
  async searchVideos(query, perPage = 15, page = 1, orientation = null, size = null) {
    try {
      const params = {
        query,
        per_page: perPage,
        page,
        ...(orientation && { orientation }),
        ...(size && { size })
      };

      const response = await axios.get(`${this.videoURL}/search`, {
        headers: { Authorization: this.apiKey },
        params
      });

      return {
        success: true,
        data: response.data,
        videos: response.data.videos,
        total: response.data.total_results
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get Popular Videos
  async getPopularVideos(perPage = 15, page = 1) {
    try {
      const response = await axios.get(`${this.videoURL}/popular`, {
        headers: { Authorization: this.apiKey },
        params: { per_page: perPage, page }
      });

      return {
        success: true,
        data: response.data,
        videos: response.data.videos
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get Video by ID
  async getVideoById(id) {
    try {
      const response = await axios.get(`${this.videoURL}/videos/${id}`, {
        headers: { Authorization: this.apiKey }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get Collections
  async getCollections(perPage = 15, page = 1) {
    try {
      const response = await axios.get(`${this.baseURL}/collections`, {
        headers: { Authorization: this.apiKey },
        params: { per_page: perPage, page }
      });

      return {
        success: true,
        data: response.data,
        collections: response.data.collections
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get Collection Media
  async getCollectionMedia(id, type = 'photos', perPage = 15, page = 1) {
    try {
      const response = await axios.get(`${this.baseURL}/collections/${id}`, {
        headers: { Authorization: this.apiKey },
        params: { type, per_page: perPage, page }
      });

      return {
        success: true,
        data: response.data,
        media: response.data.media
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = PexelsIntegration;
