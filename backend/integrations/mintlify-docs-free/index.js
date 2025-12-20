const axios = require('axios');

/**
 * Mintlify Documentation Premium Integration
 * FREE AI-Powered Documentation Platform
 * Free for open source (saves $120+/month)
 * Beautiful docs with AI search
 */
class MintlifyIntegration {
  constructor(apiKey, projectId = null) {
    this.apiKey = apiKey || 'YOUR_MINTLIFY_API_KEY';
    this.projectId = projectId;
    this.baseURL = 'https://api.mintlify.com';
  }

  /**
   * Get documentation
   */
  async getDocumentation() {
    try {
      const response = await axios.get(`${this.baseURL}/api/docs`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          ...(this.projectId && { 'X-Project-Id': this.projectId })
        }
      });

      return {
        success: true,
        docs: response.data,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Search documentation
   */
  async searchDocs(query, limit = 10) {
    try {
      const response = await axios.get(`${this.baseURL}/api/search`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          ...(this.projectId && { 'X-Project-Id': this.projectId })
        },
        params: { q: query, limit }
      });

      return {
        success: true,
        results: response.data.results,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get a specific page
   */
  async getPage(slug) {
    try {
      const response = await axios.get(`${this.baseURL}/api/pages/${slug}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          ...(this.projectId && { 'X-Project-Id': this.projectId })
        }
      });

      return {
        success: true,
        page: response.data,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update a page
   */
  async updatePage(slug, content, metadata = {}) {
    try {
      const response = await axios.put(
        `${this.baseURL}/api/pages/${slug}`,
        {
          content,
          metadata
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            ...(this.projectId && { 'X-Project-Id': this.projectId })
          }
        }
      );

      return {
        success: true,
        page: response.data,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get analytics
   */
  async getAnalytics(startDate = null, endDate = null) {
    try {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await axios.get(`${this.baseURL}/api/analytics`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          ...(this.projectId && { 'X-Project-Id': this.projectId })
        },
        params
      });

      return {
        success: true,
        analytics: response.data,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get AI suggestions
   */
  async getSuggestions(context) {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/suggestions`,
        { context },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            ...(this.projectId && { 'X-Project-Id': this.projectId })
          }
        }
      );

      return {
        success: true,
        suggestions: response.data.suggestions,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Helper: Search with AI
   */
  async aiSearch(query) {
    return this.searchDocs(query);
  }

  /**
   * Helper: Get popular pages
   */
  async getPopularPages(days = 30) {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    
    const analytics = await this.getAnalytics(startDate, endDate);
    
    if (analytics.success) {
      return {
        success: true,
        popularPages: analytics.data.popularPages || []
      };
    }
    
    return analytics;
  }
}

module.exports = MintlifyIntegration;
