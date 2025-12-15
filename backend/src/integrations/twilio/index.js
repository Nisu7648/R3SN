/**
 * Twilio Integration
 * Real Twilio API for SMS, Voice, WhatsApp
 */

const axios = require('axios');

class TwilioIntegration {
  constructor(config) {
    this.config = config;
    this.validateConfig();
    this.baseUrl = 'https://api.twilio.com/2010-04-01';
  }

  validateConfig() {
    if (!this.config.accountSid || !this.config.authToken) {
      throw new Error('Twilio Account SID and Auth Token are required');
    }
  }

  getAuth() {
    return {
      username: this.config.accountSid,
      password: this.config.authToken
    };
  }

  async execute(action, params) {
    const actions = {
      sendSMS: this.sendSMS.bind(this),
      sendWhatsApp: this.sendWhatsApp.bind(this),
      makeCall: this.makeCall.bind(this),
      listMessages: this.listMessages.bind(this),
      getMessage: this.getMessage.bind(this),
      listCalls: this.listCalls.bind(this),
      getCall: this.getCall.bind(this),
      lookupNumber: this.lookupNumber.bind(this),
    };

    if (!actions[action]) {
      throw new Error(`Unknown action: ${action}`);
    }

    return await actions[action](params);
  }

  async sendSMS(params) {
    const { to, from, body } = params;
    
    if (!to || !from || !body) {
      throw new Error('To, From, and Body are required');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/Accounts/${this.config.accountSid}/Messages.json`,
        new URLSearchParams({ To: to, From: from, Body: body }),
        { auth: this.getAuth() }
      );

      return {
        success: true,
        data: {
          sid: response.data.sid,
          status: response.data.status,
          to: response.data.to,
          from: response.data.from,
          body: response.data.body,
          dateCreated: response.data.date_created
        }
      };
    } catch (error) {
      throw new Error(`Twilio API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async sendWhatsApp(params) {
    const { to, from, body } = params;
    
    if (!to || !from || !body) {
      throw new Error('To, From, and Body are required');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/Accounts/${this.config.accountSid}/Messages.json`,
        new URLSearchParams({
          To: `whatsapp:${to}`,
          From: `whatsapp:${from}`,
          Body: body
        }),
        { auth: this.getAuth() }
      );

      return {
        success: true,
        data: {
          sid: response.data.sid,
          status: response.data.status,
          to: response.data.to,
          from: response.data.from
        }
      };
    } catch (error) {
      throw new Error(`Twilio API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async makeCall(params) {
    const { to, from, url, method = 'POST' } = params;
    
    if (!to || !from || !url) {
      throw new Error('To, From, and URL are required');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/Accounts/${this.config.accountSid}/Calls.json`,
        new URLSearchParams({ To: to, From: from, Url: url, Method: method }),
        { auth: this.getAuth() }
      );

      return {
        success: true,
        data: {
          sid: response.data.sid,
          status: response.data.status,
          to: response.data.to,
          from: response.data.from
        }
      };
    } catch (error) {
      throw new Error(`Twilio API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async listMessages(params) {
    const { limit = 20, to, from } = params;

    try {
      const queryParams = { PageSize: limit };
      if (to) queryParams.To = to;
      if (from) queryParams.From = from;

      const response = await axios.get(
        `${this.baseUrl}/Accounts/${this.config.accountSid}/Messages.json`,
        {
          auth: this.getAuth(),
          params: queryParams
        }
      );

      return {
        success: true,
        data: response.data.messages.map(msg => ({
          sid: msg.sid,
          to: msg.to,
          from: msg.from,
          body: msg.body,
          status: msg.status,
          dateCreated: msg.date_created
        }))
      };
    } catch (error) {
      throw new Error(`Twilio API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async getMessage(params) {
    const { messageSid } = params;
    
    if (!messageSid) {
      throw new Error('Message SID is required');
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/Accounts/${this.config.accountSid}/Messages/${messageSid}.json`,
        { auth: this.getAuth() }
      );

      return {
        success: true,
        data: {
          sid: response.data.sid,
          to: response.data.to,
          from: response.data.from,
          body: response.data.body,
          status: response.data.status,
          price: response.data.price,
          dateCreated: response.data.date_created
        }
      };
    } catch (error) {
      throw new Error(`Twilio API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async listCalls(params) {
    const { limit = 20, status } = params;

    try {
      const queryParams = { PageSize: limit };
      if (status) queryParams.Status = status;

      const response = await axios.get(
        `${this.baseUrl}/Accounts/${this.config.accountSid}/Calls.json`,
        {
          auth: this.getAuth(),
          params: queryParams
        }
      );

      return {
        success: true,
        data: response.data.calls.map(call => ({
          sid: call.sid,
          to: call.to,
          from: call.from,
          status: call.status,
          duration: call.duration,
          dateCreated: call.date_created
        }))
      };
    } catch (error) {
      throw new Error(`Twilio API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async getCall(params) {
    const { callSid } = params;
    
    if (!callSid) {
      throw new Error('Call SID is required');
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/Accounts/${this.config.accountSid}/Calls/${callSid}.json`,
        { auth: this.getAuth() }
      );

      return {
        success: true,
        data: {
          sid: response.data.sid,
          to: response.data.to,
          from: response.data.from,
          status: response.data.status,
          duration: response.data.duration,
          price: response.data.price
        }
      };
    } catch (error) {
      throw new Error(`Twilio API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async lookupNumber(params) {
    const { phoneNumber } = params;
    
    if (!phoneNumber) {
      throw new Error('Phone number is required');
    }

    try {
      const response = await axios.get(
        `https://lookups.twilio.com/v1/PhoneNumbers/${phoneNumber}`,
        { auth: this.getAuth() }
      );

      return {
        success: true,
        data: {
          phoneNumber: response.data.phone_number,
          nationalFormat: response.data.national_format,
          countryCode: response.data.country_code,
          carrier: response.data.carrier
        }
      };
    } catch (error) {
      throw new Error(`Twilio API error: ${error.response?.data?.message || error.message}`);
    }
  }
}

module.exports = TwilioIntegration;
