/**
 * Bloomberg Terminal Financial Data Integration
 * Premium service - Save $24,000+/year (Bloomberg Terminal costs $2,000/month)
 * Real-time market data, analytics, and financial information
 */

const axios = require('axios');

class BloombergTerminalIntegration {
  constructor(config) {
    this.apiKey = config.apiKey || process.env.BLOOMBERG_API_KEY;
    this.apiSecret = config.apiSecret || process.env.BLOOMBERG_API_SECRET;
    
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('Bloomberg API credentials required');
    }
    
    this.baseURL = 'https://api.bloomberg.com/eap/catalogs/bbg/v1';
  }

  async makeRequest(method, endpoint, data = null) {
    const config = {
      method,
      url: `${this.baseURL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      auth: {
        username: this.apiKey,
        password: this.apiSecret
      }
    };

    if (data) config.data = data;

    try {
      const response = await axios(config);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message };
    }
  }

  async getSecurityData(ticker, fields = ['PX_LAST', 'VOLUME', 'OPEN', 'HIGH', 'LOW']) {
    try {
      const result = await this.makeRequest('POST', '/data', {
        securities: [ticker],
        fields: fields
      });
      
      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getHistoricalData(ticker, startDate, endDate, fields = ['PX_LAST']) {
    try {
      const result = await this.makeRequest('POST', '/historical', {
        securities: [ticker],
        fields: fields,
        startDate: startDate,
        endDate: endDate
      });
      
      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getIntradayData(ticker, interval = 1) {
    try {
      const result = await this.makeRequest('POST', '/intraday', {
        security: ticker,
        interval: interval
      });
      
      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getCompanyFinancials(ticker, statement = 'income') {
    try {
      const result = await this.makeRequest('POST', '/fundamentals', {
        security: ticker,
        statement: statement
      });
      
      return {
        success: true,
        financials: result.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getMarketDepth(ticker) {
    try {
      const result = await this.makeRequest('GET', `/market-depth/${ticker}`);
      
      return {
        success: true,
        depth: result.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getNews(ticker, maxResults = 20) {
    try {
      const result = await this.makeRequest('GET', `/news/${ticker}?limit=${maxResults}`);
      
      return {
        success: true,
        news: result.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getAnalystRatings(ticker) {
    try {
      const result = await this.makeRequest('GET', `/analyst-ratings/${ticker}`);
      
      return {
        success: true,
        ratings: result.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getEarningsCalendar(startDate, endDate) {
    try {
      const result = await this.makeRequest('GET', `/earnings?start=${startDate}&end=${endDate}`);
      
      return {
        success: true,
        earnings: result.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getEconomicIndicators(indicators = ['GDP', 'CPI', 'UNEMPLOYMENT']) {
    try {
      const result = await this.makeRequest('POST', '/economic-data', {
        indicators: indicators
      });
      
      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getCurrencyRates(baseCurrency = 'USD', targetCurrencies = ['EUR', 'GBP', 'JPY']) {
    try {
      const result = await this.makeRequest('POST', '/fx-rates', {
        base: baseCurrency,
        targets: targetCurrencies
      });
      
      return {
        success: true,
        rates: result.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getCommodityPrices(commodities = ['GOLD', 'OIL', 'SILVER']) {
    try {
      const result = await this.makeRequest('POST', '/commodities', {
        commodities: commodities
      });
      
      return {
        success: true,
        prices: result.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getIndexData(indices = ['SPX', 'INDU', 'CCMP']) {
    try {
      const result = await this.makeRequest('POST', '/indices', {
        indices: indices
      });
      
      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getOptionsChain(ticker, expirationDate = null) {
    try {
      const endpoint = expirationDate 
        ? `/options/${ticker}?expiration=${expirationDate}`
        : `/options/${ticker}`;
      
      const result = await this.makeRequest('GET', endpoint);
      
      return {
        success: true,
        options: result.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getBondData(isin) {
    try {
      const result = await this.makeRequest('GET', `/bonds/${isin}`);
      
      return {
        success: true,
        bond: result.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getETFHoldings(ticker) {
    try {
      const result = await this.makeRequest('GET', `/etf/${ticker}/holdings`);
      
      return {
        success: true,
        holdings: result.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getMutualFundData(ticker) {
    try {
      const result = await this.makeRequest('GET', `/mutual-fund/${ticker}`);
      
      return {
        success: true,
        fund: result.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getInsiderTransactions(ticker) {
    try {
      const result = await this.makeRequest('GET', `/insider-transactions/${ticker}`);
      
      return {
        success: true,
        transactions: result.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getInstitutionalHoldings(ticker) {
    try {
      const result = await this.makeRequest('GET', `/institutional-holdings/${ticker}`);
      
      return {
        success: true,
        holdings: result.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getScreenerResults(criteria) {
    try {
      const result = await this.makeRequest('POST', '/screener', criteria);
      
      return {
        success: true,
        results: result.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getPortfolioAnalytics(holdings) {
    try {
      const result = await this.makeRequest('POST', '/portfolio/analytics', {
        holdings: holdings
      });
      
      return {
        success: true,
        analytics: result.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = BloombergTerminalIntegration;
