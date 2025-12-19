const axios = require('axios');

/**
 * Alpha Vantage Premium Integration
 * FREE API for real-time and historical stock market data
 * Stocks, Forex, Crypto, Technical Indicators, Fundamental Data
 */
class AlphaVantageIntegration {
  constructor(apiKey) {
    this.apiKey = apiKey || 'YOUR_FREE_ALPHAVANTAGE_API_KEY';
    this.baseURL = 'https://www.alphavantage.co/query';
  }

  /**
   * Get Real-Time Stock Quote
   */
  async getStockQuote(symbol) {
    try {
      const params = {
        function: 'GLOBAL_QUOTE',
        symbol,
        apikey: this.apiKey
      };

      const response = await axios.get(this.baseURL, { params });

      return {
        success: true,
        data: response.data,
        quote: response.data['Global Quote'],
        symbol
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get Intraday Stock Data
   * @param {string} interval - 1min, 5min, 15min, 30min, 60min
   */
  async getIntradayData(symbol, interval = '5min', outputsize = 'compact') {
    try {
      const params = {
        function: 'TIME_SERIES_INTRADAY',
        symbol,
        interval,
        outputsize,
        apikey: this.apiKey
      };

      const response = await axios.get(this.baseURL, { params });

      return {
        success: true,
        data: response.data,
        metadata: response.data['Meta Data'],
        timeSeries: response.data[`Time Series (${interval})`]
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get Daily Stock Data
   */
  async getDailyData(symbol, outputsize = 'compact') {
    try {
      const params = {
        function: 'TIME_SERIES_DAILY',
        symbol,
        outputsize,
        apikey: this.apiKey
      };

      const response = await axios.get(this.baseURL, { params });

      return {
        success: true,
        data: response.data,
        metadata: response.data['Meta Data'],
        timeSeries: response.data['Time Series (Daily)']
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get Weekly Stock Data
   */
  async getWeeklyData(symbol) {
    try {
      const params = {
        function: 'TIME_SERIES_WEEKLY',
        symbol,
        apikey: this.apiKey
      };

      const response = await axios.get(this.baseURL, { params });

      return {
        success: true,
        data: response.data,
        metadata: response.data['Meta Data'],
        timeSeries: response.data['Weekly Time Series']
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get Monthly Stock Data
   */
  async getMonthlyData(symbol) {
    try {
      const params = {
        function: 'TIME_SERIES_MONTHLY',
        symbol,
        apikey: this.apiKey
      };

      const response = await axios.get(this.baseURL, { params });

      return {
        success: true,
        data: response.data,
        metadata: response.data['Meta Data'],
        timeSeries: response.data['Monthly Time Series']
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Search Symbols
   */
  async searchSymbols(keywords) {
    try {
      const params = {
        function: 'SYMBOL_SEARCH',
        keywords,
        apikey: this.apiKey
      };

      const response = await axios.get(this.baseURL, { params });

      return {
        success: true,
        data: response.data,
        matches: response.data.bestMatches
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get Company Overview
   */
  async getCompanyOverview(symbol) {
    try {
      const params = {
        function: 'OVERVIEW',
        symbol,
        apikey: this.apiKey
      };

      const response = await axios.get(this.baseURL, { params });

      return {
        success: true,
        data: response.data,
        overview: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get Income Statement
   */
  async getIncomeStatement(symbol) {
    try {
      const params = {
        function: 'INCOME_STATEMENT',
        symbol,
        apikey: this.apiKey
      };

      const response = await axios.get(this.baseURL, { params });

      return {
        success: true,
        data: response.data,
        annualReports: response.data.annualReports,
        quarterlyReports: response.data.quarterlyReports
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get Balance Sheet
   */
  async getBalanceSheet(symbol) {
    try {
      const params = {
        function: 'BALANCE_SHEET',
        symbol,
        apikey: this.apiKey
      };

      const response = await axios.get(this.baseURL, { params });

      return {
        success: true,
        data: response.data,
        annualReports: response.data.annualReports,
        quarterlyReports: response.data.quarterlyReports
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get Cash Flow
   */
  async getCashFlow(symbol) {
    try {
      const params = {
        function: 'CASH_FLOW',
        symbol,
        apikey: this.apiKey
      };

      const response = await axios.get(this.baseURL, { params });

      return {
        success: true,
        data: response.data,
        annualReports: response.data.annualReports,
        quarterlyReports: response.data.quarterlyReports
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get Earnings
   */
  async getEarnings(symbol) {
    try {
      const params = {
        function: 'EARNINGS',
        symbol,
        apikey: this.apiKey
      };

      const response = await axios.get(this.baseURL, { params });

      return {
        success: true,
        data: response.data,
        annualEarnings: response.data.annualEarnings,
        quarterlyEarnings: response.data.quarterlyEarnings
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get Forex Exchange Rate
   */
  async getForexRate(fromCurrency, toCurrency) {
    try {
      const params = {
        function: 'CURRENCY_EXCHANGE_RATE',
        from_currency: fromCurrency,
        to_currency: toCurrency,
        apikey: this.apiKey
      };

      const response = await axios.get(this.baseURL, { params });

      return {
        success: true,
        data: response.data,
        exchangeRate: response.data['Realtime Currency Exchange Rate']
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get Crypto Currency Data
   */
  async getCryptoDaily(symbol, market = 'USD') {
    try {
      const params = {
        function: 'DIGITAL_CURRENCY_DAILY',
        symbol,
        market,
        apikey: this.apiKey
      };

      const response = await axios.get(this.baseURL, { params });

      return {
        success: true,
        data: response.data,
        metadata: response.data['Meta Data'],
        timeSeries: response.data['Time Series (Digital Currency Daily)']
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get SMA (Simple Moving Average)
   */
  async getSMA(symbol, interval = 'daily', timePeriod = 20, seriesType = 'close') {
    try {
      const params = {
        function: 'SMA',
        symbol,
        interval,
        time_period: timePeriod,
        series_type: seriesType,
        apikey: this.apiKey
      };

      const response = await axios.get(this.baseURL, { params });

      return {
        success: true,
        data: response.data,
        metadata: response.data['Meta Data'],
        technicalAnalysis: response.data['Technical Analysis: SMA']
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get RSI (Relative Strength Index)
   */
  async getRSI(symbol, interval = 'daily', timePeriod = 14, seriesType = 'close') {
    try {
      const params = {
        function: 'RSI',
        symbol,
        interval,
        time_period: timePeriod,
        series_type: seriesType,
        apikey: this.apiKey
      };

      const response = await axios.get(this.baseURL, { params });

      return {
        success: true,
        data: response.data,
        metadata: response.data['Meta Data'],
        technicalAnalysis: response.data['Technical Analysis: RSI']
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get Market News & Sentiment
   */
  async getMarketNews(tickers = null, topics = null, limit = 50) {
    try {
      const params = {
        function: 'NEWS_SENTIMENT',
        apikey: this.apiKey,
        limit,
        ...(tickers && { tickers }),
        ...(topics && { topics })
      };

      const response = await axios.get(this.baseURL, { params });

      return {
        success: true,
        data: response.data,
        feed: response.data.feed,
        sentiment: response.data.sentiment_score_definition
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = AlphaVantageIntegration;
