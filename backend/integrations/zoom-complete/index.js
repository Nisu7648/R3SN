const axios = require('axios');

class ZoomIntegration {
  constructor(apiKey, apiSecret) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.baseURL = 'https://api.zoom.us/v2';
  }

  async createMeeting(userId, topic, startTime, duration = 60) {
    const response = await axios.post(
      `${this.baseURL}/users/${userId}/meetings`,
      { topic, type: 2, start_time: startTime, duration, timezone: 'UTC' },
      { headers: { 'Authorization': `Bearer ${this.apiKey}` } }
    );
    return response.data;
  }

  async getMeeting(meetingId) {
    const response = await axios.get(`${this.baseURL}/meetings/${meetingId}`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });
    return response.data;
  }

  async listMeetings(userId) {
    const response = await axios.get(`${this.baseURL}/users/${userId}/meetings`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });
    return response.data;
  }

  async deleteMeeting(meetingId) {
    const response = await axios.delete(`${this.baseURL}/meetings/${meetingId}`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });
    return response.data;
  }

  async getUser(userId) {
    const response = await axios.get(`${this.baseURL}/users/${userId}`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });
    return response.data;
  }
}

module.exports = ZoomIntegration;
