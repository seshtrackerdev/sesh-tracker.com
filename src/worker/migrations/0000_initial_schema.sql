-- Initial schema for Sesh-Tracker D1 database
-- This migration creates the core tables needed for the application

-- Create users table to mirror Kush.Observer user data
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  displayName TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  accountType TEXT NOT NULL DEFAULT 'user',
  subscriptionTier TEXT NOT NULL DEFAULT 'basic',
  lastActive TEXT, -- ISO timestamp
  preferences TEXT, -- JSON stringified preferences
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- Create dashboards table
CREATE TABLE IF NOT EXISTS dashboards (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  name TEXT NOT NULL,
  layoutData TEXT NOT NULL, -- JSON stringified layout
  isDefault BOOLEAN NOT NULL DEFAULT 0,
  version INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Create widgets table
CREATE TABLE IF NOT EXISTS widgets (
  id TEXT PRIMARY KEY,
  dashboardId TEXT NOT NULL,
  widgetTypeId TEXT NOT NULL,
  props TEXT NOT NULL, -- JSON stringified props
  showTitle BOOLEAN NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (dashboardId) REFERENCES dashboards(id) ON DELETE CASCADE
);

-- Create sessions table for tracking user consumption sessions
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  timestamp TEXT NOT NULL, -- ISO timestamp
  strain TEXT,
  method TEXT,
  duration INTEGER, -- in minutes
  effects TEXT, -- JSON stringified array
  notes TEXT,
  rating INTEGER, -- 1-5 scale
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  strain TEXT,
  amount REAL NOT NULL,
  unit TEXT NOT NULL,
  acquired TEXT NOT NULL, -- ISO timestamp
  expires TEXT, -- ISO timestamp
  cost REAL,
  notes TEXT,
  thcContent REAL,
  cbdContent REAL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indices for performance
CREATE INDEX IF NOT EXISTS idx_dashboards_userId ON dashboards(userId);
CREATE INDEX IF NOT EXISTS idx_widgets_dashboardId ON widgets(dashboardId);
CREATE INDEX IF NOT EXISTS idx_sessions_userId ON sessions(userId);
CREATE INDEX IF NOT EXISTS idx_inventory_userId ON inventory(userId);
CREATE INDEX IF NOT EXISTS idx_inventory_expires ON inventory(expires);

-- Insert demo user for development
INSERT OR IGNORE INTO users (
  id, email, displayName, role, accountType, subscriptionTier, createdAt, updatedAt
) VALUES (
  'demo-user-id', 
  'demouser1@email.com', 
  'Demo User',
  'user',
  'demo',
  'premium',
  DATETIME('now'),
  DATETIME('now')
);

-- Insert test user for development
INSERT OR IGNORE INTO users (
  id, email, displayName, role, accountType, subscriptionTier, createdAt, updatedAt
) VALUES (
  'test-user-id', 
  'tester@email.com', 
  'Test User',
  'user',
  'test',
  'premium',
  DATETIME('now'),
  DATETIME('now')
); 