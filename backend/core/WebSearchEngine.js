/**
 * WebSearchEngine - Comprehensive Web Search Integration
 * Supports 10+ search providers with intelligent routing
 * - Google Search
 * - Bing Search
 * - DuckDuckGo
 * - Brave Search
 * - Perplexity AI
 * - You.com
 * - Serper API
 * - SerpAPI
 * - ScaleSerp
 * - ValueSerp
 */

const axios = require('axios');
const cheerio = require('cheerio');

class WebSearchEngine {
  constructor() {
    this.providers = this.initializeProviders();
    this.cache = new Map();
    this.rateLimits = new Map();
    this.searchHistory = [];
  }

  /**
   * Initialize search providers
   */
  initializeProviders() {
    return {
      google: {
        name: 'Google Search',
        endpoint: 'https://www.googleapis.com/customsearch/v1',
        apiKey: process.env.GOOGLE_SEARCH_API_KEY,
        searchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID,
        rateLimit: 100, // per day
        features: ['web', 'images', 'news', 'videos']
      },
      bing: {
        name: 'Bing Search',
        endpoint: 'https://api.bing.microsoft.com/v7.0/search',
        apiKey: process.env.BING_SEARCH_API_KEY,
        rateLimit: 1000,
        features: ['web', 'images', 'news', 'videos']
      },
      duckduckgo: {
        name: 'DuckDuckGo',
        endpoint: 'https://api.duckduckgo.com/',
        apiKey: null, // No API key needed
        rateLimit: 1000,
        features: ['web', 'instant']
      },
      brave: {
        name: 'Brave Search',
        endpoint: 'https://api.search.brave.com/res/v1/web/search',
        apiKey: process.env.BRAVE_SEARCH_API_KEY,
        rateLimit: 2000,
        features: ['web', 'news', 'images']
      },
      perplexity: {
        name: 'Perplexity AI',
        endpoint: 'https://api.perplexity.ai/search',
        apiKey: process.env.PERPLEXITY_API_KEY,
        rateLimit: 500,
        features: ['ai-powered', 'citations', 'real-time']
      },
      youcom: {
        name: 'You.com',
        endpoint: 'https://api.you.com/search',
        apiKey: process.env.YOUCOM_API_KEY,
        rateLimit: 1000,
        features: ['web', 'ai-chat', 'code']
      },
      serper: {
        name: 'Serper API',
        endpoint: 'https://google.serper.dev/search',
        apiKey: process.env.SERPER_API_KEY,
        rateLimit: 2500,
        features: ['google-results', 'fast', 'reliable']
      },
      serpapi: {
        name: 'SerpAPI',
        endpoint: 'https://serpapi.com/search',
        apiKey: process.env.SERPAPI_KEY,
        rateLimit: 5000,
        features: ['multi-engine', 'structured-data']
      },
      scaleserp: {
        name: 'ScaleSerp',
        endpoint: 'https://api.scaleserp.com/search',
        apiKey: process.env.SCALESERP_API_KEY,
        rateLimit: 10000,
        features: ['scalable', 'fast']
      },
      valueserp: {
        name: 'ValueSerp',
        endpoint: 'https://api.valueserp.com/search',
        apiKey: process.env.VALUESERP_API_KEY,
        rateLimit: 10000,
        features: ['affordable', 'reliable']
      }
    };
  }

  /**
   * Universal search - automatically selects best provider
   */
  async search(query, options = {}) {
    const {
      provider = 'auto',
      type = 'web',
      limit = 10,
      offset = 0,
      language = 'en',
      country = 'us',
      safeSearch = true,
      freshness = null, // 'day', 'week', 'month'
      includeImages = false,
      includeVideos = false,
      includeNews = false
    } = options;

    console.log(`[WebSearchEngine] Searching: "${query}" with ${provider}`);

    try {
      // Check cache
      const cacheKey = this.generateCacheKey(query, options);
      if (this.cache.has(cacheKey)) {
        console.log('[WebSearchEngine] Returning cached results');
        return this.cache.get(cacheKey);
      }

      // Select provider
      const selectedProvider = provider === 'auto' 
        ? await this.selectBestProvider(query, type)
        : provider;

      // Execute search
      const results = await this.executeSearch(selectedProvider, query, options);

      // Enhance results
      const enhanced = await this.enhanceResults(results, options);

      // Cache results
      this.cache.set(cacheKey, enhanced);

      // Record search
      this.recordSearch(query, selectedProvider, enhanced);

      return enhanced;

    } catch (error) {
      console.error('[WebSearchEngine] Search failed:', error);
      
      // Fallback to alternative provider
      if (provider !== 'duckduckgo') {
        console.log('[WebSearchEngine] Trying fallback provider');
        return await this.search(query, { ...options, provider: 'duckduckgo' });
      }

      throw error;
    }
  }

  /**
   * Execute search with specific provider
   */
  async executeSearch(provider, query, options) {
    const providerConfig = this.providers[provider];
    if (!providerConfig) {
      throw new Error(`Unknown provider: ${provider}`);
    }

    // Check rate limit
    if (!this.checkRateLimit(provider)) {
      throw new Error(`Rate limit exceeded for ${provider}`);
    }

    switch (provider) {
      case 'google':
        return await this.searchGoogle(query, options);
      case 'bing':
        return await this.searchBing(query, options);
      case 'duckduckgo':
        return await this.searchDuckDuckGo(query, options);
      case 'brave':
        return await this.searchBrave(query, options);
      case 'perplexity':
        return await this.searchPerplexity(query, options);
      case 'youcom':
        return await this.searchYouCom(query, options);
      case 'serper':
        return await this.searchSerper(query, options);
      case 'serpapi':
        return await this.searchSerpAPI(query, options);
      case 'scaleserp':
        return await this.searchScaleSerp(query, options);
      case 'valueserp':
        return await this.searchValueSerp(query, options);
      default:
        throw new Error(`Provider not implemented: ${provider}`);
    }
  }

  /**
   * Google Search implementation
   */
  async searchGoogle(query, options) {
    const config = this.providers.google;
    
    try {
      const response = await axios.get(config.endpoint, {
        params: {
          key: config.apiKey,
          cx: config.searchEngineId,
          q: query,
          num: options.limit || 10,
          start: options.offset || 0,
          lr: `lang_${options.language || 'en'}`,
          gl: options.country || 'us',
          safe: options.safeSearch ? 'active' : 'off'
        }
      });

      return this.normalizeResults(response.data, 'google');
    } catch (error) {
      console.error('[WebSearchEngine] Google search failed:', error.message);
      throw error;
    }
  }

  /**
   * Bing Search implementation
   */
  async searchBing(query, options) {
    const config = this.providers.bing;

    try {
      const response = await axios.get(config.endpoint, {
        headers: {
          'Ocp-Apim-Subscription-Key': config.apiKey
        },
        params: {
          q: query,
          count: options.limit || 10,
          offset: options.offset || 0,
          mkt: `${options.language || 'en'}-${options.country || 'US'}`,
          safeSearch: options.safeSearch ? 'Strict' : 'Off',
          freshness: options.freshness
        }
      });

      return this.normalizeResults(response.data, 'bing');
    } catch (error) {
      console.error('[WebSearchEngine] Bing search failed:', error.message);
      throw error;
    }
  }

  /**
   * DuckDuckGo Search implementation
   */
  async searchDuckDuckGo(query, options) {
    try {
      // DuckDuckGo Instant Answer API
      const response = await axios.get('https://api.duckduckgo.com/', {
        params: {
          q: query,
          format: 'json',
          no_html: 1,
          skip_disambig: 1
        }
      });

      // Also scrape HTML results for more comprehensive data
      const htmlResults = await this.scrapeDuckDuckGo(query, options);

      return this.normalizeResults({
        instant: response.data,
        web: htmlResults
      }, 'duckduckgo');
    } catch (error) {
      console.error('[WebSearchEngine] DuckDuckGo search failed:', error.message);
      throw error;
    }
  }

  /**
   * Brave Search implementation
   */
  async searchBrave(query, options) {
    const config = this.providers.brave;

    try {
      const response = await axios.get(config.endpoint, {
        headers: {
          'X-Subscription-Token': config.apiKey,
          'Accept': 'application/json'
        },
        params: {
          q: query,
          count: options.limit || 10,
          offset: options.offset || 0,
          country: options.country || 'us',
          search_lang: options.language || 'en',
          safesearch: options.safeSearch ? 'strict' : 'off',
          freshness: options.freshness
        }
      });

      return this.normalizeResults(response.data, 'brave');
    } catch (error) {
      console.error('[WebSearchEngine] Brave search failed:', error.message);
      throw error;
    }
  }

  /**
   * Perplexity AI Search implementation
   */
  async searchPerplexity(query, options) {
    const config = this.providers.perplexity;

    try {
      const response = await axios.post(
        'https://api.perplexity.ai/chat/completions',
        {
          model: 'sonar-pro',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful search assistant. Provide accurate, cited information.'
            },
            {
              role: 'user',
              content: query
            }
          ],
          search_domain_filter: options.domains || [],
          search_recency_filter: options.freshness || 'month'
        },
        {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return this.normalizeResults(response.data, 'perplexity');
    } catch (error) {
      console.error('[WebSearchEngine] Perplexity search failed:', error.message);
      throw error;
    }
  }

  /**
   * You.com Search implementation
   */
  async searchYouCom(query, options) {
    const config = this.providers.youcom;

    try {
      const response = await axios.get(config.endpoint, {
        headers: {
          'X-API-Key': config.apiKey
        },
        params: {
          query,
          num_web_results: options.limit || 10,
          safesearch: options.safeSearch ? 'strict' : 'off'
        }
      });

      return this.normalizeResults(response.data, 'youcom');
    } catch (error) {
      console.error('[WebSearchEngine] You.com search failed:', error.message);
      throw error;
    }
  }

  /**
   * Serper API implementation
   */
  async searchSerper(query, options) {
    const config = this.providers.serper;

    try {
      const response = await axios.post(
        config.endpoint,
        {
          q: query,
          num: options.limit || 10,
          gl: options.country || 'us',
          hl: options.language || 'en',
          autocorrect: true,
          page: Math.floor((options.offset || 0) / 10) + 1
        },
        {
          headers: {
            'X-API-KEY': config.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return this.normalizeResults(response.data, 'serper');
    } catch (error) {
      console.error('[WebSearchEngine] Serper search failed:', error.message);
      throw error;
    }
  }

  /**
   * SerpAPI implementation
   */
  async searchSerpAPI(query, options) {
    const config = this.providers.serpapi;

    try {
      const response = await axios.get(config.endpoint, {
        params: {
          api_key: config.apiKey,
          q: query,
          engine: 'google',
          num: options.limit || 10,
          start: options.offset || 0,
          gl: options.country || 'us',
          hl: options.language || 'en',
          safe: options.safeSearch ? 'active' : 'off'
        }
      });

      return this.normalizeResults(response.data, 'serpapi');
    } catch (error) {
      console.error('[WebSearchEngine] SerpAPI search failed:', error.message);
      throw error;
    }
  }

  /**
   * ScaleSerp implementation
   */
  async searchScaleSerp(query, options) {
    const config = this.providers.scaleserp;

    try {
      const response = await axios.get(config.endpoint, {
        params: {
          api_key: config.apiKey,
          q: query,
          num: options.limit || 10,
          start: options.offset || 0,
          gl: options.country || 'us',
          hl: options.language || 'en'
        }
      });

      return this.normalizeResults(response.data, 'scaleserp');
    } catch (error) {
      console.error('[WebSearchEngine] ScaleSerp search failed:', error.message);
      throw error;
    }
  }

  /**
   * ValueSerp implementation
   */
  async searchValueSerp(query, options) {
    const config = this.providers.valueserp;

    try {
      const response = await axios.get(config.endpoint, {
        params: {
          api_key: config.apiKey,
          q: query,
          num: options.limit || 10,
          start: options.offset || 0,
          gl: options.country || 'us',
          hl: options.language || 'en',
          google_domain: 'google.com'
        }
      });

      return this.normalizeResults(response.data, 'valueserp');
    } catch (error) {
      console.error('[WebSearchEngine] ValueSerp search failed:', error.message);
      throw error;
    }
  }

  /**
   * Scrape DuckDuckGo HTML results
   */
  async scrapeDuckDuckGo(query, options) {
    try {
      const response = await axios.get('https://html.duckduckgo.com/html/', {
        params: { q: query },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      const results = [];

      $('.result').each((i, elem) => {
        if (i >= (options.limit || 10)) return false;

        const title = $(elem).find('.result__title').text().trim();
        const url = $(elem).find('.result__url').attr('href');
        const snippet = $(elem).find('.result__snippet').text().trim();

        if (title && url) {
          results.push({ title, url, snippet });
        }
      });

      return results;
    } catch (error) {
      console.error('[WebSearchEngine] DuckDuckGo scraping failed:', error.message);
      return [];
    }
  }

  /**
   * Normalize results from different providers
   */
  normalizeResults(data, provider) {
    const normalized = {
      provider,
      query: '',
      totalResults: 0,
      results: [],
      images: [],
      videos: [],
      news: [],
      relatedSearches: [],
      answerBox: null,
      knowledgeGraph: null
    };

    switch (provider) {
      case 'google':
        normalized.query = data.queries?.request?.[0]?.searchTerms || '';
        normalized.totalResults = parseInt(data.searchInformation?.totalResults || 0);
        normalized.results = (data.items || []).map(item => ({
          title: item.title,
          url: item.link,
          snippet: item.snippet,
          displayUrl: item.displayLink
        }));
        break;

      case 'bing':
        normalized.query = data.queryContext?.originalQuery || '';
        normalized.totalResults = data.webPages?.totalEstimatedMatches || 0;
        normalized.results = (data.webPages?.value || []).map(item => ({
          title: item.name,
          url: item.url,
          snippet: item.snippet,
          displayUrl: item.displayUrl
        }));
        break;

      case 'duckduckgo':
        if (data.instant) {
          normalized.answerBox = {
            answer: data.instant.AbstractText,
            source: data.instant.AbstractSource,
            url: data.instant.AbstractURL
          };
        }
        normalized.results = (data.web || []).map(item => ({
          title: item.title,
          url: item.url,
          snippet: item.snippet
        }));
        break;

      case 'brave':
        normalized.query = data.query?.original || '';
        normalized.totalResults = data.web?.results?.length || 0;
        normalized.results = (data.web?.results || []).map(item => ({
          title: item.title,
          url: item.url,
          snippet: item.description,
          displayUrl: item.url
        }));
        break;

      case 'perplexity':
        const content = data.choices?.[0]?.message?.content || '';
        normalized.answerBox = {
          answer: content,
          citations: data.citations || []
        };
        break;

      case 'serper':
      case 'serpapi':
      case 'scaleserp':
      case 'valueserp':
        normalized.query = data.searchParameters?.q || '';
        normalized.totalResults = data.searchInformation?.totalResults || 0;
        normalized.results = (data.organic || []).map(item => ({
          title: item.title,
          url: item.link,
          snippet: item.snippet,
          displayUrl: item.displayedLink || item.link,
          position: item.position
        }));
        
        if (data.answerBox) {
          normalized.answerBox = data.answerBox;
        }
        
        if (data.knowledgeGraph) {
          normalized.knowledgeGraph = data.knowledgeGraph;
        }
        
        normalized.relatedSearches = data.relatedSearches || [];
        break;
    }

    return normalized;
  }

  /**
   * Enhance results with additional data
   */
  async enhanceResults(results, options) {
    // Add metadata
    results.timestamp = new Date();
    results.enhanced = true;

    // Extract domains
    results.domains = [...new Set(results.results.map(r => {
      try {
        return new URL(r.url).hostname;
      } catch {
        return null;
      }
    }).filter(Boolean))];

    // Calculate relevance scores
    results.results = results.results.map((result, index) => ({
      ...result,
      relevanceScore: this.calculateRelevance(result, results.query, index),
      position: index + 1
    }));

    // Sort by relevance if requested
    if (options.sortByRelevance) {
      results.results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    return results;
  }

  /**
   * Calculate relevance score
   */
  calculateRelevance(result, query, position) {
    let score = 100 - position; // Base score from position

    // Boost if query terms in title
    const queryTerms = query.toLowerCase().split(' ');
    const titleLower = result.title.toLowerCase();
    const matchingTerms = queryTerms.filter(term => titleLower.includes(term));
    score += matchingTerms.length * 10;

    // Boost for HTTPS
    if (result.url.startsWith('https://')) {
      score += 5;
    }

    // Boost for common domains
    const trustedDomains = ['wikipedia.org', 'github.com', 'stackoverflow.com'];
    if (trustedDomains.some(domain => result.url.includes(domain))) {
      score += 15;
    }

    return Math.min(100, score);
  }

  /**
   * Select best provider based on query
   */
  async selectBestProvider(query, type) {
    // Check which providers are available
    const available = Object.entries(this.providers)
      .filter(([name, config]) => {
        if (!config.apiKey && name !== 'duckduckgo') return false;
        return this.checkRateLimit(name);
      })
      .map(([name]) => name);

    if (available.length === 0) {
      return 'duckduckgo'; // Fallback
    }

    // Prefer providers based on query type
    if (type === 'ai-powered' && available.includes('perplexity')) {
      return 'perplexity';
    }

    if (available.includes('serper')) {
      return 'serper'; // Fast and reliable
    }

    if (available.includes('brave')) {
      return 'brave'; // Privacy-focused
    }

    return available[0];
  }

  /**
   * Check rate limit
   */
  checkRateLimit(provider) {
    const now = Date.now();
    const limit = this.rateLimits.get(provider) || { count: 0, resetAt: now };

    if (now > limit.resetAt) {
      // Reset counter
      this.rateLimits.set(provider, { count: 1, resetAt: now + 86400000 }); // 24 hours
      return true;
    }

    if (limit.count >= this.providers[provider].rateLimit) {
      return false;
    }

    limit.count++;
    this.rateLimits.set(provider, limit);
    return true;
  }

  /**
   * Generate cache key
   */
  generateCacheKey(query, options) {
    return `${query}:${options.provider || 'auto'}:${options.limit || 10}:${options.offset || 0}`;
  }

  /**
   * Record search
   */
  recordSearch(query, provider, results) {
    this.searchHistory.push({
      query,
      provider,
      timestamp: new Date(),
      resultCount: results.results.length,
      totalResults: results.totalResults
    });

    // Keep only last 1000 searches
    if (this.searchHistory.length > 1000) {
      this.searchHistory.shift();
    }
  }

  /**
   * Get search statistics
   */
  getStatistics() {
    const stats = {
      totalSearches: this.searchHistory.length,
      byProvider: {},
      cacheSize: this.cache.size,
      rateLimits: Object.fromEntries(this.rateLimits)
    };

    this.searchHistory.forEach(search => {
      stats.byProvider[search.provider] = (stats.byProvider[search.provider] || 0) + 1;
    });

    return stats;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    return { success: true, message: 'Cache cleared' };
  }
}

module.exports = WebSearchEngine;
