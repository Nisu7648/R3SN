# ✅ WORKING APIs - R3SN

This document lists the **ACTUALLY WORKING** API endpoints that are implemented and tested.

## 🎯 Simple APIs (NEW - 6 Endpoints)

These are simple, working endpoints without complex dependencies.

### Base URL
```
http://localhost:3000/api
```

---

## 1. Simple Web Search

**Endpoint**: `POST /search/simple`

**Description**: Search using DuckDuckGo (no API key needed)

**Request**:
```json
{
  "query": "artificial intelligence"
}
```

**Response**:
```json
{
  "success": true,
  "query": "artificial intelligence",
  "provider": "DuckDuckGo",
  "results": {
    "abstract": "...",
    "abstractText": "...",
    "abstractSource": "...",
    "abstractURL": "...",
    "image": "...",
    "heading": "...",
    "relatedTopics": [...],
    "answer": "...",
    "type": "..."
  },
  "timestamp": "2025-12-14T..."
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3000/api/search/simple \
  -H "Content-Type: application/json" \
  -d '{"query": "artificial intelligence"}'
```

---

## 2. Text Analysis

**Endpoint**: `POST /text/analyze`

**Description**: Analyze text without AI - word count, frequency, reading time

**Request**:
```json
{
  "text": "Your text here..."
}
```

**Response**:
```json
{
  "success": true,
  "analysis": {
    "statistics": {
      "characters": 1234,
      "words": 200,
      "sentences": 15,
      "paragraphs": 3,
      "avgWordLength": 5.2,
      "avgSentenceLength": 13.3
    },
    "topWords": [
      { "word": "example", "count": 5 },
      ...
    ],
    "readingTime": 1
  },
  "timestamp": "2025-12-14T..."
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3000/api/text/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "This is a sample text for analysis."}'
```

---

## 3. URL Metadata Extractor

**Endpoint**: `POST /url/metadata`

**Description**: Extract metadata from any URL

**Request**:
```json
{
  "url": "https://example.com"
}
```

**Response**:
```json
{
  "success": true,
  "metadata": {
    "url": "https://example.com",
    "title": "Example Domain",
    "description": "...",
    "image": "...",
    "siteName": "...",
    "type": "website",
    "author": "...",
    "keywords": "...",
    "canonical": "...",
    "favicon": "...",
    "language": "en"
  },
  "timestamp": "2025-12-14T..."
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3000/api/url/metadata \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com"}'
```

---

## 4. Data Transformation

**Endpoint**: `POST /data/transform`

**Description**: Convert between JSON, CSV, XML

**Request (JSON to CSV)**:
```json
{
  "data": [
    {"name": "John", "age": 30},
    {"name": "Jane", "age": 25}
  ],
  "from": "json",
  "to": "csv"
}
```

**Response**:
```json
{
  "success": true,
  "from": "json",
  "to": "csv",
  "result": "name,age\nJohn,30\nJane,25",
  "timestamp": "2025-12-14T..."
}
```

**Supported Transformations**:
- JSON → CSV
- CSV → JSON
- JSON → XML

**cURL Example**:
```bash
curl -X POST http://localhost:3000/api/data/transform \
  -H "Content-Type: application/json" \
  -d '{
    "data": [{"name": "John", "age": 30}],
    "from": "json",
    "to": "csv"
  }'
```

---

## 5. Math Calculator

**Endpoint**: `POST /math/calculate`

**Description**: Perform mathematical operations

**Request (Expression)**:
```json
{
  "expression": "2 + 2 * 3"
}
```

**Request (Operations)**:
```json
{
  "operation": "average",
  "numbers": [10, 20, 30, 40, 50]
}
```

**Response**:
```json
{
  "success": true,
  "result": 30,
  "input": {...},
  "timestamp": "2025-12-14T..."
}
```

**Supported Operations**:
- `sum` - Sum of all numbers
- `average` - Average of numbers
- `min` - Minimum value
- `max` - Maximum value
- `median` - Median value

**cURL Example**:
```bash
curl -X POST http://localhost:3000/api/math/calculate \
  -H "Content-Type: application/json" \
  -d '{"expression": "10 + 20 * 3"}'
```

---

## 6. String Manipulation

**Endpoint**: `POST /string/manipulate`

**Description**: Perform string operations

**Request**:
```json
{
  "text": "hello world",
  "operations": ["uppercase", "reverse"]
}
```

**Response**:
```json
{
  "success": true,
  "original": "hello world",
  "result": "DLROW OLLEH",
  "operations": ["uppercase", "reverse"],
  "timestamp": "2025-12-14T..."
}
```

**Supported Operations**:
- `uppercase` - Convert to uppercase
- `lowercase` - Convert to lowercase
- `capitalize` - Capitalize each word
- `reverse` - Reverse the string
- `trim` - Remove whitespace
- `removeSpaces` - Remove all spaces
- `slug` - Convert to URL slug

**cURL Example**:
```bash
curl -X POST http://localhost:3000/api/string/manipulate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "hello world",
    "operations": ["uppercase"]
  }'
```

---

## 🔧 System APIs

### Health Check

**Endpoint**: `GET /health`

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-14T...",
  "version": "2.0.0",
  "database": "connected",
  "uptime": 12345,
  "memory": {...}
}
```

**cURL Example**:
```bash
curl http://localhost:3000/health
```

---

### System Stats

**Endpoint**: `GET /api/stats`

**Response**:
```json
{
  "success": true,
  "stats": {
    "agents": 10,
    "workflows": 5,
    "integrations": 800,
    "executions": 1000,
    "uptime": 12345,
    "memory": {...},
    "version": "2.0.0"
  }
}
```

**cURL Example**:
```bash
curl http://localhost:3000/api/stats
```

---

### API Documentation

**Endpoint**: `GET /api/docs`

**Response**:
```json
{
  "success": true,
  "documentation": {
    "complete_guide": "...",
    "quick_start": "...",
    "deployment": "..."
  },
  "categories": {...},
  "total_endpoints": "100+",
  "features": [...]
}
```

**cURL Example**:
```bash
curl http://localhost:3000/api/docs
```

---

## 📝 Testing the APIs

### Using cURL

```bash
# 1. Search
curl -X POST http://localhost:3000/api/search/simple \
  -H "Content-Type: application/json" \
  -d '{"query": "nodejs"}'

# 2. Text Analysis
curl -X POST http://localhost:3000/api/text/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world! This is a test."}'

# 3. URL Metadata
curl -X POST http://localhost:3000/api/url/metadata \
  -H "Content-Type: application/json" \
  -d '{"url": "https://nodejs.org"}'

# 4. Data Transform
curl -X POST http://localhost:3000/api/data/transform \
  -H "Content-Type: application/json" \
  -d '{
    "data": [{"name": "Test", "value": 123}],
    "from": "json",
    "to": "csv"
  }'

# 5. Math
curl -X POST http://localhost:3000/api/math/calculate \
  -H "Content-Type: application/json" \
  -d '{"expression": "5 + 10 * 2"}'

# 6. String
curl -X POST http://localhost:3000/api/string/manipulate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "test string",
    "operations": ["uppercase", "reverse"]
  }'
```

### Using JavaScript/Node.js

```javascript
const axios = require('axios');

// Search
const searchResult = await axios.post('http://localhost:3000/api/search/simple', {
  query: 'nodejs'
});

// Text Analysis
const textAnalysis = await axios.post('http://localhost:3000/api/text/analyze', {
  text: 'Your text here'
});

// URL Metadata
const metadata = await axios.post('http://localhost:3000/api/url/metadata', {
  url: 'https://example.com'
});

// Data Transform
const transformed = await axios.post('http://localhost:3000/api/data/transform', {
  data: [{name: 'Test', value: 123}],
  from: 'json',
  to: 'csv'
});

// Math
const mathResult = await axios.post('http://localhost:3000/api/math/calculate', {
  expression: '10 + 20'
});

// String
const stringResult = await axios.post('http://localhost:3000/api/string/manipulate', {
  text: 'hello',
  operations: ['uppercase']
});
```

### Using Python

```python
import requests

# Search
response = requests.post('http://localhost:3000/api/search/simple', 
    json={'query': 'python'})
print(response.json())

# Text Analysis
response = requests.post('http://localhost:3000/api/text/analyze',
    json={'text': 'Your text here'})
print(response.json())

# URL Metadata
response = requests.post('http://localhost:3000/api/url/metadata',
    json={'url': 'https://python.org'})
print(response.json())

# Data Transform
response = requests.post('http://localhost:3000/api/data/transform',
    json={
        'data': [{'name': 'Test', 'value': 123}],
        'from': 'json',
        'to': 'csv'
    })
print(response.json())

# Math
response = requests.post('http://localhost:3000/api/math/calculate',
    json={'expression': '5 + 10'})
print(response.json())

# String
response = requests.post('http://localhost:3000/api/string/manipulate',
    json={
        'text': 'hello',
        'operations': ['uppercase']
    })
print(response.json())
```

---

## 🚀 Next Steps

These 6 simple APIs are **fully working** and require no external API keys or complex setup.

More advanced APIs (with AI, blockchain, etc.) require:
1. API keys configured in `.env`
2. Database connection
3. Redis cache
4. External service credentials

See [COMPLETE_API_GUIDE.md](./COMPLETE_API_GUIDE.md) for the full list of planned APIs.

---

## 📊 Summary

| Category | Endpoints | Status |
|----------|-----------|--------|
| Simple APIs | 6 | ✅ Working |
| System APIs | 3 | ✅ Working |
| **TOTAL** | **9** | **✅ WORKING** |

These APIs are production-ready and can be used immediately!
