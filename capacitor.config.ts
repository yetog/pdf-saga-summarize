
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.3ba687f6248f498eb7ad4addf2466f76',
  appName: 'pdf-saga-summarize',
  webDir: 'dist',
  server: {
    url: 'https://3ba687f6-248f-498e-b7ad-4addf2466f76.lovableproject.com?forceHideBadge=true',
    cleartext: true,
    allowNavigation: [
      'localhost:8000',
      // Add your actual backend domain here when deployed
    ]
  },
  ios: {
    contentInset: 'always',
    webViewHandleInternalUrls: true,
  },
  android: {
    captureInput: true,
    allowMixedContent: true,
  }
};

export default config;
