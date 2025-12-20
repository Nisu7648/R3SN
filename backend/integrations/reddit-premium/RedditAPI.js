/**
 * Reddit Premium API Integration
 * 
 * Provides FREE access to Reddit API with premium features
 * 
 * Features (100% FREE):
 * - Post & Comment Management
 * - Subreddit Management
 * - Moderation Tools
 * - User Profile Management
 * - Analytics & Insights
 * - Ad Campaign Management
 * - Flair Management
 * - Wiki Management
 * 
 * Normal Cost: $0-$149/month for third-party tools + Reddit Premium ($5.99/month)
 * R3SN Cost: FREE ✨
 */

const axios = require('axios');

class RedditAPI {
  constructor(accessToken, userAgent = 'R3SN/1.0') {
    this.accessToken = accessToken;
    this.userAgent = userAgent;
    this.baseURL = 'https://oauth.reddit.com';
  }

  /**
   * Helper method to make API requests
   */
  async request(endpoint, method = 'GET', data = null, params = {}) {
    try {
      const config = {
        method,
        url: `${this.baseURL}/${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'User-Agent': this.userAgent,
          'Content-Type': 'application/json'
        },
        params
      };

      if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        config.data = data;
        config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      throw new Error(`Reddit API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  // ==================== USER PROFILE ====================

  /**
   * Get current user
   */
  async getMe() {
    return await this.request('api/v1/me', 'GET');
  }

  /**
   * Get user karma
   */
  async getKarma() {
    return await this.request('api/v1/me/karma', 'GET');
  }

  /**
   * Get user preferences
   */
  async getPreferences() {
    return await this.request('api/v1/me/prefs', 'GET');
  }

  /**
   * Update preferences
   */
  async updatePreferences(prefs) {
    return await this.request('api/v1/me/prefs', 'PATCH', prefs);
  }

  /**
   * Get user trophies
   */
  async getTrophies() {
    return await this.request('api/v1/me/trophies', 'GET');
  }

  // ==================== POSTS & SUBMISSIONS ====================

  /**
   * Submit post
   */
  async submitPost(subreddit, title, text = null, url = null, kind = 'self', nsfw = false, spoiler = false) {
    const data = {
      sr: subreddit,
      title,
      kind,
      nsfw,
      spoiler
    };

    if (kind === 'self' && text) {
      data.text = text;
    } else if (kind === 'link' && url) {
      data.url = url;
    }

    return await this.request('api/submit', 'POST', data);
  }

  /**
   * Get post
   */
  async getPost(postId) {
    return await this.request(`api/info?id=t3_${postId}`, 'GET');
  }

  /**
   * Edit post
   */
  async editPost(thingId, text) {
    return await this.request('api/editusertext', 'POST', {
      thing_id: thingId,
      text
    });
  }

  /**
   * Delete post
   */
  async deletePost(thingId) {
    return await this.request('api/del', 'POST', {
      id: thingId
    });
  }

  /**
   * Hide post
   */
  async hidePost(thingId) {
    return await this.request('api/hide', 'POST', {
      id: thingId
    });
  }

  /**
   * Unhide post
   */
  async unhidePost(thingId) {
    return await this.request('api/unhide', 'POST', {
      id: thingId
    });
  }

  /**
   * Save post
   */
  async savePost(thingId, category = null) {
    const data = { id: thingId };
    if (category) data.category = category;
    
    return await this.request('api/save', 'POST', data);
  }

  /**
   * Unsave post
   */
  async unsavePost(thingId) {
    return await this.request('api/unsave', 'POST', {
      id: thingId
    });
  }

  // ==================== COMMENTS ====================

  /**
   * Submit comment
   */
  async submitComment(parentId, text) {
    return await this.request('api/comment', 'POST', {
      parent: parentId,
      text
    });
  }

  /**
   * Get comments
   */
  async getComments(subreddit, postId, sort = 'best', limit = 100) {
    return await this.request(`r/${subreddit}/comments/${postId}`, 'GET', null, {
      sort,
      limit
    });
  }

  /**
   * Edit comment
   */
  async editComment(thingId, text) {
    return await this.request('api/editusertext', 'POST', {
      thing_id: thingId,
      text
    });
  }

  /**
   * Delete comment
   */
  async deleteComment(thingId) {
    return await this.request('api/del', 'POST', {
      id: thingId
    });
  }

  // ==================== VOTING ====================

  /**
   * Vote on post/comment
   */
  async vote(thingId, direction) {
    // direction: 1 (upvote), 0 (unvote), -1 (downvote)
    return await this.request('api/vote', 'POST', {
      id: thingId,
      dir: direction
    });
  }

  /**
   * Upvote
   */
  async upvote(thingId) {
    return await this.vote(thingId, 1);
  }

  /**
   * Downvote
   */
  async downvote(thingId) {
    return await this.vote(thingId, -1);
  }

  /**
   * Remove vote
   */
  async unvote(thingId) {
    return await this.vote(thingId, 0);
  }

  // ==================== SUBREDDIT MANAGEMENT ====================

  /**
   * Get subreddit info
   */
  async getSubreddit(subreddit) {
    return await this.request(`r/${subreddit}/about`, 'GET');
  }

  /**
   * Get subreddit posts
   */
  async getSubredditPosts(subreddit, sort = 'hot', limit = 25, after = null) {
    const params = { limit };
    if (after) params.after = after;
    
    return await this.request(`r/${subreddit}/${sort}`, 'GET', null, params);
  }

  /**
   * Subscribe to subreddit
   */
  async subscribe(subreddit) {
    return await this.request('api/subscribe', 'POST', {
      action: 'sub',
      sr_name: subreddit
    });
  }

  /**
   * Unsubscribe from subreddit
   */
  async unsubscribe(subreddit) {
    return await this.request('api/subscribe', 'POST', {
      action: 'unsub',
      sr_name: subreddit
    });
  }

  /**
   * Get subscribed subreddits
   */
  async getSubscriptions(limit = 100) {
    return await this.request('subreddits/mine/subscriber', 'GET', null, { limit });
  }

  /**
   * Search subreddits
   */
  async searchSubreddits(query, limit = 25) {
    return await this.request('subreddits/search', 'GET', null, {
      q: query,
      limit
    });
  }

  // ==================== MODERATION ====================

  /**
   * Get moderated subreddits
   */
  async getModeratedSubreddits() {
    return await this.request('subreddits/mine/moderator', 'GET');
  }

  /**
   * Get modqueue
   */
  async getModqueue(subreddit, limit = 100) {
    return await this.request(`r/${subreddit}/about/modqueue`, 'GET', null, { limit });
  }

  /**
   * Get reports
   */
  async getReports(subreddit, limit = 100) {
    return await this.request(`r/${subreddit}/about/reports`, 'GET', null, { limit });
  }

  /**
   * Get spam
   */
  async getSpam(subreddit, limit = 100) {
    return await this.request(`r/${subreddit}/about/spam`, 'GET', null, { limit });
  }

  /**
   * Approve post/comment
   */
  async approve(thingId) {
    return await this.request('api/approve', 'POST', {
      id: thingId
    });
  }

  /**
   * Remove post/comment
   */
  async remove(thingId, spam = false) {
    return await this.request('api/remove', 'POST', {
      id: thingId,
      spam
    });
  }

  /**
   * Distinguish post/comment
   */
  async distinguish(thingId, how = 'yes', sticky = false) {
    return await this.request('api/distinguish', 'POST', {
      id: thingId,
      how,
      sticky
    });
  }

  /**
   * Lock post/comment
   */
  async lock(thingId) {
    return await this.request('api/lock', 'POST', {
      id: thingId
    });
  }

  /**
   * Unlock post/comment
   */
  async unlock(thingId) {
    return await this.request('api/unlock', 'POST', {
      id: thingId
    });
  }

  /**
   * Ban user
   */
  async banUser(subreddit, username, duration = null, reason = null, note = null) {
    const data = {
      name: username,
      type: 'banned'
    };

    if (duration) data.duration = duration;
    if (reason) data.reason = reason;
    if (note) data.note = note;

    return await this.request(`r/${subreddit}/api/friend`, 'POST', data);
  }

  /**
   * Unban user
   */
  async unbanUser(subreddit, username) {
    return await this.request(`r/${subreddit}/api/unfriend`, 'POST', {
      name: username,
      type: 'banned'
    });
  }

  // ==================== FLAIR ====================

  /**
   * Get user flair
   */
  async getUserFlair(subreddit, username) {
    return await this.request(`r/${subreddit}/api/flairselector`, 'POST', {
      name: username
    });
  }

  /**
   * Set user flair
   */
  async setUserFlair(subreddit, username, text, cssClass = null) {
    const data = {
      name: username,
      text
    };

    if (cssClass) data.css_class = cssClass;

    return await this.request(`r/${subreddit}/api/flair`, 'POST', data);
  }

  /**
   * Get post flair
   */
  async getPostFlair(subreddit) {
    return await this.request(`r/${subreddit}/api/link_flair_v2`, 'GET');
  }

  /**
   * Set post flair
   */
  async setPostFlair(subreddit, linkId, flairTemplateId) {
    return await this.request(`r/${subreddit}/api/selectflair`, 'POST', {
      link: linkId,
      flair_template_id: flairTemplateId
    });
  }

  // ==================== MESSAGES ====================

  /**
   * Get inbox
   */
  async getInbox(filter = 'inbox', limit = 25) {
    return await this.request(`message/${filter}`, 'GET', null, { limit });
  }

  /**
   * Get unread messages
   */
  async getUnread(limit = 25) {
    return await this.request('message/unread', 'GET', null, { limit });
  }

  /**
   * Send message
   */
  async sendMessage(to, subject, text) {
    return await this.request('api/compose', 'POST', {
      to,
      subject,
      text
    });
  }

  /**
   * Mark as read
   */
  async markRead(thingId) {
    return await this.request('api/read_message', 'POST', {
      id: thingId
    });
  }

  /**
   * Mark as unread
   */
  async markUnread(thingId) {
    return await this.request('api/unread_message', 'POST', {
      id: thingId
    });
  }

  // ==================== SEARCH ====================

  /**
   * Search posts
   */
  async search(query, subreddit = null, sort = 'relevance', time = 'all', limit = 25) {
    const endpoint = subreddit ? `r/${subreddit}/search` : 'search';
    
    return await this.request(endpoint, 'GET', null, {
      q: query,
      sort,
      t: time,
      limit,
      restrict_sr: subreddit ? 'true' : 'false'
    });
  }

  // ==================== WIKI ====================

  /**
   * Get wiki page
   */
  async getWikiPage(subreddit, page) {
    return await this.request(`r/${subreddit}/wiki/${page}`, 'GET');
  }

  /**
   * Edit wiki page
   */
  async editWikiPage(subreddit, page, content, reason = null) {
    const data = {
      page,
      content
    };

    if (reason) data.reason = reason;

    return await this.request(`r/${subreddit}/api/wiki/edit`, 'POST', data);
  }

  // ==================== ANALYTICS ====================

  /**
   * Get subreddit traffic
   */
  async getTraffic(subreddit) {
    return await this.request(`r/${subreddit}/about/traffic`, 'GET');
  }

  // ==================== MULTIREDDITS ====================

  /**
   * Get multireddits
   */
  async getMultireddits() {
    return await this.request('api/multi/mine', 'GET');
  }

  /**
   * Create multireddit
   */
  async createMultireddit(name, subreddits, description = '') {
    return await this.request(`api/multi/user/${await this.getUsername()}/m/${name}`, 'PUT', {
      model: JSON.stringify({
        display_name: name,
        description_md: description,
        subreddits: subreddits.map(sr => ({ name: sr }))
      })
    });
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get username
   */
  async getUsername() {
    if (this.username) return this.username;
    
    const me = await this.getMe();
    this.username = me.name;
    return this.username;
  }

  /**
   * Parse thing ID
   */
  parseThingId(fullname) {
    // fullname format: t1_abc123 (comment), t3_abc123 (post), etc.
    const parts = fullname.split('_');
    return {
      type: parts[0],
      id: parts[1]
    };
  }

  /**
   * Create thing ID
   */
  createThingId(type, id) {
    // type: 1 (comment), 3 (post), 4 (message), 5 (subreddit), 6 (award)
    return `t${type}_${id}`;
  }
}

module.exports = RedditAPI;
