/**
 * Integration Manager
 * Manages user-specific API connections and credentials
 */

class IntegrationManager {
    constructor() {
        // Store user integrations: userId -> { apiName -> credentials }
        this.userIntegrations = new Map();
        
        // Available integrations
        this.availableIntegrations = [
            {
                id: 'stripe',
                name: 'Stripe',
                description: 'Payment processing',
                icon: '💳',
                fields: [
                    { name: 'secretKey', label: 'Secret Key', type: 'password', required: true }
                ],
                testEndpoint: 'balance'
            },
            {
                id: 'slack',
                name: 'Slack',
                description: 'Team messaging',
                icon: '💬',
                fields: [
                    { name: 'botToken', label: 'Bot Token', type: 'password', required: true }
                ],
                testEndpoint: 'auth.test'
            },
            {
                id: 'google',
                name: 'Google',
                description: 'Gmail, Calendar, Drive, Docs, Sheets',
                icon: '📧',
                fields: [
                    { name: 'clientId', label: 'Client ID', type: 'text', required: true },
                    { name: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
                    { name: 'refreshToken', label: 'Refresh Token', type: 'password', required: true }
                ],
                testEndpoint: 'userinfo'
            },
            {
                id: 'github',
                name: 'GitHub',
                description: 'Code repositories',
                icon: '🐙',
                fields: [
                    { name: 'token', label: 'Personal Access Token', type: 'password', required: true }
                ],
                testEndpoint: 'user'
            },
            {
                id: 'twitter',
                name: 'Twitter',
                description: 'Social media',
                icon: '🐦',
                fields: [
                    { name: 'apiKey', label: 'API Key', type: 'password', required: true },
                    { name: 'apiSecret', label: 'API Secret', type: 'password', required: true },
                    { name: 'accessToken', label: 'Access Token', type: 'password', required: true },
                    { name: 'accessSecret', label: 'Access Secret', type: 'password', required: true }
                ],
                testEndpoint: 'verify_credentials'
            },
            {
                id: 'twilio',
                name: 'Twilio',
                description: 'SMS, Voice, WhatsApp',
                icon: '📱',
                fields: [
                    { name: 'accountSid', label: 'Account SID', type: 'text', required: true },
                    { name: 'authToken', label: 'Auth Token', type: 'password', required: true }
                ],
                testEndpoint: 'accounts'
            },
            {
                id: 'sendgrid',
                name: 'SendGrid',
                description: 'Email delivery',
                icon: '✉️',
                fields: [
                    { name: 'apiKey', label: 'API Key', type: 'password', required: true }
                ],
                testEndpoint: 'user/profile'
            },
            {
                id: 'notion',
                name: 'Notion',
                description: 'Workspace & docs',
                icon: '📝',
                fields: [
                    { name: 'token', label: 'Integration Token', type: 'password', required: true }
                ],
                testEndpoint: 'users/me'
            },
            {
                id: 'openai',
                name: 'OpenAI',
                description: 'AI models',
                icon: '🤖',
                fields: [
                    { name: 'apiKey', label: 'API Key', type: 'password', required: true }
                ],
                testEndpoint: 'models'
            },
            {
                id: 'shopify',
                name: 'Shopify',
                description: 'E-commerce',
                icon: '🛍️',
                fields: [
                    { name: 'shopName', label: 'Shop Name', type: 'text', required: true },
                    { name: 'accessToken', label: 'Access Token', type: 'password', required: true }
                ],
                testEndpoint: 'shop'
            },
            {
                id: 'discord',
                name: 'Discord',
                description: 'Community chat',
                icon: '🎮',
                fields: [
                    { name: 'botToken', label: 'Bot Token', type: 'password', required: true }
                ],
                testEndpoint: 'users/@me'
            },
            {
                id: 'zoom',
                name: 'Zoom',
                description: 'Video meetings',
                icon: '📹',
                fields: [
                    { name: 'accountId', label: 'Account ID', type: 'text', required: true },
                    { name: 'clientId', label: 'Client ID', type: 'text', required: true },
                    { name: 'clientSecret', label: 'Client Secret', type: 'password', required: true }
                ],
                testEndpoint: 'users/me'
            }
        ];
    }

    /**
     * Get all available integrations
     */
    getAvailableIntegrations() {
        return this.availableIntegrations;
    }

    /**
     * Get user's connected integrations
     */
    getUserIntegrations(userId) {
        const userIntegrations = this.userIntegrations.get(userId) || {};
        
        return this.availableIntegrations.map(integration => {
            const connected = userIntegrations[integration.id];
            
            return {
                ...integration,
                connected: !!connected,
                connectedAt: connected?.connectedAt,
                status: connected?.status || 'disconnected'
            };
        });
    }

    /**
     * Connect an integration for a user
     */
    async connectIntegration(userId, integrationId, credentials) {
        // Get integration config
        const integration = this.availableIntegrations.find(i => i.id === integrationId);
        
        if (!integration) {
            throw new Error('Integration not found');
        }

        // Validate required fields
        for (const field of integration.fields) {
            if (field.required && !credentials[field.name]) {
                throw new Error(`${field.label} is required`);
            }
        }

        // Test connection
        const testResult = await this.testConnection(integrationId, credentials);
        
        if (!testResult.success) {
            throw new Error(`Connection test failed: ${testResult.error}`);
        }

        // Store credentials
        if (!this.userIntegrations.has(userId)) {
            this.userIntegrations.set(userId, {});
        }

        const userIntegrations = this.userIntegrations.get(userId);
        userIntegrations[integrationId] = {
            credentials,
            connectedAt: new Date(),
            status: 'connected',
            testResult
        };

        return {
            success: true,
            message: `${integration.name} connected successfully`,
            integration: {
                id: integrationId,
                name: integration.name,
                connected: true,
                connectedAt: new Date()
            }
        };
    }

    /**
     * Disconnect an integration
     */
    disconnectIntegration(userId, integrationId) {
        const userIntegrations = this.userIntegrations.get(userId);
        
        if (!userIntegrations || !userIntegrations[integrationId]) {
            throw new Error('Integration not connected');
        }

        delete userIntegrations[integrationId];

        const integration = this.availableIntegrations.find(i => i.id === integrationId);

        return {
            success: true,
            message: `${integration.name} disconnected successfully`
        };
    }

    /**
     * Get credentials for a specific integration
     */
    getCredentials(userId, integrationId) {
        const userIntegrations = this.userIntegrations.get(userId);
        
        if (!userIntegrations || !userIntegrations[integrationId]) {
            return null;
        }

        return userIntegrations[integrationId].credentials;
    }

    /**
     * Map credentials to API constructor parameters
     */
    mapCredentialsToConstructor(integrationId, credentials) {
        const credentialMappings = {
            'stripe': credentials.secretKey,
            'slack': credentials.botToken,
            'google': {
                clientId: credentials.clientId,
                clientSecret: credentials.clientSecret,
                refreshToken: credentials.refreshToken
            },
            'github': credentials.token,
            'twitter': {
                apiKey: credentials.apiKey,
                apiSecret: credentials.apiSecret,
                accessToken: credentials.accessToken,
                accessSecret: credentials.accessSecret
            },
            'twilio': {
                accountSid: credentials.accountSid,
                authToken: credentials.authToken
            },
            'sendgrid': credentials.apiKey,
            'notion': credentials.token,
            'openai': credentials.apiKey,
            'shopify': {
                shopName: credentials.shopName,
                accessToken: credentials.accessToken
            },
            'discord': credentials.botToken,
            'zoom': {
                accountId: credentials.accountId,
                clientId: credentials.clientId,
                clientSecret: credentials.clientSecret
            }
        };

        return credentialMappings[integrationId];
    }

    /**
     * Test connection to an integration
     */
    async testConnection(integrationId, credentials) {
        try {
            // Import the appropriate API class
            const APIClass = this.getAPIClass(integrationId);
            
            if (!APIClass) {
                return { success: false, error: 'API class not found' };
            }

            // Map credentials to constructor format
            const constructorParams = this.mapCredentialsToConstructor(integrationId, credentials);

            // Create instance with credentials
            const api = new APIClass(constructorParams);

            // Test based on integration type
            let testResult;
            
            switch (integrationId) {
                case 'stripe':
                    testResult = await api.getBalance();
                    break;
                case 'slack':
                    testResult = await api.testAuth();
                    break;
                case 'google':
                    testResult = await api.getUserInfo();
                    break;
                case 'github':
                    testResult = await api.getUser();
                    break;
                case 'twitter':
                    testResult = await api.verifyCredentials();
                    break;
                case 'twilio':
                    testResult = await api.getAccount();
                    break;
                case 'sendgrid':
                    testResult = await api.getProfile();
                    break;
                case 'notion':
                    testResult = await api.getMe();
                    break;
                case 'openai':
                    testResult = await api.listModels();
                    break;
                case 'shopify':
                    testResult = await api.getShop();
                    break;
                case 'discord':
                    testResult = await api.getMe();
                    break;
                case 'zoom':
                    testResult = await api.getMe();
                    break;
                default:
                    return { success: false, error: 'Unknown integration' };
            }

            return { success: true, data: testResult };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get API class for integration
     */
    getAPIClass(integrationId) {
        try {
            const apiMap = {
                'stripe': require('../integrations/apis/StripeAPI'),
                'slack': require('../integrations/apis/SlackAPI'),
                'google': require('../integrations/apis/GoogleAPI'),
                'github': require('../integrations/apis/GitHubAPI'),
                'twitter': require('../integrations/apis/TwitterAPI'),
                'twilio': require('../integrations/apis/TwilioAPI'),
                'sendgrid': require('../integrations/apis/SendGridAPI'),
                'notion': require('../integrations/apis/NotionAPI'),
                'openai': require('../integrations/apis/OpenAIAPI'),
                'shopify': require('../integrations/apis/ShopifyAPI'),
                'discord': require('../integrations/apis/DiscordAPI'),
                'zoom': require('../integrations/apis/ZoomAPI')
            };

            return apiMap[integrationId];
        } catch (error) {
            console.error(`Error loading API class for ${integrationId}:`, error.message);
            return null;
        }
    }

    /**
     * Get API instance for user
     */
    getAPIInstance(userId, integrationId) {
        const credentials = this.getCredentials(userId, integrationId);
        
        if (!credentials) {
            throw new Error(`${integrationId} not connected. Please connect it first.`);
        }

        const APIClass = this.getAPIClass(integrationId);
        
        if (!APIClass) {
            throw new Error(`API class not found for ${integrationId}`);
        }

        // Map credentials to constructor format
        const constructorParams = this.mapCredentialsToConstructor(integrationId, credentials);

        return new APIClass(constructorParams);
    }

    /**
     * Update integration credentials
     */
    async updateIntegration(userId, integrationId, credentials) {
        // Test new credentials
        const testResult = await this.testConnection(integrationId, credentials);
        
        if (!testResult.success) {
            throw new Error(`Connection test failed: ${testResult.error}`);
        }

        const userIntegrations = this.userIntegrations.get(userId);
        
        if (!userIntegrations || !userIntegrations[integrationId]) {
            throw new Error('Integration not connected');
        }

        userIntegrations[integrationId].credentials = credentials;
        userIntegrations[integrationId].updatedAt = new Date();
        userIntegrations[integrationId].testResult = testResult;

        const integration = this.availableIntegrations.find(i => i.id === integrationId);

        return {
            success: true,
            message: `${integration.name} updated successfully`
        };
    }

    /**
     * Get integration status
     */
    getIntegrationStatus(userId, integrationId) {
        const userIntegrations = this.userIntegrations.get(userId);
        
        if (!userIntegrations || !userIntegrations[integrationId]) {
            return {
                connected: false,
                status: 'disconnected'
            };
        }

        const integration = userIntegrations[integrationId];

        return {
            connected: true,
            status: integration.status,
            connectedAt: integration.connectedAt,
            updatedAt: integration.updatedAt
        };
    }

    /**
     * Bulk connect integrations
     */
    async bulkConnect(userId, integrations) {
        const results = [];

        for (const { integrationId, credentials } of integrations) {
            try {
                const result = await this.connectIntegration(userId, integrationId, credentials);
                results.push({ integrationId, ...result });
            } catch (error) {
                results.push({
                    integrationId,
                    success: false,
                    error: error.message
                });
            }
        }

        return {
            success: true,
            results,
            connected: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length
        };
    }
}

module.exports = IntegrationManager;
