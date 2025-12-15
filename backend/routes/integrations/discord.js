/**
 * Discord Integration API Routes
 * 20 endpoints for complete Discord functionality
 */

const express = require('express');
const router = express.Router();
const DiscordIntegration = require('../../integrations/discord');
const { authenticate } = require('../../middleware/auth');

/**
 * Middleware to initialize Discord client
 */
const initDiscordClient = (req, res, next) => {
  const token = req.body.token || req.query.token || req.headers['x-discord-token'];
  
  if (!token) {
    return res.status(400).json({
      success: false,
      error: 'Discord bot token is required',
    });
  }

  req.discordClient = new DiscordIntegration(token);
  next();
};

/**
 * 1. POST /api/integrations/discord/messages/send
 * Send a message to a channel
 */
router.post('/messages/send', authenticate, initDiscordClient, async (req, res, next) => {
  try {
    const { channel_id, content, ...options } = req.body;

    if (!channel_id || !content) {
      return res.status(400).json({
        success: false,
        error: 'Channel ID and content are required',
      });
    }

    const result = await req.discordClient.sendMessage(channel_id, content, options);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * 2. GET /api/integrations/discord/channels/list
 * List all channels in a guild
 */
router.get('/channels/list', authenticate, initDiscordClient, async (req, res, next) => {
  try {
    const { guild_id } = req.query;

    if (!guild_id) {
      return res.status(400).json({
        success: false,
        error: 'Guild ID is required',
      });
    }

    const result = await req.discordClient.listChannels(guild_id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * 3. POST /api/integrations/discord/channels/create
 * Create a new channel
 */
router.post('/channels/create', authenticate, initDiscordClient, async (req, res, next) => {
  try {
    const { guild_id, name, type, ...options } = req.body;

    if (!guild_id || !name) {
      return res.status(400).json({
        success: false,
        error: 'Guild ID and name are required',
      });
    }

    const result = await req.discordClient.createChannel(guild_id, name, type, options);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * 4. GET /api/integrations/discord/guilds/:id
 * Get guild information
 */
router.get('/guilds/:id', authenticate, initDiscordClient, async (req, res, next) => {
  try {
    const { with_counts } = req.query;
    const result = await req.discordClient.getGuild(req.params.id, with_counts !== 'false');
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * 5. GET /api/integrations/discord/members/list
 * List guild members
 */
router.get('/members/list', authenticate, initDiscordClient, async (req, res, next) => {
  try {
    const { guild_id, ...options } = req.query;

    if (!guild_id) {
      return res.status(400).json({
        success: false,
        error: 'Guild ID is required',
      });
    }

    const result = await req.discordClient.listMembers(guild_id, options);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * 6. POST /api/integrations/discord/roles/create
 * Create a new role
 */
router.post('/roles/create', authenticate, initDiscordClient, async (req, res, next) => {
  try {
    const { guild_id, name, ...options } = req.body;

    if (!guild_id || !name) {
      return res.status(400).json({
        success: false,
        error: 'Guild ID and name are required',
      });
    }

    const result = await req.discordClient.createRole(guild_id, name, options);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * 7. POST /api/integrations/discord/roles/assign
 * Assign role to member
 */
router.post('/roles/assign', authenticate, initDiscordClient, async (req, res, next) => {
  try {
    const { guild_id, user_id, role_id } = req.body;

    if (!guild_id || !user_id || !role_id) {
      return res.status(400).json({
        success: false,
        error: 'Guild ID, user ID, and role ID are required',
      });
    }

    const result = await req.discordClient.assignRole(guild_id, user_id, role_id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * 8. POST /api/integrations/discord/invites/create
 * Create channel invite
 */
router.post('/invites/create', authenticate, initDiscordClient, async (req, res, next) => {
  try {
    const { channel_id, ...options } = req.body;

    if (!channel_id) {
      return res.status(400).json({
        success: false,
        error: 'Channel ID is required',
      });
    }

    const result = await req.discordClient.createInvite(channel_id, options);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * 9. GET /api/integrations/discord/invites/list
 * List guild invites
 */
router.get('/invites/list', authenticate, initDiscordClient, async (req, res, next) => {
  try {
    const { guild_id } = req.query;

    if (!guild_id) {
      return res.status(400).json({
        success: false,
        error: 'Guild ID is required',
      });
    }

    const result = await req.discordClient.listInvites(guild_id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * 10. POST /api/integrations/discord/webhooks/create
 * Create a webhook
 */
router.post('/webhooks/create', authenticate, initDiscordClient, async (req, res, next) => {
  try {
    const { channel_id, name, ...options } = req.body;

    if (!channel_id || !name) {
      return res.status(400).json({
        success: false,
        error: 'Channel ID and name are required',
      });
    }

    const result = await req.discordClient.createWebhook(channel_id, name, options);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * 11. POST /api/integrations/discord/webhooks/execute
 * Execute a webhook
 */
router.post('/webhooks/execute', authenticate, async (req, res, next) => {
  try {
    const { webhook_id, webhook_token, content, ...options } = req.body;

    if (!webhook_id || !webhook_token || !content) {
      return res.status(400).json({
        success: false,
        error: 'Webhook ID, token, and content are required',
      });
    }

    // Note: Webhook execution doesn't require bot token
    const discordClient = new DiscordIntegration('');
    const result = await discordClient.executeWebhook(webhook_id, webhook_token, content, options);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * 12. GET /api/integrations/discord/emojis/list
 * List guild emojis
 */
router.get('/emojis/list', authenticate, initDiscordClient, async (req, res, next) => {
  try {
    const { guild_id } = req.query;

    if (!guild_id) {
      return res.status(400).json({
        success: false,
        error: 'Guild ID is required',
      });
    }

    const result = await req.discordClient.listEmojis(guild_id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * 13. POST /api/integrations/discord/emojis/create
 * Create custom emoji
 */
router.post('/emojis/create', authenticate, initDiscordClient, async (req, res, next) => {
  try {
    const { guild_id, name, image, ...options } = req.body;

    if (!guild_id || !name || !image) {
      return res.status(400).json({
        success: false,
        error: 'Guild ID, name, and image are required',
      });
    }

    const result = await req.discordClient.createEmoji(guild_id, name, image, options);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * 14. POST /api/integrations/discord/bans/create
 * Ban a member
 */
router.post('/bans/create', authenticate, initDiscordClient, async (req, res, next) => {
  try {
    const { guild_id, user_id, ...options } = req.body;

    if (!guild_id || !user_id) {
      return res.status(400).json({
        success: false,
        error: 'Guild ID and user ID are required',
      });
    }

    const result = await req.discordClient.createBan(guild_id, user_id, options);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * 15. GET /api/integrations/discord/bans/list
 * List guild bans
 */
router.get('/bans/list', authenticate, initDiscordClient, async (req, res, next) => {
  try {
    const { guild_id, ...options } = req.query;

    if (!guild_id) {
      return res.status(400).json({
        success: false,
        error: 'Guild ID is required',
      });
    }

    const result = await req.discordClient.listBans(guild_id, options);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * 16. POST /api/integrations/discord/kicks/execute
 * Kick a member
 */
router.post('/kicks/execute', authenticate, initDiscordClient, async (req, res, next) => {
  try {
    const { guild_id, user_id, reason } = req.body;

    if (!guild_id || !user_id) {
      return res.status(400).json({
        success: false,
        error: 'Guild ID and user ID are required',
      });
    }

    const result = await req.discordClient.kickMember(guild_id, user_id, reason);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * 17. GET /api/integrations/discord/audit-logs
 * Get guild audit logs
 */
router.get('/audit-logs', authenticate, initDiscordClient, async (req, res, next) => {
  try {
    const { guild_id, ...options } = req.query;

    if (!guild_id) {
      return res.status(400).json({
        success: false,
        error: 'Guild ID is required',
      });
    }

    const result = await req.discordClient.getAuditLogs(guild_id, options);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * 18. POST /api/integrations/discord/threads/create
 * Create a thread
 */
router.post('/threads/create', authenticate, initDiscordClient, async (req, res, next) => {
  try {
    const { channel_id, name, ...options } = req.body;

    if (!channel_id || !name) {
      return res.status(400).json({
        success: false,
        error: 'Channel ID and name are required',
      });
    }

    const result = await req.discordClient.createThread(channel_id, name, options);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * 19. GET /api/integrations/discord/threads/list
 * List active threads
 */
router.get('/threads/list', authenticate, initDiscordClient, async (req, res, next) => {
  try {
    const { guild_id } = req.query;

    if (!guild_id) {
      return res.status(400).json({
        success: false,
        error: 'Guild ID is required',
      });
    }

    const result = await req.discordClient.listThreads(guild_id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * 20. POST /api/integrations/discord/reactions/add
 * Add reaction to message
 */
router.post('/reactions/add', authenticate, initDiscordClient, async (req, res, next) => {
  try {
    const { channel_id, message_id, emoji } = req.body;

    if (!channel_id || !message_id || !emoji) {
      return res.status(400).json({
        success: false,
        error: 'Channel ID, message ID, and emoji are required',
      });
    }

    const result = await req.discordClient.addReaction(channel_id, message_id, emoji);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
