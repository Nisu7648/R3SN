/**
 * Gmail Integration - Complete Implementation
 * 25 endpoints for full Gmail functionality
 */

const axios = require('axios');

class GmailIntegration {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseUrl = 'https://gmail.googleapis.com/gmail/v1';
  }

  /**
   * Get headers for API requests
   */
  getHeaders() {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * 1. Send Message
   * POST /users/me/messages/send
   */
  async sendMessage(to, subject, body, options = {}) {
    try {
      const email = [
        `To: ${to}`,
        `Subject: ${subject}`,
        '',
        body
      ].join('\n');

      const encodedMessage = Buffer.from(email).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await axios.post(
        `${this.baseUrl}/users/me/messages/send`,
        {
          raw: encodedMessage,
          ...options,
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        message: response.data,
      };
    } catch (error) {
      throw new Error(`Failed to send message: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * 2. List Messages
   * GET /users/me/messages
   */
  async listMessages(options = {}) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/users/me/messages`,
        {
          headers: this.getHeaders(),
          params: {
            maxResults: options.maxResults || 100,
            ...options,
          },
        }
      );

      return {
        success: true,
        messages: response.data.messages || [],
        nextPageToken: response.data.nextPageToken,
        resultSizeEstimate: response.data.resultSizeEstimate,
      };
    } catch (error) {
      throw new Error(`Failed to list messages: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * 3. Get Message
   * GET /users/me/messages/{id}
   */
  async getMessage(messageId, format = 'full') {
    try {
      const response = await axios.get(
        `${this.baseUrl}/users/me/messages/${messageId}`,
        {
          headers: this.getHeaders(),
          params: { format },
        }
      );

      return {
        success: true,
        message: response.data,
      };
    } catch (error) {
      throw new Error(`Failed to get message: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * 4. Delete Message
   * DELETE /users/me/messages/{id}
   */
  async deleteMessage(messageId) {
    try {
      await axios.delete(
        `${this.baseUrl}/users/me/messages/${messageId}`,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        message: 'Message deleted successfully',
      };
    } catch (error) {
      throw new Error(`Failed to delete message: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * 5. Modify Message
   * POST /users/me/messages/{id}/modify
   */
  async modifyMessage(messageId, addLabelIds = [], removeLabelIds = []) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/users/me/messages/${messageId}/modify`,
        {
          addLabelIds,
          removeLabelIds,
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        message: response.data,
      };
    } catch (error) {
      throw new Error(`Failed to modify message: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * 6. Create Draft
   * POST /users/me/drafts
   */
  async createDraft(to, subject, body) {
    try {
      const email = [
        `To: ${to}`,
        `Subject: ${subject}`,
        '',
        body
      ].join('\n');

      const encodedMessage = Buffer.from(email).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await axios.post(
        `${this.baseUrl}/users/me/drafts`,
        {
          message: {
            raw: encodedMessage,
          },
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        draft: response.data,
      };
    } catch (error) {
      throw new Error(`Failed to create draft: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * 7. Send Draft
   * POST /users/me/drafts/send
   */
  async sendDraft(draftId) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/users/me/drafts/send`,
        { id: draftId },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        message: response.data,
      };
    } catch (error) {
      throw new Error(`Failed to send draft: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * 8. List Drafts
   * GET /users/me/drafts
   */
  async listDrafts(options = {}) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/users/me/drafts`,
        {
          headers: this.getHeaders(),
          params: {
            maxResults: options.maxResults || 100,
            ...options,
          },
        }
      );

      return {
        success: true,
        drafts: response.data.drafts || [],
        nextPageToken: response.data.nextPageToken,
        resultSizeEstimate: response.data.resultSizeEstimate,
      };
    } catch (error) {
      throw new Error(`Failed to list drafts: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * 9. Delete Draft
   * DELETE /users/me/drafts/{id}
   */
  async deleteDraft(draftId) {
    try {
      await axios.delete(
        `${this.baseUrl}/users/me/drafts/${draftId}`,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        message: 'Draft deleted successfully',
      };
    } catch (error) {
      throw new Error(`Failed to delete draft: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * 10. List Labels
   * GET /users/me/labels
   */
  async listLabels() {
    try {
      const response = await axios.get(
        `${this.baseUrl}/users/me/labels`,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        labels: response.data.labels || [],
      };
    } catch (error) {
      throw new Error(`Failed to list labels: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * 11. Create Label
   * POST /users/me/labels
   */
  async createLabel(name, options = {}) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/users/me/labels`,
        {
          name,
          labelListVisibility: options.labelListVisibility || 'labelShow',
          messageListVisibility: options.messageListVisibility || 'show',
          ...options,
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        label: response.data,
      };
    } catch (error) {
      throw new Error(`Failed to create label: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * 12. Update Label
   * PUT /users/me/labels/{id}
   */
  async updateLabel(labelId, updates) {
    try {
      const response = await axios.put(
        `${this.baseUrl}/users/me/labels/${labelId}`,
        updates,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        label: response.data,
      };
    } catch (error) {
      throw new Error(`Failed to update label: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * 13. Delete Label
   * DELETE /users/me/labels/{id}
   */
  async deleteLabel(labelId) {
    try {
      await axios.delete(
        `${this.baseUrl}/users/me/labels/${labelId}`,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        message: 'Label deleted successfully',
      };
    } catch (error) {
      throw new Error(`Failed to delete label: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * 14. List Threads
   * GET /users/me/threads
   */
  async listThreads(options = {}) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/users/me/threads`,
        {
          headers: this.getHeaders(),
          params: {
            maxResults: options.maxResults || 100,
            ...options,
          },
        }
      );

      return {
        success: true,
        threads: response.data.threads || [],
        nextPageToken: response.data.nextPageToken,
        resultSizeEstimate: response.data.resultSizeEstimate,
      };
    } catch (error) {
      throw new Error(`Failed to list threads: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * 15. Get Thread
   * GET /users/me/threads/{id}
   */
  async getThread(threadId, format = 'full') {
    try {
      const response = await axios.get(
        `${this.baseUrl}/users/me/threads/${threadId}`,
        {
          headers: this.getHeaders(),
          params: { format },
        }
      );

      return {
        success: true,
        thread: response.data,
      };
    } catch (error) {
      throw new Error(`Failed to get thread: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * 16. Modify Thread
   * POST /users/me/threads/{id}/modify
   */
  async modifyThread(threadId, addLabelIds = [], removeLabelIds = []) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/users/me/threads/${threadId}/modify`,
        {
          addLabelIds,
          removeLabelIds,
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        thread: response.data,
      };
    } catch (error) {
      throw new Error(`Failed to modify thread: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * 17. Trash Message
   * POST /users/me/messages/{id}/trash
   */
  async trashMessage(messageId) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/users/me/messages/${messageId}/trash`,
        {},
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        message: response.data,
      };
    } catch (error) {
      throw new Error(`Failed to trash message: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * 18. Untrash Message
   * POST /users/me/messages/{id}/untrash
   */
  async untrashMessage(messageId) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/users/me/messages/${messageId}/untrash`,
        {},
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        message: response.data,
      };
    } catch (error) {
      throw new Error(`Failed to untrash message: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * 19. Get Attachment
   * GET /users/me/messages/{messageId}/attachments/{id}
   */
  async getAttachment(messageId, attachmentId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/users/me/messages/${messageId}/attachments/${attachmentId}`,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        attachment: response.data,
      };
    } catch (error) {
      throw new Error(`Failed to get attachment: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * 20. Get Profile
   * GET /users/me/profile
   */
  async getProfile() {
    try {
      const response = await axios.get(
        `${this.baseUrl}/users/me/profile`,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        profile: response.data,
      };
    } catch (error) {
      throw new Error(`Failed to get profile: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * 21. Watch Mailbox
   * POST /users/me/watch
   */
  async watchMailbox(topicName, labelIds = []) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/users/me/watch`,
        {
          topicName,
          labelIds,
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        watch: response.data,
      };
    } catch (error) {
      throw new Error(`Failed to watch mailbox: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * 22. Stop Watch
   * POST /users/me/stop
   */
  async stopWatch() {
    try {
      await axios.post(
        `${this.baseUrl}/users/me/stop`,
        {},
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        message: 'Watch stopped successfully',
      };
    } catch (error) {
      throw new Error(`Failed to stop watch: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * 23. Get History
   * GET /users/me/history
   */
  async getHistory(startHistoryId, options = {}) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/users/me/history`,
        {
          headers: this.getHeaders(),
          params: {
            startHistoryId,
            maxResults: options.maxResults || 100,
            ...options,
          },
        }
      );

      return {
        success: true,
        history: response.data.history || [],
        historyId: response.data.historyId,
        nextPageToken: response.data.nextPageToken,
      };
    } catch (error) {
      throw new Error(`Failed to get history: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * 24. Batch Modify
   * POST /users/me/messages/batchModify
   */
  async batchModify(messageIds, addLabelIds = [], removeLabelIds = []) {
    try {
      await axios.post(
        `${this.baseUrl}/users/me/messages/batchModify`,
        {
          ids: messageIds,
          addLabelIds,
          removeLabelIds,
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        message: 'Messages modified successfully',
      };
    } catch (error) {
      throw new Error(`Failed to batch modify: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * 25. Batch Delete
   * POST /users/me/messages/batchDelete
   */
  async batchDelete(messageIds) {
    try {
      await axios.post(
        `${this.baseUrl}/users/me/messages/batchDelete`,
        { ids: messageIds },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        message: 'Messages deleted successfully',
      };
    } catch (error) {
      throw new Error(`Failed to batch delete: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

module.exports = GmailIntegration;
