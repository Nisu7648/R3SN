/**
 * API Manager - Central hub for all real API integrations
 * Manages authentication, rate limiting, and API execution
 */

const StripeAPI = require('./apis/StripeAPI');
const SlackAPI = require('./apis/SlackAPI');
const GoogleAPI = require('./apis/GoogleAPI');
const GitHubAPI = require('./apis/GitHubAPI');
const TwitterAPI = require('./apis/TwitterAPI');

class APIManager {
    constructor() {
        this.apis = new Map();
        this.credentials = new Map();
        this.rateLimiters = new Map();
        this.cache = new Map();
        this.initializeAPIs();
    }

    /**
     * Initialize all API clients
     */
    initializeAPIs() {
        // Stripe
        if (process.env.STRIPE_SECRET_KEY) {
            this.apis.set('stripe', new StripeAPI(process.env.STRIPE_SECRET_KEY));
        }

        // Slack
        if (process.env.SLACK_BOT_TOKEN) {
            this.apis.set('slack', new SlackAPI(process.env.SLACK_BOT_TOKEN));
        }

        // Google
        if (process.env.GOOGLE_CLIENT_ID) {
            this.apis.set('google', new GoogleAPI({
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: process.env.GOOGLE_REDIRECT_URI
            }));
        }

        // GitHub
        if (process.env.GITHUB_TOKEN) {
            this.apis.set('github', new GitHubAPI(process.env.GITHUB_TOKEN));
        }

        // Twitter
        if (process.env.TWITTER_BEARER_TOKEN) {
            this.apis.set('twitter', new TwitterAPI(process.env.TWITTER_BEARER_TOKEN));
        }
    }

    /**
     * Execute API call with rate limiting and caching
     */
    async execute(apiName, method, ...args) {
        const api = this.apis.get(apiName);
        if (!api) {
            throw new Error(`API ${apiName} not initialized. Check environment variables.`);
        }

        // Check rate limit
        await this.checkRateLimit(apiName);

        // Check cache
        const cacheKey = `${apiName}:${method}:${JSON.stringify(args)}`;
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < 60000) { // 1 minute cache
                return cached.data;
            }
        }

        // Execute API call
        try {
            const result = await api[method](...args);

            // Cache result
            this.cache.set(cacheKey, {
                data: result,
                timestamp: Date.now()
            });

            // Update rate limiter
            this.updateRateLimit(apiName);

            return result;
        } catch (error) {
            throw new Error(`${apiName} API Error: ${error.message}`);
        }
    }

    /**
     * Check rate limit
     */
    async checkRateLimit(apiName) {
        if (!this.rateLimiters.has(apiName)) {
            this.rateLimiters.set(apiName, {
                count: 0,
                resetTime: Date.now() + 60000 // 1 minute window
            });
        }

        const limiter = this.rateLimiters.get(apiName);

        // Reset if window expired
        if (Date.now() > limiter.resetTime) {
            limiter.count = 0;
            limiter.resetTime = Date.now() + 60000;
        }

        // Check limit (100 requests per minute default)
        if (limiter.count >= 100) {
            const waitTime = limiter.resetTime - Date.now();
            throw new Error(`Rate limit exceeded for ${apiName}. Try again in ${Math.ceil(waitTime / 1000)} seconds.`);
        }
    }

    /**
     * Update rate limiter
     */
    updateRateLimit(apiName) {
        const limiter = this.rateLimiters.get(apiName);
        limiter.count++;
    }

    /**
     * Set user credentials for API
     */
    setCredentials(userId, apiName, credentials) {
        const key = `${userId}:${apiName}`;
        this.credentials.set(key, credentials);

        // Reinitialize API with user credentials
        this.initializeUserAPI(userId, apiName, credentials);
    }

    /**
     * Initialize API with user-specific credentials
     */
    initializeUserAPI(userId, apiName, credentials) {
        const userKey = `${userId}:${apiName}`;

        switch (apiName) {
            case 'stripe':
                this.apis.set(userKey, new StripeAPI(credentials.apiKey));
                break;
            case 'slack':
                this.apis.set(userKey, new SlackAPI(credentials.token));
                break;
            case 'google':
                const googleAPI = new GoogleAPI(credentials);
                if (credentials.tokens) {
                    googleAPI.setTokens(credentials.tokens);
                }
                this.apis.set(userKey, googleAPI);
                break;
            case 'github':
                this.apis.set(userKey, new GitHubAPI(credentials.token));
                break;
            case 'twitter':
                this.apis.set(userKey, new TwitterAPI(credentials.bearerToken));
                break;
        }
    }

    /**
     * Execute API call with user credentials
     */
    async executeForUser(userId, apiName, method, ...args) {
        const userKey = `${userId}:${apiName}`;
        const api = this.apis.get(userKey) || this.apis.get(apiName);

        if (!api) {
            throw new Error(`API ${apiName} not available for user ${userId}`);
        }

        return await this.execute(apiName, method, ...args);
    }

    /**
     * Get available APIs
     */
    getAvailableAPIs() {
        return Array.from(this.apis.keys()).filter(key => !key.includes(':'));
    }

    /**
     * Check if API is available
     */
    isAvailable(apiName) {
        return this.apis.has(apiName);
    }

    /**
     * Get API status
     */
    getStatus() {
        const status = {};

        for (const [name, api] of this.apis.entries()) {
            if (!name.includes(':')) { // Skip user-specific APIs
                status[name] = {
                    available: true,
                    rateLimit: this.rateLimiters.get(name) || { count: 0, resetTime: 0 }
                };
            }
        }

        return status;
    }

    /**
     * Clear cache
     */
    clearCache(apiName = null) {
        if (apiName) {
            for (const [key] of this.cache) {
                if (key.startsWith(apiName)) {
                    this.cache.delete(key);
                }
            }
        } else {
            this.cache.clear();
        }
    }

    // ============================================
    // CONVENIENCE METHODS
    // ============================================

    /**
     * Stripe methods
     */
    async stripe(method, ...args) {
        return await this.execute('stripe', method, ...args);
    }

    /**
     * Slack methods
     */
    async slack(method, ...args) {
        return await this.execute('slack', method, ...args);
    }

    /**
     * Google methods
     */
    async google(method, ...args) {
        return await this.execute('google', method, ...args);
    }

    /**
     * GitHub methods
     */
    async github(method, ...args) {
        return await this.execute('github', method, ...args);
    }

    /**
     * Twitter methods
     */
    async twitter(method, ...args) {
        return await this.execute('twitter', method, ...args);
    }
}

module.exports = APIManager;
