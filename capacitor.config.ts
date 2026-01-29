import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.microbizdash.game',
  appName: 'Micro-Biz Dash',
  webDir: 'dist',
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
    // Allow web content to handle touch events properly
    allowsLinkPreview: false,
    // Disable text selection (game doesn't need it)
    limitsNavigationsToAppBoundDomains: false
  },
  server: {
    // For development, you can point to your dev server
    // For production, leave this commented out
    // url: 'http://localhost:3000',
    // cleartext: true
  }
};

export default config;
