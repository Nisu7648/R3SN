const axios = require('axios');

/**
 * Twilio Complete Integration
 * SMS, Voice, WhatsApp, and Video communication
 */
class TwilioIntegration {
  constructor(accountSid, authToken, phoneNumber) {
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.phoneNumber = phoneNumber;
    this.baseURL = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}`;
    this.auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
  }

  // Send SMS
  async sendSMS(to, message) {
    const params = new URLSearchParams({
      To: to,
      From: this.phoneNumber,
      Body: message
    });

    const response = await axios.post(`${this.baseURL}/Messages.json`, params, {
      headers: {
        'Authorization': `Basic ${this.auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return response.data;
  }

  // Make voice call
  async makeCall(to, message) {
    const twimlUrl = `http://twimlets.com/message?Message=${encodeURIComponent(message)}`;
    const params = new URLSearchParams({
      To: to,
      From: this.phoneNumber,
      Url: twimlUrl
    });

    const response = await axios.post(`${this.baseURL}/Calls.json`, params, {
      headers: {
        'Authorization': `Basic ${this.auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return response.data;
  }

  // Send WhatsApp message
  async sendWhatsApp(to, message) {
    const params = new URLSearchParams({
      To: `whatsapp:${to}`,
      From: `whatsapp:${this.phoneNumber}`,
      Body: message
    });

    const response = await axios.post(`${this.baseURL}/Messages.json`, params, {
      headers: {
        'Authorization': `Basic ${this.auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return response.data;
  }

  // List messages
  async listMessages(limit = 20) {
    const response = await axios.get(`${this.baseURL}/Messages.json`, {
      headers: { 'Authorization': `Basic ${this.auth}` },
      params: { PageSize: limit }
    });
    return response.data;
  }

  // Get message
  async getMessage(messageSid) {
    const response = await axios.get(`${this.baseURL}/Messages/${messageSid}.json`, {
      headers: { 'Authorization': `Basic ${this.auth}` }
    });
    return response.data;
  }

  // List calls
  async listCalls(limit = 20) {
    const response = await axios.get(`${this.baseURL}/Calls.json`, {
      headers: { 'Authorization': `Basic ${this.auth}` },
      params: { PageSize: limit }
    });
    return response.data;
  }

  // Get call
  async getCall(callSid) {
    const response = await axios.get(`${this.baseURL}/Calls/${callSid}.json`, {
      headers: { 'Authorization': `Basic ${this.auth}` }
    });
    return response.data;
  }

  // Send MMS
  async sendMMS(to, message, mediaUrl) {
    const params = new URLSearchParams({
      To: to,
      From: this.phoneNumber,
      Body: message,
      MediaUrl: mediaUrl
    });

    const response = await axios.post(`${this.baseURL}/Messages.json`, params, {
      headers: {
        'Authorization': `Basic ${this.auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return response.data;
  }
}

module.exports = TwilioIntegration;
