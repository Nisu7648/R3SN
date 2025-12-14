/**
 * Slack Integration API Routes
 * 20 endpoints for complete Slack functionality
 */

const express = require('express');
const router = express.Router();
const SlackIntegration = require('../../integrations/slack');
const { authenticate } = require('../../middleware/auth');

/**
 * Middleware to initialize Slack client
 */
const initSlackClient = (req, res, next) => {
  const token = req.body.token || req.query.token || req.headers['x-slack-token'];
  
  if (!token) {
    return res.status(400).json({
      success: false,
      error: 'Slack token is required',
    });
  }

  req.slackClient = new SlackIntegration(token);
  next();
};

/**
 * 1. POST /api/integrations/slack/messages/send
 * Send a message to a channel
 */
router.post('/messages/send', authenticate, initSlackClient, async (req, res, next) => {
  try {
    const { channel, text, ...options } = req.body;

    if (!channel || !text) {
      return res.status(400).json({
        success: false,
        error: 'Channel and text are required',
      });
    }

    const result = await req.slackClient.sendMessage(channel, text, options);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * 2. GET /api/integrations/slack/channels/list
 * List all channels
 */
router.get('/channels/list', authenticate, initSlackClient, async (req, res, next) => {
  try {
    const result = await req.slackClient.listChannels(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * 3. POST /api/integrations/slack/channels/create
 * Create a new channel
 */
router.post('/channels/create', authenticate, initSlackClient, async (req, res, next) => {
  try {
    const { name, is_private } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Channel name is required',
      });
    }

    const result = await req.slackClient.createChannel(name, is_private);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * 4. GET /api/integrations/slack/users/list
 * List all users
 */
router.get('/users/list', authenticate, initSlackClient, async (req, res, next) => {
  try {
    const result = await req.slackClient.listUsers(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * 5. GET /api/integrations/slack/users/:id
 * Get user information
 */
router.get('/users/:id', authenticate, initSlackClient, async (req, res, next) => {
  try {
    const result = await req.slackClient.getUser(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * 6. POST /api/integrations/slack/files/upload
 * Upload a file
 */
router.post('/files/upload', authenticate, initSlackClient, async (req, res, next) => {
  try {
    const { channels, file, ...options } = req.body;

    if (!channels || !file) {
      return res.status(400).json({
        success: false,
        error: 'Channels and file are required',
      });
    }

    const result = await req.slackClient.uploadFile(channels, file, options);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * 7. GET /api/integrations/slack/conversations/history
 * Get conversation history
 */
router.get('/conversations/history', authenticate, initSlackClient, async (req, res, next) => {
  try {
    const { channel } = req.query;

    if (!channel) {
      return res.status(400).json({
        success: false,
        error: 'Channel is required',
      });
    }

    const result = await req.slackClient.getConversationHistory(channel, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * 8. POST /api/integrations/slack/conversations/invite
 * Invite users to conversation
 */
router.post('/conversations/invite', authenticate, initSlackClient, async (req, res, next) => {
  try {
    const { channel, users } = req.body;

    if (!channel || !users) {
      return res.status(400).json({
        success: false,
        error: 'Channel and users are required',
      });
    }

    const result = await req.slackClient.inviteToConversation(channel, users);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * 9. POST /api/integrations/slack/reactions/add
 * Add reaction to message
 */
router.post('/reactions/add', authenticate, initSlackClient, async (req, res, next) => {
  try {
    const { channel, timestamp, name } = req.body;

    if (!channel || !timestamp || !name) {
      return res.status(400).json({
        success: false,
        error: 'Channel, timestamp, and name are required',
      });
    }

    const result = await req.slackClient.addReaction(channel, timestamp, name);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * 10. GET /api/integrations/slack/team/info
 * Get team information
 */
router.get('/team/info', authenticate, initSlackClient, async (req, res, next) => {
  try {
    const result = await req.slackClient.getTeamInfo();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * 11. POST /api/integrations/slack/reminders/add
 * Add a reminder
 */
router.post('/reminders/add', authenticate, initSlackClient, async (req, res, next) => {
  try {
    const { text, time, ...options } = req.body;

    if (!text || !time) {
      return res.status(400).json({
        success: false,
        error: 'Text and time are required',
      });
    }

    const result = await req.slackClient.addReminder(text, time, options);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * 12. GET /api/integrations/slack/reminders/list
 * List all reminders
 */
router.get('/reminders/list', authenticate, initSlackClient, async (req, res, next) => {
  try {
    const result = await req.slackClient.listReminders();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * 13. POST /api/integrations/slack/pins/add
 * Pin a message
 */
router.post('/pins/add', authenticate, initSlackClient, async (req, res, next) => {
  try {
    const { channel, timestamp } = req.body;

    if (!channel || !timestamp) {
      return res.status(400).json({
        success: false,
        error: 'Channel and timestamp are required',
      });
    }

    const result = await req.slackClient.addPin(channel, timestamp);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * 14. GET /api/integrations/slack/pins/list
 * List pinned messages
 */
router.get('/pins/list', authenticate, initSlackClient, async (req, res, next) => {
  try {
    const { channel } = req.query;

    if (!channel) {
      return res.status(400).json({
        success: false,
        error: 'Channel is required',
      });
    }

    const result = await req.slackClient.listPins(channel);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * 15. POST /api/integrations/slack/bookmarks/add
 * Add a bookmark
 */
router.post('/bookmarks/add', authenticate, initSlackClient, async (req, res, next) => {
  try {
    const { channel, title, type, link } = req.body;

    if (!channel || !title || !type || !link) {
      return res.status(400).json({
        success: false,
        error: 'Channel, title, type, and link are required',
      });
    }

    const result = await req.slackClient.addBookmark(channel, title, type, link);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * 16. GET /api/integrations/slack/search/messages
 * Search messages
 */
router.get('/search/messages', authenticate, initSlackClient, async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required',
      });
    }

    const result = await req.slackClient.searchMessages(query, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * 17. POST /api/integrations/slack/usergroups/create
 * Create a user group
 */
router.post('/usergroups/create', authenticate, initSlackClient, async (req, res, next) => {
  try {
    const { name, ...options } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Name is required',
      });
    }

    const result = await req.slackClient.createUserGroup(name, options);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * 18. GET /api/integrations/slack/usergroups/list
 * List user groups
 */
router.get('/usergroups/list', authenticate, initSlackClient, async (req, res, next) => {
  try {
    const result = await req.slackClient.listUserGroups(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * 19. POST /api/integrations/slack/workflows/trigger
 * Trigger a workflow
 */
router.post('/workflows/trigger', authenticate, initSlackClient, async (req, res, next) => {
  try {
    const { workflow_step_execute_id, outputs } = req.body;

    if (!workflow_step_execute_id || !outputs) {
      return res.status(400).json({
        success: false,
        error: 'Workflow step execute ID and outputs are required',
      });
    }

    const result = await req.slackClient.triggerWorkflow(workflow_step_execute_id, outputs);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * 20. GET /api/integrations/slack/analytics/stats
 * Get analytics
 */
router.get('/analytics/stats', authenticate, initSlackClient, async (req, res, next) => {
  try {
    const { type, date } = req.query;

    if (!type || !date) {
      return res.status(400).json({
        success: false,
        error: 'Type and date are required',
      });
    }

    const result = await req.slackClient.getAnalytics(type, date);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
