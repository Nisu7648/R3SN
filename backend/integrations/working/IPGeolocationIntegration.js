/**
 * IPGEOLOCATION INTEGRATION - FULLY WORKING
 * IP address geolocation integration
 * 
 * FREE TIER: 1,000 requests/day
 * Get API key: https://ipgeolocation.io/signup
 * 
 * Usage:
 *   const ipgeo = new IPGeolocationIntegration({ apiKey: 'xxx' });
 *   const location = await ipgeo.getLocation('8.8.8.8');
 *   const timezone = await ipgeo.getTimezone('America/New_York');
 */

const BaseIntegration = require('../core/BaseIntegration');

class IPGeolocationIntegration extends BaseIntegration {
  constructor(config = {}) {
    super({
      name: 'ipgeolocation',
      baseURL: 'https://api.ipgeolocation.io',
      ...config
    });
  }

  /**
   * Get IP geolocation
   */
  async getLocation(ip = null) {
    this.validateApiKey();
    
    const params = { apiKey: this.apiKey };
    if (ip) params.ip = ip;

    const response = await this.get('/ipgeo', params);

    return {
      success: true,
      location: {
        ip: response.data.ip,
        continentName: response.data.continent_name,
        countryName: response.data.country_name,
        countryCode: response.data.country_code2,
        stateProv: response.data.state_prov,
        city: response.data.city,
        zipcode: response.data.zipcode,
        latitude: response.data.latitude,
        longitude: response.data.longitude,
        timezone: response.data.time_zone.name,
        currency: response.data.currency,
        isp: response.data.isp,
        organization: response.data.organization
      }
    };
  }

  /**
   * Get timezone information
   */
  async getTimezone(timezone) {
    this.validateApiKey();
    
    const response = await this.get('/timezone', {
      apiKey: this.apiKey,
      tz: timezone
    });

    return {
      success: true,
      timezone: {
        name: response.data.timezone,
        offset: response.data.timezone_offset,
        currentTime: response.data.date_time,
        isDST: response.data.is_dst,
        dstSavings: response.data.dst_savings
      }
    };
  }

  /**
   * Get astronomy data
   */
  async getAstronomy(lat, lng) {
    this.validateApiKey();
    
    const response = await this.get('/astronomy', {
      apiKey: this.apiKey,
      lat,
      long: lng
    });

    return {
      success: true,
      astronomy: {
        location: response.data.location,
        date: response.data.date,
        sunrise: response.data.sunrise,
        sunset: response.data.sunset,
        moonrise: response.data.moonrise,
        moonset: response.data.moonset,
        moonPhase: response.data.moon_phase
      }
    };
  }

  /**
   * Bulk IP lookup
   */
  async bulkLookup(ips) {
    this.validateApiKey();
    
    const response = await this.post('/ipgeo-bulk', {
      apiKey: this.apiKey,
      ips: ips.join(',')
    });

    return {
      success: true,
      results: response.data.map(item => ({
        ip: item.ip,
        country: item.country_name,
        city: item.city,
        latitude: item.latitude,
        longitude: item.longitude
      }))
    };
  }

  async testConnection() {
    try {
      await this.getLocation();
      return { success: true, integration: this.name, message: 'Connection successful' };
    } catch (error) {
      return { success: false, integration: this.name, error: error.message };
    }
  }
}

module.exports = IPGeolocationIntegration;
