const express = require('express');
const router = express.Router();
const BlockchainManager = require('../blockchain/BlockchainManager');
const DeFiIntegrations = require('../blockchain/DeFiIntegrations');
const NFTManager = require('../blockchain/NFTManager');

// Initialize managers
const blockchain = new BlockchainManager();
const defi = new DeFiIntegrations(blockchain);
const nft = new NFTManager(blockchain);

/**
 * @route GET /api/blockchain/networks
 * @desc Get all supported networks
 */
router.get('/networks', (req, res) => {
  try {
    const networks = blockchain.getSupportedNetworks();
    res.json({
      success: true,
      count: networks.length,
      networks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/blockchain/network/:network/status
 * @desc Get network status
 */
router.get('/network/:network/status', async (req, res) => {
  try {
    const status = await blockchain.getNetworkStatus(req.params.network);
    res.json(status);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/blockchain/wallet/create
 * @desc Create new wallet
 */
router.post('/wallet/create', async (req, res) => {
  try {
    const { network, privateKey } = req.body;
    const wallet = await blockchain.createWallet(network, privateKey);
    res.json({
      success: true,
      wallet
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/blockchain/balance/:address
 * @desc Get wallet balance
 */
router.get('/balance/:address', async (req, res) => {
  try {
    const { network = 'ethereum' } = req.query;
    const balance = await blockchain.getBalance(req.params.address, network);
    res.json({
      success: true,
      ...balance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/blockchain/transfer
 * @desc Send native tokens
 */
router.post('/transfer', async (req, res) => {
  try {
    const { from, to, amount, network, privateKey } = req.body;
    const result = await blockchain.sendTransaction(from, to, amount, network, privateKey);
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/blockchain/token/balance
 * @desc Get ERC20 token balance
 */
router.get('/token/balance', async (req, res) => {
  try {
    const { tokenAddress, walletAddress, network = 'ethereum' } = req.query;
    const balance = await blockchain.getTokenBalance(tokenAddress, walletAddress, network);
    res.json({
      success: true,
      ...balance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/blockchain/token/transfer
 * @desc Transfer ERC20 tokens
 */
router.post('/token/transfer', async (req, res) => {
  try {
    const { tokenAddress, to, amount, network, privateKey } = req.body;
    const result = await blockchain.transferToken(tokenAddress, to, amount, network, privateKey);
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/blockchain/transaction/:hash
 * @desc Get transaction details
 */
router.get('/transaction/:hash', async (req, res) => {
  try {
    const { network = 'ethereum' } = req.query;
    const tx = await blockchain.getTransaction(req.params.hash, network);
    res.json({
      success: true,
      ...tx
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/blockchain/gas-price
 * @desc Get current gas price
 */
router.get('/gas-price', async (req, res) => {
  try {
    const { network = 'ethereum' } = req.query;
    const gasPrice = await blockchain.getGasPrice(network);
    res.json({
      success: true,
      ...gasPrice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== DeFi Routes ====================

/**
 * @route POST /api/blockchain/defi/uniswap/swap
 * @desc Swap tokens on Uniswap
 */
router.post('/defi/uniswap/swap', async (req, res) => {
  try {
    const { tokenIn, tokenOut, amountIn, slippage, network, privateKey } = req.body;
    const result = await defi.swapTokens(tokenIn, tokenOut, amountIn, slippage, network, privateKey);
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/blockchain/defi/aave/supply
 * @desc Supply assets to Aave
 */
router.post('/defi/aave/supply', async (req, res) => {
  try {
    const { asset, amount, network, privateKey } = req.body;
    const result = await defi.aaveSupply(asset, amount, network, privateKey);
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/blockchain/defi/aave/withdraw
 * @desc Withdraw from Aave
 */
router.post('/defi/aave/withdraw', async (req, res) => {
  try {
    const { asset, amount, network, privateKey } = req.body;
    const result = await defi.aaveWithdraw(asset, amount, network, privateKey);
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/blockchain/defi/aave/borrow
 * @desc Borrow from Aave
 */
router.post('/defi/aave/borrow', async (req, res) => {
  try {
    const { asset, amount, interestRateMode, network, privateKey } = req.body;
    const result = await defi.aaveBorrow(asset, amount, interestRateMode, network, privateKey);
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/blockchain/defi/aave/repay
 * @desc Repay Aave loan
 */
router.post('/defi/aave/repay', async (req, res) => {
  try {
    const { asset, amount, interestRateMode, network, privateKey } = req.body;
    const result = await defi.aaveRepay(asset, amount, interestRateMode, network, privateKey);
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/blockchain/defi/aave/account/:address
 * @desc Get Aave account data
 */
router.get('/defi/aave/account/:address', async (req, res) => {
  try {
    const { network = 'ethereum' } = req.query;
    const data = await defi.getAaveAccountData(req.params.address, network);
    res.json({
      success: true,
      ...data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== NFT Routes ====================

/**
 * @route POST /api/blockchain/nft/mint/erc721
 * @desc Mint ERC721 NFT
 */
router.post('/nft/mint/erc721', async (req, res) => {
  try {
    const { contractAddress, to, tokenId, network, privateKey } = req.body;
    const result = await nft.mintERC721(contractAddress, to, tokenId, network, privateKey);
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/blockchain/nft/transfer/erc721
 * @desc Transfer ERC721 NFT
 */
router.post('/nft/transfer/erc721', async (req, res) => {
  try {
    const { contractAddress, from, to, tokenId, network, privateKey } = req.body;
    const result = await nft.transferERC721(contractAddress, from, to, tokenId, network, privateKey);
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/blockchain/nft/owner/erc721
 * @desc Get NFT owner
 */
router.get('/nft/owner/erc721', async (req, res) => {
  try {
    const { contractAddress, tokenId, network = 'ethereum' } = req.query;
    const result = await nft.getERC721Owner(contractAddress, tokenId, network);
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/blockchain/nft/metadata/erc721
 * @desc Get NFT metadata
 */
router.get('/nft/metadata/erc721', async (req, res) => {
  try {
    const { contractAddress, tokenId, network = 'ethereum' } = req.query;
    const result = await nft.getERC721Metadata(contractAddress, tokenId, network);
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/blockchain/nft/collection/erc721
 * @desc Get NFT collection info
 */
router.get('/nft/collection/erc721', async (req, res) => {
  try {
    const { contractAddress, network = 'ethereum' } = req.query;
    const result = await nft.getERC721CollectionInfo(contractAddress, network);
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
