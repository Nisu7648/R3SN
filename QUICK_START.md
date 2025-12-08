# R3SN - Quick Start Guide

Get up and running with R3SN in 5 minutes!

## 🚀 Installation

### Option 1: Quick Start Script (Recommended)

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

**Windows:**
```bash
start.bat
```

### Option 2: Manual Setup

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env

# 3. Start server
npm start
```

## ✅ Verify Installation

Server should start at: `http://localhost:3000`

Test the health endpoint:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "success": true,
  "message": "R3SN Workflow Engine is running",
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🎯 Your First Workflow

### 1. Create a Simple Workflow

```bash
curl -X POST http://localhost:3000/api/workflows/execute \
  -H "Content-Type: application/json" \
  -d '{
    "workflow": {
      "nodes": [
        {
          "id": "1",
          "type": "http.request",
          "name": "Fetch GitHub User",
          "parameters": {
            "method": "GET",
            "url": "https://api.github.com/users/octocat"
          }
        }
      ],
      "connections": []
    }
  }'
```

### 2. Check Execution Status

```bash
curl http://localhost:3000/api/workflows/executions/{executionId}
```

### 3. View Execution History

```bash
curl http://localhost:3000/api/workflows/history
```

## 📦 Available Nodes

Get list of all available nodes:

```bash
curl http://localhost:3000/api/workflows/nodes
```

## 🔌 Install Example Plugin

The example plugin is already included! It provides:
- **Hello World Node**: Simple greeting node
- **Math Operations Node**: Basic math operations

Test the example plugin:

```bash
curl -X POST http://localhost:3000/api/workflows/execute \
  -H "Content-Type: application/json" \
  -d '{
    "workflow": {
      "nodes": [
        {
          "id": "1",
          "type": "example.hello",
          "name": "Greet",
          "parameters": {
            "greeting": "Hello"
          }
        }
      ],
      "connections": []
    },
    "inputData": {
      "name": "World"
    }
  }'
```

## 🎨 Create Your First API

### 1. Design an API

```bash
curl -X POST http://localhost:3000/api/designer/apis \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My First API",
    "baseUrl": "https://api.example.com",
    "authentication": {
      "type": "bearer"
    },
    "endpoints": [
      {
        "method": "GET",
        "path": "/users",
        "name": "Get Users"
      }
    ]
  }'
```

### 2. Generate OpenAPI Schema

```bash
curl http://localhost:3000/api/designer/apis/{apiId}/schema
```

### 3. Convert to Workflow Nodes

```bash
curl http://localhost:3000/api/designer/apis/{apiId}/nodes
```

## 🤖 ML Insights

### Get Execution Insights

```bash
curl http://localhost:3000/api/ml/insights/{executionId}
```

### Get Daily Analytics

```bash
curl http://localhost:3000/api/ml/analytics/daily
```

### Get Behavior Insights

```bash
curl http://localhost:3000/api/ml/behavior/insights
```

## 📱 Android App

### Build and Install

```bash
cd android
./gradlew assembleDebug
adb install app/build/outputs/apk/debug/app-debug.apk
```

### Configure API Endpoint

Edit `android/app/src/main/res/values/strings.xml`:

```xml
<string name="api_base_url">http://YOUR_IP:3000</string>
```

## 🔧 Development Mode

Run with auto-reload:

```bash
npm run dev
```

## 📚 Next Steps

1. **Read the Full Guide**: [WORKFLOW_ENGINE_GUIDE.md](WORKFLOW_ENGINE_GUIDE.md)
2. **Create Custom Plugins**: [Plugin Development Guide](plugins/example-plugin/README.md)
3. **Explore API Designer**: Design and test your APIs
4. **Check ML Insights**: See AI-powered analytics
5. **Build Complex Workflows**: Combine multiple nodes

## 🎯 Example Workflows

### Workflow 1: Fetch and Transform Data

```json
{
  "workflow": {
    "nodes": [
      {
        "id": "1",
        "type": "http.request",
        "name": "Fetch Data",
        "parameters": {
          "method": "GET",
          "url": "https://api.github.com/users/octocat"
        }
      },
      {
        "id": "2",
        "type": "data.transform",
        "name": "Extract Info",
        "parameters": {
          "code": "return { name: data.name, repos: data.public_repos, followers: data.followers };"
        }
      }
    ],
    "connections": [
      { "source": "1", "target": "2" }
    ]
  }
}
```

### Workflow 2: Filter and Process

```json
{
  "workflow": {
    "nodes": [
      {
        "id": "1",
        "type": "http.request",
        "name": "Fetch Users",
        "parameters": {
          "method": "GET",
          "url": "https://jsonplaceholder.typicode.com/users"
        }
      },
      {
        "id": "2",
        "type": "data.filter",
        "name": "Filter Active",
        "parameters": {
          "conditions": [
            { "field": "id", "operator": "lessThan", "value": 5 }
          ],
          "logic": "AND"
        }
      },
      {
        "id": "3",
        "type": "data.transform",
        "name": "Format",
        "parameters": {
          "code": "return data.matched.map(u => ({ name: u.name, email: u.email }));"
        }
      }
    ],
    "connections": [
      { "source": "1", "target": "2" },
      { "source": "2", "target": "3" }
    ]
  }
}
```

### Workflow 3: Math Operations

```json
{
  "workflow": {
    "nodes": [
      {
        "id": "1",
        "type": "example.math",
        "name": "Calculate",
        "parameters": {
          "operation": "add"
        }
      }
    ],
    "connections": []
  },
  "inputData": {
    "a": 10,
    "b": 5
  }
}
```

## 🐛 Troubleshooting

### Port Already in Use

Change port in `.env`:
```env
PORT=3001
```

### Dependencies Installation Failed

Clear cache and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Android Build Failed

Clean and rebuild:
```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

## 📞 Get Help

- **Documentation**: [WORKFLOW_ENGINE_GUIDE.md](WORKFLOW_ENGINE_GUIDE.md)
- **GitHub Issues**: [Report a bug](https://github.com/Nisu7648/R3SN/issues)
- **Examples**: Check `plugins/example-plugin/`

## 🎉 You're Ready!

You now have a fully functional workflow automation platform. Start building amazing workflows!

---

**Next**: Read the [Complete Guide](WORKFLOW_ENGINE_GUIDE.md) to unlock all features.
