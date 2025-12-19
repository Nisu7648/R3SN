const axios = require('axios');

/**
 * SerpAPI Premium Integration
 * FREE Google Search Results API
 * 100 searches/month free tier
 */
class SerpAPIIntegration {
  constructor(apiKey) {
    this.apiKey = apiKey || 'YOUR_FREE_SERPAPI_KEY';
    this.baseURL = 'https://serpapi.com';
  }

  /**
   * Google Search
   * @param {string} query - Search query
   * @param {object} options - Additional options
   */
  async googleSearch(query, options = {}) {
    try {
      const params = {
        api_key: this.apiKey,
        q: query,
        engine: 'google',
        ...options
      };

      const response = await axios.get(`${this.baseURL}/search`, { params });

      return {
        success: true,
        data: response.data,
        organicResults: response.data.organic_results,
        answerBox: response.data.answer_box,
        knowledgeGraph: response.data.knowledge_graph,
        relatedSearches: response.data.related_searches
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Google Images Search
   */
  async googleImages(query, options = {}) {
    try {
      const params = {
        api_key: this.apiKey,
        q: query,
        engine: 'google_images',
        ...options
      };

      const response = await axios.get(`${this.baseURL}/search`, { params });

      return {
        success: true,
        data: response.data,
        images: response.data.images_results
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Google News Search
   */
  async googleNews(query, options = {}) {
    try {
      const params = {
        api_key: this.apiKey,
        q: query,
        engine: 'google_news',
        ...options
      };

      const response = await axios.get(`${this.baseURL}/search`, { params });

      return {
        success: true,
        data: response.data,
        news: response.data.news_results
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Google Shopping Search
   */
  async googleShopping(query, options = {}) {
    try {
      const params = {
        api_key: this.apiKey,
        q: query,
        engine: 'google_shopping',
        ...options
      };

      const response = await axios.get(`${this.baseURL}/search`, { params });

      return {
        success: true,
        data: response.data,
        products: response.data.shopping_results
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Google Maps Search
   */
  async googleMaps(query, options = {}) {
    try {
      const params = {
        api_key: this.apiKey,
        q: query,
        engine: 'google_maps',
        ...options
      };

      const response = await axios.get(`${this.baseURL}/search`, { params });

      return {
        success: true,
        data: response.data,
        places: response.data.local_results
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Google Jobs Search
   */
  async googleJobs(query, options = {}) {
    try {
      const params = {
        api_key: this.apiKey,
        q: query,
        engine: 'google_jobs',
        ...options
      };

      const response = await axios.get(`${this.baseURL}/search`, { params });

      return {
        success: true,
        data: response.data,
        jobs: response.data.jobs_results
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Google Scholar Search
   */
  async googleScholar(query, options = {}) {
    try {
      const params = {
        api_key: this.apiKey,
        q: query,
        engine: 'google_scholar',
        ...options
      };

      const response = await axios.get(`${this.baseURL}/search`, { params });

      return {
        success: true,
        data: response.data,
        articles: response.data.organic_results
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * YouTube Search
   */
  async youtubeSearch(query, options = {}) {
    try {
      const params = {
        api_key: this.apiKey,
        search_query: query,
        engine: 'youtube',
        ...options
      };

      const response = await axios.get(`${this.baseURL}/search`, { params });

      return {
        success: true,
        data: response.data,
        videos: response.data.video_results
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Bing Search
   */
  async bingSearch(query, options = {}) {
    try {
      const params = {
        api_key: this.apiKey,
        q: query,
        engine: 'bing',
        ...options
      };

      const response = await axios.get(`${this.baseURL}/search`, { params });

      return {
        success: true,
        data: response.data,
        results: response.data.organic_results
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * DuckDuckGo Search
   */
  async duckduckgoSearch(query, options = {}) {
    try {
      const params = {
        api_key: this.apiKey,
        q: query,
        engine: 'duckduckgo',
        ...options
      };

      const response = await axios.get(`${this.baseURL}/search`, { params });

      return {
        success: true,
        data: response.data,
        results: response.data.organic_results
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Baidu Search
   */
  async baiduSearch(query, options = {}) {
    try {
      const params = {
        api_key: this.apiKey,
        q: query,
        engine: 'baidu',
        ...options
      };

      const response = await axios.get(`${this.baseURL}/search`, { params });

      return {
        success: true,
        data: response.data,
        results: response.data.organic_results
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Yandex Search
   */
  async yandexSearch(query, options = {}) {
    try {
      const params = {
        api_key: this.apiKey,
        text: query,
        engine: 'yandex',
        ...options
      };

      const response = await axios.get(`${this.baseURL}/search`, { params });

      return {
        success: true,
        data: response.data,
        results: response.data.organic_results
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Google Trends
   */
  async googleTrends(query, options = {}) {
    try {
      const params = {
        api_key: this.apiKey,
        q: query,
        engine: 'google_trends',
        ...options
      };

      const response = await axios.get(`${this.baseURL}/search`, { params });

      return {
        success: true,
        data: response.data,
        trends: response.data.interest_over_time
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Google Autocomplete
   */
  async googleAutocomplete(query, options = {}) {
    try {
      const params = {
        api_key: this.apiKey,
        q: query,
        engine: 'google_autocomplete',
        ...options
      };

      const response = await axios.get(`${this.baseURL}/search`, { params });

      return {
        success: true,
        data: response.data,
        suggestions: response.data.suggestions
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Google Reverse Image Search
   */
  async googleReverseImage(imageUrl, options = {}) {
    try {
      const params = {
        api_key: this.apiKey,
        image_url: imageUrl,
        engine: 'google_reverse_image',
        ...options
      };

      const response = await axios.get(`${this.baseURL}/search`, { params });

      return {
        success: true,
        data: response.data,
        results: response.data.image_results
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get Account Info
   */
  async getAccountInfo() {
    try {
      const params = {
        api_key: this.apiKey
      };

      const response = await axios.get(`${this.baseURL}/account`, { params });

      return {
        success: true,
        data: response.data,
        searches: response.data.total_searches_left,
        plan: response.data.plan_name
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Advanced Google Search with Filters
   */
  async advancedGoogleSearch(query, filters = {}) {
    const {
      location,
      language,
      dateRange,
      fileType,
      site,
      num = 10
    } = filters;

    const options = {
      num,
      ...(location && { location }),
      ...(language && { hl: language }),
      ...(dateRange && { tbs: `qdr:${dateRange}` }),
      ...(fileType && { filetype: fileType }),
      ...(site && { site })
    };

    return await this.googleSearch(query, options);
  }

  /**
   * Get Related Searches
   */
  async getRelatedSearches(query) {
    const result = await this.googleSearch(query);

    if (result.success && result.relatedSearches) {
      return {
        success: true,
        query,
        relatedSearches: result.relatedSearches
      };
    }

    return { success: false, error: 'No related searches found' };
  }

  /**
   * Get Knowledge Graph
   */
  async getKnowledgeGraph(query) {
    const result = await this.googleSearch(query);

    if (result.success && result.knowledgeGraph) {
      return {
        success: true,
        query,
        knowledgeGraph: result.knowledgeGraph
      };
    }

    return { success: false, error: 'No knowledge graph found' };
  }
}

module.exports = SerpAPIIntegration;
