const axios = require('axios');

/**
 * Currencylayer Premium Integration
 * FREE API for real-time and historical currency exchange rates
 * 168 world currencies, 1,000 requests/month free
 */
class CurrencylayerIntegration {
  constructor(apiKey) {
    this.apiKey = apiKey || 'YOUR_FREE_CURRENCYLAYER_API_KEY';
    this.baseURL = 'http://api.currencylayer.com';
  }

  /**
   * Get Live Exchange Rates
   * @param {string} source - Source currency (default: USD)
   * @param {array} currencies - Target currencies array
   */
  async getLiveRates(source = 'USD', currencies = null) {
    try {
      const params = {
        access_key: this.apiKey,
        source,
        ...(currencies && { currencies: currencies.join(',') })
      };

      const response = await axios.get(`${this.baseURL}/live`, { params });

      return {
        success: response.data.success,
        data: response.data,
        source: response.data.source,
        quotes: response.data.quotes,
        timestamp: response.data.timestamp
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get Historical Rates
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {string} source - Source currency
   * @param {array} currencies - Target currencies
   */
  async getHistoricalRates(date, source = 'USD', currencies = null) {
    try {
      const params = {
        access_key: this.apiKey,
        source,
        ...(currencies && { currencies: currencies.join(',') })
      };

      const response = await axios.get(`${this.baseURL}/historical`, { 
        params: { ...params, date }
      });

      return {
        success: response.data.success,
        data: response.data,
        historical: true,
        date: response.data.date,
        source: response.data.source,
        quotes: response.data.quotes
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Convert Currency
   * @param {string} from - From currency
   * @param {string} to - To currency
   * @param {number} amount - Amount to convert
   * @param {string} date - Optional date for historical conversion
   */
  async convertCurrency(from, to, amount, date = null) {
    try {
      const params = {
        access_key: this.apiKey,
        from,
        to,
        amount,
        ...(date && { date })
      };

      const response = await axios.get(`${this.baseURL}/convert`, { params });

      return {
        success: response.data.success,
        data: response.data,
        query: response.data.query,
        info: response.data.info,
        result: response.data.result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get Time-Frame Data
   * @param {string} startDate - Start date YYYY-MM-DD
   * @param {string} endDate - End date YYYY-MM-DD
   * @param {string} source - Source currency
   * @param {array} currencies - Target currencies
   */
  async getTimeFrame(startDate, endDate, source = 'USD', currencies = null) {
    try {
      const params = {
        access_key: this.apiKey,
        start_date: startDate,
        end_date: endDate,
        source,
        ...(currencies && { currencies: currencies.join(',') })
      };

      const response = await axios.get(`${this.baseURL}/timeframe`, { params });

      return {
        success: response.data.success,
        data: response.data,
        timeframe: true,
        startDate: response.data.start_date,
        endDate: response.data.end_date,
        source: response.data.source,
        quotes: response.data.quotes
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get Currency Change
   * @param {string} startDate - Start date YYYY-MM-DD
   * @param {string} endDate - End date YYYY-MM-DD
   * @param {string} source - Source currency
   * @param {array} currencies - Target currencies
   */
  async getCurrencyChange(startDate, endDate, source = 'USD', currencies = null) {
    try {
      const params = {
        access_key: this.apiKey,
        start_date: startDate,
        end_date: endDate,
        source,
        ...(currencies && { currencies: currencies.join(',') })
      };

      const response = await axios.get(`${this.baseURL}/change`, { params });

      return {
        success: response.data.success,
        data: response.data,
        change: true,
        startDate: response.data.start_date,
        endDate: response.data.end_date,
        source: response.data.source,
        quotes: response.data.quotes
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get Supported Currencies
   */
  async getSupportedCurrencies() {
    try {
      const params = {
        access_key: this.apiKey
      };

      const response = await axios.get(`${this.baseURL}/list`, { params });

      return {
        success: response.data.success,
        data: response.data,
        currencies: response.data.currencies
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Batch Convert Multiple Currencies
   */
  async batchConvert(from, toCurrencies, amount) {
    try {
      const results = {};
      
      for (const to of toCurrencies) {
        const result = await this.convertCurrency(from, to, amount);
        if (result.success) {
          results[to] = result.result;
        }
      }

      return {
        success: true,
        from,
        amount,
        conversions: results
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get Exchange Rate Between Two Currencies
   */
  async getExchangeRate(from, to) {
    try {
      const result = await this.convertCurrency(from, to, 1);
      
      if (result.success) {
        return {
          success: true,
          from,
          to,
          rate: result.result,
          timestamp: result.info.timestamp
        };
      }

      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Compare Currency Performance
   */
  async compareCurrencies(baseCurrency, currencies, days = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const formatDate = (date) => date.toISOString().split('T')[0];

      const result = await this.getCurrencyChange(
        formatDate(startDate),
        formatDate(endDate),
        baseCurrency,
        currencies
      );

      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get Popular Currency Pairs
   */
  async getPopularPairs() {
    const pairs = [
      { from: 'USD', to: 'EUR' },
      { from: 'USD', to: 'GBP' },
      { from: 'USD', to: 'JPY' },
      { from: 'USD', to: 'CHF' },
      { from: 'USD', to: 'CAD' },
      { from: 'USD', to: 'AUD' },
      { from: 'EUR', to: 'GBP' },
      { from: 'EUR', to: 'JPY' }
    ];

    try {
      const results = [];
      
      for (const pair of pairs) {
        const rate = await this.getExchangeRate(pair.from, pair.to);
        if (rate.success) {
          results.push(rate);
        }
      }

      return {
        success: true,
        pairs: results
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = CurrencylayerIntegration;
