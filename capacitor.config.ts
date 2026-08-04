import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.latexf.app',
  appName: 'LATEXF',
  webDir: 'dist/untitled/browser',
  server: {
    cleartext: true,
    androidScheme: 'http'
  }
};

export default config;
