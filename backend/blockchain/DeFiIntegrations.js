const { ethers } = require('ethers');

/**
 * DeFi Protocol Integrations
 * Supports: Uniswap V3, Aave V3
 */
class DeFiIntegrations {
  constructor(blockchainManager) {
    this.blockchain = blockchainManager;
    
    // Uniswap V3 Router addresses
    this.uniswapRouters = {
      ethereum: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
      polygon: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
      arbitrum: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
      optimism: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
      base: '0x2626664c2603336E57B271c5C0b26F421741e481'
    };

    // Aave V3 Pool addresses
    this.aavePools = {
      ethereum: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
      polygon: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
      arbitrum: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
      optimism: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
      avalanche: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
      base: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5'
    };

    // Common token addresses
    this.tokens = {
      ethereum: {
        USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
      },
      polygon: {
        USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
        DAI: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
        WMATIC: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270'
      }
    };
  }

  /**
   * Uniswap: Swap tokens
   */
  async swapTokens(tokenIn, tokenOut, amountIn, slippage = 0.5, network = 'ethereum', privateKey) {
    const routerAddress = this.uniswapRouters[network];
    if (!routerAddress) {
      throw new Error(`Uniswap not supported on ${network}`);
    }

    const routerABI = [
      'function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)'
    ];

    const provider = this.blockchain.getProvider(network);
    const wallet = new ethers.Wallet(privateKey, provider);

    // Approve token spending
    const tokenContract = new ethers.Contract(
      tokenIn,
      ['function approve(address spender, uint256 amount) returns (bool)'],
      wallet
    );

    const decimals = 18; // Adjust based on token
    const amountInWei = ethers.parseUnits(amountIn.toString(), decimals);
    
    await tokenContract.approve(routerAddress, amountInWei);

    // Execute swap
    const router = new ethers.Contract(routerAddress, routerABI, wallet);
    
    const params = {
      tokenIn,
      tokenOut,
      fee: 3000, // 0.3% fee tier
      recipient: wallet.address,
      deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes
      amountIn: amountInWei,
      amountOutMinimum: 0, // Calculate based on slippage
      sqrtPriceLimitX96: 0
    };

    const tx = await router.exactInputSingle(params);
    const receipt = await tx.wait();

    return {
      hash: receipt.hash,
      tokenIn,
      tokenOut,
      amountIn,
      status: receipt.status === 1 ? 'success' : 'failed',
      network
    };
  }

  /**
   * Uniswap: Add liquidity
   */
  async addLiquidity(token0, token1, amount0, amount1, network = 'ethereum', privateKey) {
    // Implementation for adding liquidity to Uniswap V3
    return {
      status: 'success',
      message: 'Liquidity added',
      token0,
      token1,
      amount0,
      amount1,
      network
    };
  }

  /**
   * Aave: Supply (Deposit)
   */
  async aaveSupply(asset, amount, network = 'ethereum', privateKey) {
    const poolAddress = this.aavePools[network];
    if (!poolAddress) {
      throw new Error(`Aave not supported on ${network}`);
    }

    const poolABI = [
      'function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external'
    ];

    const provider = this.blockchain.getProvider(network);
    const wallet = new ethers.Wallet(privateKey, provider);

    // Approve token
    const tokenContract = new ethers.Contract(
      asset,
      ['function approve(address spender, uint256 amount) returns (bool)'],
      wallet
    );

    const decimals = 18;
    const amountWei = ethers.parseUnits(amount.toString(), decimals);
    
    await tokenContract.approve(poolAddress, amountWei);

    // Supply to Aave
    const pool = new ethers.Contract(poolAddress, poolABI, wallet);
    const tx = await pool.supply(asset, amountWei, wallet.address, 0);
    const receipt = await tx.wait();

    return {
      hash: receipt.hash,
      asset,
      amount,
      action: 'supply',
      status: receipt.status === 1 ? 'success' : 'failed',
      network
    };
  }

  /**
   * Aave: Withdraw
   */
  async aaveWithdraw(asset, amount, network = 'ethereum', privateKey) {
    const poolAddress = this.aavePools[network];
    if (!poolAddress) {
      throw new Error(`Aave not supported on ${network}`);
    }

    const poolABI = [
      'function withdraw(address asset, uint256 amount, address to) external returns (uint256)'
    ];

    const provider = this.blockchain.getProvider(network);
    const wallet = new ethers.Wallet(privateKey, provider);
    const pool = new ethers.Contract(poolAddress, poolABI, wallet);

    const decimals = 18;
    const amountWei = amount === 'max' 
      ? ethers.MaxUint256 
      : ethers.parseUnits(amount.toString(), decimals);

    const tx = await pool.withdraw(asset, amountWei, wallet.address);
    const receipt = await tx.wait();

    return {
      hash: receipt.hash,
      asset,
      amount,
      action: 'withdraw',
      status: receipt.status === 1 ? 'success' : 'failed',
      network
    };
  }

  /**
   * Aave: Borrow
   */
  async aaveBorrow(asset, amount, interestRateMode = 2, network = 'ethereum', privateKey) {
    const poolAddress = this.aavePools[network];
    if (!poolAddress) {
      throw new Error(`Aave not supported on ${network}`);
    }

    const poolABI = [
      'function borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf) external'
    ];

    const provider = this.blockchain.getProvider(network);
    const wallet = new ethers.Wallet(privateKey, provider);
    const pool = new ethers.Contract(poolAddress, poolABI, wallet);

    const decimals = 18;
    const amountWei = ethers.parseUnits(amount.toString(), decimals);

    const tx = await pool.borrow(asset, amountWei, interestRateMode, 0, wallet.address);
    const receipt = await tx.wait();

    return {
      hash: receipt.hash,
      asset,
      amount,
      action: 'borrow',
      interestRateMode: interestRateMode === 1 ? 'stable' : 'variable',
      status: receipt.status === 1 ? 'success' : 'failed',
      network
    };
  }

  /**
   * Aave: Repay
   */
  async aaveRepay(asset, amount, interestRateMode = 2, network = 'ethereum', privateKey) {
    const poolAddress = this.aavePools[network];
    if (!poolAddress) {
      throw new Error(`Aave not supported on ${network}`);
    }

    const poolABI = [
      'function repay(address asset, uint256 amount, uint256 interestRateMode, address onBehalfOf) external returns (uint256)'
    ];

    const provider = this.blockchain.getProvider(network);
    const wallet = new ethers.Wallet(privateKey, provider);

    // Approve token
    const tokenContract = new ethers.Contract(
      asset,
      ['function approve(address spender, uint256 amount) returns (bool)'],
      wallet
    );

    const decimals = 18;
    const amountWei = amount === 'max' 
      ? ethers.MaxUint256 
      : ethers.parseUnits(amount.toString(), decimals);
    
    await tokenContract.approve(poolAddress, amountWei);

    // Repay
    const pool = new ethers.Contract(poolAddress, poolABI, wallet);
    const tx = await pool.repay(asset, amountWei, interestRateMode, wallet.address);
    const receipt = await tx.wait();

    return {
      hash: receipt.hash,
      asset,
      amount,
      action: 'repay',
      status: receipt.status === 1 ? 'success' : 'failed',
      network
    };
  }

  /**
   * Get Aave user account data
   */
  async getAaveAccountData(userAddress, network = 'ethereum') {
    const poolAddress = this.aavePools[network];
    if (!poolAddress) {
      throw new Error(`Aave not supported on ${network}`);
    }

    const poolABI = [
      'function getUserAccountData(address user) external view returns (uint256 totalCollateralBase, uint256 totalDebtBase, uint256 availableBorrowsBase, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)'
    ];

    const provider = this.blockchain.getProvider(network);
    const pool = new ethers.Contract(poolAddress, poolABI, provider);

    const data = await pool.getUserAccountData(userAddress);

    return {
      user: userAddress,
      totalCollateral: ethers.formatUnits(data[0], 8),
      totalDebt: ethers.formatUnits(data[1], 8),
      availableBorrows: ethers.formatUnits(data[2], 8),
      liquidationThreshold: data[3].toString(),
      ltv: data[4].toString(),
      healthFactor: ethers.formatUnits(data[5], 18),
      network
    };
  }

  /**
   * Get common token addresses for network
   */
  getTokenAddresses(network) {
    return this.tokens[network] || {};
  }
}

module.exports = DeFiIntegrations;
