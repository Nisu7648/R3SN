

# 🚀 R3SN COMPLETE API GUIDE

## 📊 Overview

**Total Endpoints**: 100+  
**Categories**: 10  
**Features**: All R3SN capabilities exposed via REST API

---

## 🔗 Base URL

```
http://localhost:3000/api/master
```

---

## 📚 API Categories

### 1. Universal Execution (2 endpoints)
### 2. Web Search (5 endpoints)
### 3. AI Operations (10 endpoints)
### 4. Blockchain (9 endpoints)
### 5. Scheduling (4 endpoints)
### 6. Workflow Optimization (2 endpoints)
### 7. Complex Workflows (1 endpoint)
### 8. System Status (2 endpoints)
### 9. Advanced Operations (2 endpoints)
### 10. Legacy Routes (55+ endpoints)

**Total: 100+ endpoints**

---

## 1️⃣ Universal Execution

### Execute Any Task
```bash
POST /api/master/execute
```

**Body**:
```json
{
  "task": {
    "prompt": "Fetch GitHub trending repos and analyze",
    // OR
    "workflow": { ... },
    // OR
    "agent": { ... },
    // OR
    "integration": { ... },
    // OR
    "blockchain": { ... },
    // OR
    "ai": { ... },
    // OR
    "search": { ... }
  },
  "context": {
    "userId": "user123",
    "priority": "high"
  }
}
```

**Response**:
```json
{
  "success": true,
  "executionId": "exec_1234567890_abc123",
  "taskType": "universal",
  "result": { ... }
}
```

### Execute Universal Prompt
```bash
POST /api/master/execute/prompt
```

**Body**:
```json
{
  "prompt": "Search for AI news, summarize top 5 articles, and send to Slack",
  "context": {}
}
```

---

## 2️⃣ Web Search

### Universal Search (Auto-selects best provider)
```bash
POST /api/master/search
```

**Body**:
```json
{
  "query": "artificial intelligence trends 2025",
  "options": {
    "provider": "auto",
    "limit": 10,
    "offset": 0,
    "language": "en",
    "country": "us",
    "safeSearch": true,
    "freshness": "week",
    "includeImages": false,
    "includeVideos": false,
    "includeNews": true
  }
}
```

**Response**:
```json
{
  "success": true,
  "provider": "serper",
  "query": "artificial intelligence trends 2025",
  "totalResults": 1250000,
  "results": [
    {
      "title": "AI Trends 2025: What to Expect",
      "url": "https://example.com/ai-trends",
      "snippet": "Comprehensive analysis of AI trends...",
      "displayUrl": "example.com",
      "relevanceScore": 95,
      "position": 1
    }
  ],
  "answerBox": {
    "answer": "Top AI trends include...",
    "source": "Wikipedia"
  },
  "relatedSearches": ["AI 2025", "machine learning trends"],
  "domains": ["example.com", "techcrunch.com"],
  "timestamp": "2025-12-11T10:00:00Z"
}
```

### Search with Specific Provider
```bash
POST /api/master/search/:provider
```

**Supported Providers**:
- `google` - Google Search
- `bing` - Bing Search
- `duckduckgo` - DuckDuckGo
- `brave` - Brave Search
- `perplexity` - Perplexity AI
- `youcom` - You.com
- `serper` - Serper API
- `serpapi` - SerpAPI
- `scaleserp` - ScaleSerp
- `valueserp` - ValueSerp

**Example**:
```bash
POST /api/master/search/perplexity
```

### Search and Analyze with AI
```bash
POST /api/master/search/analyze
```

**Body**:
```json
{
  "query": "quantum computing breakthroughs",
  "options": {
    "limit": 10
  }
}
```

**Response includes AI analysis**:
```json
{
  "success": true,
  "results": [ ... ],
  "aiAnalysis": {
    "reasoning": {
      "answer": "Key insights from search results...",
      "confidence": 0.95,
      "sources": ["result1", "result2"]
    }
  }
}
```

### Get Search Statistics
```bash
GET /api/master/search/stats
```

**Response**:
```json
{
  "success": true,
  "stats": {
    "totalSearches": 1523,
    "byProvider": {
      "serper": 850,
      "perplexity": 400,
      "brave": 273
    },
    "cacheSize": 450,
    "rateLimits": { ... }
  }
}
```

---

## 3️⃣ AI Operations

### Analyze Image
```bash
POST /api/master/ai/image/analyze
```

**Body**:
```json
{
  "imageUrl": "https://example.com/image.jpg",
  // OR
  "imageBase64": "data:image/jpeg;base64,...",
  "prompt": "What objects are in this image?",
  "model": "gpt4Vision",
  "options": {}
}
```

**Response**:
```json
{
  "success": true,
  "analysis": {
    "description": "A modern office with computers and people working",
    "objects": ["computer", "desk", "person", "chair"],
    "text": "Welcome to TechCorp",
    "colors": ["#2C3E50", "#ECF0F1", "#3498DB"],
    "emotions": ["focused", "professional"],
    "scene": "indoor_office",
    "quality": {
      "score": 0.92,
      "issues": []
    },
    "metadata": {
      "model": "gpt4Vision",
      "timestamp": "2025-12-11T10:00:00Z",
      "confidence": 0.95
    }
  }
}
```

### Generate Image
```bash
POST /api/master/ai/image/generate
```

**Body**:
```json
{
  "prompt": "A futuristic city at sunset with flying cars",
  "model": "dalle3",
  "size": "1024x1024",
  "quality": "hd",
  "style": "vivid",
  "n": 1
}
```

**Response**:
```json
{
  "success": true,
  "images": [
    {
      "url": "https://example.com/generated-image.png",
      "revisedPrompt": "A futuristic city..."
    }
  ],
  "prompt": "A futuristic city at sunset...",
  "model": "dalle3",
  "metadata": {
    "size": "1024x1024",
    "quality": "hd",
    "style": "vivid",
    "timestamp": "2025-12-11T10:00:00Z"
  }
}
```

### Transcribe Audio
```bash
POST /api/master/ai/audio/transcribe
```

**Body**:
```json
{
  "audioUrl": "https://example.com/audio.mp3",
  // OR
  "audioBase64": "data:audio/mp3;base64,...",
  "language": "en",
  "model": "whisper",
  "options": {}
}
```

**Response**:
```json
{
  "success": true,
  "transcription": {
    "text": "Hello, this is a test recording...",
    "segments": [
      {
        "start": 0.0,
        "end": 2.5,
        "text": "Hello, this is a test"
      }
    ],
    "language": "en",
    "duration": 120,
    "confidence": 0.98,
    "metadata": {
      "model": "whisper",
      "timestamp": "2025-12-11T10:00:00Z"
    }
  }
}
```

### Generate Speech
```bash
POST /api/master/ai/audio/generate
```

**Body**:
```json
{
  "text": "Hello, welcome to R3SN platform",
  "voice": "alloy",
  "model": "elevenLabs",
  "speed": 1.0,
  "options": {}
}
```

### Analyze Video
```bash
POST /api/master/ai/video/analyze
```

**Body**:
```json
{
  "videoUrl": "https://example.com/video.mp4",
  "prompt": "Describe what happens in this video",
  "model": "videoAnalysis",
  "options": {}
}
```

### Generate Video
```bash
POST /api/master/ai/video/generate
```

**Body**:
```json
{
  "prompt": "A cat playing with a ball",
  "images": [],
  "duration": 4,
  "model": "videoGeneration",
  "options": {}
}
```

### Analyze Document
```bash
POST /api/master/ai/document/analyze
```

**Body**:
```json
{
  "documentUrl": "https://example.com/document.pdf",
  // OR
  "documentBase64": "data:application/pdf;base64,...",
  "documentType": "pdf",
  "model": "documentAI",
  "options": {}
}
```

### Multi-Modal Reasoning
```bash
POST /api/master/ai/reasoning
```

**Body**:
```json
{
  "text": "Analyze these inputs comprehensively",
  "images": ["https://example.com/img1.jpg"],
  "audio": ["https://example.com/audio1.mp3"],
  "video": ["https://example.com/video1.mp4"],
  "documents": ["https://example.com/doc1.pdf"],
  "prompt": "What are the key insights?"
}
```

### Start Stream Analysis
```bash
POST /api/master/ai/stream/start
```

**Body**:
```json
{
  "streamUrl": "rtmp://stream-url",
  "type": "video",
  "callback": null,
  "options": {}
}
```

### Stop Stream Analysis
```bash
POST /api/master/ai/stream/stop/:streamId
```

---

## 4️⃣ Blockchain Operations

### Execute Smart Contract
```bash
POST /api/master/blockchain/contract/execute
```

**Body**:
```json
{
  "network": "ethereum",
  "contractAddress": "0x...",
  "abi": [ ... ],
  "functionName": "transfer",
  "args": ["0xRecipient...", "1000000000000000000"],
  "value": "0",
  "gasLimit": null,
  "wallet": "private-key-or-wallet-id"
}
```

**Response**:
```json
{
  "success": true,
  "transactionHash": "0x...",
  "blockNumber": 12345678,
  "gasUsed": "21000",
  "status": 1,
  "logs": [],
  "explorer": "https://etherscan.io/tx/0x..."
}
```

### Read Smart Contract
```bash
POST /api/master/blockchain/contract/read
```

**Body**:
```json
{
  "network": "ethereum",
  "contractAddress": "0x...",
  "abi": [ ... ],
  "functionName": "balanceOf",
  "args": ["0xAddress..."]
}
```

### Monitor Blockchain Events
```bash
POST /api/master/blockchain/events/monitor
```

**Body**:
```json
{
  "network": "ethereum",
  "contractAddress": "0x...",
  "abi": [ ... ],
  "eventName": "Transfer",
  "filters": {
    "from": "0xAddress..."
  },
  "callback": null
}
```

**Response**:
```json
{
  "success": true,
  "listenerId": "ethereum_0x..._Transfer",
  "message": "Monitoring Transfer events"
}
```

### Stop Monitoring Events
```bash
POST /api/master/blockchain/events/stop/:listenerId
```

### Get Balance
```bash
POST /api/master/blockchain/balance
```

**Body**:
```json
{
  "network": "ethereum",
  "address": "0x...",
  "tokenAddress": null
}
```

### Transfer Tokens
```bash
POST /api/master/blockchain/transfer
```

**Body**:
```json
{
  "network": "ethereum",
  "to": "0xRecipient...",
  "amount": "1000000000000000000",
  "tokenAddress": null,
  "wallet": "private-key"
}
```

### DeFi Operations
```bash
POST /api/master/blockchain/defi/:protocol/:operation
```

**Examples**:
```bash
# Uniswap Swap
POST /api/master/blockchain/defi/uniswap/swap
{
  "network": "ethereum",
  "tokenIn": "0xUSDC...",
  "tokenOut": "0xETH...",
  "amountIn": "1000000000",
  "slippage": 0.5,
  "wallet": "private-key"
}

# Aave Deposit
POST /api/master/blockchain/defi/aave/deposit
{
  "network": "ethereum",
  "asset": "0xUSDC...",
  "amount": "1000000000",
  "wallet": "private-key"
}
```

### NFT Operations
```bash
POST /api/master/blockchain/nft/:operation
```

**Examples**:
```bash
# Mint NFT
POST /api/master/blockchain/nft/mint
{
  "network": "polygon",
  "contractAddress": "0x...",
  "to": "0xRecipient...",
  "tokenURI": "ipfs://...",
  "wallet": "private-key"
}

# Get NFT Metadata
POST /api/master/blockchain/nft/getMetadata
{
  "network": "ethereum",
  "contractAddress": "0x...",
  "tokenId": 1
}
```

---

## 5️⃣ Scheduling

### Schedule Task
```bash
POST /api/master/schedule
```

**Body**:
```json
{
  "task": {
    "name": "Daily Report",
    "execute": "function() { ... }",
    "priority": "high",
    "estimatedDuration": 60000
  },
  "options": {
    "scheduleType": "smart",
    "preferredTime": "09:00",
    "deadline": "12:00"
  }
}
```

**Response**:
```json
{
  "success": true,
  "taskId": "task_1234567890_abc123",
  "schedule": {
    "type": "smart",
    "cron": "0 9 * * *",
    "nextRun": "2025-12-12T09:00:00Z",
    "confidence": 0.95
  },
  "optimalTime": {
    "timestamp": "2025-12-12T09:00:00Z",
    "confidence": 0.95,
    "reasoning": "Optimal time - low system load expected"
  }
}
```

### Get Scheduled Tasks
```bash
GET /api/master/schedule/tasks
```

### Get Task Status
```bash
GET /api/master/schedule/tasks/:taskId
```

### Cancel Task
```bash
DELETE /api/master/schedule/tasks/:taskId
```

---

## 6️⃣ Workflow Optimization

### Optimize Workflow
```bash
POST /api/master/optimize/workflow
```

**Body**:
```json
{
  "workflow": {
    "name": "Data Processing Pipeline",
    "nodes": [ ... ],
    "edges": [ ... ]
  },
  "context": {
    "systemLoad": 0.5,
    "availableResources": 1.0
  }
}
```

**Response**:
```json
{
  "success": true,
  "optimizedWorkflow": { ... },
  "executionPlan": {
    "executionOrder": [0, 1, 2, 3],
    "parallelGroups": [[0, 1], [2, 3]],
    "confidence": 0.92
  },
  "parallelizationPlan": {
    "groups": [ ... ],
    "estimatedSpeedup": 2.5
  },
  "resourcePlan": {
    "allocation": [ ... ],
    "utilization": {
      "cpu": 0.7,
      "memory": 0.6
    }
  },
  "failurePredictions": {
    "predictions": [],
    "overallRisk": 0.1
  },
  "recommendations": [ ... ]
}
```

### Train Neural Orchestrator
```bash
POST /api/master/optimize/train
```

**Body**:
```json
{
  "executionData": [
    {
      "workflow": { ... },
      "context": { ... },
      "duration": 5000,
      "success": true
    }
  ]
}
```

---

## 7️⃣ Complex Workflows

### Create Complex Workflow
```bash
POST /api/master/workflow/complex
```

**Body**:
```json
{
  "name": "E-Commerce Order Processing",
  "steps": [
    {
      "type": "http",
      "config": {
        "url": "https://api.shopify.com/orders",
        "method": "GET"
      }
    },
    {
      "type": "ai",
      "config": {
        "operation": "analyze",
        "prompt": "Analyze order for fraud"
      }
    },
    {
      "type": "integration",
      "config": {
        "service": "slack",
        "action": "sendMessage"
      }
    }
  ],
  "schedule": {
    "scheduleType": "smart",
    "preferredTime": "09:00"
  },
  "optimize": true,
  "blockchain": false,
  "ai": true,
  "search": false
}
```

---

## 8️⃣ System Status

### Get System Status
```bash
GET /api/master/status
```

**Response**:
```json
{
  "success": true,
  "status": {
    "initialized": true,
    "engines": {
      "universalExecutor": {
        "loaded": true,
        "type": "UniversalExecutor"
      },
      "webSearch": {
        "loaded": true,
        "type": "WebSearchEngine"
      },
      "multiModalAI": {
        "loaded": true,
        "type": "MultiModalAI"
      },
      "blockchain": {
        "loaded": true,
        "type": "BlockchainIntegrator"
      },
      "quantumScheduler": {
        "loaded": true,
        "type": "QuantumScheduler"
      },
      "neuralOrchestrator": {
        "loaded": true,
        "type": "NeuralOrchestrator"
      }
    },
    "activeExecutions": 5,
    "queuedExecutions": 2
  }
}
```

### Get Statistics
```bash
GET /api/master/statistics
```

**Response**:
```json
{
  "success": true,
  "statistics": {
    "master": {
      "initialized": true,
      "totalExecutions": 1523
    },
    "webSearch": {
      "totalSearches": 850,
      "byProvider": { ... },
      "cacheSize": 450
    },
    "scheduler": {
      "scheduledTasks": 25,
      "executionHistory": 500
    },
    "blockchain": {
      "networks": 7,
      "activeListeners": 3
    }
  }
}
```

---

## 9️⃣ Advanced Operations

### Search and Execute Workflow
```bash
POST /api/master/advanced/search-workflow
```

**Body**:
```json
{
  "searchQuery": "latest AI research papers",
  "workflowConfig": {
    "name": "Research Analysis",
    "steps": [
      {
        "type": "ai",
        "config": {
          "operation": "analyze",
          "prompt": "Summarize key findings"
        }
      }
    ]
  }
}
```

### AI-Powered Blockchain Transaction
```bash
POST /api/master/advanced/ai-blockchain
```

**Body**:
```json
{
  "transaction": {
    "operation": "executeContract",
    "network": "ethereum",
    "contractAddress": "0x...",
    "functionName": "transfer",
    "args": ["0xRecipient...", "1000000000000000000"]
  },
  "verifyWithAI": true
}
```

---

## 🔟 Legacy Routes

All existing R3SN routes are still available:

- `/api/auth/*` - Authentication (8 endpoints)
- `/api/agents/*` - Agent management (10 endpoints)
- `/api/integrations/*` - Integrations (9 endpoints)
- `/api/automations/*` - Workflows (10 endpoints)
- `/api/plugins/*` - Plugins (11 endpoints)
- `/api/executions/*` - Executions (7 endpoints)

**Total Legacy Endpoints**: 55+

---

## 📊 Complete Endpoint Count

| Category | Endpoints |
|----------|-----------|
| Universal Execution | 2 |
| Web Search | 5 |
| AI Operations | 10 |
| Blockchain | 9 |
| Scheduling | 4 |
| Workflow Optimization | 2 |
| Complex Workflows | 1 |
| System Status | 2 |
| Advanced Operations | 2 |
| **New Total** | **37** |
| Legacy Routes | 55+ |
| **Grand Total** | **100+** |

---

## 🚀 Quick Start Examples

### Example 1: Search and Analyze
```bash
curl -X POST http://localhost:3000/api/master/search/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "query": "quantum computing 2025",
    "options": { "limit": 5 }
  }'
```

### Example 2: Generate Image
```bash
curl -X POST http://localhost:3000/api/master/ai/image/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A futuristic city",
    "model": "dalle3",
    "size": "1024x1024"
  }'
```

### Example 3: Execute Smart Contract
```bash
curl -X POST http://localhost:3000/api/master/blockchain/contract/execute \
  -H "Content-Type: application/json" \
  -d '{
    "network": "polygon",
    "contractAddress": "0x...",
    "functionName": "mint",
    "args": ["0xRecipient...", "ipfs://..."]
  }'
```

### Example 4: Schedule Task
```bash
curl -X POST http://localhost:3000/api/master/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "task": {
      "name": "Daily Backup",
      "priority": "high"
    },
    "options": {
      "scheduleType": "smart"
    }
  }'
```

---

## 🎉 Summary

R3SN now provides **100+ REST API endpoints** covering:

✅ Universal task execution  
✅ 10+ web search providers  
✅ Multi-modal AI (image, audio, video, documents)  
✅ 7 blockchain networks  
✅ DeFi & NFT operations  
✅ AI-powered scheduling  
✅ Neural workflow optimization  
✅ Complex workflow creation  
✅ Real-time system monitoring  
✅ Advanced combined operations  

**The most comprehensive automation API available!** 🚀
