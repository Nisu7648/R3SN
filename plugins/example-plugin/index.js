/**
 * Example Plugin
 * Demonstrates how to create a custom plugin for R3SN
 */

class ExamplePlugin {
  constructor() {
    this.name = 'Example Plugin';
    this.nodes = [];
  }

  /**
   * Initialize plugin
   */
  async initialize() {
    console.log(`✅ ${this.name} initialized`);

    // Register custom nodes
    this.registerNodes();
  }

  /**
   * Register plugin nodes
   */
  registerNodes() {
    // Hello World Node
    this.nodes.push({
      type: 'example.hello',
      name: 'Hello World',
      description: 'Returns a hello world message',
      category: 'example',
      icon: '👋',
      color: '#4CAF50',
      
      inputs: [
        {
          name: 'name',
          type: 'string',
          required: false
        }
      ],
      
      outputs: [
        {
          name: 'message',
          type: 'string'
        }
      ],
      
      parameters: [
        {
          name: 'greeting',
          type: 'string',
          default: 'Hello',
          description: 'Greeting message'
        }
      ],
      
      execute: async (inputs, parameters, context) => {
        const name = inputs.name || 'World';
        const greeting = parameters.greeting || 'Hello';
        
        return {
          message: `${greeting}, ${name}!`,
          timestamp: new Date().toISOString()
        };
      }
    });

    // Math Operations Node
    this.nodes.push({
      type: 'example.math',
      name: 'Math Operations',
      description: 'Perform mathematical operations',
      category: 'example',
      icon: '🔢',
      color: '#2196F3',
      
      inputs: [
        {
          name: 'a',
          type: 'number',
          required: true
        },
        {
          name: 'b',
          type: 'number',
          required: true
        }
      ],
      
      outputs: [
        {
          name: 'result',
          type: 'number'
        }
      ],
      
      parameters: [
        {
          name: 'operation',
          type: 'select',
          options: ['add', 'subtract', 'multiply', 'divide'],
          default: 'add',
          required: true
        }
      ],
      
      execute: async (inputs, parameters, context) => {
        const { a, b } = inputs;
        const { operation } = parameters;

        let result;

        switch (operation) {
          case 'add':
            result = a + b;
            break;
          case 'subtract':
            result = a - b;
            break;
          case 'multiply':
            result = a * b;
            break;
          case 'divide':
            if (b === 0) {
              throw new Error('Division by zero');
            }
            result = a / b;
            break;
          default:
            throw new Error(`Unknown operation: ${operation}`);
        }

        return {
          result,
          operation,
          inputs: { a, b }
        };
      }
    });
  }

  /**
   * Get plugin nodes
   */
  getNodes() {
    return this.nodes;
  }

  /**
   * Cleanup plugin
   */
  async cleanup() {
    console.log(`🧹 ${this.name} cleaned up`);
  }
}

module.exports = ExamplePlugin;
