/**
 * File Operations Node - Read, write, delete files
 * Full file system access without restrictions
 */

const fs = require('fs').promises;
const path = require('path');
const { createReadStream, createWriteStream } = require('fs');

class FileOperationsNode {
  constructor() {
    this.type = 'file.operations';
    this.name = 'File Operations';
    this.description = 'Read, write, delete, and manage files with full file system access';
    this.category = 'filesystem';
    this.icon = '📁';
    this.color = '#FFA000';

    this.inputs = [
      {
        name: 'filePath',
        type: 'string',
        required: false
      },
      {
        name: 'content',
        type: 'any',
        required: false
      }
    ];

    this.outputs = [
      {
        name: 'result',
        type: 'any'
      },
      {
        name: 'success',
        type: 'boolean'
      }
    ];

    this.parameters = [
      {
        name: 'operation',
        type: 'select',
        options: ['read', 'write', 'append', 'delete', 'exists', 'list', 'mkdir', 'copy', 'move', 'stat'],
        default: 'read',
        description: 'File operation to perform'
      },
      {
        name: 'filePath',
        type: 'string',
        required: false,
        placeholder: '/path/to/file.txt',
        description: 'File or directory path'
      },
      {
        name: 'content',
        type: 'code',
        required: false,
        description: 'Content to write (for write/append operations)'
      },
      {
        name: 'encoding',
        type: 'select',
        options: ['utf8', 'ascii', 'base64', 'binary', 'hex'],
        default: 'utf8',
        description: 'File encoding'
      },
      {
        name: 'destinationPath',
        type: 'string',
        required: false,
        description: 'Destination path (for copy/move operations)'
      },
      {
        name: 'recursive',
        type: 'boolean',
        default: false,
        description: 'Recursive operation (for mkdir/delete)'
      },
      {
        name: 'createDirectories',
        type: 'boolean',
        default: true,
        description: 'Create parent directories if they don\'t exist'
      }
    ];
  }

  /**
   * Execute the node
   */
  async execute(inputs, parameters, context) {
    const {
      operation,
      filePath: paramPath,
      content: paramContent,
      encoding,
      destinationPath,
      recursive,
      createDirectories
    } = parameters;

    const filePath = inputs.filePath || paramPath;
    const content = inputs.content || paramContent;

    if (!filePath) {
      throw new Error('File path is required');
    }

    try {
      let result;

      switch (operation) {
        case 'read':
          result = await this.readFile(filePath, encoding);
          break;

        case 'write':
          if (!content) throw new Error('Content is required for write operation');
          result = await this.writeFile(filePath, content, encoding, createDirectories);
          break;

        case 'append':
          if (!content) throw new Error('Content is required for append operation');
          result = await this.appendFile(filePath, content, encoding);
          break;

        case 'delete':
          result = await this.deleteFile(filePath, recursive);
          break;

        case 'exists':
          result = await this.fileExists(filePath);
          break;

        case 'list':
          result = await this.listDirectory(filePath);
          break;

        case 'mkdir':
          result = await this.createDirectory(filePath, recursive);
          break;

        case 'copy':
          if (!destinationPath) throw new Error('Destination path is required for copy operation');
          result = await this.copyFile(filePath, destinationPath);
          break;

        case 'move':
          if (!destinationPath) throw new Error('Destination path is required for move operation');
          result = await this.moveFile(filePath, destinationPath);
          break;

        case 'stat':
          result = await this.getFileStats(filePath);
          break;

        default:
          throw new Error(`Unknown operation: ${operation}`);
      }

      return {
        result,
        success: true,
        operation,
        filePath
      };

    } catch (error) {
      throw new Error(`File operation failed: ${error.message}`);
    }
  }

  /**
   * Read file
   */
  async readFile(filePath, encoding) {
    const content = await fs.readFile(filePath, encoding);
    return {
      content,
      size: Buffer.byteLength(content),
      encoding
    };
  }

  /**
   * Write file
   */
  async writeFile(filePath, content, encoding, createDirs) {
    if (createDirs) {
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });
    }

    await fs.writeFile(filePath, content, encoding);
    return {
      written: true,
      size: Buffer.byteLength(content)
    };
  }

  /**
   * Append to file
   */
  async appendFile(filePath, content, encoding) {
    await fs.appendFile(filePath, content, encoding);
    return {
      appended: true,
      size: Buffer.byteLength(content)
    };
  }

  /**
   * Delete file or directory
   */
  async deleteFile(filePath, recursive) {
    const stats = await fs.stat(filePath);
    
    if (stats.isDirectory()) {
      await fs.rm(filePath, { recursive, force: true });
    } else {
      await fs.unlink(filePath);
    }

    return {
      deleted: true,
      type: stats.isDirectory() ? 'directory' : 'file'
    };
  }

  /**
   * Check if file exists
   */
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return { exists: true };
    } catch {
      return { exists: false };
    }
  }

  /**
   * List directory contents
   */
  async listDirectory(dirPath) {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    const files = [];
    const directories = [];

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const stats = await fs.stat(fullPath);

      const item = {
        name: entry.name,
        path: fullPath,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      };

      if (entry.isDirectory()) {
        directories.push(item);
      } else {
        files.push(item);
      }
    }

    return {
      files,
      directories,
      totalFiles: files.length,
      totalDirectories: directories.length
    };
  }

  /**
   * Create directory
   */
  async createDirectory(dirPath, recursive) {
    await fs.mkdir(dirPath, { recursive });
    return {
      created: true,
      path: dirPath
    };
  }

  /**
   * Copy file
   */
  async copyFile(source, destination) {
    await fs.copyFile(source, destination);
    return {
      copied: true,
      source,
      destination
    };
  }

  /**
   * Move file
   */
  async moveFile(source, destination) {
    await fs.rename(source, destination);
    return {
      moved: true,
      source,
      destination
    };
  }

  /**
   * Get file statistics
   */
  async getFileStats(filePath) {
    const stats = await fs.stat(filePath);
    
    return {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      accessed: stats.atime,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory(),
      permissions: stats.mode
    };
  }
}

module.exports = FileOperationsNode;
