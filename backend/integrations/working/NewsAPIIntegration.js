/**
 * NEWS API INTEGRATION - FULLY WORKING
 * News articles integration
 * 
 * FREE TIER: 100 requests/day
 * Get API key: https://newsapi.org/register
 * 
 * Usage:
 *   const news = new NewsAPIIntegration({ apiKey: 'xxx' });
 *   const headlines = await news.getTopHeadlines('us');
 *   const articles = await news.searchNews('technology');
 */

const BaseIntegration = require('../core/BaseIntegration');

class NewsAPIIntegration extends BaseIntegration {
  constructor(config = {}) {
    super({
      name: 'newsapi',
      baseURL: 'https://newsapi.org/v2',
      ...config
    });
  }

  getDefaultHeaders() {
    return {
      'X-Api-Key': this.apiKey,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Get top headlines
   */
  async getTopHeadlines(country = 'us', category = null, pageSize = 20) {
    this.validateApiKey();
    
    const params = { country, pageSize };
    if (category) params.category = category;

    const response = await this.get('/top-headlines', params);

    return {
      success: true,
      totalResults: response.data.totalResults,
      articles: response.data.articles.map(article => ({
        title: article.title,
        description: article.description,
        author: article.author,
        source: article.source.name,
        url: article.url,
        imageUrl: article.urlToImage,
        publishedAt: article.publishedAt,
        content: article.content
      }))
    };
  }

  /**
   * Search news articles
   */
  async searchNews(query, sortBy = 'publishedAt', pageSize = 20) {
    this.validateApiKey();
    
    const response = await this.get('/everything', {
      q: query,
      sortBy,
      pageSize
    });

    return {
      success: true,
      totalResults: response.data.totalResults,
      articles: response.data.articles.map(article => ({
        title: article.title,
        description: article.description,
        author: article.author,
        source: article.source.name,
        url: article.url,
        imageUrl: article.urlToImage,
        publishedAt: article.publishedAt
      }))
    };
  }

  /**
   * Get news by category
   */
  async getNewsByCategory(category, country = 'us', pageSize = 20) {
    return this.getTopHeadlines(country, category, pageSize);
  }

  /**
   * Get news sources
   */
  async getSources(category = null, language = 'en', country = null) {
    this.validateApiKey();
    
    const params = { language };
    if (category) params.category = category;
    if (country) params.country = country;

    const response = await this.get('/top-headlines/sources', params);

    return {
      success: true,
      sources: response.data.sources.map(source => ({
        id: source.id,
        name: source.name,
        description: source.description,
        url: source.url,
        category: source.category,
        language: source.language,
        country: source.country
      }))
    };
  }

  /**
   * Get news from specific sources
   */
  async getNewsFromSources(sources, pageSize = 20) {
    this.validateApiKey();
    
    const response = await this.get('/top-headlines', {
      sources: Array.isArray(sources) ? sources.join(',') : sources,
      pageSize
    });

    return {
      success: true,
      articles: response.data.articles.map(article => ({
        title: article.title,
        description: article.description,
        source: article.source.name,
        url: article.url,
        imageUrl: article.urlToImage,
        publishedAt: article.publishedAt
      }))
    };
  }

  /**
   * Search news by date range
   */
  async searchNewsByDate(query, from, to, sortBy = 'publishedAt') {
    this.validateApiKey();
    
    const response = await this.get('/everything', {
      q: query,
      from,
      to,
      sortBy
    });

    return {
      success: true,
      totalResults: response.data.totalResults,
      articles: response.data.articles.map(article => ({
        title: article.title,
        description: article.description,
        source: article.source.name,
        url: article.url,
        publishedAt: article.publishedAt
      }))
    };
  }

  async testConnection() {
    try {
      await this.getTopHeadlines('us', null, 1);
      return { success: true, integration: this.name, message: 'Connection successful' };
    } catch (error) {
      return { success: false, integration: this.name, error: error.message };
    }
  }
}

module.exports = NewsAPIIntegration;
