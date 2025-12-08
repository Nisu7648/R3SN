/**
 * Node Registry - Manages all available workflow nodes
 */

const fs = require('fs').promises;
const path = require('path');

class NodeRegistry {
  constructor() {
    this.nodes = new Map();
    this.categories = new Map();
  }

  /**
   * Load core nodes
   */
  async loadCoreNodes() {
    const coreNodesPath = path.join(__dirname, '../nodes/core');
    
    try {
      const files = await fs.readdir(coreNodesPath);
      
      for (const file of files) {
        if (file.endsWith('.js')) {
          const nodePath = path.join(coreNodesPath, file);
          const NodeClass = require(nodePath);
          const node = new NodeClass();
          
          this.register(node.type, node);
        }
      }
      
      console.log(`✅ Loaded ${this.nodes.size} core nodes`);
    } catch (error) {
      console.error('Error loading core nodes:', error);
    }
  }

  /**
   * Register a node
   */
  register(nodeType, nodeImplementation) {
    if (this.nodes.has(nodeType)) {
      console.warn(`⚠️  Node type already registered: ${nodeType}`);
    }

    this.nodes.set(nodeType, nodeImplementation);

    // Add to category
    const category = nodeImplementation.category || 'general';
    if (!this.categories.has(category)) {
      this.categories.set(category, []);
    }
    this.categories.get(category).push(nodeType);

    console.log(`✅ Registered node: ${nodeType} (${category})`);
  }

  /**
   * Unregister a node
   */
  unregister(nodeType) {
    const node = this.nodes.get(nodeType);
    
    if (node) {
      this.nodes.delete(nodeType);
      
      // Remove from category
      const category = node.category || 'general';
      if (this.categories.has(category)) {
        const nodes = this.categories.get(category);
        const index = nodes.indexOf(nodeType);
        if (index > -1) {
          nodes.splice(index, 1);
        }
      }
      
      console.log(`✅ Unregistered node: ${nodeType}`);
    }
  }

  /**
   * Get a node implementation
   */
  getNode(nodeType) {
    return this.nodes.get(nodeType);
  }

  /**
   * Check if node exists
   */
  hasNode(nodeType) {
    return this.nodes.has(nodeType);
  }

  /**
   * Get all nodes
   */
  getAllNodes() {
    const nodes = [];
    
    this.nodes.forEach((node, type) => {
      nodes.push({
        type,
        name: node.name,
        description: node.description,
        category: node.category,
        icon: node.icon,
        color: node.color,
        inputs: node.inputs,
        outputs: node.outputs,
        parameters: node.parameters
      });
    });

    return nodes;
  }

  /**
   * Get nodes by category
   */
  getNodesByCategory(category) {
    const nodeTypes = this.categories.get(category) || [];
    return nodeTypes.map(type => this.getNode(type));
  }

  /**
   * Get all categories
   */
  getCategories() {
    return Array.from(this.categories.keys());
  }

  /**
   * Search nodes
   */
  searchNodes(query) {
    const results = [];
    const lowerQuery = query.toLowerCase();

    this.nodes.forEach((node, type) => {
      if (
        type.toLowerCase().includes(lowerQuery) ||
        node.name.toLowerCase().includes(lowerQuery) ||
        node.description.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          type,
          name: node.name,
          description: node.description,
          category: node.category
        });
      }
    });

    return results;
  }
}

module.exports = NodeRegistry;
