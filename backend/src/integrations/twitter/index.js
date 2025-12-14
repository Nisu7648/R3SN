/**
 * Twitter/X Integration
 * Real Twitter API v2 implementation
 */

const axios = require('axios');

class TwitterIntegration {
  constructor(config) {
    this.config = config;
    this.validateConfig();
    this.baseUrl = 'https://api.twitter.com/2';
  }

  validateConfig() {
    if (!this.config.bearerToken) {
      throw new Error('Twitter Bearer Token is required');
    }
  }

  getHeaders() {
    return {
      'Authorization': `Bearer ${this.config.bearerToken}`,
      'Content-Type': 'application/json'
    };
  }

  async execute(action, params) {
    const actions = {
      postTweet: this.postTweet.bind(this),
      searchTweets: this.searchTweets.bind(this),
      getUser: this.getUser.bind(this),
      getTimeline: this.getTimeline.bind(this),
      deleteTweet: this.deleteTweet.bind(this),
      likeTweet: this.likeTweet.bind(this),
      retweet: this.retweet.bind(this),
      getFollowers: this.getFollowers.bind(this),
      getFollowing: this.getFollowing.bind(this),
    };

    if (!actions[action]) {
      throw new Error(`Unknown action: ${action}`);
    }

    return await actions[action](params);
  }

  async postTweet(params) {
    const { text, replyTo } = params;
    
    if (!text) {
      throw new Error('Tweet text is required');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/tweets`,
        {
          text,
          ...(replyTo && { reply: { in_reply_to_tweet_id: replyTo } })
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          id: response.data.data.id,
          text: response.data.data.text
        }
      };
    } catch (error) {
      throw new Error(`Twitter API error: ${error.response?.data?.detail || error.message}`);
    }
  }

  async searchTweets(params) {
    const { query, maxResults = 10 } = params;
    
    if (!query) {
      throw new Error('Search query is required');
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/tweets/search/recent`,
        {
          headers: this.getHeaders(),
          params: {
            query,
            max_results: maxResults,
            'tweet.fields': 'created_at,author_id,public_metrics,entities'
          }
        }
      );

      return {
        success: true,
        data: response.data.data || [],
        meta: response.data.meta
      };
    } catch (error) {
      throw new Error(`Twitter API error: ${error.response?.data?.detail || error.message}`);
    }
  }

  async getUser(params) {
    const { username } = params;
    
    if (!username) {
      throw new Error('Username is required');
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/users/by/username/${username}`,
        {
          headers: this.getHeaders(),
          params: {
            'user.fields': 'created_at,description,public_metrics,verified,profile_image_url'
          }
        }
      );

      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      throw new Error(`Twitter API error: ${error.response?.data?.detail || error.message}`);
    }
  }

  async getTimeline(params) {
    const { userId, maxResults = 10 } = params;
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/users/${userId}/tweets`,
        {
          headers: this.getHeaders(),
          params: {
            max_results: maxResults,
            'tweet.fields': 'created_at,public_metrics'
          }
        }
      );

      return {
        success: true,
        data: response.data.data || [],
        meta: response.data.meta
      };
    } catch (error) {
      throw new Error(`Twitter API error: ${error.response?.data?.detail || error.message}`);
    }
  }

  async deleteTweet(params) {
    const { tweetId } = params;
    
    if (!tweetId) {
      throw new Error('Tweet ID is required');
    }

    try {
      await axios.delete(
        `${this.baseUrl}/tweets/${tweetId}`,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: { deleted: true, tweetId }
      };
    } catch (error) {
      throw new Error(`Twitter API error: ${error.response?.data?.detail || error.message}`);
    }
  }

  async likeTweet(params) {
    const { userId, tweetId } = params;
    
    if (!userId || !tweetId) {
      throw new Error('User ID and Tweet ID are required');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/users/${userId}/likes`,
        { tweet_id: tweetId },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      throw new Error(`Twitter API error: ${error.response?.data?.detail || error.message}`);
    }
  }

  async retweet(params) {
    const { userId, tweetId } = params;
    
    if (!userId || !tweetId) {
      throw new Error('User ID and Tweet ID are required');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/users/${userId}/retweets`,
        { tweet_id: tweetId },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      throw new Error(`Twitter API error: ${error.response?.data?.detail || error.message}`);
    }
  }

  async getFollowers(params) {
    const { userId, maxResults = 100 } = params;
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/users/${userId}/followers`,
        {
          headers: this.getHeaders(),
          params: {
            max_results: maxResults,
            'user.fields': 'username,name,public_metrics'
          }
        }
      );

      return {
        success: true,
        data: response.data.data || [],
        meta: response.data.meta
      };
    } catch (error) {
      throw new Error(`Twitter API error: ${error.response?.data?.detail || error.message}`);
    }
  }

  async getFollowing(params) {
    const { userId, maxResults = 100 } = params;
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/users/${userId}/following`,
        {
          headers: this.getHeaders(),
          params: {
            max_results: maxResults,
            'user.fields': 'username,name,public_metrics'
          }
        }
      );

      return {
        success: true,
        data: response.data.data || [],
        meta: response.data.meta
      };
    } catch (error) {
      throw new Error(`Twitter API error: ${error.response?.data?.detail || error.message}`);
    }
  }
}

module.exports = TwitterIntegration;
