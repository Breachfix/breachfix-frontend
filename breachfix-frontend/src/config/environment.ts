// src/config/environment.ts
// Environment configuration for Vite frontend

export const ENV = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:7001/api/v3',
  API_ORIGIN: import.meta.env.VITE_API_ORIGIN || 'http://localhost:7001',
  BASE_URL: import.meta.env.VITE_BASE_URL || 'http://localhost:5173',
  CLIENT_URL: import.meta.env.VITE_CLIENT_URL || 'http://localhost:5173',
  FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173',

  // Development Configuration
  NODE_ENV: import.meta.env.VITE_NODE_ENV || 'development',
  DEV_MODE: import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,

  // Feature Flags
  ENABLE_DONATIONS: import.meta.env.VITE_ENABLE_DONATIONS === 'true' || true,
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true' || false,
  ENABLE_DEBUG_MODE: import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true' || false,

  // AllBibles API Configuration
  ALLBIBLES_API_URL: import.meta.env.VITE_ALLBIBLES_API_URL || 'http://localhost:7001/api/v3/allbibles',
  ALLBIBLES_ENABLE_PARALLEL: import.meta.env.VITE_ALLBIBLES_ENABLE_PARALLEL === 'true' || true,
  ALLBIBLES_ENABLE_CHANGES: import.meta.env.VITE_ALLBIBLES_ENABLE_CHANGES === 'true' || true,
  ALLBIBLES_ENABLE_EDITS: import.meta.env.VITE_ALLBIBLES_ENABLE_EDITS === 'true' || true,

  // Media API Configuration
  MEDIA_API_URL: import.meta.env.VITE_MEDIA_API_URL || 'http://localhost:7001/api/v3/media',
  MEDIA_UPLOAD_URL: import.meta.env.VITE_MEDIA_UPLOAD_URL || 'http://localhost:7001/api/v3/media/upload',

  // Authentication Configuration
  AUTH_API_URL: import.meta.env.VITE_AUTH_API_URL || 'http://localhost:7001/api/v3/auth',
  AUTH_REDIRECT_URL: import.meta.env.VITE_AUTH_REDIRECT_URL || 'http://localhost:5173/auth',

  // Stripe Configuration (only publishable key in frontend)
  STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',

  // Analytics Configuration (optional)
  GOOGLE_ANALYTICS_ID: import.meta.env.VITE_GOOGLE_ANALYTICS_ID || '',
  MIXPANEL_TOKEN: import.meta.env.VITE_MIXPANEL_TOKEN || '',

  // Social Media Configuration (optional)
  TWITTER_HANDLE: import.meta.env.VITE_TWITTER_HANDLE || '',
  FACEBOOK_PAGE: import.meta.env.VITE_FACEBOOK_PAGE || '',
  INSTAGRAM_HANDLE: import.meta.env.VITE_INSTAGRAM_HANDLE || '',

  // Contact Information
  CONTACT_EMAIL: import.meta.env.VITE_CONTACT_EMAIL || 'support@breachfix.com',
  SUPPORT_EMAIL: import.meta.env.VITE_SUPPORT_EMAIL || 'support@breachfix.com',

  // App Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Breachfix',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  APP_DESCRIPTION: import.meta.env.VITE_APP_DESCRIPTION || 'Production-grade Bible API system with comprehensive features',
} as const;

// Type-safe environment variable access
export type Environment = typeof ENV;

// Helper function to check if we're in development mode
export const isDevelopment = () => ENV.DEV_MODE;

// Helper function to check if we're in production mode
export const isProduction = () => ENV.IS_PRODUCTION;

// Helper function to get API URL with fallback
export const getApiUrl = (endpoint: string = '') => {
  return `${ENV.API_BASE_URL}${endpoint}`;
};

// Helper function to get full URL
export const getFullUrl = (path: string = '') => {
  return `${ENV.BASE_URL}${path}`;
};

// Validation function to check required environment variables
export const validateEnvironment = () => {
  const required = [
    'VITE_API_BASE_URL',
    'VITE_STRIPE_PUBLISHABLE_KEY', // Only if donations are enabled
  ];

  const missing = required.filter(key => !import.meta.env[key]);

  if (missing.length > 0) {
    console.warn('Missing required environment variables:', missing);
    if (ENV.DEV_MODE) {
      console.warn('Please create a .env file with the required variables');
    }
  }

  return missing.length === 0;
};

// Initialize environment validation
if (ENV.DEV_MODE) {
  validateEnvironment();
}
