#!/usr/bin/env node

// Test script to simulate UPI payment scenarios
// Usage: node test-upi-scenarios.js [collect_request_id] [upi_id]

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api'; // Adjust port if different
const WEBHOOK_URL = `${BASE_URL}/webhook/test-upi-scenarios`;

async function testUpiScenario(collectRequestId, upiId) {
  try {
    console.log(`🧪 Testing UPI scenario: ${upiId} for payment ${collectRequestId}`);
    
    const response = await axios.post(WEBHOOK_URL, {
      collect_request_id: collectRequestId,
      upi_id: upiId
    });

    console.log('✅ Test completed successfully:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    return null;
  }
}

async function runAllScenarios(collectRequestId) {
  console.log(`🔄 Running all UPI test scenarios for payment: ${collectRequestId}\n`);
  
  const scenarios = [
    { upi_id: 'testsuccess@gocash', description: 'Success scenario' },
    { upi_id: 'testfailure@gocash', description: 'Failure scenario' },
    { upi_id: 'testinvalid@gocash', description: 'Invalid VPA scenario' }
  ];

  for (const scenario of scenarios) {
    console.log(`\n📋 ${scenario.description}`);
    console.log('='.repeat(50));
    await testUpiScenario(collectRequestId, scenario.upi_id);
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🏁 All scenarios completed!');
}

// Get command line arguments
const [,, collectRequestId, upiId] = process.argv;

if (!collectRequestId) {
  console.log(`
🧪 UPI Payment Test Scenarios

Usage:
  node test-upi-scenarios.js <collect_request_id> [upi_id]

Examples:
  # Test specific scenario
  node test-upi-scenarios.js abc123 testsuccess@gocash
  
  # Test all scenarios
  node test-upi-scenarios.js abc123

Available UPI IDs:
  testsuccess@gocash  - Success scenario
  testfailure@gocash  - Failure scenario  
  testinvalid@gocash  - Invalid VPA scenario
  `);
  process.exit(1);
}

// Run the tests
if (upiId) {
  // Test specific scenario
  testUpiScenario(collectRequestId, upiId);
} else {
  // Run all scenarios
  runAllScenarios(collectRequestId);
}