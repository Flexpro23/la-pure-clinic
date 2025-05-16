import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lapureclinic.app',
  appName: 'La Pure Clinic',
  webDir: '.next',
  server: {
    androidScheme: 'https',
    url: 'http://localhost:3000',
    cleartext: true
  }
};

export default config;
