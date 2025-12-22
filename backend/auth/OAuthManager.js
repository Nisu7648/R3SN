/**
 * OAuth Manager - Universal Authentication System
 * Handles OAuth flow for all 100+ integrations
 * Supports multiple accounts per integration
 */

const axios = require('axios');
const crypto = require('crypto');

class OAuthManager {
  constructor() {
    this.providers = this.initializeProviders();
    this.connections = new Map(); // userId -> { provider -> [accounts] }
  }

  /**
   * Initialize all OAuth providers
   */
  initializeProviders() {
    return {
      // Social Media
      instagram: {
        authUrl: 'https://api.instagram.com/oauth/authorize',
        tokenUrl: 'https://api.instagram.com/oauth/access_token',
        scope: 'user_profile,user_media,instagram_basic,instagram_content_publish,instagram_manage_comments,instagram_manage_insights',
        clientId: process.env.INSTAGRAM_CLIENT_ID,
        clientSecret: process.env.INSTAGRAM_CLIENT_SECRET
      },
      tiktok: {
        authUrl: 'https://www.tiktok.com/auth/authorize/',
        tokenUrl: 'https://open-api.tiktok.com/oauth/access_token/',
        scope: 'user.info.basic,video.list,video.upload',
        clientId: process.env.TIKTOK_CLIENT_KEY,
        clientSecret: process.env.TIKTOK_CLIENT_SECRET
      },
      linkedin: {
        authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
        tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
        scope: 'r_liteprofile,r_emailaddress,w_member_social,r_organization_social,w_organization_social',
        clientId: process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET
      },
      pinterest: {
        authUrl: 'https://www.pinterest.com/oauth/',
        tokenUrl: 'https://api.pinterest.com/v5/oauth/token',
        scope: 'boards:read,boards:write,pins:read,pins:write,user_accounts:read',
        clientId: process.env.PINTEREST_APP_ID,
        clientSecret: process.env.PINTEREST_APP_SECRET
      },
      snapchat: {
        authUrl: 'https://accounts.snapchat.com/login/oauth2/authorize',
        tokenUrl: 'https://accounts.snapchat.com/login/oauth2/access_token',
        scope: 'snapchat-marketing-api',
        clientId: process.env.SNAPCHAT_CLIENT_ID,
        clientSecret: process.env.SNAPCHAT_CLIENT_SECRET
      },
      reddit: {
        authUrl: 'https://www.reddit.com/api/v1/authorize',
        tokenUrl: 'https://www.reddit.com/api/v1/access_token',
        scope: 'identity,edit,flair,history,modconfig,modflair,modlog,modposts,modwiki,mysubreddits,privatemessages,read,report,save,submit,subscribe,vote,wikiedit,wikiread',
        clientId: process.env.REDDIT_CLIENT_ID,
        clientSecret: process.env.REDDIT_CLIENT_SECRET
      },
      youtube: {
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        scope: 'https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtubepartner',
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET
      },
      twitter: {
        authUrl: 'https://twitter.com/i/oauth2/authorize',
        tokenUrl: 'https://api.twitter.com/2/oauth2/token',
        scope: 'tweet.read,tweet.write,users.read,follows.read,follows.write,offline.access',
        clientId: process.env.TWITTER_CLIENT_ID,
        clientSecret: process.env.TWITTER_CLIENT_SECRET
      },
      facebook: {
        authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
        tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
        scope: 'pages_manage_posts,pages_read_engagement,pages_manage_metadata,pages_read_user_content,pages_manage_ads',
        clientId: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET
      },

      // Google Services
      gmail: {
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        scope: 'https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/gmail.send',
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET
      },
      'google-drive': {
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        scope: 'https://www.googleapis.com/auth/drive',
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET
      },
      'google-calendar': {
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        scope: 'https://www.googleapis.com/auth/calendar',
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET
      },
      'google-sheets': {
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        scope: 'https://www.googleapis.com/auth/spreadsheets',
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET
      },
      'google-docs': {
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        scope: 'https://www.googleapis.com/auth/documents',
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET
      },

      // Productivity
      slack: {
        authUrl: 'https://slack.com/oauth/v2/authorize',
        tokenUrl: 'https://slack.com/api/oauth.v2.access',
        scope: 'channels:read,channels:write,chat:write,files:read,files:write,users:read',
        clientId: process.env.SLACK_CLIENT_ID,
        clientSecret: process.env.SLACK_CLIENT_SECRET
      },
      notion: {
        authUrl: 'https://api.notion.com/v1/oauth/authorize',
        tokenUrl: 'https://api.notion.com/v1/oauth/token',
        scope: 'read_content,update_content,insert_content',
        clientId: process.env.NOTION_CLIENT_ID,
        clientSecret: process.env.NOTION_CLIENT_SECRET
      },
      trello: {
        authUrl: 'https://trello.com/1/authorize',
        tokenUrl: 'https://trello.com/1/OAuthGetAccessToken',
        scope: 'read,write,account',
        clientId: process.env.TRELLO_API_KEY,
        clientSecret: process.env.TRELLO_API_SECRET
      },
      linear: {
        authUrl: 'https://linear.app/oauth/authorize',
        tokenUrl: 'https://api.linear.app/oauth/token',
        scope: 'read,write',
        clientId: process.env.LINEAR_CLIENT_ID,
        clientSecret: process.env.LINEAR_CLIENT_SECRET
      },

      // Development
      github: {
        authUrl: 'https://github.com/login/oauth/authorize',
        tokenUrl: 'https://github.com/login/oauth/access_token',
        scope: 'repo,user,admin:org,workflow',
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET
      },
      gitlab: {
        authUrl: 'https://gitlab.com/oauth/authorize',
        tokenUrl: 'https://gitlab.com/oauth/token',
        scope: 'api,read_user,write_repository',
        clientId: process.env.GITLAB_CLIENT_ID,
        clientSecret: process.env.GITLAB_CLIENT_SECRET
      },
      vercel: {
        authUrl: 'https://vercel.com/oauth/authorize',
        tokenUrl: 'https://api.vercel.com/v2/oauth/access_token',
        scope: 'deployments,projects',
        clientId: process.env.VERCEL_CLIENT_ID,
        clientSecret: process.env.VERCEL_CLIENT_SECRET
      },
      railway: {
        authUrl: 'https://railway.app/oauth/authorize',
        tokenUrl: 'https://railway.app/oauth/token',
        scope: 'read,write',
        clientId: process.env.RAILWAY_CLIENT_ID,
        clientSecret: process.env.RAILWAY_CLIENT_SECRET
      },

      // Monitoring
      datadog: {
        authUrl: 'https://app.datadoghq.com/oauth2/v1/authorize',
        tokenUrl: 'https://app.datadoghq.com/oauth2/v1/token',
        scope: 'metrics_read,metrics_write,logs_read,logs_write',
        clientId: process.env.DATADOG_CLIENT_ID,
        clientSecret: process.env.DATADOG_CLIENT_SECRET
      },
      sentry: {
        authUrl: 'https://sentry.io/oauth/authorize/',
        tokenUrl: 'https://sentry.io/oauth/token/',
        scope: 'project:read,project:write,event:read',
        clientId: process.env.SENTRY_CLIENT_ID,
        clientSecret: process.env.SENTRY_CLIENT_SECRET
      },

      // Analytics
      mixpanel: {
        authUrl: 'https://mixpanel.com/oauth/authorize',
        tokenUrl: 'https://mixpanel.com/oauth/access_token',
        scope: 'read,write',
        clientId: process.env.MIXPANEL_CLIENT_ID,
        clientSecret: process.env.MIXPANEL_CLIENT_SECRET
      },
      amplitude: {
        authUrl: 'https://amplitude.com/oauth/authorize',
        tokenUrl: 'https://amplitude.com/oauth/token',
        scope: 'read,write',
        clientId: process.env.AMPLITUDE_CLIENT_ID,
        clientSecret: process.env.AMPLITUDE_CLIENT_SECRET
      },

      // Finance
      stripe: {
        authUrl: 'https://connect.stripe.com/oauth/authorize',
        tokenUrl: 'https://connect.stripe.com/oauth/token',
        scope: 'read_write',
        clientId: process.env.STRIPE_CLIENT_ID,
        clientSecret: process.env.STRIPE_CLIENT_SECRET
      },
      paypal: {
        authUrl: 'https://www.paypal.com/signin/authorize',
        tokenUrl: 'https://api.paypal.com/v1/oauth2/token',
        scope: 'openid,profile,email',
        clientId: process.env.PAYPAL_CLIENT_ID,
        clientSecret: process.env.PAYPAL_CLIENT_SECRET
      },

      // Communication
      telegram: {
        authUrl: 'https://oauth.telegram.org/auth',
        tokenUrl: 'https://oauth.telegram.org/auth/request',
        scope: 'bot',
        clientId: process.env.TELEGRAM_BOT_TOKEN,
        clientSecret: process.env.TELEGRAM_BOT_TOKEN
      },
      sendgrid: {
        authUrl: 'https://sendgrid.com/oauth/authorize',
        tokenUrl: 'https://api.sendgrid.com/v3/oauth/token',
        scope: 'mail.send,mail.batch.send',
        clientId: process.env.SENDGRID_CLIENT_ID,
        clientSecret: process.env.SENDGRID_CLIENT_SECRET
      },
      twilio: {
        authUrl: 'https://www.twilio.com/authorize',
        tokenUrl: 'https://api.twilio.com/oauth/token',
        scope: 'sms,voice',
        clientId: process.env.TWILIO_CLIENT_ID,
        clientSecret: process.env.TWILIO_CLIENT_SECRET
      }
    };
  }

  /**
   * Generate OAuth URL for provider
   */
  getAuthUrl(provider, userId, redirectUri) {
    const config = this.providers[provider];
    if (!config) throw new Error(`Provider ${provider} not supported`);

    const state = this.generateState(userId, provider);
    
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri,
      scope: config.scope,
      state,
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent'
    });

    return `${config.authUrl}?${params.toString()}`;
  }

  /**
   * Exchange code for access token
   */
  async exchangeCode(provider, code, redirectUri) {
    const config = this.providers[provider];
    if (!config) throw new Error(`Provider ${provider} not supported`);

    try {
      const response = await axios.post(config.tokenUrl, {
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
        tokenType: response.data.token_type
      };
    } catch (error) {
      throw new Error(`Failed to exchange code: ${error.message}`);
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(provider, refreshToken) {
    const config = this.providers[provider];
    if (!config) throw new Error(`Provider ${provider} not supported`);

    try {
      const response = await axios.post(config.tokenUrl, {
        client_id: config.clientId,
        client_secret: config.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      });

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token || refreshToken,
        expiresIn: response.data.expires_in
      };
    } catch (error) {
      throw new Error(`Failed to refresh token: ${error.message}`);
    }
  }

  /**
   * Add connection for user
   */
  async addConnection(userId, provider, accountData) {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, {});
    }

    const userConnections = this.connections.get(userId);
    
    if (!userConnections[provider]) {
      userConnections[provider] = [];
    }

    // Check if account already exists
    const existingIndex = userConnections[provider].findIndex(
      acc => acc.accountId === accountData.accountId
    );

    if (existingIndex >= 0) {
      // Update existing account
      userConnections[provider][existingIndex] = {
        ...userConnections[provider][existingIndex],
        ...accountData,
        updatedAt: new Date()
      };
    } else {
      // Add new account
      userConnections[provider].push({
        ...accountData,
        id: this.generateId(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    return userConnections[provider];
  }

  /**
   * Get connections for user
   */
  getConnections(userId, provider = null) {
    const userConnections = this.connections.get(userId) || {};
    
    if (provider) {
      return userConnections[provider] || [];
    }

    return userConnections;
  }

  /**
   * Remove connection
   */
  removeConnection(userId, provider, accountId) {
    const userConnections = this.connections.get(userId);
    if (!userConnections || !userConnections[provider]) {
      return false;
    }

    const index = userConnections[provider].findIndex(
      acc => acc.id === accountId
    );

    if (index >= 0) {
      userConnections[provider].splice(index, 1);
      return true;
    }

    return false;
  }

  /**
   * Get active token for provider
   */
  async getActiveToken(userId, provider, accountId = null) {
    const accounts = this.getConnections(userId, provider);
    
    if (accounts.length === 0) {
      throw new Error(`No ${provider} account connected`);
    }

    let account;
    if (accountId) {
      account = accounts.find(acc => acc.id === accountId);
    } else {
      account = accounts[0]; // Use first account as default
    }

    if (!account) {
      throw new Error(`Account not found`);
    }

    // Check if token needs refresh
    if (this.isTokenExpired(account)) {
      const newTokens = await this.refreshToken(provider, account.refreshToken);
      account.accessToken = newTokens.accessToken;
      account.refreshToken = newTokens.refreshToken;
      account.expiresAt = Date.now() + (newTokens.expiresIn * 1000);
      account.updatedAt = new Date();
    }

    return account.accessToken;
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(account) {
    if (!account.expiresAt) return false;
    return Date.now() >= account.expiresAt - (5 * 60 * 1000); // Refresh 5 min before expiry
  }

  /**
   * Generate state for OAuth
   */
  generateState(userId, provider) {
    const data = `${userId}:${provider}:${Date.now()}`;
    return Buffer.from(data).toString('base64');
  }

  /**
   * Parse state from OAuth
   */
  parseState(state) {
    const decoded = Buffer.from(state, 'base64').toString('utf-8');
    const [userId, provider, timestamp] = decoded.split(':');
    return { userId, provider, timestamp: parseInt(timestamp) };
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Get all supported providers
   */
  getSupportedProviders() {
    return Object.keys(this.providers);
  }

  /**
   * Check if provider is supported
   */
  isProviderSupported(provider) {
    return provider in this.providers;
  }
}

module.exports = new OAuthManager();
