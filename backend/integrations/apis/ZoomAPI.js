/**
 * Zoom API Integration - COMPLETE IMPLEMENTATION
 * Meetings, Webinars, Users, Recordings, Reports
 */

const axios = require('axios');

class ZoomAPI {
    constructor(accountId, clientId, clientSecret) {
        this.accountId = accountId || process.env.ZOOM_ACCOUNT_ID;
        this.clientId = clientId || process.env.ZOOM_CLIENT_ID;
        this.clientSecret = clientSecret || process.env.ZOOM_CLIENT_SECRET;
        this.baseUrl = 'https://api.zoom.us/v2';
        this.accessToken = null;
    }

    /**
     * Get OAuth token
     */
    async getAccessToken() {
        if (this.accessToken) return this.accessToken;

        const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
        
        const response = await axios.post(
            `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${this.accountId}`,
            null,
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        this.accessToken = response.data.access_token;
        return this.accessToken;
    }

    /**
     * Make authenticated request
     */
    async request(method, endpoint, data = null) {
        const token = await this.getAccessToken();

        const config = {
            method,
            url: `${this.baseUrl}${endpoint}`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        if (data) {
            if (method === 'GET') {
                config.params = data;
            } else {
                config.data = data;
            }
        }

        const response = await axios(config);
        return response.data;
    }

    // ============================================
    // MEETINGS
    // ============================================

    /**
     * Create meeting
     */
    async createMeeting(userId, topic, startTime, duration, options = {}) {
        return await this.request('POST', `/users/${userId}/meetings`, {
            topic,
            type: options.type || 2, // 1: instant, 2: scheduled, 3: recurring no fixed time, 8: recurring fixed time
            start_time: startTime,
            duration,
            timezone: options.timezone || 'UTC',
            ...options
        });
    }

    /**
     * Get meeting
     */
    async getMeeting(meetingId) {
        return await this.request('GET', `/meetings/${meetingId}`);
    }

    /**
     * List meetings
     */
    async listMeetings(userId, type = 'scheduled') {
        return await this.request('GET', `/users/${userId}/meetings`, { type });
    }

    /**
     * Update meeting
     */
    async updateMeeting(meetingId, updates) {
        return await this.request('PATCH', `/meetings/${meetingId}`, updates);
    }

    /**
     * Delete meeting
     */
    async deleteMeeting(meetingId) {
        return await this.request('DELETE', `/meetings/${meetingId}`);
    }

    /**
     * End meeting
     */
    async endMeeting(meetingId) {
        return await this.request('PUT', `/meetings/${meetingId}/status`, {
            action: 'end'
        });
    }

    /**
     * Get meeting invitation
     */
    async getMeetingInvitation(meetingId) {
        return await this.request('GET', `/meetings/${meetingId}/invitation`);
    }

    /**
     * List meeting participants
     */
    async listMeetingParticipants(meetingId, pageSize = 30) {
        return await this.request('GET', `/past_meetings/${meetingId}/participants`, {
            page_size: pageSize
        });
    }

    // ============================================
    // WEBINARS
    // ============================================

    /**
     * Create webinar
     */
    async createWebinar(userId, topic, startTime, duration, options = {}) {
        return await this.request('POST', `/users/${userId}/webinars`, {
            topic,
            type: options.type || 5, // 5: webinar, 6: recurring webinar no fixed time, 9: recurring webinar fixed time
            start_time: startTime,
            duration,
            timezone: options.timezone || 'UTC',
            ...options
        });
    }

    /**
     * Get webinar
     */
    async getWebinar(webinarId) {
        return await this.request('GET', `/webinars/${webinarId}`);
    }

    /**
     * List webinars
     */
    async listWebinars(userId) {
        return await this.request('GET', `/users/${userId}/webinars`);
    }

    /**
     * Update webinar
     */
    async updateWebinar(webinarId, updates) {
        return await this.request('PATCH', `/webinars/${webinarId}`, updates);
    }

    /**
     * Delete webinar
     */
    async deleteWebinar(webinarId) {
        return await this.request('DELETE', `/webinars/${webinarId}`);
    }

    /**
     * Add webinar registrant
     */
    async addWebinarRegistrant(webinarId, email, firstName, lastName) {
        return await this.request('POST', `/webinars/${webinarId}/registrants`, {
            email,
            first_name: firstName,
            last_name: lastName
        });
    }

    /**
     * List webinar registrants
     */
    async listWebinarRegistrants(webinarId) {
        return await this.request('GET', `/webinars/${webinarId}/registrants`);
    }

    // ============================================
    // USERS
    // ============================================

    /**
     * Create user
     */
    async createUser(email, firstName, lastName, type = 1) {
        return await this.request('POST', '/users', {
            action: 'create',
            user_info: {
                email,
                type, // 1: basic, 2: licensed, 3: on-prem
                first_name: firstName,
                last_name: lastName
            }
        });
    }

    /**
     * Get user
     */
    async getUser(userId) {
        return await this.request('GET', `/users/${userId}`);
    }

    /**
     * List users
     */
    async listUsers(status = 'active', pageSize = 30) {
        return await this.request('GET', '/users', {
            status,
            page_size: pageSize
        });
    }

    /**
     * Update user
     */
    async updateUser(userId, updates) {
        return await this.request('PATCH', `/users/${userId}`, updates);
    }

    /**
     * Delete user
     */
    async deleteUser(userId, action = 'disassociate') {
        return await this.request('DELETE', `/users/${userId}`, { action });
    }

    /**
     * Get user settings
     */
    async getUserSettings(userId) {
        return await this.request('GET', `/users/${userId}/settings`);
    }

    /**
     * Update user settings
     */
    async updateUserSettings(userId, settings) {
        return await this.request('PATCH', `/users/${userId}/settings`, settings);
    }

    // ============================================
    // RECORDINGS
    // ============================================

    /**
     * List recordings
     */
    async listRecordings(userId, from, to) {
        return await this.request('GET', `/users/${userId}/recordings`, {
            from,
            to
        });
    }

    /**
     * Get meeting recordings
     */
    async getMeetingRecordings(meetingId) {
        return await this.request('GET', `/meetings/${meetingId}/recordings`);
    }

    /**
     * Delete recording
     */
    async deleteRecording(meetingId) {
        return await this.request('DELETE', `/meetings/${meetingId}/recordings`);
    }

    /**
     * Delete recording file
     */
    async deleteRecordingFile(meetingId, recordingId) {
        return await this.request('DELETE', `/meetings/${meetingId}/recordings/${recordingId}`);
    }

    /**
     * Recover recording
     */
    async recoverRecording(meetingId) {
        return await this.request('PUT', `/meetings/${meetingId}/recordings/status`, {
            action: 'recover'
        });
    }

    // ============================================
    // CLOUD RECORDING
    // ============================================

    /**
     * Get account cloud recording settings
     */
    async getCloudRecordingSettings() {
        return await this.request('GET', '/accounts/me/settings');
    }

    /**
     * Update cloud recording settings
     */
    async updateCloudRecordingSettings(settings) {
        return await this.request('PATCH', '/accounts/me/settings', settings);
    }

    // ============================================
    // REPORTS
    // ============================================

    /**
     * Get daily usage report
     */
    async getDailyUsageReport(year, month) {
        return await this.request('GET', '/report/daily', {
            year,
            month
        });
    }

    /**
     * Get active/inactive host reports
     */
    async getActiveInactiveHostReports(from, to) {
        return await this.request('GET', '/report/users', {
            from,
            to,
            type: 'active'
        });
    }

    /**
     * Get meeting participants report
     */
    async getMeetingParticipantsReport(meetingId) {
        return await this.request('GET', `/report/meetings/${meetingId}/participants`);
    }

    /**
     * Get webinar participants report
     */
    async getWebinarParticipantsReport(webinarId) {
        return await this.request('GET', `/report/webinars/${webinarId}/participants`);
    }

    // ============================================
    // DASHBOARDS
    // ============================================

    /**
     * Get dashboard meetings
     */
    async getDashboardMeetings(from, to, type = 'past') {
        return await this.request('GET', '/metrics/meetings', {
            from,
            to,
            type
        });
    }

    /**
     * Get meeting details
     */
    async getMeetingDetails(meetingId, type = 'past') {
        return await this.request('GET', `/metrics/meetings/${meetingId}`, { type });
    }

    /**
     * Get meeting participants
     */
    async getDashboardMeetingParticipants(meetingId, type = 'past') {
        return await this.request('GET', `/metrics/meetings/${meetingId}/participants`, { type });
    }

    // ============================================
    // CHAT
    // ============================================

    /**
     * List user's chat channels
     */
    async listChatChannels(userId) {
        return await this.request('GET', `/chat/users/${userId}/channels`);
    }

    /**
     * Send chat message
     */
    async sendChatMessage(message, toChannel = null, toContact = null) {
        const data = { message };
        if (toChannel) data.to_channel = toChannel;
        if (toContact) data.to_contact = toContact;

        return await this.request('POST', '/chat/users/me/messages', data);
    }

    /**
     * List chat messages
     */
    async listChatMessages(userId, toChannel = null, toContact = null) {
        const params = {};
        if (toChannel) params.to_channel = toChannel;
        if (toContact) params.to_contact = toContact;

        return await this.request('GET', `/chat/users/${userId}/messages`, params);
    }

    // ============================================
    // PHONE
    // ============================================

    /**
     * List phone users
     */
    async listPhoneUsers() {
        return await this.request('GET', '/phone/users');
    }

    /**
     * Get phone user
     */
    async getPhoneUser(userId) {
        return await this.request('GET', `/phone/users/${userId}`);
    }

    /**
     * List call logs
     */
    async listCallLogs(from, to, type = 'all') {
        return await this.request('GET', '/phone/call_logs', {
            from,
            to,
            type
        });
    }
}

module.exports = ZoomAPI;
