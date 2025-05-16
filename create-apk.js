const fs = require('fs');
const path = require('path');
const https = require('https');
const { exec } = require('child_process');
const readline = require('readline');

// Create a readline interface for reading user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ask for the URL
rl.question('Enter your PWA URL (e.g., from ngrok): ', (pwaUrl) => {
  // Validate URL
  if (!pwaUrl.startsWith('http')) {
    console.error('Please enter a valid URL starting with http:// or https://');
    rl.close();
    return;
  }

  console.log(`\nGenerating APK for ${pwaUrl}...`);
  console.log('This may take a few minutes...\n');

  // Create bubblewrap directory if it doesn't exist
  if (!fs.existsSync('./bubblewrap')) {
    fs.mkdirSync('./bubblewrap');
  }

  // Download and run PWA2APK
  const command = `
    cd bubblewrap && 
    npm init -y &&
    npm install @bubblewrap/cli &&
    npx bubblewrap init --manifest="${pwaUrl}/manifest.json" --directory=./twa-app &&
    cd twa-app &&
    npm install &&
    npx bubblewrap build
  `;

  const process = exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      console.log('\nAlternative method:');
      console.log('1. Go to https://www.pwabuilder.com/');
      console.log(`2. Enter your PWA URL: ${pwaUrl}`);
      console.log('3. Follow the prompts to generate and download your APK');
      rl.close();
      return;
    }

    // Look for the generated APK
    const apkPath = path.join(__dirname, 'bubblewrap', 'twa-app', 'app-release-signed.apk');
    
    if (fs.existsSync(apkPath)) {
      console.log('\n✅ APK successfully generated!');
      console.log(`APK location: ${apkPath}`);
      console.log('\nYou can install this APK on any Android device by transferring the file and opening it.');
    } else {
      console.log('\n❌ Could not find the generated APK.');
      console.log('\nPlease use PWA Builder instead:');
      console.log('1. Go to https://www.pwabuilder.com/');
      console.log(`2. Enter your PWA URL: ${pwaUrl}`);
      console.log('3. Follow the prompts to generate and download your APK');
    }
    
    rl.close();
  });

  // Log output in real-time
  process.stdout.on('data', (data) => {
    console.log(data);
  });

  process.stderr.on('data', (data) => {
    console.error(data);
  });
}); 