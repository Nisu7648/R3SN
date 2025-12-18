/**
 * Refinitiv (Reuters) Financial Data Integration
 * Premium service - Save $15,000+/year
 * Real-time news, market data, and financial analytics
 */

const axios = require('axios');

class RefinitivReutersIntegration {
  constructor(config) {
    this.apiKey = config.apiKey || process.env.REFINITIV_API_KEY;
    this.username = config.username || process.env.REFINITIV_USERNAME;
    this.password = config.password || process.env.REFINITIV_PASSWORD;
    
    if (!this.apiKey) {
      throw new Error('Refinitiv API key required');
    }
    
    this.baseURL = 'https://api.refinitiv.com';
    this.authToken = null;
  }

  async authenticate() {
    try {
      const response = await axios.post(`${this.baseURL}/auth/oauth2/v1/token`, {
        grant_type: 'password',
        username: this.username,
        password: this.password,
        client_id: this.apiKey,
        scope: 'trapi'
      });
      
      this.authToken = response.data.access_token;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async makeRequest(method, endpoint, data = null) {
    if (!this.authToken) {
      await this.authenticate();
    }

    const config = {
      method,
      url: `${this.baseURL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json'
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

  async getMarketData(rics, fields = ['BID', 'ASK', 'LAST', 'VOLUME']) {
    try {
      const result = await this.makeRequest('POST', '/data/pricing/v1/', {
        universe: rics,
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

  async getHistoricalPricing(ric, startDate, endDate, interval = 'daily') {
    try {
      const result = await this.makeRequest('GET', 
        `/data/historical-pricing/v1/views/interday-summaries/${ric}?start=${startDate}&end=${endDate}&interval=${interval}`
      );
      
      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getIntradayPricing(ric, interval = '1min') {
    try {
      const result = await this.makeRequest('GET', 
        `/data/historical-pricing/v1/views/intraday-summaries/${ric}?interval=${interval}`
      );
      
      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getNews(query, maxResults = 10) {
    try {
      const result = await this.makeRequest('POST', '/data/news/v1/headlines', {
        query: query,
        limit: maxResults
      });
      
      return {
        success: true,
        news: result.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getNewsStory(storyId) {
    try {
      const result = await this.makeRequest('GET', `/data/news/v1/stories/${storyId}`);
      
      return {
        success: true,
        story: result.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getCompanyFundamentals(ric) {
    try {
      const result = await this.makeRequest('GET', `/data/fundamentals/v1/financial-statements/${ric}`);
      
      return {
        success: true,
        fundamentals: result.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getESGScores(ric) {
    try {
      const result = await this.makeRequest('GET', `/data/environmental-social-governance/v2/views/scores-full?universe=${ric}`);
      
      return {
        success: true,
        esg: result.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getAnalystRecommendations(ric) {
    try {
      const result = await this.makeRequest('GET', `/data/estimates/v1/recommendations/${ric}`);
      
      return {
        success: true,
        recommendations: result.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getEarningsEstimates(ric) {
    try {
      const result = await this.makeRequest('GET', `/data/estimates/v1/earnings/${ric}`);
      
      return {
        success: true,
        estimates: result.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getOwnershipData(ric) {
    try {
      const result = await this.makeRequest('GET', `/data/ownership/v1/shareholders/${ric}`);
      
      return {
        success: true,
        ownership: result.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getCorporateActions(ric) {
    try {
      const result = await this.makeRequest('GET', `/data/corporate-actions/v1/${ric}`);
      
      return {
        success: true,
        actions: result.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getSymbology(identifiers, identifierType = 'RIC') {
    try {
      const result = await this.makeRequest('POST', '/discovery/symbology/v1/lookup', {
        from: [{
          identifierTypes: [identifierType],
          values: identifiers
        }],
        to: [{
          identifierTypes: ['RIC', 'ISIN', 'CUSIP', 'SEDOL']
        }]
      });
      
      return {
        success: true,
        symbology: result.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async searchInstruments(query) {
    try {
      const result = await this.makeRequest('POST', '/discovery/search/v1/', {
        Query: query,
        View: 'Entities'
      });
      
      return {
        success: true,
        results: result.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getQuotes(rics) {
    try {
      const result = await this.makeRequest('POST', '/data/quotes/v1/', {
        universe: rics
      });
      
      return {
        success: true,
        quotes: result.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getChainConstituents(chainRic) {
    try {
      const result = await this.makeRequest('GET', `/discovery/chain/v1/${chainRic}`);
      
      return {
        success: true,
        constituents: result.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getTimeSeriesData(ric, fields, startDate, endDate) {
    try {
      const result = await this.makeRequest('POST', '/data/timeseries/v1/', {
        universe: [ric],
        fields: fields,
        interval: 'P1D',
        start: startDate,
        end: endDate
      });
      
      return {
        success: true,
        timeseries: result.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getWorldCheckScreening(name, entityType = 'INDIVIDUAL') {
    try {
      const result = await this.makeRequest('POST', '/world-check/v1/cases/screeningRequest', {
        name: name,
        entityType: entityType
      });
      
      return {
        success: true,
        screening: result.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = RefinitivReutersIntegration;
