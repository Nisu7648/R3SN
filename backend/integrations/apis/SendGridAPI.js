/**
 * SendGrid API Integration - COMPLETE IMPLEMENTATION
 * Email sending, templates, contacts, campaigns
 */

const axios = require('axios');

class SendGridAPI {
    constructor(apiKey) {
        this.apiKey = apiKey || process.env.SENDGRID_API_KEY;
        this.baseUrl = 'https://api.sendgrid.com/v3';
    }

    /**
     * Make authenticated request
     */
    async request(method, endpoint, data = null) {
        const config = {
            method,
            url: `${this.baseUrl}${endpoint}`,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            }
        };

        if (data) {
            config.data = data;
        }

        const response = await axios(config);
        return response.data;
    }

    // ============================================
    // EMAIL SENDING
    // ============================================

    /**
     * Send email
     */
    async sendEmail(to, from, subject, content, options = {}) {
        const emailData = {
            personalizations: [{
                to: Array.isArray(to) ? to.map(email => ({ email })) : [{ email: to }],
                subject
            }],
            from: typeof from === 'string' ? { email: from } : from,
            content: [{
                type: options.contentType || 'text/html',
                value: content
            }]
        };

        if (options.cc) {
            emailData.personalizations[0].cc = Array.isArray(options.cc) 
                ? options.cc.map(email => ({ email })) 
                : [{ email: options.cc }];
        }

        if (options.bcc) {
            emailData.personalizations[0].bcc = Array.isArray(options.bcc)
                ? options.bcc.map(email => ({ email }))
                : [{ email: options.bcc }];
        }

        if (options.attachments) {
            emailData.attachments = options.attachments;
        }

        if (options.replyTo) {
            emailData.reply_to = { email: options.replyTo };
        }

        return await this.request('POST', '/mail/send', emailData);
    }

    /**
     * Send bulk emails
     */
    async sendBulkEmails(emails) {
        const personalizations = emails.map(email => ({
            to: [{ email: email.to }],
            subject: email.subject,
            substitutions: email.substitutions || {}
        }));

        const emailData = {
            personalizations,
            from: emails[0].from,
            content: [{
                type: 'text/html',
                value: emails[0].content
            }]
        };

        return await this.request('POST', '/mail/send', emailData);
    }

    /**
     * Send with template
     */
    async sendWithTemplate(to, from, templateId, dynamicData = {}) {
        const emailData = {
            personalizations: [{
                to: [{ email: to }],
                dynamic_template_data: dynamicData
            }],
            from: { email: from },
            template_id: templateId
        };

        return await this.request('POST', '/mail/send', emailData);
    }

    // ============================================
    // TEMPLATES
    // ============================================

    /**
     * Create template
     */
    async createTemplate(name, generation = 'dynamic') {
        return await this.request('POST', '/templates', {
            name,
            generation
        });
    }

    /**
     * Get template
     */
    async getTemplate(templateId) {
        return await this.request('GET', `/templates/${templateId}`);
    }

    /**
     * List templates
     */
    async listTemplates(generations = 'legacy,dynamic') {
        return await this.request('GET', `/templates?generations=${generations}`);
    }

    /**
     * Update template
     */
    async updateTemplate(templateId, updates) {
        return await this.request('PATCH', `/templates/${templateId}`, updates);
    }

    /**
     * Delete template
     */
    async deleteTemplate(templateId) {
        return await this.request('DELETE', `/templates/${templateId}`);
    }

    /**
     * Create template version
     */
    async createTemplateVersion(templateId, name, subject, htmlContent, plainContent = '') {
        return await this.request('POST', `/templates/${templateId}/versions`, {
            name,
            subject,
            html_content: htmlContent,
            plain_content: plainContent,
            active: 1
        });
    }

    // ============================================
    // CONTACTS
    // ============================================

    /**
     * Add contact
     */
    async addContact(email, firstName = '', lastName = '', customFields = {}) {
        return await this.request('PUT', '/marketing/contacts', {
            contacts: [{
                email,
                first_name: firstName,
                last_name: lastName,
                custom_fields: customFields
            }]
        });
    }

    /**
     * Add multiple contacts
     */
    async addContacts(contacts) {
        return await this.request('PUT', '/marketing/contacts', {
            contacts
        });
    }

    /**
     * Get contact by email
     */
    async getContactByEmail(email) {
        return await this.request('POST', '/marketing/contacts/search', {
            query: `email LIKE '${email}'`
        });
    }

    /**
     * Delete contact
     */
    async deleteContact(contactId) {
        return await this.request('DELETE', `/marketing/contacts?ids=${contactId}`);
    }

    /**
     * Search contacts
     */
    async searchContacts(query) {
        return await this.request('POST', '/marketing/contacts/search', {
            query
        });
    }

    // ============================================
    // LISTS
    // ============================================

    /**
     * Create list
     */
    async createList(name) {
        return await this.request('POST', '/marketing/lists', { name });
    }

    /**
     * Get list
     */
    async getList(listId) {
        return await this.request('GET', `/marketing/lists/${listId}`);
    }

    /**
     * List all lists
     */
    async listLists() {
        return await this.request('GET', '/marketing/lists');
    }

    /**
     * Update list
     */
    async updateList(listId, name) {
        return await this.request('PATCH', `/marketing/lists/${listId}`, { name });
    }

    /**
     * Delete list
     */
    async deleteList(listId) {
        return await this.request('DELETE', `/marketing/lists/${listId}`);
    }

    /**
     * Add contacts to list
     */
    async addContactsToList(listId, contactIds) {
        return await this.request('POST', `/marketing/lists/${listId}/contacts`, {
            contact_ids: contactIds
        });
    }

    // ============================================
    // CAMPAIGNS
    // ============================================

    /**
     * Create campaign
     */
    async createCampaign(title, subject, senderId, listIds, htmlContent) {
        return await this.request('POST', '/marketing/singlesends', {
            name: title,
            send_to: {
                list_ids: listIds
            },
            email_config: {
                subject,
                html_content: htmlContent,
                sender_id: senderId
            }
        });
    }

    /**
     * Get campaign
     */
    async getCampaign(campaignId) {
        return await this.request('GET', `/marketing/singlesends/${campaignId}`);
    }

    /**
     * List campaigns
     */
    async listCampaigns() {
        return await this.request('GET', '/marketing/singlesends');
    }

    /**
     * Schedule campaign
     */
    async scheduleCampaign(campaignId, sendAt) {
        return await this.request('PUT', `/marketing/singlesends/${campaignId}/schedule`, {
            send_at: sendAt
        });
    }

    /**
     * Send campaign now
     */
    async sendCampaignNow(campaignId) {
        return await this.request('PUT', `/marketing/singlesends/${campaignId}/schedule`, {
            send_at: 'now'
        });
    }

    /**
     * Delete campaign
     */
    async deleteCampaign(campaignId) {
        return await this.request('DELETE', `/marketing/singlesends/${campaignId}`);
    }

    // ============================================
    // STATISTICS
    // ============================================

    /**
     * Get global stats
     */
    async getGlobalStats(startDate, endDate) {
        return await this.request('GET', `/stats?start_date=${startDate}&end_date=${endDate}`);
    }

    /**
     * Get category stats
     */
    async getCategoryStats(categories, startDate, endDate) {
        const categoriesParam = categories.join(',');
        return await this.request('GET', 
            `/categories/stats?start_date=${startDate}&end_date=${endDate}&categories=${categoriesParam}`
        );
    }

    /**
     * Get email activity
     */
    async getEmailActivity(query) {
        return await this.request('GET', `/messages?${new URLSearchParams(query).toString()}`);
    }

    // ============================================
    // SUPPRESSIONS
    // ============================================

    /**
     * Add to suppression group
     */
    async addToSuppressionGroup(groupId, emails) {
        return await this.request('POST', `/asm/groups/${groupId}/suppressions`, {
            recipient_emails: emails
        });
    }

    /**
     * Remove from suppression group
     */
    async removeFromSuppressionGroup(groupId, email) {
        return await this.request('DELETE', `/asm/groups/${groupId}/suppressions/${email}`);
    }

    /**
     * Get bounces
     */
    async getBounces(startTime = null, endTime = null) {
        const params = {};
        if (startTime) params.start_time = startTime;
        if (endTime) params.end_time = endTime;
        
        return await this.request('GET', `/suppression/bounces?${new URLSearchParams(params).toString()}`);
    }

    /**
     * Delete bounce
     */
    async deleteBounce(email) {
        return await this.request('DELETE', `/suppression/bounces/${email}`);
    }

    // ============================================
    // API KEYS
    // ============================================

    /**
     * Create API key
     */
    async createAPIKey(name, scopes = []) {
        return await this.request('POST', '/api_keys', {
            name,
            scopes
        });
    }

    /**
     * List API keys
     */
    async listAPIKeys() {
        return await this.request('GET', '/api_keys');
    }

    /**
     * Delete API key
     */
    async deleteAPIKey(keyId) {
        return await this.request('DELETE', `/api_keys/${keyId}`);
    }

    // ============================================
    // WEBHOOKS
    // ============================================

    /**
     * Create webhook
     */
    async createWebhook(url, events, enabled = true) {
        return await this.request('POST', '/user/webhooks/event/settings', {
            url,
            enabled,
            ...events
        });
    }

    /**
     * Get webhook settings
     */
    async getWebhookSettings() {
        return await this.request('GET', '/user/webhooks/event/settings');
    }

    /**
     * Update webhook
     */
    async updateWebhook(updates) {
        return await this.request('PATCH', '/user/webhooks/event/settings', updates);
    }

    /**
     * Test webhook
     */
    async testWebhook(url) {
        return await this.request('POST', '/user/webhooks/event/test', { url });
    }
}

module.exports = SendGridAPI;
