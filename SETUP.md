# R3SN Setup Guide

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 6.0
- npm >= 9.0.0
- Redis (optional, for rate limiting)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Nisu7648/R3SN.git
cd R3SN
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start MongoDB**
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or use local MongoDB installation
mongod --dbpath /path/to/data
```

5. **Seed the database**
```bash
npm run seed
```

6. **Start the server**
```bash
# Development mode
npm run dev

# Production mode
npm run production
```

The server will start on `http://localhost:3000`

## Environment Configuration

### Required Variables

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/r3sn
JWT_SECRET=your-secret-key
OPENAI_API_KEY=your-openai-key
```

### Optional Variables

- `REDIS_URL`: For rate limiting and caching
- `SMTP_*`: For email notifications
- Integration API keys for specific services

## API Documentation

### Authentication

#### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

Response includes JWT token for authenticated requests.

### Using the API

Include the JWT token in requests:
```bash
Authorization: Bearer <your-jwt-token>
```

Or use API key:
```bash
X-API-Key: <your-api-key>
```

### Core Endpoints

#### Agents

**List Agents**
```bash
GET /api/agents
```

**Create Agent**
```bash
POST /api/agents
{
  "name": "My Agent",
  "type": "executor",
  "capabilities": ["data-processing", "api-calls"]
}
```

**Execute Agent**
```bash
POST /api/agents/:id/execute
{
  "input": {
    "task": "Process data"
  }
}
```

**Execute Prompt (Universal Executor)**
```bash
POST /api/agents/execute-prompt
{
  "prompt": "Analyze Q4 sales data and send report to team@company.com"
}
```

#### Integrations

**List Integrations**
```bash
GET /api/integrations
```

**Connect Integration**
```bash
POST /api/integrations/:id/connect
{
  "credentials": {
    "apiKey": "your-api-key"
  }
}
```

**Execute Integration Action**
```bash
POST /api/integrations/:id/execute
{
  "action": "send_message",
  "params": {
    "channel": "#general",
    "message": "Hello from R3SN!"
  }
}
```

#### Workflows

**Create Workflow**
```bash
POST /api/automations
{
  "name": "Daily Report",
  "trigger": {
    "type": "schedule",
    "config": { "cron": "0 9 * * *" }
  },
  "steps": [
    {
      "type": "integration",
      "action": "fetch_data",
      "integrationId": "..."
    },
    {
      "type": "agent",
      "action": "process",
      "agentId": "..."
    }
  ]
}
```

**Execute Workflow**
```bash
POST /api/automations/:id/execute
{
  "input": {}
}
```

#### Plugins

**Generate Plugin**
```bash
POST /api/plugins/generate
{
  "appName": "WhatsApp",
  "appPackage": "com.whatsapp",
  "description": "WhatsApp automation",
  "actions": ["send_message", "read_messages"]
}
```

**Execute Plugin**
```bash
POST /api/plugins/:id/execute
{
  "action": "send_message",
  "params": {
    "to": "+1234567890",
    "message": "Hello!"
  }
}
```

## Features

### 1. Universal Executor
Execute ANY prompt without restrictions:
```javascript
POST /api/agents/execute-prompt
{
  "prompt": "Fetch latest tweets about AI, analyze sentiment, create summary report, and email to team@company.com"
}
```

### 2. Unlimited AI Agents
Create unlimited specialized agents:
```javascript
POST /api/agents
{
  "name": "Data Analyzer",
  "type": "analyzer",
  "capabilities": ["data-analysis", "visualization"]
}
```

### 3. 800+ Integrations
Connect to any service:
- Productivity: Google Workspace, Microsoft 365, Notion
- Communication: Slack, Discord, Teams
- Finance: Stripe, PayPal, QuickBooks
- Social: Twitter, Facebook, LinkedIn
- Development: GitHub, GitLab, Jira

### 4. Plugin Factory
Auto-generate plugins for non-API apps:
```javascript
POST /api/plugins/generate
{
  "appName": "Instagram",
  "appPackage": "com.instagram.android"
}
```

### 5. Enterprise Orchestration
Unlimited concurrent workflows with SLA management.

### 6. Self-Evolving Engine
System learns and improves automatically.

### 7. Self-Debugging Engine
Automatic error detection and fixing.

## Testing

### Health Check
```bash
curl http://localhost:3000/health
```

### Stats
```bash
curl http://localhost:3000/api/stats
```

### Test Authentication
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Production Deployment

### Using Docker

```bash
docker-compose up -d
```

### Manual Deployment

1. Set `NODE_ENV=production`
2. Configure production MongoDB
3. Set strong JWT_SECRET
4. Enable HTTPS
5. Configure rate limiting
6. Set up monitoring

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://production-host:27017/r3sn
JWT_SECRET=strong-random-secret
CORS_ORIGIN=https://yourdomain.com
REDIS_URL=redis://production-redis:6379
```

## Monitoring

### Logs
Logs are written to console and file (if configured).

### Metrics
Access metrics at `/api/stats`

### Health Check
Monitor at `/health`

## Troubleshooting

### MongoDB Connection Issues
- Verify MongoDB is running
- Check MONGODB_URI in .env
- Ensure network connectivity

### Authentication Errors
- Verify JWT_SECRET is set
- Check token expiration
- Ensure user exists and is active

### Rate Limiting
- Default: 100 requests per 15 minutes
- Adjust in .env: RATE_LIMIT_MAX_REQUESTS

## Support

- Documentation: See `/docs` folder
- Issues: GitHub Issues
- Email: support@r3sn.io

## License

MIT License - see LICENSE file
