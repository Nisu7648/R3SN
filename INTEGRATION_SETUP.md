# 🛠️ Integration Setup Guide

Quick setup guide for the new blockchain and streaming integrations.

## 📦 Installation

### 1. Install Dependencies

```bash
npm install ethers@^6.9.0 axios@^1.6.0
```

### 2. Environment Configuration

Create or update your `.env` file:

```bash
# ==================== BLOCKCHAIN RPCs ====================
# Ethereum Mainnet
ETHEREUM_RPC=https://eth.llamarpc.com

# Polygon Mainnet
POLYGON_RPC=https://polygon-rpc.com

# Binance Smart Chain
BSC_RPC=https://bsc-dataseed.binance.org

# Arbitrum One
ARBITRUM_RPC=https://arb1.arbitrum.io/rpc

# Optimism Mainnet
OPTIMISM_RPC=https://mainnet.optimism.io

# Avalanche C-Chain
AVALANCHE_RPC=https://api.avax.network/ext/bc/C/rpc

# Base Mainnet
BASE_RPC=https://mainnet.base.org

# ==================== STREAMING APIs ====================
# RapidAPI Key (for Netflix, Prime, Disney+, etc.)
# Get from: https://rapidapi.com
RAPIDAPI_KEY=your_rapidapi_key_here

# YouTube Data API v3
# Get from: https://console.cloud.google.com
YOUTUBE_API_KEY=your_youtube_api_key_here
```

### 3. Update Main Server File

Add the new routes to your Express app (e.g., `backend/server.js` or `index.js`):

```javascript
const express = require('express');
const app = express();

// Import new routes
const blockchainRoutes = require('./backend/routes/blockchain');
const streamingRoutes = require('./backend/routes/streaming');

// Use routes
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/streaming', streamingRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Blockchain API: http://localhost:${PORT}/api/blockchain`);
  console.log(`Streaming API: http://localhost:${PORT}/api/streaming`);
});
```

---

## 🔑 Getting API Keys

### RapidAPI Key (Required for Streaming)

1. Go to [RapidAPI](https://rapidapi.com)
2. Sign up for a free account
3. Subscribe to "Streaming Availability" API
4. Copy your API key
5. Add to `.env` as `RAPIDAPI_KEY`

**Free Tier:** 100 requests/month

### YouTube API Key (Required for YouTube)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable "YouTube Data API v3"
4. Create credentials (API Key)
5. Copy your API key
6. Add to `.env` as `YOUTUBE_API_KEY`

**Free Tier:** 10,000 quota units/day

---

## ✅ Verification

### Test Blockchain Integration

```bash
# Get supported networks
curl http://localhost:3000/api/blockchain/networks

# Check Ethereum status
curl http://localhost:3000/api/blockchain/network/ethereum/status

# Get gas price
curl http://localhost:3000/api/blockchain/gas-price?network=polygon
```

### Test Streaming Integration

```bash
# Get platforms
curl http://localhost:3000/api/streaming/platforms

# Search content
curl "http://localhost:3000/api/streaming/search?query=Inception"

# Get trending
curl http://localhost:3000/api/streaming/trending?platform=netflix
```

---

## 🚀 Quick Start Examples

### Blockchain: Check Balance

```javascript
const axios = require('axios');

async function checkBalance() {
  const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
  const network = 'ethereum';
  
  const response = await axios.get(
    `http://localhost:3000/api/blockchain/balance/${address}?network=${network}`
  );
  
  console.log(response.data);
}

checkBalance();
```

### Streaming: Search Movies

```javascript
const axios = require('axios');

async function searchMovies() {
  const response = await axios.get(
    'http://localhost:3000/api/streaming/search',
    {
      params: {
        query: 'The Matrix',
        type: 'movie'
      }
    }
  );
  
  console.log(response.data);
}

searchMovies();
```

---

## 🔒 Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env` to Git
- ✅ Use `.env.example` for templates
- ✅ Rotate API keys regularly

### 2. Private Keys
- ✅ Never expose in code or logs
- ✅ Use hardware wallets for production
- ✅ Implement key management system

### 3. API Rate Limiting
- ✅ Implement rate limiting middleware
- ✅ Cache responses when possible
- ✅ Monitor API usage

### 4. Input Validation
- ✅ Validate all user inputs
- ✅ Sanitize blockchain addresses
- ✅ Check transaction parameters

---

## 📊 Monitoring

### Health Check Endpoints

Add these to your server:

```javascript
// Blockchain health
app.get('/health/blockchain', async (req, res) => {
  const blockchain = new BlockchainManager();
  const networks = ['ethereum', 'polygon', 'bsc'];
  
  const status = {};
  for (const network of networks) {
    try {
      const info = await blockchain.getNetworkStatus(network);
      status[network] = 'healthy';
    } catch (error) {
      status[network] = 'unhealthy';
    }
  }
  
  res.json({ status });
});

// Streaming health
app.get('/health/streaming', async (req, res) => {
  const streaming = new StreamingManager();
  const stats = streaming.getPlatformStats();
  
  res.json({
    status: 'healthy',
    platforms: stats.enabledPlatforms
  });
});
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Module not found: ethers"
```bash
npm install ethers@^6.9.0
```

#### 2. "Provider not found for network"
Check `.env` file has correct RPC URLs

#### 3. "API key not found"
Verify `RAPIDAPI_KEY` and `YOUTUBE_API_KEY` in `.env`

#### 4. "Rate limit exceeded"
- Implement caching
- Upgrade API plan
- Add request throttling

#### 5. "Transaction failed"
- Check wallet balance
- Verify gas price
- Test on testnet first

---

## 📈 Performance Optimization

### 1. Caching

```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes

// Cache blockchain data
app.get('/api/blockchain/gas-price', async (req, res) => {
  const cacheKey = `gas-${req.query.network}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return res.json(cached);
  }
  
  const data = await blockchain.getGasPrice(req.query.network);
  cache.set(cacheKey, data);
  res.json(data);
});
```

### 2. Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 3. Connection Pooling

```javascript
// Reuse blockchain providers
const providers = new Map();

function getProvider(network) {
  if (!providers.has(network)) {
    providers.set(network, new ethers.JsonRpcProvider(rpcUrl));
  }
  return providers.get(network);
}
```

---

## 🧪 Testing

### Unit Tests

```javascript
const { expect } = require('chai');
const BlockchainManager = require('./backend/blockchain/BlockchainManager');

describe('Blockchain Manager', () => {
  it('should get supported networks', () => {
    const blockchain = new BlockchainManager();
    const networks = blockchain.getSupportedNetworks();
    expect(networks).to.have.lengthOf(7);
  });
  
  it('should get network status', async () => {
    const blockchain = new BlockchainManager();
    const status = await blockchain.getNetworkStatus('ethereum');
    expect(status.chainId).to.equal(1);
  });
});
```

### Integration Tests

```bash
# Test blockchain endpoints
npm run test:blockchain

# Test streaming endpoints
npm run test:streaming
```

---

## 📚 Additional Resources

### Documentation
- [Blockchain Integration Guide](./docs/BLOCKCHAIN_INTEGRATION.md)
- [Streaming Integration Guide](./docs/STREAMING_INTEGRATION.md)
- [Complete Summary](./NEW_INTEGRATIONS_COMPLETE.md)

### External APIs
- [Ethers.js Docs](https://docs.ethers.org)
- [RapidAPI Docs](https://docs.rapidapi.com)
- [YouTube API Docs](https://developers.google.com/youtube/v3)

### Networks
- [Ethereum](https://ethereum.org)
- [Polygon](https://polygon.technology)
- [Arbitrum](https://arbitrum.io)
- [Optimism](https://optimism.io)

---

## 🎯 Next Steps

1. ✅ Install dependencies
2. ✅ Configure environment variables
3. ✅ Get API keys
4. ✅ Update server file
5. ✅ Test endpoints
6. ✅ Deploy to production

---

## 📞 Support

Need help?
- GitHub Issues: [R3SN Issues](https://github.com/Nisu7648/R3SN/issues)
- Documentation: See `/docs` folder

---

**Ready to go! 🚀**
