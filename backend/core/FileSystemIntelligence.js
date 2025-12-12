/**
 * R3SN File System Intelligence
 * Intelligent file operations with content analysis and permission management
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { createReadStream, createWriteStream } = require('fs');
const { pipeline } = require('stream/promises');
const zlib = require('zlib');
const EventEmitter = require('events');

class FileSystemIntelligence extends EventEmitter {
    constructor(options = {}) {
        super();
        this.basePath = options.basePath || process.cwd();
        this.maxFileSize = options.maxFileSize || 100 * 1024 * 1024; // 100MB
        this.allowedExtensions = options.allowedExtensions || null; // null = all allowed
        this.deniedExtensions = options.deniedExtensions || ['.exe', '.dll', '.so'];
        this.operations = new Map();
    }

    /**
     * Read file
     */
    async readFile(filePath, options = {}) {
        const operationId = this.generateOperationId();
        
        try {
            const fullPath = this.resolvePath(filePath);
            await this.checkPermissions(fullPath, 'read');
            await this.validateFile(fullPath);

            this.emit('file:read:start', { operationId, path: filePath });

            const encoding = options.encoding || 'utf8';
            const content = await fs.readFile(fullPath, encoding);

            const stats = await fs.stat(fullPath);
            const analysis = await this.analyzeContent(content, fullPath);

            this.emit('file:read:complete', { operationId, path: filePath, size: stats.size });

            return {
                success: true,
                operationId,
                path: filePath,
                content,
                size: stats.size,
                analysis,
                metadata: {
                    created: stats.birthtime,
                    modified: stats.mtime,
                    accessed: stats.atime
                }
            };

        } catch (error) {
            this.emit('file:read:error', { operationId, path: filePath, error: error.message });
            throw error;
        }
    }

    /**
     * Write file
     */
    async writeFile(filePath, content, options = {}) {
        const operationId = this.generateOperationId();
        
        try {
            const fullPath = this.resolvePath(filePath);
            await this.checkPermissions(fullPath, 'write');
            await this.validateExtension(fullPath);

            this.emit('file:write:start', { operationId, path: filePath });

            // Create directory if it doesn't exist
            const dir = path.dirname(fullPath);
            await fs.mkdir(dir, { recursive: true });

            // Write file
            const encoding = options.encoding || 'utf8';
            await fs.writeFile(fullPath, content, encoding);

            const stats = await fs.stat(fullPath);

            this.emit('file:write:complete', { operationId, path: filePath, size: stats.size });

            return {
                success: true,
                operationId,
                path: filePath,
                size: stats.size,
                created: stats.birthtime
            };

        } catch (error) {
            this.emit('file:write:error', { operationId, path: filePath, error: error.message });
            throw error;
        }
    }

    /**
     * Delete file
     */
    async deleteFile(filePath) {
        const operationId = this.generateOperationId();
        
        try {
            const fullPath = this.resolvePath(filePath);
            await this.checkPermissions(fullPath, 'delete');

            this.emit('file:delete:start', { operationId, path: filePath });

            await fs.unlink(fullPath);

            this.emit('file:delete:complete', { operationId, path: filePath });

            return {
                success: true,
                operationId,
                path: filePath,
                deleted: true
            };

        } catch (error) {
            this.emit('file:delete:error', { operationId, path: filePath, error: error.message });
            throw error;
        }
    }

    /**
     * List directory
     */
    async listDirectory(dirPath, options = {}) {
        const operationId = this.generateOperationId();
        
        try {
            const fullPath = this.resolvePath(dirPath);
            await this.checkPermissions(fullPath, 'read');

            this.emit('dir:list:start', { operationId, path: dirPath });

            const entries = await fs.readdir(fullPath, { withFileTypes: true });
            const files = [];

            for (const entry of entries) {
                const entryPath = path.join(fullPath, entry.name);
                const stats = await fs.stat(entryPath);

                files.push({
                    name: entry.name,
                    path: path.relative(this.basePath, entryPath),
                    type: entry.isDirectory() ? 'directory' : 'file',
                    size: stats.size,
                    created: stats.birthtime,
                    modified: stats.mtime,
                    extension: path.extname(entry.name)
                });
            }

            // Apply filters
            let filtered = files;
            if (options.type) {
                filtered = filtered.filter(f => f.type === options.type);
            }
            if (options.extension) {
                filtered = filtered.filter(f => f.extension === options.extension);
            }

            // Sort
            if (options.sortBy) {
                filtered.sort((a, b) => {
                    if (options.sortBy === 'name') return a.name.localeCompare(b.name);
                    if (options.sortBy === 'size') return b.size - a.size;
                    if (options.sortBy === 'modified') return b.modified - a.modified;
                    return 0;
                });
            }

            this.emit('dir:list:complete', { operationId, path: dirPath, count: filtered.length });

            return {
                success: true,
                operationId,
                path: dirPath,
                files: filtered,
                count: filtered.length
            };

        } catch (error) {
            this.emit('dir:list:error', { operationId, path: dirPath, error: error.message });
            throw error;
        }
    }

    /**
     * Create directory
     */
    async createDirectory(dirPath) {
        const operationId = this.generateOperationId();
        
        try {
            const fullPath = this.resolvePath(dirPath);
            await this.checkPermissions(fullPath, 'write');

            this.emit('dir:create:start', { operationId, path: dirPath });

            await fs.mkdir(fullPath, { recursive: true });

            this.emit('dir:create:complete', { operationId, path: dirPath });

            return {
                success: true,
                operationId,
                path: dirPath,
                created: true
            };

        } catch (error) {
            this.emit('dir:create:error', { operationId, path: dirPath, error: error.message });
            throw error;
        }
    }

    /**
     * Copy file
     */
    async copyFile(sourcePath, destPath) {
        const operationId = this.generateOperationId();
        
        try {
            const fullSource = this.resolvePath(sourcePath);
            const fullDest = this.resolvePath(destPath);
            
            await this.checkPermissions(fullSource, 'read');
            await this.checkPermissions(fullDest, 'write');

            this.emit('file:copy:start', { operationId, source: sourcePath, dest: destPath });

            await fs.copyFile(fullSource, fullDest);

            const stats = await fs.stat(fullDest);

            this.emit('file:copy:complete', { operationId, source: sourcePath, dest: destPath });

            return {
                success: true,
                operationId,
                source: sourcePath,
                dest: destPath,
                size: stats.size
            };

        } catch (error) {
            this.emit('file:copy:error', { operationId, error: error.message });
            throw error;
        }
    }

    /**
     * Move file
     */
    async moveFile(sourcePath, destPath) {
        const operationId = this.generateOperationId();
        
        try {
            const fullSource = this.resolvePath(sourcePath);
            const fullDest = this.resolvePath(destPath);
            
            await this.checkPermissions(fullSource, 'delete');
            await this.checkPermissions(fullDest, 'write');

            this.emit('file:move:start', { operationId, source: sourcePath, dest: destPath });

            await fs.rename(fullSource, fullDest);

            this.emit('file:move:complete', { operationId, source: sourcePath, dest: destPath });

            return {
                success: true,
                operationId,
                source: sourcePath,
                dest: destPath,
                moved: true
            };

        } catch (error) {
            this.emit('file:move:error', { operationId, error: error.message });
            throw error;
        }
    }

    /**
     * Compress file
     */
    async compressFile(filePath, outputPath = null) {
        const operationId = this.generateOperationId();
        
        try {
            const fullPath = this.resolvePath(filePath);
            const output = outputPath ? this.resolvePath(outputPath) : `${fullPath}.gz`;

            await this.checkPermissions(fullPath, 'read');
            await this.checkPermissions(output, 'write');

            this.emit('file:compress:start', { operationId, path: filePath });

            const source = createReadStream(fullPath);
            const destination = createWriteStream(output);
            const gzip = zlib.createGzip();

            await pipeline(source, gzip, destination);

            const originalStats = await fs.stat(fullPath);
            const compressedStats = await fs.stat(output);

            this.emit('file:compress:complete', { operationId, path: filePath });

            return {
                success: true,
                operationId,
                original: filePath,
                compressed: path.relative(this.basePath, output),
                originalSize: originalStats.size,
                compressedSize: compressedStats.size,
                ratio: ((1 - compressedStats.size / originalStats.size) * 100).toFixed(2) + '%'
            };

        } catch (error) {
            this.emit('file:compress:error', { operationId, error: error.message });
            throw error;
        }
    }

    /**
     * Decompress file
     */
    async decompressFile(filePath, outputPath = null) {
        const operationId = this.generateOperationId();
        
        try {
            const fullPath = this.resolvePath(filePath);
            const output = outputPath ? this.resolvePath(outputPath) : fullPath.replace(/\.gz$/, '');

            await this.checkPermissions(fullPath, 'read');
            await this.checkPermissions(output, 'write');

            this.emit('file:decompress:start', { operationId, path: filePath });

            const source = createReadStream(fullPath);
            const destination = createWriteStream(output);
            const gunzip = zlib.createGunzip();

            await pipeline(source, gunzip, destination);

            this.emit('file:decompress:complete', { operationId, path: filePath });

            return {
                success: true,
                operationId,
                compressed: filePath,
                decompressed: path.relative(this.basePath, output)
            };

        } catch (error) {
            this.emit('file:decompress:error', { operationId, error: error.message });
            throw error;
        }
    }

    /**
     * Get file hash
     */
    async getFileHash(filePath, algorithm = 'sha256') {
        const fullPath = this.resolvePath(filePath);
        await this.checkPermissions(fullPath, 'read');

        return new Promise((resolve, reject) => {
            const hash = crypto.createHash(algorithm);
            const stream = createReadStream(fullPath);

            stream.on('data', data => hash.update(data));
            stream.on('end', () => resolve(hash.digest('hex')));
            stream.on('error', reject);
        });
    }

    /**
     * Analyze file content
     */
    async analyzeContent(content, filePath) {
        const ext = path.extname(filePath);
        
        const analysis = {
            type: this.detectFileType(ext),
            size: Buffer.byteLength(content, 'utf8'),
            lines: content.split('\n').length,
            words: content.split(/\s+/).length,
            characters: content.length
        };

        // Language-specific analysis
        if (ext === '.js' || ext === '.ts') {
            analysis.language = 'javascript';
            analysis.functions = (content.match(/function\s+\w+/g) || []).length;
            analysis.classes = (content.match(/class\s+\w+/g) || []).length;
        } else if (ext === '.py') {
            analysis.language = 'python';
            analysis.functions = (content.match(/def\s+\w+/g) || []).length;
            analysis.classes = (content.match(/class\s+\w+/g) || []).length;
        } else if (ext === '.json') {
            analysis.language = 'json';
            try {
                const parsed = JSON.parse(content);
                analysis.valid = true;
                analysis.keys = Object.keys(parsed).length;
            } catch (e) {
                analysis.valid = false;
            }
        }

        return analysis;
    }

    /**
     * Detect file type
     */
    detectFileType(ext) {
        const types = {
            '.js': 'javascript',
            '.ts': 'typescript',
            '.py': 'python',
            '.java': 'java',
            '.cpp': 'cpp',
            '.c': 'c',
            '.go': 'go',
            '.rs': 'rust',
            '.json': 'json',
            '.xml': 'xml',
            '.yaml': 'yaml',
            '.yml': 'yaml',
            '.md': 'markdown',
            '.txt': 'text',
            '.html': 'html',
            '.css': 'css',
            '.sql': 'sql'
        };

        return types[ext] || 'unknown';
    }

    /**
     * Resolve path
     */
    resolvePath(filePath) {
        const resolved = path.resolve(this.basePath, filePath);
        
        // Prevent directory traversal
        if (!resolved.startsWith(this.basePath)) {
            throw new Error('Access denied: Path outside base directory');
        }

        return resolved;
    }

    /**
     * Check permissions
     */
    async checkPermissions(fullPath, operation) {
        try {
            await fs.access(fullPath, fs.constants.F_OK);
            
            if (operation === 'read') {
                await fs.access(fullPath, fs.constants.R_OK);
            } else if (operation === 'write') {
                await fs.access(fullPath, fs.constants.W_OK);
            }
        } catch (error) {
            if (operation === 'write' && error.code === 'ENOENT') {
                // File doesn't exist, which is OK for write operations
                return;
            }
            throw new Error(`Permission denied: ${operation} access to ${fullPath}`);
        }
    }

    /**
     * Validate file
     */
    async validateFile(fullPath) {
        const stats = await fs.stat(fullPath);
        
        if (stats.size > this.maxFileSize) {
            throw new Error(`File too large: ${stats.size} bytes (max: ${this.maxFileSize})`);
        }
    }

    /**
     * Validate extension
     */
    async validateExtension(fullPath) {
        const ext = path.extname(fullPath);
        
        if (this.deniedExtensions.includes(ext)) {
            throw new Error(`File extension not allowed: ${ext}`);
        }

        if (this.allowedExtensions && !this.allowedExtensions.includes(ext)) {
            throw new Error(`File extension not in allowed list: ${ext}`);
        }
    }

    /**
     * Generate operation ID
     */
    generateOperationId() {
        return `fs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get statistics
     */
    getStats() {
        return {
            basePath: this.basePath,
            maxFileSize: this.maxFileSize,
            allowedExtensions: this.allowedExtensions,
            deniedExtensions: this.deniedExtensions,
            operations: this.operations.size
        };
    }
}

module.exports = FileSystemIntelligence;
