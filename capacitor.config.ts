import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jyovix.marketos',
  appName: 'MarketOS',
  webDir: 'www',
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
