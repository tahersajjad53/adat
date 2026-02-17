import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.adat.app',
  appName: 'Adat',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
