/**
 * Common user type definitions for the application
 */

/**
 * Authenticated user information
 */
export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
  accountType: 'test' | 'demo' | 'user' | 'admin';
  subscriptionTier: string;
  preferences?: Record<string, any>;
}

/**
 * User create/update payload
 */
export interface UserPayload {
  email: string;
  displayName?: string;
  role?: string;
  accountType?: 'test' | 'demo' | 'user' | 'admin';
  subscriptionTier?: string;
  passwordHash?: string;
}

/**
 * User login credentials
 */
export interface UserCredentials {
  email: string;
  password: string;
}

/**
 * User session information
 */
export interface UserSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: number;
  createdAt: number;
}