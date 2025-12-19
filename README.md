# 🚀 R3SN - AI-Powered Automation Platform

**Build APIs, Plugins, and Workflows using Natural Language**

R3SN is a revolutionary platform that lets you create integrations, automate workflows, and build custom APIs just by describing what you want in plain text - no coding required!

---

## ✨ Features

### 🤖 Natural Language Interface
- Chat with AI to build anything
- Ask questions and get instant answers
- Execute workflows with simple commands

### 🔌 Dynamic API Builder
- Build ANY API from text descriptions
- Support for REST, GraphQL, SOAP
- All authentication types (API Key, Bearer, OAuth2, Basic)
- Import from OpenAPI/Swagger specs
- Export generated code

### 🛠️ Plugin Maker
- Create custom plugins from descriptions
- Multi-step actions and workflows
- Conditional logic and error handling
- Execute on demand or schedule

### ⚡ Workflow Engine
- Build complex workflows
- Sequential and parallel execution
- Triggers (schedule, webhook, event)
- Error recovery and retry logic

### 🔐 Complete Authentication
- User registration and login
- Secure session management
- Token-based authentication

### 📱 Responsive UI
- Works on desktop, tablet, and mobile
- Dark theme optimized for long sessions
- Real-time chat interface

---

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ installed
- OpenAI API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Nisu7648/R3SN.git
cd R3SN
```

2. **Install dependencies**
```bash
cd backend
npm install
```

3. **Set environment variables**
```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

4. **Start the server**
```bash
npm start
```

5. **Open your browser**
```
http://localhost:3000
```

### Default Login
```
Email: admin@r3sn.com
Password: admin123
```

---

## 💡 Usage Examples

### Build an API
```
"Create an API for JSONPlaceholder at https://jsonplaceholder.typicode.com. 
No auth needed. Endpoints: get posts, create post, update post, delete post."
```

### Create a Plugin
```
"Create a plugin that monitors GitHub repos for new issues, 
checks if they contain 'bug', creates a Notion page for each bug, 
and sends a Slack notification."
```

### Build a Workflow
```
"Create a workflow that runs daily at 9 AM. 
It fetches sales data from Shopify, calculates total revenue, 
generates a PDF report, and emails it to admin@company.com."
```

### Ask Questions
```
"How do I execute my API?"
"Show me all my workflows"
"What can you help me with?"
```

---

## 📁 Project Structure

```
R3SN/
├── frontend/              # Web UI
│   ├── index.html        # Main HTML
│   ├── styles.css        # Responsive CSS
│   └── app.js            # Frontend logic
│
├── backend/              # Server
│   ├── server.js         # Main server
│   ├── auth/             # Authentication
│   │   ├── AuthSystem.js
│   │   └── OAuth2Handler.js
│   ├── core/             # Core systems
│   │   ├── NaturalLanguageProcessor.js
│   │   ├── DynamicAPIBuilder.js
│   │   └── PluginMaker.js
│   ├── integrations/     # API integrations
│   │   ├── APIManager.js
│   │   └── apis/         # Individual APIs
│   └── routes/           # API routes
│
└── android/              # Android app (optional)
```

---

## 🔧 Configuration

### Environment Variables

```env
# OpenAI (Required)
OPENAI_API_KEY=sk-...

# Server
PORT=3000

# Optional API Keys
STRIPE_SECRET_KEY=sk_test_...
SLACK_BOT_TOKEN=xoxb-...
GITHUB_TOKEN=ghp_...
TWILIO_ACCOUNT_SID=AC...
SENDGRID_API_KEY=SG...
```

---

## 🎯 Core Capabilities

### Supported API Types
- ✅ REST APIs
- ✅ GraphQL APIs
- ✅ SOAP APIs

### Authentication Methods
- ✅ No Auth
- ✅ API Key
- ✅ Bearer Token
- ✅ Basic Auth
- ✅ OAuth 2.0

### Built-in Integrations
- ✅ Stripe (Payments)
- ✅ Slack (Messaging)
- ✅ Google (Gmail, Calendar, Drive, Docs, Sheets)
- ✅ GitHub (Repos, Issues, PRs)
- ✅ Twitter (Tweets, Timeline)
- ✅ Twilio (SMS, Voice, WhatsApp)
- ✅ SendGrid (Email)
- ✅ Notion (Workspace)
- ✅ OpenAI (AI)
- ✅ Shopify (E-commerce)
- ✅ Discord (Community)
- ✅ Zoom (Video)

---

## 📱 Mobile Support

The UI is fully responsive and works on:
- ✅ Desktop (1920x1080+)
- ✅ Laptop (1366x768+)
- ✅ Tablet (768x1024)
- ✅ Mobile (375x667+)

---

## 🔒 Security

- Passwords are hashed using SHA-256
- Token-based authentication
- Session expiry (24 hours)
- CORS enabled
- Input validation

---

## 🚀 Deployment

### Deploy to Production

1. **Set production environment variables**
2. **Build and start**
```bash
npm run start
```

3. **Use a process manager**
```bash
npm install -g pm2
pm2 start backend/server.js --name r3sn
```

### Deploy to Cloud

**Heroku:**
```bash
heroku create r3sn-app
git push heroku main
```

**Docker:**
```bash
docker build -t r3sn .
docker run -p 3000:3000 r3sn
```

---

## 📊 System Requirements

### Minimum
- Node.js 14+
- 512MB RAM
- 1GB Storage

### Recommended
- Node.js 18+
- 2GB RAM
- 5GB Storage

---

## 🤝 Contributing

We welcome contributions! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🆘 Support

- **Documentation**: [docs.r3sn.io](https://docs.r3sn.io)
- **Issues**: [GitHub Issues](https://github.com/Nisu7648/R3SN/issues)
- **Email**: support@r3sn.io

---

## 🎉 What Makes R3SN Special?

### Before R3SN
- ❌ Write 100+ lines of code per API
- ❌ Spend hours reading documentation
- ❌ Debug authentication issues
- ❌ Maintain boilerplate code
- ❌ 2-4 hours per integration

### With R3SN
- ✅ Describe what you want in plain text
- ✅ AI generates complete code
- ✅ Ready to use in 30 seconds
- ✅ No maintenance needed
- ✅ 99% time savings

---

**Built with ❤️ by the R3SN Team**

**Start building with natural language today!**
