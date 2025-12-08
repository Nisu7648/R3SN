/**
 * Plugin Manifest - Validates and manages plugin metadata
 */

class PluginManifest {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.version = data.version;
    this.description = data.description;
    this.author = data.author;
    this.main = data.main || 'index.js';
    this.nodes = data.nodes || [];
    this.dependencies = data.dependencies || {};
    this.permissions = data.permissions || [];
    this.icon = data.icon;
    this.homepage = data.homepage;
    this.repository = data.repository;
  }

  /**
   * Validate manifest
   */
  validate() {
    const required = ['id', 'name', 'version', 'author'];

    for (const field of required) {
      if (!this[field]) {
        throw new Error(`Plugin manifest missing required field: ${field}`);
      }
    }

    // Validate version format
    if (!/^\d+\.\d+\.\d+$/.test(this.version)) {
      throw new Error('Invalid version format. Use semver (e.g., 1.0.0)');
    }

    // Validate node definitions
    this.nodes.forEach(node => {
      if (!node.type || !node.name) {
        throw new Error('Node definition must include type and name');
      }
    });

    return true;
  }

  /**
   * Convert to JSON
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      version: this.version,
      description: this.description,
      author: this.author,
      main: this.main,
      nodes: this.nodes,
      dependencies: this.dependencies,
      permissions: this.permissions,
      icon: this.icon,
      homepage: this.homepage,
      repository: this.repository
    };
  }
}

module.exports = PluginManifest;
