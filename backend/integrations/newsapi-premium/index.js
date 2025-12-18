const axios = require('axios');

class NewsAPIIntegration {
  constructor(apiKey) {
    this.apiKey = apiKey || 'YOUR_FREE_NEWSAPI_KEY';
    this.baseURL = 'https://newsapi.org/v2';
  }

  // Get Top Headlines
  async getTopHeadlines(country = 'us', category = null, sources = null, q = null, pageSize = 20, page = 1) {
    try {
      const params = {
        apiKey: this.apiKey,
        pageSize,
        page,
        ...(country && !sources && { country }),
        ...(category && { category }),
        ...(sources && { sources }),
        ...(q && { q })
      };

      const response = await axios.get(`${this.baseURL}/top-headlines`, { params });

      return {
        success: true,
        data: response.data,
        articles: response.data.articles,
        totalResults: response.data.totalResults
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Search Everything
  async searchEverything(q, searchIn = null, sources = null, domains = null, from = null, to = null, language = 'en', sortBy = 'publishedAt', pageSize = 20, page = 1) {
    try {
      const params = {
        q,
        apiKey: this.apiKey,
        pageSize,
        page,
        language,
        sortBy,
        ...(searchIn && { searchIn }),
        ...(sources && { sources }),
        ...(domains && { domains }),
        ...(from && { from }),
        ...(to && { to })
      };

      const response = await axios.get(`${this.baseURL}/everything`, { params });

      return {
        success: true,
        data: response.data,
        articles: response.data.articles,
        totalResults: response.data.totalResults
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get Sources
  async getSources(category = null, language = null, country = null) {
    try {
      const params = {
        apiKey: this.apiKey,
        ...(category && { category }),
        ...(language && { language }),
        ...(country && { country })
      };

      const response = await axios.get(`${this.baseURL}/top-headlines/sources`, { params });

      return {
        success: true,
        data: response.data,
        sources: response.data.sources
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get News by Category
  async getNewsByCategory(category, country = 'us', pageSize = 20, page = 1) {
    try {
      const params = {
        category,
        country,
        apiKey: this.apiKey,
        pageSize,
        page
      };

      const response = await axios.get(`${this.baseURL}/top-headlines`, { params });

      return {
        success: true,
        data: response.data,
        articles: response.data.articles,
        totalResults: response.data.totalResults
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get Business News
  async getBusinessNews(country = 'us', pageSize = 20, page = 1) {
    return this.getNewsByCategory('business', country, pageSize, page);
  }

  // Get Technology News
  async getTechnologyNews(country = 'us', pageSize = 20, page = 1) {
    return this.getNewsByCategory('technology', country, pageSize, page);
  }

  // Get Sports News
  async getSportsNews(country = 'us', pageSize = 20, page = 1) {
    return this.getNewsByCategory('sports', country, pageSize, page);
  }

  // Get Entertainment News
  async getEntertainmentNews(country = 'us', pageSize = 20, page = 1) {
    return this.getNewsByCategory('entertainment', country, pageSize, page);
  }

  // Get Health News
  async getHealthNews(country = 'us', pageSize = 20, page = 1) {
    return this.getNewsByCategory('health', country, pageSize, page);
  }

  // Get Science News
  async getScienceNews(country = 'us', pageSize = 20, page = 1) {
    return this.getNewsByCategory('science', country, pageSize, page);
  }
}

module.exports = NewsAPIIntegration;
