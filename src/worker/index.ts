import { Hono } from "hono";
import { cors } from 'hono/cors';
import { authMiddleware, mockAuthMiddleware } from "./middleware/auth";
import dashboardRoutes from "./routes/dashboards";
import moodRoutes from "./routes/mood";
import medicalSymptomRoutes from "./routes/medical-symptoms";
import journalRoutes from "./routes/journal";

// Define the AppContext type to match middleware requirements
type AppContext = {
  Bindings: Env;
  Variables: {
    user: AuthUser;
    isDemoAccount?: boolean;
    requestSource?: string;
    isMockAuth?: boolean;
  };
};

// Define the app with environment bindings
const app = new Hono<{ Bindings: Env }>();

// Apply global middleware
app.use('*', cors({
  origin: (origin) => {
    const allowedOrigins = [
      'https://sesh-tracker.com', 
      'https://kush.observer', 
      'https://my-cannabis-tracker.com'
    ];
    
    // Check for subdomains and localhost
    if (origin && (
      origin.endsWith('.sesh-tracker.com') || 
      origin.endsWith('.kush.observer') ||
      origin.endsWith('.my-cannabis-tracker.com') ||
      origin.match(/^https?:\/\/localhost:[0-9]+$/) ||
      origin.match(/^http:\/\/127\.0\.0\.1:[0-9]+$/)
    )) {
      return origin;
    }
    
    return allowedOrigins.includes(origin) ? origin : null;
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Mock-User-Type'],
  exposeHeaders: ['Content-Length'],
  maxAge: 86400,
  credentials: true,
}));

// Basic health check
app.get("/api/", (c) => c.json({ 
  name: "Sesh-Tracker API",
  status: "healthy",
  timestamp: new Date().toISOString()
}));

// Add a direct health check endpoint
app.get("/api/health", (c) => c.json({ 
  success: true,
  status: "ok",
  version: "1.0.0",
  env: c.env.API_ENV || "unknown",
  timestamp: new Date().toISOString()
}));

// User profile endpoint
app.get('/api/user/profile', async (c) => {
  try {
    const mockUser = {
      id: 'mock-user-123',
      displayName: 'Test User',
      email: 'test@example.com',
      role: 'user',
      accountType: 'test',
      subscriptionTier: 'basic'
    };
    
    return c.json({
      success: true,
      user: mockUser
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch user profile',
      code: 'PROFILE_FETCH_ERROR'
    }, 500);
  }
});

// Create a sub-app for API v1
const v1 = new Hono<{ Bindings: Env }>();

// Health check endpoint
v1.get('/health', (c) => c.json({ 
  status: 'ok', 
  env: c.env.API_ENV,
  timestamp: new Date().toISOString() 
}));

// Dashboard routes with context type that matches auth middleware
const dashboardApp = new Hono<AppContext>();
const moodApp = new Hono<AppContext>();
const medicalSymptomApp = new Hono<AppContext>();
const journalApp = new Hono<AppContext>();

// Use type assertion to help TypeScript understand the context conversion
// This is necessary because the middleware expects AppContext but Hono provides a different context
const applyAuthMiddleware = async (c: any, next: any) => {
  // Check for mock user header first - this takes precedence
  const hasMockHeader = c.req.header('X-Mock-User-Type') !== null;
  
  if (hasMockHeader) {
    console.log('Using mock authentication due to X-Mock-User-Type header');
    // Cast the context to the type expected by mockAuthMiddleware
    return mockAuthMiddleware(c as any, next);
  }
  
  // Check for development mode using environment bindings  
  const isDevMode = c.env.API_ENV === 'development';
  
  // Log development status to help troubleshoot
  console.log(`Auth environment: ${isDevMode ? 'development' : 'production'}`);
  
  if (isDevMode) {
    // Try real auth but with fallback to mock
    try {
      return await authMiddleware(c as any, next);
    } catch (err) {
      console.warn('Auth middleware failed, falling back to mock auth:', err);
      return mockAuthMiddleware(c as any, next);
    }
  } else {
    // Cast the context to the type expected by authMiddleware
    return authMiddleware(c as any, next);
  }
};

// Apply auth middleware to the dashboard routes
dashboardApp.use('*', applyAuthMiddleware);

// Apply auth middleware to wellness feature routes
moodApp.use('*', applyAuthMiddleware);
medicalSymptomApp.use('*', applyAuthMiddleware);
journalApp.use('*', applyAuthMiddleware);

// Mount the dashboard routes to the v1 API
dashboardApp.route('/', dashboardRoutes);
v1.route('/dashboards', dashboardApp);

// Mount the mood tracking routes to the v1 API
moodApp.route('/', moodRoutes);
v1.route('/mood', moodApp);

// Mount the medical symptoms routes to the v1 API
medicalSymptomApp.route('/', medicalSymptomRoutes);
v1.route('/medical-symptoms', medicalSymptomApp);

// Mount the journal entries routes to the v1 API
journalApp.route('/', journalRoutes);
v1.route('/journal', journalApp);

// Mount v1 API to main app
app.route('/api/v1', v1);

// Add direct routes to make testing easier
app.route('/api/mood', moodApp);
app.route('/api/medical-symptom', medicalSymptomApp);
app.route('/api/journal', journalApp);

// Handle 404 errors
app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Not Found',
    code: 'RESOURCE_NOT_FOUND',
    timestamp: new Date().toISOString(),
  }, 404);
});

// Handle all errors
app.onError((err, c) => {
  console.error(`Error in ${c.req.method} ${c.req.url}:`, err);
  
  return c.json({
    success: false,
    error: 'Internal Server Error',
    code: 'INTERNAL_SERVER_ERROR',
    timestamp: new Date().toISOString(),
    message: c.env.API_ENV === 'development' ? err.message : undefined
  }, 500);
});

// If deploying to Cloudflare Workers, export the app
export default app;
