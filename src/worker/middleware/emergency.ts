import { Context } from 'hono';
import type { Next } from 'hono';

/**
 * Emergency fallback middleware for auth failures during migration
 * 
 * This middleware catches authentication failures and routes them to a legacy fallback
 * endpoint as a safety mechanism during the migration period.
 */

const LEGACY_AUTH_ENDPOINT = 'https://archive.sesh-tracker.com/kush-fallback';

// Define a type for our fallback response
interface FallbackResponse {
  success: boolean;
  message?: string;
  [key: string]: unknown;
}

/**
 * Middleware that intercepts auth failures and attempts to use a legacy fallback
 */
export const emergencyAuthFallback = async (c: Context, next: Next) => {
  try {
    // Try normal execution path
    await next();
  } catch (error: unknown) {
    // Only intercept auth-related failures
    const err = error as Error;
    if (err.message && err.message.includes('AUTH_FAILURE')) {
      console.warn('Auth failure detected, attempting legacy fallback', {
        path: c.req.path,
        error: err.message
      });

      try {
        // Clone the request body for the fallback
        const clonedBody = await c.req.raw.clone().text();
        
        // Attempt to call the legacy fallback endpoint
        const fallback = await fetch(LEGACY_AUTH_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Emergency-Fallback': '1'
          },
          body: clonedBody
        });
        
        if (!fallback.ok) {
          throw new Error(`Fallback returned ${fallback.status}`);
        }
        
        // Return fallback response with 503 status to indicate service degradation
        const fallbackData = await fallback.json() as FallbackResponse;
        return c.json(fallbackData, 503);
      } catch (fallbackError) {
        console.error('Legacy fallback also failed', fallbackError);
        // Re-throw the original error if fallback fails
        throw error;
      }
    }
    
    // Re-throw non-auth errors
    throw error;
  }
};

export default emergencyAuthFallback; 