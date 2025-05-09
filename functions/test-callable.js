// Test script for Firebase callable function
const { initializeApp } = require('firebase/app');
const { getFunctions, httpsCallable, connectFunctionsEmulator } = require('firebase/functions');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAsyl-M2O30Zu2Gyy4_bDAVud_-VsPnO_c",
  authDomain: "la-pure-a34c0.firebaseapp.com",
  projectId: "la-pure-a34c0",
  storageBucket: "la-pure-a34c0.firebasestorage.app",
  messagingSenderId: "1071134391639",
  appId: "1:1071134391639:web:7a0eb4a6f7d7b30eb61212",
  measurementId: "G-0V0YHJKDN0"
};

async function testCallableFunction() {
  try {
    console.log('Initializing Firebase app...');
    const app = initializeApp(firebaseConfig);
    
    console.log('Getting functions reference...');
    const functions = getFunctions(app, 'us-central1');
    
    // Uncomment to use emulator
    // connectFunctionsEmulator(functions, 'localhost', 5001);
    
    console.log('Creating callable function reference...');
    const generateNewLookFunction = httpsCallable(functions, 'generateNewLook', {
      timeout: 300000 // 5 minutes
    });
    
    // Use a valid client ID from your Firebase database
    const clientId = 'test-client-id'; // Replace with an actual client ID
    
    console.log(`Calling generateNewLook function with clientId: ${clientId}...`);
    const result = await generateNewLookFunction({ clientId });
    
    console.log('Function completed successfully!');
    console.log('Result:', JSON.stringify(result.data, null, 2));
  } catch (error) {
    console.error('Error calling function:', error);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    if (error.message) {
      console.error('Error message:', error.message);
    }
    if (error.details) {
      console.error('Error details:', error.details);
    }
  }
}

// Run the test
testCallableFunction(); 