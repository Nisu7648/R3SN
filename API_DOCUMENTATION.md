# 📡 R3SN Complete API Documentation

## 🎯 Overview

R3SN provides **50+ REST API endpoints** covering all platform features. All endpoints return JSON responses.

**Base URL:** `http://localhost:3000`

---

## 📋 Table of Contents

1. [Root & Health](#root--health) (3 endpoints)
2. [Universal API](#universal-api) (4 endpoints)
3. [Universal Executor](#universal-executor) (1 endpoint)
4. [Plugins](#plugins) (6 endpoints)
5. [Workflows](#workflows) (9 endpoints)
6. [LLM](#llm) (6 endpoints)
7. [Agents](#agents) (6 endpoints)
8. [ML](#ml) (5 endpoints)
9. [Integrations](#integrations) (4 endpoints)
10. [Self-Evolution](#self-evolution) (3 endpoints)
11. [Self-Debugging](#self-debugging) (4 endpoints)
12. [Database](#database) (2 endpoints)
13. [Authentication](#authentication) (2 endpoints)
14. [Metrics](#metrics) (1 endpoint)
15. [Audit](#audit) (1 endpoint)

**Total: 57 API Endpoints**

---

## 1. Root & Health

### GET /
Get API overview and available endpoints.

**Response:**
```json
{
  "name": "R3SN - Revolutionary AI Automation Platform",
  "version": "1.0.0",
  "status": "operational",
  "systems": { ... },
  "endpoints": { ... }
}
```

### GET /health
Health check for all systems.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "systems": {
    "universalAPI": "operational",
    "pluginEngine": "operational",
    ...
  }
}
```

### GET /api/status
Complete system status and statistics.

**Response:**
```json
{
  "success": true,
  "status": {
    "version": "1.0.0",
    "universalAPI": { ... },
    "pluginEngine": { ... },
    "features": { ... },
    "stats": { ... }
  }
}
```

---

## 2. Universal API

### GET /api/universal/services
List all 50+ available services.

**Response:**
```json
{
  "success": true,
  "services": [
    {
      "name": "openai",
      "baseURL": "https://api.openai.com/v1",
      "features": ["gpt-4", "dall-e-3"],
      "premium": true,
      "unlimited": true
    },
    ...
  ],
  "count": 50
}
```

### GET /api/universal/services/:service
Get details for a specific service.

**Parameters:**
- `service` (path) - Service name (e.g., "openai", "aws", "stripe")

**Response:**
```json
{
  "success": true,
  "service": {
    "name": "openai",
    "baseURL": "https://api.openai.com/v1",
    "features": ["gpt-4", "dall-e-3"],
    "callCount": 42,
    "lastCall": 1234567890
  }
}
```

### POST /api/universal/call
Call any service API.

**Request Body:**
```json
{
  "service": "openai",
  "endpoint": "/chat/completions",
  "options": {
    "method": "POST",
    "apiKey": "sk-...",
    "body": {
      "model": "gpt-4",
      "messages": [{"role": "user", "content": "Hello!"}]
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "status": 200,
  "data": { ... },
  "duration": 1234
}
```

### POST /api/universal/batch
Batch call multiple services.

**Request Body:**
```json
{
  "calls": [
    {
      "service": "openai",
      "endpoint": "/models",
      "options": { "method": "GET" }
    },
    {
      "service": "stripe",
      "endpoint": "/customers",
      "options": { "method": "GET" }
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "results": [ ... ],
  "total": 2,
  "successful": 2,
  "failed": 0
}
```

---

## 3. Universal Executor

### POST /api/execute
Execute ANY prompt without restrictions.

**Request Body:**
```json
{
  "prompt": "Fetch latest GitHub trending repos, analyze stars/forks, and post summary to Slack",
  "context": {
    "slackChannel": "#engineering",
    "githubToken": "ghp_..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "result": { ... },
  "executionTime": 5432,
  "steps": [ ... ]
}
```

---

## 4. Plugins

### GET /api/plugins
List all loaded plugins.

**Response:**
```json
{
  "success": true,
  "plugins": [
    {
      "id": "premium-api-plugin",
      "name": "Premium API Plugin",
      "version": "1.0.0",
      "premium": true,
      "executionCount": 42
    }
  ],
  "count": 1
}
```

### GET /api/plugins/:pluginId
Get plugin details.

**Response:**
```json
{
  "success": true,
  "plugin": {
    "id": "premium-api-plugin",
    "name": "Premium API Plugin",
    "methods": ["callService", "batchCall", "getStats"]
  }
}
```

### POST /api/plugins/:pluginId/execute
Execute plugin method.

**Request Body:**
```json
{
  "method": "callService",
  "params": {
    "service": "openai",
    "endpoint": "/models"
  }
}
```

**Response:**
```json
{
  "success": true,
  "result": { ... },
  "duration": 123
}
```

### POST /api/plugins/:pluginId/reload
Hot-reload plugin (changes applied instantly).

**Response:**
```json
{
  "success": true,
  "message": "Plugin reloaded successfully"
}
```

### DELETE /api/plugins/:pluginId
Unload plugin.

**Response:**
```json
{
  "success": true,
  "message": "Plugin unloaded"
}
```

### POST /api/plugins/generate
Auto-generate plugin for non-API apps.

**Request Body:**
```json
{
  "appName": "WhatsApp",
  "appPackage": "com.whatsapp",
  "actions": ["send_message", "read_messages"]
}
```

**Response:**
```json
{
  "success": true,
  "plugin": { ... },
  "code": "...",
  "manifest": { ... }
}
```

---

## 5. Workflows

### POST /api/workflows
Create new workflow.

**Request Body:**
```json
{
  "name": "Daily Report",
  "nodes": [ ... ],
  "connections": [ ... ]
}
```

**Response:**
```json
{
  "success": true,
  "workflow": {
    "_id": "abc123",
    "name": "Daily Report",
    "status": "active"
  }
}
```

### GET /api/workflows
List all workflows.

**Response:**
```json
{
  "success": true,
  "workflows": [ ... ],
  "count": 10
}
```

### GET /api/workflows/:id
Get workflow by ID.

**Response:**
```json
{
  "success": true,
  "workflow": {
    "_id": "abc123",
    "name": "Daily Report",
    "nodes": [ ... ]
  }
}
```

### POST /api/workflows/execute
Execute workflow directly (without saving).

**Request Body:**
```json
{
  "workflow": {
    "name": "Test Workflow",
    "nodes": [
      {
        "id": "1",
        "type": "http.request",
        "parameters": {"url": "https://api.github.com/users/octocat"}
      }
    ],
    "connections": []
  },
  "inputData": {}
}
```

**Response:**
```json
{
  "executionId": "exec-123",
  "status": "completed",
  "result": { ... },
  "duration": 1234,
  "nodesExecuted": 1
}
```

### POST /api/workflows/:id/execute
Execute saved workflow by ID.

**Request Body:**
```json
{
  "input": { ... },
  "options": { ... }
}
```

**Response:**
```json
{
  "success": true,
  "execution": {
    "id": "exec-123",
    "status": "running"
  }
}
```

### GET /api/workflows/executions/:id
Get execution status.

**Response:**
```json
{
  "success": true,
  "status": {
    "executionId": "exec-123",
    "status": "completed",
    "duration": 5432,
    "nodesExecuted": 5,
    "result": { ... }
  }
}
```

### POST /api/workflows/executions/:id/cancel
Cancel running execution.

**Response:**
```json
{
  "success": true,
  "message": "Execution cancelled"
}
```

### PUT /api/workflows/:id
Update workflow.

**Request Body:**
```json
{
  "name": "Updated Name",
  "nodes": [ ... ]
}
```

**Response:**
```json
{
  "success": true,
  "result": { "updated": 1 }
}
```

### DELETE /api/workflows/:id
Delete workflow.

**Response:**
```json
{
  "success": true,
  "message": "Workflow deleted"
}
```

---

## 6. LLM

### GET /api/llm/models
List available GGUF models.

**Response:**
```json
{
  "success": true,
  "models": [
    {
      "name": "llama-2-7b.gguf",
      "size": 3825205248,
      "loaded": false
    }
  ],
  "count": 1
}
```

### POST /api/llm/load
Load GGUF model.

**Request Body:**
```json
{
  "model": "llama-2-7b.gguf",
  "config": {
    "contextSize": 4096,
    "threads": 4,
    "gpuLayers": 0
  }
}
```

**Response:**
```json
{
  "success": true,
  "model": "llama-2-7b.gguf",
  "size": 3825205248,
  "config": { ... }
}
```

### POST /api/llm/unload
Unload active model.

**Response:**
```json
{
  "success": true,
  "message": "Model unloaded"
}
```

### POST /api/llm/generate
Generate text with loaded model.

**Request Body:**
```json
{
  "prompt": "Write a haiku about AI",
  "options": {
    "temperature": 0.7,
    "maxTokens": 100
  }
}
```

**Response:**
```json
{
  "success": true,
  "text": "Silicon minds think...",
  "tokens": 42,
  "duration": 1234
}
```

### POST /api/llm/embed
Generate embeddings.

**Request Body:**
```json
{
  "text": "Hello world"
}
```

**Response:**
```json
{
  "success": true,
  "embedding": [0.123, -0.456, ...],
  "dimensions": 384
}
```

### GET /api/llm/active
Get active model info.

**Response:**
```json
{
  "success": true,
  "model": {
    "name": "llama-2-7b.gguf",
    "size": 3825205248,
    "loadedAt": 1234567890
  }
}
```

---

## 7. Agents

### GET /api/agents
List all agents.

**Response:**
```json
{
  "success": true,
  "agents": [
    {
      "id": "workflow-agent",
      "type": "workflow",
      "capabilities": ["workflow-creation", "optimization"],
      "executionCount": 42
    }
  ],
  "count": 5
}
```

### POST /api/agents
Create new agent.

**Request Body:**
```json
{
  "id": "custom-agent",
  "type": "custom",
  "config": {
    "description": "Custom agent",
    "capabilities": ["data-processing"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "agent": {
    "id": "custom-agent",
    "type": "custom",
    "executionCount": 0
  }
}
```

### GET /api/agents/:agentId
Get agent details.

**Response:**
```json
{
  "success": true,
  "agent": {
    "id": "workflow-agent",
    "type": "workflow",
    "executionCount": 42,
    "tools": ["createWorkflow", "optimizeWorkflow"]
  }
}
```

### POST /api/agents/:agentId/execute
Execute agent task.

**Request Body:**
```json
{
  "task": "Create a workflow to fetch GitHub stars",
  "context": {}
}
```

**Response:**
```json
{
  "success": true,
  "agentId": "workflow-agent",
  "result": {
    "steps": 3,
    "summary": "Completed successfully"
  },
  "duration": 1234
}
```

### POST /api/agents/collaborate
Multi-agent collaboration.

**Request Body:**
```json
{
  "task": "Analyze and optimize workflow",
  "agentIds": ["workflow-agent", "analysis-agent"]
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "agents": 2,
    "successful": 2,
    "combined": "..."
  }
}
```

### DELETE /api/agents/:agentId
Delete agent.

**Response:**
```json
{
  "success": true,
  "message": "Agent deleted"
}
```

---

## 8. ML

### GET /api/ml/models
List ML models.

**Response:**
```json
{
  "success": true,
  "models": [
    {
      "id": "workflow-optimizer",
      "name": "Workflow Optimizer",
      "type": "optimization",
      "accuracy": 0.92
    }
  ],
  "count": 3
}
```

### GET /api/ml/models/:modelId
Get model details.

**Response:**
```json
{
  "success": true,
  "model": {
    "id": "workflow-optimizer",
    "accuracy": 0.92,
    "lastTrained": 1234567890
  }
}
```

### POST /api/ml/predict
Make prediction.

**Request Body:**
```json
{
  "modelId": "workflow-optimizer",
  "input": {
    "nodes": [ ... ],
    "connections": [ ... ]
  }
}
```

**Response:**
```json
{
  "success": true,
  "prediction": {
    "optimizations": [ ... ],
    "estimatedSpeedup": 1.85
  },
  "confidence": 0.92
}
```

### POST /api/ml/train
Train model.

**Request Body:**
```json
{
  "modelId": "workflow-optimizer",
  "data": [ ... ],
  "labels": [ ... ]
}
```

**Response:**
```json
{
  "success": true,
  "accuracy": 0.94,
  "samples": 1000
}
```

### POST /api/ml/analyze-workflow
Analyze workflow with ML.

**Request Body:**
```json
{
  "workflow": {
    "nodes": [ ... ],
    "connections": [ ... ]
  }
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "optimization": { ... },
    "performance": { ... },
    "recommendations": [ ... ]
  }
}
```

---

## 9. Integrations

### GET /api/integrations
List all integrations.

**Response:**
```json
{
  "success": true,
  "integrations": [ ... ],
  "count": 800
}
```

### GET /api/integrations/manifest
Get integrations manifest (800+ integrations).

**Response:**
```json
{
  "success": true,
  "total": 800,
  "manifest": {
    "productivity": [ ... ],
    "communication": [ ... ],
    ...
  },
  "categories": ["productivity", "communication", ...]
}
```

### GET /api/integrations/search?q=slack
Search integrations.

**Response:**
```json
{
  "success": true,
  "results": [ ... ],
  "count": 5
}
```

### POST /api/integrations/:id/execute
Execute integration action.

**Request Body:**
```json
{
  "action": "sendMessage",
  "params": {
    "channel": "#general",
    "text": "Hello!"
  }
}
```

**Response:**
```json
{
  "success": true,
  "result": { ... }
}
```

---

## 10. Self-Evolution

### GET /api/evolution/stats
Get evolution statistics.

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalEvolutions": 42,
    "successRate": 0.95,
    "lastEvolution": 1234567890
  }
}
```

### GET /api/evolution/history
Get evolution history.

**Response:**
```json
{
  "success": true,
  "history": [ ... ],
  "count": 42
}
```

### POST /api/evolution/trigger
Manually trigger evolution.

**Response:**
```json
{
  "success": true,
  "message": "Evolution triggered"
}
```

---

## 11. Self-Debugging

### GET /api/debug/stats
Get debugging statistics.

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalBugs": 10,
    "fixedBugs": 8,
    "successRate": 0.8
  }
}
```

### GET /api/debug/bugs
List detected bugs.

**Response:**
```json
{
  "success": true,
  "bugs": [ ... ],
  "count": 10
}
```

### GET /api/debug/fixes
List applied fixes.

**Response:**
```json
{
  "success": true,
  "fixes": [ ... ],
  "count": 8
}
```

### POST /api/debug/analyze
Analyze code for bugs.

**Request Body:**
```json
{
  "code": "function test() { ... }"
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "bugs": [ ... ],
    "suggestions": [ ... ]
  }
}
```

---

## 12. Database

### GET /api/database/stats
Get database statistics.

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalCollections": 4,
    "totalDocuments": 150,
    "encryption": true
  }
}
```

### POST /api/database/backup
Create database backup.

**Request Body:**
```json
{
  "backupPath": "./backups"
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "backupPath": "./backups/backup-2024-01-01",
    "collections": 4
  }
}
```

---

## 13. Authentication

### POST /api/auth/register
Register new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "viewer"
}
```

**Response:**
```json
{
  "success": true,
  "userId": "user_1234567890",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### POST /api/auth/login
Login user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "userId": "user_123",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## 14. Metrics

### GET /api/metrics
Get comprehensive system metrics.

**Response:**
```json
{
  "success": true,
  "metrics": {
    "orchestrator": { ... },
    "scalability": { ... },
    "agents": { ... },
    "integrations": { ... },
    "evolution": { ... },
    "debugging": { ... }
  }
}
```

---

## 15. Audit

### GET /api/audit
Get audit logs.

**Query Parameters:**
- `userId` - Filter by user ID
- `action` - Filter by action
- `startDate` - Start date
- `endDate` - End date

**Response:**
```json
{
  "success": true,
  "logs": [ ... ]
}
```

---

## 🔐 Authentication

Most endpoints require authentication. Include JWT token in header:

```
Authorization: Bearer <token>
```

Get token from `/api/auth/login` or `/api/auth/register`.

---

## 📊 Response Format

All responses follow this format:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## 🚀 Rate Limits

- **Default:** 1000 requests per 15 minutes per IP
- **Premium:** Unlimited

---

## 📝 Notes

- All timestamps are in Unix milliseconds
- All dates are ISO 8601 format
- File uploads limited to 50MB
- WebSocket available at `ws://localhost:3000`

---

**Total API Endpoints: 57**

**R3SN - Revolutionary AI Automation Platform** 🚀
