import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ibadat.app',
  appName: 'Ibadat',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
