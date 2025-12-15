/**
 * Twilio API Integration
 * Complete SMS, Voice, and Messaging with all endpoints
 */

const axios = require('axios');

class TwilioAPI {
  constructor(accountSid, authToken) {
    this.accountSid = accountSid || process.env.TWILIO_ACCOUNT_SID;
    this.authToken = authToken || process.env.TWILIO_AUTH_TOKEN;
    this.baseURL = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}`;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      auth: {
        username: this.accountSid,
        password: this.authToken
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  }

  // ==================== MESSAGES (SMS/MMS) ====================

  async sendMessage(data) {
    const params = new URLSearchParams({
      To: data.to,
      From: data.from || process.env.TWILIO_PHONE_NUMBER,
      Body: data.body,
      ...(data.mediaUrl && { MediaUrl: data.mediaUrl })
    });

    const response = await this.client.post('/Messages.json', params);
    return { success: true, message: response.data };
  }

  async getMessage(messageSid) {
    const response = await this.client.get(`/Messages/${messageSid}.json`);
    return { success: true, message: response.data };
  }

  async listMessages(options = {}) {
    const params = new URLSearchParams({
      PageSize: options.limit || 20,
      ...(options.to && { To: options.to }),
      ...(options.from && { From: options.from }),
      ...(options.dateSent && { DateSent: options.dateSent })
    });

    const response = await this.client.get(`/Messages.json?${params}`);
    return { 
      success: true, 
      messages: response.data.messages,
      page: response.data.page,
      page_size: response.data.page_size
    };
  }

  async deleteMessage(messageSid) {
    await this.client.delete(`/Messages/${messageSid}.json`);
    return { success: true, deleted: true };
  }

  // ==================== CALLS ====================

  async makeCall(data) {
    const params = new URLSearchParams({
      To: data.to,
      From: data.from || process.env.TWILIO_PHONE_NUMBER,
      Url: data.url,
      ...(data.method && { Method: data.method }),
      ...(data.statusCallback && { StatusCallback: data.statusCallback })
    });

    const response = await this.client.post('/Calls.json', params);
    return { success: true, call: response.data };
  }

  async getCall(callSid) {
    const response = await this.client.get(`/Calls/${callSid}.json`);
    return { success: true, call: response.data };
  }

  async listCalls(options = {}) {
    const params = new URLSearchParams({
      PageSize: options.limit || 20,
      ...(options.to && { To: options.to }),
      ...(options.from && { From: options.from }),
      ...(options.status && { Status: options.status })
    });

    const response = await this.client.get(`/Calls.json?${params}`);
    return { 
      success: true, 
      calls: response.data.calls,
      page: response.data.page
    };
  }

  async updateCall(callSid, data) {
    const params = new URLSearchParams({
      ...(data.status && { Status: data.status }),
      ...(data.url && { Url: data.url })
    });

    const response = await this.client.post(`/Calls/${callSid}.json`, params);
    return { success: true, call: response.data };
  }

  async deleteCall(callSid) {
    await this.client.delete(`/Calls/${callSid}.json`);
    return { success: true, deleted: true };
  }

  // ==================== RECORDINGS ====================

  async getRecording(recordingSid) {
    const response = await this.client.get(`/Recordings/${recordingSid}.json`);
    return { success: true, recording: response.data };
  }

  async listRecordings(options = {}) {
    const params = new URLSearchParams({
      PageSize: options.limit || 20,
      ...(options.callSid && { CallSid: options.callSid })
    });

    const response = await this.client.get(`/Recordings.json?${params}`);
    return { success: true, recordings: response.data.recordings };
  }

  async deleteRecording(recordingSid) {
    await this.client.delete(`/Recordings/${recordingSid}.json`);
    return { success: true, deleted: true };
  }

  // ==================== PHONE NUMBERS ====================

  async listPhoneNumbers(options = {}) {
    const params = new URLSearchParams({
      PageSize: options.limit || 20
    });

    const response = await this.client.get(`/IncomingPhoneNumbers.json?${params}`);
    return { success: true, phone_numbers: response.data.incoming_phone_numbers };
  }

  async getPhoneNumber(phoneNumberSid) {
    const response = await this.client.get(`/IncomingPhoneNumbers/${phoneNumberSid}.json`);
    return { success: true, phone_number: response.data };
  }

  async updatePhoneNumber(phoneNumberSid, data) {
    const params = new URLSearchParams({
      ...(data.friendlyName && { FriendlyName: data.friendlyName }),
      ...(data.smsUrl && { SmsUrl: data.smsUrl }),
      ...(data.voiceUrl && { VoiceUrl: data.voiceUrl })
    });

    const response = await this.client.post(`/IncomingPhoneNumbers/${phoneNumberSid}.json`, params);
    return { success: true, phone_number: response.data };
  }

  async searchAvailablePhoneNumbers(countryCode, options = {}) {
    const params = new URLSearchParams({
      ...(options.areaCode && { AreaCode: options.areaCode }),
      ...(options.contains && { Contains: options.contains }),
      ...(options.smsEnabled && { SmsEnabled: options.smsEnabled }),
      ...(options.voiceEnabled && { VoiceEnabled: options.voiceEnabled })
    });

    const response = await this.client.get(
      `/AvailablePhoneNumbers/${countryCode}/Local.json?${params}`
    );
    return { success: true, available_phone_numbers: response.data.available_phone_numbers };
  }

  async purchasePhoneNumber(data) {
    const params = new URLSearchParams({
      PhoneNumber: data.phoneNumber,
      ...(data.friendlyName && { FriendlyName: data.friendlyName }),
      ...(data.smsUrl && { SmsUrl: data.smsUrl }),
      ...(data.voiceUrl && { VoiceUrl: data.voiceUrl })
    });

    const response = await this.client.post('/IncomingPhoneNumbers.json', params);
    return { success: true, phone_number: response.data };
  }

  async releasePhoneNumber(phoneNumberSid) {
    await this.client.delete(`/IncomingPhoneNumbers/${phoneNumberSid}.json`);
    return { success: true, deleted: true };
  }

  // ==================== CONFERENCES ====================

  async getConference(conferenceSid) {
    const response = await this.client.get(`/Conferences/${conferenceSid}.json`);
    return { success: true, conference: response.data };
  }

  async listConferences(options = {}) {
    const params = new URLSearchParams({
      PageSize: options.limit || 20,
      ...(options.status && { Status: options.status })
    });

    const response = await this.client.get(`/Conferences.json?${params}`);
    return { success: true, conferences: response.data.conferences };
  }

  async listConferenceParticipants(conferenceSid) {
    const response = await this.client.get(`/Conferences/${conferenceSid}/Participants.json`);
    return { success: true, participants: response.data.participants };
  }

  async updateConferenceParticipant(conferenceSid, callSid, data) {
    const params = new URLSearchParams({
      ...(data.muted !== undefined && { Muted: data.muted }),
      ...(data.hold !== undefined && { Hold: data.hold })
    });

    const response = await this.client.post(
      `/Conferences/${conferenceSid}/Participants/${callSid}.json`,
      params
    );
    return { success: true, participant: response.data };
  }

  async removeConferenceParticipant(conferenceSid, callSid) {
    await this.client.delete(`/Conferences/${conferenceSid}/Participants/${callSid}.json`);
    return { success: true, deleted: true };
  }

  // ==================== QUEUES ====================

  async createQueue(data) {
    const params = new URLSearchParams({
      FriendlyName: data.friendlyName,
      ...(data.maxSize && { MaxSize: data.maxSize })
    });

    const response = await this.client.post('/Queues.json', params);
    return { success: true, queue: response.data };
  }

  async getQueue(queueSid) {
    const response = await this.client.get(`/Queues/${queueSid}.json`);
    return { success: true, queue: response.data };
  }

  async listQueues(options = {}) {
    const params = new URLSearchParams({
      PageSize: options.limit || 20
    });

    const response = await this.client.get(`/Queues.json?${params}`);
    return { success: true, queues: response.data.queues };
  }

  async deleteQueue(queueSid) {
    await this.client.delete(`/Queues/${queueSid}.json`);
    return { success: true, deleted: true };
  }

  // ==================== USAGE RECORDS ====================

  async getUsageRecords(options = {}) {
    const params = new URLSearchParams({
      ...(options.category && { Category: options.category }),
      ...(options.startDate && { StartDate: options.startDate }),
      ...(options.endDate && { EndDate: options.endDate })
    });

    const response = await this.client.get(`/Usage/Records.json?${params}`);
    return { success: true, usage_records: response.data.usage_records };
  }

  async getUsageTriggers() {
    const response = await this.client.get('/Usage/Triggers.json');
    return { success: true, usage_triggers: response.data.usage_triggers };
  }

  // ==================== ACCOUNT ====================

  async getAccount() {
    const response = await this.client.get('.json');
    return { success: true, account: response.data };
  }

  async updateAccount(data) {
    const params = new URLSearchParams({
      ...(data.friendlyName && { FriendlyName: data.friendlyName })
    });

    const response = await this.client.post('.json', params);
    return { success: true, account: response.data };
  }
}

module.exports = TwilioAPI;
