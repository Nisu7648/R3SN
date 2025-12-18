/**
 * JokeAPI Free Integration
 * 100% FREE jokes API - NO API KEY REQUIRED
 */

const axios = require('axios');

class JokeAPIFreeIntegration {
  constructor(config = {}) {
    this.baseUrl = 'https://v2.jokeapi.dev/joke';
  }

  async execute(action, params) {
    const actions = {
      getRandomJoke: this.getRandomJoke.bind(this),
      getJokeByCategory: this.getJokeByCategory.bind(this),
      getMultipleJokes: this.getMultipleJokes.bind(this),
      searchJokes: this.searchJokes.bind(this),
    };

    if (!actions[action]) {
      throw new Error(`Unknown action: ${action}`);
    }

    return await actions[action](params);
  }

  async getRandomJoke(params) {
    const { type = 'any', safe = true } = params;

    try {
      const response = await axios.get(
        `${this.baseUrl}/Any`,
        {
          params: {
            type,
            safe: safe ? 'true' : 'false'
          }
        }
      );

      const joke = response.data;

      return {
        success: true,
        data: {
          id: joke.id,
          category: joke.category,
          type: joke.type,
          joke: joke.type === 'single' ? joke.joke : undefined,
          setup: joke.type === 'twopart' ? joke.setup : undefined,
          delivery: joke.type === 'twopart' ? joke.delivery : undefined,
          safe: joke.safe
        }
      };
    } catch (error) {
      throw new Error(`JokeAPI error: ${error.message}`);
    }
  }

  async getJokeByCategory(params) {
    const { category = 'Programming', safe = true } = params;

    try {
      const response = await axios.get(
        `${this.baseUrl}/${category}`,
        {
          params: {
            safe: safe ? 'true' : 'false'
          }
        }
      );

      const joke = response.data;

      return {
        success: true,
        data: {
          id: joke.id,
          category: joke.category,
          type: joke.type,
          joke: joke.type === 'single' ? joke.joke : undefined,
          setup: joke.type === 'twopart' ? joke.setup : undefined,
          delivery: joke.type === 'twopart' ? joke.delivery : undefined
        }
      };
    } catch (error) {
      throw new Error(`JokeAPI error: ${error.message}`);
    }
  }

  async getMultipleJokes(params) {
    const { amount = 5, category = 'Any', safe = true } = params;

    try {
      const response = await axios.get(
        `${this.baseUrl}/${category}`,
        {
          params: {
            amount,
            safe: safe ? 'true' : 'false'
          }
        }
      );

      return {
        success: true,
        data: {
          jokes: response.data.jokes.map(joke => ({
            id: joke.id,
            category: joke.category,
            type: joke.type,
            joke: joke.type === 'single' ? joke.joke : undefined,
            setup: joke.type === 'twopart' ? joke.setup : undefined,
            delivery: joke.type === 'twopart' ? joke.delivery : undefined
          })),
          count: response.data.amount
        }
      };
    } catch (error) {
      throw new Error(`JokeAPI error: ${error.message}`);
    }
  }

  async searchJokes(params) {
    const { query, amount = 5 } = params;
    
    if (!query) {
      throw new Error('Search query is required');
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/Any`,
        {
          params: {
            contains: query,
            amount
          }
        }
      );

      return {
        success: true,
        data: {
          jokes: response.data.jokes ? response.data.jokes.map(joke => ({
            id: joke.id,
            category: joke.category,
            joke: joke.type === 'single' ? joke.joke : `${joke.setup} - ${joke.delivery}`
          })) : [],
          count: response.data.amount || 0
        }
      };
    } catch (error) {
      throw new Error(`JokeAPI error: ${error.message}`);
    }
  }
}

module.exports = JokeAPIFreeIntegration;
