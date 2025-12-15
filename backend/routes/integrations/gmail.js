/**
 * Gmail Integration API Routes
 * 25 endpoints for complete Gmail functionality
 */

const express = require('express');
const router = express.Router();
const GmailIntegration = require('../../integrations/gmail');
const { authenticate } = require('../../middleware/auth');

const initGmailClient = (req, res, next) => {
  const token = req.body.token || req.query.token || req.headers['x-gmail-token'];
  if (!token) {
    return res.status(400).json({ success: false, error: 'Gmail access token is required' });
  }
  req.gmailClient = new GmailIntegration(token);
  next();
};

// 1. Send Message
router.post('/messages/send', authenticate, initGmailClient, async (req, res, next) => {
  try {
    const { to, subject, body, ...options } = req.body;
    if (!to || !subject || !body) {
      return res.status(400).json({ success: false, error: 'To, subject, and body are required' });
    }
    const result = await req.gmailClient.sendMessage(to, subject, body, options);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// 2. List Messages
router.get('/messages/list', authenticate, initGmailClient, async (req, res, next) => {
  try {
    const result = await req.gmailClient.listMessages(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// 3. Get Message
router.get('/messages/:id', authenticate, initGmailClient, async (req, res, next) => {
  try {
    const { format } = req.query;
    const result = await req.gmailClient.getMessage(req.params.id, format);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// 4. Delete Message
router.delete('/messages/:id', authenticate, initGmailClient, async (req, res, next) => {
  try {
    const result = await req.gmailClient.deleteMessage(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// 5. Modify Message
router.post('/messages/:id/modify', authenticate, initGmailClient, async (req, res, next) => {
  try {
    const { addLabelIds, removeLabelIds } = req.body;
    const result = await req.gmailClient.modifyMessage(req.params.id, addLabelIds, removeLabelIds);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// 6. Create Draft
router.post('/drafts/create', authenticate, initGmailClient, async (req, res, next) => {
  try {
    const { to, subject, body } = req.body;
    if (!to || !subject || !body) {
      return res.status(400).json({ success: false, error: 'To, subject, and body are required' });
    }
    const result = await req.gmailClient.createDraft(to, subject, body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// 7. Send Draft
router.post('/drafts/:id/send', authenticate, initGmailClient, async (req, res, next) => {
  try {
    const result = await req.gmailClient.sendDraft(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// 8. List Drafts
router.get('/drafts/list', authenticate, initGmailClient, async (req, res, next) => {
  try {
    const result = await req.gmailClient.listDrafts(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// 9. Delete Draft
router.delete('/drafts/:id', authenticate, initGmailClient, async (req, res, next) => {
  try {
    const result = await req.gmailClient.deleteDraft(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// 10. List Labels
router.get('/labels/list', authenticate, initGmailClient, async (req, res, next) => {
  try {
    const result = await req.gmailClient.listLabels();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// 11. Create Label
router.post('/labels/create', authenticate, initGmailClient, async (req, res, next) => {
  try {
    const { name, ...options } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }
    const result = await req.gmailClient.createLabel(name, options);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// 12. Update Label
router.put('/labels/:id', authenticate, initGmailClient, async (req, res, next) => {
  try {
    const result = await req.gmailClient.updateLabel(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// 13. Delete Label
router.delete('/labels/:id', authenticate, initGmailClient, async (req, res, next) => {
  try {
    const result = await req.gmailClient.deleteLabel(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// 14. List Threads
router.get('/threads/list', authenticate, initGmailClient, async (req, res, next) => {
  try {
    const result = await req.gmailClient.listThreads(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// 15. Get Thread
router.get('/threads/:id', authenticate, initGmailClient, async (req, res, next) => {
  try {
    const { format } = req.query;
    const result = await req.gmailClient.getThread(req.params.id, format);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// 16. Modify Thread
router.post('/threads/:id/modify', authenticate, initGmailClient, async (req, res, next) => {
  try {
    const { addLabelIds, removeLabelIds } = req.body;
    const result = await req.gmailClient.modifyThread(req.params.id, addLabelIds, removeLabelIds);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// 17. Trash Message
router.post('/messages/:id/trash', authenticate, initGmailClient, async (req, res, next) => {
  try {
    const result = await req.gmailClient.trashMessage(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// 18. Untrash Message
router.post('/messages/:id/untrash', authenticate, initGmailClient, async (req, res, next) => {
  try {
    const result = await req.gmailClient.untrashMessage(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// 19. Get Attachment
router.get('/attachments/:messageId/:id', authenticate, initGmailClient, async (req, res, next) => {
  try {
    const result = await req.gmailClient.getAttachment(req.params.messageId, req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// 20. Get Profile
router.get('/profile', authenticate, initGmailClient, async (req, res, next) => {
  try {
    const result = await req.gmailClient.getProfile();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// 21. Watch Mailbox
router.post('/watch', authenticate, initGmailClient, async (req, res, next) => {
  try {
    const { topicName, labelIds } = req.body;
    if (!topicName) {
      return res.status(400).json({ success: false, error: 'Topic name is required' });
    }
    const result = await req.gmailClient.watchMailbox(topicName, labelIds);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// 22. Stop Watch
router.post('/stop', authenticate, initGmailClient, async (req, res, next) => {
  try {
    const result = await req.gmailClient.stopWatch();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// 23. Get History
router.get('/history', authenticate, initGmailClient, async (req, res, next) => {
  try {
    const { startHistoryId, ...options } = req.query;
    if (!startHistoryId) {
      return res.status(400).json({ success: false, error: 'Start history ID is required' });
    }
    const result = await req.gmailClient.getHistory(startHistoryId, options);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// 24. Batch Modify
router.post('/messages/batchModify', authenticate, initGmailClient, async (req, res, next) => {
  try {
    const { ids, addLabelIds, removeLabelIds } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ success: false, error: 'Message IDs array is required' });
    }
    const result = await req.gmailClient.batchModify(ids, addLabelIds, removeLabelIds);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// 25. Batch Delete
router.post('/messages/batchDelete', authenticate, initGmailClient, async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ success: false, error: 'Message IDs array is required' });
    }
    const result = await req.gmailClient.batchDelete(ids);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
