
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

// IONOS AI Model Hub Configuration
export const IONOS_CONFIG = {
  apiKey: 'eyJ0eXAiOiJKV1QiLCJraWQiOiJhM2YzMzk5NC1lYzI2LTRiMjEtYjhmYy01N2U5YWRmNDhkZDkiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJpb25vc2Nsb3VkIiwiaWF0IjoxNzQyODMzNzEwLCJjbGllbnQiOiJVU0VSIiwiaWRlbnRpdHkiOnsicHJpdmlsZWdlcyI6WyJEQVRBX0NFTlRFUl9DUkVBVEUiLCJTTkFQU0hPVF9DUkVBVEUiLCJJUF9CTE9DS19SRVNFUlZFIiwiTUFOQUdFX0RBVEFQTEFURk9STSIsIkFDQ0VTU19BQ1RJVklUWV9MT0ciLCJQQ0NfQ1JFQVRFIiwiQUNDRVNTX1MzX09CSkVDVF9TVE9SQUdFIiwiQkFDS1VQX1VOSVRfQ1JFQVRFIiwiQ1JFQVRFX0lOVEVSTkVUX0FDQ0VTUyIsIks4U19DTFVTVEVSX0NSRUFURSIsIkZMT1dfTE9HX0NSRUFURSIsIkFDQ0VTU19BTkRfTUFOQUdFX01PTklUT1JJTkciLCJBQ0NFU1NfQU5EX01BTkFHRV9DRVJUSUZJQ0FURVMiLCJBQ0NFU1NfQU5EX01BTkFHRV9MT0dHSU5HIiwiTUFOQUdFX0RCQUFTIiwiQUNDRVNTX0FORF9NQU5BR0VfRE5TIiwiTUFOQUdFX1JFR0lTVFJZIiwiQUNDRVNTX0FORF9NQU5BR0VfQ0ROIiwiQUNDRVNTX0FORF9NQU5BR0VfVlBOIiwiQUNDRVNTX0FORF9NQU5BR0VfQVBJX0dBVEVXQVkiLCJBQ0NFU1NfQU5EX01BTkFHRV9OR1MiLCJBQ0NFU1NfQU5EX01BTkFHRV9LQUFTIiwiQUNDRVNTX0FORF9NQU5BR0VfTkVUV09SS19GSUxFX1NUT1JBR0UiLCJBQ0NFU1NfQU5EX01BTkFHRV9BSV9NT0RFTF9IVUIiLCJDUkVBVEVfTkVUV09SS19TRUNVUklUWV9HUk9VUFMiLCJBQ0NFU1NfQU5EX01BTkFHRV9JQU1fUkVTT1VSQ0VTIl0sInV1aWQiOiI3YmNiNzg4MS1hZDMxLTQxMDgtOGI3Zi0wOGIyNjdiYTI0ZWUiLCJyZXNlbGxlcklkIjoxLCJyZWdEb21haW4iOiJpb25vcy5jb20iLCJyb2xlIjoib3duZXIiLCJjb250cmFjdE51bWJlciI6MzM5NzEwMzMsImlzUGFyZW50IjpmYWxzZX0sImV4cCI6MTc0NTQyNTcxMH0.eIma7PTWouzDKv6VBR-zqxVEUhw_bBeO3x0JIDbcEjn-ciPUOULROmXVcTwSeYEfUPaSip64qQnPqSZTYaDoX0cHnarr5guu618gBELxTfw7VtQhAx4TM4RPhvoQKotC5u2pc8-ahZI8XdJstmja9bAitYATjmaSa6WIGVzlhgA2ZDzjn1js7YvqG5OcMjVeUA2CxsxSTTXwVMaPvC2W-Q_baeoGH2LZqrCC8kXTdVvRlNSIv-HEyakqivV0YjNXoOlf5F5-ldooYOkc5xNN7UMs54TqIPZwjH931WOdYL6G0dv6e6g1wo-A0iLHAdHc_x21wRiQAujtNmifxtVQYw',
  chatModelId: '0b6c4a15-bb8d-4092-82b0-f357b77c59fd',
  imageModelId: 'stabilityai/stable-diffusion-xl-base-1.0',
  baseUrl: 'https://api.ionoscloud.com/ai/v1',
};

// General app configuration
export const APP_CONFIG = {
  name: 'PDF Saga',
  maxFileSize: 10, // Maximum file size in MB
  allowedFileTypes: ['.pdf'],
  enableAnalytics: isProduction,
  // WebSocket configuration
  wsReconnectInterval: 3000, // Time in ms to attempt reconnection
  wsMaxReconnectAttempts: 5,
  // API keys configuration
  apiKeysConfigured: true, // Set to true since we now have the API keys
  // Set your model provider here - 'ionos', 'openai', etc.
  modelProvider: 'ionos',
};

export default {
  API,
  APP_CONFIG,
  IONOS_CONFIG,
  isDevelopment,
  isProduction,
};
