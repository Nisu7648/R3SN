# 🚀 R3SN Complete Setup & Testing Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Starting the Server](#starting-the-server)
5. [Testing All Systems](#testing-all-systems)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Node.js** v16+ (v18+ recommended)
- **npm** v8+
- **Git**

### Optional (for production)
- **Docker** (for containerized deployment)
- **MongoDB** (if using MongoDB instead of file-based DB)
- **Redis** (for caching)

---

## Installation

### Step 1: Clone Repository
```bash
git clone https://github.com/Nisu7648/R3SN.git
cd R3SN
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install all required packages:
- express
- cors
- helmet
- compression
- morgan
- axios
- chokidar
- vm2
- uuid

---

## Configuration

### Step 1: Create Environment File
```bash
cp .env.example .env
```

### Step 2: Edit .env File
```bash
nano .env
```

**Required Variables:**
```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Security (IMPORTANT: Change these!)
ENCRYPTION_KEY=your-32-character-encryption-key-change-this-in-production
JWT_SECRET=your-jwt-secret-key-change-this

# Database
DB_PATH=./data/db
DB_ENCRYPTION=true

# Plugins
PLUGINS_DIR=./plugins
PLUGIN_HOT_RELOAD=true

# LLM
MODELS_DIR=./models
DEFAULT_MODEL=llama-2-7b.gguf

# Features
PREMIUM_MODE=true
UNLIMITED_ACCESS=true
MAX_CONCURRENT_WORKFLOWS=1000
MAX_CONCURRENT_PLUGINS=100

# Logging
LOG_LEVEL=info
LOG_DIR=./logs
```

### Step 3: Generate Secure Keys

**For ENCRYPTION_KEY (32 characters minimum):**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**For JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the generated keys to your `.env` file.

### Step 4: Create Required Directories
```bash
mkdir -p data/db logs models plugins
```

---

## Starting the Server

### Development Mode
```bash
npm run dev
```

### Production Mode (Complete Server)
```bash
node backend/server-complete.js
```

### Using PM2 (Recommended for Production)
```bash
# Install PM2
npm install -g pm2

# Start server
pm2 start backend/server-complete.js --name r3sn

# View logs
pm2 logs r3sn

# Monitor
pm2 monit

# Stop
pm2 stop r3sn

# Restart
pm2 restart r3sn
```

### Expected Output
```
🚀 Initializing R3SN Server...
════════════════════════════════════════════════════════════
🔌 Initializing Plugin Engine...
✅ Loaded plugin: Premium API Plugin v1.0.0
✅ Plugin Engine initialized with 1 plugins
👀 File watching enabled for hot-reload
⚙️  Initializing Workflow Engine...
✅ Workflow Engine initialized (max 1000 concurrent)
🧠 Initializing LLM Engine...
✅ LLM Engine initialized with 0 models
🤖 Initializing Agent System...
✅ Created agent: workflow-agent (workflow)
✅ Created agent: plugin-agent (plugin)
✅ Created agent: analysis-agent (analysis)
✅ Created agent: integration-agent (integration)
✅ Created agent: executor-agent (executor)
✅ Agent System initialized with 5 agents
🧠 Initializing ML Engine...
✅ ML Engine initialized with 3 models
🗄️  Initializing Database Manager...
✅ Database initialized at ./data/db
🔒 Encryption: ENABLED (AES-256-GCM)
════════════════════════════════════════════════════════════
✅ All systems initialized successfully!
════════════════════════════════════════════════════════════

════════════════════════════════════════════════════════════
🎉 R3SN SERVER RUNNING
════════════════════════════════════════════════════════════
🌐 Server: http://localhost:3000
📊 Status: http://localhost:3000/api/status
💚 Health: http://localhost:3000/health
════════════════════════════════════════════════════════════

✅ SYSTEMS OPERATIONAL:
   🔌 Universal API: 50+ services
   🔥 Plugin Engine: Hot-reload enabled
   ⚙️  Workflow Engine: 1000+ concurrent
   🧠 LLM Engine: GGUF models ready
   🤖 Agent System: 5 agents active
   📊 ML Engine: 3 models trained
   🗄️  Database: AES-256 encrypted

════════════════════════════════════════════════════════════
🚀 READY FOR PRODUCTION!
════════════════════════════════════════════════════════════
```

---

## Testing All Systems

### Test 1: Health Check ✅
```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "systems": {
    "universalAPI": "operational",
    "pluginEngine": "operational",
    "workflowEngine": "operational",
    "llmEngine": "operational",
    "agentSystem": "operational",
    "mlEngine": "operational",
    "database": "operational"
  }
}
```

### Test 2: System Status 📊
```bash
curl http://localhost:3000/api/status
```

**Expected Response:**
```json
{
  "success": true,
  "status": {
    "universalAPI": {
      "totalServices": 50,
      "premiumMode": true,
      "unlimited": true,
      "totalCalls": 0
    },
    "pluginEngine": {
      "totalPlugins": 1,
      "premiumMode": true,
      "hotReload": true
    },
    "workflowEngine": {
      "activeExecutions": 0,
      "maxConcurrentExecutions": 1000
    },
    "llmEngine": {
      "totalModels": 0,
      "premium": true
    },
    "agentSystem": {
      "totalAgents": 5,
      "premium": true
    },
    "mlEngine": {
      "totalModels": 3,
      "trainedModels": 3,
      "averageAccuracy": 0.916
    }
  }
}
```

### Test 3: Universal API - List Services 🔌
```bash
curl http://localhost:3000/api/universal/services
```

**Expected:** List of 50+ services including OpenAI, AWS, Stripe, etc.

### Test 4: Execute Simple Workflow ⚙️
```bash
curl -X POST http://localhost:3000/api/workflows/execute \
  -H "Content-Type: application/json" \
  -d '{
    "workflow": {
      "name": "Hello World Workflow",
      "nodes": [
        {
          "id": "node-1",
          "type": "log",
          "parameters": {
            "message": "Hello from R3SN!"
          }
        }
      ],
      "connections": []
    },
    "inputData": {}
  }'
```

**Expected Response:**
```json
{
  "executionId": "abc-123-def-456",
  "status": "completed",
  "result": { ... },
  "duration": 150,
  "nodesExecuted": 1
}
```

### Test 5: Execute Agent Task 🤖
```bash
curl -X POST http://localhost:3000/api/agents/workflow-agent/execute \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Analyze workflow performance",
    "context": {}
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "agentId": "workflow-agent",
  "result": {
    "steps": 3,
    "results": [...],
    "summary": "Completed 3 steps successfully"
  },
  "duration": 1234
}
```

### Test 6: ML Prediction 📊
```bash
curl -X POST http://localhost:3000/api/ml/predict \
  -H "Content-Type: application/json" \
  -d '{
    "modelId": "workflow-optimizer",
    "input": {
      "nodes": [
        {"id": "1", "type": "http.request"},
        {"id": "2", "type": "transform"}
      ],
      "connections": [
        {"source": "1", "target": "2"}
      ]
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "model": "Workflow Optimizer",
  "prediction": {
    "optimizations": [
      {
        "type": "parallelization",
        "description": "Execute independent nodes in parallel",
        "impact": "high",
        "estimatedImprovement": "40%"
      }
    ],
    "estimatedSpeedup": 1.85,
    "confidence": 0.92
  },
  "duration": 45,
  "confidence": 0.92
}
```

### Test 7: Plugin Execution 🔥
```bash
curl -X POST http://localhost:3000/api/plugins/premium-api-plugin/execute \
  -H "Content-Type: application/json" \
  -d '{
    "method": "getStats",
    "params": {}
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "result": {
    "premium": true,
    "unlimited": true,
    "services": 5,
    "supportedServices": ["openai", "anthropic", "google-ai", "aws", "stripe"]
  },
  "duration": 12,
  "plugin": {
    "id": "premium-api-plugin",
    "name": "Premium API Plugin",
    "version": "1.0.0"
  }
}
```

### Test 8: List All Agents 🤖
```bash
curl http://localhost:3000/api/agents
```

**Expected:** List of 5 agents (workflow, plugin, analysis, integration, executor)

### Test 9: List ML Models 🧠
```bash
curl http://localhost:3000/api/ml/models
```

**Expected:** List of 3 models (optimizer, predictor, detector)

### Test 10: Database Stats 🗄️
```bash
curl http://localhost:3000/api/database/stats
```

**Expected Response:**
```json
{
  "success": true,
  "stats": {
    "collections": ["workflows", "executions", "agents", "plugins"],
    "encryption": true,
    "path": "./data/db"
  }
}
```

---

## Troubleshooting

### Issue 1: Port Already in Use
**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 node backend/server-complete.js
```

### Issue 2: Permission Denied
**Error:** `EACCES: permission denied`

**Solution:**
```bash
# Fix directory permissions
chmod -R 755 data logs models plugins

# Or run with sudo (not recommended)
sudo node backend/server-complete.js
```

### Issue 3: Module Not Found
**Error:** `Cannot find module 'express'`

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue 4: Encryption Key Warning
**Warning:** `Using default encryption key`

**Solution:**
Generate a secure key and add to `.env`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Issue 5: Plugin Not Loading
**Error:** `Plugin not found: premium-api-plugin`

**Solution:**
```bash
# Ensure plugin directory exists
mkdir -p plugins/premium-api-plugin

# Check plugin.json exists
ls plugins/premium-api-plugin/plugin.json

# Restart server
pm2 restart r3sn
```

---

## 🎉 Success Checklist

- [ ] Server starts without errors
- [ ] Health check returns "healthy"
- [ ] System status shows all systems operational
- [ ] Can list 50+ Universal API services
- [ ] Can execute simple workflow
- [ ] Can execute agent task
- [ ] ML prediction works
- [ ] Plugin execution works
- [ ] Database encryption enabled
- [ ] All 5 agents active
- [ ] All 3 ML models loaded

**If all checks pass, your R3SN installation is complete and ready for production!** 🚀

---

## Next Steps

1. **Add GGUF Models:** Place `.gguf` model files in `./models` directory
2. **Create Custom Plugins:** Add plugins to `./plugins` directory
3. **Configure Integrations:** Add API keys for external services
4. **Setup Monitoring:** Configure logging and monitoring tools
5. **Deploy to Production:** Use Docker or cloud platform

---

## Support

- **Documentation:** [README.md](README.md)
- **Issues:** [GitHub Issues](https://github.com/Nisu7648/R3SN/issues)
- **Architecture:** [ARCHITECTURE.md](ARCHITECTURE.md)

---

**R3SN - Revolutionary AI Automation Platform** 🚀
