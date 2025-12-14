/**
 * OAuth2 Authentication Handler
 * Handles OAuth2 flows for Google, GitHub, Slack, etc.
 */

const axios = require('axios');
const crypto = require('crypto');

class OAuth2Handler {
    constructor() {
        this.providers = new Map();
        this.states = new Map(); // CSRF protection
        this.tokens = new Map(); // User tokens
        this.initializeProviders();
    }

    /**
     * Initialize OAuth2 providers
     */
    initializeProviders() {
        // Google
        this.providers.set('google', {
            authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
            tokenUrl: 'https://oauth2.googleapis.com/token',
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            redirectUri: process.env.GOOGLE_REDIRECT_URI,
            scopes: [
                'https://www.googleapis.com/auth/gmail.send',
                'https://www.googleapis.com/auth/calendar',
                'https://www.googleapis.com/auth/drive',
                'https://www.googleapis.com/auth/documents',
                'https://www.googleapis.com/auth/spreadsheets'
            ]
        });

        // GitHub
        this.providers.set('github', {
            authUrl: 'https://github.com/login/oauth/authorize',
            tokenUrl: 'https://github.com/login/oauth/access_token',
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            redirectUri: process.env.GITHUB_REDIRECT_URI,
            scopes: ['repo', 'user', 'gist', 'workflow']
        });

        // Slack
        this.providers.set('slack', {
            authUrl: 'https://slack.com/oauth/v2/authorize',
            tokenUrl: 'https://slack.com/api/oauth.v2.access',
            clientId: process.env.SLACK_CLIENT_ID,
            clientSecret: process.env.SLACK_CLIENT_SECRET,
            redirectUri: process.env.SLACK_REDIRECT_URI,
            scopes: [
                'chat:write',
                'channels:read',
                'channels:write',
                'users:read',
                'files:write',
                'reactions:write'
            ]
        });

        // Microsoft
        this.providers.set('microsoft', {
            authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
            tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
            clientId: process.env.MICROSOFT_CLIENT_ID,
            clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
            redirectUri: process.env.MICROSOFT_REDIRECT_URI,
            scopes: [
                'Mail.Send',
                'Calendars.ReadWrite',
                'Files.ReadWrite',
                'User.Read'
            ]
        });

        // Twitter
        this.providers.set('twitter', {
            authUrl: 'https://twitter.com/i/oauth2/authorize',
            tokenUrl: 'https://api.twitter.com/2/oauth2/token',
            clientId: process.env.TWITTER_CLIENT_ID,
            clientSecret: process.env.TWITTER_CLIENT_SECRET,
            redirectUri: process.env.TWITTER_REDIRECT_URI,
            scopes: [
                'tweet.read',
                'tweet.write',
                'users.read',
                'follows.read',
                'follows.write'
            ]
        });

        // LinkedIn
        this.providers.set('linkedin', {
            authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
            tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
            clientId: process.env.LINKEDIN_CLIENT_ID,
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
            redirectUri: process.env.LINKEDIN_REDIRECT_URI,
            scopes: ['r_liteprofile', 'r_emailaddress', 'w_member_social']
        });

        // Stripe (OAuth Connect)
        this.providers.set('stripe', {
            authUrl: 'https://connect.stripe.com/oauth/authorize',
            tokenUrl: 'https://connect.stripe.com/oauth/token',
            clientId: process.env.STRIPE_CLIENT_ID,
            clientSecret: process.env.STRIPE_SECRET_KEY,
            redirectUri: process.env.STRIPE_REDIRECT_URI,
            scopes: ['read_write']
        });
    }

    /**
     * Generate authorization URL
     */
    getAuthorizationUrl(provider, userId) {
        const config = this.providers.get(provider);
        if (!config) {
            throw new Error(`Provider ${provider} not configured`);
        }

        // Generate state for CSRF protection
        const state = crypto.randomBytes(32).toString('hex');
        this.states.set(state, { userId, provider, timestamp: Date.now() });

        // Build authorization URL
        const params = new URLSearchParams({
            client_id: config.clientId,
            redirect_uri: config.redirectUri,
            response_type: 'code',
            scope: config.scopes.join(' '),
            state,
            access_type: 'offline', // For refresh tokens
            prompt: 'consent'
        });

        return `${config.authUrl}?${params.toString()}`;
    }

    /**
     * Exchange authorization code for tokens
     */
    async exchangeCodeForTokens(provider, code, state) {
        // Verify state
        const stateData = this.states.get(state);
        if (!stateData) {
            throw new Error('Invalid state parameter');
        }

        // Check state expiry (5 minutes)
        if (Date.now() - stateData.timestamp > 300000) {
            this.states.delete(state);
            throw new Error('State expired');
        }

        const config = this.providers.get(provider);
        if (!config) {
            throw new Error(`Provider ${provider} not configured`);
        }

        // Exchange code for tokens
        const data = {
            client_id: config.clientId,
            client_secret: config.clientSecret,
            code,
            redirect_uri: config.redirectUri,
            grant_type: 'authorization_code'
        };

        try {
            const response = await axios.post(config.tokenUrl, 
                new URLSearchParams(data).toString(),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json'
                    }
                }
            );

            const tokens = response.data;

            // Store tokens
            this.tokens.set(`${stateData.userId}:${provider}`, {
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                expiresAt: Date.now() + (tokens.expires_in * 1000),
                tokenType: tokens.token_type,
                scope: tokens.scope
            });

            // Clean up state
            this.states.delete(state);

            return {
                userId: stateData.userId,
                provider,
                tokens
            };

        } catch (error) {
            throw new Error(`Token exchange failed: ${error.response?.data?.error || error.message}`);
        }
    }

    /**
     * Refresh access token
     */
    async refreshAccessToken(userId, provider) {
        const tokenKey = `${userId}:${provider}`;
        const storedTokens = this.tokens.get(tokenKey);

        if (!storedTokens || !storedTokens.refreshToken) {
            throw new Error('No refresh token available');
        }

        const config = this.providers.get(provider);
        if (!config) {
            throw new Error(`Provider ${provider} not configured`);
        }

        const data = {
            client_id: config.clientId,
            client_secret: config.clientSecret,
            refresh_token: storedTokens.refreshToken,
            grant_type: 'refresh_token'
        };

        try {
            const response = await axios.post(config.tokenUrl,
                new URLSearchParams(data).toString(),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json'
                    }
                }
            );

            const tokens = response.data;

            // Update stored tokens
            this.tokens.set(tokenKey, {
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token || storedTokens.refreshToken,
                expiresAt: Date.now() + (tokens.expires_in * 1000),
                tokenType: tokens.token_type,
                scope: tokens.scope
            });

            return tokens;

        } catch (error) {
            throw new Error(`Token refresh failed: ${error.response?.data?.error || error.message}`);
        }
    }

    /**
     * Get valid access token (refresh if expired)
     */
    async getValidToken(userId, provider) {
        const tokenKey = `${userId}:${provider}`;
        const storedTokens = this.tokens.get(tokenKey);

        if (!storedTokens) {
            throw new Error('No tokens found. User needs to authenticate.');
        }

        // Check if token is expired (with 5 minute buffer)
        if (Date.now() >= storedTokens.expiresAt - 300000) {
            await this.refreshAccessToken(userId, provider);
            return this.tokens.get(tokenKey).accessToken;
        }

        return storedTokens.accessToken;
    }

    /**
     * Revoke access
     */
    async revokeAccess(userId, provider) {
        const tokenKey = `${userId}:${provider}`;
        const storedTokens = this.tokens.get(tokenKey);

        if (!storedTokens) {
            return { success: true, message: 'No tokens to revoke' };
        }

        // Provider-specific revocation
        const config = this.providers.get(provider);
        let revokeUrl;

        switch (provider) {
            case 'google':
                revokeUrl = `https://oauth2.googleapis.com/revoke?token=${storedTokens.accessToken}`;
                break;
            case 'github':
                // GitHub doesn't have a revoke endpoint, just delete locally
                break;
            default:
                // Most providers don't have revoke endpoints
                break;
        }

        if (revokeUrl) {
            try {
                await axios.post(revokeUrl);
            } catch (error) {
                console.error(`Revocation failed for ${provider}:`, error.message);
            }
        }

        // Delete stored tokens
        this.tokens.delete(tokenKey);

        return { success: true, message: 'Access revoked' };
    }

    /**
     * Get user's connected providers
     */
    getConnectedProviders(userId) {
        const connected = [];

        for (const [key, tokens] of this.tokens) {
            if (key.startsWith(`${userId}:`)) {
                const provider = key.split(':')[1];
                connected.push({
                    provider,
                    expiresAt: tokens.expiresAt,
                    scope: tokens.scope
                });
            }
        }

        return connected;
    }

    /**
     * Check if user has connected a provider
     */
    isConnected(userId, provider) {
        return this.tokens.has(`${userId}:${provider}`);
    }
}

module.exports = OAuth2Handler;
