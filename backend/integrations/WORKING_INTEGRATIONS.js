/**
 * WORKING INTEGRATIONS MANAGER
 * This file manages REAL, WORKING integrations
 * 
 * These integrations ACTUALLY WORK and make real API calls:
 * 1. OpenWeather - Weather data (FREE with API key)
 * 2. Unsplash - Photos (FREE with API key)
 * 3. RestCountries - Country data (100% FREE, no key needed)
 * 
 * Usage:
 *   const integrations = require('./WORKING_INTEGRATIONS');
 *   
 *   // Use weather
 *   const weather = integrations.use('openweather', { apiKey: 'your-key' });
 *   const data = await weather.getCurrentWeather('London');
 *   
 *   // Use photos
 *   const photos = integrations.use('unsplash', { apiKey: 'your-key' });
 *   const images = await photos.searchPhotos('nature', 10);
 *   
 *   // Use countries (no key needed!)
 *   const countries = integrations.use('restcountries');
 *   const india = await countries.getCountryByName('India');
 */

const OpenWeatherIntegration = require('./working/OpenWeatherIntegration');
const UnsplashIntegration = require('./working/UnsplashIntegration');
const RestCountriesIntegration = require('./working/RestCountriesIntegration');

class WorkingIntegrationsManager {
  constructor() {
    this.integrations = new Map();
    this.instances = new Map();
    
    // Register working integrations
    this.registerIntegrations();
  }

  /**
   * Register all working integrations
   */
  registerIntegrations() {
    // OpenWeather - Weather data
    this.integrations.set('openweather', {
      name: 'OpenWeather',
      class: OpenWeatherIntegration,
      requiresApiKey: true,
      free: true,
      signupUrl: 'https://openweathermap.org/appid',
      description: 'Weather data and forecasts',
      endpoints: [
        'getCurrentWeather',
        'getForecast',
        'getWeatherByCoordinates',
        'getAirPollution'
      ]
    });

    // Unsplash - Photos
    this.integrations.set('unsplash', {
      name: 'Unsplash',
      class: UnsplashIntegration,
      requiresApiKey: true,
      free: true,
      signupUrl: 'https://unsplash.com/oauth/applications',
      description: 'High-quality free photos',
      endpoints: [
        'searchPhotos',
        'getRandomPhoto',
        'getPhoto',
        'getCuratedPhotos',
        'trackDownload'
      ]
    });

    // RestCountries - Country data
    this.integrations.set('restcountries', {
      name: 'RestCountries',
      class: RestCountriesIntegration,
      requiresApiKey: false,
      free: true,
      signupUrl: null,
      description: 'Country information and data',
      endpoints: [
        'getAllCountries',
        'getCountryByName',
        'getCountryByCode',
        'getCountriesByCurrency',
        'getCountriesByLanguage',
        'getCountriesByRegion',
        'getCountriesBySubregion',
        'getCountriesByCapital'
      ]
    });
  }

  /**
   * Use an integration
   * @param {string} name - Integration name
   * @param {Object} config - Configuration (including apiKey if needed)
   * @returns {Object} Integration instance
   */
  use(name, config = {}) {
    const integration = this.integrations.get(name);
    
    if (!integration) {
      throw new Error(`Integration "${name}" not found. Available: ${Array.from(this.integrations.keys()).join(', ')}`);
    }

    // Check if API key is required
    if (integration.requiresApiKey && !config.apiKey && !process.env[`${name.toUpperCase()}_API_KEY`]) {
      console.warn(`⚠️  ${integration.name} requires an API key.`);
      console.warn(`   Sign up at: ${integration.signupUrl}`);
      console.warn(`   Then set: ${name.toUpperCase()}_API_KEY in environment or pass apiKey in config`);
    }

    // Create instance
    const instance = new integration.class(config);
    this.instances.set(name, instance);

    console.log(`✅ ${integration.name} integration loaded`);
    console.log(`   Endpoints: ${integration.endpoints.join(', ')}`);

    return instance;
  }

  /**
   * List all available integrations
   */
  list() {
    console.log('\n📋 WORKING INTEGRATIONS:\n');
    console.log('='.repeat(80));

    for (const [key, integration] of this.integrations) {
      console.log(`\n${integration.name} (${key})`);
      console.log(`   ${integration.description}`);
      console.log(`   API Key Required: ${integration.requiresApiKey ? 'Yes' : 'No'}`);
      console.log(`   Free: ${integration.free ? 'Yes' : 'No'}`);
      if (integration.signupUrl) {
        console.log(`   Sign up: ${integration.signupUrl}`);
      }
      console.log(`   Endpoints (${integration.endpoints.length}):`);
      integration.endpoints.forEach(endpoint => {
        console.log(`      - ${endpoint}()`);
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log(`\nTotal: ${this.integrations.size} working integrations\n`);

    return Array.from(this.integrations.entries()).map(([key, integration]) => ({
      key,
      name: integration.name,
      requiresApiKey: integration.requiresApiKey,
      free: integration.free,
      endpoints: integration.endpoints
    }));
  }

  /**
   * Test all integrations
   */
  async testAll() {
    console.log('\n🧪 TESTING ALL INTEGRATIONS:\n');
    console.log('='.repeat(80));

    const results = [];

    for (const [key, integration] of this.integrations) {
      console.log(`\nTesting ${integration.name}...`);
      
      try {
        const instance = new integration.class();
        const result = await instance.testConnection();
        
        if (result.success) {
          console.log(`✅ ${integration.name}: WORKING`);
        } else {
          console.log(`❌ ${integration.name}: FAILED - ${result.error}`);
        }
        
        results.push({
          name: integration.name,
          key: key,
          ...result
        });
      } catch (error) {
        console.log(`❌ ${integration.name}: ERROR - ${error.message}`);
        results.push({
          name: integration.name,
          key: key,
          success: false,
          error: error.message
        });
      }
    }

    console.log('\n' + '='.repeat(80));
    
    const working = results.filter(r => r.success).length;
    const total = results.length;
    
    console.log(`\n✅ ${working}/${total} integrations working\n`);

    return results;
  }

  /**
   * Get integration info
   */
  getInfo(name) {
    const integration = this.integrations.get(name);
    
    if (!integration) {
      throw new Error(`Integration "${name}" not found`);
    }

    return {
      name: integration.name,
      key: name,
      description: integration.description,
      requiresApiKey: integration.requiresApiKey,
      free: integration.free,
      signupUrl: integration.signupUrl,
      endpoints: integration.endpoints,
      isLoaded: this.instances.has(name)
    };
  }

  /**
   * Get usage example
   */
  getExample(name) {
    const examples = {
      openweather: `
// OpenWeather Example
const integrations = require('./WORKING_INTEGRATIONS');
const weather = integrations.use('openweather', { apiKey: 'your-api-key' });

// Get current weather
const current = await weather.getCurrentWeather('London');
console.log(\`Temperature in \${current.city}: \${current.temperature}°C\`);

// Get forecast
const forecast = await weather.getForecast('New York', 5);
console.log(\`5-day forecast: \${forecast.forecasts.length} data points\`);
      `,
      unsplash: `
// Unsplash Example
const integrations = require('./WORKING_INTEGRATIONS');
const photos = integrations.use('unsplash', { apiKey: 'your-api-key' });

// Search photos
const results = await photos.searchPhotos('nature', 10);
console.log(\`Found \${results.total} photos\`);

// Get random photo
const random = await photos.getRandomPhoto('landscape');
console.log(\`Random photo: \${random.urls.regular}\`);
      `,
      restcountries: `
// RestCountries Example (NO API KEY NEEDED!)
const integrations = require('./WORKING_INTEGRATIONS');
const countries = integrations.use('restcountries');

// Get country by name
const india = await countries.getCountryByName('India');
console.log(\`Capital: \${india.country.capital}\`);
console.log(\`Population: \${india.country.population}\`);

// Get all countries
const all = await countries.getAllCountries();
console.log(\`Total countries: \${all.count}\`);
      `
    };

    return examples[name] || 'No example available';
  }
}

// Export singleton instance
const manager = new WorkingIntegrationsManager();

module.exports = manager;
