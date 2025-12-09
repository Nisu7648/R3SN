# R3SN API Testing Guide

Complete guide for testing all R3SN API endpoints.

## Setup

1. Start the server:
```bash
npm run dev
```

2. Server runs on: `http://localhost:3000`

## Authentication Flow

### 1. Register a New User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "name": "Test User",
    "role": "user",
    "plan": "free"
  }
}
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Get Current User

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Generate API Key

```bash
curl -X POST http://localhost:3000/api/auth/generate-api-key \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Use API Key in requests:**
```bash
curl -X GET http://localhost:3000/api/agents \
  -H "X-API-Key: YOUR_API_KEY"
```

## Agent Management

### 1. Create an Agent

```bash
curl -X POST http://localhost:3000/api/agents \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Data Processor",
    "type": "executor",
    "capabilities": ["data-processing", "api-calls"],
    "config": {
      "timeout": 30000,
      "retries": 3
    }
  }'
```

### 2. List All Agents

```bash
curl -X GET "http://localhost:3000/api/agents?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Get Agent Details

```bash
curl -X GET http://localhost:3000/api/agents/AGENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Execute Agent

```bash
curl -X POST http://localhost:3000/api/agents/AGENT_ID/execute \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "data": [1, 2, 3, 4, 5],
      "operation": "sum"
    }
  }'
```

### 5. Universal Prompt Executor

```bash
curl -X POST http://localhost:3000/api/agents/execute-prompt \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Fetch latest news about AI, summarize in 3 points, and format as JSON",
    "context": {
      "format": "json",
      "maxLength": 500
    }
  }'
```

### 6. Update Agent

```bash
curl -X PUT http://localhost:3000/api/agents/AGENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Agent Name",
    "status": "active"
  }'
```

### 7. Delete Agent

```bash
curl -X DELETE http://localhost:3000/api/agents/AGENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Integration Management

### 1. List All Integrations

```bash
curl -X GET "http://localhost:3000/api/integrations?category=productivity&page=1&limit=20"
```

### 2. Get Integration Categories

```bash
curl -X GET http://localhost:3000/api/integrations/categories
```

### 3. Get Integration Details

```bash
curl -X GET http://localhost:3000/api/integrations/INTEGRATION_ID
```

### 4. Connect Integration

```bash
curl -X POST http://localhost:3000/api/integrations/INTEGRATION_ID/connect \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "credentials": {
      "apiKey": "your-api-key-here"
    }
  }'
```

### 5. Test Integration Connection

```bash
curl -X POST http://localhost:3000/api/integrations/INTEGRATION_ID/test \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 6. Execute Integration Action

```bash
curl -X POST http://localhost:3000/api/integrations/INTEGRATION_ID/execute \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "send_message",
    "params": {
      "channel": "#general",
      "message": "Hello from R3SN!"
    }
  }'
```

### 7. List Connected Integrations

```bash
curl -X GET http://localhost:3000/api/integrations/user/connected \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 8. Disconnect Integration

```bash
curl -X POST http://localhost:3000/api/integrations/INTEGRATION_ID/disconnect \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Workflow Management

### 1. Create Workflow

```bash
curl -X POST http://localhost:3000/api/automations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Daily Sales Report",
    "description": "Fetch sales data and send report",
    "trigger": {
      "type": "schedule",
      "config": {
        "cron": "0 9 * * *"
      }
    },
    "steps": [
      {
        "type": "integration",
        "action": "fetch_data",
        "config": {
          "source": "database"
        }
      },
      {
        "type": "agent",
        "action": "analyze",
        "config": {
          "analysis_type": "summary"
        }
      },
      {
        "type": "integration",
        "action": "send_email",
        "config": {
          "to": "team@company.com"
        }
      }
    ]
  }'
```

### 2. List Workflows

```bash
curl -X GET "http://localhost:3000/api/automations?status=active&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Get Workflow Details

```bash
curl -X GET http://localhost:3000/api/automations/WORKFLOW_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Execute Workflow

```bash
curl -X POST http://localhost:3000/api/automations/WORKFLOW_ID/execute \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "date": "2024-01-01",
      "region": "US"
    }
  }'
```

### 5. Update Workflow

```bash
curl -X PUT http://localhost:3000/api/automations/WORKFLOW_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Workflow Name",
    "status": "active"
  }'
```

### 6. Duplicate Workflow

```bash
curl -X POST http://localhost:3000/api/automations/WORKFLOW_ID/duplicate \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 7. Get Workflow Analytics

```bash
curl -X GET http://localhost:3000/api/automations/WORKFLOW_ID/analytics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 8. Delete Workflow

```bash
curl -X DELETE http://localhost:3000/api/automations/WORKFLOW_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Plugin Management

### 1. Generate Plugin

```bash
curl -X POST http://localhost:3000/api/plugins/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "appName": "WhatsApp",
    "appPackage": "com.whatsapp",
    "description": "WhatsApp automation plugin",
    "actions": [
      "send_message",
      "read_messages",
      "get_contacts"
    ]
  }'
```

### 2. List Plugins

```bash
curl -X GET "http://localhost:3000/api/plugins?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Get Plugin Details

```bash
curl -X GET http://localhost:3000/api/plugins/PLUGIN_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Execute Plugin

```bash
curl -X POST http://localhost:3000/api/plugins/PLUGIN_ID/execute \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "send_message",
    "params": {
      "to": "+1234567890",
      "message": "Hello from R3SN!"
    }
  }'
```

### 5. Test Plugin

```bash
curl -X POST http://localhost:3000/api/plugins/PLUGIN_ID/test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "send_message",
    "params": {
      "to": "+1234567890",
      "message": "Test message"
    }
  }'
```

### 6. Analyze App

```bash
curl -X POST http://localhost:3000/api/plugins/analyze-app \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "appPackage": "com.instagram.android"
  }'
```

## Execution Monitoring

### 1. List Executions

```bash
curl -X GET "http://localhost:3000/api/executions?type=agent&status=completed&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Get Execution Details

```bash
curl -X GET http://localhost:3000/api/executions/EXECUTION_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Get Execution Logs

```bash
curl -X GET http://localhost:3000/api/executions/EXECUTION_ID/logs \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Get Analytics Overview

```bash
curl -X GET "http://localhost:3000/api/executions/analytics/overview?days=7" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Bulk Delete Executions

```bash
curl -X POST http://localhost:3000/api/executions/bulk-delete \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "executionIds": ["ID1", "ID2", "ID3"]
  }'
```

## System Endpoints

### 1. Health Check

```bash
curl -X GET http://localhost:3000/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "database": "connected",
  "uptime": 12345,
  "memory": {
    "rss": 123456789,
    "heapTotal": 123456789,
    "heapUsed": 123456789
  }
}
```

### 2. System Stats

```bash
curl -X GET http://localhost:3000/api/stats
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "agents": 10,
    "workflows": 5,
    "integrations": 800,
    "executions": 1000
  }
}
```

## Testing with Postman

Import this collection to Postman:

1. Create new collection "R3SN API"
2. Add environment variable `baseUrl` = `http://localhost:3000`
3. Add environment variable `token` = `YOUR_JWT_TOKEN`
4. Use `{{baseUrl}}` and `{{token}}` in requests

## Common Response Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Rate Limits

- Default: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes
- Execution endpoints: 10 requests per minute

## WebSocket Testing

Connect to WebSocket for real-time updates:

```javascript
const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected');
  
  // Subscribe to execution updates
  socket.emit('execution:subscribe', 'EXECUTION_ID');
});

socket.on('agent:progress', (data) => {
  console.log('Agent progress:', data);
});

socket.on('automation:progress', (data) => {
  console.log('Automation progress:', data);
});
```

## Troubleshooting

### Authentication Errors
- Ensure token is valid and not expired
- Check Authorization header format: `Bearer TOKEN`
- Verify user account is active

### Rate Limiting
- Wait for rate limit window to reset
- Use API key for higher limits
- Implement exponential backoff

### Validation Errors
- Check request body matches schema
- Ensure all required fields are present
- Verify data types are correct

## Next Steps

1. Test all endpoints with your token
2. Create agents and workflows
3. Connect integrations
4. Monitor executions
5. Build your automation!
