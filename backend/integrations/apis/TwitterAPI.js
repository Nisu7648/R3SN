/**
 * Twitter/X API Integration - REAL IMPLEMENTATION
 * Tweets, timeline, search, users, DMs
 */

const axios = require('axios');

class TwitterAPI {
    constructor(bearerToken) {
        this.bearerToken = bearerToken || process.env.TWITTER_BEARER_TOKEN;
        this.baseUrl = 'https://api.twitter.com/2';
    }

    /**
     * Make authenticated request
     */
    async request(method, endpoint, data = null, params = null) {
        const config = {
            method,
            url: `${this.baseUrl}${endpoint}`,
            headers: {
                'Authorization': `Bearer ${this.bearerToken}`,
                'Content-Type': 'application/json'
            }
        };

        if (params) config.params = params;
        if (data) config.data = data;

        const response = await axios(config);
        return response.data;
    }

    // ============================================
    // TWEETS
    // ============================================

    /**
     * Post tweet
     */
    async postTweet(text, options = {}) {
        return await this.request('POST', '/tweets', {
            text,
            ...options
        });
    }

    /**
     * Delete tweet
     */
    async deleteTweet(tweetId) {
        return await this.request('DELETE', `/tweets/${tweetId}`);
    }

    /**
     * Get tweet
     */
    async getTweet(tweetId, fields = []) {
        const params = {};
        if (fields.length) params['tweet.fields'] = fields.join(',');
        
        return await this.request('GET', `/tweets/${tweetId}`, null, params);
    }

    /**
     * Get multiple tweets
     */
    async getTweets(tweetIds, fields = []) {
        const params = { ids: tweetIds.join(',') };
        if (fields.length) params['tweet.fields'] = fields.join(',');
        
        return await this.request('GET', '/tweets', null, params);
    }

    /**
     * Reply to tweet
     */
    async replyToTweet(tweetId, text) {
        return await this.postTweet(text, {
            reply: { in_reply_to_tweet_id: tweetId }
        });
    }

    /**
     * Quote tweet
     */
    async quoteTweet(tweetId, text) {
        return await this.postTweet(text, {
            quote_tweet_id: tweetId
        });
    }

    /**
     * Retweet
     */
    async retweet(userId, tweetId) {
        return await this.request('POST', `/users/${userId}/retweets`, {
            tweet_id: tweetId
        });
    }

    /**
     * Unretweet
     */
    async unretweet(userId, tweetId) {
        return await this.request('DELETE', `/users/${userId}/retweets/${tweetId}`);
    }

    // ============================================
    // LIKES
    // ============================================

    /**
     * Like tweet
     */
    async likeTweet(userId, tweetId) {
        return await this.request('POST', `/users/${userId}/likes`, {
            tweet_id: tweetId
        });
    }

    /**
     * Unlike tweet
     */
    async unlikeTweet(userId, tweetId) {
        return await this.request('DELETE', `/users/${userId}/likes/${tweetId}`);
    }

    /**
     * Get liked tweets
     */
    async getLikedTweets(userId, maxResults = 10) {
        return await this.request('GET', `/users/${userId}/liked_tweets`, null, {
            max_results: maxResults
        });
    }

    // ============================================
    // TIMELINE
    // ============================================

    /**
     * Get user timeline
     */
    async getUserTimeline(userId, maxResults = 10, fields = []) {
        const params = { max_results: maxResults };
        if (fields.length) params['tweet.fields'] = fields.join(',');
        
        return await this.request('GET', `/users/${userId}/tweets`, null, params);
    }

    /**
     * Get mentions
     */
    async getMentions(userId, maxResults = 10) {
        return await this.request('GET', `/users/${userId}/mentions`, null, {
            max_results: maxResults
        });
    }

    /**
     * Get home timeline
     */
    async getHomeTimeline(userId, maxResults = 10) {
        return await this.request('GET', `/users/${userId}/timelines/reverse_chronological`, null, {
            max_results: maxResults
        });
    }

    // ============================================
    // SEARCH
    // ============================================

    /**
     * Search recent tweets
     */
    async searchRecentTweets(query, maxResults = 10, fields = []) {
        const params = {
            query,
            max_results: maxResults
        };
        if (fields.length) params['tweet.fields'] = fields.join(',');
        
        return await this.request('GET', '/tweets/search/recent', null, params);
    }

    /**
     * Search all tweets (requires academic access)
     */
    async searchAllTweets(query, maxResults = 10, fields = []) {
        const params = {
            query,
            max_results: maxResults
        };
        if (fields.length) params['tweet.fields'] = fields.join(',');
        
        return await this.request('GET', '/tweets/search/all', null, params);
    }

    // ============================================
    // USERS
    // ============================================

    /**
     * Get user by username
     */
    async getUserByUsername(username, fields = []) {
        const params = {};
        if (fields.length) params['user.fields'] = fields.join(',');
        
        return await this.request('GET', `/users/by/username/${username}`, null, params);
    }

    /**
     * Get user by ID
     */
    async getUserById(userId, fields = []) {
        const params = {};
        if (fields.length) params['user.fields'] = fields.join(',');
        
        return await this.request('GET', `/users/${userId}`, null, params);
    }

    /**
     * Get multiple users
     */
    async getUsers(userIds, fields = []) {
        const params = { ids: userIds.join(',') };
        if (fields.length) params['user.fields'] = fields.join(',');
        
        return await this.request('GET', '/users', null, params);
    }

    /**
     * Get authenticated user
     */
    async getMe(fields = []) {
        const params = {};
        if (fields.length) params['user.fields'] = fields.join(',');
        
        return await this.request('GET', '/users/me', null, params);
    }

    // ============================================
    // FOLLOWERS
    // ============================================

    /**
     * Get followers
     */
    async getFollowers(userId, maxResults = 10) {
        return await this.request('GET', `/users/${userId}/followers`, null, {
            max_results: maxResults
        });
    }

    /**
     * Get following
     */
    async getFollowing(userId, maxResults = 10) {
        return await this.request('GET', `/users/${userId}/following`, null, {
            max_results: maxResults
        });
    }

    /**
     * Follow user
     */
    async followUser(sourceUserId, targetUserId) {
        return await this.request('POST', `/users/${sourceUserId}/following`, {
            target_user_id: targetUserId
        });
    }

    /**
     * Unfollow user
     */
    async unfollowUser(sourceUserId, targetUserId) {
        return await this.request('DELETE', `/users/${sourceUserId}/following/${targetUserId}`);
    }

    // ============================================
    // DIRECT MESSAGES
    // ============================================

    /**
     * Send DM
     */
    async sendDM(participantId, text, attachments = []) {
        return await this.request('POST', '/dm_conversations/with/:participant_id/messages', {
            text,
            attachments
        });
    }

    /**
     * Get DM events
     */
    async getDMEvents(maxResults = 10) {
        return await this.request('GET', '/dm_events', null, {
            max_results: maxResults
        });
    }

    // ============================================
    // LISTS
    // ============================================

    /**
     * Create list
     */
    async createList(name, description = '', isPrivate = false) {
        return await this.request('POST', '/lists', {
            name,
            description,
            private: isPrivate
        });
    }

    /**
     * Delete list
     */
    async deleteList(listId) {
        return await this.request('DELETE', `/lists/${listId}`);
    }

    /**
     * Update list
     */
    async updateList(listId, updates) {
        return await this.request('PUT', `/lists/${listId}`, updates);
    }

    /**
     * Get list
     */
    async getList(listId) {
        return await this.request('GET', `/lists/${listId}`);
    }

    /**
     * Add member to list
     */
    async addListMember(listId, userId) {
        return await this.request('POST', `/lists/${listId}/members`, {
            user_id: userId
        });
    }

    /**
     * Remove member from list
     */
    async removeListMember(listId, userId) {
        return await this.request('DELETE', `/lists/${listId}/members/${userId}`);
    }

    /**
     * Get list members
     */
    async getListMembers(listId, maxResults = 10) {
        return await this.request('GET', `/lists/${listId}/members`, null, {
            max_results: maxResults
        });
    }

    /**
     * Get list tweets
     */
    async getListTweets(listId, maxResults = 10) {
        return await this.request('GET', `/lists/${listId}/tweets`, null, {
            max_results: maxResults
        });
    }

    // ============================================
    // BOOKMARKS
    // ============================================

    /**
     * Bookmark tweet
     */
    async bookmarkTweet(userId, tweetId) {
        return await this.request('POST', `/users/${userId}/bookmarks`, {
            tweet_id: tweetId
        });
    }

    /**
     * Remove bookmark
     */
    async removeBookmark(userId, tweetId) {
        return await this.request('DELETE', `/users/${userId}/bookmarks/${tweetId}`);
    }

    /**
     * Get bookmarks
     */
    async getBookmarks(userId, maxResults = 10) {
        return await this.request('GET', `/users/${userId}/bookmarks`, null, {
            max_results: maxResults
        });
    }

    // ============================================
    // SPACES
    // ============================================

    /**
     * Get space
     */
    async getSpace(spaceId, fields = []) {
        const params = {};
        if (fields.length) params['space.fields'] = fields.join(',');
        
        return await this.request('GET', `/spaces/${spaceId}`, null, params);
    }

    /**
     * Search spaces
     */
    async searchSpaces(query, maxResults = 10) {
        return await this.request('GET', '/spaces/search', null, {
            query,
            max_results: maxResults
        });
    }

    // ============================================
    // TRENDS
    // ============================================

    /**
     * Get trending topics (requires v1.1 API)
     */
    async getTrends(woeid = 1) { // 1 = worldwide
        const v1Url = 'https://api.twitter.com/1.1';
        const config = {
            method: 'GET',
            url: `${v1Url}/trends/place.json`,
            headers: {
                'Authorization': `Bearer ${this.bearerToken}`
            },
            params: { id: woeid }
        };

        const response = await axios(config);
        return response.data;
    }
}

module.exports = TwitterAPI;
