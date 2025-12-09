/**
 * Web Search Node - Unrestricted web search and scraping
 * Can access any website without restrictions
 */

const axios = require('axios');
const cheerio = require('cheerio');

class WebSearchNode {
  constructor() {
    this.type = 'web.search';
    this.name = 'Web Search';
    this.description = 'Search the web and scrape content from any website without restrictions';
    this.category = 'web';
    this.icon = '🌐';
    this.color = '#FF5722';

    this.inputs = [
      {
        name: 'query',
        type: 'string',
        required: false
      }
    ];

    this.outputs = [
      {
        name: 'results',
        type: 'array'
      },
      {
        name: 'content',
        type: 'string'
      }
    ];

    this.parameters = [
      {
        name: 'searchEngine',
        type: 'select',
        options: ['google', 'bing', 'duckduckgo', 'custom'],
        default: 'duckduckgo',
        description: 'Search engine to use'
      },
      {
        name: 'query',
        type: 'string',
        required: false,
        placeholder: 'Enter search query'
      },
      {
        name: 'url',
        type: 'string',
        required: false,
        placeholder: 'Direct URL to scrape (optional)'
      },
      {
        name: 'maxResults',
        type: 'number',
        default: 10,
        description: 'Maximum number of results'
      },
      {
        name: 'scrapeContent',
        type: 'boolean',
        default: true,
        description: 'Extract full page content'
      },
      {
        name: 'extractImages',
        type: 'boolean',
        default: false,
        description: 'Extract image URLs'
      },
      {
        name: 'extractLinks',
        type: 'boolean',
        default: false,
        description: 'Extract all links'
      },
      {
        name: 'selector',
        type: 'string',
        required: false,
        placeholder: 'CSS selector for specific content',
        description: 'Extract specific elements using CSS selector'
      },
      {
        name: 'userAgent',
        type: 'string',
        default: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        description: 'Custom user agent'
      },
      {
        name: 'timeout',
        type: 'number',
        default: 30000,
        description: 'Request timeout in milliseconds'
      },
      {
        name: 'followRedirects',
        type: 'boolean',
        default: true
      },
      {
        name: 'ignoreSSL',
        type: 'boolean',
        default: false,
        description: 'Ignore SSL certificate errors'
      }
    ];
  }

  /**
   * Execute the node
   */
  async execute(inputs, parameters, context) {
    const {
      searchEngine,
      query: paramQuery,
      url,
      maxResults,
      scrapeContent,
      extractImages,
      extractLinks,
      selector,
      userAgent,
      timeout,
      followRedirects,
      ignoreSSL
    } = parameters;

    const query = inputs.query || paramQuery;

    try {
      // Direct URL scraping
      if (url) {
        return await this.scrapeUrl(url, {
          scrapeContent,
          extractImages,
          extractLinks,
          selector,
          userAgent,
          timeout,
          followRedirects,
          ignoreSSL
        });
      }

      // Web search
      if (query) {
        return await this.performSearch(searchEngine, query, {
          maxResults,
          scrapeContent,
          extractImages,
          extractLinks,
          userAgent,
          timeout,
          ignoreSSL
        });
      }

      throw new Error('Either query or url must be provided');

    } catch (error) {
      throw new Error(`Web search failed: ${error.message}`);
    }
  }

  /**
   * Perform web search
   */
  async performSearch(engine, query, options) {
    const {
      maxResults,
      scrapeContent,
      extractImages,
      extractLinks,
      userAgent,
      timeout,
      ignoreSSL
    } = options;

    let searchUrl;
    
    switch (engine) {
      case 'google':
        searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=${maxResults}`;
        break;
      case 'bing':
        searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}&count=${maxResults}`;
        break;
      case 'duckduckgo':
        searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
        break;
      default:
        throw new Error(`Unknown search engine: ${engine}`);
    }

    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout,
      maxRedirects: 5,
      httpsAgent: ignoreSSL ? new (require('https').Agent)({ rejectUnauthorized: false }) : undefined
    });

    const $ = cheerio.load(response.data);
    const results = [];

    // Parse search results based on engine
    if (engine === 'google') {
      $('.g').each((i, elem) => {
        if (i >= maxResults) return false;
        
        const title = $(elem).find('h3').text();
        const link = $(elem).find('a').attr('href');
        const snippet = $(elem).find('.VwiC3b').text();

        if (title && link) {
          results.push({
            title,
            url: link,
            snippet,
            position: i + 1
          });
        }
      });
    } else if (engine === 'bing') {
      $('.b_algo').each((i, elem) => {
        if (i >= maxResults) return false;
        
        const title = $(elem).find('h2').text();
        const link = $(elem).find('a').attr('href');
        const snippet = $(elem).find('.b_caption p').text();

        if (title && link) {
          results.push({
            title,
            url: link,
            snippet,
            position: i + 1
          });
        }
      });
    } else if (engine === 'duckduckgo') {
      $('.result').each((i, elem) => {
        if (i >= maxResults) return false;
        
        const title = $(elem).find('.result__title').text();
        const link = $(elem).find('.result__url').attr('href');
        const snippet = $(elem).find('.result__snippet').text();

        if (title && link) {
          results.push({
            title,
            url: link,
            snippet,
            position: i + 1
          });
        }
      });
    }

    // Scrape content from each result if requested
    if (scrapeContent && results.length > 0) {
      for (const result of results.slice(0, 3)) { // Scrape top 3 results
        try {
          const scraped = await this.scrapeUrl(result.url, {
            scrapeContent: true,
            extractImages,
            extractLinks,
            userAgent,
            timeout: 10000,
            ignoreSSL
          });
          
          result.content = scraped.content;
          result.images = scraped.images;
          result.links = scraped.links;
        } catch (error) {
          result.scrapeError = error.message;
        }
      }
    }

    return {
      results,
      query,
      engine,
      totalResults: results.length,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Scrape URL content
   */
  async scrapeUrl(url, options) {
    const {
      scrapeContent,
      extractImages,
      extractLinks,
      selector,
      userAgent,
      timeout,
      followRedirects,
      ignoreSSL
    } = options;

    const response = await axios.get(url, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      timeout,
      maxRedirects: followRedirects ? 5 : 0,
      httpsAgent: ignoreSSL ? new (require('https').Agent)({ rejectUnauthorized: false }) : undefined
    });

    const $ = cheerio.load(response.data);
    const result = {
      url,
      statusCode: response.status,
      headers: response.headers
    };

    // Extract specific content using selector
    if (selector) {
      const elements = [];
      $(selector).each((i, elem) => {
        elements.push({
          html: $(elem).html(),
          text: $(elem).text().trim(),
          attributes: elem.attribs
        });
      });
      result.selected = elements;
    }

    // Extract full page content
    if (scrapeContent) {
      // Remove script and style tags
      $('script, style, noscript').remove();
      
      result.content = {
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
        keywords: $('meta[name="keywords"]').attr('content'),
        author: $('meta[name="author"]').attr('content'),
        bodyText: $('body').text().replace(/\s+/g, ' ').trim(),
        headings: {
          h1: $('h1').map((i, el) => $(el).text()).get(),
          h2: $('h2').map((i, el) => $(el).text()).get(),
          h3: $('h3').map((i, el) => $(el).text()).get()
        }
      };
    }

    // Extract images
    if (extractImages) {
      result.images = [];
      $('img').each((i, elem) => {
        const src = $(elem).attr('src');
        const alt = $(elem).attr('alt');
        if (src) {
          result.images.push({
            src: this.resolveUrl(url, src),
            alt: alt || '',
            width: $(elem).attr('width'),
            height: $(elem).attr('height')
          });
        }
      });
    }

    // Extract links
    if (extractLinks) {
      result.links = [];
      $('a').each((i, elem) => {
        const href = $(elem).attr('href');
        const text = $(elem).text().trim();
        if (href) {
          result.links.push({
            url: this.resolveUrl(url, href),
            text,
            title: $(elem).attr('title')
          });
        }
      });
    }

    return result;
  }

  /**
   * Resolve relative URLs
   */
  resolveUrl(baseUrl, relativeUrl) {
    try {
      return new URL(relativeUrl, baseUrl).href;
    } catch {
      return relativeUrl;
    }
  }
}

module.exports = WebSearchNode;
