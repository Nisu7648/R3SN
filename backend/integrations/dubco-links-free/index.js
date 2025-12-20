const axios = require('axios');

/**
 * Dub.co Link Management Premium Integration
 * FREE Link Management & Analytics
 * Free tier with custom domains (saves $80+/month)
 * Better than Bitly with more features
 */
class DubcoIntegration {
  constructor(apiKey) {
    this.apiKey = apiKey || 'YOUR_DUBCO_API_KEY';
    this.baseURL = 'https://api.dub.co';
  }

  /**
   * Create a short link
   */
  async createLink(url, options = {}) {
    try {
      const payload = {
        url,
        ...options
      };

      const response = await axios.post(
        `${this.baseURL}/links`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        link: response.data,
        shortLink: response.data.shortLink,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get link details
   */
  async getLink(linkId) {
    try {
      const response = await axios.get(`${this.baseURL}/links/${linkId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return {
        success: true,
        link: response.data,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update a link
   */
  async updateLink(linkId, updates) {
    try {
      const response = await axios.patch(
        `${this.baseURL}/links/${linkId}`,
        updates,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        link: response.data,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a link
   */
  async deleteLink(linkId) {
    try {
      await axios.delete(`${this.baseURL}/links/${linkId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return {
        success: true,
        message: 'Link deleted successfully'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List all links
   */
  async listLinks(page = 1, pageSize = 50, domain = null, search = null) {
    try {
      const params = { page, pageSize };
      if (domain) params.domain = domain;
      if (search) params.search = search;

      const response = await axios.get(`${this.baseURL}/links`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        params
      });

      return {
        success: true,
        links: response.data,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get link analytics
   */
  async getLinkAnalytics(linkId, interval = '24h') {
    try {
      const response = await axios.get(
        `${this.baseURL}/links/${linkId}/stats`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          },
          params: { interval }
        }
      );

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
   * Create QR code
   */
  async createQRCode(url, options = {}) {
    try {
      const payload = {
        url,
        ...options
      };

      const response = await axios.post(
        `${this.baseURL}/qr`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        qrCode: response.data.qrCode,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List domains
   */
  async listDomains() {
    try {
      const response = await axios.get(`${this.baseURL}/domains`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return {
        success: true,
        domains: response.data,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Add a custom domain
   */
  async addDomain(domain) {
    try {
      const response = await axios.post(
        `${this.baseURL}/domains`,
        { domain },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        domain: response.data,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a domain
   */
  async deleteDomain(domain) {
    try {
      await axios.delete(`${this.baseURL}/domains/${domain}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return {
        success: true,
        message: 'Domain deleted successfully'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Bulk create links
   */
  async bulkCreateLinks(links) {
    try {
      const response = await axios.post(
        `${this.baseURL}/links/bulk`,
        links,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        links: response.data,
        count: response.data.length,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Helper: Create branded link
   */
  async createBrandedLink(url, slug, domain = null) {
    const options = { key: slug };
    if (domain) options.domain = domain;
    
    return this.createLink(url, options);
  }

  /**
   * Helper: Create link with expiration
   */
  async createExpiringLink(url, expiresAt, password = null) {
    const options = { expiresAt };
    if (password) options.password = password;
    
    return this.createLink(url, options);
  }

  /**
   * Helper: Create link with UTM parameters
   */
  async createUTMLink(url, utmSource, utmMedium, utmCampaign) {
    const utmParams = new URLSearchParams({
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign
    });
    
    const urlWithUTM = `${url}?${utmParams.toString()}`;
    return this.createLink(urlWithUTM);
  }

  /**
   * Helper: Create link with QR code
   */
  async createLinkWithQR(url, options = {}) {
    const linkResult = await this.createLink(url, options);
    
    if (linkResult.success) {
      const qrResult = await this.createQRCode(linkResult.shortLink);
      
      return {
        success: true,
        link: linkResult.link,
        shortLink: linkResult.shortLink,
        qrCode: qrResult.qrCode
      };
    }
    
    return linkResult;
  }

  /**
   * Helper: Get click statistics
   */
  async getClickStats(linkId, days = 7) {
    const interval = `${days}d`;
    return this.getLinkAnalytics(linkId, interval);
  }
}

module.exports = DubcoIntegration;
