/**
 * YOUTUBE INTEGRATION - FULLY WORKING
 * Video platform integration
 * 
 * FREE TIER: 10,000 quota units/day
 * Get API key: https://console.cloud.google.com/apis/credentials
 * 
 * Usage:
 *   const youtube = new YouTubeIntegration({ apiKey: 'AIza...' });
 *   const videos = await youtube.searchVideos('nodejs tutorial');
 *   const channel = await youtube.getChannelInfo('UC...');
 */

const BaseIntegration = require('../core/BaseIntegration');

class YouTubeIntegration extends BaseIntegration {
  constructor(config = {}) {
    super({
      name: 'youtube',
      baseURL: 'https://www.googleapis.com/youtube/v3',
      ...config
    });
  }

  /**
   * Search videos
   */
  async searchVideos(query, maxResults = 10, order = 'relevance') {
    this.validateApiKey();
    const response = await this.get('/search', {
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults,
      order,
      key: this.apiKey
    });

    return {
      success: true,
      videos: response.data.items.map(item => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        thumbnail: item.snippet.thumbnails.high.url,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`
      }))
    };
  }

  /**
   * Get video details
   */
  async getVideoDetails(videoId) {
    this.validateApiKey();
    const response = await this.get('/videos', {
      part: 'snippet,statistics,contentDetails',
      id: videoId,
      key: this.apiKey
    });

    const video = response.data.items[0];
    return {
      success: true,
      video: {
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        channelTitle: video.snippet.channelTitle,
        publishedAt: video.snippet.publishedAt,
        duration: video.contentDetails.duration,
        views: video.statistics.viewCount,
        likes: video.statistics.likeCount,
        comments: video.statistics.commentCount,
        thumbnail: video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high.url
      }
    };
  }

  /**
   * Get channel info
   */
  async getChannelInfo(channelId) {
    this.validateApiKey();
    const response = await this.get('/channels', {
      part: 'snippet,statistics,contentDetails',
      id: channelId,
      key: this.apiKey
    });

    const channel = response.data.items[0];
    return {
      success: true,
      channel: {
        id: channel.id,
        title: channel.snippet.title,
        description: channel.snippet.description,
        customUrl: channel.snippet.customUrl,
        publishedAt: channel.snippet.publishedAt,
        thumbnail: channel.snippet.thumbnails.high.url,
        subscriberCount: channel.statistics.subscriberCount,
        videoCount: channel.statistics.videoCount,
        viewCount: channel.statistics.viewCount
      }
    };
  }

  /**
   * Get channel videos
   */
  async getChannelVideos(channelId, maxResults = 10) {
    this.validateApiKey();
    
    // First get uploads playlist ID
    const channelResponse = await this.get('/channels', {
      part: 'contentDetails',
      id: channelId,
      key: this.apiKey
    });
    
    const uploadsPlaylistId = channelResponse.data.items[0].contentDetails.relatedPlaylists.uploads;
    
    // Get videos from playlist
    const response = await this.get('/playlistItems', {
      part: 'snippet',
      playlistId: uploadsPlaylistId,
      maxResults,
      key: this.apiKey
    });

    return {
      success: true,
      videos: response.data.items.map(item => ({
        videoId: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        publishedAt: item.snippet.publishedAt,
        thumbnail: item.snippet.thumbnails.high.url,
        url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`
      }))
    };
  }

  /**
   * Get video comments
   */
  async getVideoComments(videoId, maxResults = 20) {
    this.validateApiKey();
    const response = await this.get('/commentThreads', {
      part: 'snippet',
      videoId,
      maxResults,
      order: 'relevance',
      key: this.apiKey
    });

    return {
      success: true,
      comments: response.data.items.map(item => ({
        id: item.id,
        author: item.snippet.topLevelComment.snippet.authorDisplayName,
        text: item.snippet.topLevelComment.snippet.textDisplay,
        likeCount: item.snippet.topLevelComment.snippet.likeCount,
        publishedAt: item.snippet.topLevelComment.snippet.publishedAt
      }))
    };
  }

  /**
   * Get trending videos
   */
  async getTrendingVideos(regionCode = 'US', maxResults = 10) {
    this.validateApiKey();
    const response = await this.get('/videos', {
      part: 'snippet,statistics',
      chart: 'mostPopular',
      regionCode,
      maxResults,
      key: this.apiKey
    });

    return {
      success: true,
      videos: response.data.items.map(video => ({
        videoId: video.id,
        title: video.snippet.title,
        channelTitle: video.snippet.channelTitle,
        views: video.statistics.viewCount,
        likes: video.statistics.likeCount,
        thumbnail: video.snippet.thumbnails.high.url,
        url: `https://www.youtube.com/watch?v=${video.id}`
      }))
    };
  }

  /**
   * Search channels
   */
  async searchChannels(query, maxResults = 10) {
    this.validateApiKey();
    const response = await this.get('/search', {
      part: 'snippet',
      q: query,
      type: 'channel',
      maxResults,
      key: this.apiKey
    });

    return {
      success: true,
      channels: response.data.items.map(item => ({
        channelId: item.id.channelId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high.url
      }))
    };
  }

  async testConnection() {
    try {
      await this.searchVideos('test', 1);
      return { success: true, integration: this.name, message: 'Connection successful' };
    } catch (error) {
      return { success: false, integration: this.name, error: error.message };
    }
  }
}

module.exports = YouTubeIntegration;
