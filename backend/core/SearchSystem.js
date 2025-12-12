/**
 * R3SN Search System
 * Multi-source search aggregation with web scraping and semantic search
 */

const axios = require('axios');
const cheerio = require('cheerio');
const EventEmitter = require('events');

class SearchSystem extends EventEmitter {
    constructor() {
        super();
        this.providers = new Map();
        this.cache = new Map();
        this.searchHistory = [];
        this.initializeProviders();
    }

    /**
     * Initialize search providers
     */
    initializeProviders() {
        // Google Search
        this.providers.set('google', {
            name: 'Google',
            endpoint: 'https://www.googleapis.com/customsearch/v1',
            enabled: true,
            priority: 1
        });

        // Bing Search
        this.providers.set('bing', {
            name: 'Bing',
            endpoint: 'https://api.bing.microsoft.com/v7.0/search',
            enabled: true,
            priority: 2
        });

        // DuckDuckGo
        this.providers.set('duckduckgo', {
            name: 'DuckDuckGo',
            endpoint: 'https://api.duckduckgo.com/',
            enabled: true,
            priority: 3
        });

        // Brave Search
        this.providers.set('brave', {
            name: 'Brave',
            endpoint: 'https://api.search.brave.com/res/v1/web/search',
            enabled: true,
            priority: 4
        });

        // SerpAPI (aggregator)
        this.providers.set('serpapi', {
            name: 'SerpAPI',
            endpoint: 'https://serpapi.com/search',
            enabled: true,
            priority: 5
        });

        // Tavily AI Search
        this.providers.set('tavily', {
            name: 'Tavily',
            endpoint: 'https://api.tavily.com/search',
            enabled: true,
            priority: 6
        });

        // Perplexity Search
        this.providers.set('perplexity', {
            name: 'Perplexity',
            endpoint: 'https://api.perplexity.ai/search',
            enabled: true,
            priority: 7
        });

        // You.com Search
        this.providers.set('you', {
            name: 'You.com',
            endpoint: 'https://api.you.com/search',
            enabled: true,
            priority: 8
        });

        // Exa (formerly Metaphor)
        this.providers.set('exa', {
            name: 'Exa',
            endpoint: 'https://api.exa.ai/search',
            enabled: true,
            priority: 9
        });

        // Kagi Search
        this.providers.set('kagi', {
            name: 'Kagi',
            endpoint: 'https://kagi.com/api/v0/search',
            enabled: true,
            priority: 10
        });
    }

    /**
     * Universal search across all providers
     */
    async search(query, options = {}) {
        const searchId = this.generateSearchId();
        
        try {
            this.emit('search:started', { searchId, query });

            // Get enabled providers
            const providers = options.providers || this.getEnabledProviders();
            
            // Search in parallel
            const results = await Promise.allSettled(
                providers.map(provider => this.searchProvider(provider, query, options))
            );

            // Aggregate results
            const aggregated = this.aggregateResults(results);

            // Rank and deduplicate
            const ranked = this.rankResults(aggregated);

            // Cache results
            this.cacheResults(query, ranked);

            // Store in history
            this.addToHistory(searchId, query, ranked);

            this.emit('search:completed', { searchId, query, count: ranked.length });

            return {
                success: true,
                searchId,
                query,
                results: ranked,
                count: ranked.length,
                providers: providers.length,
                timestamp: Date.now()
            };

        } catch (error) {
            this.emit('search:error', { searchId, query, error: error.message });
            throw error;
        }
    }

    /**
     * Search specific provider
     */
    async searchProvider(providerId, query, options) {
        const provider = this.providers.get(providerId);
        if (!provider || !provider.enabled) {
            throw new Error(`Provider ${providerId} not available`);
        }

        try {
            let results = [];

            switch (providerId) {
                case 'google':
                    results = await this.searchGoogle(query, options);
                    break;
                case 'bing':
                    results = await this.searchBing(query, options);
                    break;
                case 'duckduckgo':
                    results = await this.searchDuckDuckGo(query, options);
                    break;
                case 'brave':
                    results = await this.searchBrave(query, options);
                    break;
                case 'serpapi':
                    results = await this.searchSerpAPI(query, options);
                    break;
                case 'tavily':
                    results = await this.searchTavily(query, options);
                    break;
                case 'perplexity':
                    results = await this.searchPerplexity(query, options);
                    break;
                case 'you':
                    results = await this.searchYou(query, options);
                    break;
                case 'exa':
                    results = await this.searchExa(query, options);
                    break;
                case 'kagi':
                    results = await this.searchKagi(query, options);
                    break;
                default:
                    results = await this.searchGeneric(provider, query, options);
            }

            return {
                provider: providerId,
                results,
                count: results.length
            };

        } catch (error) {
            console.error(`Search error for ${providerId}:`, error.message);
            return {
                provider: providerId,
                results: [],
                count: 0,
                error: error.message
            };
        }
    }

    /**
     * Google Search
     */
    async searchGoogle(query, options) {
        const apiKey = options.googleApiKey || process.env.GOOGLE_API_KEY;
        const cx = options.googleCx || process.env.GOOGLE_CX;

        if (!apiKey || !cx) {
            return this.searchGoogleScrape(query, options);
        }

        const response = await axios.get(this.providers.get('google').endpoint, {
            params: {
                key: apiKey,
                cx: cx,
                q: query,
                num: options.limit || 10
            }
        });

        return (response.data.items || []).map(item => ({
            title: item.title,
            url: item.link,
            snippet: item.snippet,
            source: 'google'
        }));
    }

    /**
     * Google Search (Scraping fallback)
     */
    async searchGoogleScrape(query, options) {
        const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        const results = [];

        $('.g').each((i, elem) => {
            const title = $(elem).find('h3').text();
            const url = $(elem).find('a').attr('href');
            const snippet = $(elem).find('.VwiC3b').text();

            if (title && url) {
                results.push({
                    title,
                    url,
                    snippet,
                    source: 'google'
                });
            }
        });

        return results.slice(0, options.limit || 10);
    }

    /**
     * Bing Search
     */
    async searchBing(query, options) {
        const apiKey = options.bingApiKey || process.env.BING_API_KEY;

        if (!apiKey) {
            return [];
        }

        const response = await axios.get(this.providers.get('bing').endpoint, {
            params: {
                q: query,
                count: options.limit || 10
            },
            headers: {
                'Ocp-Apim-Subscription-Key': apiKey
            }
        });

        return (response.data.webPages?.value || []).map(item => ({
            title: item.name,
            url: item.url,
            snippet: item.snippet,
            source: 'bing'
        }));
    }

    /**
     * DuckDuckGo Search
     */
    async searchDuckDuckGo(query, options) {
        const response = await axios.get(this.providers.get('duckduckgo').endpoint, {
            params: {
                q: query,
                format: 'json',
                no_html: 1
            }
        });

        const results = [];
        
        if (response.data.AbstractText) {
            results.push({
                title: response.data.Heading,
                url: response.data.AbstractURL,
                snippet: response.data.AbstractText,
                source: 'duckduckgo'
            });
        }

        (response.data.RelatedTopics || []).forEach(topic => {
            if (topic.Text && topic.FirstURL) {
                results.push({
                    title: topic.Text.split(' - ')[0],
                    url: topic.FirstURL,
                    snippet: topic.Text,
                    source: 'duckduckgo'
                });
            }
        });

        return results.slice(0, options.limit || 10);
    }

    /**
     * Brave Search
     */
    async searchBrave(query, options) {
        const apiKey = options.braveApiKey || process.env.BRAVE_API_KEY;

        if (!apiKey) {
            return [];
        }

        const response = await axios.get(this.providers.get('brave').endpoint, {
            params: {
                q: query,
                count: options.limit || 10
            },
            headers: {
                'X-Subscription-Token': apiKey
            }
        });

        return (response.data.web?.results || []).map(item => ({
            title: item.title,
            url: item.url,
            snippet: item.description,
            source: 'brave'
        }));
    }

    /**
     * SerpAPI Search
     */
    async searchSerpAPI(query, options) {
        const apiKey = options.serpApiKey || process.env.SERPAPI_KEY;

        if (!apiKey) {
            return [];
        }

        const response = await axios.get(this.providers.get('serpapi').endpoint, {
            params: {
                q: query,
                api_key: apiKey,
                num: options.limit || 10
            }
        });

        return (response.data.organic_results || []).map(item => ({
            title: item.title,
            url: item.link,
            snippet: item.snippet,
            source: 'serpapi'
        }));
    }

    /**
     * Tavily AI Search
     */
    async searchTavily(query, options) {
        const apiKey = options.tavilyApiKey || process.env.TAVILY_API_KEY;

        if (!apiKey) {
            return [];
        }

        const response = await axios.post(this.providers.get('tavily').endpoint, {
            query,
            api_key: apiKey,
            max_results: options.limit || 10
        });

        return (response.data.results || []).map(item => ({
            title: item.title,
            url: item.url,
            snippet: item.content,
            source: 'tavily'
        }));
    }

    /**
     * Perplexity Search
     */
    async searchPerplexity(query, options) {
        const apiKey = options.perplexityApiKey || process.env.PERPLEXITY_API_KEY;

        if (!apiKey) {
            return [];
        }

        const response = await axios.post(this.providers.get('perplexity').endpoint, {
            query,
            max_results: options.limit || 10
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        return (response.data.results || []).map(item => ({
            title: item.title,
            url: item.url,
            snippet: item.snippet,
            source: 'perplexity'
        }));
    }

    /**
     * You.com Search
     */
    async searchYou(query, options) {
        const apiKey = options.youApiKey || process.env.YOU_API_KEY;

        if (!apiKey) {
            return [];
        }

        const response = await axios.get(this.providers.get('you').endpoint, {
            params: {
                query,
                count: options.limit || 10
            },
            headers: {
                'X-API-Key': apiKey
            }
        });

        return (response.data.hits || []).map(item => ({
            title: item.title,
            url: item.url,
            snippet: item.description,
            source: 'you'
        }));
    }

    /**
     * Exa Search
     */
    async searchExa(query, options) {
        const apiKey = options.exaApiKey || process.env.EXA_API_KEY;

        if (!apiKey) {
            return [];
        }

        const response = await axios.post(this.providers.get('exa').endpoint, {
            query,
            num_results: options.limit || 10
        }, {
            headers: {
                'x-api-key': apiKey
            }
        });

        return (response.data.results || []).map(item => ({
            title: item.title,
            url: item.url,
            snippet: item.text,
            source: 'exa'
        }));
    }

    /**
     * Kagi Search
     */
    async searchKagi(query, options) {
        const apiKey = options.kagiApiKey || process.env.KAGI_API_KEY;

        if (!apiKey) {
            return [];
        }

        const response = await axios.get(this.providers.get('kagi').endpoint, {
            params: {
                q: query,
                limit: options.limit || 10
            },
            headers: {
                'Authorization': `Bot ${apiKey}`
            }
        });

        return (response.data.data || []).map(item => ({
            title: item.title,
            url: item.url,
            snippet: item.snippet,
            source: 'kagi'
        }));
    }

    /**
     * Generic search for custom providers
     */
    async searchGeneric(provider, query, options) {
        const response = await axios.get(provider.endpoint, {
            params: {
                q: query,
                limit: options.limit || 10
            }
        });

        return response.data.results || [];
    }

    /**
     * Web scraping
     */
    async scrapeUrl(url) {
        try {
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 10000
            });

            const $ = cheerio.load(response.data);

            // Remove scripts and styles
            $('script, style').remove();

            return {
                title: $('title').text(),
                description: $('meta[name="description"]').attr('content'),
                text: $('body').text().trim().replace(/\s+/g, ' '),
                links: $('a').map((i, el) => $(el).attr('href')).get(),
                images: $('img').map((i, el) => $(el).attr('src')).get()
            };

        } catch (error) {
            throw new Error(`Scraping failed: ${error.message}`);
        }
    }

    /**
     * Aggregate results from multiple providers
     */
    aggregateResults(results) {
        const aggregated = [];

        results.forEach(result => {
            if (result.status === 'fulfilled' && result.value.results) {
                aggregated.push(...result.value.results);
            }
        });

        return aggregated;
    }

    /**
     * Rank and deduplicate results
     */
    rankResults(results) {
        // Deduplicate by URL
        const seen = new Set();
        const unique = results.filter(result => {
            if (seen.has(result.url)) {
                return false;
            }
            seen.add(result.url);
            return true;
        });

        // Simple ranking by source priority
        const ranked = unique.sort((a, b) => {
            const priorityA = this.providers.get(a.source)?.priority || 999;
            const priorityB = this.providers.get(b.source)?.priority || 999;
            return priorityA - priorityB;
        });

        return ranked;
    }

    /**
     * Cache results
     */
    cacheResults(query, results) {
        this.cache.set(query.toLowerCase(), {
            results,
            timestamp: Date.now()
        });

        // Clean old cache
        if (this.cache.size > 1000) {
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
        }
    }

    /**
     * Get cached results
     */
    getCachedResults(query, maxAge = 3600000) {
        const cached = this.cache.get(query.toLowerCase());
        
        if (cached && (Date.now() - cached.timestamp) < maxAge) {
            return cached.results;
        }
        
        return null;
    }

    /**
     * Add to search history
     */
    addToHistory(searchId, query, results) {
        this.searchHistory.push({
            searchId,
            query,
            count: results.length,
            timestamp: Date.now()
        });

        // Keep only last 1000 searches
        if (this.searchHistory.length > 1000) {
            this.searchHistory.shift();
        }
    }

    /**
     * Get enabled providers
     */
    getEnabledProviders() {
        return Array.from(this.providers.entries())
            .filter(([id, provider]) => provider.enabled)
            .map(([id]) => id);
    }

    /**
     * Generate search ID
     */
    generateSearchId() {
        return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get search statistics
     */
    getStats() {
        return {
            totalSearches: this.searchHistory.length,
            cacheSize: this.cache.size,
            providers: this.providers.size,
            enabledProviders: this.getEnabledProviders().length
        };
    }
}

module.exports = SearchSystem;
