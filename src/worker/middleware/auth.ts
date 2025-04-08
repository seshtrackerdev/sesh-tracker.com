import { Context, Next } from 'hono';

// Extend Context variables type to allow our custom properties
type AppContext = {
  Bindings: Env;
  Variables: {
    user: AuthUser;
    isDemoAccount?: boolean;
    requestSource?: string;
    isMockAuth?: boolean;
  };
};

/**
 * Authentication middleware that verifies tokens with kush.observer
 * and adds user context to the request
 */
export async function authMiddleware(c: Context<AppContext>, next: Next) {
  // Get authorization header
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({
      success: false,
      error: 'Unauthorized - Missing or invalid authorization header',
      code: 'AUTH_HEADER_INVALID',
      timestamp: new Date().toISOString()
    }, 401);
  }

  // Extract the token
  const token = authHeader.split(' ')[1];
  
  try {
    // Check if AUTH_API_URL is defined
    const authApiUrl = c.env.AUTH_API_URL;
    
    if (!authApiUrl) {
      console.error('AUTH_API_URL environment variable is not defined');
      // Fallback to mock authentication in development
      if (c.env.API_ENV === 'development') {
        // Create a basic mock user
        const mockUser: AuthUser = {
          id: 'fallback-user-id',
          email: 'fallback@example.com',
          displayName: 'Fallback User',
          role: 'user',
          accountType: 'test',
          subscriptionTier: 'basic'
        };
        
        c.set('user', mockUser);
        c.set('requestSource', 'development');
        c.set('isMockAuth', true);
        
        console.warn('Using fallback mock authentication due to missing AUTH_API_URL');
        return next();
      } else {
        return c.json({
          success: false,
          error: 'Server configuration error - Auth service URL not configured',
          code: 'AUTH_CONFIG_ERROR',
          timestamp: new Date().toISOString()
        }, 500);
      }
    }
    
    try {
      // Verify token with kush.observer auth service
      const authResponse = await fetch(`${authApiUrl}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!authResponse.ok) {
        // Handle different auth error cases
        const errorData = await authResponse.json().catch(() => ({ code: 'PARSE_ERROR' })) as { code?: string };
        
        return c.json({
          success: false,
          error: 'Authentication failed',
          code: errorData.code || 'AUTH_FAILED',
          timestamp: new Date().toISOString()
        }, 401);
      }

      // Extract user data from verified token response
      const userData = await authResponse.json().catch(err => {
        console.error('Error parsing auth response:', err);
        return { user: null };
      }) as { user: AuthUser | null };
      
      if (!userData.user) {
        console.error('Auth response missing user data');
        return c.json({
          success: false,
          error: 'Invalid authentication response',
          code: 'AUTH_RESPONSE_INVALID',
          timestamp: new Date().toISOString()
        }, 500);
      }
      
      // Add user to context for route handlers
      c.set('user', userData.user);
      
      // Support demo accounts from configurations
      if (c.env.API_ENV === 'development' && 
          (userData.user.email === 'tester@email.com' || 
           userData.user.email === 'demouser1@email.com')) {
        
        // Set special permissions/flags for demo accounts
        c.set('isDemoAccount', true);
      }
    } catch (fetchError) {
      console.error('Auth service fetch error:', fetchError);
      
      // Fallback to mock user in development
      if (c.env.API_ENV === 'development') {
        console.warn('Auth service unavailable, using mock auth instead');
        return mockAuthMiddleware(c, next);
      }
      
      return c.json({
        success: false,
        error: 'Authentication service unavailable',
        code: 'AUTH_SERVICE_UNAVAILABLE',
        timestamp: new Date().toISOString()
      }, 503);
    }
    
    // Add request source tracking
    const origin = c.req.header('Origin') || '';
    if (origin.includes('sesh-tracker.com')) {
      c.set('requestSource', 'sesh-tracker');
    } else if (origin.includes('kush.observer')) {
      c.set('requestSource', 'kush-observer');
    } else if (origin.includes('my-cannabis-tracker.com')) {
      c.set('requestSource', 'admin-dashboard');
    } else if (origin.includes('localhost')) {
      c.set('requestSource', 'development');
    }
    
    // Continue to the route handler
    await next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    // Fallback to mock auth in development environment
    if (c.env.API_ENV === 'development') {
      console.warn('Auth middleware error, falling back to mock authentication');
      return mockAuthMiddleware(c, next);
    }
    
    return c.json({
      success: false,
      error: 'Authentication service error',
      code: 'AUTH_SERVICE_ERROR',
      timestamp: new Date().toISOString()
    }, 500);
  }
}

/**
 * Middleware to check if user has admin permissions
 */
export async function adminAuthMiddleware(c: Context<AppContext>, next: Next) {
  const user = c.get('user');
  
  if (!user) {
    return c.json({
      success: false,
      error: 'Unauthorized - Authentication required',
      code: 'AUTH_REQUIRED',
      timestamp: new Date().toISOString()
    }, 401);
  }
  
  if (user.role !== 'admin') {
    return c.json({
      success: false,
      error: 'Forbidden - Admin privileges required',
      code: 'ADMIN_REQUIRED',
      timestamp: new Date().toISOString()
    }, 403);
  }
  
  await next();
}

/**
 * Mock authentication for development/testing
 * This should only be used in development environment
 */
export async function mockAuthMiddleware(c: Context<AppContext>, next: Next) {
  // Always allow in dev or when mock header is present
  const allowMock = c.env.API_ENV === 'development' || c.req.header('X-Mock-User-Type') !== null;
  
  if (!allowMock) {
    return c.json({
      success: false,
      error: 'Mock auth only available in development',
      timestamp: new Date().toISOString()
    }, 403);
  }
  
  // Check for special development headers
  const mockUserType = c.req.header('X-Mock-User-Type') || 'default';
  
  let mockUser: AuthUser;
  
  switch (mockUserType) {
    case 'test':
      mockUser = {
        id: 'test-user-id',
        email: 'tester@email.com',
        displayName: 'Test User',
        role: 'user',
        accountType: 'test',
        subscriptionTier: 'premium'
      };
      break;
    
    case 'demo':
      mockUser = {
        id: 'demo-user-id',
        email: 'demouser1@email.com',
        displayName: 'Demo User',
        role: 'user',
        accountType: 'demo',
        subscriptionTier: 'premium'
      };
      break;
      
    case 'admin':
      mockUser = {
        id: 'admin-user-id',
        email: 'admin@email.com',
        displayName: 'Admin User',
        role: 'admin',
        accountType: 'admin',
        subscriptionTier: 'admin'
      };
      break;
      
    default:
      mockUser = {
        id: 'default-user-id',
        email: 'user@email.com',
        displayName: 'Default User',
        role: 'user',
        accountType: 'user',
        subscriptionTier: 'basic'
      };
  }
  
  c.set('user', mockUser);
  c.set('requestSource', 'development');
  c.set('isMockAuth', true);
  
  await next();
} 