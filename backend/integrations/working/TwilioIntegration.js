/**
 * TWILIO INTEGRATION - FULLY WORKING
 * SMS and Voice integration
 * 
 * FREE TRIAL: $15 credit
 * Get credentials: https://www.twilio.com/console
 * 
 * Usage:
 *   const twilio = new TwilioIntegration({ 
 *     accountSid: 'ACxxx',
 *     authToken: 'xxx',
 *     fromNumber: '+1234567890'
 *   });
 *   await twilio.sendSMS('+1234567890', 'Hello World');
 */

const BaseIntegration = require('../core/BaseIntegration');

class TwilioIntegration extends BaseIntegration {
  constructor(config = {}) {
    super({
      name: 'twilio',
      baseURL: `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}`,
      ...config
    });
    this.accountSid = config.accountSid;
    this.authToken = config.authToken || this.apiKey;
    this.fromNumber = config.fromNumber;
  }

  getDefaultHeaders() {
    const credentials = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
    return {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    };
  }

  /**
   * Send SMS
   */
  async sendSMS(to, body, from = null) {
    this.validateApiKey();
    
    const formData = new URLSearchParams({
      To: to,
      From: from || this.fromNumber,
      Body: body
    }).toString();

    const response = await this.post('/Messages.json', formData);
    return {
      success: true,
      messageId: response.data.sid,
      status: response.data.status,
      message: 'SMS sent successfully'
    };
  }

  /**
   * Make phone call
   */
  async makeCall(to, url, from = null) {
    this.validateApiKey();
    
    const formData = new URLSearchParams({
      To: to,
      From: from || this.fromNumber,
      Url: url
    }).toString();

    const response = await this.post('/Calls.json', formData);
    return {
      success: true,
      callId: response.data.sid,
      status: response.data.status,
      message: 'Call initiated successfully'
    };
  }

  /**
   * Get message status
   */
  async getMessageStatus(messageSid) {
    this.validateApiKey();
    const response = await this.get(`/Messages/${messageSid}.json`);
    return {
      success: true,
      message: response.data
    };
  }

  /**
   * List messages
   */
  async listMessages(limit = 20) {
    this.validateApiKey();
    const response = await this.get('/Messages.json', { PageSize: limit });
    return {
      success: true,
      messages: response.data.messages,
      total: response.data.messages.length
    };
  }

  /**
   * Send WhatsApp message
   */
  async sendWhatsApp(to, body) {
    this.validateApiKey();
    
    const formData = new URLSearchParams({
      To: `whatsapp:${to}`,
      From: `whatsapp:${this.fromNumber}`,
      Body: body
    }).toString();

    const response = await this.post('/Messages.json', formData);
    return {
      success: true,
      messageId: response.data.sid,
      status: response.data.status
    };
  }

  /**
   * Get account balance
   */
  async getBalance() {
    this.validateApiKey();
    const response = await this.get('/Balance.json');
    return {
      success: true,
      balance: response.data.balance,
      currency: response.data.currency
    };
  }

  async testConnection() {
    try {
      await this.getBalance();
      return { success: true, integration: this.name, message: 'Connection successful' };
    } catch (error) {
      return { success: false, integration: this.name, error: error.message };
    }
  }
}

module.exports = TwilioIntegration;
