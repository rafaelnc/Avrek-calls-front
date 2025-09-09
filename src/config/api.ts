// API Configuration
export const API_CONFIG = {
  // Production API URL (Railway)
  PRODUCTION: 'https://avrek-calls-production.up.railway.app',
  
  // Development API URL (for local development)
  DEVELOPMENT: 'http://localhost:3001',
  
  // Current environment - gets from environment variables
  CURRENT: import.meta.env.VITE_API_URL || 'https://avrek-calls-production.up.railway.app'
};

// Export the current API base URL
export const API_BASE_URL = API_CONFIG.CURRENT;
