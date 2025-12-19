const axios = require('axios');

/**
 * Weatherstack Premium Integration
 * FREE real-time weather data API for any location worldwide
 * 1,000 requests/month free tier
 */
class WeatherstackIntegration {
  constructor(apiKey) {
    this.apiKey = apiKey || 'YOUR_FREE_WEATHERSTACK_API_KEY';
    this.baseURL = 'http://api.weatherstack.com';
  }

  /**
   * Get Current Weather
   * @param {string} query - Location (city, coordinates, IP, zip code)
   * @param {string} units - m (metric), s (scientific), f (fahrenheit)
   */
  async getCurrentWeather(query, units = 'm') {
    try {
      const params = {
        access_key: this.apiKey,
        query,
        units
      };

      const response = await axios.get(`${this.baseURL}/current`, { params });

      return {
        success: !response.data.error,
        data: response.data,
        location: response.data.location,
        current: response.data.current,
        request: response.data.request
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get Historical Weather
   * @param {string} query - Location
   * @param {string} historicalDate - Date in YYYY-MM-DD format
   * @param {string} units - Temperature units
   */
  async getHistoricalWeather(query, historicalDate, units = 'm') {
    try {
      const params = {
        access_key: this.apiKey,
        query,
        historical_date: historicalDate,
        units
      };

      const response = await axios.get(`${this.baseURL}/historical`, { params });

      return {
        success: !response.data.error,
        data: response.data,
        location: response.data.location,
        historical: response.data.historical,
        request: response.data.request
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get Weather by Coordinates
   */
  async getWeatherByCoordinates(lat, lon, units = 'm') {
    const query = `${lat},${lon}`;
    return await this.getCurrentWeather(query, units);
  }

  /**
   * Get Weather by City
   */
  async getWeatherByCity(city, country = null, units = 'm') {
    const query = country ? `${city},${country}` : city;
    return await this.getCurrentWeather(query, units);
  }

  /**
   * Get Weather by ZIP Code
   */
  async getWeatherByZipCode(zipCode, country = 'US', units = 'm') {
    const query = `${zipCode},${country}`;
    return await this.getCurrentWeather(query, units);
  }

  /**
   * Get Weather by IP Address
   */
  async getWeatherByIP(ipAddress = 'fetch:ip', units = 'm') {
    return await this.getCurrentWeather(ipAddress, units);
  }

  /**
   * Get Multiple Locations Weather
   */
  async getMultipleLocations(locations, units = 'm') {
    try {
      const results = [];
      
      for (const location of locations) {
        const weather = await this.getCurrentWeather(location, units);
        results.push({
          location,
          weather: weather.success ? weather.current : null,
          error: weather.success ? null : weather.error
        });
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      return {
        success: true,
        results,
        total: results.length
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get Weather Forecast (requires paid plan, but included for completeness)
   */
  async getForecast(query, forecastDays = 1, units = 'm') {
    try {
      const params = {
        access_key: this.apiKey,
        query,
        forecast_days: forecastDays,
        units
      };

      const response = await axios.get(`${this.baseURL}/forecast`, { params });

      return {
        success: !response.data.error,
        data: response.data,
        location: response.data.location,
        current: response.data.current,
        forecast: response.data.forecast
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get Temperature in Different Units
   */
  async getTemperatureAllUnits(query) {
    try {
      const metric = await this.getCurrentWeather(query, 'm');
      const fahrenheit = await this.getCurrentWeather(query, 'f');
      const scientific = await this.getCurrentWeather(query, 's');

      return {
        success: true,
        location: metric.location,
        temperatures: {
          celsius: metric.current?.temperature,
          fahrenheit: fahrenheit.current?.temperature,
          kelvin: scientific.current?.temperature
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get Weather Summary
   */
  async getWeatherSummary(query, units = 'm') {
    const result = await this.getCurrentWeather(query, units);

    if (result.success) {
      const current = result.current;
      
      return {
        success: true,
        location: result.location,
        summary: {
          temperature: current.temperature,
          feelsLike: current.feelslike,
          condition: current.weather_descriptions[0],
          humidity: current.humidity,
          windSpeed: current.wind_speed,
          windDirection: current.wind_dir,
          pressure: current.pressure,
          cloudCover: current.cloudcover,
          uvIndex: current.uv_index,
          visibility: current.visibility,
          isDay: current.is_day === 'yes'
        }
      };
    }

    return result;
  }

  /**
   * Check if it's Raining
   */
  async isRaining(query) {
    const result = await this.getCurrentWeather(query);

    if (result.success) {
      const precip = result.current.precip;
      const description = result.current.weather_descriptions[0].toLowerCase();
      
      return {
        success: true,
        location: result.location,
        isRaining: precip > 0 || description.includes('rain'),
        precipitation: precip,
        condition: result.current.weather_descriptions[0]
      };
    }

    return result;
  }

  /**
   * Get Air Quality Index (if available)
   */
  async getAirQuality(query) {
    const result = await this.getCurrentWeather(query);

    if (result.success) {
      return {
        success: true,
        location: result.location,
        airQuality: result.current.air_quality || 'Not available'
      };
    }

    return result;
  }

  /**
   * Compare Weather Between Cities
   */
  async compareWeather(city1, city2, units = 'm') {
    try {
      const weather1 = await this.getCurrentWeather(city1, units);
      const weather2 = await this.getCurrentWeather(city2, units);

      if (weather1.success && weather2.success) {
        return {
          success: true,
          comparison: {
            [city1]: {
              temperature: weather1.current.temperature,
              condition: weather1.current.weather_descriptions[0],
              humidity: weather1.current.humidity
            },
            [city2]: {
              temperature: weather2.current.temperature,
              condition: weather2.current.weather_descriptions[0],
              humidity: weather2.current.humidity
            },
            temperatureDifference: Math.abs(
              weather1.current.temperature - weather2.current.temperature
            )
          }
        };
      }

      return { success: false, error: 'Failed to fetch weather for one or both cities' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = WeatherstackIntegration;
