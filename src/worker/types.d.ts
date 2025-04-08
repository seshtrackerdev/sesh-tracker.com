// Worker environment definition
interface Env {
  // D1 database
  DB: D1Database;
  // KV namespace for caching
  DASHBOARD_CACHE: KVNamespace;
  // Environment variables
  AUTH_API_URL: string;
  API_ENV: string;
  API_TOKEN: string;
}

// Authentication user information
interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
  accountType: 'test' | 'demo' | 'user' | 'admin';
  subscriptionTier: string;
  preferences?: Record<string, any>;
}

// Standard API response format
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  timestamp: string;
}

// Dashboard data structure
interface DashboardData {
  id: string;
  userId: string;
  name: string;
  version: number;
  isDefault: boolean;
  layoutData: string; // JSON stringified layout
  createdAt: string;
  updatedAt: string;
}

// Widget data structure
interface WidgetData {
  id: string;
  dashboardId: string;
  widgetTypeId: string;
  props: string; // JSON stringified props
  showTitle: boolean;
  createdAt: string;
  updatedAt: string;
}

// Session data structure for tracking user sessions
interface SessionData {
  id: string;
  userId: string;
  timestamp: string;
  strain?: string;
  method?: string;
  duration?: number;
  effects?: string[];
  notes?: string;
  rating?: number;
}

// Inventory item structure
interface InventoryItem {
  id: string;
  userId: string;
  name: string;
  type: string;
  strain?: string;
  amount: number;
  unit: string;
  acquired: string;
  expires?: string;
  cost?: number;
  notes?: string;
  thcContent?: number;
  cbdContent?: number;
}

// Mood tracking data structure
interface MoodEntry {
  id: string;
  userId: string;
  timestamp: string;
  mood: number; // Scale from 1-10
  activities: string[]; // Array of activities done
  factors: string[]; // Factors that may have influenced mood
  notes?: string;
  associatedSession?: string; // Optional reference to a session
  createdAt: string;
  updatedAt: string;
}

// Medical symptom tracking structure
interface MedicalSymptom {
  id: string;
  userId: string;
  timestamp: string;
  symptomType: string; // Type of symptom (pain, nausea, etc)
  severity: number; // Scale from 1-10
  duration: number; // Duration in minutes
  bodyLocation?: string; // Where on body if applicable
  treatments: string[]; // What was used to treat
  effectivenessRating?: number; // How effective was treatment
  notes?: string;
  associatedSession?: string; // Optional reference to a session
  createdAt: string;
  updatedAt: string;
}

// Journal entry structure
interface JournalEntry {
  id: string;
  userId: string;
  timestamp: string;
  title: string;
  content: string;
  tags: string[];
  mood?: number;
  associatedSession?: string; // Optional reference to a session
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
} 