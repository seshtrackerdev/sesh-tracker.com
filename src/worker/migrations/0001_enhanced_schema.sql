-- Enhanced schema for Sesh-Tracker D1 database
-- This migration adds additional tables and fields for comprehensive data collection

-- Enhance users table with additional fields
ALTER TABLE users ADD COLUMN timezone TEXT;
ALTER TABLE users ADD COLUMN profileImageUrl TEXT;
ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active'; -- active, suspended, deleted

-- User profile data (separate from authentication)
CREATE TABLE IF NOT EXISTS user_profiles (
  userId TEXT PRIMARY KEY,
  biography TEXT,
  location TEXT,
  dateOfBirth TEXT,
  medicalPatient BOOLEAN DEFAULT 0,
  experienceLevel TEXT, -- novice, intermediate, experienced
  primaryGoals TEXT, -- JSON array of goals
  privacySettings TEXT, -- JSON object
  socialLinks TEXT, -- JSON object
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Device information for cross-device experiences
CREATE TABLE IF NOT EXISTS user_devices (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  deviceType TEXT NOT NULL, -- mobile, tablet, desktop
  deviceId TEXT NOT NULL,
  platform TEXT NOT NULL, -- ios, android, web
  lastActive TEXT,
  notificationToken TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Enhance sessions table with additional tracking fields
ALTER TABLE sessions ADD COLUMN location TEXT; -- Optional location data
ALTER TABLE sessions ADD COLUMN weather TEXT; -- Conditions during session
ALTER TABLE sessions ADD COLUMN activityBefore TEXT;
ALTER TABLE sessions ADD COLUMN activityDuring TEXT;
ALTER TABLE sessions ADD COLUMN activityAfter TEXT;
ALTER TABLE sessions ADD COLUMN accompaniedBy TEXT; -- Solo or social
ALTER TABLE sessions ADD COLUMN mediaUrls TEXT; -- JSON array of photos/videos
ALTER TABLE sessions ADD COLUMN sessionGoals TEXT; -- JSON array
ALTER TABLE sessions ADD COLUMN sessionOutcomes TEXT; -- JSON array
ALTER TABLE sessions ADD COLUMN deviceId TEXT; -- Which device recorded this

-- Mood tracking before/after sessions
CREATE TABLE IF NOT EXISTS session_moods (
  id TEXT PRIMARY KEY,
  sessionId TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  moodRating INTEGER NOT NULL, -- 1-10 scale
  moodDescription TEXT,
  energyLevel INTEGER, -- 1-10 scale
  relationType TEXT NOT NULL, -- before, during, after
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (sessionId) REFERENCES sessions(id) ON DELETE CASCADE
);

-- Medical symptoms tracking 
CREATE TABLE IF NOT EXISTS medical_symptoms (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  sessionId TEXT,
  symptom TEXT NOT NULL,
  severity INTEGER NOT NULL, -- 1-10 scale
  beforeOrAfter TEXT NOT NULL, -- before, after
  notes TEXT,
  timestamp TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (sessionId) REFERENCES sessions(id) ON DELETE SET NULL
);

-- Enhance inventory table with additional fields
ALTER TABLE inventory ADD COLUMN batchNumber TEXT;
ALTER TABLE inventory ADD COLUMN dispensaryId TEXT;
ALTER TABLE inventory ADD COLUMN brandId TEXT;
ALTER TABLE inventory ADD COLUMN imageUrls TEXT; -- JSON array
ALTER TABLE inventory ADD COLUMN labResults TEXT; -- JSON object with extended cannabinoid/terpene profiles
ALTER TABLE inventory ADD COLUMN storageLocation TEXT;
ALTER TABLE inventory ADD COLUMN purchasePrice REAL;
ALTER TABLE inventory ADD COLUMN rating INTEGER; -- User rating 1-5

-- Store detailed product info
CREATE TABLE IF NOT EXISTS product_catalog (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  strain TEXT,
  brand TEXT,
  description TEXT,
  imageUrls TEXT, -- JSON array
  averageRating REAL,
  reviewCount INTEGER DEFAULT 0,
  cannabinoidProfile TEXT, -- JSON object
  terpeneProfile TEXT, -- JSON object
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- Track dispensaries
CREATE TABLE IF NOT EXISTS dispensaries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zipCode TEXT,
  location TEXT, -- Lat/long as JSON
  website TEXT,
  phoneNumber TEXT,
  operatingHours TEXT, -- JSON object
  amenities TEXT, -- JSON array
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- Reference data for strains
CREATE TABLE IF NOT EXISTS strains (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL, -- indica, sativa, hybrid
  thcRange TEXT, -- e.g. "18-24%"
  cbdRange TEXT,
  effects TEXT, -- JSON array
  flavors TEXT, -- JSON array
  description TEXT,
  imageUrl TEXT,
  breeder TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- User-defined reports
CREATE TABLE IF NOT EXISTS saved_reports (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  reportType TEXT NOT NULL,
  parameters TEXT NOT NULL, -- JSON object with report criteria
  filterSettings TEXT, -- JSON object
  visualizationSettings TEXT, -- JSON object
  isPublic BOOLEAN DEFAULT 0,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Aggregated metrics table for faster analytics (updated by background processes)
CREATE TABLE IF NOT EXISTS user_metrics (
  userId TEXT NOT NULL,
  metricDate TEXT NOT NULL, -- YYYY-MM-DD format
  sessionCount INTEGER DEFAULT 0,
  totalConsumptionGrams REAL DEFAULT 0,
  averageRating REAL,
  dominantStrainType TEXT,
  dominantConsumptionMethod TEXT,
  metadata TEXT, -- Additional JSON data
  updatedAt TEXT NOT NULL,
  PRIMARY KEY (userId, metricDate),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Journal entries
CREATE TABLE IF NOT EXISTS journal_entries (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  mood TEXT,
  tags TEXT, -- JSON array
  sessionId TEXT, -- Optional associated session
  isPublic BOOLEAN DEFAULT 0,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (sessionId) REFERENCES sessions(id) ON DELETE SET NULL
);

-- User connections
CREATE TABLE IF NOT EXISTS user_connections (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  connectedUserId TEXT NOT NULL,
  status TEXT NOT NULL, -- pending, accepted, blocked
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (connectedUserId) REFERENCES users(id) ON DELETE CASCADE
);

-- Content sharing 
CREATE TABLE IF NOT EXISTS shared_content (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  contentType TEXT NOT NULL, -- session, journal, report, etc.
  contentId TEXT NOT NULL, -- ID of the content being shared
  shareSettings TEXT NOT NULL, -- JSON with permissions
  shareUrl TEXT, -- Generated unique URL
  expiresAt TEXT, -- Optional expiration
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Goals tracking
CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  goalType TEXT NOT NULL, -- consumption, medical, tolerance, etc.
  targetValue REAL,
  currentValue REAL DEFAULT 0,
  startDate TEXT NOT NULL,
  endDate TEXT,
  status TEXT DEFAULT 'active', -- active, completed, abandoned
  reminderSettings TEXT, -- JSON object
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Add indices for new tables
CREATE INDEX IF NOT EXISTS idx_user_profiles_userId ON user_profiles(userId);
CREATE INDEX IF NOT EXISTS idx_user_devices_userId ON user_devices(userId);
CREATE INDEX IF NOT EXISTS idx_session_moods_sessionId ON session_moods(sessionId);
CREATE INDEX IF NOT EXISTS idx_medical_symptoms_userId ON medical_symptoms(userId);
CREATE INDEX IF NOT EXISTS idx_medical_symptoms_sessionId ON medical_symptoms(sessionId);
CREATE INDEX IF NOT EXISTS idx_strains_name ON strains(name);
CREATE INDEX IF NOT EXISTS idx_saved_reports_userId ON saved_reports(userId);
CREATE INDEX IF NOT EXISTS idx_user_metrics_userId ON user_metrics(userId);
CREATE INDEX IF NOT EXISTS idx_journal_entries_userId ON journal_entries(userId);
CREATE INDEX IF NOT EXISTS idx_user_connections_userId ON user_connections(userId);
CREATE INDEX IF NOT EXISTS idx_user_connections_connectedUserId ON user_connections(connectedUserId);
CREATE INDEX IF NOT EXISTS idx_shared_content_userId ON shared_content(userId);
CREATE INDEX IF NOT EXISTS idx_goals_userId ON goals(userId);

-- Add timestamp-based indices for time-series queries
CREATE INDEX IF NOT EXISTS idx_sessions_timestamp ON sessions(timestamp);
CREATE INDEX IF NOT EXISTS idx_inventory_acquired ON inventory(acquired);
CREATE INDEX IF NOT EXISTS idx_journal_entries_createdAt ON journal_entries(createdAt);
CREATE INDEX IF NOT EXISTS idx_user_metrics_metricDate ON user_metrics(metricDate); 