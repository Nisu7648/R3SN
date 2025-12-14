/**
 * Twitter/X Node - Real Twitter API Integration
 * Post tweets, read timeline, search, manage account
 */

const axios = require('axios');

class TwitterNode {
  constructor() {
    this.type = 'twitter.action';
    this.name = 'Twitter/X';
    this.description = 'Post tweets, search, read timeline using Twitter API v2';
    this.category = 'social';
    this.icon = '🐦';
    this.color = '#1DA1F2';

    this.parameters = [
      {
        name: 'bearerToken',
        type: 'string',
        required: true,
        sensitive: true,
        description: 'Twitter API Bearer Token'
      },
      {
        name: 'action',
        type: 'select',
        required: true,
        options: ['post_tweet', 'search_tweets', 'get_user', 'get_timeline', 'delete_tweet'],
        description: 'Action to perform'
      },
      {
        name: 'text',
        type: 'code',
        required: false,
        description: 'Tweet text (for post_tweet)'
      },
      {
        name: 'query',
        type: 'string',
        required: false,
        description: 'Search query (for search_tweets)'
      },
      {
        name: 'username',
        type: 'string',
        required: false,
        description: 'Username (for get_user)'
      },
      {
        name: 'tweetId',
        type: 'string',
        required: false,
        description: 'Tweet ID (for delete_tweet)'
      },
      {
        name: 'maxResults',
        type: 'number',
        default: 10,
        description: 'Max results to return'
      }
    ];
  }

  async execute(inputs, parameters, context) {
    const { bearerToken, action, text, query, username, tweetId, maxResults } = parameters;

    if (!bearerToken) {
      throw new Error('Twitter Bearer Token is required');
    }

    const headers = {
      'Authorization': `Bearer ${bearerToken}`,
      'Content-Type': 'application/json'
    };

    try {
      switch (action) {
        case 'post_tweet':
          return await this.postTweet(headers, text);
        
        case 'search_tweets':
          return await this.searchTweets(headers, query, maxResults);
        
        case 'get_user':
          return await this.getUser(headers, username);
        
        case 'get_timeline':
          return await this.getTimeline(headers, maxResults);
        
        case 'delete_tweet':
          return await this.deleteTweet(headers, tweetId);
        
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      throw new Error(`Twitter API error: ${error.message}`);
    }
  }

  async postTweet(headers, text) {
    if (!text) throw new Error('Tweet text is required');
    
    const response = await axios.post(
      'https://api.twitter.com/2/tweets',
      { text },
      { headers }
    );
    
    return {
      success: true,
      tweetId: response.data.data.id,
      text: response.data.data.text
    };
  }

  async searchTweets(headers, query, maxResults = 10) {
    if (!query) throw new Error('Search query is required');
    
    const response = await axios.get(
      'https://api.twitter.com/2/tweets/search/recent',
      {
        headers,
        params: {
          query,
          max_results: maxResults,
          'tweet.fields': 'created_at,author_id,public_metrics'
        }
      }
    );
    
    return {
      success: true,
      tweets: response.data.data || [],
      meta: response.data.meta
    };
  }

  async getUser(headers, username) {
    if (!username) throw new Error('Username is required');
    
    const response = await axios.get(
      `https://api.twitter.com/2/users/by/username/${username}`,
      {
        headers,
        params: {
          'user.fields': 'created_at,description,public_metrics,verified'
        }
      }
    );
    
    return {
      success: true,
      user: response.data.data
    };
  }

  async getTimeline(headers, maxResults = 10) {
    const response = await axios.get(
      'https://api.twitter.com/2/users/me/timelines/reverse_chronological',
      {
        headers,
        params: {
          max_results: maxResults,
          'tweet.fields': 'created_at,author_id,public_metrics'
        }
      }
    );
    
    return {
      success: true,
      tweets: response.data.data || [],
      meta: response.data.meta
    };
  }

  async deleteTweet(headers, tweetId) {
    if (!tweetId) throw new Error('Tweet ID is required');
    
    await axios.delete(
      `https://api.twitter.com/2/tweets/${tweetId}`,
      { headers }
    );
    
    return {
      success: true,
      deleted: true,
      tweetId
    };
  }
}

module.exports = TwitterNode;
