/**
 * YouTube API Integration
 * Complete video platform and channel management
 */

const axios = require('axios');

class YouTubeAPI {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.YOUTUBE_API_KEY;
    this.baseURL = 'https://www.googleapis.com/youtube/v3';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      params: {
        key: this.apiKey
      }
    });
  }

  // ==================== VIDEOS ====================

  async getVideo(videoId, parts = ['snippet', 'contentDetails', 'statistics']) {
    const params = {
      part: parts.join(','),
      id: videoId
    };

    const response = await this.client.get('/videos', { params });
    return { success: true, video: response.data.items[0] };
  }

  async listVideos(options = {}) {
    const params = {
      part: options.part || 'snippet,contentDetails,statistics',
      ...(options.chart && { chart: options.chart }),
      ...(options.id && { id: options.id }),
      ...(options.myRating && { myRating: options.myRating }),
      maxResults: options.maxResults || 25,
      ...(options.pageToken && { pageToken: options.pageToken }),
      ...(options.regionCode && { regionCode: options.regionCode }),
      ...(options.videoCategoryId && { videoCategoryId: options.videoCategoryId })
    };

    const response = await this.client.get('/videos', { params });
    return { 
      success: true, 
      videos: response.data.items,
      nextPageToken: response.data.nextPageToken,
      prevPageToken: response.data.prevPageToken
    };
  }

  async searchVideos(query, options = {}) {
    const params = {
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: options.maxResults || 25,
      ...(options.channelId && { channelId: options.channelId }),
      ...(options.order && { order: options.order }),
      ...(options.publishedAfter && { publishedAfter: options.publishedAfter }),
      ...(options.publishedBefore && { publishedBefore: options.publishedBefore }),
      ...(options.regionCode && { regionCode: options.regionCode }),
      ...(options.relevanceLanguage && { relevanceLanguage: options.relevanceLanguage }),
      ...(options.videoDuration && { videoDuration: options.videoDuration }),
      ...(options.videoDefinition && { videoDefinition: options.videoDefinition }),
      ...(options.pageToken && { pageToken: options.pageToken })
    };

    const response = await this.client.get('/search', { params });
    return { 
      success: true, 
      videos: response.data.items,
      nextPageToken: response.data.nextPageToken
    };
  }

  async rateVideo(videoId, rating) {
    const params = {
      id: videoId,
      rating
    };

    await this.client.post('/videos/rate', null, { params });
    return { success: true, message: 'Video rated successfully' };
  }

  async getVideoRating(videoIds) {
    const params = {
      id: videoIds.join(',')
    };

    const response = await this.client.get('/videos/getRating', { params });
    return { success: true, ratings: response.data.items };
  }

  async reportAbuse(videoId, reasonId, comments = '') {
    const payload = {
      videoId,
      reasonId,
      ...(comments && { comments })
    };

    await this.client.post('/videos/reportAbuse', payload);
    return { success: true, message: 'Video reported successfully' };
  }

  // ==================== CHANNELS ====================

  async getChannel(channelId, parts = ['snippet', 'contentDetails', 'statistics']) {
    const params = {
      part: parts.join(','),
      id: channelId
    };

    const response = await this.client.get('/channels', { params });
    return { success: true, channel: response.data.items[0] };
  }

  async listChannels(options = {}) {
    const params = {
      part: options.part || 'snippet,contentDetails,statistics',
      ...(options.id && { id: options.id }),
      ...(options.mine && { mine: options.mine }),
      ...(options.forUsername && { forUsername: options.forUsername }),
      maxResults: options.maxResults || 25,
      ...(options.pageToken && { pageToken: options.pageToken })
    };

    const response = await this.client.get('/channels', { params });
    return { 
      success: true, 
      channels: response.data.items,
      nextPageToken: response.data.nextPageToken
    };
  }

  async updateChannel(channelId, data) {
    const payload = {
      id: channelId,
      ...data
    };

    const response = await this.client.put('/channels', payload, {
      params: { part: 'brandingSettings,snippet' }
    });
    return { success: true, channel: response.data };
  }

  // ==================== PLAYLISTS ====================

  async getPlaylist(playlistId, parts = ['snippet', 'contentDetails']) {
    const params = {
      part: parts.join(','),
      id: playlistId
    };

    const response = await this.client.get('/playlists', { params });
    return { success: true, playlist: response.data.items[0] };
  }

  async listPlaylists(options = {}) {
    const params = {
      part: options.part || 'snippet,contentDetails',
      ...(options.channelId && { channelId: options.channelId }),
      ...(options.id && { id: options.id }),
      ...(options.mine && { mine: options.mine }),
      maxResults: options.maxResults || 25,
      ...(options.pageToken && { pageToken: options.pageToken })
    };

    const response = await this.client.get('/playlists', { params });
    return { 
      success: true, 
      playlists: response.data.items,
      nextPageToken: response.data.nextPageToken
    };
  }

  async createPlaylist(data) {
    const payload = {
      snippet: {
        title: data.title,
        description: data.description || '',
        ...(data.tags && { tags: data.tags }),
        ...(data.defaultLanguage && { defaultLanguage: data.defaultLanguage })
      },
      status: {
        privacyStatus: data.privacyStatus || 'private'
      }
    };

    const response = await this.client.post('/playlists', payload, {
      params: { part: 'snippet,status' }
    });
    return { success: true, playlist: response.data };
  }

  async updatePlaylist(playlistId, data) {
    const payload = {
      id: playlistId,
      snippet: {
        title: data.title,
        ...(data.description && { description: data.description })
      },
      ...(data.status && { status: data.status })
    };

    const response = await this.client.put('/playlists', payload, {
      params: { part: 'snippet,status' }
    });
    return { success: true, playlist: response.data };
  }

  async deletePlaylist(playlistId) {
    const params = { id: playlistId };
    await this.client.delete('/playlists', { params });
    return { success: true, message: 'Playlist deleted successfully' };
  }

  // ==================== PLAYLIST ITEMS ====================

  async getPlaylistItems(playlistId, options = {}) {
    const params = {
      part: options.part || 'snippet,contentDetails',
      playlistId,
      maxResults: options.maxResults || 50,
      ...(options.pageToken && { pageToken: options.pageToken })
    };

    const response = await this.client.get('/playlistItems', { params });
    return { 
      success: true, 
      items: response.data.items,
      nextPageToken: response.data.nextPageToken
    };
  }

  async addToPlaylist(playlistId, videoId, position = null) {
    const payload = {
      snippet: {
        playlistId,
        resourceId: {
          kind: 'youtube#video',
          videoId
        },
        ...(position !== null && { position })
      }
    };

    const response = await this.client.post('/playlistItems', payload, {
      params: { part: 'snippet' }
    });
    return { success: true, item: response.data };
  }

  async updatePlaylistItem(itemId, data) {
    const payload = {
      id: itemId,
      snippet: data
    };

    const response = await this.client.put('/playlistItems', payload, {
      params: { part: 'snippet' }
    });
    return { success: true, item: response.data };
  }

  async deletePlaylistItem(itemId) {
    const params = { id: itemId };
    await this.client.delete('/playlistItems', { params });
    return { success: true, message: 'Item removed from playlist' };
  }

  // ==================== COMMENTS ====================

  async getCommentThreads(options = {}) {
    const params = {
      part: options.part || 'snippet,replies',
      ...(options.videoId && { videoId: options.videoId }),
      ...(options.channelId && { channelId: options.channelId }),
      ...(options.id && { id: options.id }),
      maxResults: options.maxResults || 100,
      ...(options.pageToken && { pageToken: options.pageToken }),
      ...(options.order && { order: options.order }),
      ...(options.searchTerms && { searchTerms: options.searchTerms })
    };

    const response = await this.client.get('/commentThreads', { params });
    return { 
      success: true, 
      threads: response.data.items,
      nextPageToken: response.data.nextPageToken
    };
  }

  async createCommentThread(videoId, text) {
    const payload = {
      snippet: {
        videoId,
        topLevelComment: {
          snippet: {
            textOriginal: text
          }
        }
      }
    };

    const response = await this.client.post('/commentThreads', payload, {
      params: { part: 'snippet' }
    });
    return { success: true, thread: response.data };
  }

  async getComments(parentId, options = {}) {
    const params = {
      part: options.part || 'snippet',
      parentId,
      maxResults: options.maxResults || 100,
      ...(options.pageToken && { pageToken: options.pageToken })
    };

    const response = await this.client.get('/comments', { params });
    return { 
      success: true, 
      comments: response.data.items,
      nextPageToken: response.data.nextPageToken
    };
  }

  async createComment(parentId, text) {
    const payload = {
      snippet: {
        parentId,
        textOriginal: text
      }
    };

    const response = await this.client.post('/comments', payload, {
      params: { part: 'snippet' }
    });
    return { success: true, comment: response.data };
  }

  async updateComment(commentId, text) {
    const payload = {
      id: commentId,
      snippet: {
        textOriginal: text
      }
    };

    const response = await this.client.put('/comments', payload, {
      params: { part: 'snippet' }
    });
    return { success: true, comment: response.data };
  }

  async deleteComment(commentId) {
    const params = { id: commentId };
    await this.client.delete('/comments', { params });
    return { success: true, message: 'Comment deleted successfully' };
  }

  async markCommentAsSpam(commentId) {
    const params = { id: commentId };
    await this.client.post('/comments/markAsSpam', null, { params });
    return { success: true, message: 'Comment marked as spam' };
  }

  async setCommentModerationStatus(commentId, moderationStatus, banAuthor = false) {
    const params = {
      id: commentId,
      moderationStatus,
      banAuthor
    };

    await this.client.post('/comments/setModerationStatus', null, { params });
    return { success: true, message: 'Moderation status set' };
  }

  // ==================== SUBSCRIPTIONS ====================

  async listSubscriptions(options = {}) {
    const params = {
      part: options.part || 'snippet,contentDetails',
      ...(options.channelId && { channelId: options.channelId }),
      ...(options.id && { id: options.id }),
      ...(options.mine && { mine: options.mine }),
      ...(options.mySubscribers && { mySubscribers: options.mySubscribers }),
      maxResults: options.maxResults || 50,
      ...(options.pageToken && { pageToken: options.pageToken }),
      ...(options.order && { order: options.order })
    };

    const response = await this.client.get('/subscriptions', { params });
    return { 
      success: true, 
      subscriptions: response.data.items,
      nextPageToken: response.data.nextPageToken
    };
  }

  async subscribe(channelId) {
    const payload = {
      snippet: {
        resourceId: {
          kind: 'youtube#channel',
          channelId
        }
      }
    };

    const response = await this.client.post('/subscriptions', payload, {
      params: { part: 'snippet' }
    });
    return { success: true, subscription: response.data };
  }

  async unsubscribe(subscriptionId) {
    const params = { id: subscriptionId };
    await this.client.delete('/subscriptions', { params });
    return { success: true, message: 'Unsubscribed successfully' };
  }

  // ==================== CAPTIONS ====================

  async listCaptions(videoId, parts = ['snippet']) {
    const params = {
      part: parts.join(','),
      videoId
    };

    const response = await this.client.get('/captions', { params });
    return { success: true, captions: response.data.items };
  }

  async downloadCaption(captionId, options = {}) {
    const params = {
      ...(options.tfmt && { tfmt: options.tfmt }),
      ...(options.tlang && { tlang: options.tlang })
    };

    const response = await this.client.get(`/captions/${captionId}`, { params });
    return { success: true, caption: response.data };
  }

  async uploadCaption(videoId, data) {
    const payload = {
      snippet: {
        videoId,
        language: data.language,
        name: data.name,
        ...(data.isDraft !== undefined && { isDraft: data.isDraft })
      }
    };

    const response = await this.client.post('/captions', payload, {
      params: { part: 'snippet' }
    });
    return { success: true, caption: response.data };
  }

  async updateCaption(captionId, data) {
    const payload = {
      id: captionId,
      snippet: data
    };

    const response = await this.client.put('/captions', payload, {
      params: { part: 'snippet' }
    });
    return { success: true, caption: response.data };
  }

  async deleteCaption(captionId) {
    const params = { id: captionId };
    await this.client.delete('/captions', { params });
    return { success: true, message: 'Caption deleted successfully' };
  }

  // ==================== ACTIVITIES ====================

  async listActivities(options = {}) {
    const params = {
      part: options.part || 'snippet,contentDetails',
      ...(options.channelId && { channelId: options.channelId }),
      ...(options.mine && { mine: options.mine }),
      ...(options.home && { home: options.home }),
      maxResults: options.maxResults || 25,
      ...(options.pageToken && { pageToken: options.pageToken }),
      ...(options.publishedAfter && { publishedAfter: options.publishedAfter }),
      ...(options.publishedBefore && { publishedBefore: options.publishedBefore }),
      ...(options.regionCode && { regionCode: options.regionCode })
    };

    const response = await this.client.get('/activities', { params });
    return { 
      success: true, 
      activities: response.data.items,
      nextPageToken: response.data.nextPageToken
    };
  }

  // ==================== VIDEO CATEGORIES ====================

  async listVideoCategories(options = {}) {
    const params = {
      part: options.part || 'snippet',
      ...(options.id && { id: options.id }),
      ...(options.regionCode && { regionCode: options.regionCode }),
      ...(options.hl && { hl: options.hl })
    };

    const response = await this.client.get('/videoCategories', { params });
    return { success: true, categories: response.data.items };
  }

  // ==================== CHANNEL SECTIONS ====================

  async listChannelSections(options = {}) {
    const params = {
      part: options.part || 'snippet,contentDetails',
      ...(options.channelId && { channelId: options.channelId }),
      ...(options.id && { id: options.id }),
      ...(options.mine && { mine: options.mine })
    };

    const response = await this.client.get('/channelSections', { params });
    return { success: true, sections: response.data.items };
  }

  async createChannelSection(data) {
    const payload = {
      snippet: {
        type: data.type,
        ...(data.title && { title: data.title }),
        ...(data.position && { position: data.position })
      },
      ...(data.contentDetails && { contentDetails: data.contentDetails })
    };

    const response = await this.client.post('/channelSections', payload, {
      params: { part: 'snippet,contentDetails' }
    });
    return { success: true, section: response.data };
  }

  async updateChannelSection(sectionId, data) {
    const payload = {
      id: sectionId,
      ...data
    };

    const response = await this.client.put('/channelSections', payload, {
      params: { part: 'snippet,contentDetails' }
    });
    return { success: true, section: response.data };
  }

  async deleteChannelSection(sectionId) {
    const params = { id: sectionId };
    await this.client.delete('/channelSections', { params });
    return { success: true, message: 'Channel section deleted successfully' };
  }

  // ==================== I18N ====================

  async listLanguages(options = {}) {
    const params = {
      part: 'snippet',
      ...(options.hl && { hl: options.hl })
    };

    const response = await this.client.get('/i18nLanguages', { params });
    return { success: true, languages: response.data.items };
  }

  async listRegions(options = {}) {
    const params = {
      part: 'snippet',
      ...(options.hl && { hl: options.hl })
    };

    const response = await this.client.get('/i18nRegions', { params });
    return { success: true, regions: response.data.items };
  }

  // ==================== THUMBNAILS ====================

  async setThumbnail(videoId, imageData) {
    const formData = new FormData();
    formData.append('image', imageData);

    const response = await this.client.post(`/thumbnails/set`, formData, {
      params: { videoId },
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return { success: true, thumbnails: response.data.items[0].snippet.thumbnails };
  }

  // ==================== WATERMARKS ====================

  async setWatermark(channelId, imageData, options = {}) {
    const formData = new FormData();
    formData.append('image', imageData);

    const params = {
      channelId,
      ...(options.offsetMs && { offsetMs: options.offsetMs }),
      ...(options.durationMs && { durationMs: options.durationMs }),
      ...(options.position && { position: options.position })
    };

    await this.client.post('/watermarks/set', formData, {
      params,
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return { success: true, message: 'Watermark set successfully' };
  }

  async unsetWatermark(channelId) {
    const params = { channelId };
    await this.client.post('/watermarks/unset', null, { params });
    return { success: true, message: 'Watermark removed successfully' };
  }
}

module.exports = YouTubeAPI;
