// Test script for HTTP endpoint
const axios = require('axios');

// URL of the deployed HTTP function
const functionUrl = 'https://us-central1-la-pure-a34c0.cloudfunctions.net/generateNewLookHttp';

async function testHttpEndpoint() {
  try {
    console.log('Testing HTTP endpoint OPTIONS (CORS preflight)...');
    
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
    
    // Now, test a GET request to check basic functionality
    console.log('\nTesting HTTP endpoint GET...');
    const getResponse = await axios({
      method: 'GET',
      url: functionUrl,
      headers: {
        'Origin': 'http://localhost:3000'
      }
    });
    
    console.log('GET Response Status:', getResponse.status);
    console.log('GET Response Data:', getResponse.data);
    
    // Finally, test a POST request with an invalid clientId
    // Using a bogus ID is safer for testing than a real one
    console.log('\nTesting HTTP endpoint POST with test client ID...');
    try {
      const postResponse = await axios({
        method: 'POST',
        url: functionUrl,
        headers: {
          'Origin': 'http://localhost:3000',
          'Content-Type': 'application/json'
        },
        data: {
          clientId: 'test-client-id-for-cors-check'
        }
      });
      
      console.log('POST Response Status:', postResponse.status);
      console.log('POST Response Data:', postResponse.data);
    } catch (postError) {
      // We expect this to fail with a 404 not found since the client ID is bogus
      // But the important thing is that it gets past the CORS check
      console.log('POST Response Status (expected error):', postError.response?.status);
      console.log('POST Response Data (expected error):', postError.response?.data);
      
      // Check that the error was not a CORS error
      if (postError.response) {
        console.log('Test was successful - received a proper API error, not a CORS error');
      } else {
        console.error('Test failed - this might be a CORS error or network error');
        console.error(postError);
      }
    }
    
    console.log('\nHTTP endpoint test completed!');
  } catch (error) {
    console.error('Test Error:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Headers:', error.response.headers);
      console.error('Response Data:', error.response.data);
    } else {
      console.error('No response received - possible CORS or network error');
    }
  }
}

// Run the test
testHttpEndpoint(); 