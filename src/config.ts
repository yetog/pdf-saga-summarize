
/**
 * Application configuration
 */

// Environment detection
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// API configuration
const API_CONFIG = {
  // In production, this would be your server's domain
  development: {
    baseUrl: 'http://localhost:8000',
    wsUrl: 'ws://localhost:8000/ws',
    useMockApi: true, // Use mock API in development if backend is not available
  },
  production: {
    baseUrl: '/api', // Use relative URL in production (API is likely on same domain)
    wsUrl: 'wss://your-production-domain.com/ws',
    useMockApi: false,
  },
};

// Export the API configuration based on environment
export const API = isProduction 
  ? API_CONFIG.production 
  : API_CONFIG.development;

// General app configuration
export const APP_CONFIG = {
  name: 'PDF Saga',
  maxFileSize: 10, // Maximum file size in MB
  allowedFileTypes: ['.pdf'],
  enableAnalytics: isProduction,
  // WebSocket configuration
  wsReconnectInterval: 3000, // Time in ms to attempt reconnection
  wsMaxReconnectAttempts: 5,
};

export default {
  API,
  APP_CONFIG,
  isDevelopment,
  isProduction,
};
