# 🔗 Blockchain Integration - 7 Networks

Complete blockchain integration supporting **7 major networks** with DeFi and NFT capabilities.

## 📋 Table of Contents
- [Supported Networks](#supported-networks)
- [Features](#features)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [DeFi Operations](#defi-operations)
- [NFT Operations](#nft-operations)
- [Examples](#examples)

---

## 🌐 Supported Networks

| Network | Chain ID | Native Token | Explorer |
|---------|----------|--------------|----------|
| **Ethereum** | 1 | ETH | etherscan.io |
| **Polygon** | 137 | MATIC | polygonscan.com |
| **Binance Smart Chain** | 56 | BNB | bscscan.com |
| **Arbitrum** | 42161 | ETH | arbiscan.io |
| **Optimism** | 10 | ETH | optimistic.etherscan.io |
| **Avalanche** | 43114 | AVAX | snowtrace.io |
| **Base** | 8453 | ETH | basescan.org |

---

## ✨ Features

### Core Blockchain Operations
- ✅ **Wallet Management** - Create, import wallets
- ✅ **Balance Checking** - Native & ERC20 tokens
- ✅ **Token Transfers** - Send ETH, MATIC, BNB, etc.
- ✅ **ERC20 Operations** - Transfer any token
- ✅ **Smart Contracts** - Deploy & interact
- ✅ **Transaction Tracking** - Real-time monitoring
- ✅ **Gas Estimation** - Optimize costs
- ✅ **Event Listening** - Contract events

### DeFi Protocols
- 🦄 **Uniswap V3** - Token swaps, liquidity
- 🏦 **Aave V3** - Lending, borrowing, supply

### NFT Support
- 🎨 **ERC721** - Standard NFTs
- 🎭 **ERC1155** - Multi-token standard
- 🖼️ **Metadata** - IPFS & HTTP support

---

## 🚀 Quick Start

### 1. Environment Setup

```bash
# .env file
ETHEREUM_RPC=https://eth.llamarpc.com
POLYGON_RPC=https://polygon-rpc.com
BSC_RPC=https://bsc-dataseed.binance.org
ARBITRUM_RPC=https://arb1.arbitrum.io/rpc
OPTIMISM_RPC=https://mainnet.optimism.io
AVALANCHE_RPC=https://api.avax.network/ext/bc/C/rpc
BASE_RPC=https://mainnet.base.org
```

### 2. Initialize Blockchain Manager

```javascript
const BlockchainManager = require('./backend/blockchain/BlockchainManager');
const blockchain = new BlockchainManager();

// Get supported networks
const networks = blockchain.getSupportedNetworks();
console.log(networks);
```

### 3. Create Wallet

```javascript
// Create new wallet
const wallet = await blockchain.createWallet('ethereum');
console.log('Address:', wallet.address);
console.log('Private Key:', wallet.privateKey);

// Import existing wallet
const imported = await blockchain.createWallet('polygon', 'YOUR_PRIVATE_KEY');
```

---

## 📚 API Reference

### Network Operations

#### Get Network Status
```http
GET /api/blockchain/network/:network/status
```

**Example:**
```bash
curl http://localhost:3000/api/blockchain/network/ethereum/status
```

**Response:**
```json
{
  "network": "ethereum",
  "chainId": 1,
  "blockNumber": 18500000,
  "gasPrice": "25.5",
  "status": "connected"
}
```

#### Get All Networks
```http
GET /api/blockchain/networks
```

### Wallet Operations

#### Create Wallet
```http
POST /api/blockchain/wallet/create
Content-Type: application/json

{
  "network": "ethereum",
  "privateKey": "optional"
}
```

#### Get Balance
```http
GET /api/blockchain/balance/:address?network=ethereum
```

**Example:**
```bash
curl "http://localhost:3000/api/blockchain/balance/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb?network=polygon"
```

**Response:**
```json
{
  "success": true,
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "network": "polygon",
  "balance": "125.5",
  "balanceWei": "125500000000000000000"
}
```

### Token Operations

#### Get Token Balance
```http
GET /api/blockchain/token/balance?tokenAddress=0x...&walletAddress=0x...&network=ethereum
```

#### Transfer Tokens
```http
POST /api/blockchain/token/transfer
Content-Type: application/json

{
  "tokenAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "amount": "100",
  "network": "ethereum",
  "privateKey": "YOUR_PRIVATE_KEY"
}
```

### Transaction Operations

#### Send Native Token
```http
POST /api/blockchain/transfer
Content-Type: application/json

{
  "from": "0xYourAddress",
  "to": "0xRecipientAddress",
  "amount": "0.1",
  "network": "ethereum",
  "privateKey": "YOUR_PRIVATE_KEY"
}
```

#### Get Transaction
```http
GET /api/blockchain/transaction/:hash?network=ethereum
```

#### Get Gas Price
```http
GET /api/blockchain/gas-price?network=ethereum
```

---

## 💰 DeFi Operations

### Uniswap Integration

#### Swap Tokens
```http
POST /api/blockchain/defi/uniswap/swap
Content-Type: application/json

{
  "tokenIn": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "tokenOut": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  "amountIn": "1000",
  "slippage": 0.5,
  "network": "ethereum",
  "privateKey": "YOUR_PRIVATE_KEY"
}
```

**Supported Networks:** Ethereum, Polygon, Arbitrum, Optimism, Base

### Aave Integration

#### Supply (Deposit)
```http
POST /api/blockchain/defi/aave/supply
Content-Type: application/json

{
  "asset": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "amount": "1000",
  "network": "ethereum",
  "privateKey": "YOUR_PRIVATE_KEY"
}
```

#### Withdraw
```http
POST /api/blockchain/defi/aave/withdraw
Content-Type: application/json

{
  "asset": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "amount": "500",
  "network": "ethereum",
  "privateKey": "YOUR_PRIVATE_KEY"
}
```

#### Borrow
```http
POST /api/blockchain/defi/aave/borrow
Content-Type: application/json

{
  "asset": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "amount": "100",
  "interestRateMode": 2,
  "network": "ethereum",
  "privateKey": "YOUR_PRIVATE_KEY"
}
```

#### Repay
```http
POST /api/blockchain/defi/aave/repay
Content-Type: application/json

{
  "asset": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "amount": "50",
  "interestRateMode": 2,
  "network": "ethereum",
  "privateKey": "YOUR_PRIVATE_KEY"
}
```

#### Get Account Data
```http
GET /api/blockchain/defi/aave/account/:address?network=ethereum
```

**Response:**
```json
{
  "success": true,
  "user": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "totalCollateral": "10000.50",
  "totalDebt": "2500.25",
  "availableBorrows": "5000.00",
  "healthFactor": "2.5",
  "network": "ethereum"
}
```

**Supported Networks:** Ethereum, Polygon, Arbitrum, Optimism, Avalanche, Base

---

## 🎨 NFT Operations

### ERC721 (Standard NFTs)

#### Mint NFT
```http
POST /api/blockchain/nft/mint/erc721
Content-Type: application/json

{
  "contractAddress": "0xYourNFTContract",
  "to": "0xRecipientAddress",
  "tokenId": 1,
  "network": "ethereum",
  "privateKey": "YOUR_PRIVATE_KEY"
}
```

#### Transfer NFT
```http
POST /api/blockchain/nft/transfer/erc721
Content-Type: application/json

{
  "contractAddress": "0xYourNFTContract",
  "from": "0xYourAddress",
  "to": "0xRecipientAddress",
  "tokenId": 1,
  "network": "ethereum",
  "privateKey": "YOUR_PRIVATE_KEY"
}
```

#### Get NFT Owner
```http
GET /api/blockchain/nft/owner/erc721?contractAddress=0x...&tokenId=1&network=ethereum
```

#### Get NFT Metadata
```http
GET /api/blockchain/nft/metadata/erc721?contractAddress=0x...&tokenId=1&network=ethereum
```

**Response:**
```json
{
  "success": true,
  "contract": "0xYourNFTContract",
  "tokenId": "1",
  "tokenURI": "ipfs://QmXxx...",
  "owner": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "metadata": {
    "name": "Cool NFT #1",
    "description": "An awesome NFT",
    "image": "ipfs://QmYyy...",
    "attributes": [...]
  },
  "type": "ERC721",
  "network": "ethereum"
}
```

#### Get Collection Info
```http
GET /api/blockchain/nft/collection/erc721?contractAddress=0x...&network=ethereum
```

---

## 💡 Examples

### Example 1: Check Wallet Balance Across All Networks

```javascript
const networks = ['ethereum', 'polygon', 'bsc', 'arbitrum', 'optimism', 'avalanche', 'base'];
const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

for (const network of networks) {
  const balance = await blockchain.getBalance(address, network);
  console.log(`${network}: ${balance.balance} ${balance.network}`);
}
```

### Example 2: Swap USDC to ETH on Uniswap

```javascript
const defi = new DeFiIntegrations(blockchain);

const result = await defi.swapTokens(
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
  '1000', // 1000 USDC
  0.5, // 0.5% slippage
  'ethereum',
  'YOUR_PRIVATE_KEY'
);

console.log('Swap successful:', result.hash);
```

### Example 3: Supply to Aave and Borrow

```javascript
// Supply 1000 USDC
await defi.aaveSupply(
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  '1000',
  'ethereum',
  'YOUR_PRIVATE_KEY'
);

// Borrow 100 USDC
await defi.aaveBorrow(
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  '100',
  2, // Variable rate
  'ethereum',
  'YOUR_PRIVATE_KEY'
);

// Check account health
const account = await defi.getAaveAccountData(
  '0xYourAddress',
  'ethereum'
);
console.log('Health Factor:', account.healthFactor);
```

### Example 4: Mint and Transfer NFT

```javascript
const nft = new NFTManager(blockchain);

// Mint NFT
const mintResult = await nft.mintERC721(
  '0xYourNFTContract',
  '0xRecipientAddress',
  1,
  'polygon',
  'YOUR_PRIVATE_KEY'
);

// Get metadata
const metadata = await nft.getERC721Metadata(
  '0xYourNFTContract',
  1,
  'polygon'
);

console.log('NFT Metadata:', metadata);
```

---

## 🔒 Security Best Practices

1. **Never expose private keys** in code or logs
2. **Use environment variables** for sensitive data
3. **Validate all inputs** before blockchain operations
4. **Test on testnets** before mainnet deployment
5. **Implement rate limiting** for API endpoints
6. **Monitor gas prices** to avoid overpaying
7. **Use hardware wallets** for production

---

## 🛠️ Troubleshooting

### Common Issues

**Issue:** Transaction fails with "insufficient funds"
- **Solution:** Check wallet balance and gas price

**Issue:** "Provider not found for network"
- **Solution:** Verify network name and RPC URL in .env

**Issue:** NFT metadata not loading
- **Solution:** Check IPFS gateway availability

---

## 📞 Support

For issues or questions:
- GitHub Issues: [R3SN Issues](https://github.com/Nisu7648/R3SN/issues)
- Documentation: [Full Docs](https://github.com/Nisu7648/R3SN/docs)

---

**Built with ❤️ for the Web3 community**
