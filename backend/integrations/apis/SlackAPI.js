/**
 * Slack API Integration - REAL IMPLEMENTATION
 * Messages, channels, users, files, reactions
 */

const axios = require('axios');

class SlackAPI {
    constructor(token) {
        this.token = token || process.env.SLACK_BOT_TOKEN;
        this.baseUrl = 'https://slack.com/api';
    }

    /**
     * Make authenticated request
     */
    async request(method, endpoint, data = null) {
        const config = {
            method,
            url: `${this.baseUrl}/${endpoint}`,
            headers: {
                'Authorization': `Bearer ${this.token}`,
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
        
        if (!response.data.ok) {
            throw new Error(`Slack API Error: ${response.data.error}`);
        }

        return response.data;
    }

    // ============================================
    // MESSAGES
    // ============================================

    /**
     * Send message
     */
    async sendMessage(channel, text, options = {}) {
        return await this.request('POST', 'chat.postMessage', {
            channel,
            text,
            ...options
        });
    }

    /**
     * Update message
     */
    async updateMessage(channel, timestamp, text, options = {}) {
        return await this.request('POST', 'chat.update', {
            channel,
            ts: timestamp,
            text,
            ...options
        });
    }

    /**
     * Delete message
     */
    async deleteMessage(channel, timestamp) {
        return await this.request('POST', 'chat.delete', {
            channel,
            ts: timestamp
        });
    }

    /**
     * Send ephemeral message (only visible to one user)
     */
    async sendEphemeral(channel, user, text, options = {}) {
        return await this.request('POST', 'chat.postEphemeral', {
            channel,
            user,
            text,
            ...options
        });
    }

    /**
     * Schedule message
     */
    async scheduleMessage(channel, text, postAt, options = {}) {
        return await this.request('POST', 'chat.scheduleMessage', {
            channel,
            text,
            post_at: postAt,
            ...options
        });
    }

    /**
     * Get permalink for message
     */
    async getPermalink(channel, timestamp) {
        return await this.request('GET', 'chat.getPermalink', {
            channel,
            message_ts: timestamp
        });
    }

    // ============================================
    // CHANNELS
    // ============================================

    /**
     * List channels
     */
    async listChannels(options = {}) {
        return await this.request('GET', 'conversations.list', {
            types: 'public_channel,private_channel',
            ...options
        });
    }

    /**
     * Create channel
     */
    async createChannel(name, isPrivate = false) {
        return await this.request('POST', 'conversations.create', {
            name,
            is_private: isPrivate
        });
    }

    /**
     * Archive channel
     */
    async archiveChannel(channel) {
        return await this.request('POST', 'conversations.archive', { channel });
    }

    /**
     * Unarchive channel
     */
    async unarchiveChannel(channel) {
        return await this.request('POST', 'conversations.unarchive', { channel });
    }

    /**
     * Rename channel
     */
    async renameChannel(channel, name) {
        return await this.request('POST', 'conversations.rename', {
            channel,
            name
        });
    }

    /**
     * Set channel topic
     */
    async setTopic(channel, topic) {
        return await this.request('POST', 'conversations.setTopic', {
            channel,
            topic
        });
    }

    /**
     * Set channel purpose
     */
    async setPurpose(channel, purpose) {
        return await this.request('POST', 'conversations.setPurpose', {
            channel,
            purpose
        });
    }

    /**
     * Get channel info
     */
    async getChannelInfo(channel) {
        return await this.request('GET', 'conversations.info', { channel });
    }

    /**
     * Get channel history
     */
    async getHistory(channel, options = {}) {
        return await this.request('GET', 'conversations.history', {
            channel,
            ...options
        });
    }

    // ============================================
    // USERS
    // ============================================

    /**
     * List users
     */
    async listUsers(options = {}) {
        return await this.request('GET', 'users.list', options);
    }

    /**
     * Get user info
     */
    async getUserInfo(user) {
        return await this.request('GET', 'users.info', { user });
    }

    /**
     * Get user presence
     */
    async getUserPresence(user) {
        return await this.request('GET', 'users.getPresence', { user });
    }

    /**
     * Set user presence
     */
    async setPresence(presence) {
        return await this.request('POST', 'users.setPresence', {
            presence // 'auto' or 'away'
        });
    }

    /**
     * Invite user to channel
     */
    async inviteUser(channel, users) {
        return await this.request('POST', 'conversations.invite', {
            channel,
            users: Array.isArray(users) ? users.join(',') : users
        });
    }

    /**
     * Kick user from channel
     */
    async kickUser(channel, user) {
        return await this.request('POST', 'conversations.kick', {
            channel,
            user
        });
    }

    // ============================================
    // REACTIONS
    // ============================================

    /**
     * Add reaction
     */
    async addReaction(channel, timestamp, name) {
        return await this.request('POST', 'reactions.add', {
            channel,
            timestamp,
            name
        });
    }

    /**
     * Remove reaction
     */
    async removeReaction(channel, timestamp, name) {
        return await this.request('POST', 'reactions.remove', {
            channel,
            timestamp,
            name
        });
    }

    /**
     * Get reactions
     */
    async getReactions(channel, timestamp) {
        return await this.request('GET', 'reactions.get', {
            channel,
            timestamp
        });
    }

    // ============================================
    // FILES
    // ============================================

    /**
     * Upload file
     */
    async uploadFile(channels, file, options = {}) {
        const FormData = require('form-data');
        const form = new FormData();
        
        form.append('channels', channels);
        form.append('file', file);
        
        if (options.title) form.append('title', options.title);
        if (options.filename) form.append('filename', options.filename);
        if (options.initial_comment) form.append('initial_comment', options.initial_comment);

        const response = await axios.post(`${this.baseUrl}/files.upload`, form, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                ...form.getHeaders()
            }
        });

        if (!response.data.ok) {
            throw new Error(`Slack API Error: ${response.data.error}`);
        }

        return response.data;
    }

    /**
     * Delete file
     */
    async deleteFile(file) {
        return await this.request('POST', 'files.delete', { file });
    }

    /**
     * List files
     */
    async listFiles(options = {}) {
        return await this.request('GET', 'files.list', options);
    }

    // ============================================
    // DIRECT MESSAGES
    // ============================================

    /**
     * Open DM channel
     */
    async openDM(users) {
        return await this.request('POST', 'conversations.open', {
            users: Array.isArray(users) ? users.join(',') : users
        });
    }

    /**
     * Send DM
     */
    async sendDM(user, text, options = {}) {
        const dm = await this.openDM(user);
        return await this.sendMessage(dm.channel.id, text, options);
    }

    // ============================================
    // SEARCH
    // ============================================

    /**
     * Search messages
     */
    async searchMessages(query, options = {}) {
        return await this.request('GET', 'search.messages', {
            query,
            ...options
        });
    }

    /**
     * Search files
     */
    async searchFiles(query, options = {}) {
        return await this.request('GET', 'search.files', {
            query,
            ...options
        });
    }

    // ============================================
    // REMINDERS
    // ============================================

    /**
     * Create reminder
     */
    async createReminder(text, time, user = null) {
        return await this.request('POST', 'reminders.add', {
            text,
            time,
            user
        });
    }

    /**
     * List reminders
     */
    async listReminders() {
        return await this.request('GET', 'reminders.list');
    }

    /**
     * Delete reminder
     */
    async deleteReminder(reminder) {
        return await this.request('POST', 'reminders.delete', { reminder });
    }

    // ============================================
    // WORKSPACE
    // ============================================

    /**
     * Get team info
     */
    async getTeamInfo() {
        return await this.request('GET', 'team.info');
    }

    /**
     * Get auth test
     */
    async testAuth() {
        return await this.request('GET', 'auth.test');
    }

    // ============================================
    // PINS
    // ============================================

    /**
     * Pin message
     */
    async pinMessage(channel, timestamp) {
        return await this.request('POST', 'pins.add', {
            channel,
            timestamp
        });
    }

    /**
     * Unpin message
     */
    async unpinMessage(channel, timestamp) {
        return await this.request('POST', 'pins.remove', {
            channel,
            timestamp
        });
    }

    /**
     * List pins
     */
    async listPins(channel) {
        return await this.request('GET', 'pins.list', { channel });
    }

    // ============================================
    // BOOKMARKS
    // ============================================

    /**
     * Add bookmark
     */
    async addBookmark(channel, title, type, link) {
        return await this.request('POST', 'bookmarks.add', {
            channel_id: channel,
            title,
            type,
            link
        });
    }

    /**
     * Remove bookmark
     */
    async removeBookmark(channel, bookmarkId) {
        return await this.request('POST', 'bookmarks.remove', {
            channel_id: channel,
            bookmark_id: bookmarkId
        });
    }
}

module.exports = SlackAPI;
