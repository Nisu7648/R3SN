const axios = require('axios');

/**
 * Mediastack Premium Integration
 * FREE news API with access to 7,500+ news sources worldwide
 * 500 requests/month free tier
 */
class MediastackIntegration {
  constructor(apiKey) {
    this.apiKey = apiKey || 'YOUR_FREE_MEDIASTACK_API_KEY';
    this.baseURL = 'http://api.mediastack.com/v1';
  }

  /**
   * Get Live News
   * @param {object} options - Query options
   */
  async getLiveNews(options = {}) {
    try {
      const params = {
        access_key: this.apiKey,
        ...options
      };

      const response = await axios.get(`${this.baseURL}/news`, { params });

      return {
        success: true,
        data: response.data,
        articles: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Search News by Keywords
   */
  async searchNews(keywords, limit = 25, offset = 0, languages = null, countries = null) {
    return await this.getLiveNews({
      keywords,
      limit,
      offset,
      ...(languages && { languages }),
      ...(countries && { countries })
    });
  }

  /**
   * Get News by Category
   */
  async getNewsByCategory(categories, limit = 25, offset = 0, countries = null) {
    return await this.getLiveNews({
      categories,
      limit,
      offset,
      ...(countries && { countries })
    });
  }

  /**
   * Get News by Country
   */
  async getNewsByCountry(countries, limit = 25, offset = 0, categories = null) {
    return await this.getLiveNews({
      countries,
      limit,
      offset,
      ...(categories && { categories })
    });
  }

  /**
   * Get News by Language
   */
  async getNewsByLanguage(languages, limit = 25, offset = 0) {
    return await this.getLiveNews({
      languages,
      limit,
      offset
    });
  }

  /**
   * Get News by Source
   */
  async getNewsBySource(sources, limit = 25, offset = 0) {
    return await this.getLiveNews({
      sources,
      limit,
      offset
    });
  }

  /**
   * Get News by Date Range
   */
  async getNewsByDateRange(dateFrom, dateTo, limit = 25, offset = 0) {
    return await this.getLiveNews({
      date: `${dateFrom},${dateTo}`,
      limit,
      offset,
      sort: 'published_desc'
    });
  }

  /**
   * Get Top Headlines
   */
  async getTopHeadlines(countries = null, categories = null, limit = 25) {
    return await this.getLiveNews({
      limit,
      sort: 'published_desc',
      ...(countries && { countries }),
      ...(categories && { categories })
    });
  }

  /**
   * Get Business News
   */
  async getBusinessNews(countries = null, limit = 25) {
    return await this.getNewsByCategory('business', limit, 0, countries);
  }

  /**
   * Get Technology News
   */
  async getTechnologyNews(countries = null, limit = 25) {
    return await this.getNewsByCategory('technology', limit, 0, countries);
  }

  /**
   * Get Sports News
   */
  async getSportsNews(countries = null, limit = 25) {
    return await this.getNewsByCategory('sports', limit, 0, countries);
  }

  /**
   * Get Entertainment News
   */
  async getEntertainmentNews(countries = null, limit = 25) {
    return await this.getNewsByCategory('entertainment', limit, 0, countries);
  }

  /**
   * Get Health News
   */
  async getHealthNews(countries = null, limit = 25) {
    return await this.getNewsByCategory('health', limit, 0, countries);
  }

  /**
   * Get Science News
   */
  async getScienceNews(countries = null, limit = 25) {
    return await this.getNewsByCategory('science', limit, 0, countries);
  }

  /**
   * Get News Sources
   */
  async getSources(countries = null, categories = null, languages = null) {
    try {
      const params = {
        access_key: this.apiKey,
        ...(countries && { countries }),
        ...(categories && { categories }),
        ...(languages && { languages })
      };

      const response = await axios.get(`${this.baseURL}/sources`, { params });

      return {
        success: true,
        data: response.data,
        sources: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Search with Multiple Filters
   */
  async advancedSearch(filters = {}) {
    const {
      keywords,
      categories,
      countries,
      languages,
      sources,
      dateFrom,
      dateTo,
      sort = 'published_desc',
      limit = 25,
      offset = 0
    } = filters;

    return await this.getLiveNews({
      ...(keywords && { keywords }),
      ...(categories && { categories }),
      ...(countries && { countries }),
      ...(languages && { languages }),
      ...(sources && { sources }),
      ...(dateFrom && dateTo && { date: `${dateFrom},${dateTo}` }),
      sort,
      limit,
      offset
    });
  }

  /**
   * Get Trending News
   */
  async getTrendingNews(limit = 25) {
    return await this.getLiveNews({
      limit,
      sort: 'popularity'
    });
  }

  /**
   * Get Latest News
   */
  async getLatestNews(limit = 25) {
    return await this.getLiveNews({
      limit,
      sort: 'published_desc'
    });
  }

  /**
   * Get News by Multiple Categories
   */
  async getMultiCategoryNews(categories, limit = 25) {
    return await this.getLiveNews({
      categories: categories.join(','),
      limit
    });
  }

  /**
   * Get News by Multiple Countries
   */
  async getMultiCountryNews(countries, limit = 25) {
    return await this.getLiveNews({
      countries: countries.join(','),
      limit
    });
  }

  /**
   * Get News Summary
   */
  async getNewsSummary(keywords, limit = 10) {
    const result = await this.searchNews(keywords, limit);

    if (result.success) {
      const summary = result.articles.map(article => ({
        title: article.title,
        source: article.source,
        publishedAt: article.published_at,
        url: article.url,
        category: article.category
      }));

      return {
        success: true,
        keyword: keywords,
        total: result.pagination.total,
        summary
      };
    }

    return result;
  }

  /**
   * Compare News Coverage
   */
  async compareNewsCoverage(keyword1, keyword2, limit = 10) {
    try {
      const news1 = await this.searchNews(keyword1, limit);
      const news2 = await this.searchNews(keyword2, limit);

      if (news1.success && news2.success) {
        return {
          success: true,
          comparison: {
            [keyword1]: {
              total: news1.pagination.total,
              articles: news1.articles.length
            },
            [keyword2]: {
              total: news2.pagination.total,
              articles: news2.articles.length
            }
          }
        };
      }

      return { success: false, error: 'Failed to fetch news for comparison' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = MediastackIntegration;
