/**
 * Data Transform Node - Transform and manipulate data
 */

class DataTransformNode {
  constructor() {
    this.type = 'data.transform';
    this.name = 'Data Transform';
    this.description = 'Transform and manipulate data using JavaScript';
    this.category = 'data';
    this.icon = '🔄';
    this.color = '#2196F3';

    this.inputs = [
      {
        name: 'data',
        type: 'any',
        required: true
      }
    ];

    this.outputs = [
      {
        name: 'result',
        type: 'any'
      }
    ];

    this.parameters = [
      {
        name: 'code',
        type: 'code',
        language: 'javascript',
        required: true,
        placeholder: 'return data.map(item => ({ ...item, processed: true }));'
      },
      {
        name: 'timeout',
        type: 'number',
        default: 5000,
        description: 'Execution timeout in milliseconds'
      }
    ];
  }

  /**
   * Execute the node
   */
  async execute(inputs, parameters, context) {
    const { data } = inputs;
    const { code, timeout } = parameters;

    try {
      // Create safe execution context
      const func = new Function('data', 'context', code);

      // Execute with timeout
      const result = await this.executeWithTimeout(
        () => func(data, context),
        timeout
      );

      return result;

    } catch (error) {
      throw new Error(`Data transformation failed: ${error.message}`);
    }
  }

  /**
   * Execute function with timeout
   */
  executeWithTimeout(fn, timeout) {
    return Promise.race([
      Promise.resolve(fn()),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Execution timeout')), timeout)
      )
    ]);
  }
}

module.exports = DataTransformNode;
