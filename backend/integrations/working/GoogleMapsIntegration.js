/**
 * GOOGLE MAPS INTEGRATION - FULLY WORKING
 * Maps and geolocation integration
 * 
 * FREE TIER: $200 credit/month
 * Get API key: https://console.cloud.google.com/google/maps-apis
 * 
 * Usage:
 *   const maps = new GoogleMapsIntegration({ apiKey: 'AIza...' });
 *   const geocode = await maps.geocode('1600 Amphitheatre Parkway');
 *   const directions = await maps.getDirections(origin, destination);
 */

const BaseIntegration = require('../core/BaseIntegration');

class GoogleMapsIntegration extends BaseIntegration {
  constructor(config = {}) {
    super({
      name: 'googlemaps',
      baseURL: 'https://maps.googleapis.com/maps/api',
      ...config
    });
  }

  /**
   * Geocode address to coordinates
   */
  async geocode(address) {
    this.validateApiKey();
    const response = await this.get('/geocode/json', {
      address,
      key: this.apiKey
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Geocoding failed: ${response.data.status}`);
    }

    const result = response.data.results[0];
    return {
      success: true,
      location: result.geometry.location,
      formattedAddress: result.formatted_address,
      placeId: result.place_id,
      types: result.types
    };
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(lat, lng) {
    this.validateApiKey();
    const response = await this.get('/geocode/json', {
      latlng: `${lat},${lng}`,
      key: this.apiKey
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Reverse geocoding failed: ${response.data.status}`);
    }

    return {
      success: true,
      results: response.data.results.map(r => ({
        address: r.formatted_address,
        placeId: r.place_id,
        types: r.types
      }))
    };
  }

  /**
   * Get directions between two points
   */
  async getDirections(origin, destination, mode = 'driving') {
    this.validateApiKey();
    const response = await this.get('/directions/json', {
      origin,
      destination,
      mode,
      key: this.apiKey
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Directions failed: ${response.data.status}`);
    }

    const route = response.data.routes[0];
    return {
      success: true,
      distance: route.legs[0].distance,
      duration: route.legs[0].duration,
      steps: route.legs[0].steps.map(step => ({
        instruction: step.html_instructions.replace(/<[^>]*>/g, ''),
        distance: step.distance.text,
        duration: step.duration.text
      })),
      polyline: route.overview_polyline.points
    };
  }

  /**
   * Calculate distance matrix
   */
  async getDistanceMatrix(origins, destinations, mode = 'driving') {
    this.validateApiKey();
    const response = await this.get('/distancematrix/json', {
      origins: Array.isArray(origins) ? origins.join('|') : origins,
      destinations: Array.isArray(destinations) ? destinations.join('|') : destinations,
      mode,
      key: this.apiKey
    });

    return {
      success: true,
      originAddresses: response.data.origin_addresses,
      destinationAddresses: response.data.destination_addresses,
      rows: response.data.rows
    };
  }

  /**
   * Search nearby places
   */
  async searchNearby(location, radius, type = null) {
    this.validateApiKey();
    const params = {
      location: typeof location === 'string' ? location : `${location.lat},${location.lng}`,
      radius,
      key: this.apiKey
    };
    if (type) params.type = type;

    const response = await this.get('/place/nearbysearch/json', params);

    return {
      success: true,
      places: response.data.results.map(place => ({
        name: place.name,
        placeId: place.place_id,
        location: place.geometry.location,
        rating: place.rating,
        types: place.types,
        vicinity: place.vicinity
      }))
    };
  }

  /**
   * Get place details
   */
  async getPlaceDetails(placeId) {
    this.validateApiKey();
    const response = await this.get('/place/details/json', {
      place_id: placeId,
      key: this.apiKey
    });

    const place = response.data.result;
    return {
      success: true,
      place: {
        name: place.name,
        address: place.formatted_address,
        phone: place.formatted_phone_number,
        website: place.website,
        rating: place.rating,
        reviews: place.reviews,
        openingHours: place.opening_hours,
        photos: place.photos
      }
    };
  }

  /**
   * Text search for places
   */
  async textSearch(query, location = null, radius = null) {
    this.validateApiKey();
    const params = {
      query,
      key: this.apiKey
    };
    if (location) params.location = location;
    if (radius) params.radius = radius;

    const response = await this.get('/place/textsearch/json', params);

    return {
      success: true,
      places: response.data.results.map(place => ({
        name: place.name,
        address: place.formatted_address,
        placeId: place.place_id,
        rating: place.rating,
        types: place.types
      }))
    };
  }

  /**
   * Get timezone for location
   */
  async getTimezone(lat, lng, timestamp = null) {
    this.validateApiKey();
    const response = await this.get('/timezone/json', {
      location: `${lat},${lng}`,
      timestamp: timestamp || Math.floor(Date.now() / 1000),
      key: this.apiKey
    });

    return {
      success: true,
      timezone: {
        id: response.data.timeZoneId,
        name: response.data.timeZoneName,
        offset: response.data.rawOffset,
        dstOffset: response.data.dstOffset
      }
    };
  }

  async testConnection() {
    try {
      await this.geocode('New York');
      return { success: true, integration: this.name, message: 'Connection successful' };
    } catch (error) {
      return { success: false, integration: this.name, error: error.message };
    }
  }
}

module.exports = GoogleMapsIntegration;
