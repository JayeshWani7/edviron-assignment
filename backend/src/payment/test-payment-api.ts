import axios from 'axios';

const BASE_URL = 'http://localhost:3000/payment';

// Test data
const testData = {
  school_id: '65b0e6293e9f76a9694d84b4',
  amount: '1',
  callback_url: 'https://google.com'
};

/**
 * Test the create collect request endpoint (simple version with auto JWT)
 */
async function testCreateCollectRequest() {
  try {
    console.log('🚀 Testing Create Collect Request (Simple)...');
    
    const response = await axios.post(`${BASE_URL}/create-collect-request-simple`, testData);
    
    console.log('✅ Success:', response.data);
    
    if (response.data?.data?.collect_request_id) {
      return response.data.data.collect_request_id;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error creating collect request:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Test the check payment status endpoint (simple version with auto JWT)
 */
async function testCheckPaymentStatus(collectRequestId: string) {
  try {
    console.log('🔍 Testing Check Payment Status (Simple)...');
    
    const response = await axios.get(
      `${BASE_URL}/collect-request-simple/${collectRequestId}?school_id=${testData.school_id}`
    );
    
    console.log('✅ Success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error checking payment status:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Test the create collect request endpoint with manual JWT
 */
async function testCreateCollectRequestManual() {
  try {
    console.log('🔧 Testing Create Collect Request (Manual JWT)...');
    
    // You would need to generate the JWT manually here
    const manualJWT = 'eyJhbGciOiJIUzI1NiJ9.eyJzY2hvb2xfaWQiOiI2NWIwZTYyOTNlOWY3NmE5Njk0ZDg0YjQiLCJhbW91bnQiOiIxIiwiY2FsbGJhY2tfdXJsIjoiaHR0cHM6Ly9nb29nbGUuY29tIn0.DJ10HHluuiIc4ShhEPYEJZ2xWNpF_g1V0x2nGNcB9uk';
    
    const manualData = {
      ...testData,
      sign: manualJWT
    };
    
    const response = await axios.post(`${BASE_URL}/create-collect-request`, manualData);
    
    console.log('✅ Success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error creating collect request (manual):', error.response?.data || error.message);
    return null;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🧪 Starting Edviron Payment API Tests...\n');
  
  // Test 1: Create collect request (simple)
  const collectRequestId = await testCreateCollectRequest();
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Check payment status (if we got a collect request ID)
  if (collectRequestId) {
    await testCheckPaymentStatus(collectRequestId);
    console.log('\n' + '='.repeat(50) + '\n');
  }
  
  // Test 3: Create collect request with manual JWT
  await testCreateCollectRequestManual();
  
  console.log('\n🏁 Tests completed!');
}

// Run the tests
if (require.main === module) {
  runTests().catch(console.error);
}

export { testCreateCollectRequest, testCheckPaymentStatus, testCreateCollectRequestManual };