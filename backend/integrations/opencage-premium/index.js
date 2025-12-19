const axios = require('axios');

/**
 * OpenCage Geocoding Premium Integration
 * FREE API for forward and reverse geocoding worldwide
 * 2,500 requests/day free tier
 */
class OpenCageIntegration {
  constructor(apiKey) {
    this.apiKey = apiKey || 'YOUR_FREE_OPENCAGE_API_KEY';
    this.baseURL = 'https://api.opencagedata.com/geocode/v1';
  }

  /**
   * Forward Geocoding - Convert address to coordinates
   * @param {string} query - Address or place name
   * @param {object} options - Additional options
   */
  async forwardGeocode(query, options = {}) {
    try {
      const params = {
        q: query,
        key: this.apiKey,
        ...options
      };

      const response = await axios.get(`${this.baseURL}/json`, { params });

      return {
        success: true,
        data: response.data,
        results: response.data.results,
        total: response.data.total_results,
        status: response.data.status
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Reverse Geocoding - Convert coordinates to address
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {object} options - Additional options
   */
  async reverseGeocode(lat, lng, options = {}) {
    try {
      const params = {
        q: `${lat},${lng}`,
        key: this.apiKey,
        ...options
      };

      const response = await axios.get(`${this.baseURL}/json`, { params });

      return {
        success: true,
        data: response.data,
        results: response.data.results,
        formatted: response.data.results[0]?.formatted,
        components: response.data.results[0]?.components
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Geocode with Language
   */
  async geocodeWithLanguage(query, language = 'en') {
    return await this.forwardGeocode(query, { language });
  }

  /**
   * Geocode with Country Restriction
   */
  async geocodeInCountry(query, countryCode) {
    return await this.forwardGeocode(query, { countrycode: countryCode });
  }

  /**
   * Geocode with Bounding Box
   */
  async geocodeInBounds(query, minLat, minLng, maxLat, maxLng) {
    const bounds = `${minLng},${minLat},${maxLng},${maxLat}`;
    return await this.forwardGeocode(query, { bounds });
  }

  /**
   * Get Detailed Place Information
   */
  async getPlaceDetails(query) {
    return await this.forwardGeocode(query, { 
      no_annotations: 0,
      no_dedupe: 1
    });
  }

  /**
   * Batch Geocoding
   */
  async batchGeocode(queries) {
    try {
      const results = [];
      
      for (const query of queries) {
        const result = await this.forwardGeocode(query);
        results.push(result);
        
        // Rate limiting - wait 100ms between requests
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
   * Get Timezone Information
   */
  async getTimezone(lat, lng) {
    const result = await this.reverseGeocode(lat, lng, { 
      no_annotations: 0 
    });

    if (result.success && result.results[0]) {
      return {
        success: true,
        timezone: result.results[0].annotations?.timezone,
        offset: result.results[0].annotations?.timezone?.offset_string
      };
    }

    return { success: false, error: 'Timezone not found' };
  }

  /**
   * Get Currency Information
   */
  async getCurrency(lat, lng) {
    const result = await this.reverseGeocode(lat, lng, { 
      no_annotations: 0 
    });

    if (result.success && result.results[0]) {
      return {
        success: true,
        currency: result.results[0].annotations?.currency
      };
    }

    return { success: false, error: 'Currency not found' };
  }

  /**
   * Get Sun Times (sunrise/sunset)
   */
  async getSunTimes(lat, lng) {
    const result = await this.reverseGeocode(lat, lng, { 
      no_annotations: 0 
    });

    if (result.success && result.results[0]) {
      return {
        success: true,
        sun: result.results[0].annotations?.sun
      };
    }

    return { success: false, error: 'Sun times not found' };
  }

  /**
   * Get What3Words Address
   */
  async getWhat3Words(lat, lng) {
    const result = await this.reverseGeocode(lat, lng, { 
      no_annotations: 0 
    });

    if (result.success && result.results[0]) {
      return {
        success: true,
        what3words: result.results[0].annotations?.what3words
      };
    }

    return { success: false, error: 'What3Words not found' };
  }

  /**
   * Get Geohash
   */
  async getGeohash(lat, lng) {
    const result = await this.reverseGeocode(lat, lng, { 
      no_annotations: 0 
    });

    if (result.success && result.results[0]) {
      return {
        success: true,
        geohash: result.results[0].annotations?.geohash
      };
    }

    return { success: false, error: 'Geohash not found' };
  }

  /**
   * Get Calling Code
   */
  async getCallingCode(lat, lng) {
    const result = await this.reverseGeocode(lat, lng, { 
      no_annotations: 0 
    });

    if (result.success && result.results[0]) {
      return {
        success: true,
        callingCode: result.results[0].annotations?.callingcode
      };
    }

    return { success: false, error: 'Calling code not found' };
  }

  /**
   * Get Flag Emoji
   */
  async getFlag(lat, lng) {
    const result = await this.reverseGeocode(lat, lng, { 
      no_annotations: 0 
    });

    if (result.success && result.results[0]) {
      return {
        success: true,
        flag: result.results[0].annotations?.flag
      };
    }

    return { success: false, error: 'Flag not found' };
  }

  /**
   * Search Nearby Places
   */
  async searchNearby(lat, lng, radius = 1000) {
    const bounds = this.calculateBounds(lat, lng, radius);
    
    return await this.forwardGeocode('*', { 
      bounds: `${bounds.minLng},${bounds.minLat},${bounds.maxLng},${bounds.maxLat}`,
      limit: 10
    });
  }

  /**
   * Calculate bounding box from center point and radius
   */
  calculateBounds(lat, lng, radiusMeters) {
    const latChange = radiusMeters / 111320;
    const lngChange = radiusMeters / (111320 * Math.cos(lat * Math.PI / 180));

    return {
      minLat: lat - latChange,
      maxLat: lat + latChange,
      minLng: lng - lngChange,
      maxLng: lng + lngChange
    };
  }

  /**
   * Get Confidence Score
   */
  async getConfidence(query) {
    const result = await this.forwardGeocode(query);

    if (result.success && result.results[0]) {
      return {
        success: true,
        confidence: result.results[0].confidence,
        formatted: result.results[0].formatted
      };
    }

    return { success: false, error: 'No results found' };
  }
}

module.exports = OpenCageIntegration;
