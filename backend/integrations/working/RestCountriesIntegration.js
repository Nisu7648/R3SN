/**
 * RESTCOUNTRIES INTEGRATION - FULLY WORKING
 * This is a REAL implementation that makes actual API calls
 * 
 * 100% FREE API - NO API KEY REQUIRED!
 * API: https://restcountries.com/
 * 
 * Usage:
 *   const countries = new RestCountriesIntegration();
 *   const all = await countries.getAllCountries();
 *   const country = await countries.getCountryByName('India');
 *   const byCode = await countries.getCountryByCode('US');
 */

const BaseIntegration = require('../core/BaseIntegration');

class RestCountriesIntegration extends BaseIntegration {
  constructor(config = {}) {
    super({
      name: 'restcountries',
      baseURL: 'https://restcountries.com/v3.1',
      ...config
    });
  }

  /**
   * Get all countries
   * @param {Array} fields - Optional fields to return
   * @returns {Promise<Object>} All countries
   */
  async getAllCountries(fields = null) {
    const params = {};
    if (fields && fields.length > 0) {
      params.fields = fields.join(',');
    }

    const response = await this.get('/all', params);

    return {
      success: true,
      count: response.data.length,
      countries: response.data.map(country => this.formatCountry(country))
    };
  }

  /**
   * Get country by name
   * @param {string} name - Country name
   * @param {boolean} fullText - Exact match
   * @returns {Promise<Object>} Country data
   */
  async getCountryByName(name, fullText = false) {
    const endpoint = fullText ? '/name' : '/name';
    const response = await this.get(`${endpoint}/${encodeURIComponent(name)}`);

    return {
      success: true,
      country: this.formatCountry(response.data[0])
    };
  }

  /**
   * Get country by code (alpha2, alpha3, or numeric)
   * @param {string} code - Country code (e.g., 'US', 'USA', '840')
   * @returns {Promise<Object>} Country data
   */
  async getCountryByCode(code) {
    const response = await this.get(`/alpha/${code}`);

    return {
      success: true,
      country: this.formatCountry(response.data)
    };
  }

  /**
   * Get countries by currency
   * @param {string} currency - Currency code (e.g., 'USD', 'EUR')
   * @returns {Promise<Object>} Countries using this currency
   */
  async getCountriesByCurrency(currency) {
    const response = await this.get(`/currency/${currency}`);

    return {
      success: true,
      count: response.data.length,
      countries: response.data.map(country => this.formatCountry(country))
    };
  }

  /**
   * Get countries by language
   * @param {string} language - Language code (e.g., 'en', 'es')
   * @returns {Promise<Object>} Countries speaking this language
   */
  async getCountriesByLanguage(language) {
    const response = await this.get(`/lang/${language}`);

    return {
      success: true,
      count: response.data.length,
      countries: response.data.map(country => this.formatCountry(country))
    };
  }

  /**
   * Get countries by region
   * @param {string} region - Region (africa, americas, asia, europe, oceania)
   * @returns {Promise<Object>} Countries in this region
   */
  async getCountriesByRegion(region) {
    const response = await this.get(`/region/${region}`);

    return {
      success: true,
      count: response.data.length,
      countries: response.data.map(country => this.formatCountry(country))
    };
  }

  /**
   * Get countries by subregion
   * @param {string} subregion - Subregion name
   * @returns {Promise<Object>} Countries in this subregion
   */
  async getCountriesBySubregion(subregion) {
    const response = await this.get(`/subregion/${encodeURIComponent(subregion)}`);

    return {
      success: true,
      count: response.data.length,
      countries: response.data.map(country => this.formatCountry(country))
    };
  }

  /**
   * Get countries by capital
   * @param {string} capital - Capital city name
   * @returns {Promise<Object>} Countries with this capital
   */
  async getCountriesByCapital(capital) {
    const response = await this.get(`/capital/${encodeURIComponent(capital)}`);

    return {
      success: true,
      count: response.data.length,
      countries: response.data.map(country => this.formatCountry(country))
    };
  }

  /**
   * Format country data
   */
  formatCountry(country) {
    return {
      name: {
        common: country.name.common,
        official: country.name.official,
        native: country.name.nativeName
      },
      codes: {
        alpha2: country.cca2,
        alpha3: country.cca3,
        numeric: country.ccn3
      },
      capital: country.capital?.[0],
      region: country.region,
      subregion: country.subregion,
      languages: country.languages,
      currencies: country.currencies,
      population: country.population,
      area: country.area,
      flags: {
        png: country.flags.png,
        svg: country.flags.svg,
        alt: country.flags.alt
      },
      coatOfArms: country.coatOfArms,
      maps: {
        googleMaps: country.maps.googleMaps,
        openStreetMaps: country.maps.openStreetMaps
      },
      timezones: country.timezones,
      continents: country.continents,
      borders: country.borders,
      independent: country.independent,
      unMember: country.unMember,
      landlocked: country.landlocked
    };
  }

  /**
   * Test connection
   */
  async testConnection() {
    try {
      await this.getCountryByCode('US');
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

  /**
   * Override validateApiKey since no key is needed
   */
  validateApiKey() {
    return true; // No API key required
  }
}

module.exports = RestCountriesIntegration;
