/**
 * Plaid Banking & Financial Data Integration
 */

const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

class PlaidIntegration {
  constructor(config) {
    this.clientId = config.clientId || process.env.PLAID_CLIENT_ID;
    this.secret = config.secret || process.env.PLAID_SECRET;
    this.env = config.env || process.env.PLAID_ENV || 'sandbox';
    
    if (!this.clientId || !this.secret) {
      throw new Error('Plaid credentials required');
    }
    
    const configuration = new Configuration({
      basePath: PlaidEnvironments[this.env],
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': this.clientId,
          'PLAID-SECRET': this.secret
        }
      }
    });
    
    this.client = new PlaidApi(configuration);
  }

  async createLinkToken(userId, products = ['auth', 'transactions']) {
    try {
      const response = await this.client.linkTokenCreate({
        user: { client_user_id: userId },
        client_name: 'R3SN',
        products,
        country_codes: ['US'],
        language: 'en'
      });
      
      return {
        success: true,
        linkToken: response.data.link_token,
        expiration: response.data.expiration
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async exchangePublicToken(publicToken) {
    try {
      const response = await this.client.itemPublicTokenExchange({
        public_token: publicToken
      });
      
      return {
        success: true,
        accessToken: response.data.access_token,
        itemId: response.data.item_id
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getAccounts(accessToken) {
    try {
      const response = await this.client.accountsGet({
        access_token: accessToken
      });
      
      return {
        success: true,
        accounts: response.data.accounts,
        item: response.data.item
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getBalance(accessToken) {
    try {
      const response = await this.client.accountsBalanceGet({
        access_token: accessToken
      });
      
      return {
        success: true,
        accounts: response.data.accounts
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getTransactions(accessToken, startDate, endDate) {
    try {
      const response = await this.client.transactionsGet({
        access_token: accessToken,
        start_date: startDate,
        end_date: endDate
      });
      
      return {
        success: true,
        transactions: response.data.transactions,
        totalTransactions: response.data.total_transactions,
        accounts: response.data.accounts
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getIdentity(accessToken) {
    try {
      const response = await this.client.identityGet({
        access_token: accessToken
      });
      
      return {
        success: true,
        accounts: response.data.accounts,
        item: response.data.item
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getIncome(accessToken) {
    try {
      const response = await this.client.incomeGet({
        access_token: accessToken
      });
      
      return {
        success: true,
        income: response.data.income
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getAssets(accessToken) {
    try {
      const response = await this.client.assetsGet({
        access_token: accessToken
      });
      
      return {
        success: true,
        assets: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getInvestments(accessToken) {
    try {
      const response = await this.client.investmentsHoldingsGet({
        access_token: accessToken
      });
      
      return {
        success: true,
        holdings: response.data.holdings,
        securities: response.data.securities,
        accounts: response.data.accounts
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getInvestmentTransactions(accessToken, startDate, endDate) {
    try {
      const response = await this.client.investmentsTransactionsGet({
        access_token: accessToken,
        start_date: startDate,
        end_date: endDate
      });
      
      return {
        success: true,
        transactions: response.data.investment_transactions,
        securities: response.data.securities,
        accounts: response.data.accounts
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getAuth(accessToken) {
    try {
      const response = await this.client.authGet({
        access_token: accessToken
      });
      
      return {
        success: true,
        accounts: response.data.accounts,
        numbers: response.data.numbers
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async removeItem(accessToken) {
    try {
      const response = await this.client.itemRemove({
        access_token: accessToken
      });
      
      return {
        success: true,
        removed: response.data.removed
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = PlaidIntegration;
