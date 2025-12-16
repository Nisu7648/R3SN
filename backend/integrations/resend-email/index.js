/**
 * Resend Modern Email API Integration
 */

const { Resend } = require('resend');

class ResendIntegration {
  constructor(config) {
    this.apiKey = config.apiKey || process.env.RESEND_API_KEY;
    if (!this.apiKey) throw new Error('Resend API key required');
    
    this.client = new Resend(this.apiKey);
  }

  async sendEmail(from, to, subject, html, options = {}) {
    try {
      const result = await this.client.emails.send({
        from,
        to,
        subject,
        html,
        ...options
      });
      
      return {
        success: true,
        id: result.id
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendBatch(emails) {
    try {
      const result = await this.client.batch.send(emails);
      
      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getEmail(emailId) {
    try {
      const result = await this.client.emails.get(emailId);
      
      return {
        success: true,
        email: result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createDomain(name) {
    try {
      const result = await this.client.domains.create({ name });
      
      return {
        success: true,
        domain: result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getDomain(domainId) {
    try {
      const result = await this.client.domains.get(domainId);
      
      return {
        success: true,
        domain: result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async listDomains() {
    try {
      const result = await this.client.domains.list();
      
      return {
        success: true,
        domains: result.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async verifyDomain(domainId) {
    try {
      const result = await this.client.domains.verify(domainId);
      
      return {
        success: true,
        domain: result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteDomain(domainId) {
    try {
      await this.client.domains.remove(domainId);
      
      return {
        success: true
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createApiKey(name, permission = 'full_access') {
    try {
      const result = await this.client.apiKeys.create({
        name,
        permission
      });
      
      return {
        success: true,
        apiKey: result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async listApiKeys() {
    try {
      const result = await this.client.apiKeys.list();
      
      return {
        success: true,
        apiKeys: result.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteApiKey(apiKeyId) {
    try {
      await this.client.apiKeys.remove(apiKeyId);
      
      return {
        success: true
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = ResendIntegration;
