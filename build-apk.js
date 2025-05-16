const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to execute commands
function runCommand(command) {
  console.log(`Executing: ${command}`);
  try {
    const output = execSync(command, { stdio: 'inherit' });
    return output;
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

// Build the Next.js app
console.log('Building Next.js application...');
runCommand('npm run build');

// Sync Capacitor
console.log('Syncing Capacitor...');
runCommand('npx cap sync');

// Function to update Java version in build.gradle files
function updateJavaVersion(filePath, fromVersion, toVersion) {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace Java version in compileOptions
  const updatedContent = content.replace(
    new RegExp(`sourceCompatibility JavaVersion.VERSION_${fromVersion}`, 'g'),
    `sourceCompatibility JavaVersion.VERSION_${toVersion}`
  ).replace(
    new RegExp(`targetCompatibility JavaVersion.VERSION_${fromVersion}`, 'g'),
    `targetCompatibility JavaVersion.VERSION_${toVersion}`
  );
  
  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`Updated Java version in ${filePath}`);
    return true;
  }
  
  return false;
}

// Update Java versions in build.gradle files
console.log('Updating Java version in build files...');

// Update version in the main project's build.gradle
updateJavaVersion(
  path.join(__dirname, 'android', 'build.gradle'),
  '17', 
  '23'
);

// Update version in the app's build.gradle
updateJavaVersion(
  path.join(__dirname, 'android', 'app', 'build.gradle'),
  '17',
  '23'
);

// Update version in Capacitor's build.gradle
updateJavaVersion(
  path.join(__dirname, 'node_modules', '@capacitor', 'android', 'capacitor', 'build.gradle'),
  '21',
  '23'
);

// Build the APK
console.log('Building Android APK...');
try {
  runCommand('cd android && .\\gradlew.bat assembleDebug');
  console.log('APK build completed successfully!');
  console.log('The APK should be available at: android/app/build/outputs/apk/debug/app-debug.apk');
} catch (error) {
  console.error('Failed to build APK:', error);
} 