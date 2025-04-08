import { Hono } from "hono";
import { cors } from 'hono/cors';
import { authMiddleware, productionAuth } from "./middleware/auth";
import handleLegacyRoutes from "./middleware/legacy-redirects";
import dashboardRoutes from "./routes/dashboardRoutes";
import moodRoutes from "./routes/mood";
import medicalSymptomRoutes from "./routes/medical-symptoms";
import journalRoutes from "./routes/journal";
import authRoutes from "./routes/auth";

// Create a direct context type definition that mirrors our database bindings
type AppContext = {
  Bindings: {
    API_ENV: string;
    DB: D1Database;
    SESHDBPROD: D1Database;
    DASHBOARD_CACHE: KVNamespace;
    AUTH_API_URL: string;
    API_TOKEN: string;
    JWT_SECRET: string;
  };
  Variables: {
    user: {
      id: string;
      email: string;
      displayName: string;
      role: string;
      accountType: string;
      subscriptionTier: string;
      preferences?: Record<string, any>;
    };
    isDemoAccount?: boolean;
    requestSource?: string;
    jwtPayload?: any;
  };
};

// Create the main app
const app = new Hono<AppContext>();

// Apply CORS middleware
app.use('*', cors({
  origin: [
    'https://sesh-tracker.com',
    'https://my-cannabis-tracker.com',
    // All supported development ports
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:3005',
    'http://localhost:3006',
    'http://localhost:3007',
    'http://localhost:3008',
    'http://localhost:3009',
    'http://localhost:3010',
    'http://localhost:4000',
    'http://localhost:4001',
    'http://localhost:4002',
    'http://localhost:4003',
    'http://localhost:4004',
    'http://localhost:4005',
    'http://localhost:4006',
    'http://localhost:4007',
    'http://localhost:4008',
    'http://localhost:4009',
    'http://localhost:4010',
    'http://localhost:5173',
    'http://localhost:8787'
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Session-Token'],
  credentials: true,
}));

// Apply legacy route handler
app.use('*', handleLegacyRoutes);

// Health check endpoint
app.get("/api/health", (c) => c.json({ 
  success: true,
  status: "ok",
  env: c.env.API_ENV,
  timestamp: new Date().toISOString()
}));

// Mount auth routes (no auth required)
app.route('/api/auth', authRoutes);

// Create a sub-app for protected routes
const protectedApp = new Hono<AppContext>();

// Apply auth middleware to all protected routes
protectedApp.use('*', productionAuth);

// Mount protected routes
protectedApp.route('/dashboards', dashboardRoutes);
protectedApp.route('/mood', moodRoutes);
protectedApp.route('/medical-symptoms', medicalSymptomRoutes);
protectedApp.route('/journal', journalRoutes);

// Mount protected routes to main app
app.route('/api', protectedApp);

// Handle 404 errors
app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Not Found',
  }, 404);
});

// Handle all errors
app.onError((err, c) => {
  console.error(`Error in ${c.req.method} ${c.req.url}:`, err);
  return c.json({
    success: false,
    error: 'Internal Server Error',
  }, 500);
});

export default app;
