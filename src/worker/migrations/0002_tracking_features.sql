-- Migration to create tables for mood tracking, medical symptoms, and journal entries
-- This migration enhances the tracking features of Sesh-Tracker

-- Create mood entries table if it doesn't exist yet
CREATE TABLE IF NOT EXISTS moodEntries (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  mood INTEGER NOT NULL, -- Scale from 1-10
  activities TEXT NOT NULL, -- JSON array of activities done
  factors TEXT NOT NULL, -- JSON array of factors that may have influenced mood
  notes TEXT,
  associatedSession TEXT, -- Optional reference to a session
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (associatedSession) REFERENCES sessions(id) ON DELETE SET NULL
);

-- Create medical symptoms table if it doesn't exist yet
CREATE TABLE IF NOT EXISTS medicalSymptoms (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  symptomType TEXT NOT NULL, -- Type of symptom (pain, nausea, etc)
  severity INTEGER NOT NULL, -- Scale from 1-10
  duration INTEGER NOT NULL, -- Duration in minutes
  bodyLocation TEXT, -- Where on body if applicable
  treatments TEXT NOT NULL, -- JSON array of treatments used
  effectivenessRating INTEGER, -- How effective was treatment (1-10)
  notes TEXT,
  associatedSession TEXT, -- Optional reference to a session
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (associatedSession) REFERENCES sessions(id) ON DELETE SET NULL
);

-- Create journal entries table if it doesn't exist yet (or update if schema differs)
CREATE TABLE IF NOT EXISTS journalEntries (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT NOT NULL, -- JSON array of tags
  mood INTEGER, -- Optional mood rating (1-10)
  associatedSession TEXT, -- Optional reference to a session
  isPrivate BOOLEAN NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (associatedSession) REFERENCES sessions(id) ON DELETE SET NULL
);

-- Create indices for better query performance
CREATE INDEX IF NOT EXISTS idx_moodEntries_userId ON moodEntries(userId);
CREATE INDEX IF NOT EXISTS idx_moodEntries_timestamp ON moodEntries(timestamp);
CREATE INDEX IF NOT EXISTS idx_moodEntries_associatedSession ON moodEntries(associatedSession);

CREATE INDEX IF NOT EXISTS idx_medicalSymptoms_userId ON medicalSymptoms(userId);
CREATE INDEX IF NOT EXISTS idx_medicalSymptoms_timestamp ON medicalSymptoms(timestamp);
CREATE INDEX IF NOT EXISTS idx_medicalSymptoms_symptomType ON medicalSymptoms(symptomType);
CREATE INDEX IF NOT EXISTS idx_medicalSymptoms_associatedSession ON medicalSymptoms(associatedSession);

CREATE INDEX IF NOT EXISTS idx_journalEntries_userId ON journalEntries(userId);
CREATE INDEX IF NOT EXISTS idx_journalEntries_timestamp ON journalEntries(timestamp);
CREATE INDEX IF NOT EXISTS idx_journalEntries_associatedSession ON journalEntries(associatedSession); 