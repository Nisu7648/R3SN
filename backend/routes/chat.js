const express = require('express');
const router = express.Router();
const ConversationEngine = require('../core/ConversationEngine');

// Initialize conversation engine
const conversationEngine = new ConversationEngine({
  maxHistoryLength: 100,
  contextWindow: 20,
  enableWorkflows: true,
  enableAutomation: true,
  streamResponses: true
});

// Store user sessions
const userSessions = new Map();

/**
 * @route POST /api/chat/conversation/create
 * @desc Create a new conversation
 */
router.post('/conversation/create', (req, res) => {
  try {
    const { userId, metadata } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    const conversation = conversationEngine.createConversation(userId, metadata);
    
    // Store in user sessions
    if (!userSessions.has(userId)) {
      userSessions.set(userId, []);
    }
    userSessions.get(userId).push(conversation.id);

    res.json({
      success: true,
      conversation: {
        id: conversation.id,
        userId: conversation.userId,
        createdAt: conversation.createdAt,
        state: conversation.state
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/chat/message
 * @desc Send a message and get response
 */
router.post('/message', async (req, res) => {
  try {
    const { conversationId, message, options } = req.body;
    
    if (!conversationId || !message) {
      return res.status(400).json({
        success: false,
        error: 'conversationId and message are required'
      });
    }

    const response = await conversationEngine.processMessage(
      conversationId,
      message,
      options || {}
    );

    res.json({
      success: true,
      ...response
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/chat/conversation/:conversationId
 * @desc Get conversation details
 */
router.get('/conversation/:conversationId', (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = conversationEngine.getConversation(conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    res.json({
      success: true,
      conversation: {
        id: conversation.id,
        userId: conversation.userId,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        messageCount: conversation.metadata.messageCount,
        state: conversation.state,
        metadata: conversation.metadata
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/chat/history/:conversationId
 * @desc Get conversation history
 */
router.get('/history/:conversationId', (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50 } = req.query;
    
    const history = conversationEngine.getHistory(conversationId, parseInt(limit));
    
    res.json({
      success: true,
      conversationId,
      messageCount: history.length,
      messages: history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/chat/user/:userId/conversations
 * @desc Get all conversations for a user
 */
router.get('/user/:userId/conversations', (req, res) => {
  try {
    const { userId } = req.params;
    const conversationIds = userSessions.get(userId) || [];
    
    const conversations = conversationIds
      .map(id => conversationEngine.getConversation(id))
      .filter(conv => conv !== undefined)
      .map(conv => ({
        id: conv.id,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        messageCount: conv.metadata.messageCount,
        state: conv.state
      }));

    res.json({
      success: true,
      userId,
      count: conversations.length,
      conversations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route DELETE /api/chat/conversation/:conversationId/clear
 * @desc Clear conversation history
 */
router.delete('/conversation/:conversationId/clear', (req, res) => {
  try {
    const { conversationId } = req.params;
    conversationEngine.clearConversation(conversationId);
    
    res.json({
      success: true,
      message: 'Conversation cleared successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route DELETE /api/chat/conversation/:conversationId
 * @desc Delete conversation
 */
router.delete('/conversation/:conversationId', (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = conversationEngine.getConversation(conversationId);
    
    if (conversation) {
      // Remove from user sessions
      const userId = conversation.userId;
      if (userSessions.has(userId)) {
        const sessions = userSessions.get(userId);
        const index = sessions.indexOf(conversationId);
        if (index > -1) {
          sessions.splice(index, 1);
        }
      }
    }
    
    conversationEngine.deleteConversation(conversationId);
    
    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/chat/workflow/create
 * @desc Start workflow creation
 */
router.post('/workflow/create', async (req, res) => {
  try {
    const { conversationId, workflowName } = req.body;
    
    if (!conversationId) {
      return res.status(400).json({
        success: false,
        error: 'conversationId is required'
      });
    }

    const message = workflowName 
      ? `Create a ${workflowName} workflow`
      : 'Create a new workflow';

    const response = await conversationEngine.processMessage(
      conversationId,
      message,
      { metadata: { intent: 'workflow' } }
    );

    res.json({
      success: true,
      ...response
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/chat/automation/create
 * @desc Create automation
 */
router.post('/automation/create', async (req, res) => {
  try {
    const { conversationId, schedule, action } = req.body;
    
    if (!conversationId || !schedule || !action) {
      return res.status(400).json({
        success: false,
        error: 'conversationId, schedule, and action are required'
      });
    }

    const message = `Schedule ${action} ${schedule}`;

    const response = await conversationEngine.processMessage(
      conversationId,
      message,
      { metadata: { intent: 'automation' } }
    );

    res.json({
      success: true,
      ...response
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/chat/stats
 * @desc Get chat statistics
 */
router.get('/stats', (req, res) => {
  try {
    let totalConversations = 0;
    let totalMessages = 0;
    let totalWorkflows = 0;
    let totalAutomations = 0;
    let activeConversations = 0;

    userSessions.forEach(sessions => {
      sessions.forEach(convId => {
        const conv = conversationEngine.getConversation(convId);
        if (conv) {
          totalConversations++;
          totalMessages += conv.metadata.messageCount;
          totalWorkflows += conv.metadata.workflowsExecuted;
          totalAutomations += conv.metadata.automationsRun;
          
          // Active if updated in last hour
          const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
          if (conv.updatedAt > hourAgo) {
            activeConversations++;
          }
        }
      });
    });

    res.json({
      success: true,
      stats: {
        totalConversations,
        activeConversations,
        totalMessages,
        totalWorkflows,
        totalAutomations,
        totalUsers: userSessions.size
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/chat/stream
 * @desc Stream chat responses (SSE)
 */
router.post('/stream', async (req, res) => {
  try {
    const { conversationId, message } = req.body;
    
    if (!conversationId || !message) {
      return res.status(400).json({
        success: false,
        error: 'conversationId and message are required'
      });
    }

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send initial event
    res.write(`data: ${JSON.stringify({ type: 'start', message: 'Processing...' })}\n\n`);

    // Process message
    const response = await conversationEngine.processMessage(conversationId, message);

    // Stream response in chunks
    const content = response.message.content;
    const chunkSize = 50;
    
    for (let i = 0; i < content.length; i += chunkSize) {
      const chunk = content.slice(i, i + chunkSize);
      res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
      await new Promise(resolve => setTimeout(resolve, 50)); // Simulate streaming
    }

    // Send completion event
    res.write(`data: ${JSON.stringify({ 
      type: 'complete', 
      message: response.message,
      suggestions: response.suggestions 
    })}\n\n`);

    res.end();
  } catch (error) {
    res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
    res.end();
  }
});

module.exports = router;
