/**
 * PluginEngine.js - Hot-Reload Plugin System
 * VM2 sandboxing with file watching
 */

const fs = require('fs').promises;
const path = require('path');
const EventEmitter = require('events');
const chokidar = require('chokidar');
const { VM } = require('vm2');

class PluginEngine extends EventEmitter {
  constructor(pluginsDir = './plugins') {
    super();
    this.pluginsDir = pluginsDir;
    this.plugins = new Map();
    this.watcher = null;
    this.premiumMode = true;
    this.unlimited = true;
  }

  async initialize() {
    console.log('🔌 Initializing Plugin Engine...');
    
    // Ensure plugins directory exists
    try {
      await fs.access(this.pluginsDir);
    } catch {
      await fs.mkdir(this.pluginsDir, { recursive: true });
    }

    // Load all plugins
    await this.loadAllPlugins();

    // Start file watching for hot-reload
    this.startWatching();

    this.emit('initialized', {
      pluginCount: this.plugins.size,
      premium: true,
      unlimited: true
    });

    console.log(`✅ Plugin Engine initialized with ${this.plugins.size} plugins`);
  }

  async loadAllPlugins() {
    try {
      const entries = await fs.readdir(this.pluginsDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          try {
            await this.loadPlugin(entry.name);
          } catch (error) {
            console.error(`Failed to load plugin ${entry.name}:`, error.message);
          }
        }
      }
    } catch (error) {
      console.error('Failed to read plugins directory:', error.message);
    }
  }

  async loadPlugin(pluginName) {
    const pluginPath = path.join(this.pluginsDir, pluginName);
    
    try {
      // Read plugin manifest
      const manifestPath = path.join(pluginPath, 'plugin.json');
      const manifestContent = await fs.readFile(manifestPath, 'utf8');
      const manifest = JSON.parse(manifestContent);

      // Read plugin code
      const mainFile = manifest.main || 'index.js';
      const codePath = path.join(pluginPath, mainFile);
      const code = await fs.readFile(codePath, 'utf8');

      // Create VM sandbox
      const sandbox = this.createSandbox(manifest.permissions || []);
      const vm = new VM({
        timeout: 10000,
        sandbox,
        require: {
          external: this.premiumMode,
          builtin: ['path', 'crypto', 'util'],
          root: pluginPath
        }
      });

      // Execute plugin code
      const pluginModule = vm.run(code);

      // Store plugin
      this.plugins.set(manifest.id, {
        manifest,
        module: pluginModule,
        path: pluginPath,
        loaded: Date.now(),
        premium: manifest.premium || false,
        unlimited: manifest.unlimited || false,
        executionCount: 0
      });

      this.emit('plugin:loaded', {
        id: manifest.id,
        name: manifest.name,
        version: manifest.version
      });

      console.log(`✅ Loaded plugin: ${manifest.name} v${manifest.version}`);
    } catch (error) {
      console.error(`Failed to load plugin ${pluginName}:`, error.message);
      throw error;
    }
  }

  async reloadPlugin(pluginId) {
    const plugin = this.plugins.get(pluginId);
    
    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginId}`);
    }

    console.log(`🔄 Reloading plugin: ${plugin.manifest.name}`);

    // Remove old plugin
    this.plugins.delete(pluginId);

    // Reload plugin
    const pluginName = path.basename(plugin.path);
    await this.loadPlugin(pluginName);

    this.emit('plugin:reloaded', {
      id: pluginId,
      name: plugin.manifest.name
    });

    console.log(`✅ Reloaded plugin: ${plugin.manifest.name}`);
  }

  unloadPlugin(pluginId) {
    const plugin = this.plugins.get(pluginId);
    
    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginId}`);
    }

    this.plugins.delete(pluginId);

    this.emit('plugin:unloaded', {
      id: pluginId,
      name: plugin.manifest.name
    });

    console.log(`✅ Unloaded plugin: ${plugin.manifest.name}`);
  }

  async execute(pluginId, method, params = {}) {
    const plugin = this.plugins.get(pluginId);
    
    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginId}`);
    }

    if (typeof plugin.module[method] !== 'function') {
      throw new Error(`Method not found: ${method}`);
    }

    try {
      const startTime = Date.now();
      const result = await plugin.module[method](params);
      const duration = Date.now() - startTime;

      plugin.executionCount++;

      this.emit('plugin:executed', {
        pluginId,
        method,
        duration,
        success: true
      });

      return {
        success: true,
        result,
        duration,
        plugin: {
          id: pluginId,
          name: plugin.manifest.name,
          version: plugin.manifest.version
        }
      };
    } catch (error) {
      this.emit('plugin:error', {
        pluginId,
        method,
        error: error.message
      });

      throw error;
    }
  }

  createSandbox(permissions = []) {
    const sandbox = {
      console,
      Promise,
      JSON,
      Math,
      Date,
      setTimeout,
      setInterval,
      clearTimeout,
      clearInterval
    };

    // Add permissions
    if (permissions.includes('http')) {
      sandbox.axios = require('axios');
      sandbox.fetch = require('node-fetch');
    }

    if (permissions.includes('crypto')) {
      sandbox.crypto = require('crypto');
    }

    if (permissions.includes('file:read')) {
      sandbox.fs = {
        readFile: fs.readFile,
        readdir: fs.readdir,
        stat: fs.stat
      };
    }

    if (permissions.includes('file:write')) {
      sandbox.fs = {
        ...sandbox.fs,
        writeFile: fs.writeFile,
        mkdir: fs.mkdir,
        unlink: fs.unlink
      };
    }

    // Premium mode: full require access
    if (this.premiumMode) {
      sandbox.require = require;
    }

    return sandbox;
  }

  startWatching() {
    if (this.watcher) {
      this.watcher.close();
    }

    this.watcher = chokidar.watch(this.pluginsDir, {
      ignored: /(^|[\/\\])\../,
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
      }
    });

    this.watcher.on('change', async (filePath) => {
      console.log(`📝 File changed: ${filePath}`);

      // Find plugin that owns this file
      const plugin = Array.from(this.plugins.values()).find(p => 
        filePath.startsWith(p.path)
      );

      if (plugin) {
        try {
          await this.reloadPlugin(plugin.manifest.id);
        } catch (error) {
          console.error(`Failed to reload plugin:`, error.message);
        }
      }
    });

    this.watcher.on('add', async (filePath) => {
      console.log(`➕ File added: ${filePath}`);
      
      // Check if it's a new plugin
      if (filePath.endsWith('plugin.json')) {
        const pluginName = path.basename(path.dirname(filePath));
        try {
          await this.loadPlugin(pluginName);
        } catch (error) {
          console.error(`Failed to load new plugin:`, error.message);
        }
      }
    });

    console.log('👀 File watching enabled for hot-reload');
  }

  stopWatching() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
      console.log('👋 File watching stopped');
    }
  }

  listPlugins() {
    return Array.from(this.plugins.entries()).map(([id, plugin]) => ({
      id,
      name: plugin.manifest.name,
      version: plugin.manifest.version,
      description: plugin.manifest.description,
      premium: plugin.premium,
      unlimited: plugin.unlimited,
      loaded: plugin.loaded,
      executionCount: plugin.executionCount,
      features: plugin.manifest.features || [],
      permissions: plugin.manifest.permissions || []
    }));
  }

  getPlugin(pluginId) {
    const plugin = this.plugins.get(pluginId);
    
    if (!plugin) {
      return null;
    }

    return {
      id: pluginId,
      name: plugin.manifest.name,
      version: plugin.manifest.version,
      description: plugin.manifest.description,
      author: plugin.manifest.author,
      premium: plugin.premium,
      unlimited: plugin.unlimited,
      loaded: plugin.loaded,
      executionCount: plugin.executionCount,
      features: plugin.manifest.features || [],
      permissions: plugin.manifest.permissions || [],
      methods: Object.keys(plugin.module).filter(key => 
        typeof plugin.module[key] === 'function'
      )
    };
  }

  getStats() {
    const plugins = Array.from(this.plugins.values());

    return {
      totalPlugins: this.plugins.size,
      premiumPlugins: plugins.filter(p => p.premium).length,
      unlimitedPlugins: plugins.filter(p => p.unlimited).length,
      totalExecutions: plugins.reduce((sum, p) => sum + p.executionCount, 0),
      premiumMode: this.premiumMode,
      unlimited: this.unlimited,
      hotReload: this.watcher !== null
    };
  }

  async shutdown() {
    console.log('🛑 Shutting down Plugin Engine...');
    
    this.stopWatching();
    this.plugins.clear();
    
    this.emit('shutdown');
    console.log('✅ Plugin Engine shut down');
  }
}

module.exports = PluginEngine;
