/**
 * Twilio Integration - Complete Implementation
 * 15 endpoints for SMS, calls, and messaging
 */

const axios = require('axios');

class TwilioIntegration {
  constructor(accountSid, authToken) {
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.baseUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}`;
  }

  getHeaders() {
    const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
    return {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    };
  }

  toFormData(obj) {
    return Object.keys(obj).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`).join('&');
  }

  async sendSMS(to, from, body) {
    try {
      const response = await axios.post(`${this.baseUrl}/Messages.json`,
        this.toFormData({ To: to, From: from, Body: body }),
        { headers: this.getHeaders() }
      );
      return { success: true, message: response.data };
    } catch (error) {
      throw new Error(`Failed to send SMS: ${error.response?.data?.message || error.message}`);
    }
  }

  async listMessages(limit = 20) {
    try {
      const response = await axios.get(`${this.baseUrl}/Messages.json`, {
        headers: this.getHeaders(),
        params: { PageSize: limit },
      });
      return { success: true, messages: response.data.messages };
    } catch (error) {
      throw new Error(`Failed to list messages: ${error.response?.data?.message || error.message}`);
    }
  }

  async getMessage(messageSid) {
    try {
      const response = await axios.get(`${this.baseUrl}/Messages/${messageSid}.json`, {
        headers: this.getHeaders(),
      });
      return { success: true, message: response.data };
    } catch (error) {
      throw new Error(`Failed to get message: ${error.response?.data?.message || error.message}`);
    }
  }

  async makeCall(to, from, url) {
    try {
      const response = await axios.post(`${this.baseUrl}/Calls.json`,
        this.toFormData({ To: to, From: from, Url: url }),
        { headers: this.getHeaders() }
      );
      return { success: true, call: response.data };
    } catch (error) {
      throw new Error(`Failed to make call: ${error.response?.data?.message || error.message}`);
    }
  }

  async listCalls(limit = 20) {
    try {
      const response = await axios.get(`${this.baseUrl}/Calls.json`, {
        headers: this.getHeaders(),
        params: { PageSize: limit },
      });
      return { success: true, calls: response.data.calls };
    } catch (error) {
      throw new Error(`Failed to list calls: ${error.response?.data?.message || error.message}`);
    }
  }

  async getCall(callSid) {
    try {
      const response = await axios.get(`${this.baseUrl}/Calls/${callSid}.json`, {
        headers: this.getHeaders(),
      });
      return { success: true, call: response.data };
    } catch (error) {
      throw new Error(`Failed to get call: ${error.response?.data?.message || error.message}`);
    }
  }

  async updateCall(callSid, status) {
    try {
      const response = await axios.post(`${this.baseUrl}/Calls/${callSid}.json`,
        this.toFormData({ Status: status }),
        { headers: this.getHeaders() }
      );
      return { success: true, call: response.data };
    } catch (error) {
      throw new Error(`Failed to update call: ${error.response?.data?.message || error.message}`);
    }
  }

  async listPhoneNumbers(limit = 20) {
    try {
      const response = await axios.get(`${this.baseUrl}/IncomingPhoneNumbers.json`, {
        headers: this.getHeaders(),
        params: { PageSize: limit },
      });
      return { success: true, phoneNumbers: response.data.incoming_phone_numbers };
    } catch (error) {
      throw new Error(`Failed to list phone numbers: ${error.response?.data?.message || error.message}`);
    }
  }

  async getPhoneNumber(phoneNumberSid) {
    try {
      const response = await axios.get(`${this.baseUrl}/IncomingPhoneNumbers/${phoneNumberSid}.json`, {
        headers: this.getHeaders(),
      });
      return { success: true, phoneNumber: response.data };
    } catch (error) {
      throw new Error(`Failed to get phone number: ${error.response?.data?.message || error.message}`);
    }
  }

  async updatePhoneNumber(phoneNumberSid, updates) {
    try {
      const response = await axios.post(`${this.baseUrl}/IncomingPhoneNumbers/${phoneNumberSid}.json`,
        this.toFormData(updates),
        { headers: this.getHeaders() }
      );
      return { success: true, phoneNumber: response.data };
    } catch (error) {
      throw new Error(`Failed to update phone number: ${error.response?.data?.message || error.message}`);
    }
  }

  async listRecordings(limit = 20) {
    try {
      const response = await axios.get(`${this.baseUrl}/Recordings.json`, {
        headers: this.getHeaders(),
        params: { PageSize: limit },
      });
      return { success: true, recordings: response.data.recordings };
    } catch (error) {
      throw new Error(`Failed to list recordings: ${error.response?.data?.message || error.message}`);
    }
  }

  async getRecording(recordingSid) {
    try {
      const response = await axios.get(`${this.baseUrl}/Recordings/${recordingSid}.json`, {
        headers: this.getHeaders(),
      });
      return { success: true, recording: response.data };
    } catch (error) {
      throw new Error(`Failed to get recording: ${error.response?.data?.message || error.message}`);
    }
  }

  async deleteRecording(recordingSid) {
    try {
      await axios.delete(`${this.baseUrl}/Recordings/${recordingSid}.json`, {
        headers: this.getHeaders(),
      });
      return { success: true, message: 'Recording deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete recording: ${error.response?.data?.message || error.message}`);
    }
  }

  async getAccount() {
    try {
      const response = await axios.get(`${this.baseUrl}.json`, {
        headers: this.getHeaders(),
      });
      return { success: true, account: response.data };
    } catch (error) {
      throw new Error(`Failed to get account: ${error.response?.data?.message || error.message}`);
    }
  }

  async getBalance() {
    try {
      const response = await axios.get(`${this.baseUrl}/Balance.json`, {
        headers: this.getHeaders(),
      });
      return { success: true, balance: response.data };
    } catch (error) {
      throw new Error(`Failed to get balance: ${error.response?.data?.message || error.message}`);
    }
  }
}

module.exports = TwilioIntegration;
