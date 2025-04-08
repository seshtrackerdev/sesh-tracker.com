/**
 * Production configuration for Sesh-Tracker frontend
 * Uses the new unified authentication system
 */
export const PROD_CONFIG = {
  auth: {
    loginUrl: '/api/auth/login',
    logoutUrl: '/api/auth/logout',
    registerUrl: '/api/auth/register',
    verifyUrl: '/api/auth/verify',
    sessionRefresh: '/api/auth/session/refresh' 
  },
  api: {
    baseUrl: 'https://sesh-tracker.com/api',
    version: 'v1',
  },
  dashboard: {
    cacheTtl: 300, // 5 minutes
    widgetTypes: [
      'inventory',
      'history',
      'stats',
      'calendar',
      'recommendations'
    ],
  },
  features: {
    legacy: {
      enabled: false, // No longer using legacy systems
      redirectToNew: true
    }
  }
}; 