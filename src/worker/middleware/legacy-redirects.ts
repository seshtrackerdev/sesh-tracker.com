import { Context, Next } from 'hono';

/**
 * Middleware to handle legacy sesh-tracker.com paths
 * Redirects or responds with appropriate messages
 */
const legacyPaths = [
  '/kush/auth',
  '/observer/api',
  '/legacy-profile'
];

// Use a generic context type that only depends on what we actually use
export const handleLegacyRoutes = async (c: Context, next: Next) => {
  const path = new URL(c.req.url).pathname;
  
  if (legacyPaths.some(prefix => path.startsWith(prefix))) {
    if (c.req.method === 'OPTIONS') {
      // Allow OPTIONS requests to pass through for CORS preflight
      return next();
    }
    
    // Send a 301 redirect to the new endpoint
    return c.redirect(`https://sesh-tracker.com${path.replace(/^\/(kush|observer)/, '')}`, 301);
  }
  
  await next();
};

export default handleLegacyRoutes; 
