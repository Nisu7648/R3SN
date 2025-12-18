/**
 * REST Countries Free Integration
 * 100% FREE country data API - NO API KEY REQUIRED
 */

const axios = require('axios');

class RestCountriesFreeIntegration {
  constructor(config = {}) {
    this.baseUrl = 'https://restcountries.com/v3.1';
  }

  async execute(action, params) {
    const actions = {
      getAllCountries: this.getAllCountries.bind(this),
      getCountryByName: this.getCountryByName.bind(this),
      getCountryByCode: this.getCountryByCode.bind(this),
      getCountriesByRegion: this.getCountriesByRegion.bind(this),
      getCountriesByLanguage: this.getCountriesByLanguage.bind(this),
      getCountriesByCurrency: this.getCountriesByCurrency.bind(this),
    };

    if (!actions[action]) {
      throw new Error(`Unknown action: ${action}`);
    }

    return await actions[action](params);
  }

  async getAllCountries(params) {
    const { limit = 10 } = params;

    try {
      const response = await axios.get(`${this.baseUrl}/all`);
      const countries = response.data.slice(0, limit);

      return {
        success: true,
        data: {
          countries: countries.map(country => ({
            name: country.name.common,
            officialName: country.name.official,
            capital: country.capital?.[0],
            region: country.region,
            population: country.population,
            area: country.area,
            flag: country.flags.png,
            code: country.cca2
          })),
          count: countries.length
        }
      };
    } catch (error) {
      throw new Error(`REST Countries API error: ${error.message}`);
    }
  }

  async getCountryByName(params) {
    const { name } = params;
    
    if (!name) {
      throw new Error('Country name is required');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/name/${name}`);
      const country = response.data[0];

      return {
        success: true,
        data: {
          name: country.name.common,
          officialName: country.name.official,
          capital: country.capital?.[0],
          region: country.region,
          subregion: country.subregion,
          population: country.population,
          area: country.area,
          languages: country.languages,
          currencies: country.currencies,
          timezones: country.timezones,
          borders: country.borders,
          flag: country.flags.png,
          coatOfArms: country.coatOfArms?.png,
          maps: country.maps.googleMaps
        }
      };
    } catch (error) {
      throw new Error(`REST Countries API error: ${error.message}`);
    }
  }

  async getCountryByCode(params) {
    const { code } = params;
    
    if (!code) {
      throw new Error('Country code is required');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/alpha/${code}`);
      const country = response.data[0];

      return {
        success: true,
        data: {
          name: country.name.common,
          officialName: country.name.official,
          capital: country.capital?.[0],
          region: country.region,
          population: country.population,
          flag: country.flags.png,
          code: country.cca2
        }
      };
    } catch (error) {
      throw new Error(`REST Countries API error: ${error.message}`);
    }
  }

  async getCountriesByRegion(params) {
    const { region, limit = 20 } = params;
    
    if (!region) {
      throw new Error('Region is required (e.g., asia, europe, africa)');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/region/${region}`);
      const countries = response.data.slice(0, limit);

      return {
        success: true,
        data: {
          region,
          countries: countries.map(country => ({
            name: country.name.common,
            capital: country.capital?.[0],
            population: country.population,
            flag: country.flags.png
          })),
          count: countries.length
        }
      };
    } catch (error) {
      throw new Error(`REST Countries API error: ${error.message}`);
    }
  }

  async getCountriesByLanguage(params) {
    const { language, limit = 20 } = params;
    
    if (!language) {
      throw new Error('Language is required (e.g., spanish, english)');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/lang/${language}`);
      const countries = response.data.slice(0, limit);

      return {
        success: true,
        data: {
          language,
          countries: countries.map(country => ({
            name: country.name.common,
            capital: country.capital?.[0],
            region: country.region,
            flag: country.flags.png
          })),
          count: countries.length
        }
      };
    } catch (error) {
      throw new Error(`REST Countries API error: ${error.message}`);
    }
  }

  async getCountriesByCurrency(params) {
    const { currency, limit = 20 } = params;
    
    if (!currency) {
      throw new Error('Currency is required (e.g., usd, eur)');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/currency/${currency}`);
      const countries = response.data.slice(0, limit);

      return {
        success: true,
        data: {
          currency,
          countries: countries.map(country => ({
            name: country.name.common,
            capital: country.capital?.[0],
            region: country.region,
            flag: country.flags.png
          })),
          count: countries.length
        }
      };
    } catch (error) {
      throw new Error(`REST Countries API error: ${error.message}`);
    }
  }
}

module.exports = RestCountriesFreeIntegration;
