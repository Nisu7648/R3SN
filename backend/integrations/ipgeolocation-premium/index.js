const axios = require('axios');

class IPGeolocationIntegration {
  constructor(apiKey) {
    this.apiKey = apiKey || 'YOUR_FREE_IPGEOLOCATION_API_KEY';
    this.baseURL = 'https://api.ipgeolocation.io';
  }

  // Get IP Geolocation
  async getIPGeolocation(ip = null, fields = null) {
    try {
      const params = {
        apiKey: this.apiKey,
        ...(ip && { ip }),
        ...(fields && { fields })
      };

      const response = await axios.get(`${this.baseURL}/ipgeo`, { params });

      return {
        success: true,
        data: response.data,
        ip: response.data.ip,
        country: response.data.country_name,
        city: response.data.city,
        latitude: response.data.latitude,
        longitude: response.data.longitude,
        timezone: response.data.time_zone
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get Timezone
  async getTimezone(timezone = null, lat = null, long = null, ip = null) {
    try {
      const params = {
        apiKey: this.apiKey,
        ...(timezone && { tz: timezone }),
        ...(lat && { lat }),
        ...(long && { long }),
        ...(ip && { ip })
      };

      const response = await axios.get(`${this.baseURL}/timezone`, { params });

      return {
        success: true,
        data: response.data,
        timezone: response.data.timezone,
        currentTime: response.data.date_time,
        offset: response.data.timezone_offset
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get Astronomy Data
  async getAstronomy(lat, long, date = null) {
    try {
      const params = {
        apiKey: this.apiKey,
        lat,
        long,
        ...(date && { date })
      };

      const response = await axios.get(`${this.baseURL}/astronomy`, { params });

      return {
        success: true,
        data: response.data,
        sunrise: response.data.sunrise,
        sunset: response.data.sunset,
        moonrise: response.data.moonrise,
        moonset: response.data.moonset
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get User Agent Info
  async getUserAgent(userAgent) {
    try {
      const params = {
        apiKey: this.apiKey,
        uaString: userAgent
      };

      const response = await axios.get(`${this.baseURL}/user-agent`, { params });

      return {
        success: true,
        data: response.data,
        browser: response.data.name,
        version: response.data.version,
        os: response.data.operatingSystem,
        device: response.data.device
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Bulk IP Lookup
  async bulkIPLookup(ips) {
    try {
      const response = await axios.post(`${this.baseURL}/ipgeo-bulk`, {
        apiKey: this.apiKey,
        ips: ips
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get Currency
  async getCurrency(ip = null) {
    try {
      const geoData = await this.getIPGeolocation(ip, 'currency');
      
      if (geoData.success) {
        return {
          success: true,
          currency: geoData.data.currency
        };
      }

      return geoData;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get Security Info
  async getSecurityInfo(ip = null) {
    try {
      const geoData = await this.getIPGeolocation(ip, 'security');
      
      if (geoData.success) {
        return {
          success: true,
          security: geoData.data.security
        };
      }

      return geoData;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = IPGeolocationIntegration;
