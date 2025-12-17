const { ethers } = require('ethers');

/**
 * NFT Manager - ERC721 and ERC1155 operations
 * Supports minting, transferring, and querying NFTs across all networks
 */
class NFTManager {
  constructor(blockchainManager) {
    this.blockchain = blockchainManager;
    
    // ERC721 ABI
    this.erc721ABI = [
      'function mint(address to, uint256 tokenId) external',
      'function safeMint(address to, uint256 tokenId) external',
      'function transferFrom(address from, address to, uint256 tokenId) external',
      'function safeTransferFrom(address from, address to, uint256 tokenId) external',
      'function ownerOf(uint256 tokenId) view returns (address)',
      'function balanceOf(address owner) view returns (uint256)',
      'function tokenURI(uint256 tokenId) view returns (string)',
      'function approve(address to, uint256 tokenId) external',
      'function setApprovalForAll(address operator, bool approved) external',
      'function getApproved(uint256 tokenId) view returns (address)',
      'function isApprovedForAll(address owner, address operator) view returns (bool)',
      'function name() view returns (string)',
      'function symbol() view returns (string)',
      'function totalSupply() view returns (uint256)'
    ];

    // ERC1155 ABI
    this.erc1155ABI = [
      'function mint(address to, uint256 id, uint256 amount, bytes data) external',
      'function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data) external',
      'function safeBatchTransferFrom(address from, address to, uint256[] ids, uint256[] amounts, bytes data) external',
      'function balanceOf(address account, uint256 id) view returns (uint256)',
      'function balanceOfBatch(address[] accounts, uint256[] ids) view returns (uint256[])',
      'function setApprovalForAll(address operator, bool approved) external',
      'function isApprovedForAll(address account, address operator) view returns (bool)',
      'function uri(uint256 id) view returns (string)'
    ];
  }

  /**
   * Mint ERC721 NFT
   */
  async mintERC721(contractAddress, to, tokenId, network = 'ethereum', privateKey) {
    const provider = this.blockchain.getProvider(network);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(contractAddress, this.erc721ABI, wallet);

    try {
      const tx = await contract.safeMint(to, tokenId);
      const receipt = await tx.wait();

      return {
        hash: receipt.hash,
        contract: contractAddress,
        to,
        tokenId: tokenId.toString(),
        type: 'ERC721',
        action: 'mint',
        status: receipt.status === 1 ? 'success' : 'failed',
        network
      };
    } catch (error) {
      throw new Error(`Failed to mint NFT: ${error.message}`);
    }
  }

  /**
   * Transfer ERC721 NFT
   */
  async transferERC721(contractAddress, from, to, tokenId, network = 'ethereum', privateKey) {
    const provider = this.blockchain.getProvider(network);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(contractAddress, this.erc721ABI, wallet);

    const tx = await contract.safeTransferFrom(from, to, tokenId);
    const receipt = await tx.wait();

    return {
      hash: receipt.hash,
      contract: contractAddress,
      from,
      to,
      tokenId: tokenId.toString(),
      type: 'ERC721',
      action: 'transfer',
      status: receipt.status === 1 ? 'success' : 'failed',
      network
    };
  }

  /**
   * Get NFT owner
   */
  async getERC721Owner(contractAddress, tokenId, network = 'ethereum') {
    const provider = this.blockchain.getProvider(network);
    const contract = new ethers.Contract(contractAddress, this.erc721ABI, provider);

    const owner = await contract.ownerOf(tokenId);

    return {
      contract: contractAddress,
      tokenId: tokenId.toString(),
      owner,
      type: 'ERC721',
      network
    };
  }

  /**
   * Get NFT metadata URI
   */
  async getERC721Metadata(contractAddress, tokenId, network = 'ethereum') {
    const provider = this.blockchain.getProvider(network);
    const contract = new ethers.Contract(contractAddress, this.erc721ABI, provider);

    const [tokenURI, owner] = await Promise.all([
      contract.tokenURI(tokenId),
      contract.ownerOf(tokenId)
    ]);

    // Fetch metadata from URI if it's HTTP
    let metadata = null;
    if (tokenURI.startsWith('http')) {
      try {
        const response = await fetch(tokenURI);
        metadata = await response.json();
      } catch (error) {
        metadata = { error: 'Failed to fetch metadata' };
      }
    }

    return {
      contract: contractAddress,
      tokenId: tokenId.toString(),
      tokenURI,
      owner,
      metadata,
      type: 'ERC721',
      network
    };
  }

  /**
   * Get NFT balance for address
   */
  async getERC721Balance(contractAddress, ownerAddress, network = 'ethereum') {
    const provider = this.blockchain.getProvider(network);
    const contract = new ethers.Contract(contractAddress, this.erc721ABI, provider);

    const balance = await contract.balanceOf(ownerAddress);

    return {
      contract: contractAddress,
      owner: ownerAddress,
      balance: balance.toString(),
      type: 'ERC721',
      network
    };
  }

  /**
   * Get NFT collection info
   */
  async getERC721CollectionInfo(contractAddress, network = 'ethereum') {
    const provider = this.blockchain.getProvider(network);
    const contract = new ethers.Contract(contractAddress, this.erc721ABI, provider);

    try {
      const [name, symbol, totalSupply] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.totalSupply().catch(() => 'N/A')
      ]);

      return {
        contract: contractAddress,
        name,
        symbol,
        totalSupply: totalSupply === 'N/A' ? 'N/A' : totalSupply.toString(),
        type: 'ERC721',
        network
      };
    } catch (error) {
      throw new Error(`Failed to get collection info: ${error.message}`);
    }
  }

  /**
   * Mint ERC1155 NFT
   */
  async mintERC1155(contractAddress, to, tokenId, amount, network = 'ethereum', privateKey) {
    const provider = this.blockchain.getProvider(network);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(contractAddress, this.erc1155ABI, wallet);

    const tx = await contract.mint(to, tokenId, amount, '0x');
    const receipt = await tx.wait();

    return {
      hash: receipt.hash,
      contract: contractAddress,
      to,
      tokenId: tokenId.toString(),
      amount: amount.toString(),
      type: 'ERC1155',
      action: 'mint',
      status: receipt.status === 1 ? 'success' : 'failed',
      network
    };
  }

  /**
   * Transfer ERC1155 NFT
   */
  async transferERC1155(contractAddress, from, to, tokenId, amount, network = 'ethereum', privateKey) {
    const provider = this.blockchain.getProvider(network);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(contractAddress, this.erc1155ABI, wallet);

    const tx = await contract.safeTransferFrom(from, to, tokenId, amount, '0x');
    const receipt = await tx.wait();

    return {
      hash: receipt.hash,
      contract: contractAddress,
      from,
      to,
      tokenId: tokenId.toString(),
      amount: amount.toString(),
      type: 'ERC1155',
      action: 'transfer',
      status: receipt.status === 1 ? 'success' : 'failed',
      network
    };
  }

  /**
   * Get ERC1155 balance
   */
  async getERC1155Balance(contractAddress, ownerAddress, tokenId, network = 'ethereum') {
    const provider = this.blockchain.getProvider(network);
    const contract = new ethers.Contract(contractAddress, this.erc1155ABI, provider);

    const balance = await contract.balanceOf(ownerAddress, tokenId);

    return {
      contract: contractAddress,
      owner: ownerAddress,
      tokenId: tokenId.toString(),
      balance: balance.toString(),
      type: 'ERC1155',
      network
    };
  }

  /**
   * Get ERC1155 metadata
   */
  async getERC1155Metadata(contractAddress, tokenId, network = 'ethereum') {
    const provider = this.blockchain.getProvider(network);
    const contract = new ethers.Contract(contractAddress, this.erc1155ABI, provider);

    const uri = await contract.uri(tokenId);

    // Fetch metadata from URI if it's HTTP
    let metadata = null;
    if (uri.startsWith('http')) {
      try {
        const response = await fetch(uri);
        metadata = await response.json();
      } catch (error) {
        metadata = { error: 'Failed to fetch metadata' };
      }
    }

    return {
      contract: contractAddress,
      tokenId: tokenId.toString(),
      uri,
      metadata,
      type: 'ERC1155',
      network
    };
  }

  /**
   * Batch transfer ERC1155 NFTs
   */
  async batchTransferERC1155(contractAddress, from, to, tokenIds, amounts, network = 'ethereum', privateKey) {
    const provider = this.blockchain.getProvider(network);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(contractAddress, this.erc1155ABI, wallet);

    const tx = await contract.safeBatchTransferFrom(from, to, tokenIds, amounts, '0x');
    const receipt = await tx.wait();

    return {
      hash: receipt.hash,
      contract: contractAddress,
      from,
      to,
      tokenIds: tokenIds.map(id => id.toString()),
      amounts: amounts.map(amt => amt.toString()),
      type: 'ERC1155',
      action: 'batch_transfer',
      status: receipt.status === 1 ? 'success' : 'failed',
      network
    };
  }

  /**
   * Approve NFT for transfer
   */
  async approveERC721(contractAddress, spender, tokenId, network = 'ethereum', privateKey) {
    const provider = this.blockchain.getProvider(network);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(contractAddress, this.erc721ABI, wallet);

    const tx = await contract.approve(spender, tokenId);
    const receipt = await tx.wait();

    return {
      hash: receipt.hash,
      contract: contractAddress,
      spender,
      tokenId: tokenId.toString(),
      action: 'approve',
      status: receipt.status === 1 ? 'success' : 'failed',
      network
    };
  }

  /**
   * Set approval for all NFTs
   */
  async setApprovalForAll(contractAddress, operator, approved, type = 'ERC721', network = 'ethereum', privateKey) {
    const provider = this.blockchain.getProvider(network);
    const wallet = new ethers.Wallet(privateKey, provider);
    const abi = type === 'ERC721' ? this.erc721ABI : this.erc1155ABI;
    const contract = new ethers.Contract(contractAddress, abi, wallet);

    const tx = await contract.setApprovalForAll(operator, approved);
    const receipt = await tx.wait();

    return {
      hash: receipt.hash,
      contract: contractAddress,
      operator,
      approved,
      type,
      action: 'set_approval_for_all',
      status: receipt.status === 1 ? 'success' : 'failed',
      network
    };
  }
}

module.exports = NFTManager;
