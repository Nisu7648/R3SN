/**
 * REAL USAGE EXAMPLES
 * These are ACTUAL working examples you can copy and run
 * 
 * Setup:
 * 1. npm install axios
 * 2. Set API keys in .env or pass in config
 * 3. Run: node examples/REAL_USAGE_EXAMPLES.js
 */

const integrations = require('../WORKING_INTEGRATIONS');

// ============================================================================
// EXAMPLE 1: Weather Data (OpenWeather)
// ============================================================================
async function weatherExample() {
  console.log('\n📍 EXAMPLE 1: Weather Data\n');
  console.log('='.repeat(80));

  try {
    // Initialize (replace with your API key or set OPENWEATHER_API_KEY env var)
    const weather = integrations.use('openweather', {
      apiKey: process.env.OPENWEATHER_API_KEY || 'your-api-key-here'
    });

    // Get current weather
    console.log('\n1. Current Weather in London:');
    const current = await weather.getCurrentWeather('London');
    console.log(`   City: ${current.city}, ${current.country}`);
    console.log(`   Temperature: ${current.temperature}°C`);
    console.log(`   Feels Like: ${current.feelsLike}°C`);
    console.log(`   Description: ${current.description}`);
    console.log(`   Humidity: ${current.humidity}%`);
    console.log(`   Wind Speed: ${current.windSpeed} m/s`);

    // Get 5-day forecast
    console.log('\n2. 5-Day Forecast for New York:');
    const forecast = await weather.getForecast('New York', 5);
    console.log(`   City: ${forecast.city}, ${forecast.country}`);
    console.log(`   Forecast points: ${forecast.forecasts.length}`);
    console.log(`   First forecast:`);
    console.log(`      Time: ${forecast.forecasts[0].timestamp}`);
    console.log(`      Temp: ${forecast.forecasts[0].temperature}°C`);
    console.log(`      Description: ${forecast.forecasts[0].description}`);

    // Get weather by coordinates
    console.log('\n3. Weather by Coordinates (Mumbai):');
    const byCoords = await weather.getWeatherByCoordinates(19.0760, 72.8777);
    console.log(`   Location: ${byCoords.city}`);
    console.log(`   Temperature: ${byCoords.temperature}°C`);
    console.log(`   Description: ${byCoords.description}`);

    console.log('\n✅ Weather example completed successfully!');
  } catch (error) {
    console.error('❌ Weather example failed:', error.message);
    if (error.message.includes('API key')) {
      console.log('\n💡 Get a free API key at: https://openweathermap.org/appid');
    }
  }
}

// ============================================================================
// EXAMPLE 2: Photo Search (Unsplash)
// ============================================================================
async function photoExample() {
  console.log('\n\n📸 EXAMPLE 2: Photo Search\n');
  console.log('='.repeat(80));

  try {
    // Initialize (replace with your API key or set UNSPLASH_API_KEY env var)
    const photos = integrations.use('unsplash', {
      apiKey: process.env.UNSPLASH_API_KEY || 'your-api-key-here'
    });

    // Search photos
    console.log('\n1. Search for "nature" photos:');
    const searchResults = await photos.searchPhotos('nature', 5);
    console.log(`   Total results: ${searchResults.total}`);
    console.log(`   Showing: ${searchResults.results.length} photos`);
    searchResults.results.forEach((photo, index) => {
      console.log(`\n   Photo ${index + 1}:`);
      console.log(`      Description: ${photo.description || 'No description'}`);
      console.log(`      Author: ${photo.author.name} (@${photo.author.username})`);
      console.log(`      Likes: ${photo.likes}`);
      console.log(`      URL: ${photo.urls.regular}`);
    });

    // Get random photo
    console.log('\n2. Random landscape photo:');
    const random = await photos.getRandomPhoto('landscape', 'landscape');
    console.log(`   Description: ${random.description || 'No description'}`);
    console.log(`   Author: ${random.author.name}`);
    console.log(`   Dimensions: ${random.width}x${random.height}`);
    console.log(`   URL: ${random.urls.regular}`);

    // Get curated photos
    console.log('\n3. Curated photos:');
    const curated = await photos.getCuratedPhotos(3);
    console.log(`   Found ${curated.photos.length} curated photos`);
    curated.photos.forEach((photo, index) => {
      console.log(`   ${index + 1}. ${photo.description || 'Untitled'} by ${photo.author.name}`);
    });

    console.log('\n✅ Photo example completed successfully!');
  } catch (error) {
    console.error('❌ Photo example failed:', error.message);
    if (error.message.includes('API key')) {
      console.log('\n💡 Get a free API key at: https://unsplash.com/oauth/applications');
    }
  }
}

// ============================================================================
// EXAMPLE 3: Country Data (RestCountries - NO API KEY NEEDED!)
// ============================================================================
async function countryExample() {
  console.log('\n\n🌍 EXAMPLE 3: Country Data (NO API KEY NEEDED!)\n');
  console.log('='.repeat(80));

  try {
    // Initialize (no API key needed!)
    const countries = integrations.use('restcountries');

    // Get country by name
    console.log('\n1. Get India information:');
    const india = await countries.getCountryByName('India');
    console.log(`   Official Name: ${india.country.name.official}`);
    console.log(`   Capital: ${india.country.capital}`);
    console.log(`   Region: ${india.country.region}`);
    console.log(`   Population: ${india.country.population.toLocaleString()}`);
    console.log(`   Area: ${india.country.area.toLocaleString()} km²`);
    console.log(`   Languages: ${Object.values(india.country.languages).join(', ')}`);
    console.log(`   Currencies: ${Object.keys(india.country.currencies).join(', ')}`);
    console.log(`   Timezones: ${india.country.timezones.join(', ')}`);

    // Get country by code
    console.log('\n2. Get USA by code:');
    const usa = await countries.getCountryByCode('US');
    console.log(`   Name: ${usa.country.name.common}`);
    console.log(`   Capital: ${usa.country.capital}`);
    console.log(`   Population: ${usa.country.population.toLocaleString()}`);

    // Get countries by region
    console.log('\n3. Countries in Europe:');
    const europe = await countries.getCountriesByRegion('europe');
    console.log(`   Total countries: ${europe.count}`);
    console.log(`   First 5: ${europe.countries.slice(0, 5).map(c => c.name.common).join(', ')}`);

    // Get countries by currency
    console.log('\n4. Countries using USD:');
    const usdCountries = await countries.getCountriesByCurrency('USD');
    console.log(`   Total: ${usdCountries.count}`);
    console.log(`   Countries: ${usdCountries.countries.map(c => c.name.common).join(', ')}`);

    // Get countries by language
    console.log('\n5. Countries speaking English:');
    const englishCountries = await countries.getCountriesByLanguage('eng');
    console.log(`   Total: ${englishCountries.count}`);
    console.log(`   First 10: ${englishCountries.countries.slice(0, 10).map(c => c.name.common).join(', ')}`);

    console.log('\n✅ Country example completed successfully!');
  } catch (error) {
    console.error('❌ Country example failed:', error.message);
  }
}

// ============================================================================
// EXAMPLE 4: Combined Usage
// ============================================================================
async function combinedExample() {
  console.log('\n\n🔗 EXAMPLE 4: Combined Usage\n');
  console.log('='.repeat(80));

  try {
    // Get country info
    const countries = integrations.use('restcountries');
    const country = await countries.getCountryByName('Japan');
    console.log(`\n📍 Country: ${country.country.name.common}`);
    console.log(`   Capital: ${country.country.capital}`);

    // Get weather for capital (if weather API key is available)
    if (process.env.OPENWEATHER_API_KEY) {
      const weather = integrations.use('openweather', {
        apiKey: process.env.OPENWEATHER_API_KEY
      });
      const capitalWeather = await weather.getCurrentWeather(country.country.capital);
      console.log(`\n🌤️  Weather in ${capitalWeather.city}:`);
      console.log(`   Temperature: ${capitalWeather.temperature}°C`);
      console.log(`   Description: ${capitalWeather.description}`);
    }

    // Get photos of the country (if unsplash API key is available)
    if (process.env.UNSPLASH_API_KEY) {
      const photos = integrations.use('unsplash', {
        apiKey: process.env.UNSPLASH_API_KEY
      });
      const countryPhotos = await photos.searchPhotos(country.country.name.common, 3);
      console.log(`\n📸 Photos of ${country.country.name.common}:`);
      countryPhotos.results.forEach((photo, index) => {
        console.log(`   ${index + 1}. ${photo.urls.regular}`);
      });
    }

    console.log('\n✅ Combined example completed successfully!');
  } catch (error) {
    console.error('❌ Combined example failed:', error.message);
  }
}

// ============================================================================
// RUN ALL EXAMPLES
// ============================================================================
async function runAllExamples() {
  console.log('\n' + '='.repeat(80));
  console.log('🚀 RUNNING REAL INTEGRATION EXAMPLES');
  console.log('='.repeat(80));

  // List available integrations
  console.log('\n📋 Available Integrations:');
  integrations.list();

  // Run examples
  await weatherExample();
  await photoExample();
  await countryExample();
  await combinedExample();

  console.log('\n' + '='.repeat(80));
  console.log('✅ ALL EXAMPLES COMPLETED!');
  console.log('='.repeat(80));
  console.log('\n💡 To use these integrations in your code:');
  console.log('   const integrations = require("./WORKING_INTEGRATIONS");');
  console.log('   const weather = integrations.use("openweather", { apiKey: "..." });');
  console.log('   const data = await weather.getCurrentWeather("London");\n');
}

// Run if executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}

// Export for use in other files
module.exports = {
  weatherExample,
  photoExample,
  countryExample,
  combinedExample,
  runAllExamples
};
