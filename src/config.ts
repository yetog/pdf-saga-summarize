
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
    useMockApi: true, // Use mock API in development if backend is not available
  },
  production: {
    baseUrl: '/api', // Use relative URL in production (API is likely on same domain)
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
};

export default {
  API,
  APP_CONFIG,
  isDevelopment,
  isProduction,
};
