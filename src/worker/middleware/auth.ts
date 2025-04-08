import { Context, Next } from 'hono';
import { verify } from 'hono/jwt';

// Define direct context type for auth middleware
type AuthContext = {
  Bindings: {
    JWT_SECRET: string;
    DB: D1Database;
    SESHDBPROD: D1Database;
  };
  Variables: {
    user: {
      id: string;
      email: string;
      displayName: string;
      role: string;
      accountType: string;
      subscriptionTier: string;
    };
  };
};

/**
 * Production-ready authentication middleware using D1 sessions
 */
export const productionAuth = async (c: Context<AuthContext>, next: Next) => {
  // 🔼 Production-tested validation
  const sessionToken = c.req.header('X-Session-Token') || c.req.header('Authorization')?.replace('Bearer ', '');
  
  if (!sessionToken) {
    return c.json({
      success: false,
      error: 'Missing session token',
    }, 401);
  }
  
  try {
    const user = await c.env.SESHDBPROD.prepare(`
      SELECT users.* FROM sessions
      JOIN users ON sessions.user_id = users.id
      WHERE sessions.token = ?
      AND sessions.expires_at > unixepoch()
    `).bind(sessionToken).first();

    if (!user) {
      return c.json({
        success: false,
        error: 'Session expired or invalid',
      }, 401);
    }
    
    // Set the user in context with the same structure as the existing middleware
    c.set('user', {
      id: user.id,
      email: user.email,
      displayName: user.displayName || user.display_name,
      role: user.role,
      accountType: user.accountType || user.account_type,
      subscriptionTier: user.subscriptionTier || user.subscription_tier,
    });
    
    await next();
  } catch (error) {
    console.error('Auth error:', error);
    return c.json({
      success: false,
      error: 'Invalid session',
    }, 401);
  }
};

/**
 * Simple authentication middleware that verifies JWT tokens
 */
export async function authMiddleware(c: Context<AuthContext>, next: Next) {
  // Get authorization header
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({
      success: false,
      error: 'Missing or invalid authorization header',
    }, 401);
  }

  // Extract the token
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify JWT token
    const payload = await verify(token, c.env.JWT_SECRET);
    
    // Get user from database
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(payload.id).all();
    
    if (results.length === 0) {
      return c.json({
        success: false,
        error: 'User not found',
      }, 401);
    }

    const user = results[0];
    
    // Add user to context
    c.set('user', {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      accountType: user.accountType,
      subscriptionTier: user.subscriptionTier,
    });
    
    // Continue to route handler
    await next();
  } catch (error) {
    console.error('Auth error:', error);
    return c.json({
      success: false,
      error: 'Invalid token',
    }, 401);
  }
}

/**
 * Middleware to check if user has admin permissions
 */
export async function adminAuthMiddleware(c: Context<AuthContext>, next: Next) {
  const user = c.get('user');
  
  if (!user) {
    return c.json({
      success: false,
      error: 'Unauthorized - Authentication required',
    }, 401);
  }
  
  if (user.role !== 'admin') {
    return c.json({
      success: false,
      error: 'Forbidden - Admin privileges required',
    }, 403);
  }
  
  await next();
} 