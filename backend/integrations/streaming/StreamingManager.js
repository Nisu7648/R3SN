const axios = require('axios');

/**
 * Unified Streaming Manager
 * Manages all 10 streaming platforms:
 * Netflix, Prime Video, Disney+, HBO Max, Hulu, Apple TV+, Paramount+, Peacock, Discovery+, YouTube Premium
 */
class StreamingManager {
  constructor(config = {}) {
    this.platforms = {
      netflix: {
        name: 'Netflix',
        baseURL: 'https://unogsng.p.rapidapi.com',
        enabled: true
      },
      prime: {
        name: 'Amazon Prime Video',
        baseURL: 'https://streaming-availability.p.rapidapi.com',
        enabled: true
      },
      disney: {
        name: 'Disney+',
        baseURL: 'https://streaming-availability.p.rapidapi.com',
        enabled: true
      },
      hbo: {
        name: 'HBO Max',
        baseURL: 'https://streaming-availability.p.rapidapi.com',
        enabled: true
      },
      hulu: {
        name: 'Hulu',
        baseURL: 'https://streaming-availability.p.rapidapi.com',
        enabled: true
      },
      appletv: {
        name: 'Apple TV+',
        baseURL: 'https://streaming-availability.p.rapidapi.com',
        enabled: true
      },
      paramount: {
        name: 'Paramount+',
        baseURL: 'https://streaming-availability.p.rapidapi.com',
        enabled: true
      },
      peacock: {
        name: 'Peacock',
        baseURL: 'https://streaming-availability.p.rapidapi.com',
        enabled: true
      },
      discovery: {
        name: 'Discovery+',
        baseURL: 'https://streaming-availability.p.rapidapi.com',
        enabled: true
      },
      youtube: {
        name: 'YouTube Premium',
        baseURL: 'https://www.googleapis.com/youtube/v3',
        enabled: true
      }
    };

    this.rapidAPIKey = config.rapidAPIKey || process.env.RAPIDAPI_KEY;
    this.youtubeAPIKey = config.youtubeAPIKey || process.env.YOUTUBE_API_KEY;
  }

  /**
   * Search across all platforms
   */
  async searchAll(query, type = 'all') {
    const results = {};

    for (const [key, platform] of Object.entries(this.platforms)) {
      if (!platform.enabled) continue;

      try {
        results[key] = await this.searchPlatform(key, query, type);
      } catch (error) {
        results[key] = {
          success: false,
          platform: platform.name,
          error: error.message
        };
      }
    }

    return {
      success: true,
      query,
      type,
      platforms: results,
      totalResults: Object.values(results).reduce((sum, r) => 
        sum + (r.results?.length || 0), 0
      )
    };
  }

  /**
   * Search specific platform
   */
  async searchPlatform(platformKey, query, type = 'all') {
    const platform = this.platforms[platformKey];
    if (!platform) {
      throw new Error(`Platform ${platformKey} not found`);
    }

    if (platformKey === 'youtube') {
      return this.searchYouTube(query);
    }

    try {
      const response = await axios.get(`${platform.baseURL}/search/title`, {
        params: {
          title: query,
          country: 'us',
          show_type: type === 'all' ? 'all' : type,
          output_language: 'en'
        },
        headers: {
          'X-RapidAPI-Key': this.rapidAPIKey,
          'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
        }
      });

      return {
        success: true,
        platform: platform.name,
        query,
        results: response.data.result || []
      };
    } catch (error) {
      return {
        success: false,
        platform: platform.name,
        error: error.message
      };
    }
  }

  /**
   * Get content availability across platforms
   */
  async getAvailability(title, country = 'us') {
    try {
      const response = await axios.get('https://streaming-availability.p.rapidapi.com/search/title', {
        params: {
          title,
          country,
          output_language: 'en'
        },
        headers: {
          'X-RapidAPI-Key': this.rapidAPIKey,
          'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
        }
      });

      const content = response.data.result[0];
      if (!content) {
        return {
          success: false,
          message: 'Content not found'
        };
      }

      return {
        success: true,
        title: content.title,
        year: content.year,
        type: content.type,
        availability: content.streamingInfo || {},
        platforms: Object.keys(content.streamingInfo || {})
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get trending content across platforms
   */
  async getTrending(platformKey = 'all', country = 'us') {
    if (platformKey === 'all') {
      const results = {};
      for (const key of Object.keys(this.platforms)) {
        results[key] = await this.getTrendingForPlatform(key, country);
      }
      return {
        success: true,
        country,
        platforms: results
      };
    }

    return this.getTrendingForPlatform(platformKey, country);
  }

  /**
   * Get trending for specific platform
   */
  async getTrendingForPlatform(platformKey, country = 'us') {
    const platform = this.platforms[platformKey];
    if (!platform) {
      throw new Error(`Platform ${platformKey} not found`);
    }

    if (platformKey === 'youtube') {
      return this.getYouTubeTrending();
    }

    try {
      const response = await axios.get('https://streaming-availability.p.rapidapi.com/changes', {
        params: {
          change_type: 'new',
          country,
          item_type: 'show',
          catalogs: platformKey,
          output_language: 'en'
        },
        headers: {
          'X-RapidAPI-Key': this.rapidAPIKey,
          'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
        }
      });

      return {
        success: true,
        platform: platform.name,
        country,
        trending: response.data.changes || []
      };
    } catch (error) {
      return {
        success: false,
        platform: platform.name,
        error: error.message
      };
    }
  }

  /**
   * Get new releases across platforms
   */
  async getNewReleases(platformKey = 'all', country = 'us', days = 7) {
    if (platformKey === 'all') {
      const results = {};
      for (const key of Object.keys(this.platforms)) {
        results[key] = await this.getNewReleasesForPlatform(key, country, days);
      }
      return {
        success: true,
        country,
        days,
        platforms: results
      };
    }

    return this.getNewReleasesForPlatform(platformKey, country, days);
  }

  /**
   * Get new releases for specific platform
   */
  async getNewReleasesForPlatform(platformKey, country = 'us', days = 7) {
    const platform = this.platforms[platformKey];
    if (!platform) {
      throw new Error(`Platform ${platformKey} not found`);
    }

    try {
      const response = await axios.get('https://streaming-availability.p.rapidapi.com/changes', {
        params: {
          change_type: 'new',
          country,
          catalogs: platformKey,
          output_language: 'en'
        },
        headers: {
          'X-RapidAPI-Key': this.rapidAPIKey,
          'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
        }
      });

      return {
        success: true,
        platform: platform.name,
        country,
        days,
        newReleases: response.data.changes || []
      };
    } catch (error) {
      return {
        success: false,
        platform: platform.name,
        error: error.message
      };
    }
  }

  /**
   * Get content by genre
   */
  async getByGenre(genre, platformKey = 'all', country = 'us') {
    try {
      const response = await axios.get('https://streaming-availability.p.rapidapi.com/search/filters', {
        params: {
          country,
          genres: genre,
          catalogs: platformKey === 'all' ? undefined : platformKey,
          output_language: 'en'
        },
        headers: {
          'X-RapidAPI-Key': this.rapidAPIKey,
          'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
        }
      });

      return {
        success: true,
        genre,
        platform: platformKey === 'all' ? 'All Platforms' : this.platforms[platformKey]?.name,
        country,
        content: response.data.result || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * YouTube specific search
   */
  async searchYouTube(query, maxResults = 20) {
    try {
      const response = await axios.get(`${this.platforms.youtube.baseURL}/search`, {
        params: {
          part: 'snippet',
          q: query,
          maxResults,
          type: 'video',
          key: this.youtubeAPIKey
        }
      });

      return {
        success: true,
        platform: 'YouTube Premium',
        query,
        results: response.data.items.map(item => ({
          id: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.high.url,
          channelTitle: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt
        }))
      };
    } catch (error) {
      return {
        success: false,
        platform: 'YouTube Premium',
        error: error.message
      };
    }
  }

  /**
   * Get YouTube trending
   */
  async getYouTubeTrending(regionCode = 'US', maxResults = 20) {
    try {
      const response = await axios.get(`${this.platforms.youtube.baseURL}/videos`, {
        params: {
          part: 'snippet,statistics',
          chart: 'mostPopular',
          regionCode,
          maxResults,
          key: this.youtubeAPIKey
        }
      });

      return {
        success: true,
        platform: 'YouTube Premium',
        regionCode,
        trending: response.data.items.map(item => ({
          id: item.id,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.high.url,
          channelTitle: item.snippet.channelTitle,
          viewCount: item.statistics.viewCount,
          likeCount: item.statistics.likeCount
        }))
      };
    } catch (error) {
      return {
        success: false,
        platform: 'YouTube Premium',
        error: error.message
      };
    }
  }

  /**
   * Compare prices across platforms
   */
  async comparePrices(title, country = 'us') {
    try {
      const availability = await this.getAvailability(title, country);
      
      if (!availability.success) {
        return availability;
      }

      const prices = {};
      for (const [platform, info] of Object.entries(availability.availability)) {
        prices[platform] = {
          platform: this.platforms[platform]?.name || platform,
          subscription: info.subscription || null,
          rent: info.rent || null,
          buy: info.buy || null
        };
      }

      return {
        success: true,
        title,
        country,
        prices
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get platform statistics
   */
  getPlatformStats() {
    return {
      success: true,
      totalPlatforms: Object.keys(this.platforms).length,
      enabledPlatforms: Object.values(this.platforms).filter(p => p.enabled).length,
      platforms: Object.entries(this.platforms).map(([key, platform]) => ({
        key,
        name: platform.name,
        enabled: platform.enabled
      }))
    };
  }

  /**
   * Enable/disable platform
   */
  togglePlatform(platformKey, enabled) {
    if (!this.platforms[platformKey]) {
      return {
        success: false,
        error: `Platform ${platformKey} not found`
      };
    }

    this.platforms[platformKey].enabled = enabled;

    return {
      success: true,
      platform: this.platforms[platformKey].name,
      enabled
    };
  }
}

module.exports = StreamingManager;
