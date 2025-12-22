/**
 * OAuth Routes - Universal Authentication for All Integrations
 * Connect/disconnect accounts for 100+ integrations
 * Support multiple accounts per integration
 */

const express = require('express');
const router = express.Router();
const OAuthManager = require('../auth/OAuthManager');
const { auth } = require('../middleware/auth');

/**
 * GET /oauth/providers
 * Get all supported providers (100+ integrations)
 */
router.get('/providers', auth, (req, res) => {
  try {
    const providers = OAuthManager.getSupportedProviders();
    res.json({
      success: true,
      providers,
      total: providers.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /oauth/connect/:provider
 * Initiate OAuth flow - Get authorization URL
 */
router.get('/connect/:provider', auth, (req, res) => {
  try {
    const { provider } = req.params;
    const userId = req.userId;

    if (!OAuthManager.isProviderSupported(provider)) {
      return res.status(400).json({
        success: false,
        error: `Provider ${provider} not supported`
      });
    }

    const redirectUri = `${req.protocol}://${req.get('host')}/oauth/callback/${provider}`;
    const authUrl = OAuthManager.getAuthUrl(provider, userId, redirectUri);

    res.json({
      success: true,
      authUrl,
      provider,
      message: 'Redirect user to authUrl to connect account'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /oauth/callback/:provider
 * OAuth callback - Exchange code for tokens
 */
router.get('/callback/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(`/dashboard?error=${encodeURIComponent(error)}`);
    }

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Authorization code missing'
      });
    }

    const { userId } = OAuthManager.parseState(state);
    const redirectUri = `${req.protocol}://${req.get('host')}/oauth/callback/${provider}`;
    
    const tokens = await OAuthManager.exchangeCode(provider, code, redirectUri);
    const accountInfo = await getAccountInfo(provider, tokens.accessToken);

    await OAuthManager.addConnection(userId, provider, {
      accountId: accountInfo.id,
      accountName: accountInfo.name,
      accountEmail: accountInfo.email,
      accountUsername: accountInfo.username,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: Date.now() + (tokens.expiresIn * 1000)
    });

    res.redirect(`/dashboard?connected=${provider}&account=${encodeURIComponent(accountInfo.name)}`);
  } catch (error) {
    res.redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  }
});

/**
 * GET /oauth/connections
 * Get all connected accounts for current user
 */
router.get('/connections', auth, (req, res) => {
  try {
    const userId = req.userId;
    const connections = OAuthManager.getConnections(userId);
    
    const formatted = {};
    for (const [provider, accounts] of Object.entries(connections)) {
      formatted[provider] = accounts.map(acc => ({
        id: acc.id,
        accountId: acc.accountId,
        accountName: acc.accountName,
        accountEmail: acc.accountEmail,
        accountUsername: acc.accountUsername,
        createdAt: acc.createdAt,
        updatedAt: acc.updatedAt
      }));
    }

    res.json({
      success: true,
      connections: formatted,
      totalProviders: Object.keys(formatted).length,
      totalAccounts: Object.values(formatted).reduce((sum, accounts) => sum + accounts.length, 0)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /oauth/connections/:provider
 * Get all accounts for specific provider
 */
router.get('/connections/:provider', auth, (req, res) => {
  try {
    const { provider } = req.params;
    const userId = req.userId;
    
    const accounts = OAuthManager.getConnections(userId, provider);

    res.json({
      success: true,
      provider,
      accounts: accounts.map(acc => ({
        id: acc.id,
        accountId: acc.accountId,
        accountName: acc.accountName,
        accountEmail: acc.accountEmail,
        accountUsername: acc.accountUsername,
        createdAt: acc.createdAt,
        updatedAt: acc.updatedAt
      })),
      total: accounts.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /oauth/disconnect/:provider/:accountId
 * Disconnect specific account
 */
router.delete('/disconnect/:provider/:accountId', auth, (req, res) => {
  try {
    const { provider, accountId } = req.params;
    const userId = req.userId;
    
    const removed = OAuthManager.removeConnection(userId, provider, accountId);

    if (removed) {
      res.json({
        success: true,
        message: `Account disconnected from ${provider}`,
        provider,
        accountId
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Account not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /oauth/refresh/:provider/:accountId
 * Manually refresh token
 */
router.post('/refresh/:provider/:accountId', auth, async (req, res) => {
  try {
    const { provider, accountId } = req.params;
    const userId = req.userId;
    
    await OAuthManager.getActiveToken(userId, provider, accountId);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      provider,
      accountId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Helper: Get account info from provider
 */
async function getAccountInfo(provider, accessToken) {
  const axios = require('axios');
  
  const endpoints = {
    instagram: 'https://graph.instagram.com/me?fields=id,username,account_type',
    tiktok: 'https://open.tiktokapis.com/v2/user/info/',
    linkedin: 'https://api.linkedin.com/v2/me',
    pinterest: 'https://api.pinterest.com/v5/user_account',
    snapchat: 'https://adsapi.snapchat.com/v1/me',
    reddit: 'https://oauth.reddit.com/api/v1/me',
    youtube: 'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
    twitter: 'https://api.twitter.com/2/users/me',
    facebook: 'https://graph.facebook.com/me?fields=id,name,email',
    gmail: 'https://www.googleapis.com/gmail/v1/users/me/profile',
    'google-drive': 'https://www.googleapis.com/drive/v3/about?fields=user',
    'google-calendar': 'https://www.googleapis.com/calendar/v3/users/me/settings',
    'google-sheets': 'https://www.googleapis.com/drive/v3/about?fields=user',
    'google-docs': 'https://www.googleapis.com/drive/v3/about?fields=user',
    slack: 'https://slack.com/api/users.identity',
    notion: 'https://api.notion.com/v1/users/me',
    trello: 'https://api.trello.com/1/members/me',
    linear: 'https://api.linear.app/graphql',
    github: 'https://api.github.com/user',
    gitlab: 'https://gitlab.com/api/v4/user',
    vercel: 'https://api.vercel.com/v2/user',
    railway: 'https://backboard.railway.app/graphql/v2',
    datadog: 'https://api.datadoghq.com/api/v1/validate',
    sentry: 'https://sentry.io/api/0/users/me/',
    mixpanel: 'https://mixpanel.com/api/2.0/engage',
    amplitude: 'https://amplitude.com/api/2/userprofile',
    stripe: 'https://api.stripe.com/v1/account',
    paypal: 'https://api.paypal.com/v1/identity/oauth2/userinfo',
    telegram: 'https://api.telegram.org/bot',
    sendgrid: 'https://api.sendgrid.com/v3/user/profile',
    twilio: 'https://api.twilio.com/2010-04-01/Accounts.json'
  };

  const endpoint = endpoints[provider];
  if (!endpoint) {
    return {
      id: 'unknown',
      name: 'Unknown Account',
      email: null,
      username: null
    };
  }

  try {
    const response = await axios.get(endpoint, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = response.data;

    switch (provider) {
      case 'instagram':
        return {
          id: data.id,
          name: data.username,
          username: data.username,
          email: null
        };
      case 'tiktok':
        return {
          id: data.data.user.open_id,
          name: data.data.user.display_name,
          username: data.data.user.display_name,
          email: null
        };
      case 'linkedin':
        return {
          id: data.id,
          name: `${data.localizedFirstName} ${data.localizedLastName}`,
          username: data.vanityName,
          email: null
        };
      case 'github':
        return {
          id: data.id,
          name: data.name || data.login,
          username: data.login,
          email: data.email
        };
      case 'gmail':
      case 'google-drive':
      case 'google-calendar':
      case 'google-sheets':
      case 'google-docs':
        return {
          id: data.user?.emailAddress || data.emailAddress,
          name: data.user?.displayName || data.displayName,
          username: data.user?.emailAddress || data.emailAddress,
          email: data.user?.emailAddress || data.emailAddress
        };
      case 'slack':
        return {
          id: data.user.id,
          name: data.user.name,
          username: data.user.name,
          email: data.user.email
        };
      default:
        return {
          id: data.id || data.user_id || 'unknown',
          name: data.name || data.display_name || data.username || 'Unknown',
          username: data.username || data.login || null,
          email: data.email || null
        };
    }
  } catch (error) {
    console.error(`Failed to get account info for ${provider}:`, error.message);
    return {
      id: 'unknown',
      name: 'Unknown Account',
      email: null,
      username: null
    };
  }
}

module.exports = router;
