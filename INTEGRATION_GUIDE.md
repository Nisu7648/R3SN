# 🔌 R3SN Integration Guide

## ✅ **USER-SPECIFIC API CONNECTIONS COMPLETE!**

All 12 built-in APIs are now connected to your user account. Each user can connect their own API keys and credentials securely.

---

## 🎯 **What's New**

### **✅ IntegrationManager System**
- User-specific API credentials
- Secure credential storage
- Connection testing
- Status monitoring

### **✅ Integration UI**
- Beautiful integrations page
- Connect/disconnect APIs
- Test connections
- Manage credentials

### **✅ 12 Available Integrations**
1. **Stripe** 💳 - Payment processing
2. **Slack** 💬 - Team messaging
3. **Google** 📧 - Gmail, Calendar, Drive, Docs, Sheets
4. **GitHub** 🐙 - Code repositories
5. **Twitter** 🐦 - Social media
6. **Twilio** 📱 - SMS, Voice, WhatsApp
7. **SendGrid** ✉️ - Email delivery
8. **Notion** 📝 - Workspace & docs
9. **OpenAI** 🤖 - AI models
10. **Shopify** 🛍️ - E-commerce
11. **Discord** 🎮 - Community chat
12. **Zoom** 📹 - Video meetings

---

## 🚀 **How to Connect Integrations**

### **Step 1: Access Integrations Page**
```
1. Login to R3SN
2. Click "🔌 Integrations" button in header
   OR
   Click "Manage Integrations" in sidebar
```

### **Step 2: Connect an API**
```
1. Click on any integration card
2. Enter your API credentials
3. Click "Test Connection" (optional)
4. Click "Connect"
```

### **Step 3: Use in Natural Language**
```
Once connected, just chat:
"Send a Slack message to #general saying Hello!"
"Create a GitHub issue in my repo"
"Send an email via SendGrid"
```

---

## 📋 **Integration Details**

### **1. Stripe**
**What you need:**
- Secret Key (from Stripe Dashboard)

**Where to get it:**
1. Go to https://dashboard.stripe.com
2. Click "Developers" → "API keys"
3. Copy "Secret key"

**Example usage:**
```
"Create a Stripe payment for $50"
"Get my Stripe balance"
"List recent Stripe transactions"
```

---

### **2. Slack**
**What you need:**
- Bot Token (starts with `xoxb-`)

**Where to get it:**
1. Go to https://api.slack.com/apps
2. Create a new app or select existing
3. Go to "OAuth & Permissions"
4. Copy "Bot User OAuth Token"

**Example usage:**
```
"Send a Slack message to #general"
"Post to Slack channel #announcements"
"Get Slack channel list"
```

---

### **3. Google**
**What you need:**
- Client ID
- Client Secret
- Refresh Token

**Where to get it:**
1. Go to https://console.cloud.google.com
2. Create OAuth 2.0 credentials
3. Get refresh token using OAuth flow

**Example usage:**
```
"Send an email via Gmail"
"Create a Google Calendar event"
"Upload file to Google Drive"
"Create a Google Doc"
```

---

### **4. GitHub**
**What you need:**
- Personal Access Token

**Where to get it:**
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: repo, user, admin:org
4. Copy the token

**Example usage:**
```
"Create a GitHub issue"
"List my GitHub repos"
"Create a pull request"
```

---

### **5. Twitter**
**What you need:**
- API Key
- API Secret
- Access Token
- Access Secret

**Where to get it:**
1. Go to https://developer.twitter.com
2. Create an app
3. Go to "Keys and tokens"
4. Copy all 4 credentials

**Example usage:**
```
"Post a tweet"
"Get my Twitter timeline"
"Search tweets about AI"
```

---

### **6. Twilio**
**What you need:**
- Account SID
- Auth Token

**Where to get it:**
1. Go to https://console.twilio.com
2. Copy Account SID and Auth Token from dashboard

**Example usage:**
```
"Send SMS to +1234567890"
"Make a voice call"
"Send WhatsApp message"
```

---

### **7. SendGrid**
**What you need:**
- API Key

**Where to get it:**
1. Go to https://app.sendgrid.com
2. Settings → API Keys
3. Create API Key with "Full Access"

**Example usage:**
```
"Send email via SendGrid"
"Get SendGrid stats"
"List email templates"
```

---

### **8. Notion**
**What you need:**
- Integration Token

**Where to get it:**
1. Go to https://www.notion.so/my-integrations
2. Create new integration
3. Copy "Internal Integration Token"

**Example usage:**
```
"Create a Notion page"
"Search Notion database"
"Update Notion page"
```

---

### **9. OpenAI**
**What you need:**
- API Key

**Where to get it:**
1. Go to https://platform.openai.com/api-keys
2. Create new secret key
3. Copy the key

**Example usage:**
```
"Generate text with GPT-4"
"Create an image with DALL-E"
"Get embeddings"
```

---

### **10. Shopify**
**What you need:**
- Shop Name (e.g., "mystore")
- Access Token

**Where to get it:**
1. Go to Shopify Admin
2. Apps → Develop apps
3. Create app and get Admin API access token

**Example usage:**
```
"List Shopify products"
"Create a product"
"Get order details"
```

---

### **11. Discord**
**What you need:**
- Bot Token

**Where to get it:**
1. Go to https://discord.com/developers/applications
2. Create application
3. Bot → Copy token

**Example usage:**
```
"Send Discord message"
"Create Discord channel"
"Get server info"
```

---

### **12. Zoom**
**What you need:**
- Account ID
- Client ID
- Client Secret

**Where to get it:**
1. Go to https://marketplace.zoom.us
2. Develop → Build App
3. Create Server-to-Server OAuth app
4. Copy credentials

**Example usage:**
```
"Create Zoom meeting"
"List upcoming meetings"
"Get meeting details"
```

---

## 💡 **Usage Examples**

### **After Connecting APIs**

**Example 1: Multi-API Workflow**
```
You: "When someone stars my GitHub repo, send me a Slack notification and create a Notion page"

AI: ✅ Workflow created! I'll monitor your GitHub repo and notify you on Slack + Notion.
```

**Example 2: E-commerce Automation**
```
You: "When a Shopify order comes in, send confirmation email via SendGrid and create invoice in Stripe"

AI: ✅ Automation created! Orders will be processed automatically.
```

**Example 3: Social Media**
```
You: "Post my blog article to Twitter and LinkedIn"

AI: ✅ Posted to both platforms!
```

---

## 🔒 **Security**

### **How Credentials are Stored**
- ✅ Stored per-user (isolated)
- ✅ Never shared between users
- ✅ Encrypted in memory
- ✅ Not logged or exposed

### **Best Practices**
1. ✅ Use API keys with minimal permissions
2. ✅ Rotate keys regularly
3. ✅ Disconnect unused integrations
4. ✅ Test connections before using

---

## 🎯 **API Endpoints**

### **Get Available Integrations**
```bash
GET /api/integrations/available
Authorization: Bearer <token>
```

### **Get Connected Integrations**
```bash
GET /api/integrations/connected
Authorization: Bearer <token>
```

### **Connect Integration**
```bash
POST /api/integrations/connect
Authorization: Bearer <token>
Content-Type: application/json

{
  "integrationId": "stripe",
  "credentials": {
    "secretKey": "sk_test_..."
  }
}
```

### **Disconnect Integration**
```bash
POST /api/integrations/disconnect
Authorization: Bearer <token>
Content-Type: application/json

{
  "integrationId": "stripe"
}
```

### **Test Connection**
```bash
POST /api/integrations/test
Authorization: Bearer <token>
Content-Type: application/json

{
  "integrationId": "stripe",
  "credentials": {
    "secretKey": "sk_test_..."
  }
}
```

### **Execute Integration Action**
```bash
POST /api/integrations/execute/stripe
Authorization: Bearer <token>
Content-Type: application/json

{
  "action": "getBalance",
  "params": {}
}
```

---

## 📊 **System Architecture**

```
User Login
    ↓
IntegrationManager
    ↓
User-Specific Credentials
    ↓
API Instance Creation
    ↓
Execute Actions
```

### **Flow**
1. User logs in
2. User connects APIs with their credentials
3. Credentials stored per-user
4. When user requests action, system:
   - Gets user's credentials
   - Creates API instance
   - Executes action
   - Returns result

---

## 🎉 **What This Enables**

### **Before**
- ❌ Shared API keys (security risk)
- ❌ Manual API configuration
- ❌ No per-user isolation
- ❌ Hard to manage

### **After**
- ✅ User-specific credentials
- ✅ Easy connection via UI
- ✅ Complete isolation
- ✅ Test before connecting
- ✅ Manage all in one place

---

## 🚀 **Next Steps**

1. ✅ Login to R3SN
2. ✅ Click "Integrations" button
3. ✅ Connect your APIs
4. ✅ Start using in natural language!

---

**🎉 ALL INTEGRATIONS ARE NOW USER-SPECIFIC! 🎉**

**Each user can connect their own API keys securely!**
