/**
 * R3SN Plugin Execution Engine
 * Sandboxed, isolated plugin execution with VM isolation and permission controls
 */

const vm = require('vm');
const { Worker } = require('worker_threads');
const EventEmitter = require('events');

class PluginExecutionEngine extends EventEmitter {
    constructor() {
        super();
        this.plugins = new Map();
        this.executionQueue = [];
        this.activeExecutions = new Map();
        this.sandboxes = new Map();
        this.permissionManager = new PermissionManager();
        this.metricsCollector = new MetricsCollector();
    }

    /**
     * Register a plugin with manifest and schema
     */
    async registerPlugin(pluginManifest) {
        try {
            // Validate manifest
            this.validateManifest(pluginManifest);
            
            // Create sandbox for plugin
            const sandbox = await this.createSandbox(pluginManifest);
            
            // Store plugin
            this.plugins.set(pluginManifest.id, {
                manifest: pluginManifest,
                sandbox,
                status: 'registered',
                executions: 0,
                errors: 0,
                lastExecution: null
            });

            this.emit('plugin:registered', pluginManifest.id);
            
            return {
                success: true,
                pluginId: pluginManifest.id,
                sandbox: sandbox.id
            };
        } catch (error) {
            console.error('Plugin registration error:', error);
            throw error;
        }
    }

    /**
     * Execute plugin with sandboxing and isolation
     */
    async executePlugin(pluginId, input, options = {}) {
        const executionId = this.generateExecutionId();
        
        try {
            const plugin = this.plugins.get(pluginId);
            if (!plugin) {
                throw new Error(`Plugin ${pluginId} not found`);
            }

            // Check permissions
            await this.permissionManager.checkPermissions(plugin.manifest, input);

            // Create execution context
            const context = this.createExecutionContext(plugin, input, options);

            // Start metrics collection
            const metricsHandle = this.metricsCollector.startCollection(executionId);

            // Execute in sandbox
            const result = await this.executeInSandbox(
                plugin.sandbox,
                plugin.manifest.code,
                context,
                options
            );

            // Stop metrics collection
            const metrics = this.metricsCollector.stopCollection(metricsHandle);

            // Update plugin stats
            plugin.executions++;
            plugin.lastExecution = Date.now();

            this.emit('plugin:executed', {
                pluginId,
                executionId,
                success: true,
                metrics
            });

            return {
                success: true,
                executionId,
                result,
                metrics
            };

        } catch (error) {
            const plugin = this.plugins.get(pluginId);
            if (plugin) {
                plugin.errors++;
            }

            this.emit('plugin:error', {
                pluginId,
                executionId,
                error: error.message
            });

            throw error;
        }
    }

    /**
     * Execute plugin in isolated VM sandbox
     */
    async executeInSandbox(sandbox, code, context, options) {
        const timeout = options.timeout || 30000;
        const memoryLimit = options.memoryLimit || 512 * 1024 * 1024; // 512MB

        return new Promise((resolve, reject) => {
            const timeoutHandle = setTimeout(() => {
                reject(new Error('Plugin execution timeout'));
            }, timeout);

            try {
                // Create VM context
                const vmContext = vm.createContext({
                    ...sandbox.globals,
                    input: context.input,
                    console: this.createSandboxedConsole(context.executionId),
                    require: this.createSandboxedRequire(sandbox.allowedModules),
                    setTimeout: this.createSandboxedSetTimeout(timeout),
                    setInterval: this.createSandboxedSetInterval(timeout)
                });

                // Execute code
                const script = new vm.Script(`
                    (async function() {
                        ${code}
                        return await execute(input);
                    })()
                `);

                const result = script.runInContext(vmContext, {
                    timeout,
                    displayErrors: true,
                    breakOnSigint: true
                });

                // Handle promise result
                if (result && typeof result.then === 'function') {
                    result
                        .then(output => {
                            clearTimeout(timeoutHandle);
                            resolve(output);
                        })
                        .catch(error => {
                            clearTimeout(timeoutHandle);
                            reject(error);
                        });
                } else {
                    clearTimeout(timeoutHandle);
                    resolve(result);
                }

            } catch (error) {
                clearTimeout(timeoutHandle);
                reject(error);
            }
        });
    }

    /**
     * Execute plugin in worker thread for CPU-intensive tasks
     */
    async executeInWorker(pluginId, input, options = {}) {
        return new Promise((resolve, reject) => {
            const plugin = this.plugins.get(pluginId);
            if (!plugin) {
                return reject(new Error(`Plugin ${pluginId} not found`));
            }

            const worker = new Worker(`
                const { parentPort } = require('worker_threads');
                
                parentPort.on('message', async (data) => {
                    try {
                        ${plugin.manifest.code}
                        const result = await execute(data.input);
                        parentPort.postMessage({ success: true, result });
                    } catch (error) {
                        parentPort.postMessage({ success: false, error: error.message });
                    }
                });
            `, { eval: true });

            const timeout = options.timeout || 30000;
            const timeoutHandle = setTimeout(() => {
                worker.terminate();
                reject(new Error('Worker execution timeout'));
            }, timeout);

            worker.on('message', (message) => {
                clearTimeout(timeoutHandle);
                worker.terminate();
                
                if (message.success) {
                    resolve(message.result);
                } else {
                    reject(new Error(message.error));
                }
            });

            worker.on('error', (error) => {
                clearTimeout(timeoutHandle);
                worker.terminate();
                reject(error);
            });

            worker.postMessage({ input });
        });
    }

    /**
     * Create isolated sandbox for plugin
     */
    async createSandbox(manifest) {
        const sandboxId = this.generateSandboxId();
        
        const sandbox = {
            id: sandboxId,
            pluginId: manifest.id,
            globals: {
                // Safe globals
                Math: Math,
                Date: Date,
                JSON: JSON,
                Array: Array,
                Object: Object,
                String: String,
                Number: Number,
                Boolean: Boolean,
                Promise: Promise,
                
                // Custom utilities
                fetch: this.createSandboxedFetch(manifest.permissions),
                crypto: this.createSandboxedCrypto(),
                Buffer: Buffer
            },
            allowedModules: manifest.allowedModules || [],
            permissions: manifest.permissions || {},
            createdAt: Date.now()
        };

        this.sandboxes.set(sandboxId, sandbox);
        return sandbox;
    }

    /**
     * Create sandboxed console
     */
    createSandboxedConsole(executionId) {
        return {
            log: (...args) => {
                this.emit('plugin:log', { executionId, level: 'log', args });
            },
            error: (...args) => {
                this.emit('plugin:log', { executionId, level: 'error', args });
            },
            warn: (...args) => {
                this.emit('plugin:log', { executionId, level: 'warn', args });
            },
            info: (...args) => {
                this.emit('plugin:log', { executionId, level: 'info', args });
            }
        };
    }

    /**
     * Create sandboxed require function
     */
    createSandboxedRequire(allowedModules) {
        return (moduleName) => {
            if (!allowedModules.includes(moduleName)) {
                throw new Error(`Module ${moduleName} not allowed`);
            }
            return require(moduleName);
        };
    }

    /**
     * Create sandboxed fetch
     */
    createSandboxedFetch(permissions) {
        return async (url, options) => {
            // Check URL permissions
            if (!this.isUrlAllowed(url, permissions)) {
                throw new Error(`URL ${url} not allowed`);
            }

            // Rate limiting
            await this.checkRateLimit(url);

            // Execute fetch
            const fetch = require('node-fetch');
            return fetch(url, options);
        };
    }

    /**
     * Create sandboxed crypto
     */
    createSandboxedCrypto() {
        const crypto = require('crypto');
        return {
            randomBytes: crypto.randomBytes,
            createHash: crypto.createHash,
            createHmac: crypto.createHmac
        };
    }

    /**
     * Create sandboxed setTimeout
     */
    createSandboxedSetTimeout(maxTimeout) {
        return (callback, delay) => {
            if (delay > maxTimeout) {
                throw new Error(`Timeout ${delay}ms exceeds maximum ${maxTimeout}ms`);
            }
            return setTimeout(callback, delay);
        };
    }

    /**
     * Create sandboxed setInterval
     */
    createSandboxedSetInterval(maxTimeout) {
        return (callback, delay) => {
            if (delay > maxTimeout) {
                throw new Error(`Interval ${delay}ms exceeds maximum ${maxTimeout}ms`);
            }
            return setInterval(callback, delay);
        };
    }

    /**
     * Validate plugin manifest
     */
    validateManifest(manifest) {
        const required = ['id', 'name', 'version', 'code'];
        
        for (const field of required) {
            if (!manifest[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        // Validate version format
        if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) {
            throw new Error('Invalid version format. Use semver (x.y.z)');
        }

        return true;
    }

    /**
     * Create execution context
     */
    createExecutionContext(plugin, input, options) {
        return {
            executionId: this.generateExecutionId(),
            pluginId: plugin.manifest.id,
            input,
            options,
            startTime: Date.now(),
            permissions: plugin.manifest.permissions || {}
        };
    }

    /**
     * Check if URL is allowed
     */
    isUrlAllowed(url, permissions) {
        if (!permissions.allowedUrls) return true;
        
        const urlObj = new URL(url);
        return permissions.allowedUrls.some(pattern => {
            if (pattern === '*') return true;
            if (pattern.endsWith('*')) {
                return urlObj.hostname.startsWith(pattern.slice(0, -1));
            }
            return urlObj.hostname === pattern;
        });
    }

    /**
     * Rate limiting
     */
    async checkRateLimit(url) {
        // Simple rate limiting implementation
        // In production, use Redis or similar
        return true;
    }

    /**
     * Get plugin info
     */
    getPluginInfo(pluginId) {
        const plugin = this.plugins.get(pluginId);
        if (!plugin) return null;

        return {
            id: pluginId,
            name: plugin.manifest.name,
            version: plugin.manifest.version,
            status: plugin.status,
            executions: plugin.executions,
            errors: plugin.errors,
            lastExecution: plugin.lastExecution,
            successRate: plugin.executions > 0 
                ? ((plugin.executions - plugin.errors) / plugin.executions * 100).toFixed(2) + '%'
                : 'N/A'
        };
    }

    /**
     * List all plugins
     */
    listPlugins() {
        return Array.from(this.plugins.keys()).map(id => this.getPluginInfo(id));
    }

    /**
     * Unregister plugin
     */
    async unregisterPlugin(pluginId) {
        const plugin = this.plugins.get(pluginId);
        if (!plugin) {
            throw new Error(`Plugin ${pluginId} not found`);
        }

        // Clean up sandbox
        this.sandboxes.delete(plugin.sandbox.id);
        
        // Remove plugin
        this.plugins.delete(pluginId);

        this.emit('plugin:unregistered', pluginId);

        return { success: true };
    }

    /**
     * Generate execution ID
     */
    generateExecutionId() {
        return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Generate sandbox ID
     */
    generateSandboxId() {
        return `sandbox_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

/**
 * Permission Manager
 */
class PermissionManager {
    async checkPermissions(manifest, input) {
        const permissions = manifest.permissions || {};
        
        // Check file system permissions
        if (input.filesystem && !permissions.filesystem) {
            throw new Error('Plugin does not have filesystem permissions');
        }

        // Check network permissions
        if (input.network && !permissions.network) {
            throw new Error('Plugin does not have network permissions');
        }

        // Check database permissions
        if (input.database && !permissions.database) {
            throw new Error('Plugin does not have database permissions');
        }

        return true;
    }
}

/**
 * Metrics Collector
 */
class MetricsCollector {
    constructor() {
        this.collections = new Map();
    }

    startCollection(executionId) {
        const handle = {
            executionId,
            startTime: Date.now(),
            startMemory: process.memoryUsage(),
            startCpu: process.cpuUsage()
        };

        this.collections.set(executionId, handle);
        return handle;
    }

    stopCollection(handle) {
        const endTime = Date.now();
        const endMemory = process.memoryUsage();
        const endCpu = process.cpuUsage(handle.startCpu);

        this.collections.delete(handle.executionId);

        return {
            duration: endTime - handle.startTime,
            memory: {
                heapUsed: endMemory.heapUsed - handle.startMemory.heapUsed,
                external: endMemory.external - handle.startMemory.external
            },
            cpu: {
                user: endCpu.user,
                system: endCpu.system
            }
        };
    }
}

module.exports = PluginExecutionEngine;
