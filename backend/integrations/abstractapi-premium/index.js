const axios = require('axios');

class AbstractAPIIntegration {
  constructor(apiKeys = {}) {
    this.apiKeys = {
      email: apiKeys.email || 'YOUR_EMAIL_VALIDATION_KEY',
      phone: apiKeys.phone || 'YOUR_PHONE_VALIDATION_KEY',
      ipGeo: apiKeys.ipGeo || 'YOUR_IP_GEO_KEY',
      vat: apiKeys.vat || 'YOUR_VAT_KEY',
      holidays: apiKeys.holidays || 'YOUR_HOLIDAYS_KEY',
      exchange: apiKeys.exchange || 'YOUR_EXCHANGE_KEY',
      timezone: apiKeys.timezone || 'YOUR_TIMEZONE_KEY',
      webscraping: apiKeys.webscraping || 'YOUR_WEBSCRAPING_KEY'
    };
    this.baseURL = 'https://emailvalidation.abstractapi.com/v1';
  }

  // Email Validation
  async validateEmail(email, autoCorrect = false) {
    try {
      const response = await axios.get('https://emailvalidation.abstractapi.com/v1/', {
        params: {
          api_key: this.apiKeys.email,
          email,
          auto_correct: autoCorrect
        }
      });

      return {
        success: true,
        data: response.data,
        email: response.data.email,
        isValid: response.data.is_valid_format.value && response.data.deliverability !== 'UNDELIVERABLE',
        quality: response.data.quality_score,
        suggestion: response.data.autocorrect
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Phone Validation
  async validatePhone(phone, country = null) {
    try {
      const params = {
        api_key: this.apiKeys.phone,
        phone,
        ...(country && { country })
      };

      const response = await axios.get('https://phonevalidation.abstractapi.com/v1/', { params });

      return {
        success: true,
        data: response.data,
        phone: response.data.phone,
        isValid: response.data.valid,
        country: response.data.country,
        carrier: response.data.carrier,
        type: response.data.type
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // IP Geolocation
  async getIPGeolocation(ip = null) {
    try {
      const params = {
        api_key: this.apiKeys.ipGeo,
        ...(ip && { ip_address: ip })
      };

      const response = await axios.get('https://ipgeolocation.abstractapi.com/v1/', { params });

      return {
        success: true,
        data: response.data,
        ip: response.data.ip_address,
        country: response.data.country,
        city: response.data.city,
        region: response.data.region,
        timezone: response.data.timezone,
        currency: response.data.currency
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // VAT Validation
  async validateVAT(vatNumber) {
    try {
      const response = await axios.get('https://vat.abstractapi.com/v1/', {
        params: {
          api_key: this.apiKeys.vat,
          vat_number: vatNumber
        }
      });

      return {
        success: true,
        data: response.data,
        vatNumber: response.data.vat_number,
        isValid: response.data.valid,
        company: response.data.company,
        country: response.data.country
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get Holidays
  async getHolidays(country, year, month = null, day = null) {
    try {
      const params = {
        api_key: this.apiKeys.holidays,
        country,
        year,
        ...(month && { month }),
        ...(day && { day })
      };

      const response = await axios.get('https://holidays.abstractapi.com/v1/', { params });

      return {
        success: true,
        data: response.data,
        holidays: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Exchange Rates
  async getExchangeRates(base = 'USD', target = null) {
    try {
      const params = {
        api_key: this.apiKeys.exchange,
        base,
        ...(target && { target })
      };

      const response = await axios.get('https://exchange-rates.abstractapi.com/v1/live/', { params });

      return {
        success: true,
        data: response.data,
        base: response.data.base,
        rates: response.data.exchange_rates
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Timezone
  async getTimezone(location) {
    try {
      const response = await axios.get('https://timezone.abstractapi.com/v1/current_time/', {
        params: {
          api_key: this.apiKeys.timezone,
          location
        }
      });

      return {
        success: true,
        data: response.data,
        timezone: response.data.timezone_name,
        currentTime: response.data.datetime,
        offset: response.data.gmt_offset
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Web Scraping
  async scrapeWebsite(url, renderJs = false) {
    try {
      const response = await axios.get('https://scrape.abstractapi.com/v1/', {
        params: {
          api_key: this.apiKeys.webscraping,
          url,
          render_js: renderJs
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Bulk Email Validation
  async bulkValidateEmails(emails) {
    try {
      const results = [];
      
      for (const email of emails) {
        const result = await this.validateEmail(email);
        results.push(result);
      }

      return {
        success: true,
        validations: results
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = AbstractAPIIntegration;
