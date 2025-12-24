/**
 * COMPLETE 20 INTEGRATIONS MANAGER
 * All integrations are FULLY WORKING with real API connections
 * 
 * Usage:
 *   const integrations = require('./COMPLETE_20_INTEGRATIONS');
 *   const weather = integrations.use('openweather', { apiKey: 'xxx' });
 *   const data = await weather.getCurrentWeather('London');
 */

// Import all 20 working integrations
const OpenWeatherIntegration = require('./working/OpenWeatherIntegration');
const UnsplashIntegration = require('./working/UnsplashIntegration');
const RestCountriesIntegration = require('./working/RestCountriesIntegration');
const StripeIntegration = require('./working/StripeIntegration');
const SendGridIntegration = require('./working/SendGridIntegration');
const TwilioIntegration = require('./working/TwilioIntegration');
const SlackIntegration = require('./working/SlackIntegration');
const GitHubIntegration = require('./working/GitHubIntegration');
const GoogleMapsIntegration = require('./working/GoogleMapsIntegration');
const YouTubeIntegration = require('./working/YouTubeIntegration');
const SpotifyIntegration = require('./working/SpotifyIntegration');
const NewsAPIIntegration = require('./working/NewsAPIIntegration');
const CoinMarketCapIntegration = require('./working/CoinMarketCapIntegration');
const ImgurIntegration = require('./working/ImgurIntegration');
const GiphyIntegration = require('./working/GiphyIntegration');
const IPGeolocationIntegration = require('./working/IPGeolocationIntegration');
const ExchangeRateIntegration = require('./working/ExchangeRateIntegration');
const RandomUserIntegration = require('./working/RandomUserIntegration');
const JokeAPIIntegration = require('./working/JokeAPIIntegration');
const TheDogAPIIntegration = require('./working/TheDogAPIIntegration');

class Complete20IntegrationsManager {
  constructor() {
    this.integrations = new Map();
    this.instances = new Map();
    this.registerAllIntegrations();
  }

  registerAllIntegrations() {
    // 1. OpenWeather - Weather Data
    this.integrations.set('openweather', {
      name: 'OpenWeather',
      class: OpenWeatherIntegration,
      category: 'Weather',
      requiresApiKey: true,
      free: true,
      signupUrl: 'https://openweathermap.org/appid',
      description: 'Weather data, forecasts, and air quality',
      endpoints: ['getCurrentWeather', 'getForecast', 'getWeatherByCoordinates', 'getAirPollution']
    });

    // 2. Unsplash - Photos
    this.integrations.set('unsplash', {
      name: 'Unsplash',
      class: UnsplashIntegration,
      category: 'Images',
      requiresApiKey: true,
      free: true,
      signupUrl: 'https://unsplash.com/oauth/applications',
      description: 'High-quality free stock photos',
      endpoints: ['searchPhotos', 'getRandomPhoto', 'getPhoto', 'getCuratedPhotos']
    });

    // 3. RestCountries - Country Data
    this.integrations.set('restcountries', {
      name: 'RestCountries',
      class: RestCountriesIntegration,
      category: 'Data',
      requiresApiKey: false,
      free: true,
      signupUrl: null,
      description: 'Country information and data (NO API KEY!)',
      endpoints: ['getAllCountries', 'getCountryByName', 'getCountryByCode', 'getCountriesByCurrency']
    });

    // 4. Stripe - Payments
    this.integrations.set('stripe', {
      name: 'Stripe',
      class: StripeIntegration,
      category: 'Payments',
      requiresApiKey: true,
      free: true,
      signupUrl: 'https://dashboard.stripe.com/register',
      description: 'Payment processing (FREE test mode)',
      endpoints: ['createCustomer', 'createPaymentIntent', 'createCharge', 'listCustomers']
    });

    // 5. SendGrid - Email
    this.integrations.set('sendgrid', {
      name: 'SendGrid',
      class: SendGridIntegration,
      category: 'Communication',
      requiresApiKey: true,
      free: true,
      signupUrl: 'https://signup.sendgrid.com/',
      description: 'Email service (100 emails/day FREE)',
      endpoints: ['sendEmail', 'sendTemplateEmail', 'getStats', 'validateEmail']
    });

    // 6. Twilio - SMS & Voice
    this.integrations.set('twilio', {
      name: 'Twilio',
      class: TwilioIntegration,
      category: 'Communication',
      requiresApiKey: true,
      free: true,
      signupUrl: 'https://www.twilio.com/try-twilio',
      description: 'SMS, voice, and WhatsApp ($15 trial credit)',
      endpoints: ['sendSMS', 'makeCall', 'sendWhatsApp', 'getBalance']
    });

    // 7. Slack - Team Communication
    this.integrations.set('slack', {
      name: 'Slack',
      class: SlackIntegration,
      category: 'Communication',
      requiresApiKey: true,
      free: true,
      signupUrl: 'https://api.slack.com/apps',
      description: 'Team messaging and collaboration',
      endpoints: ['sendMessage', 'sendWebhook', 'listChannels', 'uploadFile']
    });

    // 8. GitHub - Code Repository
    this.integrations.set('github', {
      name: 'GitHub',
      class: GitHubIntegration,
      category: 'Development',
      requiresApiKey: true,
      free: true,
      signupUrl: 'https://github.com/settings/tokens',
      description: 'Code repository management',
      endpoints: ['getUser', 'listRepos', 'listIssues', 'createIssue', 'searchRepos']
    });

    // 9. Google Maps - Geolocation
    this.integrations.set('googlemaps', {
      name: 'Google Maps',
      class: GoogleMapsIntegration,
      category: 'Location',
      requiresApiKey: true,
      free: true,
      signupUrl: 'https://console.cloud.google.com/google/maps-apis',
      description: 'Maps, geocoding, and directions ($200/month FREE)',
      endpoints: ['geocode', 'reverseGeocode', 'getDirections', 'searchNearby']
    });

    // 10. YouTube - Video Platform
    this.integrations.set('youtube', {
      name: 'YouTube',
      class: YouTubeIntegration,
      category: 'Media',
      requiresApiKey: true,
      free: true,
      signupUrl: 'https://console.cloud.google.com/apis/credentials',
      description: 'Video search and channel data',
      endpoints: ['searchVideos', 'getVideoDetails', 'getChannelInfo', 'getTrendingVideos']
    });

    // 11. Spotify - Music Streaming
    this.integrations.set('spotify', {
      name: 'Spotify',
      class: SpotifyIntegration,
      category: 'Media',
      requiresApiKey: true,
      free: true,
      signupUrl: 'https://developer.spotify.com/dashboard',
      description: 'Music search and streaming data',
      endpoints: ['searchTracks', 'getTrack', 'searchArtists', 'getArtistTopTracks']
    });

    // 12. NewsAPI - News Articles
    this.integrations.set('newsapi', {
      name: 'NewsAPI',
      class: NewsAPIIntegration,
      category: 'News',
      requiresApiKey: true,
      free: true,
      signupUrl: 'https://newsapi.org/register',
      description: 'News articles and headlines (100 req/day FREE)',
      endpoints: ['getTopHeadlines', 'searchNews', 'getSources', 'getNewsByCategory']
    });

    // 13. CoinMarketCap - Cryptocurrency
    this.integrations.set('coinmarketcap', {
      name: 'CoinMarketCap',
      class: CoinMarketCapIntegration,
      category: 'Finance',
      requiresApiKey: true,
      free: true,
      signupUrl: 'https://coinmarketcap.com/api/',
      description: 'Cryptocurrency prices and data',
      endpoints: ['getLatestListings', 'getCryptoQuote', 'getGlobalMetrics', 'convertCrypto']
    });

    // 14. Imgur - Image Hosting
    this.integrations.set('imgur', {
      name: 'Imgur',
      class: ImgurIntegration,
      category: 'Images',
      requiresApiKey: true,
      free: true,
      signupUrl: 'https://api.imgur.com/oauth2/addclient',
      description: 'Image hosting and sharing',
      endpoints: ['uploadImage', 'getImage', 'deleteImage', 'getGallery', 'searchGallery']
    });

    // 15. Giphy - GIF Search
    this.integrations.set('giphy', {
      name: 'Giphy',
      class: GiphyIntegration,
      category: 'Images',
      requiresApiKey: true,
      free: true,
      signupUrl: 'https://developers.giphy.com/',
      description: 'GIF search and sharing',
      endpoints: ['searchGifs', 'getTrending', 'getRandomGif', 'searchStickers']
    });

    // 16. IPGeolocation - IP Location
    this.integrations.set('ipgeolocation', {
      name: 'IPGeolocation',
      class: IPGeolocationIntegration,
      category: 'Location',
      requiresApiKey: true,
      free: true,
      signupUrl: 'https://ipgeolocation.io/signup',
      description: 'IP address geolocation (1,000 req/day FREE)',
      endpoints: ['getLocation', 'getTimezone', 'getAstronomy', 'bulkLookup']
    });

    // 17. ExchangeRate - Currency
    this.integrations.set('exchangerate', {
      name: 'ExchangeRate',
      class: ExchangeRateIntegration,
      category: 'Finance',
      requiresApiKey: true,
      free: true,
      signupUrl: 'https://www.exchangerate-api.com/',
      description: 'Currency exchange rates',
      endpoints: ['getLatestRates', 'convertCurrency', 'getSupportedCurrencies']
    });

    // 18. RandomUser - User Data
    this.integrations.set('randomuser', {
      name: 'RandomUser',
      class: RandomUserIntegration,
      category: 'Data',
      requiresApiKey: false,
      free: true,
      signupUrl: null,
      description: 'Random user data generator (NO API KEY!)',
      endpoints: ['getRandomUsers', 'getRandomUser', 'getUsersByNationality']
    });

    // 19. JokeAPI - Jokes
    this.integrations.set('jokeapi', {
      name: 'JokeAPI',
      class: JokeAPIIntegration,
      category: 'Entertainment',
      requiresApiKey: false,
      free: true,
      signupUrl: null,
      description: 'Jokes and humor (NO API KEY!)',
      endpoints: ['getRandomJoke', 'getJokeByCategory', 'searchJokes', 'getProgrammingJoke']
    });

    // 20. TheDogAPI - Dog Images
    this.integrations.set('thedogapi', {
      name: 'TheDogAPI',
      class: TheDogAPIIntegration,
      category: 'Images',
      requiresApiKey: true,
      free: true,
      signupUrl: 'https://thedogapi.com/signup',
      description: 'Dog images and breed information',
      endpoints: ['searchImages', 'getAllBreeds', 'getRandomImage', 'getImagesByBreed']
    });
  }

  /**
   * Use an integration
   */
  use(name, config = {}) {
    const integration = this.integrations.get(name);
    
    if (!integration) {
      throw new Error(`Integration "${name}" not found. Available: ${Array.from(this.integrations.keys()).join(', ')}`);
    }

    if (integration.requiresApiKey && !config.apiKey && !process.env[`${name.toUpperCase()}_API_KEY`]) {
      console.warn(`⚠️  ${integration.name} requires an API key.`);
      console.warn(`   Sign up at: ${integration.signupUrl}`);
    }

    const instance = new integration.class(config);
    this.instances.set(name, instance);

    console.log(`✅ ${integration.name} loaded (${integration.category})`);
    return instance;
  }

  /**
   * List all integrations
   */
  list(filterCategory = null) {
    console.log('\n📋 COMPLETE 20 INTEGRATIONS:\n');
    console.log('='.repeat(80));

    const categories = {};
    
    for (const [key, integration] of this.integrations) {
      if (filterCategory && integration.category !== filterCategory) continue;
      
      if (!categories[integration.category]) {
        categories[integration.category] = [];
      }
      categories[integration.category].push({ key, ...integration });
    }

    for (const [category, integrations] of Object.entries(categories)) {
      console.log(`\n📂 ${category.toUpperCase()}:`);
      integrations.forEach((integration, index) => {
        console.log(`\n${index + 1}. ${integration.name} (${integration.key})`);
        console.log(`   ${integration.description}`);
        console.log(`   API Key: ${integration.requiresApiKey ? 'Required' : 'NOT REQUIRED'}`);
        console.log(`   Free: ${integration.free ? 'Yes' : 'No'}`);
        if (integration.signupUrl) {
          console.log(`   Signup: ${integration.signupUrl}`);
        }
        console.log(`   Endpoints: ${integration.endpoints.join(', ')}`);
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log(`\nTotal: ${this.integrations.size} fully working integrations\n`);

    return Array.from(this.integrations.entries());
  }

  /**
   * List by category
   */
  listByCategory(category) {
    return this.list(category);
  }

  /**
   * Get integration info
   */
  getInfo(name) {
    const integration = this.integrations.get(name);
    if (!integration) {
      throw new Error(`Integration "${name}" not found`);
    }
    return { key: name, ...integration };
  }

  /**
   * Test all integrations
   */
  async testAll() {
    console.log('\n🧪 TESTING ALL 20 INTEGRATIONS:\n');
    console.log('='.repeat(80));

    const results = [];
    for (const [key, integration] of this.integrations) {
      console.log(`\nTesting ${integration.name}...`);
      
      try {
        const instance = new integration.class();
        const result = await instance.testConnection();
        
        console.log(result.success ? `✅ WORKING` : `❌ FAILED`);
        results.push({ name: integration.name, key, ...result });
      } catch (error) {
        console.log(`❌ ERROR: ${error.message}`);
        results.push({ name: integration.name, key, success: false, error: error.message });
      }
    }

    const working = results.filter(r => r.success).length;
    console.log('\n' + '='.repeat(80));
    console.log(`\n✅ ${working}/20 integrations working\n`);

    return results;
  }

  /**
   * Get statistics
   */
  getStats() {
    const stats = {
      total: this.integrations.size,
      byCategory: {},
      requireApiKey: 0,
      noApiKey: 0,
      free: 0
    };

    for (const [key, integration] of this.integrations) {
      if (!stats.byCategory[integration.category]) {
        stats.byCategory[integration.category] = 0;
      }
      stats.byCategory[integration.category]++;
      
      if (integration.requiresApiKey) stats.requireApiKey++;
      else stats.noApiKey++;
      
      if (integration.free) stats.free++;
    }

    return stats;
  }
}

// Export singleton
const manager = new Complete20IntegrationsManager();

module.exports = manager;
