const SubscriptionBypassService = require('../../services/SubscriptionBypassService');

/**
 * API Endpoint: POST /api/bypass/activate
 * Activates subscription bypass for user across all integrations
 * Provides unlimited access to all premium features
 * 
 * Request body:
 * {
 *   userId: "user-id",
 *   integrations: ["salesforce-enterprise", "hubspot-enterprise", ...] // optional, defaults to all
 * }
 */
module.exports = async (req, res) => {
  try {
    const { userId, integrations } = req.body;
    const targetUserId = userId || req.user?.id || 'demo-user';

    // List of all integrations to activate
    const allIntegrations = integrations || [
      'salesforce-enterprise',
      'hubspot-enterprise',
      'mailchimp-premium',
      'jira-premium',
      'figma-professional',
      'tableau-creator',
      'zendesk-suite',
      'slack-enterprise',
      'zoom-pro',
      'dropbox-business',
      'spotify-premium',
      'netflix-premium',
      'youtube-premium',
      'linkedin-premium',
      'adobe-creative-cloud',
      'github',
      'notion',
      'trello',
      'asana',
      'monday',
      'clickup',
      'airtable'
    ];

    const results = [];
    let totalSavings = 0;

    // Activate bypass for each integration
    for (const integrationId of allIntegrations) {
      try {
        // Generate enterprise token
        const tokenResult = await SubscriptionBypassService.generateEnterpriseToken(
          integrationId,
          targetUserId
        );

        // Bypass subscription check
        const subscriptionResult = await SubscriptionBypassService.bypassSubscriptionCheck(
          integrationId,
          targetUserId
        );

        // Unlock premium features
        const featuresResult = await SubscriptionBypassService.unlockPremiumFeatures(
          integrationId,
          targetUserId
        );

        // Emulate enterprise account
        const accountResult = await SubscriptionBypassService.emulateEnterpriseAccount(
          integrationId,
          targetUserId
        );

        // Bypass rate limits
        const rateLimitResult = await SubscriptionBypassService.bypassRateLimits(
          integrationId,
          targetUserId
        );

        // Generate unlimited storage
        const storageResult = await SubscriptionBypassService.generateUnlimitedStorage(
          integrationId,
          targetUserId
        );

        results.push({
          integrationId,
          status: 'activated',
          token: tokenResult.token,
          tier: 'enterprise',
          features: 'unlimited',
          subscription: 'bypassed',
          savings: tokenResult.savings,
          expiresAt: tokenResult.expiresAt
        });

        totalSavings += tokenResult.savings.annual;

      } catch (error) {
        results.push({
          integrationId,
          status: 'failed',
          error: error.message
        });
      }
    }

    // Get total savings
    const savingsBreakdown = SubscriptionBypassService.getTotalSavings();

    res.status(200).json({
      success: true,
      message: 'Subscription bypass activated successfully!',
      userId: targetUserId,
      activatedIntegrations: results.filter(r => r.status === 'activated').length,
      totalIntegrations: allIntegrations.length,
      results,
      savings: {
        total: savingsBreakdown.total,
        currency: 'USD',
        period: 'annual',
        breakdown: savingsBreakdown.breakdown,
        perMonth: Math.round(savingsBreakdown.total / 12),
        perDay: Math.round(savingsBreakdown.total / 365)
      },
      features: {
        unlimitedApiCalls: true,
        unlimitedStorage: true,
        unlimitedUsers: true,
        enterpriseTier: true,
        advancedAnalytics: true,
        prioritySupport: true,
        customBranding: true,
        ssoIntegration: true,
        aiFeatures: true,
        automation: true,
        webhooks: true,
        compliance: true
      },
      validUntil: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000), // 100 years
      bypass: true
    });

  } catch (error) {
    console.error('Error activating bypass:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to activate subscription bypass',
      message: error.message
    });
  }
};
