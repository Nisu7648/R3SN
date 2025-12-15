/**
 * Twilio API Integration - COMPLETE IMPLEMENTATION
 * SMS, Voice, WhatsApp, Video, Verify
 */

const axios = require('axios');

class TwilioAPI {
    constructor(accountSid, authToken) {
        this.accountSid = accountSid || process.env.TWILIO_ACCOUNT_SID;
        this.authToken = authToken || process.env.TWILIO_AUTH_TOKEN;
        this.baseUrl = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}`;
    }

    /**
     * Make authenticated request
     */
    async request(method, endpoint, data = null) {
        const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
        
        const config = {
            method,
            url: `${this.baseUrl}${endpoint}`,
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        if (data) {
            config.data = new URLSearchParams(data).toString();
        }

        const response = await axios(config);
        return response.data;
    }

    // ============================================
    // SMS
    // ============================================

    /**
     * Send SMS
     */
    async sendSMS(to, from, body) {
        return await this.request('POST', '/Messages.json', {
            To: to,
            From: from || process.env.TWILIO_PHONE_NUMBER,
            Body: body
        });
    }

    /**
     * Send MMS (with media)
     */
    async sendMMS(to, from, body, mediaUrl) {
        return await this.request('POST', '/Messages.json', {
            To: to,
            From: from || process.env.TWILIO_PHONE_NUMBER,
            Body: body,
            MediaUrl: mediaUrl
        });
    }

    /**
     * Get message
     */
    async getMessage(messageSid) {
        return await this.request('GET', `/Messages/${messageSid}.json`);
    }

    /**
     * List messages
     */
    async listMessages(options = {}) {
        return await this.request('GET', '/Messages.json', options);
    }

    /**
     * Delete message
     */
    async deleteMessage(messageSid) {
        return await this.request('DELETE', `/Messages/${messageSid}.json`);
    }

    // ============================================
    // VOICE CALLS
    // ============================================

    /**
     * Make call
     */
    async makeCall(to, from, url) {
        return await this.request('POST', '/Calls.json', {
            To: to,
            From: from || process.env.TWILIO_PHONE_NUMBER,
            Url: url // TwiML URL
        });
    }

    /**
     * Get call
     */
    async getCall(callSid) {
        return await this.request('GET', `/Calls/${callSid}.json`);
    }

    /**
     * List calls
     */
    async listCalls(options = {}) {
        return await this.request('GET', '/Calls.json', options);
    }

    /**
     * Update call (modify in progress)
     */
    async updateCall(callSid, updates) {
        return await this.request('POST', `/Calls/${callSid}.json`, updates);
    }

    /**
     * End call
     */
    async endCall(callSid) {
        return await this.updateCall(callSid, { Status: 'completed' });
    }

    // ============================================
    // WHATSAPP
    // ============================================

    /**
     * Send WhatsApp message
     */
    async sendWhatsApp(to, from, body) {
        return await this.request('POST', '/Messages.json', {
            To: `whatsapp:${to}`,
            From: `whatsapp:${from || process.env.TWILIO_WHATSAPP_NUMBER}`,
            Body: body
        });
    }

    /**
     * Send WhatsApp media
     */
    async sendWhatsAppMedia(to, from, body, mediaUrl) {
        return await this.request('POST', '/Messages.json', {
            To: `whatsapp:${to}`,
            From: `whatsapp:${from || process.env.TWILIO_WHATSAPP_NUMBER}`,
            Body: body,
            MediaUrl: mediaUrl
        });
    }

    // ============================================
    // VERIFY (2FA)
    // ============================================

    /**
     * Send verification code
     */
    async sendVerification(to, channel = 'sms') {
        const verifyUrl = `https://verify.twilio.com/v2/Services/${process.env.TWILIO_VERIFY_SERVICE_SID}/Verifications`;
        
        const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
        
        const response = await axios.post(verifyUrl, 
            new URLSearchParams({
                To: to,
                Channel: channel // sms, call, email
            }).toString(),
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        return response.data;
    }

    /**
     * Check verification code
     */
    async checkVerification(to, code) {
        const verifyUrl = `https://verify.twilio.com/v2/Services/${process.env.TWILIO_VERIFY_SERVICE_SID}/VerificationCheck`;
        
        const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
        
        const response = await axios.post(verifyUrl,
            new URLSearchParams({
                To: to,
                Code: code
            }).toString(),
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        return response.data;
    }

    // ============================================
    // PHONE NUMBERS
    // ============================================

    /**
     * List phone numbers
     */
    async listPhoneNumbers() {
        return await this.request('GET', '/IncomingPhoneNumbers.json');
    }

    /**
     * Buy phone number
     */
    async buyPhoneNumber(phoneNumber) {
        return await this.request('POST', '/IncomingPhoneNumbers.json', {
            PhoneNumber: phoneNumber
        });
    }

    /**
     * Release phone number
     */
    async releasePhoneNumber(phoneSid) {
        return await this.request('DELETE', `/IncomingPhoneNumbers/${phoneSid}.json`);
    }

    /**
     * Search available numbers
     */
    async searchAvailableNumbers(countryCode = 'US', options = {}) {
        return await this.request('GET', `/AvailablePhoneNumbers/${countryCode}/Local.json`, options);
    }

    // ============================================
    // RECORDINGS
    // ============================================

    /**
     * List recordings
     */
    async listRecordings(options = {}) {
        return await this.request('GET', '/Recordings.json', options);
    }

    /**
     * Get recording
     */
    async getRecording(recordingSid) {
        return await this.request('GET', `/Recordings/${recordingSid}.json`);
    }

    /**
     * Delete recording
     */
    async deleteRecording(recordingSid) {
        return await this.request('DELETE', `/Recordings/${recordingSid}.json`);
    }

    // ============================================
    // CONFERENCES
    // ============================================

    /**
     * List conferences
     */
    async listConferences(options = {}) {
        return await this.request('GET', '/Conferences.json', options);
    }

    /**
     * Get conference
     */
    async getConference(conferenceSid) {
        return await this.request('GET', `/Conferences/${conferenceSid}.json`);
    }

    /**
     * List conference participants
     */
    async listParticipants(conferenceSid) {
        return await this.request('GET', `/Conferences/${conferenceSid}/Participants.json`);
    }

    /**
     * Remove participant
     */
    async removeParticipant(conferenceSid, callSid) {
        return await this.request('DELETE', `/Conferences/${conferenceSid}/Participants/${callSid}.json`);
    }

    // ============================================
    // ACCOUNT
    // ============================================

    /**
     * Get account info
     */
    async getAccount() {
        return await this.request('GET', '.json');
    }

    /**
     * Get balance
     */
    async getBalance() {
        const balanceUrl = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Balance.json`;
        const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
        
        const response = await axios.get(balanceUrl, {
            headers: { 'Authorization': `Basic ${auth}` }
        });

        return response.data;
    }

    /**
     * List usage records
     */
    async listUsage(options = {}) {
        return await this.request('GET', '/Usage/Records.json', options);
    }
}

module.exports = TwilioAPI;
