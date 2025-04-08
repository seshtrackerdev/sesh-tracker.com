// Define the shared AppContext type for Hono
import { Context } from 'hono';

// Define bindings available in c.env
export type Bindings = {
  API_ENV: string;
  DB: D1Database; // Main D1 database binding
  SESHDBPROD: D1Database; // fbaabd30-99b3-441b-83a1-597266937deb
  DASHBOARD_CACHE: KVNamespace; // 991a5d7a3fd14dbfbd0ecccc6bf8d730
  // Add other bindings
  AUTH_API_URL: string;
  API_TOKEN: string;
  JWT_SECRET: string;
};

// Define the AuthUser type for authenticated users
export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
  accountType: string;
  subscriptionTier: string;
  preferences?: Record<string, any>;
}

// Define variables available in c.var
export type Variables = {
  user: AuthUser;
  isDemoAccount?: boolean;
  requestSource?: string;
  jwtPayload?: any; // For JWT payload
};

// Define the AppContext type that was missing
export type AppContext = Context<{
  Bindings: Bindings;
  Variables: Variables;
}>;

// Re-export types from user.ts
export * from './types/user';