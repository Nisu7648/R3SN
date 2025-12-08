# Getting Started with R3SN

## Quick Start Guide

### 1. Installation

#### Clone Repository
```bash
git clone https://github.com/Nisu7648/R3SN.git
cd R3SN
```

#### Install Dependencies
```bash
npm install
```

#### Configure Environment
```bash
cp .env.example .env
# Edit .env with your settings
```

### 2. Backend Setup

#### Start PostgreSQL
```bash
# Using Docker
docker run -d \
  --name r3sn-postgres \
  -e POSTGRES_DB=r3sn \
  -e POSTGRES_PASSWORD=yourpassword \
  -p 5432:5432 \
  postgres:14
```

#### Start Redis
```bash
# Using Docker
docker run -d \
  --name r3sn-redis \
  -p 6379:6379 \
  redis:6
```

#### Run Backend Server
```bash
npm run server
```

Server will start on `http://localhost:3000`

### 3. Android Setup

#### Prerequisites
- Android Studio Arctic Fox or later
- Android SDK 24+
- Physical Android device or emulator

#### Build & Install
```bash
cd android
./gradlew assembleDebug
adb install app/build/outputs/apk/debug/app-debug.apk
```

### 4. First Automation

#### Create Your First Agent

```javascript
// Using API
POST http://localhost:3000/api/agents

{
  "name": "My First Agent",
  "type": "task_automation",
  "config": {
    "capabilities": ["send_message", "read_data"]
  }
}
```

#### Connect an Integration

```javascript
// Connect Gmail
POST http://localhost:3000/api/integrations/gmail/connect

{
  "credentials": {
    "apiKey": "your_api_key"
  }
}
```

#### Create Automation

```javascript
// Create automation workflow
POST http://localhost:3000/api/automations

{
  "name": "Auto Email Responder",
  "trigger": {
    "type": "email_received",
    "integration": "gmail"
  },
  "actions": [
    {
      "type": "send_email",
      "integration": "gmail",
      "params": {
        "to": "{{trigger.from}}",
        "subject": "Re: {{trigger.subject}}",
        "body": "Thanks for your email!"
      }
    }
  ]
}
```

### 5. Using Plugin-based Apps

For apps without APIs, R3SN auto-generates plugins:

#### Enable Accessibility Service
1. Open Android Settings
2. Go to Accessibility
3. Find "R3SN Automation"
4. Enable the service

#### Generate Plugin
```javascript
POST http://localhost:3000/api/plugins/generate

{
  "appName": "WhatsApp",
  "packageName": "com.whatsapp",
  "category": "communication"
}
```

#### Use Plugin in Automation
```javascript
{
  "name": "Auto WhatsApp Reply",
  "trigger": {
    "type": "message_received",
    "app": "whatsapp"
  },
  "actions": [
    {
      "type": "send_message",
      "app": "whatsapp",
      "params": {
        "contact": "{{trigger.sender}}",
        "message": "I'll get back to you soon!"
      }
    }
  ]
}
```

## Key Concepts

### Unlimited Agents
- Create as many agents as needed
- No restrictions on concurrent execution
- Automatic resource management

### 800+ Integrations
- 600+ API-based integrations
- 200+ plugin-based integrations
- Automatic plugin generation

### Plugin System
- Works with apps without APIs
- Uses Android Accessibility Services
- Auto-generated from app analysis
- No manual configuration needed

### Automation Workflows
- Trigger-based execution
- Multi-step actions
- Cross-app automation
- Context-aware processing

## Examples

### Example 1: Social Media Automation
```javascript
{
  "name": "Cross-post to All Platforms",
  "trigger": {
    "type": "manual"
  },
  "actions": [
    { "type": "post", "app": "twitter", "params": { "text": "{{input}}" } },
    { "type": "post", "app": "facebook", "params": { "text": "{{input}}" } },
    { "type": "post", "app": "instagram", "params": { "caption": "{{input}}" } }
  ]
}
```

### Example 2: Smart Notifications
```javascript
{
  "name": "Important Email Alerts",
  "trigger": {
    "type": "email_received",
    "filter": { "from": "boss@company.com" }
  },
  "actions": [
    { "type": "send_sms", "app": "messages", "params": { "text": "Important email from boss!" } },
    { "type": "create_reminder", "app": "calendar", "params": { "title": "Check email" } }
  ]
}
```

### Example 3: Data Sync
```javascript
{
  "name": "Sync Contacts Across Apps",
  "trigger": {
    "type": "contact_added",
    "app": "google_contacts"
  },
  "actions": [
    { "type": "add_contact", "app": "outlook" },
    { "type": "add_contact", "app": "salesforce" }
  ]
}
```

## Troubleshooting

### Backend won't start
- Check PostgreSQL is running
- Verify Redis connection
- Check .env configuration

### Android app crashes
- Enable all required permissions
- Check accessibility service is enabled
- View logs: `adb logcat | grep R3SN`

### Plugin not working
- Verify accessibility service is enabled
- Check app is installed
- Test plugin: `POST /api/plugins/:id/test`

## Next Steps

- Read [Architecture Documentation](../ARCHITECTURE.md)
- Explore [API Reference](./API.md)
- Join community discussions
- Build your first automation!

## Support

- GitHub Issues: Report bugs
- Discussions: Ask questions
- Documentation: Learn more
