/**
 * R3SN Workflow Engine - Comprehensive Test Script
 * Tests all nodes and features
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testHealthCheck() {
  log('\n🏥 Testing Health Check...', 'cyan');
  try {
    const response = await axios.get(`${API_BASE}/health`);
    log(`✅ Health check passed: ${response.data.message}`, 'green');
    return true;
  } catch (error) {
    log(`❌ Health check failed: ${error.message}`, 'red');
    return false;
  }
}

async function testGetNodes() {
  log('\n📦 Testing Get All Nodes...', 'cyan');
  try {
    const response = await axios.get(`${API_BASE}/api/workflows/nodes`);
    const nodes = response.data.data;
    log(`✅ Found ${nodes.length} nodes:`, 'green');
    nodes.forEach(node => {
      log(`   ${node.icon || '📦'} ${node.name} (${node.type})`, 'blue');
    });
    return true;
  } catch (error) {
    log(`❌ Get nodes failed: ${error.message}`, 'red');
    return false;
  }
}

async function testHttpRequestNode() {
  log('\n🌐 Testing HTTP Request Node...', 'cyan');
  try {
    const workflow = {
      nodes: [
        {
          id: '1',
          type: 'http.request',
          name: 'Fetch GitHub User',
          parameters: {
            method: 'GET',
            url: 'https://api.github.com/users/octocat',
            timeout: 10000
          }
        }
      ],
      connections: []
    };

    const response = await axios.post(`${API_BASE}/api/workflows/execute`, {
      workflow,
      inputData: {}
    });

    log(`✅ HTTP Request executed successfully`, 'green');
    log(`   Execution ID: ${response.data.executionId}`, 'blue');
    log(`   Duration: ${response.data.duration}ms`, 'blue');
    return true;
  } catch (error) {
    log(`❌ HTTP Request failed: ${error.message}`, 'red');
    return false;
  }
}

async function testDataTransformNode() {
  log('\n🔄 Testing Data Transform Node...', 'cyan');
  try {
    const workflow = {
      nodes: [
        {
          id: '1',
          type: 'data.transform',
          name: 'Transform Data',
          parameters: {
            code: `
              return {
                message: 'Hello from R3SN!',
                timestamp: new Date().toISOString(),
                data: data
              };
            `
          }
        }
      ],
      connections: []
    };

    const response = await axios.post(`${API_BASE}/api/workflows/execute`, {
      workflow,
      inputData: { test: 'value' }
    });

    log(`✅ Data Transform executed successfully`, 'green');
    log(`   Result: ${JSON.stringify(response.data.result, null, 2)}`, 'blue');
    return true;
  } catch (error) {
    log(`❌ Data Transform failed: ${error.message}`, 'red');
    return false;
  }
}

async function testFilterNode() {
  log('\n🔍 Testing Filter Node...', 'cyan');
  try {
    const workflow = {
      nodes: [
        {
          id: '1',
          type: 'data.filter',
          name: 'Filter Numbers',
          parameters: {
            conditions: [
              { field: 'value', operator: 'greaterThan', value: 5 }
            ],
            logic: 'AND'
          }
        }
      ],
      connections: []
    };

    const response = await axios.post(`${API_BASE}/api/workflows/execute`, {
      workflow,
      inputData: [
        { value: 3 },
        { value: 7 },
        { value: 10 },
        { value: 2 }
      ]
    });

    log(`✅ Filter executed successfully`, 'green');
    log(`   Matched: ${response.data.result['1'].matched.length} items`, 'blue');
    return true;
  } catch (error) {
    log(`❌ Filter failed: ${error.message}`, 'red');
    return false;
  }
}

async function testWebSearchNode() {
  log('\n🌐 Testing Web Search Node (Unrestricted)...', 'cyan');
  try {
    const workflow = {
      nodes: [
        {
          id: '1',
          type: 'web.search',
          name: 'Search Web',
          parameters: {
            searchEngine: 'duckduckgo',
            query: 'artificial intelligence',
            maxResults: 5,
            scrapeContent: false
          }
        }
      ],
      connections: []
    };

    const response = await axios.post(`${API_BASE}/api/workflows/execute`, {
      workflow,
      inputData: {}
    });

    log(`✅ Web Search executed successfully`, 'green');
    log(`   Found ${response.data.result['1'].totalResults} results`, 'blue');
    return true;
  } catch (error) {
    log(`❌ Web Search failed: ${error.message}`, 'red');
    return false;
  }
}

async function testAIAgentNode() {
  log('\n🤖 Testing AI Agent Node (Unrestricted)...', 'cyan');
  log('   ⚠️  Requires API key in environment', 'yellow');
  try {
    const workflow = {
      nodes: [
        {
          id: '1',
          type: 'ai.agent',
          name: 'AI Assistant',
          parameters: {
            prompt: 'What is 2+2?',
            model: 'gpt-3.5-turbo',
            temperature: 0.7,
            noContentFilter: true
          }
        }
      ],
      connections: []
    };

    const response = await axios.post(`${API_BASE}/api/workflows/execute`, {
      workflow,
      inputData: {}
    });

    log(`✅ AI Agent executed successfully`, 'green');
    return true;
  } catch (error) {
    if (error.response?.status === 401 || error.message.includes('API key')) {
      log(`⚠️  AI Agent skipped: API key required`, 'yellow');
      return true;
    }
    log(`❌ AI Agent failed: ${error.message}`, 'red');
    return false;
  }
}

async function testCodeExecutorNode() {
  log('\n⚡ Testing Code Executor Node (Unrestricted)...', 'cyan');
  try {
    const workflow = {
      nodes: [
        {
          id: '1',
          type: 'code.executor',
          name: 'Execute Code',
          parameters: {
            language: 'javascript',
            code: `
              const result = 10 + 20;
              return { calculation: result, message: 'Code executed!' };
            `,
            allowFileSystem: true,
            allowNetwork: true
          }
        }
      ],
      connections: []
    };

    const response = await axios.post(`${API_BASE}/api/workflows/execute`, {
      workflow,
      inputData: {}
    });

    log(`✅ Code Executor executed successfully`, 'green');
    log(`   Result: ${JSON.stringify(response.data.result['1'].result, null, 2)}`, 'blue');
    return true;
  } catch (error) {
    log(`❌ Code Executor failed: ${error.message}`, 'red');
    return false;
  }
}

async function testComplexWorkflow() {
  log('\n🔗 Testing Complex Multi-Node Workflow...', 'cyan');
  try {
    const workflow = {
      nodes: [
        {
          id: '1',
          type: 'http.request',
          name: 'Fetch Data',
          parameters: {
            method: 'GET',
            url: 'https://jsonplaceholder.typicode.com/users'
          }
        },
        {
          id: '2',
          type: 'data.filter',
          name: 'Filter Users',
          parameters: {
            conditions: [
              { field: 'id', operator: 'lessThan', value: 5 }
            ],
            logic: 'AND'
          }
        },
        {
          id: '3',
          type: 'data.transform',
          name: 'Transform',
          parameters: {
            code: `
              return data.matched.map(user => ({
                name: user.name,
                email: user.email,
                city: user.address.city
              }));
            `
          }
        }
      ],
      connections: [
        { source: '1', target: '2' },
        { source: '2', target: '3' }
      ]
    };

    const response = await axios.post(`${API_BASE}/api/workflows/execute`, {
      workflow,
      inputData: {}
    });

    log(`✅ Complex workflow executed successfully`, 'green');
    log(`   Duration: ${response.data.duration}ms`, 'blue');
    log(`   Final result: ${JSON.stringify(response.data.result['3'], null, 2).substring(0, 200)}...`, 'blue');
    return true;
  } catch (error) {
    log(`❌ Complex workflow failed: ${error.message}`, 'red');
    return false;
  }
}

async function testPluginSystem() {
  log('\n🔌 Testing Plugin System...', 'cyan');
  try {
    const response = await axios.get(`${API_BASE}/api/plugins`);
    const plugins = response.data.data;
    log(`✅ Found ${plugins.length} plugins:`, 'green');
    plugins.forEach(plugin => {
      log(`   ${plugin.icon || '🔌'} ${plugin.name} v${plugin.version}`, 'blue');
    });
    return true;
  } catch (error) {
    log(`❌ Plugin system test failed: ${error.message}`, 'red');
    return false;
  }
}

async function testAPIDesigner() {
  log('\n🎨 Testing API Designer...', 'cyan');
  try {
    // Create API
    const createResponse = await axios.post(`${API_BASE}/api/designer/apis`, {
      name: 'Test API',
      baseUrl: 'https://api.example.com',
      authentication: { type: 'bearer' },
      endpoints: [
        {
          method: 'GET',
          path: '/test',
          name: 'Test Endpoint'
        }
      ]
    });

    const apiId = createResponse.data.data.id;
    log(`✅ API created with ID: ${apiId}`, 'green');

    // Get all APIs
    const listResponse = await axios.get(`${API_BASE}/api/designer/apis`);
    log(`✅ Found ${listResponse.data.data.length} APIs`, 'green');

    // Delete API
    await axios.delete(`${API_BASE}/api/designer/apis/${apiId}`);
    log(`✅ API deleted successfully`, 'green');

    return true;
  } catch (error) {
    log(`❌ API Designer test failed: ${error.message}`, 'red');
    return false;
  }
}

async function testMLInsights() {
  log('\n🤖 Testing ML Insights...', 'cyan');
  try {
    const response = await axios.get(`${API_BASE}/api/ml/analytics/daily`);
    log(`✅ ML Analytics retrieved successfully`, 'green');
    log(`   Total executions: ${response.data.data.totalExecutions}`, 'blue');
    return true;
  } catch (error) {
    log(`❌ ML Insights test failed: ${error.message}`, 'red');
    return false;
  }
}

async function runAllTests() {
  log('\n' + '='.repeat(60), 'cyan');
  log('🚀 R3SN Workflow Engine - Comprehensive Test Suite', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');

  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Get Nodes', fn: testGetNodes },
    { name: 'HTTP Request Node', fn: testHttpRequestNode },
    { name: 'Data Transform Node', fn: testDataTransformNode },
    { name: 'Filter Node', fn: testFilterNode },
    { name: 'Web Search Node', fn: testWebSearchNode },
    { name: 'AI Agent Node', fn: testAIAgentNode },
    { name: 'Code Executor Node', fn: testCodeExecutorNode },
    { name: 'Complex Workflow', fn: testComplexWorkflow },
    { name: 'Plugin System', fn: testPluginSystem },
    { name: 'API Designer', fn: testAPIDesigner },
    { name: 'ML Insights', fn: testMLInsights }
  ];

  const results = [];

  for (const test of tests) {
    try {
      const passed = await test.fn();
      results.push({ name: test.name, passed });
    } catch (error) {
      results.push({ name: test.name, passed: false });
    }
  }

  // Summary
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 Test Summary', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    const color = result.passed ? 'green' : 'red';
    log(`${icon} ${result.name}`, color);
  });

  log(`\n📈 Results: ${passed}/${results.length} tests passed`, passed === results.length ? 'green' : 'yellow');
  
  if (failed > 0) {
    log(`⚠️  ${failed} test(s) failed`, 'red');
  } else {
    log('🎉 All tests passed!', 'green');
  }

  log('\n' + '='.repeat(60) + '\n', 'cyan');
}

// Run tests
runAllTests().catch(error => {
  log(`\n❌ Test suite failed: ${error.message}`, 'red');
  process.exit(1);
});
