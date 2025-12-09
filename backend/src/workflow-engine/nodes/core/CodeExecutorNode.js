/**
 * Code Executor Node - Execute any code without restrictions
 * Supports JavaScript, Python, Shell, and more
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

const execAsync = promisify(exec);

class CodeExecutorNode {
  constructor() {
    this.type = 'code.executor';
    this.name = 'Code Executor';
    this.description = 'Execute any code in multiple languages without restrictions';
    this.category = 'code';
    this.icon = '⚡';
    this.color = '#FF6F00';

    this.inputs = [
      {
        name: 'code',
        type: 'string',
        required: false
      },
      {
        name: 'data',
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
        name: 'stdout',
        type: 'string'
      },
      {
        name: 'stderr',
        type: 'string'
      }
    ];

    this.parameters = [
      {
        name: 'language',
        type: 'select',
        options: ['javascript', 'python', 'shell', 'bash', 'node', 'custom'],
        default: 'javascript',
        description: 'Programming language'
      },
      {
        name: 'code',
        type: 'code',
        required: false,
        placeholder: 'Enter your code here',
        description: 'Code to execute'
      },
      {
        name: 'timeout',
        type: 'number',
        default: 30000,
        description: 'Execution timeout in milliseconds'
      },
      {
        name: 'workingDirectory',
        type: 'string',
        required: false,
        description: 'Working directory for execution'
      },
      {
        name: 'environment',
        type: 'json',
        default: {},
        description: 'Environment variables'
      },
      {
        name: 'allowFileSystem',
        type: 'boolean',
        default: true,
        description: 'Allow file system access'
      },
      {
        name: 'allowNetwork',
        type: 'boolean',
        default: true,
        description: 'Allow network access'
      },
      {
        name: 'allowShell',
        type: 'boolean',
        default: true,
        description: 'Allow shell commands'
      },
      {
        name: 'customCommand',
        type: 'string',
        required: false,
        placeholder: 'python3 {file}',
        description: 'Custom execution command'
      }
    ];
  }

  /**
   * Execute the node
   */
  async execute(inputs, parameters, context) {
    const {
      language,
      code: paramCode,
      timeout,
      workingDirectory,
      environment,
      allowFileSystem,
      allowNetwork,
      allowShell,
      customCommand
    } = parameters;

    const code = inputs.code || paramCode;
    const data = inputs.data;

    if (!code) {
      throw new Error('Code is required');
    }

    try {
      let result;

      switch (language) {
        case 'javascript':
        case 'node':
          result = await this.executeJavaScript(code, data, {
            timeout,
            allowFileSystem,
            allowNetwork,
            allowShell
          });
          break;

        case 'python':
          result = await this.executePython(code, data, {
            timeout,
            workingDirectory,
            environment
          });
          break;

        case 'shell':
        case 'bash':
          result = await this.executeShell(code, {
            timeout,
            workingDirectory,
            environment
          });
          break;

        case 'custom':
          result = await this.executeCustom(code, customCommand, {
            timeout,
            workingDirectory,
            environment
          });
          break;

        default:
          throw new Error(`Unsupported language: ${language}`);
      }

      return result;

    } catch (error) {
      throw new Error(`Code execution failed: ${error.message}`);
    }
  }

  /**
   * Execute JavaScript code
   */
  async executeJavaScript(code, data, options) {
    const { timeout, allowFileSystem, allowNetwork, allowShell } = options;

    // Create execution context
    const context = {
      data,
      console: console,
      require: allowFileSystem || allowNetwork ? require : undefined,
      process: allowShell ? process : undefined,
      __dirname: allowFileSystem ? __dirname : undefined,
      __filename: allowFileSystem ? __filename : undefined
    };

    // Wrap code in async function
    const wrappedCode = `
      (async function() {
        ${code}
      })()
    `;

    try {
      const func = new Function(...Object.keys(context), `return ${wrappedCode}`);
      
      const resultPromise = func(...Object.values(context));
      
      // Execute with timeout
      const result = await Promise.race([
        resultPromise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Execution timeout')), timeout)
        )
      ]);

      return {
        result,
        stdout: '',
        stderr: '',
        success: true
      };

    } catch (error) {
      return {
        result: null,
        stdout: '',
        stderr: error.message,
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Execute Python code
   */
  async executePython(code, data, options) {
    const { timeout, workingDirectory, environment } = options;

    // Create temporary file
    const tempDir = os.tmpdir();
    const tempFile = path.join(tempDir, `r3sn_${Date.now()}.py`);

    try {
      // Prepare code with data injection
      const fullCode = `
import json
import sys

# Injected data
data = ${JSON.stringify(data)}

# User code
${code}
`;

      await fs.writeFile(tempFile, fullCode);

      // Execute Python
      const { stdout, stderr } = await execAsync(`python3 ${tempFile}`, {
        timeout,
        cwd: workingDirectory || process.cwd(),
        env: { ...process.env, ...environment }
      });

      return {
        result: stdout.trim(),
        stdout,
        stderr,
        success: !stderr
      };

    } finally {
      // Cleanup
      try {
        await fs.unlink(tempFile);
      } catch {}
    }
  }

  /**
   * Execute shell commands
   */
  async executeShell(code, options) {
    const { timeout, workingDirectory, environment } = options;

    try {
      const { stdout, stderr } = await execAsync(code, {
        timeout,
        cwd: workingDirectory || process.cwd(),
        env: { ...process.env, ...environment },
        shell: true
      });

      return {
        result: stdout.trim(),
        stdout,
        stderr,
        success: !stderr,
        exitCode: 0
      };

    } catch (error) {
      return {
        result: null,
        stdout: error.stdout || '',
        stderr: error.stderr || error.message,
        success: false,
        exitCode: error.code || 1,
        error: error.message
      };
    }
  }

  /**
   * Execute custom command
   */
  async executeCustom(code, command, options) {
    const { timeout, workingDirectory, environment } = options;

    // Create temporary file
    const tempDir = os.tmpdir();
    const tempFile = path.join(tempDir, `r3sn_${Date.now()}.code`);

    try {
      await fs.writeFile(tempFile, code);

      // Replace {file} placeholder
      const execCommand = command.replace('{file}', tempFile);

      const { stdout, stderr } = await execAsync(execCommand, {
        timeout,
        cwd: workingDirectory || process.cwd(),
        env: { ...process.env, ...environment }
      });

      return {
        result: stdout.trim(),
        stdout,
        stderr,
        success: !stderr
      };

    } finally {
      // Cleanup
      try {
        await fs.unlink(tempFile);
      } catch {}
    }
  }
}

module.exports = CodeExecutorNode;
