/**
 * Discord API Integration - COMPLETE IMPLEMENTATION
 * Messages, Channels, Guilds, Users, Roles, Webhooks
 */

const axios = require('axios');

class DiscordAPI {
    constructor(token) {
        this.token = token || process.env.DISCORD_BOT_TOKEN;
        this.baseUrl = 'https://discord.com/api/v10';
    }

    /**
     * Make authenticated request
     */
    async request(method, endpoint, data = null) {
        const config = {
            method,
            url: `${this.baseUrl}${endpoint}`,
            headers: {
                'Authorization': `Bot ${this.token}`,
                'Content-Type': 'application/json'
            }
        };

        if (data) {
            config.data = data;
        }

        const response = await axios(config);
        return response.data;
    }

    // ============================================
    // MESSAGES
    // ============================================

    /**
     * Send message
     */
    async sendMessage(channelId, content, options = {}) {
        return await this.request('POST', `/channels/${channelId}/messages`, {
            content,
            ...options
        });
    }

    /**
     * Send embed message
     */
    async sendEmbed(channelId, embed, content = '') {
        return await this.request('POST', `/channels/${channelId}/messages`, {
            content,
            embeds: [embed]
        });
    }

    /**
     * Get message
     */
    async getMessage(channelId, messageId) {
        return await this.request('GET', `/channels/${channelId}/messages/${messageId}`);
    }

    /**
     * Get messages
     */
    async getMessages(channelId, limit = 50) {
        return await this.request('GET', `/channels/${channelId}/messages?limit=${limit}`);
    }

    /**
     * Edit message
     */
    async editMessage(channelId, messageId, content, options = {}) {
        return await this.request('PATCH', `/channels/${channelId}/messages/${messageId}`, {
            content,
            ...options
        });
    }

    /**
     * Delete message
     */
    async deleteMessage(channelId, messageId) {
        return await this.request('DELETE', `/channels/${channelId}/messages/${messageId}`);
    }

    /**
     * Bulk delete messages
     */
    async bulkDeleteMessages(channelId, messageIds) {
        return await this.request('POST', `/channels/${channelId}/messages/bulk-delete`, {
            messages: messageIds
        });
    }

    /**
     * Pin message
     */
    async pinMessage(channelId, messageId) {
        return await this.request('PUT', `/channels/${channelId}/pins/${messageId}`);
    }

    /**
     * Unpin message
     */
    async unpinMessage(channelId, messageId) {
        return await this.request('DELETE', `/channels/${channelId}/pins/${messageId}`);
    }

    // ============================================
    // REACTIONS
    // ============================================

    /**
     * Add reaction
     */
    async addReaction(channelId, messageId, emoji) {
        const encodedEmoji = encodeURIComponent(emoji);
        return await this.request('PUT', `/channels/${channelId}/messages/${messageId}/reactions/${encodedEmoji}/@me`);
    }

    /**
     * Remove reaction
     */
    async removeReaction(channelId, messageId, emoji, userId = '@me') {
        const encodedEmoji = encodeURIComponent(emoji);
        return await this.request('DELETE', `/channels/${channelId}/messages/${messageId}/reactions/${encodedEmoji}/${userId}`);
    }

    /**
     * Get reactions
     */
    async getReactions(channelId, messageId, emoji) {
        const encodedEmoji = encodeURIComponent(emoji);
        return await this.request('GET', `/channels/${channelId}/messages/${messageId}/reactions/${encodedEmoji}`);
    }

    // ============================================
    // CHANNELS
    // ============================================

    /**
     * Get channel
     */
    async getChannel(channelId) {
        return await this.request('GET', `/channels/${channelId}`);
    }

    /**
     * Create channel
     */
    async createChannel(guildId, name, type = 0, options = {}) {
        return await this.request('POST', `/guilds/${guildId}/channels`, {
            name,
            type, // 0: text, 2: voice, 4: category
            ...options
        });
    }

    /**
     * Update channel
     */
    async updateChannel(channelId, updates) {
        return await this.request('PATCH', `/channels/${channelId}`, updates);
    }

    /**
     * Delete channel
     */
    async deleteChannel(channelId) {
        return await this.request('DELETE', `/channels/${channelId}`);
    }

    /**
     * Get channel invites
     */
    async getChannelInvites(channelId) {
        return await this.request('GET', `/channels/${channelId}/invites`);
    }

    /**
     * Create channel invite
     */
    async createChannelInvite(channelId, options = {}) {
        return await this.request('POST', `/channels/${channelId}/invites`, options);
    }

    // ============================================
    // GUILDS (SERVERS)
    // ============================================

    /**
     * Get guild
     */
    async getGuild(guildId) {
        return await this.request('GET', `/guilds/${guildId}`);
    }

    /**
     * Get guild channels
     */
    async getGuildChannels(guildId) {
        return await this.request('GET', `/guilds/${guildId}/channels`);
    }

    /**
     * Get guild members
     */
    async getGuildMembers(guildId, limit = 1000) {
        return await this.request('GET', `/guilds/${guildId}/members?limit=${limit}`);
    }

    /**
     * Get guild member
     */
    async getGuildMember(guildId, userId) {
        return await this.request('GET', `/guilds/${guildId}/members/${userId}`);
    }

    /**
     * Add guild member role
     */
    async addMemberRole(guildId, userId, roleId) {
        return await this.request('PUT', `/guilds/${guildId}/members/${userId}/roles/${roleId}`);
    }

    /**
     * Remove guild member role
     */
    async removeMemberRole(guildId, userId, roleId) {
        return await this.request('DELETE', `/guilds/${guildId}/members/${userId}/roles/${roleId}`);
    }

    /**
     * Kick member
     */
    async kickMember(guildId, userId) {
        return await this.request('DELETE', `/guilds/${guildId}/members/${userId}`);
    }

    /**
     * Ban member
     */
    async banMember(guildId, userId, deleteMessageDays = 0) {
        return await this.request('PUT', `/guilds/${guildId}/bans/${userId}`, {
            delete_message_days: deleteMessageDays
        });
    }

    /**
     * Unban member
     */
    async unbanMember(guildId, userId) {
        return await this.request('DELETE', `/guilds/${guildId}/bans/${userId}`);
    }

    // ============================================
    // ROLES
    // ============================================

    /**
     * Get guild roles
     */
    async getGuildRoles(guildId) {
        return await this.request('GET', `/guilds/${guildId}/roles`);
    }

    /**
     * Create role
     */
    async createRole(guildId, name, options = {}) {
        return await this.request('POST', `/guilds/${guildId}/roles`, {
            name,
            ...options
        });
    }

    /**
     * Update role
     */
    async updateRole(guildId, roleId, updates) {
        return await this.request('PATCH', `/guilds/${guildId}/roles/${roleId}`, updates);
    }

    /**
     * Delete role
     */
    async deleteRole(guildId, roleId) {
        return await this.request('DELETE', `/guilds/${guildId}/roles/${roleId}`);
    }

    // ============================================
    // USERS
    // ============================================

    /**
     * Get current user
     */
    async getCurrentUser() {
        return await this.request('GET', '/users/@me');
    }

    /**
     * Get user
     */
    async getUser(userId) {
        return await this.request('GET', `/users/${userId}`);
    }

    /**
     * Create DM
     */
    async createDM(userId) {
        return await this.request('POST', '/users/@me/channels', {
            recipient_id: userId
        });
    }

    /**
     * Send DM
     */
    async sendDM(userId, content, options = {}) {
        const dm = await this.createDM(userId);
        return await this.sendMessage(dm.id, content, options);
    }

    // ============================================
    // WEBHOOKS
    // ============================================

    /**
     * Create webhook
     */
    async createWebhook(channelId, name, avatar = null) {
        return await this.request('POST', `/channels/${channelId}/webhooks`, {
            name,
            avatar
        });
    }

    /**
     * Get channel webhooks
     */
    async getChannelWebhooks(channelId) {
        return await this.request('GET', `/channels/${channelId}/webhooks`);
    }

    /**
     * Get guild webhooks
     */
    async getGuildWebhooks(guildId) {
        return await this.request('GET', `/guilds/${guildId}/webhooks`);
    }

    /**
     * Get webhook
     */
    async getWebhook(webhookId) {
        return await this.request('GET', `/webhooks/${webhookId}`);
    }

    /**
     * Delete webhook
     */
    async deleteWebhook(webhookId) {
        return await this.request('DELETE', `/webhooks/${webhookId}`);
    }

    /**
     * Execute webhook
     */
    async executeWebhook(webhookId, webhookToken, content, options = {}) {
        const config = {
            method: 'POST',
            url: `${this.baseUrl}/webhooks/${webhookId}/${webhookToken}`,
            headers: { 'Content-Type': 'application/json' },
            data: { content, ...options }
        };

        const response = await axios(config);
        return response.data;
    }

    // ============================================
    // SLASH COMMANDS
    // ============================================

    /**
     * Create global command
     */
    async createGlobalCommand(applicationId, name, description, options = []) {
        return await this.request('POST', `/applications/${applicationId}/commands`, {
            name,
            description,
            options
        });
    }

    /**
     * Get global commands
     */
    async getGlobalCommands(applicationId) {
        return await this.request('GET', `/applications/${applicationId}/commands`);
    }

    /**
     * Delete global command
     */
    async deleteGlobalCommand(applicationId, commandId) {
        return await this.request('DELETE', `/applications/${applicationId}/commands/${commandId}`);
    }

    /**
     * Create guild command
     */
    async createGuildCommand(applicationId, guildId, name, description, options = []) {
        return await this.request('POST', `/applications/${applicationId}/guilds/${guildId}/commands`, {
            name,
            description,
            options
        });
    }

    // ============================================
    // VOICE
    // ============================================

    /**
     * Get voice regions
     */
    async getVoiceRegions() {
        return await this.request('GET', '/voice/regions');
    }

    // ============================================
    // EMOJIS
    // ============================================

    /**
     * Get guild emojis
     */
    async getGuildEmojis(guildId) {
        return await this.request('GET', `/guilds/${guildId}/emojis`);
    }

    /**
     * Create guild emoji
     */
    async createGuildEmoji(guildId, name, image) {
        return await this.request('POST', `/guilds/${guildId}/emojis`, {
            name,
            image // base64 encoded
        });
    }

    /**
     * Delete guild emoji
     */
    async deleteGuildEmoji(guildId, emojiId) {
        return await this.request('DELETE', `/guilds/${guildId}/emojis/${emojiId}`);
    }

    // ============================================
    // THREADS
    // ============================================

    /**
     * Create thread
     */
    async createThread(channelId, name, autoArchiveDuration = 60, type = 11) {
        return await this.request('POST', `/channels/${channelId}/threads`, {
            name,
            auto_archive_duration: autoArchiveDuration,
            type // 11: public, 12: private
        });
    }

    /**
     * Join thread
     */
    async joinThread(threadId) {
        return await this.request('PUT', `/channels/${threadId}/thread-members/@me`);
    }

    /**
     * Leave thread
     */
    async leaveThread(threadId) {
        return await this.request('DELETE', `/channels/${threadId}/thread-members/@me`);
    }
}

module.exports = DiscordAPI;
