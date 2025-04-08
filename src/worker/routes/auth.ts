import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { sign, verify } from 'hono/jwt';
import { AppContext } from '../types';

const app = new Hono<{
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
}>();

// Session management functions
async function createSession(userId: string, db: D1Database): Promise<string> {
  const token = crypto.randomUUID();
  const expiresAt = Math.floor(Date.now() / 1000) + 604800; // 7 days
  
  await db.prepare(`
    INSERT INTO sessions (token, user_id, expires_at, created_at)
    VALUES (?, ?, ?, ?)
  `).bind(token, userId, expiresAt, Math.floor(Date.now() / 1000)).run();
  
  return token;
}

// Password hashing functions
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashedPassword = await hashPassword(password);
  return hashedPassword === hash;
}

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2),
});

// Login endpoint
app.post('/login', zValidator('json', loginSchema), async (c) => {
  try {
    const { email, password } = c.req.valid('json');
    
    // Get user from database
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(email).all();
    
    if (results.length === 0) {
      return c.json({
        success: false,
        error: 'Invalid email or password',
      }, 401);
    }

    const user = results[0] as {
      id: string;
      email: string;
      displayName: string;
      role: string;
      accountType: string;
      subscriptionTier: string;
      passwordHash: string;
    };
    
    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return c.json({
        success: false,
        error: 'Invalid email or password',
      }, 401);
    }

    // Create user in SESHDBPROD if they don't exist (for migration)
    const existingUser = await c.env.SESHDBPROD.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first();
    
    let userId = user.id;
    
    if (!existingUser) {
      // Migrate user to new database
      await c.env.SESHDBPROD.prepare(`
        INSERT INTO users (
          id, email, display_name, role, 
          account_type, subscription_tier, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        userId,
        email,
        user.displayName,
        user.role,
        user.accountType,
        user.subscriptionTier,
        Math.floor(Date.now() / 1000)
      ).run();
    }
    
    // Create session
    const sessionToken = await createSession(userId, c.env.SESHDBPROD);

    // Generate JWT token for backward compatibility
    const token = await sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      c.env.JWT_SECRET,
      'HS256'
    );

    // Return user data and tokens
    return c.json({
      success: true,
      token, // Legacy JWT token
      sessionToken, // New session token
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        accountType: user.accountType,
        subscriptionTier: user.subscriptionTier,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({
      success: false,
      error: 'Internal server error',
    }, 500);
  }
});

// Register endpoint
app.post('/register', zValidator('json', registerSchema), async (c) => {
  try {
    const { email, password, displayName } = c.req.valid('json');
    
    // Check if user already exists
    const { results } = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).all();
    
    if (results.length > 0) {
      return c.json({
        success: false,
        error: 'Email already registered',
      }, 400);
    }

    // Hash password
    const passwordHash = await hashPassword(password);
    
    // Generate user ID
    const userId = crypto.randomUUID();
    
    // Insert new user
    await c.env.DB.prepare(`
      INSERT INTO users (
        id, email, passwordHash, displayName, role, 
        accountType, subscriptionTier, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      userId,
      email,
      passwordHash,
      displayName,
      'user',
      'standard',
      'basic'
    ).run();

    // Generate JWT token
    const token = await sign(
      {
        id: userId,
        email,
        role: 'user',
      },
      c.env.JWT_SECRET,
      'HS256'
    );

    // Return user data and token
    return c.json({
      success: true,
      token,
      user: {
        id: userId,
        email,
        displayName,
        role: 'user',
        accountType: 'standard',
        subscriptionTier: 'basic',
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return c.json({
      success: false,
      error: 'Internal server error',
    }, 500);
  }
});

// Verify token endpoint
app.post('/verify', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const sessionToken = c.req.header('X-Session-Token');
    
    if (!authHeader && !sessionToken) {
      return c.json({
        success: false,
        error: 'Missing authentication token',
      }, 401);
    }
    
    let user;
    
    // Try session token first (new system)
    if (sessionToken) {
      user = await c.env.SESHDBPROD.prepare(`
        SELECT users.* FROM sessions
        JOIN users ON sessions.user_id = users.id
        WHERE sessions.token = ?
        AND sessions.expires_at > ?
      `).bind(sessionToken, Math.floor(Date.now() / 1000)).first();
      
      if (user) {
        return c.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            displayName: user.display_name,
            role: user.role,
            accountType: user.account_type,
            subscriptionTier: user.subscription_tier,
          },
        });
      }
    }
    
    // Fall back to JWT token (legacy system)
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
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

      user = results[0] as {
        id: string;
        email: string;
        displayName: string;
        role: string;
        accountType: string;
        subscriptionTier: string;
      };
      
      // Create a session for this user in the new system
      const newSessionToken = await createSession(user.id, c.env.SESHDBPROD);
      
      return c.json({
        success: true,
        sessionToken: newSessionToken, // Provide the new token
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          accountType: user.accountType,
          subscriptionTier: user.subscriptionTier,
        },
      });
    }
    
    return c.json({
      success: false,
      error: 'Invalid token',
    }, 401);
  } catch (error) {
    console.error('Token verification error:', error);
    return c.json({
      success: false,
      error: 'Invalid token',
    }, 401);
  }
});

export default app; 