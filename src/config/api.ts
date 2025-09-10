// API Configuration
export const API_CONFIG = {
  // Production API URL (Railway)
  PRODUCTION: 'https://avrek-calls-production.up.railway.app',
  
  // Development API URL (for local development)
  DEVELOPMENT: 'http://localhost:3001',
  
  // Current environment - automatically detects based on NODE_ENV
  CURRENT: (() => {
    const isDev = import.meta.env.DEV || import.meta.env.VITE_NODE_ENV === 'development';
    const customUrl = import.meta.env.VITE_API_URL;
    
    // If custom URL is provided, use it
    if (customUrl) {
      return customUrl;
    }
    
    // Otherwise, use environment-based URL
    return isDev 
      ? import.meta.env.VITE_API_URL_DEV || 'http://localhost:3001'
      : 'https://avrek-calls-production.up.railway.app';
  })()
};

// Export the current API base URL
export const API_BASE_URL = API_CONFIG.CURRENT;
