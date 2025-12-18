/**
 * OpenWeatherMap Free Integration
 * FREE weather API - Free tier with 1000 calls/day
 */

const axios = require('axios');

class OpenWeatherFreeIntegration {
  constructor(config) {
    this.config = config;
    this.validateConfig();
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
  }

  validateConfig() {
    if (!this.config.apiKey) {
      throw new Error('OpenWeatherMap API Key is required (FREE at openweathermap.org)');
    }
  }

  async execute(action, params) {
    const actions = {
      getCurrentWeather: this.getCurrentWeather.bind(this),
      getForecast: this.getForecast.bind(this),
      getWeatherByCoords: this.getWeatherByCoords.bind(this),
      getAirPollution: this.getAirPollution.bind(this),
    };

    if (!actions[action]) {
      throw new Error(`Unknown action: ${action}`);
    }

    return await actions[action](params);
  }

  async getCurrentWeather(params) {
    const { city, units = 'metric' } = params;
    
    if (!city) {
      throw new Error('City name is required');
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/weather`,
        {
          params: {
            q: city,
            appid: this.config.apiKey,
            units
          }
        }
      );

      return {
        success: true,
        data: {
          city: response.data.name,
          country: response.data.sys.country,
          temperature: response.data.main.temp,
          feelsLike: response.data.main.feels_like,
          humidity: response.data.main.humidity,
          pressure: response.data.main.pressure,
          weather: response.data.weather[0].main,
          description: response.data.weather[0].description,
          windSpeed: response.data.wind.speed,
          clouds: response.data.clouds.all
        }
      };
    } catch (error) {
      throw new Error(`OpenWeather API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async getForecast(params) {
    const { city, units = 'metric', days = 5 } = params;
    
    if (!city) {
      throw new Error('City name is required');
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/forecast`,
        {
          params: {
            q: city,
            appid: this.config.apiKey,
            units,
            cnt: days * 8 // 8 forecasts per day (3-hour intervals)
          }
        }
      );

      return {
        success: true,
        data: {
          city: response.data.city.name,
          country: response.data.city.country,
          forecasts: response.data.list.map(item => ({
            datetime: item.dt_txt,
            temperature: item.main.temp,
            weather: item.weather[0].main,
            description: item.weather[0].description,
            humidity: item.main.humidity,
            windSpeed: item.wind.speed
          }))
        }
      };
    } catch (error) {
      throw new Error(`OpenWeather API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async getWeatherByCoords(params) {
    const { lat, lon, units = 'metric' } = params;
    
    if (!lat || !lon) {
      throw new Error('Latitude and longitude are required');
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/weather`,
        {
          params: {
            lat,
            lon,
            appid: this.config.apiKey,
            units
          }
        }
      );

      return {
        success: true,
        data: {
          location: response.data.name,
          temperature: response.data.main.temp,
          weather: response.data.weather[0].main,
          description: response.data.weather[0].description,
          humidity: response.data.main.humidity,
          windSpeed: response.data.wind.speed
        }
      };
    } catch (error) {
      throw new Error(`OpenWeather API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async getAirPollution(params) {
    const { lat, lon } = params;
    
    if (!lat || !lon) {
      throw new Error('Latitude and longitude are required');
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/air_pollution`,
        {
          params: {
            lat,
            lon,
            appid: this.config.apiKey
          }
        }
      );

      return {
        success: true,
        data: {
          aqi: response.data.list[0].main.aqi,
          components: response.data.list[0].components
        }
      };
    } catch (error) {
      throw new Error(`OpenWeather API error: ${error.response?.data?.message || error.message}`);
    }
  }
}

module.exports = OpenWeatherFreeIntegration;
