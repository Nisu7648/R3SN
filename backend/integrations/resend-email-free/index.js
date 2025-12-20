const axios = require('axios');

/**
 * Resend Email Premium Integration
 * FREE Transactional Email API
 * 3,000 emails/month FREE (worth $250/month)
 * Best-in-class deliverability, React email templates
 */
class ResendEmailIntegration {
  constructor(apiKey) {
    this.apiKey = apiKey || 'YOUR_RESEND_API_KEY';
    this.baseURL = 'https://api.resend.com';
  }

  /**
   * Send an email
   */
  async sendEmail(from, to, subject, html, text = null, replyTo = null, attachments = null) {
    try {
      const payload = {
        from,
        to: Array.isArray(to) ? to : [to],
        subject,
        html
      };

      if (text) payload.text = text;
      if (replyTo) payload.reply_to = replyTo;
      if (attachments) payload.attachments = attachments;

      const response = await axios.post(
        `${this.baseURL}/emails`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        id: response.data.id
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Send email with React template
   */
  async sendWithReact(from, to, subject, react, text = null) {
    try {
      const response = await axios.post(
        `${this.baseURL}/emails`,
        {
          from,
          to: Array.isArray(to) ? to : [to],
          subject,
          react,
          ...(text && { text })
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        id: response.data.id
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Send batch emails
   */
  async sendBatch(emails) {
    try {
      const response = await axios.post(
        `${this.baseURL}/emails/batch`,
        emails,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get email details
   */
  async getEmail(emailId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/emails/${emailId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return {
        success: true,
        data: response.data,
        email: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create domain
   */
  async createDomain(name, region = 'us-east-1') {
    try {
      const response = await axios.post(
        `${this.baseURL}/domains`,
        { name, region },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        domain: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List domains
   */
  async listDomains() {
    try {
      const response = await axios.get(
        `${this.baseURL}/domains`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return {
        success: true,
        data: response.data,
        domains: response.data.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get domain
   */
  async getDomain(domainId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/domains/${domainId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return {
        success: true,
        data: response.data,
        domain: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Verify domain
   */
  async verifyDomain(domainId) {
    try {
      const response = await axios.post(
        `${this.baseURL}/domains/${domainId}/verify`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return {
        success: true,
        data: response.data,
        domain: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete domain
   */
  async deleteDomain(domainId) {
    try {
      const response = await axios.delete(
        `${this.baseURL}/domains/${domainId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create API key
   */
  async createApiKey(name, permission = 'full_access') {
    try {
      const response = await axios.post(
        `${this.baseURL}/api-keys`,
        { name, permission },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        apiKey: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List API keys
   */
  async listApiKeys() {
    try {
      const response = await axios.get(
        `${this.baseURL}/api-keys`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return {
        success: true,
        data: response.data,
        apiKeys: response.data.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete API key
   */
  async deleteApiKey(apiKeyId) {
    try {
      const response = await axios.delete(
        `${this.baseURL}/api-keys/${apiKeyId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create audience
   */
  async createAudience(name) {
    try {
      const response = await axios.post(
        `${this.baseURL}/audiences`,
        { name },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        audience: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List audiences
   */
  async listAudiences() {
    try {
      const response = await axios.get(
        `${this.baseURL}/audiences`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return {
        success: true,
        data: response.data,
        audiences: response.data.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Add contact to audience
   */
  async addContact(audienceId, email, firstName = null, lastName = null) {
    try {
      const response = await axios.post(
        `${this.baseURL}/audiences/${audienceId}/contacts`,
        {
          email,
          ...(firstName && { first_name: firstName }),
          ...(lastName && { last_name: lastName })
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        contact: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List contacts in audience
   */
  async listContacts(audienceId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/audiences/${audienceId}/contacts`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return {
        success: true,
        data: response.data,
        contacts: response.data.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Remove contact from audience
   */
  async removeContact(audienceId, contactId) {
    try {
      const response = await axios.delete(
        `${this.baseURL}/audiences/${audienceId}/contacts/${contactId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Send broadcast email
   */
  async sendBroadcast(audienceId, from, subject, html, text = null) {
    try {
      const response = await axios.post(
        `${this.baseURL}/broadcasts`,
        {
          audience_id: audienceId,
          from,
          subject,
          html,
          ...(text && { text })
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        broadcast: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = ResendEmailIntegration;
