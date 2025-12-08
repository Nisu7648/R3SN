# Example Plugin

This is an example plugin for R3SN Workflow Engine demonstrating how to create custom plugins.

## Features

- **Hello World Node**: Simple greeting node
- **Math Operations Node**: Perform basic math operations

## Installation

1. Copy this plugin directory to `plugins/` folder
2. The plugin will be automatically loaded on server start
3. Hot-reload is enabled - changes will be detected automatically

## Plugin Structure

```
example-plugin/
├── plugin.json       # Plugin manifest
├── index.js          # Plugin implementation
└── README.md         # Documentation
```

## Creating Custom Nodes

### Node Structure

```javascript
{
  type: 'plugin.nodetype',
  name: 'Node Name',
  description: 'Node description',
  category: 'category',
  icon: '🔌',
  color: '#4CAF50',
  
  inputs: [
    {
      name: 'inputName',
      type: 'string',
      required: true
    }
  ],
  
  outputs: [
    {
      name: 'outputName',
      type: 'string'
    }
  ],
  
  parameters: [
    {
      name: 'paramName',
      type: 'string',
      default: 'value',
      required: false
    }
  ],
  
  execute: async (inputs, parameters, context) => {
    // Your node logic here
    return {
      result: 'output'
    };
  }
}
```

### Parameter Types

- `string`: Text input
- `number`: Numeric input
- `boolean`: True/false
- `select`: Dropdown selection
- `json`: JSON object
- `code`: Code editor
- `array`: Array of values

### Input/Output Types

- `string`: Text data
- `number`: Numeric data
- `boolean`: Boolean data
- `object`: JSON object
- `array`: Array of items
- `any`: Any data type

## Usage Example

### Hello World Node

```javascript
{
  id: '1',
  type: 'example.hello',
  name: 'Greet User',
  parameters: {
    greeting: 'Hi'
  }
}

// Input: { name: 'John' }
// Output: { message: 'Hi, John!', timestamp: '2024-01-01T00:00:00.000Z' }
```

### Math Operations Node

```javascript
{
  id: '2',
  type: 'example.math',
  name: 'Calculate Sum',
  parameters: {
    operation: 'add'
  }
}

// Input: { a: 5, b: 3 }
// Output: { result: 8, operation: 'add', inputs: { a: 5, b: 3 } }
```

## Plugin Manifest (plugin.json)

```json
{
  "id": "example-plugin",
  "name": "Example Plugin",
  "version": "1.0.0",
  "description": "Example plugin",
  "author": "Your Name",
  "main": "index.js",
  "nodes": [
    {
      "type": "example.hello",
      "name": "Hello World",
      "category": "example"
    }
  ],
  "dependencies": {},
  "permissions": ["network"],
  "icon": "🔌"
}
```

## Best Practices

1. **Error Handling**: Always handle errors gracefully
2. **Validation**: Validate inputs before processing
3. **Documentation**: Document your nodes clearly
4. **Testing**: Test nodes thoroughly
5. **Performance**: Optimize for performance
6. **Security**: Never expose sensitive data

## Advanced Features

### Using Context

```javascript
execute: async (inputs, parameters, context) => {
  // Access execution context
  const executionId = context.executionId;
  const workflowId = context.workflowId;
  
  // Set/get variables
  context.setVariable('myVar', 'value');
  const value = context.getVariable('myVar');
  
  // Check if should stop
  if (context.shouldStop()) {
    return { stopped: true };
  }
  
  return { result: 'success' };
}
```

### Async Operations

```javascript
execute: async (inputs, parameters, context) => {
  // Make API calls
  const response = await fetch('https://api.example.com/data');
  const data = await response.json();
  
  // Process data
  const processed = data.map(item => ({
    ...item,
    processed: true
  }));
  
  return { data: processed };
}
```

### Error Handling

```javascript
execute: async (inputs, parameters, context) => {
  try {
    // Your logic here
    return { success: true };
  } catch (error) {
    throw new Error(`Node execution failed: ${error.message}`);
  }
}
```

## Publishing Your Plugin

1. Create a GitHub repository
2. Add plugin files
3. Create a release
4. Submit to R3SN Plugin Marketplace

## Support

- GitHub Issues: https://github.com/Nisu7648/R3SN/issues
- Documentation: https://docs.r3sn.io/plugins

## License

MIT
