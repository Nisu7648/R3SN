const axios = require('axios');

class RapidAPIIntegration {
  constructor(apiKey) {
    this.apiKey = apiKey || 'YOUR_RAPIDAPI_KEY';
    this.baseURL = 'https://rapidapi.com/api';
  }

  // Generic API Call
  async callAPI(apiHost, endpoint, method = 'GET', params = {}, data = null) {
    try {
      const config = {
        method,
        url: `https://${apiHost}${endpoint}`,
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': apiHost
        },
        ...(method === 'GET' && { params }),
        ...(data && { data })
      };

      const response = await axios(config);

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Weather API
  async getWeather(city) {
    return this.callAPI(
      'weatherapi-com.p.rapidapi.com',
      '/current.json',
      'GET',
      { q: city }
    );
  }

  // Translation API
  async translateText(text, targetLang, sourceLang = 'auto') {
    return this.callAPI(
      'google-translate1.p.rapidapi.com',
      '/language/translate/v2',
      'POST',
      {},
      { q: text, target: targetLang, source: sourceLang }
    );
  }

  // QR Code Generator
  async generateQRCode(data, size = 200) {
    return this.callAPI(
      'qrcode-monkey.p.rapidapi.com',
      '/qr/custom',
      'POST',
      {},
      { data, size }
    );
  }

  // URL Shortener
  async shortenURL(url) {
    return this.callAPI(
      'url-shortener-service.p.rapidapi.com',
      '/shorten',
      'POST',
      {},
      { url }
    );
  }

  // Image to Text (OCR)
  async imageToText(imageUrl) {
    return this.callAPI(
      'ocr-extract-text.p.rapidapi.com',
      '/ocr',
      'POST',
      {},
      { url: imageUrl }
    );
  }

  // Spam Detection
  async detectSpam(text) {
    return this.callAPI(
      'spam-detection1.p.rapidapi.com',
      '/spam-detection',
      'POST',
      {},
      { text }
    );
  }

  // YouTube Video Info
  async getYouTubeInfo(videoId) {
    return this.callAPI(
      'youtube-v31.p.rapidapi.com',
      '/videos',
      'GET',
      { part: 'snippet,statistics', id: videoId }
    );
  }

  // COVID-19 Stats
  async getCOVIDStats(country = null) {
    const endpoint = country ? `/country/${country}` : '/all';
    return this.callAPI(
      'covid-193.p.rapidapi.com',
      endpoint,
      'GET'
    );
  }

  // Recipe Search
  async searchRecipes(query, number = 10) {
    return this.callAPI(
      'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com',
      '/recipes/complexSearch',
      'GET',
      { query, number }
    );
  }

  // Movie Database
  async searchMovies(query) {
    return this.callAPI(
      'movie-database-alternative.p.rapidapi.com',
      '/',
      'GET',
      { s: query, r: 'json' }
    );
  }

  // Cryptocurrency Prices
  async getCryptoPrice(symbol = 'BTC') {
    return this.callAPI(
      'coinranking1.p.rapidapi.com',
      '/coin/Qwsogvtv82FCd/price',
      'GET'
    );
  }

  // Text Sentiment Analysis
  async analyzeSentiment(text) {
    return this.callAPI(
      'text-sentiment.p.rapidapi.com',
      '/analyze',
      'POST',
      {},
      { text }
    );
  }

  // IP Lookup
  async lookupIP(ip) {
    return this.callAPI(
      'ip-geo-location.p.rapidapi.com',
      '/ip/check',
      'GET',
      { ip }
    );
  }

  // Random Jokes
  async getRandomJoke() {
    return this.callAPI(
      'jokes-by-api-ninjas.p.rapidapi.com',
      '/v1/jokes',
      'GET'
    );
  }

  // Stock Market Data
  async getStockQuote(symbol) {
    return this.callAPI(
      'alpha-vantage.p.rapidapi.com',
      '/query',
      'GET',
      { function: 'GLOBAL_QUOTE', symbol }
    );
  }
}

module.exports = RapidAPIIntegration;
