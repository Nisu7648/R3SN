/**
 * CoinGecko Free Integration
 * 100% FREE crypto prices API - NO API KEY REQUIRED
 */

const axios = require('axios');

class CoinGeckoFreeIntegration {
  constructor(config = {}) {
    this.baseUrl = 'https://api.coingecko.com/api/v3';
  }

  async execute(action, params) {
    const actions = {
      getCoinPrice: this.getCoinPrice.bind(this),
      getCoinMarketData: this.getCoinMarketData.bind(this),
      getTopCoins: this.getTopCoins.bind(this),
      getTrendingCoins: this.getTrendingCoins.bind(this),
      searchCoins: this.searchCoins.bind(this),
      getGlobalData: this.getGlobalData.bind(this),
      getCoinHistory: this.getCoinHistory.bind(this),
    };

    if (!actions[action]) {
      throw new Error(`Unknown action: ${action}`);
    }

    return await actions[action](params);
  }

  async getCoinPrice(params) {
    const { coinId = 'bitcoin', currency = 'usd' } = params;

    try {
      const response = await axios.get(
        `${this.baseUrl}/simple/price`,
        {
          params: {
            ids: coinId,
            vs_currencies: currency,
            include_24hr_change: true,
            include_market_cap: true,
            include_24hr_vol: true
          }
        }
      );

      const data = response.data[coinId];

      return {
        success: true,
        data: {
          coin: coinId,
          price: data[currency],
          change24h: data[`${currency}_24h_change`],
          marketCap: data[`${currency}_market_cap`],
          volume24h: data[`${currency}_24h_vol`]
        }
      };
    } catch (error) {
      throw new Error(`CoinGecko API error: ${error.message}`);
    }
  }

  async getCoinMarketData(params) {
    const { coinId = 'bitcoin' } = params;

    try {
      const response = await axios.get(
        `${this.baseUrl}/coins/${coinId}`,
        {
          params: {
            localization: false,
            tickers: false,
            community_data: false,
            developer_data: false
          }
        }
      );

      return {
        success: true,
        data: {
          id: response.data.id,
          symbol: response.data.symbol,
          name: response.data.name,
          currentPrice: response.data.market_data.current_price.usd,
          marketCap: response.data.market_data.market_cap.usd,
          totalVolume: response.data.market_data.total_volume.usd,
          high24h: response.data.market_data.high_24h.usd,
          low24h: response.data.market_data.low_24h.usd,
          priceChange24h: response.data.market_data.price_change_percentage_24h,
          circulatingSupply: response.data.market_data.circulating_supply,
          totalSupply: response.data.market_data.total_supply
        }
      };
    } catch (error) {
      throw new Error(`CoinGecko API error: ${error.message}`);
    }
  }

  async getTopCoins(params) {
    const { limit = 10, currency = 'usd' } = params;

    try {
      const response = await axios.get(
        `${this.baseUrl}/coins/markets`,
        {
          params: {
            vs_currency: currency,
            order: 'market_cap_desc',
            per_page: limit,
            page: 1
          }
        }
      );

      return {
        success: true,
        data: {
          coins: response.data.map(coin => ({
            id: coin.id,
            symbol: coin.symbol,
            name: coin.name,
            currentPrice: coin.current_price,
            marketCap: coin.market_cap,
            priceChange24h: coin.price_change_percentage_24h,
            rank: coin.market_cap_rank
          }))
        }
      };
    } catch (error) {
      throw new Error(`CoinGecko API error: ${error.message}`);
    }
  }

  async getTrendingCoins(params) {
    try {
      const response = await axios.get(`${this.baseUrl}/search/trending`);

      return {
        success: true,
        data: {
          trending: response.data.coins.map(item => ({
            id: item.item.id,
            symbol: item.item.symbol,
            name: item.item.name,
            rank: item.item.market_cap_rank,
            priceChange24h: item.item.price_change_percentage_24h
          }))
        }
      };
    } catch (error) {
      throw new Error(`CoinGecko API error: ${error.message}`);
    }
  }

  async searchCoins(params) {
    const { query } = params;
    
    if (!query) {
      throw new Error('Search query is required');
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/search`,
        { params: { query } }
      );

      return {
        success: true,
        data: {
          coins: response.data.coins.map(coin => ({
            id: coin.id,
            symbol: coin.symbol,
            name: coin.name,
            rank: coin.market_cap_rank
          }))
        }
      };
    } catch (error) {
      throw new Error(`CoinGecko API error: ${error.message}`);
    }
  }

  async getGlobalData(params) {
    try {
      const response = await axios.get(`${this.baseUrl}/global`);

      return {
        success: true,
        data: {
          totalMarketCap: response.data.data.total_market_cap.usd,
          totalVolume: response.data.data.total_volume.usd,
          btcDominance: response.data.data.market_cap_percentage.btc,
          ethDominance: response.data.data.market_cap_percentage.eth,
          activeCryptocurrencies: response.data.data.active_cryptocurrencies,
          markets: response.data.data.markets
        }
      };
    } catch (error) {
      throw new Error(`CoinGecko API error: ${error.message}`);
    }
  }

  async getCoinHistory(params) {
    const { coinId = 'bitcoin', days = 7 } = params;

    try {
      const response = await axios.get(
        `${this.baseUrl}/coins/${coinId}/market_chart`,
        {
          params: {
            vs_currency: 'usd',
            days
          }
        }
      );

      return {
        success: true,
        data: {
          coin: coinId,
          prices: response.data.prices.map(item => ({
            timestamp: item[0],
            price: item[1]
          })),
          marketCaps: response.data.market_caps.map(item => ({
            timestamp: item[0],
            marketCap: item[1]
          }))
        }
      };
    } catch (error) {
      throw new Error(`CoinGecko API error: ${error.message}`);
    }
  }
}

module.exports = CoinGeckoFreeIntegration;
