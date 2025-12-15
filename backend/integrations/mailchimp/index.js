/**
 * Mailchimp Email Marketing Integration
 * Complete email marketing automation
 * 
 * Features:
 * - Audience management
 * - Campaign creation
 * - Email templates
 * - Automation workflows
 * - Reports and analytics
 * - Tags and segments
 */

const mailchimp = require('@mailchimp/mailchimp_marketing');
const crypto = require('crypto');

class MailchimpIntegration {
  constructor(config) {
    this.apiKey = config.apiKey || process.env.MAILCHIMP_API_KEY;
    this.server = config.server || process.env.MAILCHIMP_SERVER_PREFIX;
    
    if (!this.apiKey || !this.server) {
      throw new Error('Mailchimp credentials not configured');
    }

    mailchimp.setConfig({
      apiKey: this.apiKey,
      server: this.server
    });

    this.client = mailchimp;
  }

  /**
   * Get all lists/audiences
   */
  async getLists(count = 10, offset = 0) {
    try {
      const response = await this.client.lists.getAllLists({
        count,
        offset
      });

      return {
        success: true,
        lists: response.lists.map(list => ({
          id: list.id,
          name: list.name,
          stats: {
            memberCount: list.stats.member_count,
            unsubscribeCount: list.stats.unsubscribe_count,
            cleanedCount: list.stats.cleaned_count,
            openRate: list.stats.open_rate,
            clickRate: list.stats.click_rate
          },
          dateCreated: list.date_created
        })),
        totalItems: response.total_items
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get list details
   */
  async getList(listId) {
    try {
      const list = await this.client.lists.getList(listId);

      return {
        success: true,
        list: {
          id: list.id,
          name: list.name,
          contact: list.contact,
          permissionReminder: list.permission_reminder,
          campaignDefaults: list.campaign_defaults,
          stats: list.stats,
          dateCreated: list.date_created
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Add member to list
   */
  async addMember(listId, email, status = 'subscribed', mergeFields = {}, tags = []) {
    try {
      const member = await this.client.lists.addListMember(listId, {
        email_address: email,
        status,
        merge_fields: mergeFields,
        tags
      });

      return {
        success: true,
        member: {
          id: member.id,
          email: member.email_address,
          status: member.status,
          mergeFields: member.merge_fields,
          tags: member.tags
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update member
   */
  async updateMember(listId, email, updates) {
    try {
      const subscriberHash = crypto
        .createHash('md5')
        .update(email.toLowerCase())
        .digest('hex');

      const member = await this.client.lists.updateListMember(
        listId,
        subscriberHash,
        updates
      );

      return {
        success: true,
        member: {
          id: member.id,
          email: member.email_address,
          status: member.status,
          mergeFields: member.merge_fields
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Remove member from list
   */
  async removeMember(listId, email) {
    try {
      const subscriberHash = crypto
        .createHash('md5')
        .update(email.toLowerCase())
        .digest('hex');

      await this.client.lists.deleteListMember(listId, subscriberHash);

      return {
        success: true,
        message: 'Member removed successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get member info
   */
  async getMember(listId, email) {
    try {
      const subscriberHash = crypto
        .createHash('md5')
        .update(email.toLowerCase())
        .digest('hex');

      const member = await this.client.lists.getListMember(listId, subscriberHash);

      return {
        success: true,
        member: {
          id: member.id,
          email: member.email_address,
          status: member.status,
          mergeFields: member.merge_fields,
          stats: member.stats,
          tags: member.tags
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create campaign
   */
  async createCampaign(type, listId, subject, fromName, replyTo, settings = {}) {
    try {
      const campaign = await this.client.campaigns.create({
        type,
        recipients: {
          list_id: listId
        },
        settings: {
          subject_line: subject,
          from_name: fromName,
          reply_to: replyTo,
          ...settings
        }
      });

      return {
        success: true,
        campaign: {
          id: campaign.id,
          type: campaign.type,
          status: campaign.status,
          settings: campaign.settings,
          createTime: campaign.create_time
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Set campaign content
   */
  async setCampaignContent(campaignId, html, plainText = '') {
    try {
      const content = await this.client.campaigns.setContent(campaignId, {
        html,
        plain_text: plainText
      });

      return {
        success: true,
        content: {
          html: content.html,
          plainText: content.plain_text
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send campaign
   */
  async sendCampaign(campaignId) {
    try {
      await this.client.campaigns.send(campaignId);

      return {
        success: true,
        message: 'Campaign sent successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get campaign report
   */
  async getCampaignReport(campaignId) {
    try {
      const report = await this.client.reports.getCampaignReport(campaignId);

      return {
        success: true,
        report: {
          id: report.id,
          campaignTitle: report.campaign_title,
          type: report.type,
          emailsSent: report.emails_sent,
          opens: {
            opensTotal: report.opens.opens_total,
            uniqueOpens: report.opens.unique_opens,
            openRate: report.opens.open_rate
          },
          clicks: {
            clicksTotal: report.clicks.clicks_total,
            uniqueClicks: report.clicks.unique_clicks,
            clickRate: report.clicks.click_rate
          },
          bounces: report.bounces,
          unsubscribed: report.unsubscribed
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get all campaigns
   */
  async getCampaigns(count = 10, offset = 0, status = null) {
    try {
      const params = { count, offset };
      if (status) params.status = status;

      const response = await this.client.campaigns.list(params);

      return {
        success: true,
        campaigns: response.campaigns.map(c => ({
          id: c.id,
          type: c.type,
          status: c.status,
          settings: c.settings,
          createTime: c.create_time,
          sendTime: c.send_time
        })),
        totalItems: response.total_items
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create template
   */
  async createTemplate(name, html) {
    try {
      const template = await this.client.templates.create({
        name,
        html
      });

      return {
        success: true,
        template: {
          id: template.id,
          name: template.name,
          dateCreated: template.date_created
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get all templates
   */
  async getTemplates(count = 10, offset = 0) {
    try {
      const response = await this.client.templates.list({
        count,
        offset
      });

      return {
        success: true,
        templates: response.templates.map(t => ({
          id: t.id,
          name: t.name,
          type: t.type,
          dateCreated: t.date_created
        })),
        totalItems: response.total_items
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Add tags to member
   */
  async addTags(listId, email, tags) {
    try {
      const subscriberHash = crypto
        .createHash('md5')
        .update(email.toLowerCase())
        .digest('hex');

      await this.client.lists.updateListMemberTags(listId, subscriberHash, {
        tags: tags.map(tag => ({ name: tag, status: 'active' }))
      });

      return {
        success: true,
        message: 'Tags added successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create segment
   */
  async createSegment(listId, name, conditions) {
    try {
      const segment = await this.client.lists.createSegment(listId, {
        name,
        static_segment: [],
        options: {
          match: 'any',
          conditions
        }
      });

      return {
        success: true,
        segment: {
          id: segment.id,
          name: segment.name,
          memberCount: segment.member_count,
          createdAt: segment.created_at
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get automation workflows
   */
  async getAutomations(count = 10, offset = 0) {
    try {
      const response = await this.client.automations.list({
        count,
        offset
      });

      return {
        success: true,
        automations: response.automations.map(a => ({
          id: a.id,
          status: a.status,
          settings: a.settings,
          recipients: a.recipients,
          createTime: a.create_time
        })),
        totalItems: response.total_items
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Pause automation
   */
  async pauseAutomation(workflowId) {
    try {
      await this.client.automations.pause(workflowId);

      return {
        success: true,
        message: 'Automation paused successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Start automation
   */
  async startAutomation(workflowId) {
    try {
      await this.client.automations.start(workflowId);

      return {
        success: true,
        message: 'Automation started successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = MailchimpIntegration;
