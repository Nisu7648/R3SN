/**
 * API Integrations Routes
 * Expose all real API integrations through REST endpoints
 */

const express = require('express');
const router = express.Router();
const APIManager = require('../integrations/APIManager');
const OAuth2Handler = require('../auth/OAuth2Handler');

const apiManager = new APIManager();
const oauth2Handler = new OAuth2Handler();

// ============================================
// OAUTH2 AUTHENTICATION
// ============================================

/**
 * Get OAuth2 authorization URL
 */
router.get('/auth/:provider/url', (req, res) => {
    try {
        const { provider } = req.params;
        const userId = req.query.userId || 'default';
        
        const url = oauth2Handler.getAuthorizationUrl(provider, userId);
        
        res.json({
            success: true,
            provider,
            authUrl: url
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

/**
 * OAuth2 callback
 */
router.get('/auth/:provider/callback', async (req, res) => {
    try {
        const { provider } = req.params;
        const { code, state } = req.query;
        
        const result = await oauth2Handler.exchangeCodeForTokens(provider, code, state);
        
        res.json({
            success: true,
            message: `Successfully connected to ${provider}`,
            ...result
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

/**
 * Revoke OAuth2 access
 */
router.post('/auth/:provider/revoke', async (req, res) => {
    try {
        const { provider } = req.params;
        const { userId } = req.body;
        
        const result = await oauth2Handler.revokeAccess(userId, provider);
        
        res.json(result);
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

/**
 * Get connected providers
 */
router.get('/auth/connected', (req, res) => {
    try {
        const userId = req.query.userId || 'default';
        const connected = oauth2Handler.getConnectedProviders(userId);
        
        res.json({
            success: true,
            userId,
            connected
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// ============================================
// STRIPE
// ============================================

router.post('/stripe/payment', async (req, res) => {
    try {
        const { amount, currency } = req.body;
        const result = await apiManager.stripe('createPaymentIntent', amount, currency);
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/stripe/customer', async (req, res) => {
    try {
        const { email, name } = req.body;
        const result = await apiManager.stripe('createCustomer', email, name);
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/stripe/subscription', async (req, res) => {
    try {
        const { customerId, priceId } = req.body;
        const result = await apiManager.stripe('createSubscription', customerId, priceId);
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// SLACK
// ============================================

router.post('/slack/message', async (req, res) => {
    try {
        const { channel, text, options } = req.body;
        const result = await apiManager.slack('sendMessage', channel, text, options);
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/slack/channels', async (req, res) => {
    try {
        const result = await apiManager.slack('listChannels');
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/slack/channel', async (req, res) => {
    try {
        const { name, isPrivate } = req.body;
        const result = await apiManager.slack('createChannel', name, isPrivate);
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// GOOGLE
// ============================================

router.post('/google/gmail/send', async (req, res) => {
    try {
        const { to, subject, body, options } = req.body;
        const result = await apiManager.google('sendEmail', to, subject, body, options);
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/google/calendar/event', async (req, res) => {
    try {
        const { summary, startTime, endTime, options } = req.body;
        const result = await apiManager.google('createEvent', summary, startTime, endTime, options);
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/google/drive/upload', async (req, res) => {
    try {
        const { fileName, mimeType, content, folderId } = req.body;
        const result = await apiManager.google('uploadFile', fileName, mimeType, content, folderId);
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/google/docs/create', async (req, res) => {
    try {
        const { title } = req.body;
        const result = await apiManager.google('createDocument', title);
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/google/sheets/create', async (req, res) => {
    try {
        const { title, sheets } = req.body;
        const result = await apiManager.google('createSpreadsheet', title, sheets);
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// GITHUB
// ============================================

router.get('/github/repos', async (req, res) => {
    try {
        const { username } = req.query;
        const result = await apiManager.github('listRepos', username);
        res.json({ success: true, repos: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/github/repo', async (req, res) => {
    try {
        const { name, options } = req.body;
        const result = await apiManager.github('createRepo', name, options);
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/github/issue', async (req, res) => {
    try {
        const { owner, repo, title, body, options } = req.body;
        const result = await apiManager.github('createIssue', owner, repo, title, body, options);
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/github/pr', async (req, res) => {
    try {
        const { owner, repo, title, head, base, body } = req.body;
        const result = await apiManager.github('createPR', owner, repo, title, head, base, body);
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// TWITTER
// ============================================

router.post('/twitter/tweet', async (req, res) => {
    try {
        const { text, options } = req.body;
        const result = await apiManager.twitter('postTweet', text, options);
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/twitter/timeline/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { maxResults } = req.query;
        const result = await apiManager.twitter('getUserTimeline', userId, parseInt(maxResults) || 10);
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/twitter/search', async (req, res) => {
    try {
        const { query, maxResults } = req.query;
        const result = await apiManager.twitter('searchRecentTweets', query, parseInt(maxResults) || 10);
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// API STATUS
// ============================================

router.get('/status', (req, res) => {
    const status = apiManager.getStatus();
    const available = apiManager.getAvailableAPIs();
    
    res.json({
        success: true,
        available,
        status,
        count: available.length
    });
});

router.get('/available', (req, res) => {
    const available = apiManager.getAvailableAPIs();
    
    res.json({
        success: true,
        apis: available,
        count: available.length,
        details: available.map(api => ({
            name: api,
            available: apiManager.isAvailable(api)
        }))
    });
});

module.exports = router;
