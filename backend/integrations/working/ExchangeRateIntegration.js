/**
 * EXCHANGERATE INTEGRATION - FULLY WORKING
 * Currency exchange rates integration
 * 
 * FREE TIER: 1,500 requests/month
 * Get API key: https://www.exchangerate-api.com/
 * 
 * Usage:
 *   const exchange = new ExchangeRateIntegration({ apiKey: 'xxx' });
 *   const rates = await exchange.getLatestRates('USD');
 *   const convert = await exchange.convertCurrency('USD', 'EUR', 100);
 */

const BaseIntegration = require('../core/BaseIntegration');

class ExchangeRateIntegration extends BaseIntegration {
  constructor(config = {}) {
    super({
      name: 'exchangerate',
      baseURL: 'https://v6.exchangerate-api.com/v6',
      ...config
    });
  }

  /**
   * Get latest exchange rates
   */
  async getLatestRates(baseCurrency = 'USD') {
    this.validateApiKey();
    
    const response = await this.get(`/${this.apiKey}/latest/${baseCurrency}`);

    return {
      success: response.data.result === 'success',
      baseCurrency: response.data.base_code,
      lastUpdate: response.data.time_last_update_utc,
      rates: response.data.conversion_rates
    };
  }

  /**
   * Convert currency
   */
  async convertCurrency(from, to, amount) {
    this.validateApiKey();
    
    const response = await this.get(`/${this.apiKey}/pair/${from}/${to}/${amount}`);

    return {
      success: response.data.result === 'success',
      from: response.data.base_code,
      to: response.data.target_code,
      rate: response.data.conversion_rate,
      amount: amount,
      result: response.data.conversion_result
    };
  }

  /**
   * Get supported currencies
   */
  async getSupportedCurrencies() {
    this.validateApiKey();
    
    const response = await this.get(`/${this.apiKey}/codes`);

    return {
      success: response.data.result === 'success',
      currencies: response.data.supported_codes.map(([code, name]) => ({
        code,
        name
      }))
    };
  }

  /**
   * Get historical rates
   */
  async getHistoricalRates(baseCurrency, year, month, day) {
    this.validateApiKey();
    
    const response = await this.get(`/${this.apiKey}/history/${baseCurrency}/${year}/${month}/${day}`);

    return {
      success: response.data.result === 'success',
      baseCurrency: response.data.base_code,
      date: `${year}-${month}-${day}`,
      rates: response.data.conversion_rates
    };
  }

  async testConnection() {
    try {
      await this.getLatestRates('USD');
      return { success: true, integration: this.name, message: 'Connection successful' };
    } catch (error) {
      return { success: false, integration: this.name, error: error.message };
    }
  }
}

module.exports = ExchangeRateIntegration;
