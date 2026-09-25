import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jyovix.marketos',
  appName: 'Jyovix Marketing',
  // Angular's application builder writes the app to <outputPath>/browser
  webDir: 'www/browser',
  backgroundColor: '#0B0F14',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0B0F14'
    }
  }
};

export default config;
