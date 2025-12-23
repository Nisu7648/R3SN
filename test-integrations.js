/**
 * Integration Test Script
 * Run this to verify integrations are working
 */

const integrationLoader = require('./backend/integrations/index');

console.log('\n🧪 Testing R3SN Integration Loader\n');
console.log('='.repeat(60));

// Test 1: Get all integrations
console.log('\n📦 Test 1: Loading all integrations...');
const integrations = integrationLoader.getAllIntegrations();
console.log(`✅ Loaded ${integrations.length} integrations\n`);

// Test 2: List each integration
console.log('📋 Test 2: Integration Details:\n');
integrations.forEach((integration, index) => {
  console.log(`${index + 1}. ${integration.icon} ${integration.name}`);
  console.log(`   ID: ${integration.id}`);
  console.log(`   Category: ${integration.category}`);
  console.log(`   Cost: ${integration.cost}`);
  console.log(`   Actions: ${integration.actions.length}`);
  console.log('');
});

// Test 3: Verify specific integrations
console.log('🔍 Test 3: Verifying key integrations...\n');
const keyIntegrations = [
  'huggingface-inference-free',
  'stability-ai-free',
  'elevenlabs-free',
  'mistral-ai-free',
  'cohere-ai-free',
  'perplexity-ai-free',
  'dify-ai-free',
  'stripe',
  'openai',
  'slack',
  'github',
  'sendgrid',
  'twilio'
];

keyIntegrations.forEach(id => {
  const integration = integrationLoader.getIntegration(id);
  if (integration) {
    console.log(`✅ ${id} - FOUND`);
  } else {
    console.log(`❌ ${id} - MISSING`);
  }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log('\n📊 SUMMARY:');
console.log(`   Total Integrations: ${integrations.length}`);
console.log(`   Expected: 13`);
console.log(`   Status: ${integrations.length >= 13 ? '✅ PASS' : '❌ FAIL'}`);
console.log('\n' + '='.repeat(60) + '\n');
