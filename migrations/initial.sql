CREATE TABLE IF NOT EXISTS moodEntries (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  mood TEXT NOT NULL,
  intensity INTEGER NOT NULL,
  note TEXT,
  tags TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS medicalSymptoms (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  symptom TEXT NOT NULL, 
  severity INTEGER NOT NULL,
  bodyLocation TEXT,
  note TEXT,
  duration INTEGER,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS journalEntries (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
); 