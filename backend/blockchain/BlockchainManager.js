const { ethers } = require('ethers');
const EventEmitter = require('events');

/**
 * Blockchain Manager - Multi-chain support for 7 networks
 * Supports: Ethereum, Polygon, BSC, Arbitrum, Optimism, Avalanche, Base
 */
class BlockchainManager extends EventEmitter {
  constructor() {
    super();
    this.providers = new Map();
    this.wallets = new Map();
    this.contracts = new Map();
    
    // Network configurations
    this.networks = {
      ethereum: {
        chainId: 1,
        name: 'Ethereum Mainnet',
        rpc: process.env.ETHEREUM_RPC || 'https://eth.llamarpc.com',
        explorer: 'https://etherscan.io',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }
      },
      polygon: {
        chainId: 137,
        name: 'Polygon Mainnet',
        rpc: process.env.POLYGON_RPC || 'https://polygon-rpc.com',
        explorer: 'https://polygonscan.com',
        nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 }
      },
      bsc: {
        chainId: 56,
        name: 'Binance Smart Chain',
        rpc: process.env.BSC_RPC || 'https://bsc-dataseed.binance.org',
        explorer: 'https://bscscan.com',
        nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 }
      },
      arbitrum: {
        chainId: 42161,
        name: 'Arbitrum One',
        rpc: process.env.ARBITRUM_RPC || 'https://arb1.arbitrum.io/rpc',
        explorer: 'https://arbiscan.io',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }
      },
      optimism: {
        chainId: 10,
        name: 'Optimism',
        rpc: process.env.OPTIMISM_RPC || 'https://mainnet.optimism.io',
        explorer: 'https://optimistic.etherscan.io',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }
      },
      avalanche: {
        chainId: 43114,
        name: 'Avalanche C-Chain',
        rpc: process.env.AVALANCHE_RPC || 'https://api.avax.network/ext/bc/C/rpc',
        explorer: 'https://snowtrace.io',
        nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 }
      },
      base: {
        chainId: 8453,
        name: 'Base',
        rpc: process.env.BASE_RPC || 'https://mainnet.base.org',
        explorer: 'https://basescan.org',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }
      }
    };

    this.initialize();
  }

  /**
   * Initialize providers for all networks
   */
  initialize() {
    for (const [network, config] of Object.entries(this.networks)) {
      try {
        const provider = new ethers.JsonRpcProvider(config.rpc);
        this.providers.set(network, provider);
        this.emit('provider:initialized', { network, config });
      } catch (error) {
        this.emit('provider:error', { network, error: error.message });
      }
    }
  }

  /**
   * Get provider for specific network
   */
  getProvider(network = 'ethereum') {
    if (!this.providers.has(network)) {
      throw new Error(`Provider not found for network: ${network}`);
    }
    return this.providers.get(network);
  }

  /**
   * Create or import wallet
   */
  async createWallet(network = 'ethereum', privateKey = null) {
    const provider = this.getProvider(network);
    
    let wallet;
    if (privateKey) {
      wallet = new ethers.Wallet(privateKey, provider);
    } else {
      wallet = ethers.Wallet.createRandom(provider);
    }

    this.wallets.set(`${network}:${wallet.address}`, wallet);
    
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic?.phrase,
      network
    };
  }

  /**
   * Get wallet balance
   */
  async getBalance(address, network = 'ethereum') {
    const provider = this.getProvider(network);
    const balance = await provider.getBalance(address);
    return {
      address,
      network,
      balance: ethers.formatEther(balance),
      balanceWei: balance.toString()
    };
  }

  /**
   * Send native token (ETH, MATIC, BNB, etc.)
   */
  async sendTransaction(from, to, amount, network = 'ethereum', privateKey) {
    const provider = this.getProvider(network);
    const wallet = new ethers.Wallet(privateKey, provider);

    const tx = await wallet.sendTransaction({
      to,
      value: ethers.parseEther(amount.toString())
    });

    const receipt = await tx.wait();

    return {
      hash: receipt.hash,
      from: receipt.from,
      to: receipt.to,
      value: ethers.formatEther(receipt.value),
      gasUsed: receipt.gasUsed.toString(),
      status: receipt.status === 1 ? 'success' : 'failed',
      blockNumber: receipt.blockNumber,
      network
    };
  }

  /**
   * Get ERC20 token balance
   */
  async getTokenBalance(tokenAddress, walletAddress, network = 'ethereum') {
    const provider = this.getProvider(network);
    
    const erc20ABI = [
      'function balanceOf(address owner) view returns (uint256)',
      'function decimals() view returns (uint8)',
      'function symbol() view returns (string)'
    ];

    const contract = new ethers.Contract(tokenAddress, erc20ABI, provider);
    
    const [balance, decimals, symbol] = await Promise.all([
      contract.balanceOf(walletAddress),
      contract.decimals(),
      contract.symbol()
    ]);

    return {
      token: tokenAddress,
      wallet: walletAddress,
      balance: ethers.formatUnits(balance, decimals),
      symbol,
      decimals,
      network
    };
  }

  /**
   * Transfer ERC20 tokens
   */
  async transferToken(tokenAddress, to, amount, network = 'ethereum', privateKey) {
    const provider = this.getProvider(network);
    const wallet = new ethers.Wallet(privateKey, provider);

    const erc20ABI = [
      'function transfer(address to, uint256 amount) returns (bool)',
      'function decimals() view returns (uint8)'
    ];

    const contract = new ethers.Contract(tokenAddress, erc20ABI, wallet);
    const decimals = await contract.decimals();
    
    const tx = await contract.transfer(to, ethers.parseUnits(amount.toString(), decimals));
    const receipt = await tx.wait();

    return {
      hash: receipt.hash,
      token: tokenAddress,
      to,
      amount,
      status: receipt.status === 1 ? 'success' : 'failed',
      network
    };
  }

  /**
   * Deploy smart contract
   */
  async deployContract(abi, bytecode, constructorArgs = [], network = 'ethereum', privateKey) {
    const provider = this.getProvider(network);
    const wallet = new ethers.Wallet(privateKey, provider);

    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    const contract = await factory.deploy(...constructorArgs);
    await contract.waitForDeployment();

    const address = await contract.getAddress();

    return {
      address,
      deployer: wallet.address,
      network,
      transactionHash: contract.deploymentTransaction().hash
    };
  }

  /**
   * Call smart contract function (read)
   */
  async callContract(contractAddress, abi, functionName, params = [], network = 'ethereum') {
    const provider = this.getProvider(network);
    const contract = new ethers.Contract(contractAddress, abi, provider);

    const result = await contract[functionName](...params);
    
    return {
      contract: contractAddress,
      function: functionName,
      result: result.toString(),
      network
    };
  }

  /**
   * Execute smart contract function (write)
   */
  async executeContract(contractAddress, abi, functionName, params = [], network = 'ethereum', privateKey) {
    const provider = this.getProvider(network);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(contractAddress, abi, wallet);

    const tx = await contract[functionName](...params);
    const receipt = await tx.wait();

    return {
      hash: receipt.hash,
      contract: contractAddress,
      function: functionName,
      status: receipt.status === 1 ? 'success' : 'failed',
      gasUsed: receipt.gasUsed.toString(),
      network
    };
  }

  /**
   * Listen to contract events
   */
  async listenToEvents(contractAddress, abi, eventName, network = 'ethereum', callback) {
    const provider = this.getProvider(network);
    const contract = new ethers.Contract(contractAddress, abi, provider);

    contract.on(eventName, (...args) => {
      const event = args[args.length - 1];
      callback({
        event: eventName,
        contract: contractAddress,
        args: args.slice(0, -1),
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        network
      });
    });

    return {
      contract: contractAddress,
      event: eventName,
      status: 'listening',
      network
    };
  }

  /**
   * Get transaction details
   */
  async getTransaction(txHash, network = 'ethereum') {
    const provider = this.getProvider(network);
    const tx = await provider.getTransaction(txHash);
    const receipt = await provider.getTransactionReceipt(txHash);

    return {
      hash: txHash,
      from: tx.from,
      to: tx.to,
      value: ethers.formatEther(tx.value),
      gasPrice: ethers.formatUnits(tx.gasPrice, 'gwei'),
      gasUsed: receipt?.gasUsed.toString(),
      status: receipt?.status === 1 ? 'success' : 'failed',
      blockNumber: receipt?.blockNumber,
      network
    };
  }

  /**
   * Get gas price
   */
  async getGasPrice(network = 'ethereum') {
    const provider = this.getProvider(network);
    const feeData = await provider.getFeeData();

    return {
      gasPrice: ethers.formatUnits(feeData.gasPrice, 'gwei'),
      maxFeePerGas: feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei') : null,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei') : null,
      network
    };
  }

  /**
   * Get block information
   */
  async getBlock(blockNumber = 'latest', network = 'ethereum') {
    const provider = this.getProvider(network);
    const block = await provider.getBlock(blockNumber);

    return {
      number: block.number,
      hash: block.hash,
      timestamp: block.timestamp,
      transactions: block.transactions.length,
      gasUsed: block.gasUsed.toString(),
      gasLimit: block.gasLimit.toString(),
      network
    };
  }

  /**
   * Estimate gas for transaction
   */
  async estimateGas(transaction, network = 'ethereum') {
    const provider = this.getProvider(network);
    const gasEstimate = await provider.estimateGas(transaction);

    return {
      gasEstimate: gasEstimate.toString(),
      network
    };
  }

  /**
   * Get network status
   */
  async getNetworkStatus(network = 'ethereum') {
    const provider = this.getProvider(network);
    const [blockNumber, gasPrice, network_info] = await Promise.all([
      provider.getBlockNumber(),
      provider.getFeeData(),
      provider.getNetwork()
    ]);

    return {
      network,
      chainId: Number(network_info.chainId),
      blockNumber,
      gasPrice: ethers.formatUnits(gasPrice.gasPrice, 'gwei'),
      status: 'connected'
    };
  }

  /**
   * Get all supported networks
   */
  getSupportedNetworks() {
    return Object.keys(this.networks).map(key => ({
      key,
      ...this.networks[key]
    }));
  }
}

module.exports = BlockchainManager;
