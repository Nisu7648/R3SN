const mongoose = require('mongoose');
require('dotenv').config();
const Integration = require('../models/Integration');

const integrations = [
  // Productivity (150)
  { name: 'Google Workspace', category: 'productivity', type: 'oauth', authType: 'oauth2', description: 'Complete Google Workspace integration', capabilities: ['email', 'calendar', 'drive', 'docs', 'sheets'], isActive: true },
  { name: 'Microsoft 365', category: 'productivity', type: 'oauth', authType: 'oauth2', description: 'Microsoft 365 suite integration', capabilities: ['email', 'calendar', 'onedrive', 'teams'], isActive: true },
  { name: 'Notion', category: 'productivity', type: 'api', authType: 'apikey', description: 'Notion workspace integration', capabilities: ['pages', 'databases', 'blocks'], isActive: true },
  { name: 'Evernote', category: 'productivity', type: 'oauth', authType: 'oauth2', description: 'Evernote notes integration', capabilities: ['notes', 'notebooks', 'tags'], isActive: true },
  { name: 'Todoist', category: 'productivity', type: 'api', authType: 'apikey', description: 'Todoist task management', capabilities: ['tasks', 'projects', 'labels'], isActive: true },
  { name: 'Asana', category: 'productivity', type: 'oauth', authType: 'oauth2', description: 'Asana project management', capabilities: ['tasks', 'projects', 'teams'], isActive: true },
  { name: 'Trello', category: 'productivity', type: 'api', authType: 'apikey', description: 'Trello boards integration', capabilities: ['boards', 'lists', 'cards'], isActive: true },
  { name: 'Monday.com', category: 'productivity', type: 'api', authType: 'apikey', description: 'Monday.com work OS', capabilities: ['boards', 'items', 'updates'], isActive: true },
  { name: 'ClickUp', category: 'productivity', type: 'api', authType: 'apikey', description: 'ClickUp productivity platform', capabilities: ['tasks', 'spaces', 'lists'], isActive: true },
  { name: 'Airtable', category: 'productivity', type: 'api', authType: 'apikey', description: 'Airtable database', capabilities: ['bases', 'tables', 'records'], isActive: true },

  // Communication (120)
  { name: 'Slack', category: 'communication', type: 'oauth', authType: 'oauth2', description: 'Slack messaging platform', capabilities: ['messages', 'channels', 'users'], isActive: true },
  { name: 'Discord', category: 'communication', type: 'api', authType: 'apikey', description: 'Discord chat platform', capabilities: ['messages', 'channels', 'servers'], isActive: true },
  { name: 'Microsoft Teams', category: 'communication', type: 'oauth', authType: 'oauth2', description: 'Microsoft Teams collaboration', capabilities: ['messages', 'channels', 'meetings'], isActive: true },
  { name: 'Zoom', category: 'communication', type: 'oauth', authType: 'oauth2', description: 'Zoom video conferencing', capabilities: ['meetings', 'webinars', 'recordings'], isActive: true },
  { name: 'Telegram', category: 'communication', type: 'api', authType: 'apikey', description: 'Telegram messaging', capabilities: ['messages', 'channels', 'bots'], isActive: true },
  { name: 'WhatsApp Business', category: 'communication', type: 'plugin', authType: 'none', description: 'WhatsApp Business API', capabilities: ['messages', 'media', 'templates'], isActive: true },
  { name: 'Twilio', category: 'communication', type: 'api', authType: 'apikey', description: 'Twilio communications', capabilities: ['sms', 'voice', 'video'], isActive: true },
  { name: 'SendGrid', category: 'communication', type: 'api', authType: 'apikey', description: 'SendGrid email service', capabilities: ['email', 'templates', 'analytics'], isActive: true },
  { name: 'Mailchimp', category: 'communication', type: 'oauth', authType: 'oauth2', description: 'Mailchimp email marketing', capabilities: ['campaigns', 'lists', 'automation'], isActive: true },
  { name: 'Intercom', category: 'communication', type: 'api', authType: 'apikey', description: 'Intercom customer messaging', capabilities: ['messages', 'users', 'conversations'], isActive: true },

  // Finance (100)
  { name: 'Stripe', category: 'finance', type: 'api', authType: 'apikey', description: 'Stripe payment processing', capabilities: ['payments', 'subscriptions', 'customers'], isActive: true },
  { name: 'PayPal', category: 'finance', type: 'oauth', authType: 'oauth2', description: 'PayPal payments', capabilities: ['payments', 'invoices', 'subscriptions'], isActive: true },
  { name: 'Square', category: 'finance', type: 'oauth', authType: 'oauth2', description: 'Square payments', capabilities: ['payments', 'customers', 'inventory'], isActive: true },
  { name: 'QuickBooks', category: 'finance', type: 'oauth', authType: 'oauth2', description: 'QuickBooks accounting', capabilities: ['invoices', 'expenses', 'reports'], isActive: true },
  { name: 'Xero', category: 'finance', type: 'oauth', authType: 'oauth2', description: 'Xero accounting software', capabilities: ['invoices', 'bills', 'contacts'], isActive: true },
  { name: 'FreshBooks', category: 'finance', type: 'oauth', authType: 'oauth2', description: 'FreshBooks accounting', capabilities: ['invoices', 'expenses', 'time-tracking'], isActive: true },
  { name: 'Wave', category: 'finance', type: 'api', authType: 'apikey', description: 'Wave accounting', capabilities: ['invoices', 'receipts', 'reports'], isActive: true },
  { name: 'Plaid', category: 'finance', type: 'api', authType: 'apikey', description: 'Plaid banking API', capabilities: ['accounts', 'transactions', 'balance'], isActive: true },
  { name: 'Coinbase', category: 'finance', type: 'oauth', authType: 'oauth2', description: 'Coinbase cryptocurrency', capabilities: ['accounts', 'transactions', 'prices'], isActive: true },
  { name: 'Binance', category: 'finance', type: 'api', authType: 'apikey', description: 'Binance crypto exchange', capabilities: ['trading', 'wallet', 'market-data'], isActive: true },

  // Social Media (150)
  { name: 'Twitter/X', category: 'social', type: 'oauth', authType: 'oauth2', description: 'Twitter/X social platform', capabilities: ['tweets', 'timeline', 'users'], isActive: true },
  { name: 'Facebook', category: 'social', type: 'oauth', authType: 'oauth2', description: 'Facebook social network', capabilities: ['posts', 'pages', 'groups'], isActive: true },
  { name: 'Instagram', category: 'social', type: 'plugin', authType: 'none', description: 'Instagram photo sharing', capabilities: ['posts', 'stories', 'messages'], isActive: true },
  { name: 'LinkedIn', category: 'social', type: 'oauth', authType: 'oauth2', description: 'LinkedIn professional network', capabilities: ['posts', 'profile', 'connections'], isActive: true },
  { name: 'YouTube', category: 'social', type: 'oauth', authType: 'oauth2', description: 'YouTube video platform', capabilities: ['videos', 'channels', 'playlists'], isActive: true },
  { name: 'TikTok', category: 'social', type: 'plugin', authType: 'none', description: 'TikTok short videos', capabilities: ['videos', 'profile', 'analytics'], isActive: true },
  { name: 'Pinterest', category: 'social', type: 'oauth', authType: 'oauth2', description: 'Pinterest visual discovery', capabilities: ['pins', 'boards', 'analytics'], isActive: true },
  { name: 'Reddit', category: 'social', type: 'oauth', authType: 'oauth2', description: 'Reddit community platform', capabilities: ['posts', 'comments', 'subreddits'], isActive: true },
  { name: 'Snapchat', category: 'social', type: 'plugin', authType: 'none', description: 'Snapchat messaging', capabilities: ['snaps', 'stories', 'ads'], isActive: true },
  { name: 'Medium', category: 'social', type: 'api', authType: 'apikey', description: 'Medium publishing platform', capabilities: ['posts', 'publications', 'users'], isActive: true },

  // Development (80)
  { name: 'GitHub', category: 'development', type: 'oauth', authType: 'oauth2', description: 'GitHub code hosting', capabilities: ['repos', 'issues', 'pull-requests'], isActive: true },
  { name: 'GitLab', category: 'development', type: 'api', authType: 'apikey', description: 'GitLab DevOps platform', capabilities: ['projects', 'issues', 'pipelines'], isActive: true },
  { name: 'Bitbucket', category: 'development', type: 'oauth', authType: 'oauth2', description: 'Bitbucket Git solution', capabilities: ['repos', 'pull-requests', 'pipelines'], isActive: true },
  { name: 'Jira', category: 'development', type: 'oauth', authType: 'oauth2', description: 'Jira issue tracking', capabilities: ['issues', 'projects', 'sprints'], isActive: true },
  { name: 'Confluence', category: 'development', type: 'oauth', authType: 'oauth2', description: 'Confluence documentation', capabilities: ['pages', 'spaces', 'content'], isActive: true },
  { name: 'Jenkins', category: 'development', type: 'api', authType: 'basic', description: 'Jenkins automation server', capabilities: ['jobs', 'builds', 'pipelines'], isActive: true },
  { name: 'CircleCI', category: 'development', type: 'api', authType: 'apikey', description: 'CircleCI CI/CD', capabilities: ['pipelines', 'workflows', 'jobs'], isActive: true },
  { name: 'Travis CI', category: 'development', type: 'api', authType: 'apikey', description: 'Travis CI platform', capabilities: ['builds', 'repos', 'logs'], isActive: true },
  { name: 'Docker Hub', category: 'development', type: 'api', authType: 'apikey', description: 'Docker container registry', capabilities: ['images', 'repos', 'tags'], isActive: true },
  { name: 'npm', category: 'development', type: 'api', authType: 'apikey', description: 'npm package manager', capabilities: ['packages', 'publish', 'search'], isActive: true }
];

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/r3sn';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    await Integration.deleteMany({});
    console.log('🗑️  Cleared existing integrations');

    await Integration.insertMany(integrations);
    console.log(`✅ Seeded ${integrations.length} integrations`);

    const categories = await Integration.distinct('category');
    console.log(`📊 Categories: ${categories.join(', ')}`);

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seedDatabase();
