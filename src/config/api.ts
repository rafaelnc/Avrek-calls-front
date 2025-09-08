// API Configuration
export const API_CONFIG = {
  // Production API URL
  PRODUCTION: 'https://avrek-calls.onrender.com',
  
  // Development API URL (for local development)
  DEVELOPMENT: 'http://localhost:3001',
  
  // Current environment - change this to switch between environments
  CURRENT: 'https://avrek-calls.onrender.com'
};

// Export the current API base URL
export const API_BASE_URL = API_CONFIG.CURRENT;
