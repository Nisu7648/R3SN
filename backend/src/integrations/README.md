# 🔌 R3SN Backend Integrations

## Real Working API Integrations

All integrations in this folder are **REAL, PRODUCTION-READY** implementations using actual APIs.

---

## 📁 Structure

Each integration follows this structure:
```
integration-name/
├── index.js          # Main integration class
└── metadata.json     # Integration metadata & config
```

---

## ✅ Available Integrations (5)

### 1. **Twitter/X** 🐦
- **File**: `twitter/index.js`
- **API**: Twitter API v2
- **Auth**: Bearer Token
- **Actions**: 9 actions
  - Post tweets
  - Search tweets
  - Get user info
  - Get timeline
  - Delete tweets
  - Like tweets
  - Retweet
  - Get followers
  - Get following

### 2. **GitHub** 🐙
- **File**: `github/index.js`
- **API**: GitHub REST API v3
- **Auth**: Personal Access Token
- **Actions**: 12 actions
  - Create/get/list repositories
  - Create/list/close issues
  - Comment on issues
  - Create/merge pull requests
  - Create releases
  - Get commits
  - Create branches

### 3. **Stripe** 💳
- **File**: `stripe/index.js`
- **API**: Stripe Payment API
- **Auth**: Secret Key (sk_...)
- **Actions**: 11 actions
  - Create payment intents
  - Manage customers
  - Create/cancel subscriptions
  - Create invoices
  - List charges
  - Refund payments
  - Create products/prices

### 4. **Slack** 💬
- **File**: `slack/index.js`
- **API**: Slack Web API
- **Auth**: Bot Token (xoxb-...)
- **Actions**: 6+ actions
  - Send messages
  - Get channels
  - Get user info
  - Upload files
  - Create channels
  - Invite users

### 5. **Discord** 🎮
- **File**: `discord/index.js`
- **API**: Discord API v10
- **Auth**: Bot Token
- **Actions**: Multiple actions
  - Send messages
  - Manage channels
  - Server management

---

## 🔧 How to Use

### 1. Create Integration Instance

```javascript
const TwitterIntegration = require('./integrations/twitter');

const twitter = new TwitterIntegration({
  bearerToken: 'YOUR_BEARER_TOKEN'
});
```

### 2. Execute Actions

```javascript
// Post a tweet
const result = await twitter.execute('postTweet', {
  text: 'Hello from R3SN! 🚀'
});

console.log(result);
// {
//   success: true,
//   data: {
//     id: '1234567890',
//     text: 'Hello from R3SN! 🚀'
//   }
// }
```

### 3. Handle Errors

```javascript
try {
  const result = await twitter.execute('postTweet', {
    text: 'My tweet'
  });
} catch (error) {
  console.error('Error:', error.message);
}
```

---

## 📝 Integration Class Structure

All integrations follow this pattern:

```javascript
class IntegrationName {
  constructor(config) {
    this.config = config;
    this.validateConfig();
  }

  validateConfig() {
    // Validate required config
  }

  async execute(action, params) {
    // Route to action methods
  }

  async actionMethod(params) {
    // Implement action
    return {
      success: true,
      data: { ... }
    };
  }
}
```

---

## 🔑 Getting API Keys

### Twitter
1. Go to https://developer.twitter.com/
2. Create a new app
3. Generate Bearer Token
4. Copy token (starts with `AAAAAAA...`)

### GitHub
1. Go to GitHub Settings
2. Developer settings → Personal access tokens
3. Generate new token (classic)
4. Select scopes: `repo`, `user`, `admin:org`
5. Copy token (starts with `ghp_...`)

### Stripe
1. Go to https://dashboard.stripe.com/
2. Developers → API keys
3. Copy Secret key (starts with `sk_test_...` or `sk_live_...`)

### Slack
1. Go to https://api.slack.com/apps
2. Create new app
3. Install app to workspace
4. Copy Bot User OAuth Token (starts with `xoxb-...`)

### Discord
1. Go to https://discord.com/developers/applications
2. Create new application
3. Bot → Add Bot
4. Copy token

---

## 🧪 Testing Integrations

```javascript
// Test Twitter
const twitter = new TwitterIntegration({
  bearerToken: process.env.TWITTER_BEARER_TOKEN
});

const result = await twitter.execute('searchTweets', {
  query: 'nodejs',
  maxResults: 10
});

console.log(`Found ${result.data.length} tweets`);
```

---

## 📊 Response Format

All integrations return consistent response format:

```javascript
{
  success: true,      // Boolean
  data: { ... }       // Result data
}
```

On error, they throw:
```javascript
throw new Error('API error: message');
```

---

## 🔒 Security

- **Never commit API keys** to version control
- Use environment variables: `process.env.API_KEY`
- Store keys in `.env` file (add to `.gitignore`)
- Use different keys for dev/prod

---

## 📚 Documentation Links

- **Twitter**: https://developer.twitter.com/en/docs/twitter-api
- **GitHub**: https://docs.github.com/en/rest
- **Stripe**: https://stripe.com/docs/api
- **Slack**: https://api.slack.com/
- **Discord**: https://discord.com/developers/docs

---

## 🚀 Adding New Integrations

1. Create folder: `backend/src/integrations/service-name/`
2. Create `index.js` with integration class
3. Create `metadata.json` with config
4. Follow existing patterns
5. Test thoroughly
6. Update this README

---

## ✅ Integration Checklist

- [ ] Real API implementation (no mocks)
- [ ] Proper authentication
- [ ] Error handling
- [ ] Consistent response format
- [ ] Config validation
- [ ] Multiple actions
- [ ] Documentation
- [ ] Metadata file
- [ ] Tests

---

<div align="center">

## 🎉 5 Real Integrations Ready!

**Twitter • GitHub • Stripe • Slack • Discord**

All tested and production-ready!

</div>
