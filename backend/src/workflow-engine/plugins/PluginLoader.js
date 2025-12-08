/**
 * Plugin Loader - Loads and manages workflow plugins with hot-reload
 */

const fs = require('fs').promises;
const path = require('path');
const chokidar = require('chokidar');
const PluginManifest = require('./PluginManifest');

class PluginLoader {
  constructor() {
    this.plugins = new Map();
    this.pluginsPath = path.join(__dirname, '../../../plugins');
    this.watcher = null;
    this.hotReloadCallback = null;
  }

  /**
   * Load all plugins
   */
  async loadPlugins() {
    console.log('📦 Loading plugins...');

    try {
      await fs.mkdir(this.pluginsPath, { recursive: true });
      
      const pluginDirs = await fs.readdir(this.pluginsPath);

      for (const dir of pluginDirs) {
        const pluginPath = path.join(this.pluginsPath, dir);
        const stat = await fs.stat(pluginPath);

        if (stat.isDirectory()) {
          await this.loadPlugin(pluginPath);
        }
      }

      console.log(`✅ Loaded ${this.plugins.size} plugins`);
    } catch (error) {
      console.error('Error loading plugins:', error);
    }
  }

  /**
   * Load a single plugin
   */
  async loadPlugin(pluginPath) {
    try {
      // Read manifest
      const manifestPath = path.join(pluginPath, 'plugin.json');
      const manifestData = await fs.readFile(manifestPath, 'utf8');
      const manifest = new PluginManifest(JSON.parse(manifestData));

      // Validate manifest
      manifest.validate();

      // Load plugin entry point
      const entryPath = path.join(pluginPath, manifest.main);
      
      // Clear require cache for hot-reload
      delete require.cache[require.resolve(entryPath)];
      
      const PluginClass = require(entryPath);
      const plugin = new PluginClass();

      // Initialize plugin
      await plugin.initialize();

      // Store plugin
      this.plugins.set(manifest.id, {
        manifest,
        instance: plugin,
        path: pluginPath
      });

      console.log(`  ✅ Loaded plugin: ${manifest.name} v${manifest.version}`);

      return plugin;
    } catch (error) {
      console.error(`  ❌ Failed to load plugin at ${pluginPath}:`, error.message);
      return null;
    }
  }

  /**
   * Reload a plugin
   */
  async reloadPlugin(pluginId) {
    const plugin = this.plugins.get(pluginId);
    
    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginId}`);
    }

    console.log(`🔄 Reloading plugin: ${plugin.manifest.name}`);

    // Cleanup old plugin
    if (plugin.instance.cleanup) {
      await plugin.instance.cleanup();
    }

    // Reload
    const newPlugin = await this.loadPlugin(plugin.path);

    if (newPlugin && this.hotReloadCallback) {
      this.hotReloadCallback(newPlugin);
    }

    return newPlugin;
  }

  /**
   * Enable hot-reload watching
   */
  enableHotReload(callback) {
    this.hotReloadCallback = callback;

    this.watcher = chokidar.watch(this.pluginsPath, {
      ignored: /(^|[\/\\])\../,
      persistent: true,
      ignoreInitial: true
    });

    this.watcher.on('change', async (filePath) => {
      console.log(`📝 Plugin file changed: ${filePath}`);

      // Find which plugin was modified
      for (const [pluginId, plugin] of this.plugins) {
        if (filePath.startsWith(plugin.path)) {
          await this.reloadPlugin(pluginId);
          break;
        }
      }
    });

    console.log('🔥 Hot-reload enabled for plugins');
  }

  /**
   * Install a plugin from package
   */
  async installPlugin(packagePath) {
    console.log(`📥 Installing plugin from: ${packagePath}`);

    // Extract plugin package
    // Implementation depends on package format (zip, tar.gz, etc.)
    
    // For now, assume it's a directory
    const pluginName = path.basename(packagePath);
    const targetPath = path.join(this.pluginsPath, pluginName);

    // Copy plugin files
    await this.copyDirectory(packagePath, targetPath);

    // Load the plugin
    await this.loadPlugin(targetPath);

    console.log(`✅ Plugin installed: ${pluginName}`);
  }

  /**
   * Uninstall a plugin
   */
  async uninstallPlugin(pluginId) {
    const plugin = this.plugins.get(pluginId);
    
    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginId}`);
    }

    console.log(`🗑️  Uninstalling plugin: ${plugin.manifest.name}`);

    // Cleanup
    if (plugin.instance.cleanup) {
      await plugin.instance.cleanup();
    }

    // Remove from registry
    this.plugins.delete(pluginId);

    // Delete plugin files
    await fs.rm(plugin.path, { recursive: true, force: true });

    console.log(`✅ Plugin uninstalled: ${plugin.manifest.name}`);
  }

  /**
   * Get plugin
   */
  getPlugin(pluginId) {
    return this.plugins.get(pluginId);
  }

  /**
   * Get all plugins
   */
  getAllPlugins() {
    const plugins = [];

    this.plugins.forEach((plugin, id) => {
      plugins.push({
        id,
        name: plugin.manifest.name,
        version: plugin.manifest.version,
        description: plugin.manifest.description,
        author: plugin.manifest.author,
        nodes: plugin.manifest.nodes
      });
    });

    return plugins;
  }

  /**
   * Copy directory recursively
   */
  async copyDirectory(src, dest) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  /**
   * Cleanup
   */
  cleanup() {
    if (this.watcher) {
      this.watcher.close();
    }

    // Cleanup all plugins
    this.plugins.forEach(plugin => {
      if (plugin.instance.cleanup) {
        plugin.instance.cleanup();
      }
    });
  }
}

module.exports = PluginLoader;
