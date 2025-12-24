/**
 * JOKEAPI INTEGRATION - FULLY WORKING
 * Jokes and humor integration
 * 
 * 100% FREE - NO API KEY REQUIRED!
 * API: https://jokeapi.dev/
 * 
 * Usage:
 *   const jokes = new JokeAPIIntegration();
 *   const joke = await jokes.getRandomJoke();
 *   const programming = await jokes.getJokeByCategory('Programming');
 */

const BaseIntegration = require('../core/BaseIntegration');

class JokeAPIIntegration extends BaseIntegration {
  constructor(config = {}) {
    super({
      name: 'jokeapi',
      baseURL: 'https://v2.jokeapi.dev',
      ...config
    });
  }

  /**
   * Get random joke
   */
  async getRandomJoke(blacklistFlags = []) {
    const params = {};
    if (blacklistFlags.length > 0) {
      params.blacklistFlags = blacklistFlags.join(',');
    }

    const response = await this.get('/joke/Any', params);

    return {
      success: !response.data.error,
      joke: this.formatJoke(response.data)
    };
  }

  /**
   * Get joke by category
   */
  async getJokeByCategory(category, blacklistFlags = []) {
    const params = {};
    if (blacklistFlags.length > 0) {
      params.blacklistFlags = blacklistFlags.join(',');
    }

    const response = await this.get(`/joke/${category}`, params);

    return {
      success: !response.data.error,
      joke: this.formatJoke(response.data)
    };
  }

  /**
   * Get multiple jokes
   */
  async getMultipleJokes(amount = 5, category = 'Any', blacklistFlags = []) {
    const params = { amount };
    if (blacklistFlags.length > 0) {
      params.blacklistFlags = blacklistFlags.join(',');
    }

    const response = await this.get(`/joke/${category}`, params);

    return {
      success: !response.data.error,
      jokes: response.data.jokes.map(joke => this.formatJoke(joke))
    };
  }

  /**
   * Search jokes
   */
  async searchJokes(query, amount = 10) {
    const response = await this.get('/joke/Any', {
      contains: query,
      amount
    });

    if (response.data.jokes) {
      return {
        success: true,
        jokes: response.data.jokes.map(joke => this.formatJoke(joke))
      };
    }

    return {
      success: !response.data.error,
      joke: this.formatJoke(response.data)
    };
  }

  /**
   * Get joke by type
   */
  async getJokeByType(type, category = 'Any') {
    const response = await this.get(`/joke/${category}`, { type });

    return {
      success: !response.data.error,
      joke: this.formatJoke(response.data)
    };
  }

  /**
   * Get programming jokes
   */
  async getProgrammingJoke() {
    return this.getJokeByCategory('Programming');
  }

  /**
   * Get dark jokes
   */
  async getDarkJoke() {
    return this.getJokeByCategory('Dark');
  }

  /**
   * Get pun jokes
   */
  async getPunJoke() {
    return this.getJokeByCategory('Pun');
  }

  /**
   * Get miscellaneous jokes
   */
  async getMiscJoke() {
    return this.getJokeByCategory('Misc');
  }

  /**
   * Get safe jokes only
   */
  async getSafeJoke(category = 'Any') {
    return this.getJokeByCategory(category, ['nsfw', 'religious', 'political', 'racist', 'sexist', 'explicit']);
  }

  /**
   * Format joke response
   */
  formatJoke(data) {
    if (data.type === 'single') {
      return {
        id: data.id,
        type: data.type,
        category: data.category,
        joke: data.joke,
        flags: data.flags,
        safe: data.safe,
        lang: data.lang
      };
    } else {
      return {
        id: data.id,
        type: data.type,
        category: data.category,
        setup: data.setup,
        delivery: data.delivery,
        flags: data.flags,
        safe: data.safe,
        lang: data.lang
      };
    }
  }

  async testConnection() {
    try {
      await this.getRandomJoke();
      return { success: true, integration: this.name, message: 'Connection successful' };
    } catch (error) {
      return { success: false, integration: this.name, error: error.message };
    }
  }

  /**
   * Override validateApiKey since no key is needed
   */
  validateApiKey() {
    return true;
  }
}

module.exports = JokeAPIIntegration;
