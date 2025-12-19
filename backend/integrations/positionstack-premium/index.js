const axios = require('axios');

/**
 * Positionstack Premium Integration
 * FREE forward and reverse geocoding API
 * 25,000 requests/month free tier
 */
class PositionstackIntegration {
  constructor(apiKey) {
    this.apiKey = apiKey || 'YOUR_FREE_POSITIONSTACK_API_KEY';
    this.baseURL = 'http://api.positionstack.com/v1';
  }

  /**
   * Forward Geocoding - Address to Coordinates
   * @param {string} query - Address or place name
   * @param {number} limit - Number of results (1-100)
   * @param {string} country - Country code filter
   * @param {string} region - Region filter
   */
  async forwardGeocode(query, limit = 10, country = null, region = null) {
    try {
      const params = {
        access_key: this.apiKey,
        query,
        limit,
        ...(country && { country }),
        ...(region && { region })
      };

      const response = await axios.get(`${this.baseURL}/forward`, { params });

      return {
        success: true,
        data: response.data,
        results: response.data.data,
        total: response.data.data.length
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Reverse Geocoding - Coordinates to Address
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {number} limit - Number of results
   */
  async reverseGeocode(lat, lon, limit = 1) {
    try {
      const params = {
        access_key: this.apiKey,
        query: `${lat},${lon}`,
        limit
      };

      const response = await axios.get(`${this.baseURL}/reverse`, { params });

      return {
        success: true,
        data: response.data,
        results: response.data.data,
        address: response.data.data[0]
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Geocode with Language
   */
  async geocodeWithLanguage(query, language = 'en', limit = 10) {
    try {
      const params = {
        access_key: this.apiKey,
        query,
        limit,
        language
      };

      const response = await axios.get(`${this.baseURL}/forward`, { params });

      return {
        success: true,
        data: response.data,
        results: response.data.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Geocode with Bounding Box
   */
  async geocodeInBounds(query, bbox, limit = 10) {
    try {
      const params = {
        access_key: this.apiKey,
        query,
        limit,
        bbox_module: 1,
        bbox: bbox // Format: min_lon,min_lat,max_lon,max_lat
      };

      const response = await axios.get(`${this.baseURL}/forward`, { params });

      return {
        success: true,
        data: response.data,
        results: response.data.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get Timezone Information
   */
  async getTimezone(lat, lon) {
    try {
      const params = {
        access_key: this.apiKey,
        query: `${lat},${lon}`,
        timezone_module: 1
      };

      const response = await axios.get(`${this.baseURL}/reverse`, { params });

      if (response.data.data && response.data.data[0]) {
        return {
          success: true,
          timezone: response.data.data[0].timezone_module
        };
      }

      return { success: false, error: 'Timezone not found' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get Sun Information
   */
  async getSunInfo(lat, lon) {
    try {
      const params = {
        access_key: this.apiKey,
        query: `${lat},${lon}`,
        sun_module: 1
      };

      const response = await axios.get(`${this.baseURL}/reverse`, { params });

      if (response.data.data && response.data.data[0]) {
        return {
          success: true,
          sun: response.data.data[0].sun_module
        };
      }

      return { success: false, error: 'Sun information not found' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Batch Geocoding
   */
  async batchGeocode(queries) {
    try {
      const results = [];
      
      for (const query of queries) {
        const result = await this.forwardGeocode(query, 1);
        results.push({
          query,
          result: result.success ? result.results[0] : null,
          error: result.success ? null : result.error
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
   * Search Nearby Places
   */
  async searchNearby(lat, lon, radius = 10, limit = 10) {
    try {
      // Calculate bounding box from radius (in km)
      const latChange = radius / 111.32;
      const lonChange = radius / (111.32 * Math.cos(lat * Math.PI / 180));

      const bbox = `${lon - lonChange},${lat - latChange},${lon + lonChange},${lat + latChange}`;

      const params = {
        access_key: this.apiKey,
        query: `${lat},${lon}`,
        limit,
        bbox_module: 1,
        bbox
      };

      const response = await axios.get(`${this.baseURL}/reverse`, { params });

      return {
        success: true,
        data: response.data,
        results: response.data.data,
        center: { lat, lon },
        radius
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get Place Details
   */
  async getPlaceDetails(query) {
    try {
      const params = {
        access_key: this.apiKey,
        query,
        limit: 1,
        timezone_module: 1,
        sun_module: 1
      };

      const response = await axios.get(`${this.baseURL}/forward`, { params });

      if (response.data.data && response.data.data[0]) {
        return {
          success: true,
          place: response.data.data[0]
        };
      }

      return { success: false, error: 'Place not found' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Autocomplete Address
   */
  async autocomplete(query, limit = 5) {
    return await this.forwardGeocode(query, limit);
  }

  /**
   * Get Country Information
   */
  async getCountryInfo(countryCode) {
    try {
      const params = {
        access_key: this.apiKey,
        query: countryCode,
        limit: 1
      };

      const response = await axios.get(`${this.baseURL}/forward`, { params });

      if (response.data.data && response.data.data[0]) {
        return {
          success: true,
          country: {
            name: response.data.data[0].country,
            code: response.data.data[0].country_code,
            region: response.data.data[0].region,
            continent: response.data.data[0].continent
          }
        };
      }

      return { success: false, error: 'Country not found' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Calculate Distance Between Two Addresses
   */
  async calculateDistance(address1, address2) {
    try {
      const geo1 = await this.forwardGeocode(address1, 1);
      const geo2 = await this.forwardGeocode(address2, 1);

      if (geo1.success && geo2.success && geo1.results[0] && geo2.results[0]) {
        const lat1 = geo1.results[0].latitude;
        const lon1 = geo1.results[0].longitude;
        const lat2 = geo2.results[0].latitude;
        const lon2 = geo2.results[0].longitude;

        const distance = this.haversineDistance(lat1, lon1, lat2, lon2);

        return {
          success: true,
          from: address1,
          to: address2,
          distance: {
            km: distance,
            miles: distance * 0.621371
          },
          coordinates: {
            from: { lat: lat1, lon: lon1 },
            to: { lat: lat2, lon: lon2 }
          }
        };
      }

      return { success: false, error: 'Failed to geocode one or both addresses' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Haversine formula for distance calculation
   */
  haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

module.exports = PositionstackIntegration;
