/**
 * OPENWEATHER INTEGRATION - FULLY WORKING
 * This is a REAL implementation that makes actual API calls
 * 
 * FREE API: https://openweathermap.org/api
 * Sign up for free API key at: https://openweathermap.org/appid
 * 
 * Usage:
 *   const weather = new OpenWeatherIntegration({ apiKey: 'your-key' });
 *   const current = await weather.getCurrentWeather('London');
 *   const forecast = await weather.getForecast('New York', 5);
 */

const BaseIntegration = require('../core/BaseIntegration');

class OpenWeatherIntegration extends BaseIntegration {
  constructor(config = {}) {
    super({
      name: 'openweather',
      baseURL: 'https://api.openweathermap.org/data/2.5',
      ...config
    });
  }

  /**
   * Get current weather for a city
   * @param {string} city - City name (e.g., "London", "New York")
   * @param {string} units - Units: metric, imperial, standard (default: metric)
   * @returns {Promise<Object>} Weather data
   */
  async getCurrentWeather(city, units = 'metric') {
    this.validateApiKey();
    
    const response = await this.get('/weather', {
      q: city,
      appid: this.apiKey,
      units: units
    });

    return {
      success: true,
      city: response.data.name,
      country: response.data.sys.country,
      temperature: response.data.main.temp,
      feelsLike: response.data.main.feels_like,
      humidity: response.data.main.humidity,
      pressure: response.data.main.pressure,
      description: response.data.weather[0].description,
      icon: response.data.weather[0].icon,
      windSpeed: response.data.wind.speed,
      clouds: response.data.clouds.all,
      timestamp: new Date(response.data.dt * 1000).toISOString()
    };
  }

  /**
   * Get weather forecast
   * @param {string} city - City name
   * @param {number} days - Number of days (1-5)
   * @param {string} units - Units: metric, imperial, standard
   * @returns {Promise<Object>} Forecast data
   */
  async getForecast(city, days = 5, units = 'metric') {
    this.validateApiKey();
    
    const response = await this.get('/forecast', {
      q: city,
      appid: this.apiKey,
      units: units,
      cnt: days * 8 // 8 forecasts per day (3-hour intervals)
    });

    return {
      success: true,
      city: response.data.city.name,
      country: response.data.city.country,
      forecasts: response.data.list.map(item => ({
        timestamp: new Date(item.dt * 1000).toISOString(),
        temperature: item.main.temp,
        feelsLike: item.main.feels_like,
        humidity: item.main.humidity,
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        windSpeed: item.wind.speed,
        clouds: item.clouds.all,
        rain: item.rain?.['3h'] || 0
      }))
    };
  }

  /**
   * Get weather by coordinates
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {string} units - Units
   * @returns {Promise<Object>} Weather data
   */
  async getWeatherByCoordinates(lat, lon, units = 'metric') {
    this.validateApiKey();
    
    const response = await this.get('/weather', {
      lat: lat,
      lon: lon,
      appid: this.apiKey,
      units: units
    });

    return {
      success: true,
      location: {
        lat: response.data.coord.lat,
        lon: response.data.coord.lon
      },
      city: response.data.name,
      temperature: response.data.main.temp,
      description: response.data.weather[0].description,
      humidity: response.data.main.humidity,
      windSpeed: response.data.wind.speed
    };
  }

  /**
   * Get air pollution data
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Promise<Object>} Air quality data
   */
  async getAirPollution(lat, lon) {
    this.validateApiKey();
    
    const response = await this.get('/air_pollution', {
      lat: lat,
      lon: lon,
      appid: this.apiKey
    });

    const aqi = response.data.list[0].main.aqi;
    const aqiLevels = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];

    return {
      success: true,
      location: { lat, lon },
      aqi: aqi,
      quality: aqiLevels[aqi - 1],
      components: response.data.list[0].components,
      timestamp: new Date(response.data.list[0].dt * 1000).toISOString()
    };
  }

  /**
   * Test connection
   */
  async testConnection() {
    try {
      await this.getCurrentWeather('London');
      return {
        success: true,
        integration: this.name,
        message: 'Connection successful'
      };
    } catch (error) {
      return {
        success: false,
        integration: this.name,
        error: error.message
      };
    }
  }
}

module.exports = OpenWeatherIntegration;
