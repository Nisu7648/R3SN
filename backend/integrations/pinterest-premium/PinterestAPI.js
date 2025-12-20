/**
 * Pinterest Premium API Integration
 * 
 * Provides FREE access to Pinterest for Business API features
 * 
 * Features (100% FREE):
 * - Pin Management & Publishing
 * - Board Management
 * - Analytics & Insights
 * - Audience Insights
 * - Trend Discovery
 * - Ad Campaign Management
 * - Shopping Catalog
 * - Rich Pins
 * 
 * Normal Cost: $0-$199/month for third-party tools + Pinterest Business ($0-$50/month)
 * R3SN Cost: FREE ✨
 */

const axios = require('axios');

class PinterestAPI {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseURL = 'https://api.pinterest.com';
    this.apiVersion = 'v5';
  }

  /**
   * Helper method to make API requests
   */
  async request(endpoint, method = 'GET', data = null, params = {}) {
    try {
      const config = {
        method,
        url: `${this.baseURL}/${this.apiVersion}/${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        params
      };

      if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      throw new Error(`Pinterest API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  // ==================== USER PROFILE ====================

  /**
   * Get user account
   */
  async getUserAccount(adAccountId = null) {
    const endpoint = adAccountId ? `user_account?ad_account_id=${adAccountId}` : 'user_account';
    return await this.request(endpoint, 'GET');
  }

  /**
   * Get user websites
   */
  async getUserWebsites() {
    return await this.request('user_account/websites', 'GET');
  }

  /**
   * Verify website
   */
  async verifyWebsite(website) {
    return await this.request('user_account/websites', 'POST', { website });
  }

  // ==================== BOARD MANAGEMENT ====================

  /**
   * Get boards
   */
  async getBoards(pageSize = 25, bookmark = null) {
    const params = { page_size: pageSize };
    if (bookmark) params.bookmark = bookmark;
    
    return await this.request('boards', 'GET', null, params);
  }

  /**
   * Get board
   */
  async getBoard(boardId) {
    return await this.request(`boards/${boardId}`, 'GET');
  }

  /**
   * Create board
   */
  async createBoard(name, description = '', privacy = 'PUBLIC') {
    return await this.request('boards', 'POST', {
      name,
      description,
      privacy
    });
  }

  /**
   * Update board
   */
  async updateBoard(boardId, updates) {
    return await this.request(`boards/${boardId}`, 'PATCH', updates);
  }

  /**
   * Delete board
   */
  async deleteBoard(boardId) {
    return await this.request(`boards/${boardId}`, 'DELETE');
  }

  /**
   * Get board sections
   */
  async getBoardSections(boardId, pageSize = 25, bookmark = null) {
    const params = { page_size: pageSize };
    if (bookmark) params.bookmark = bookmark;
    
    return await this.request(`boards/${boardId}/sections`, 'GET', null, params);
  }

  /**
   * Create board section
   */
  async createBoardSection(boardId, name) {
    return await this.request(`boards/${boardId}/sections`, 'POST', { name });
  }

  /**
   * Update board section
   */
  async updateBoardSection(boardId, sectionId, name) {
    return await this.request(`boards/${boardId}/sections/${sectionId}`, 'PATCH', { name });
  }

  /**
   * Delete board section
   */
  async deleteBoardSection(boardId, sectionId) {
    return await this.request(`boards/${boardId}/sections/${sectionId}`, 'DELETE');
  }

  // ==================== PIN MANAGEMENT ====================

  /**
   * Get pins
   */
  async getPins(pageSize = 25, bookmark = null) {
    const params = { page_size: pageSize };
    if (bookmark) params.bookmark = bookmark;
    
    return await this.request('pins', 'GET', null, params);
  }

  /**
   * Get pin
   */
  async getPin(pinId) {
    return await this.request(`pins/${pinId}`, 'GET');
  }

  /**
   * Create pin
   */
  async createPin(boardId, title, description = '', link = null, imageUrl = null, imageBase64 = null) {
    const pinData = {
      board_id: boardId,
      title,
      description
    };

    if (link) pinData.link = link;
    
    if (imageUrl) {
      pinData.media_source = {
        source_type: 'image_url',
        url: imageUrl
      };
    } else if (imageBase64) {
      pinData.media_source = {
        source_type: 'image_base64',
        data: imageBase64
      };
    }

    return await this.request('pins', 'POST', pinData);
  }

  /**
   * Create video pin
   */
  async createVideoPin(boardId, title, description = '', videoUrl, coverImageUrl = null) {
    const pinData = {
      board_id: boardId,
      title,
      description,
      media_source: {
        source_type: 'video_url',
        url: videoUrl
      }
    };

    if (coverImageUrl) {
      pinData.media_source.cover_image_url = coverImageUrl;
    }

    return await this.request('pins', 'POST', pinData);
  }

  /**
   * Update pin
   */
  async updatePin(pinId, updates) {
    return await this.request(`pins/${pinId}`, 'PATCH', updates);
  }

  /**
   * Delete pin
   */
  async deletePin(pinId) {
    return await this.request(`pins/${pinId}`, 'DELETE');
  }

  /**
   * Save pin (repin)
   */
  async savePin(pinId, boardId, sectionId = null) {
    const data = {
      board_id: boardId,
      pin_id: pinId
    };

    if (sectionId) data.section_id = sectionId;

    return await this.request('pins', 'POST', data);
  }

  /**
   * Get board pins
   */
  async getBoardPins(boardId, pageSize = 25, bookmark = null) {
    const params = { page_size: pageSize };
    if (bookmark) params.bookmark = bookmark;
    
    return await this.request(`boards/${boardId}/pins`, 'GET', null, params);
  }

  /**
   * Get section pins
   */
  async getSectionPins(boardId, sectionId, pageSize = 25, bookmark = null) {
    const params = { page_size: pageSize };
    if (bookmark) params.bookmark = bookmark;
    
    return await this.request(`boards/${boardId}/sections/${sectionId}/pins`, 'GET', null, params);
  }

  // ==================== ANALYTICS ====================

  /**
   * Get user analytics
   */
  async getUserAnalytics(startDate, endDate, metricTypes = ['IMPRESSION', 'SAVE', 'PIN_CLICK', 'OUTBOUND_CLICK'], splitField = 'NO_SPLIT') {
    return await this.request('user_account/analytics', 'GET', null, {
      start_date: startDate,
      end_date: endDate,
      metric_types: metricTypes.join(','),
      split_field: splitField
    });
  }

  /**
   * Get pin analytics
   */
  async getPinAnalytics(pinId, startDate, endDate, metricTypes = ['IMPRESSION', 'SAVE', 'PIN_CLICK', 'OUTBOUND_CLICK']) {
    return await this.request(`pins/${pinId}/analytics`, 'GET', null, {
      start_date: startDate,
      end_date: endDate,
      metric_types: metricTypes.join(',')
    });
  }

  /**
   * Get board analytics
   */
  async getBoardAnalytics(boardId, startDate, endDate, metricTypes = ['IMPRESSION', 'SAVE', 'PIN_CLICK']) {
    return await this.request(`boards/${boardId}/analytics`, 'GET', null, {
      start_date: startDate,
      end_date: endDate,
      metric_types: metricTypes.join(',')
    });
  }

  /**
   * Get top pins
   */
  async getTopPins(sortBy = 'IMPRESSION', startDate, endDate, pageSize = 25) {
    return await this.request('user_account/analytics/top_pins', 'GET', null, {
      sort_by: sortBy,
      start_date: startDate,
      end_date: endDate,
      page_size: pageSize
    });
  }

  /**
   * Get top video pins
   */
  async getTopVideoPins(sortBy = 'IMPRESSION', startDate, endDate, pageSize = 25) {
    return await this.request('user_account/analytics/top_video_pins', 'GET', null, {
      sort_by: sortBy,
      start_date: startDate,
      end_date: endDate,
      page_size: pageSize
    });
  }

  // ==================== AUDIENCE INSIGHTS ====================

  /**
   * Get audience insights
   */
  async getAudienceInsights(audienceInsightType = 'YOUR_TOTAL_AUDIENCE') {
    return await this.request('user_account/audience_insights', 'GET', null, {
      audience_insight_type: audienceInsightType
    });
  }

  // ==================== SEARCH & DISCOVERY ====================

  /**
   * Search pins
   */
  async searchPins(query, pageSize = 25, bookmark = null) {
    const params = {
      query,
      page_size: pageSize
    };
    if (bookmark) params.bookmark = bookmark;
    
    return await this.request('search/pins', 'GET', null, params);
  }

  /**
   * Search boards
   */
  async searchBoards(query, pageSize = 25, bookmark = null) {
    const params = {
      query,
      page_size: pageSize
    };
    if (bookmark) params.bookmark = bookmark;
    
    return await this.request('search/boards', 'GET', null, params);
  }

  /**
   * Get trending keywords
   */
  async getTrendingKeywords(region = 'US', trendType = 'growing') {
    return await this.request('trends/keywords', 'GET', null, {
      region,
      trend_type: trendType
    });
  }

  // ==================== CATALOGS (Shopping) ====================

  /**
   * Get catalogs
   */
  async getCatalogs(pageSize = 25, bookmark = null) {
    const params = { page_size: pageSize };
    if (bookmark) params.bookmark = bookmark;
    
    return await this.request('catalogs', 'GET', null, params);
  }

  /**
   * Get catalog
   */
  async getCatalog(catalogId) {
    return await this.request(`catalogs/${catalogId}`, 'GET');
  }

  /**
   * Get catalog products
   */
  async getCatalogProducts(catalogId, pageSize = 25, bookmark = null) {
    const params = { page_size: pageSize };
    if (bookmark) params.bookmark = bookmark;
    
    return await this.request(`catalogs/${catalogId}/products`, 'GET', null, params);
  }

  /**
   * Get product groups
   */
  async getProductGroups(catalogId, pageSize = 25, bookmark = null) {
    const params = { page_size: pageSize };
    if (bookmark) params.bookmark = bookmark;
    
    return await this.request(`catalogs/${catalogId}/product_groups`, 'GET', null, params);
  }

  // ==================== ADVERTISING ====================

  /**
   * Get ad accounts
   */
  async getAdAccounts(pageSize = 25, bookmark = null) {
    const params = { page_size: pageSize };
    if (bookmark) params.bookmark = bookmark;
    
    return await this.request('ad_accounts', 'GET', null, params);
  }

  /**
   * Get ad account
   */
  async getAdAccount(adAccountId) {
    return await this.request(`ad_accounts/${adAccountId}`, 'GET');
  }

  /**
   * Get campaigns
   */
  async getCampaigns(adAccountId, pageSize = 25, bookmark = null) {
    const params = { page_size: pageSize };
    if (bookmark) params.bookmark = bookmark;
    
    return await this.request(`ad_accounts/${adAccountId}/campaigns`, 'GET', null, params);
  }

  /**
   * Create campaign
   */
  async createCampaign(adAccountId, name, status = 'ACTIVE', lifetimeBudget = null, dailyBudget = null, objectiveType = 'AWARENESS') {
    const campaignData = {
      name,
      status,
      objective_type: objectiveType
    };

    if (lifetimeBudget) {
      campaignData.lifetime_spend_cap = lifetimeBudget;
    }
    if (dailyBudget) {
      campaignData.daily_spend_cap = dailyBudget;
    }

    return await this.request(`ad_accounts/${adAccountId}/campaigns`, 'POST', campaignData);
  }

  /**
   * Get campaign analytics
   */
  async getCampaignAnalytics(adAccountId, campaignIds, startDate, endDate, columns = ['SPEND_IN_DOLLAR', 'IMPRESSION_1', 'CLICKTHROUGH_1', 'CTR', 'TOTAL_ENGAGEMENT']) {
    return await this.request(`ad_accounts/${adAccountId}/campaigns/analytics`, 'GET', null, {
      campaign_ids: campaignIds.join(','),
      start_date: startDate,
      end_date: endDate,
      columns: columns.join(',')
    });
  }

  /**
   * Get ad groups
   */
  async getAdGroups(adAccountId, campaignId = null, pageSize = 25, bookmark = null) {
    const params = { page_size: pageSize };
    if (bookmark) params.bookmark = bookmark;
    if (campaignId) params.campaign_ids = campaignId;
    
    return await this.request(`ad_accounts/${adAccountId}/ad_groups`, 'GET', null, params);
  }

  /**
   * Create ad group
   */
  async createAdGroup(adAccountId, campaignId, name, budgetInMicroCurrency, bidInMicroCurrency = null) {
    const adGroupData = {
      campaign_id: campaignId,
      name,
      budget_in_micro_currency: budgetInMicroCurrency,
      billable_event: 'IMPRESSION'
    };

    if (bidInMicroCurrency) {
      adGroupData.bid_in_micro_currency = bidInMicroCurrency;
    }

    return await this.request(`ad_accounts/${adAccountId}/ad_groups`, 'POST', adGroupData);
  }

  /**
   * Get ads
   */
  async getAds(adAccountId, adGroupId = null, pageSize = 25, bookmark = null) {
    const params = { page_size: pageSize };
    if (bookmark) params.bookmark = bookmark;
    if (adGroupId) params.ad_group_ids = adGroupId;
    
    return await this.request(`ad_accounts/${adAccountId}/ads`, 'GET', null, params);
  }

  /**
   * Create ad
   */
  async createAd(adAccountId, adGroupId, creativeType, pinId, name = null, status = 'ACTIVE') {
    const adData = {
      ad_group_id: adGroupId,
      creative_type: creativeType,
      pin_id: pinId,
      status
    };

    if (name) adData.name = name;

    return await this.request(`ad_accounts/${adAccountId}/ads`, 'POST', adData);
  }

  // ==================== CONVERSION TRACKING ====================

  /**
   * Get conversion tags
   */
  async getConversionTags(adAccountId, pageSize = 25, bookmark = null) {
    const params = { page_size: pageSize };
    if (bookmark) params.bookmark = bookmark;
    
    return await this.request(`ad_accounts/${adAccountId}/conversion_tags`, 'GET', null, params);
  }

  /**
   * Create conversion tag
   */
  async createConversionTag(adAccountId, name, aemEnabled = false) {
    return await this.request(`ad_accounts/${adAccountId}/conversion_tags`, 'POST', {
      name,
      aem_enabled: aemEnabled
    });
  }

  // ==================== BATCH OPERATIONS ====================

  /**
   * Batch get pin analytics
   */
  async batchGetPinAnalytics(pinIds, startDate, endDate) {
    const promises = pinIds.map(id => this.getPinAnalytics(id, startDate, endDate));
    return await Promise.all(promises);
  }

  /**
   * Batch create pins
   */
  async batchCreatePins(pins) {
    const promises = pins.map(pin => this.createPin(
      pin.boardId,
      pin.title,
      pin.description,
      pin.link,
      pin.imageUrl
    ));
    return await Promise.all(promises);
  }

  /**
   * Batch delete pins
   */
  async batchDeletePins(pinIds) {
    const promises = pinIds.map(id => this.deletePin(id));
    return await Promise.all(promises);
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Format date for API (YYYY-MM-DD)
   */
  formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  /**
   * Calculate engagement rate
   */
  calculateEngagementRate(saves, clicks, impressions) {
    const engagement = saves + clicks;
    const rate = (engagement / impressions) * 100;
    return {
      total_engagement: engagement,
      impressions,
      rate: rate.toFixed(2) + '%'
    };
  }

  /**
   * Get pin performance summary
   */
  async getPinPerformance(pinId, startDate, endDate) {
    const analytics = await this.getPinAnalytics(pinId, startDate, endDate);
    
    const summary = analytics.all.daily_metrics.reduce((acc, metric) => {
      acc.impressions += metric.data_status === 'READY' ? metric.metrics.IMPRESSION : 0;
      acc.saves += metric.data_status === 'READY' ? metric.metrics.SAVE : 0;
      acc.clicks += metric.data_status === 'READY' ? metric.metrics.PIN_CLICK : 0;
      acc.outbound_clicks += metric.data_status === 'READY' ? metric.metrics.OUTBOUND_CLICK : 0;
      return acc;
    }, { impressions: 0, saves: 0, clicks: 0, outbound_clicks: 0 });

    return {
      ...summary,
      engagement_rate: this.calculateEngagementRate(summary.saves, summary.clicks, summary.impressions).rate
    };
  }
}

module.exports = PinterestAPI;
