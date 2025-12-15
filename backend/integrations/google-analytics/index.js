/**
 * Google Analytics Integration
 */

const { BetaAnalyticsDataClient } = require('@google-analytics/data');

class GoogleAnalyticsIntegration {
  constructor(config) {
    this.propertyId = config.propertyId || process.env.GA_PROPERTY_ID;
    this.credentials = config.credentials || process.env.GOOGLE_APPLICATION_CREDENTIALS;
    
    if (!this.propertyId) throw new Error('GA property ID required');
    
    this.client = new BetaAnalyticsDataClient({
      keyFilename: this.credentials
    });
  }

  async runReport(dimensions, metrics, dateRanges) {
    try {
      const [response] = await this.client.runReport({
        property: `properties/${this.propertyId}`,
        dimensions,
        metrics,
        dateRanges
      });
      
      return { success: true, report: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getPageViews(startDate, endDate) {
    return await this.runReport(
      [{ name: 'pagePath' }],
      [{ name: 'screenPageViews' }],
      [{ startDate, endDate }]
    );
  }

  async getUserMetrics(startDate, endDate) {
    return await this.runReport(
      [{ name: 'date' }],
      [
        { name: 'activeUsers' },
        { name: 'newUsers' },
        { name: 'sessions' }
      ],
      [{ startDate, endDate }]
    );
  }

  async getTrafficSources(startDate, endDate) {
    return await this.runReport(
      [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
      [{ name: 'sessions' }, { name: 'activeUsers' }],
      [{ startDate, endDate }]
    );
  }

  async getDeviceMetrics(startDate, endDate) {
    return await this.runReport(
      [{ name: 'deviceCategory' }],
      [{ name: 'activeUsers' }, { name: 'sessions' }],
      [{ startDate, endDate }]
    );
  }

  async getTopPages(startDate, endDate, limit = 10) {
    return await this.runReport(
      [{ name: 'pagePath' }, { name: 'pageTitle' }],
      [{ name: 'screenPageViews' }, { name: 'averageSessionDuration' }],
      [{ startDate, endDate }]
    );
  }

  async getConversionMetrics(startDate, endDate) {
    return await this.runReport(
      [{ name: 'date' }],
      [{ name: 'conversions' }, { name: 'totalRevenue' }],
      [{ startDate, endDate }]
    );
  }

  async getGeographicData(startDate, endDate) {
    return await this.runReport(
      [{ name: 'country' }, { name: 'city' }],
      [{ name: 'activeUsers' }, { name: 'sessions' }],
      [{ startDate, endDate }]
    );
  }

  async getEventMetrics(startDate, endDate) {
    return await this.runReport(
      [{ name: 'eventName' }],
      [{ name: 'eventCount' }],
      [{ startDate, endDate }]
    );
  }

  async getRealTimeReport() {
    try {
      const [response] = await this.client.runRealtimeReport({
        property: `properties/${this.propertyId}`,
        dimensions: [{ name: 'country' }],
        metrics: [{ name: 'activeUsers' }]
      });
      
      return { success: true, report: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = GoogleAnalyticsIntegration;
