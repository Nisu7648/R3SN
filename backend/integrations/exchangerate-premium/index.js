const axios = require('axios');

class ExchangeRateIntegration {
  constructor(apiKey) {
    this.apiKey = apiKey || 'YOUR_FREE_EXCHANGERATE_API_KEY';
    this.baseURL = 'https://v6.exchangerate-api.com/v6';
  }

  // Get Latest Rates
  async getLatestRates(baseCurrency = 'USD') {
    try {
      const response = await axios.get(`${this.baseURL}/${this.apiKey}/latest/${baseCurrency}`);

      return {
        success: true,
        data: response.data,
        base: response.data.base_code,
        rates: response.data.conversion_rates,
        lastUpdate: response.data.time_last_update_utc
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Convert Currency
  async convertCurrency(from, to, amount) {
    try {
      const response = await axios.get(`${this.baseURL}/${this.apiKey}/pair/${from}/${to}/${amount}`);

      return {
        success: true,
        data: response.data,
        from: response.data.base_code,
        to: response.data.target_code,
        rate: response.data.conversion_rate,
        amount: amount,
        result: response.data.conversion_result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get Pair Conversion Rate
  async getPairRate(from, to) {
    try {
      const response = await axios.get(`${this.baseURL}/${this.apiKey}/pair/${from}/${to}`);

      return {
        success: true,
        data: response.data,
        from: response.data.base_code,
        to: response.data.target_code,
        rate: response.data.conversion_rate,
        lastUpdate: response.data.time_last_update_utc
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get Supported Currencies
  async getSupportedCurrencies() {
    try {
      const response = await axios.get(`${this.baseURL}/${this.apiKey}/codes`);

      return {
        success: true,
        data: response.data,
        currencies: response.data.supported_codes
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get Historical Rates
  async getHistoricalRates(baseCurrency, year, month, day) {
    try {
      const response = await axios.get(`${this.baseURL}/${this.apiKey}/history/${baseCurrency}/${year}/${month}/${day}`);

      return {
        success: true,
        data: response.data,
        base: response.data.base_code,
        rates: response.data.conversion_rates,
        date: `${year}-${month}-${day}`
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Bulk Convert
  async bulkConvert(from, amounts, toCurrencies) {
    try {
      const results = [];
      
      for (const to of toCurrencies) {
        for (const amount of amounts) {
          const result = await this.convertCurrency(from, to, amount);
          results.push(result);
        }
      }

      return {
        success: true,
        conversions: results
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get Popular Currencies
  async getPopularCurrencies() {
    const popular = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR', 'MXN'];
    try {
      const rates = await this.getLatestRates('USD');
      
      if (rates.success) {
        const popularRates = {};
        popular.forEach(currency => {
          if (rates.rates[currency]) {
            popularRates[currency] = rates.rates[currency];
          }
        });

        return {
          success: true,
          base: 'USD',
          rates: popularRates
        };
      }

      return rates;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = ExchangeRateIntegration;
