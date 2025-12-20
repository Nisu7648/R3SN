/**
 * YouTube Premium API Integration
 * 
 * Provides FREE access to YouTube Data API v3 & YouTube Analytics API
 * 
 * Features (100% FREE):
 * - Video Management & Upload
 * - Channel Management
 * - Playlist Management
 * - Comments & Engagement
 * - Analytics & Insights
 * - Live Streaming
 * - Captions & Subtitles
 * - Thumbnail Management
 * 
 * Normal Cost: YouTube Premium ($11.99/month) + Third-party tools ($0-$299/month)
 * R3SN Cost: FREE ✨
 */

const axios = require('axios');

class YouTubeAPI {
  constructor(apiKey, accessToken = null) {
    this.apiKey = apiKey;
    this.accessToken = accessToken;
    this.baseURL = 'https://www.googleapis.com/youtube/v3';
    this.analyticsURL = 'https://youtubeanalytics.googleapis.com/v2';
  }

  /**
   * Helper method to make API requests
   */
  async request(endpoint, method = 'GET', data = null, params = {}, useAnalytics = false) {
    try {
      const baseUrl = useAnalytics ? this.analyticsURL : this.baseURL;
      
      const config = {
        method,
        url: `${baseUrl}/${endpoint}`,
        params: {
          key: this.apiKey,
          ...params
        },
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (this.accessToken) {
        config.headers['Authorization'] = `Bearer ${this.accessToken}`;
        delete config.params.key;
      }

      if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      throw new Error(`YouTube API Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // ==================== CHANNEL MANAGEMENT ====================

  /**
   * Get channel info
   */
  async getChannel(channelId = 'mine', part = ['snippet', 'statistics', 'contentDetails']) {
    const params = { part: part.join(',') };
    
    if (channelId === 'mine') {
      params.mine = true;
    } else {
      params.id = channelId;
    }

    return await this.request('channels', 'GET', null, params);
  }

  /**
   * Get channel statistics
   */
  async getChannelStats(channelId) {
    const response = await this.getChannel(channelId, ['statistics']);
    return response.items[0].statistics;
  }

  /**
   * Update channel
   */
  async updateChannel(channelId, updates) {
    return await this.request('channels', 'PUT', {
      id: channelId,
      ...updates
    }, { part: 'snippet,brandingSettings' });
  }

  /**
   * Get channel sections
   */
  async getChannelSections(channelId = 'mine') {
    const params = { part: 'snippet,contentDetails' };
    
    if (channelId === 'mine') {
      params.mine = true;
    } else {
      params.channelId = channelId;
    }

    return await this.request('channelSections', 'GET', null, params);
  }

  // ==================== VIDEO MANAGEMENT ====================

  /**
   * Get video
   */
  async getVideo(videoId, part = ['snippet', 'statistics', 'contentDetails']) {
    return await this.request('videos', 'GET', null, {
      part: part.join(','),
      id: videoId
    });
  }

  /**
   * Get videos
   */
  async getVideos(videoIds, part = ['snippet', 'statistics']) {
    return await this.request('videos', 'GET', null, {
      part: part.join(','),
      id: videoIds.join(',')
    });
  }

  /**
   * Get my videos
   */
  async getMyVideos(maxResults = 50, pageToken = null) {
    // First get uploads playlist
    const channel = await this.getChannel('mine', ['contentDetails']);
    const uploadsPlaylistId = channel.items[0].contentDetails.relatedPlaylists.uploads;

    // Then get videos from uploads playlist
    return await this.getPlaylistItems(uploadsPlaylistId, maxResults, pageToken);
  }

  /**
   * Upload video (requires resumable upload - simplified version)
   */
  async uploadVideo(title, description, tags = [], categoryId = '22', privacyStatus = 'private') {
    // Note: Actual video upload requires resumable upload protocol
    // This creates the video resource
    return await this.request('videos', 'POST', {
      snippet: {
        title,
        description,
        tags,
        categoryId
      },
      status: {
        privacyStatus
      }
    }, { part: 'snippet,status' });
  }

  /**
   * Update video
   */
  async updateVideo(videoId, updates) {
    return await this.request('videos', 'PUT', {
      id: videoId,
      ...updates
    }, { part: 'snippet,status' });
  }

  /**
   * Delete video
   */
  async deleteVideo(videoId) {
    return await this.request('videos', 'DELETE', null, { id: videoId });
  }

  /**
   * Rate video
   */
  async rateVideo(videoId, rating) {
    // rating: 'like', 'dislike', 'none'
    return await this.request('videos/rate', 'POST', null, {
      id: videoId,
      rating
    });
  }

  // ==================== PLAYLIST MANAGEMENT ====================

  /**
   * Get playlists
   */
  async getPlaylists(channelId = 'mine', maxResults = 50, pageToken = null) {
    const params = {
      part: 'snippet,contentDetails',
      maxResults
    };

    if (pageToken) params.pageToken = pageToken;

    if (channelId === 'mine') {
      params.mine = true;
    } else {
      params.channelId = channelId;
    }

    return await this.request('playlists', 'GET', null, params);
  }

  /**
   * Get playlist
   */
  async getPlaylist(playlistId) {
    return await this.request('playlists', 'GET', null, {
      part: 'snippet,contentDetails',
      id: playlistId
    });
  }

  /**
   * Create playlist
   */
  async createPlaylist(title, description = '', privacyStatus = 'private') {
    return await this.request('playlists', 'POST', {
      snippet: {
        title,
        description
      },
      status: {
        privacyStatus
      }
    }, { part: 'snippet,status' });
  }

  /**
   * Update playlist
   */
  async updatePlaylist(playlistId, updates) {
    return await this.request('playlists', 'PUT', {
      id: playlistId,
      ...updates
    }, { part: 'snippet,status' });
  }

  /**
   * Delete playlist
   */
  async deletePlaylist(playlistId) {
    return await this.request('playlists', 'DELETE', null, { id: playlistId });
  }

  /**
   * Get playlist items
   */
  async getPlaylistItems(playlistId, maxResults = 50, pageToken = null) {
    const params = {
      part: 'snippet,contentDetails',
      playlistId,
      maxResults
    };

    if (pageToken) params.pageToken = pageToken;

    return await this.request('playlistItems', 'GET', null, params);
  }

  /**
   * Add video to playlist
   */
  async addToPlaylist(playlistId, videoId, position = null) {
    const data = {
      snippet: {
        playlistId,
        resourceId: {
          kind: 'youtube#video',
          videoId
        }
      }
    };

    if (position !== null) {
      data.snippet.position = position;
    }

    return await this.request('playlistItems', 'POST', data, {
      part: 'snippet'
    });
  }

  /**
   * Remove from playlist
   */
  async removeFromPlaylist(playlistItemId) {
    return await this.request('playlistItems', 'DELETE', null, {
      id: playlistItemId
    });
  }

  // ==================== COMMENTS ====================

  /**
   * Get video comments
   */
  async getVideoComments(videoId, maxResults = 100, pageToken = null) {
    const params = {
      part: 'snippet',
      videoId,
      maxResults,
      textFormat: 'plainText'
    };

    if (pageToken) params.pageToken = pageToken;

    return await this.request('commentThreads', 'GET', null, params);
  }

  /**
   * Get comment thread
   */
  async getCommentThread(commentId) {
    return await this.request('commentThreads', 'GET', null, {
      part: 'snippet,replies',
      id: commentId
    });
  }

  /**
   * Post comment
   */
  async postComment(videoId, text) {
    return await this.request('commentThreads', 'POST', {
      snippet: {
        videoId,
        topLevelComment: {
          snippet: {
            textOriginal: text
          }
        }
      }
    }, { part: 'snippet' });
  }

  /**
   * Reply to comment
   */
  async replyToComment(commentId, text) {
    return await this.request('comments', 'POST', {
      snippet: {
        parentId: commentId,
        textOriginal: text
      }
    }, { part: 'snippet' });
  }

  /**
   * Update comment
   */
  async updateComment(commentId, text) {
    return await this.request('comments', 'PUT', {
      id: commentId,
      snippet: {
        textOriginal: text
      }
    }, { part: 'snippet' });
  }

  /**
   * Delete comment
   */
  async deleteComment(commentId) {
    return await this.request('comments', 'DELETE', null, { id: commentId });
  }

  // ==================== SEARCH ====================

  /**
   * Search videos
   */
  async searchVideos(query, maxResults = 25, pageToken = null, filters = {}) {
    const params = {
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults
    };

    if (pageToken) params.pageToken = pageToken;
    
    // Add filters
    if (filters.channelId) params.channelId = filters.channelId;
    if (filters.order) params.order = filters.order; // date, rating, relevance, title, viewCount
    if (filters.publishedAfter) params.publishedAfter = filters.publishedAfter;
    if (filters.publishedBefore) params.publishedBefore = filters.publishedBefore;
    if (filters.videoDuration) params.videoDuration = filters.videoDuration; // short, medium, long
    if (filters.videoDefinition) params.videoDefinition = filters.videoDefinition; // high, standard

    return await this.request('search', 'GET', null, params);
  }

  /**
   * Search channels
   */
  async searchChannels(query, maxResults = 25, pageToken = null) {
    return await this.request('search', 'GET', null, {
      part: 'snippet',
      q: query,
      type: 'channel',
      maxResults,
      pageToken
    });
  }

  // ==================== ANALYTICS ====================

  /**
   * Get video analytics
   */
  async getVideoAnalytics(videoId, startDate, endDate, metrics = ['views', 'likes', 'comments', 'shares', 'estimatedMinutesWatched', 'averageViewDuration']) {
    return await this.request('reports', 'GET', null, {
      ids: 'channel==MINE',
      startDate,
      endDate,
      metrics: metrics.join(','),
      dimensions: 'video',
      filters: `video==${videoId}`
    }, true);
  }

  /**
   * Get channel analytics
   */
  async getChannelAnalytics(startDate, endDate, metrics = ['views', 'likes', 'comments', 'shares', 'estimatedMinutesWatched', 'subscribersGained', 'subscribersLost']) {
    return await this.request('reports', 'GET', null, {
      ids: 'channel==MINE',
      startDate,
      endDate,
      metrics: metrics.join(',')
    }, true);
  }

  /**
   * Get top videos
   */
  async getTopVideos(startDate, endDate, maxResults = 10) {
    return await this.request('reports', 'GET', null, {
      ids: 'channel==MINE',
      startDate,
      endDate,
      metrics: 'views,estimatedMinutesWatched,averageViewDuration,likes,comments',
      dimensions: 'video',
      sort: '-views',
      maxResults
    }, true);
  }

  // ==================== CAPTIONS ====================

  /**
   * Get captions
   */
  async getCaptions(videoId) {
    return await this.request('captions', 'GET', null, {
      part: 'snippet',
      videoId
    });
  }

  /**
   * Upload caption
   */
  async uploadCaption(videoId, language, name, isDraft = false) {
    return await this.request('captions', 'POST', {
      snippet: {
        videoId,
        language,
        name,
        isDraft
      }
    }, { part: 'snippet' });
  }

  /**
   * Delete caption
   */
  async deleteCaption(captionId) {
    return await this.request('captions', 'DELETE', null, { id: captionId });
  }

  // ==================== THUMBNAILS ====================

  /**
   * Set thumbnail (requires file upload)
   */
  async setThumbnail(videoId, imageData) {
    // Note: Requires multipart upload
    return await this.request(`thumbnails/set`, 'POST', imageData, {
      videoId
    });
  }

  // ==================== SUBSCRIPTIONS ====================

  /**
   * Get subscriptions
   */
  async getSubscriptions(channelId = 'mine', maxResults = 50, pageToken = null) {
    const params = {
      part: 'snippet',
      maxResults
    };

    if (pageToken) params.pageToken = pageToken;

    if (channelId === 'mine') {
      params.mine = true;
    } else {
      params.channelId = channelId;
    }

    return await this.request('subscriptions', 'GET', null, params);
  }

  /**
   * Subscribe to channel
   */
  async subscribe(channelId) {
    return await this.request('subscriptions', 'POST', {
      snippet: {
        resourceId: {
          kind: 'youtube#channel',
          channelId
        }
      }
    }, { part: 'snippet' });
  }

  /**
   * Unsubscribe
   */
  async unsubscribe(subscriptionId) {
    return await this.request('subscriptions', 'DELETE', null, {
      id: subscriptionId
    });
  }

  // ==================== LIVE STREAMING ====================

  /**
   * Get live broadcasts
   */
  async getLiveBroadcasts(broadcastStatus = 'upcoming', maxResults = 50) {
    return await this.request('liveBroadcasts', 'GET', null, {
      part: 'snippet,status',
      broadcastStatus,
      maxResults
    });
  }

  /**
   * Create live broadcast
   */
  async createLiveBroadcast(title, description, scheduledStartTime, privacyStatus = 'public') {
    return await this.request('liveBroadcasts', 'POST', {
      snippet: {
        title,
        description,
        scheduledStartTime
      },
      status: {
        privacyStatus
      }
    }, { part: 'snippet,status' });
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Format date for API (ISO 8601)
   */
  formatDate(date) {
    return date.toISOString();
  }

  /**
   * Parse duration (PT format to seconds)
   */
  parseDuration(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = (match[1] || '').replace('H', '') || 0;
    const minutes = (match[2] || '').replace('M', '') || 0;
    const seconds = (match[3] || '').replace('S', '') || 0;
    
    return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
  }

  /**
   * Get video performance summary
   */
  async getVideoPerformance(videoId) {
    const video = await this.getVideo(videoId, ['statistics', 'contentDetails']);
    const stats = video.items[0].statistics;
    const details = video.items[0].contentDetails;

    return {
      views: parseInt(stats.viewCount),
      likes: parseInt(stats.likeCount),
      comments: parseInt(stats.commentCount),
      duration: this.parseDuration(details.duration),
      engagement_rate: ((parseInt(stats.likeCount) + parseInt(stats.commentCount)) / parseInt(stats.viewCount) * 100).toFixed(2) + '%'
    };
  }
}

module.exports = YouTubeAPI;
