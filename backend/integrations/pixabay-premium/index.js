const axios = require('axios');

/**
 * Pixabay Premium Integration
 * FREE API for 1.9+ million royalty-free stock photos, videos, and music
 * No attribution required, commercial use allowed
 */
class PixabayIntegration {
  constructor(apiKey) {
    this.apiKey = apiKey || 'YOUR_FREE_PIXABAY_API_KEY';
    this.baseURL = 'https://pixabay.com/api';
  }

  /**
   * Search Images
   * @param {string} query - Search term
   * @param {number} perPage - Results per page (3-200)
   * @param {number} page - Page number
   * @param {string} imageType - all, photo, illustration, vector
   * @param {string} orientation - all, horizontal, vertical
   * @param {string} category - backgrounds, fashion, nature, science, education, feelings, health, people, religion, places, animals, industry, computer, food, sports, transportation, travel, buildings, business, music
   * @param {string} colors - grayscale, transparent, red, orange, yellow, green, turquoise, blue, lilac, pink, white, gray, black, brown
   * @param {boolean} safesearch - Enable safe search
   */
  async searchImages(query, perPage = 20, page = 1, imageType = 'all', orientation = 'all', category = null, colors = null, safesearch = true) {
    try {
      const params = {
        key: this.apiKey,
        q: query,
        per_page: perPage,
        page,
        image_type: imageType,
        orientation,
        safesearch,
        ...(category && { category }),
        ...(colors && { colors })
      };

      const response = await axios.get(`${this.baseURL}/`, { params });

      return {
        success: true,
        data: response.data,
        images: response.data.hits,
        total: response.data.totalHits,
        page,
        perPage
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Search Videos
   * @param {string} query - Search term
   * @param {number} perPage - Results per page (3-200)
   * @param {number} page - Page number
   * @param {string} videoType - all, film, animation
   * @param {string} category - Same as images
   */
  async searchVideos(query, perPage = 20, page = 1, videoType = 'all', category = null) {
    try {
      const params = {
        key: this.apiKey,
        q: query,
        per_page: perPage,
        page,
        video_type: videoType,
        ...(category && { category })
      };

      const response = await axios.get(`${this.baseURL}/videos/`, { params });

      return {
        success: true,
        data: response.data,
        videos: response.data.hits,
        total: response.data.totalHits,
        page,
        perPage
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get Image by ID
   */
  async getImageById(imageId) {
    try {
      const params = {
        key: this.apiKey,
        id: imageId
      };

      const response = await axios.get(`${this.baseURL}/`, { params });

      return {
        success: true,
        data: response.data,
        image: response.data.hits[0]
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get Popular Images
   */
  async getPopularImages(perPage = 20, page = 1, category = null) {
    try {
      const params = {
        key: this.apiKey,
        per_page: perPage,
        page,
        order: 'popular',
        ...(category && { category })
      };

      const response = await axios.get(`${this.baseURL}/`, { params });

      return {
        success: true,
        data: response.data,
        images: response.data.hits,
        total: response.data.totalHits
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get Latest Images
   */
  async getLatestImages(perPage = 20, page = 1, category = null) {
    try {
      const params = {
        key: this.apiKey,
        per_page: perPage,
        page,
        order: 'latest',
        ...(category && { category })
      };

      const response = await axios.get(`${this.baseURL}/`, { params });

      return {
        success: true,
        data: response.data,
        images: response.data.hits,
        total: response.data.totalHits
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Search by Editor's Choice
   */
  async getEditorsChoice(perPage = 20, page = 1, category = null) {
    try {
      const params = {
        key: this.apiKey,
        per_page: perPage,
        page,
        editors_choice: true,
        ...(category && { category })
      };

      const response = await axios.get(`${this.baseURL}/`, { params });

      return {
        success: true,
        data: response.data,
        images: response.data.hits,
        total: response.data.totalHits
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Search High Resolution Images
   */
  async searchHighResImages(query, perPage = 20, page = 1, minWidth = 1920, minHeight = 1080) {
    try {
      const params = {
        key: this.apiKey,
        q: query,
        per_page: perPage,
        page,
        min_width: minWidth,
        min_height: minHeight
      };

      const response = await axios.get(`${this.baseURL}/`, { params });

      return {
        success: true,
        data: response.data,
        images: response.data.hits,
        total: response.data.totalHits
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get Images by Color
   */
  async getImagesByColor(color, perPage = 20, page = 1) {
    try {
      const params = {
        key: this.apiKey,
        per_page: perPage,
        page,
        colors: color
      };

      const response = await axios.get(`${this.baseURL}/`, { params });

      return {
        success: true,
        data: response.data,
        images: response.data.hits,
        total: response.data.totalHits,
        color
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get Images by Category
   */
  async getImagesByCategory(category, perPage = 20, page = 1) {
    try {
      const params = {
        key: this.apiKey,
        per_page: perPage,
        page,
        category
      };

      const response = await axios.get(`${this.baseURL}/`, { params });

      return {
        success: true,
        data: response.data,
        images: response.data.hits,
        total: response.data.totalHits,
        category
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = PixabayIntegration;
