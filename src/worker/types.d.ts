// Worker environment definition
interface Env {
  // D1 database 
  DB: D1Database;
  // Specific database UUID binding
  SESHDBPROD: D1Database; // fbaabd30-99b3-441b-83a1-597266937deb
  // KV namespace for caching
  DASHBOARD_CACHE: KVNamespace; // 991a5d7a3fd14dbfbd0ecccc6bf8d730
  // Environment variables
  AUTH_API_URL: string;
  API_ENV: string;
  API_TOKEN: string;
  JWT_SECRET: string;
}

// Import AuthUser from shared types
/// <reference path="./types/user.ts" />
