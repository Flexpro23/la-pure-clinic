// Simple CORS test script
const axios = require('axios');

// URL of the deployed HTTP function
const functionUrl = 'https://us-central1-la-pure-a34c0.cloudfunctions.net/generateNewLookHttp';

async function testCors() {
  try {
    console.log('Testing CORS headers with OPTIONS request...');
    
    // Test preflight request
    const preflightResponse = await axios({
      method: 'OPTIONS',
      url: functionUrl,
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log('Preflight Response Status:', preflightResponse.status);
    console.log('CORS Headers:', {
      'Access-Control-Allow-Origin': preflightResponse.headers['access-control-allow-origin'],
      'Access-Control-Allow-Methods': preflightResponse.headers['access-control-allow-methods'],
      'Access-Control-Allow-Headers': preflightResponse.headers['access-control-allow-headers']
    });
    
    // Test actual request
    console.log('\nTesting actual POST request...');
    const response = await axios({
      method: 'POST',
      url: functionUrl,
      headers: {
        'Origin': 'http://localhost:3000',
        'Content-Type': 'application/json'
      },
      data: {
        clientId: 'test-client-id'
      }
    });
    
    console.log('Response Status:', response.status);
    console.log('Response Data:', response.data);
    console.log('CORS Headers:', {
      'Access-Control-Allow-Origin': response.headers['access-control-allow-origin']
    });
    
    console.log('\nCORS test completed successfully!');
  } catch (error) {
    console.error('CORS Test Error:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Headers:', error.response.headers);
      console.error('Response Data:', error.response.data);
    }
  }
}

// Run the test
testCors(); 