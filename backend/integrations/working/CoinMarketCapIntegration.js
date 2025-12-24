/**
 * COINMARKETCAP INTEGRATION - FULLY WORKING
 * Cryptocurrency data integration
 * 
 * FREE TIER: 10,000 calls/month
 * Get API key: https://coinmarketcap.com/api/
 * 
 * Usage:
 *   const crypto = new CoinMarketCapIntegration({ apiKey: 'xxx' });
 *   const listings = await crypto.getLatestListings(10);
 *   const bitcoin = await crypto.getCryptoQuote('BTC');
 */

const BaseIntegration = require('../core/BaseIntegration');

class CoinMarketCapIntegration extends BaseIntegration {
  constructor(config = {}) {
    super({
      name: 'coinmarketcap',
      baseURL: 'https://pro-api.coinmarketcap.com/v1',
      ...config
    });
  }

  getDefaultHeaders() {
    return {
      'X-CMC_PRO_API_KEY': this.apiKey,
      'Accept': 'application/json'
    };
  }

  /**
   * Get latest cryptocurrency listings
   */
  async getLatestListings(limit = 100, convert = 'USD') {
    this.validateApiKey();
    
    const response = await this.get('/cryptocurrency/listings/latest', {
      limit,
      convert
    });

    return {
      success: true,
      cryptocurrencies: response.data.data.map(crypto => ({
        id: crypto.id,
        name: crypto.name,
        symbol: crypto.symbol,
        rank: crypto.cmc_rank,
        price: crypto.quote[convert].price,
        volume24h: crypto.quote[convert].volume_24h,
        marketCap: crypto.quote[convert].market_cap,
        percentChange1h: crypto.quote[convert].percent_change_1h,
        percentChange24h: crypto.quote[convert].percent_change_24h,
        percentChange7d: crypto.quote[convert].percent_change_7d
      }))
    };
  }

  /**
   * Get cryptocurrency quote
   */
  async getCryptoQuote(symbol, convert = 'USD') {
    this.validateApiKey();
    
    const response = await this.get('/cryptocurrency/quotes/latest', {
      symbol,
      convert
    });

    const crypto = response.data.data[symbol];
    return {
      success: true,
      cryptocurrency: {
        id: crypto.id,
        name: crypto.name,
        symbol: crypto.symbol,
        rank: crypto.cmc_rank,
        price: crypto.quote[convert].price,
        volume24h: crypto.quote[convert].volume_24h,
        marketCap: crypto.quote[convert].market_cap,
        circulatingSupply: crypto.circulating_supply,
        totalSupply: crypto.total_supply,
        maxSupply: crypto.max_supply,
        percentChange1h: crypto.quote[convert].percent_change_1h,
        percentChange24h: crypto.quote[convert].percent_change_24h,
        percentChange7d: crypto.quote[convert].percent_change_7d,
        percentChange30d: crypto.quote[convert].percent_change_30d
      }
    };
  }

  /**
   * Get cryptocurrency metadata
   */
  async getCryptoMetadata(symbol) {
    this.validateApiKey();
    
    const response = await this.get('/cryptocurrency/info', { symbol });

    const crypto = response.data.data[symbol];
    return {
      success: true,
      metadata: {
        id: crypto.id,
        name: crypto.name,
        symbol: crypto.symbol,
        category: crypto.category,
        description: crypto.description,
        logo: crypto.logo,
        website: crypto.urls.website,
        technicalDoc: crypto.urls.technical_doc,
        twitter: crypto.urls.twitter,
        reddit: crypto.urls.reddit,
        dateAdded: crypto.date_added,
        tags: crypto.tags
      }
    };
  }

  /**
   * Get global metrics
   */
  async getGlobalMetrics(convert = 'USD') {
    this.validateApiKey();
    
    const response = await this.get('/global-metrics/quotes/latest', { convert });

    const metrics = response.data.data;
    return {
      success: true,
      metrics: {
        activeCryptocurrencies: metrics.active_cryptocurrencies,
        activeExchanges: metrics.active_exchanges,
        totalMarketCap: metrics.quote[convert].total_market_cap,
        total24hVolume: metrics.quote[convert].total_volume_24h,
        btcDominance: metrics.btc_dominance,
        ethDominance: metrics.eth_dominance,
        lastUpdated: metrics.last_updated
      }
    };
  }

  /**
   * Get trending cryptocurrencies
   */
  async getTrending(limit = 10, convert = 'USD') {
    this.validateApiKey();
    
    const response = await this.get('/cryptocurrency/trending/latest', {
      limit,
      convert
    });

    return {
      success: true,
      trending: response.data.data.map(crypto => ({
        name: crypto.name,
        symbol: crypto.symbol,
        rank: crypto.cmc_rank,
        price: crypto.quote[convert].price,
        percentChange24h: crypto.quote[convert].percent_change_24h
      }))
    };
  }

  /**
   * Get top gainers
   */
  async getTopGainers(limit = 10, convert = 'USD') {
    this.validateApiKey();
    
    const response = await this.get('/cryptocurrency/trending/gainers-losers', {
      limit,
      convert
    });

    return {
      success: true,
      gainers: response.data.data.map(crypto => ({
        name: crypto.name,
        symbol: crypto.symbol,
        price: crypto.quote[convert].price,
        percentChange24h: crypto.quote[convert].percent_change_24h
      }))
    };
  }

  /**
   * Convert cryptocurrency
   */
  async convertCrypto(amount, symbol, convert) {
    this.validateApiKey();
    
    const response = await this.get('/tools/price-conversion', {
      amount,
      symbol,
      convert
    });

    return {
      success: true,
      conversion: {
        amount: response.data.data.amount,
        symbol: response.data.data.symbol,
        price: response.data.data.quote[convert].price,
        lastUpdated: response.data.data.last_updated
      }
    };
  }

  async testConnection() {
    try {
      await this.getLatestListings(1);
      return { success: true, integration: this.name, message: 'Connection successful' };
    } catch (error) {
      return { success: false, integration: this.name, error: error.message };
    }
  }
}

module.exports = CoinMarketCapIntegration;
