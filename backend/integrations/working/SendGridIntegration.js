/**
 * SENDGRID INTEGRATION - FULLY WORKING
 * Email sending integration
 * 
 * FREE TIER: 100 emails/day forever
 * Get API key: https://app.sendgrid.com/settings/api_keys
 * 
 * Usage:
 *   const sendgrid = new SendGridIntegration({ apiKey: 'SG.xxx' });
 *   await sendgrid.sendEmail({
 *     to: 'user@example.com',
 *     from: 'you@yourdomain.com',
 *     subject: 'Hello',
 *     text: 'Hello World'
 *   });
 */

const BaseIntegration = require('../core/BaseIntegration');

class SendGridIntegration extends BaseIntegration {
  constructor(config = {}) {
    super({
      name: 'sendgrid',
      baseURL: 'https://api.sendgrid.com/v3',
      ...config
    });
  }

  getDefaultHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Send email
   */
  async sendEmail(data) {
    this.validateApiKey();
    
    const payload = {
      personalizations: [{
        to: Array.isArray(data.to) ? data.to.map(email => ({ email })) : [{ email: data.to }],
        subject: data.subject
      }],
      from: { email: data.from, name: data.fromName },
      content: [{
        type: data.html ? 'text/html' : 'text/plain',
        value: data.html || data.text
      }]
    };

    if (data.cc) {
      payload.personalizations[0].cc = Array.isArray(data.cc) 
        ? data.cc.map(email => ({ email })) 
        : [{ email: data.cc }];
    }

    if (data.bcc) {
      payload.personalizations[0].bcc = Array.isArray(data.bcc)
        ? data.bcc.map(email => ({ email }))
        : [{ email: data.bcc }];
    }

    if (data.attachments) {
      payload.attachments = data.attachments;
    }

    const response = await this.post('/mail/send', payload);
    return { 
      success: true, 
      messageId: response.headers['x-message-id'],
      message: 'Email sent successfully' 
    };
  }

  /**
   * Send template email
   */
  async sendTemplateEmail(data) {
    this.validateApiKey();
    
    const payload = {
      personalizations: [{
        to: [{ email: data.to }],
        dynamic_template_data: data.templateData || {}
      }],
      from: { email: data.from, name: data.fromName },
      template_id: data.templateId
    };

    const response = await this.post('/mail/send', payload);
    return { 
      success: true, 
      messageId: response.headers['x-message-id'],
      message: 'Template email sent successfully' 
    };
  }

  /**
   * Get email statistics
   */
  async getStats(startDate) {
    this.validateApiKey();
    const response = await this.get('/stats', {
      start_date: startDate,
      aggregated_by: 'day'
    });
    return { success: true, stats: response.data };
  }

  /**
   * Validate email
   */
  async validateEmail(email) {
    this.validateApiKey();
    const response = await this.post('/validations/email', { email });
    return { 
      success: true, 
      valid: response.data.verdict === 'Valid',
      result: response.data 
    };
  }

  /**
   * Get suppression list
   */
  async getSuppressions(type = 'bounces') {
    this.validateApiKey();
    const response = await this.get(`/suppression/${type}`);
    return { success: true, suppressions: response.data };
  }

  async testConnection() {
    try {
      await this.getStats(new Date().toISOString().split('T')[0]);
      return { success: true, integration: this.name, message: 'Connection successful' };
    } catch (error) {
      return { success: false, integration: this.name, error: error.message };
    }
  }
}

module.exports = SendGridIntegration;
