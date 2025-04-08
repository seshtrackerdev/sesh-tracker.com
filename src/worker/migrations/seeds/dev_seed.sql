-- Development Seed Data for Sesh-Tracker
-- This file populates the development database with sample data for testing

-- Sample Data: Users
-- Note: These should already exist from 0000_initial_schema.sql
-- But we'll include them here as INSERT OR IGNORE just in case
INSERT OR IGNORE INTO users (
  id, email, displayName, role, accountType, subscriptionTier, timezone, status, createdAt, updatedAt
) VALUES (
  'demo-user-id', 
  'demouser1@email.com', 
  'Demo User',
  'user',
  'demo',
  'premium',
  'America/New_York',
  'active',
  '2023-01-01T00:00:00Z',
  '2023-01-01T00:00:00Z'
);

INSERT OR IGNORE INTO users (
  id, email, displayName, role, accountType, subscriptionTier, timezone, status, createdAt, updatedAt
) VALUES (
  'test-user-id', 
  'tester@email.com', 
  'Test User',
  'user',
  'test',
  'premium',
  'America/Los_Angeles',
  'active',
  '2023-01-01T00:00:00Z',
  '2023-01-01T00:00:00Z'
);

INSERT OR IGNORE INTO users (
  id, email, displayName, role, accountType, subscriptionTier, timezone, status, createdAt, updatedAt
) VALUES (
  'admin-user-id', 
  'admin@email.com', 
  'Admin User',
  'admin',
  'admin',
  'admin',
  'America/Chicago',
  'active',
  '2023-01-01T00:00:00Z',
  '2023-01-01T00:00:00Z'
);

-- Sample Data: User Profiles
INSERT OR IGNORE INTO user_profiles (
  userId, biography, location, dateOfBirth, medicalPatient, experienceLevel, primaryGoals, createdAt, updatedAt
) VALUES (
  'demo-user-id',
  'Cannabis enthusiast exploring different strains and consumption methods.',
  'New York, NY',
  '1985-06-15',
  1,
  'intermediate',
  '["Manage stress", "Improve sleep", "Track consumption"]',
  '2023-01-01T00:00:00Z',
  '2023-01-01T00:00:00Z'
);

INSERT OR IGNORE INTO user_profiles (
  userId, biography, location, dateOfBirth, medicalPatient, experienceLevel, primaryGoals, createdAt, updatedAt
) VALUES (
  'test-user-id',
  'Testing various cannabis strains for medical benefits.',
  'Los Angeles, CA',
  '1990-03-22',
  1,
  'experienced',
  '["Pain management", "Reduce anxiety", "Document effects"]',
  '2023-01-01T00:00:00Z',
  '2023-01-01T00:00:00Z'
);

-- Sample Data: Strains
INSERT OR IGNORE INTO strains (
  id, name, type, thcRange, cbdRange, effects, flavors, description, imageUrl, breeder, createdAt, updatedAt
) VALUES (
  'strain-1',
  'Blue Dream',
  'hybrid',
  '18-24%',
  '0.1-0.2%',
  '["Happy", "Relaxed", "Euphoric", "Creative", "Uplifted"]',
  '["Berry", "Sweet", "Blueberry"]',
  'Blue Dream is a sativa-dominant hybrid that balances full-body relaxation with gentle cerebral invigoration.',
  '/assets/strains/blue-dream.jpg',
  'DJ Short',
  '2023-01-01T00:00:00Z',
  '2023-01-01T00:00:00Z'
);

INSERT OR IGNORE INTO strains (
  id, name, type, thcRange, cbdRange, effects, flavors, description, imageUrl, breeder, createdAt, updatedAt
) VALUES (
  'strain-2',
  'OG Kush',
  'hybrid',
  '20-25%',
  '0.3%',
  '["Relaxed", "Happy", "Euphoric", "Uplifted", "Sleepy"]',
  '["Earthy", "Pine", "Woody"]',
  'OG Kush is a legendary strain with a unique terpene profile and strong effects.',
  '/assets/strains/og-kush.jpg',
  'Unknown',
  '2023-01-01T00:00:00Z',
  '2023-01-01T00:00:00Z'
);

INSERT OR IGNORE INTO strains (
  id, name, type, thcRange, cbdRange, effects, flavors, description, imageUrl, breeder, createdAt, updatedAt
) VALUES (
  'strain-3',
  'Granddaddy Purple',
  'indica',
  '17-23%',
  '0.1%',
  '["Relaxed", "Sleepy", "Happy", "Hungry", "Euphoric"]',
  '["Grape", "Berry", "Sweet"]',
  'Granddaddy Purple is a famous indica cross known for its deep purple buds and powerful effects.',
  '/assets/strains/granddaddy-purple.jpg',
  'Ken Estes',
  '2023-01-01T00:00:00Z',
  '2023-01-01T00:00:00Z'
);

INSERT OR IGNORE INTO strains (
  id, name, type, thcRange, cbdRange, effects, flavors, description, imageUrl, breeder, createdAt, updatedAt
) VALUES (
  'strain-4',
  'Sour Diesel',
  'sativa',
  '19-25%',
  '0.1-0.2%',
  '["Energetic", "Happy", "Uplifted", "Focused", "Creative"]',
  '["Diesel", "Pungent", "Earthy"]',
  'Sour Diesel is a fast-acting sativa with a stimulating, dreamy cerebral effect.',
  '/assets/strains/sour-diesel.jpg',
  'Unknown',
  '2023-01-01T00:00:00Z',
  '2023-01-01T00:00:00Z'
);

-- Sample Data: Dispensaries
INSERT OR IGNORE INTO dispensaries (
  id, name, address, city, state, zipCode, location, website, phoneNumber, createdAt, updatedAt
) VALUES (
  'dispensary-1',
  'Green Relief Dispensary',
  '123 Main St',
  'New York',
  'NY',
  '10001',
  '{"lat": 40.7128, "lng": -74.0060}',
  'https://example.com/greenrelief',
  '555-123-4567',
  '2023-01-01T00:00:00Z',
  '2023-01-01T00:00:00Z'
);

INSERT OR IGNORE INTO dispensaries (
  id, name, address, city, state, zipCode, location, website, phoneNumber, createdAt, updatedAt
) VALUES (
  'dispensary-2',
  'Wellness Cannabis Co.',
  '456 Oak Ave',
  'Los Angeles',
  'CA',
  '90001',
  '{"lat": 34.0522, "lng": -118.2437}',
  'https://example.com/wellnesscannabis',
  '555-987-6543',
  '2023-01-01T00:00:00Z',
  '2023-01-01T00:00:00Z'
);

-- Sample Data: Inventory for demo user
INSERT OR IGNORE INTO inventory (
  id, userId, name, type, strain, amount, unit, acquired, expires, cost, thcContent, cbdContent, dispensaryId, batchNumber, imageUrls, createdAt, updatedAt
) VALUES (
  'inventory-1',
  'demo-user-id',
  'Blue Dream',
  'flower',
  'Blue Dream',
  3.5,
  'g',
  '2023-04-15T14:30:00Z',
  '2023-10-15T14:30:00Z',
  45.00,
  22.4,
  0.1,
  'dispensary-1',
  'BD20230415',
  '["https://example.com/images/blue-dream-1.jpg"]',
  '2023-04-15T14:30:00Z',
  '2023-04-15T14:30:00Z'
);

INSERT OR IGNORE INTO inventory (
  id, userId, name, type, strain, amount, unit, acquired, expires, cost, thcContent, cbdContent, dispensaryId, batchNumber, imageUrls, createdAt, updatedAt
) VALUES (
  'inventory-2',
  'demo-user-id',
  'OG Kush Cartridge',
  'cartridge',
  'OG Kush',
  1.0,
  'g',
  '2023-04-20T10:15:00Z',
  '2023-10-20T10:15:00Z',
  55.00,
  85.5,
  0.3,
  'dispensary-1',
  'OGK20230420',
  '["https://example.com/images/og-kush-cart-1.jpg"]',
  '2023-04-20T10:15:00Z',
  '2023-04-20T10:15:00Z'
);

-- Sample Data: Inventory for test user
INSERT OR IGNORE INTO inventory (
  id, userId, name, type, strain, amount, unit, acquired, expires, cost, thcContent, cbdContent, dispensaryId, batchNumber, imageUrls, createdAt, updatedAt
) VALUES (
  'inventory-3',
  'test-user-id',
  'Granddaddy Purple',
  'flower',
  'Granddaddy Purple',
  7.0,
  'g',
  '2023-04-10T16:45:00Z',
  '2023-10-10T16:45:00Z',
  90.00,
  19.2,
  0.1,
  'dispensary-2',
  'GDP20230410',
  '["https://example.com/images/gdp-1.jpg"]',
  '2023-04-10T16:45:00Z',
  '2023-04-10T16:45:00Z'
);

INSERT OR IGNORE INTO inventory (
  id, userId, name, type, strain, amount, unit, acquired, expires, cost, thcContent, cbdContent, dispensaryId, batchNumber, imageUrls, createdAt, updatedAt
) VALUES (
  'inventory-4',
  'test-user-id',
  'Sour Diesel',
  'flower',
  'Sour Diesel',
  3.5,
  'g',
  '2023-04-18T11:30:00Z',
  '2023-10-18T11:30:00Z',
  50.00,
  24.5,
  0.1,
  'dispensary-2',
  'SD20230418',
  '["https://example.com/images/sour-diesel-1.jpg"]',
  '2023-04-18T11:30:00Z',
  '2023-04-18T11:30:00Z'
);

-- Sample Data: Sessions for demo user
INSERT OR IGNORE INTO sessions (
  id, userId, timestamp, strain, method, duration, effects, notes, rating, location, weather, accompaniedBy, createdAt, updatedAt
) VALUES (
  'session-1',
  'demo-user-id',
  '2023-04-20T20:00:00Z',
  'Blue Dream',
  'vaporizer',
  45,
  '["relaxed", "creative", "uplifted"]',
  'Great evening session, felt creative and wrote some music afterward.',
  5,
  'home',
  'clear',
  'solo',
  '2023-04-20T20:45:00Z',
  '2023-04-20T20:45:00Z'
);

INSERT OR IGNORE INTO sessions (
  id, userId, timestamp, strain, method, duration, effects, notes, rating, location, weather, accompaniedBy, createdAt, updatedAt
) VALUES (
  'session-2',
  'demo-user-id',
  '2023-04-22T21:15:00Z',
  'OG Kush',
  'cartridge',
  30,
  '["relaxed", "sleepy", "hungry"]',
  'Used before bed, helped with insomnia.',
  4,
  'home',
  'rainy',
  'solo',
  '2023-04-22T21:45:00Z',
  '2023-04-22T21:45:00Z'
);

-- Sample Data: Sessions for test user
INSERT OR IGNORE INTO sessions (
  id, userId, timestamp, strain, method, duration, effects, notes, rating, location, weather, accompaniedBy, createdAt, updatedAt
) VALUES (
  'session-3',
  'test-user-id',
  '2023-04-21T18:30:00Z',
  'Granddaddy Purple',
  'joint',
  60,
  '["relaxed", "happy", "sleepy"]',
  'Perfect for pain relief, felt much better afterward.',
  5,
  'home',
  'clear',
  'friends',
  '2023-04-21T19:30:00Z',
  '2023-04-21T19:30:00Z'
);

INSERT OR IGNORE INTO sessions (
  id, userId, timestamp, strain, method, duration, effects, notes, rating, location, weather, accompaniedBy, createdAt, updatedAt
) VALUES (
  'session-4',
  'test-user-id',
  '2023-04-23T14:00:00Z',
  'Sour Diesel',
  'bong',
  40,
  '["energetic", "creative", "focused"]',
  'Great for daytime use, helped with productivity.',
  4,
  'backyard',
  'sunny',
  'solo',
  '2023-04-23T14:40:00Z',
  '2023-04-23T14:40:00Z'
);

-- Sample Data: Session Moods
INSERT OR IGNORE INTO session_moods (
  id, sessionId, timestamp, moodRating, moodDescription, energyLevel, relationType, createdAt, updatedAt
) VALUES (
  'mood-1',
  'session-1',
  '2023-04-20T19:55:00Z',
  6,
  'Slightly stressed',
  5,
  'before',
  '2023-04-20T19:55:00Z',
  '2023-04-20T19:55:00Z'
);

INSERT OR IGNORE INTO session_moods (
  id, sessionId, timestamp, moodRating, moodDescription, energyLevel, relationType, createdAt, updatedAt
) VALUES (
  'mood-2',
  'session-1',
  '2023-04-20T20:30:00Z',
  9,
  'Relaxed and happy',
  7,
  'after',
  '2023-04-20T20:30:00Z',
  '2023-04-20T20:30:00Z'
);

-- Sample Data: Medical Symptoms
INSERT OR IGNORE INTO medical_symptoms (
  id, userId, sessionId, symptom, severity, beforeOrAfter, notes, timestamp, createdAt, updatedAt
) VALUES (
  'symptom-1',
  'test-user-id',
  'session-3',
  'back pain',
  7,
  'before',
  'Chronic lower back pain flaring up',
  '2023-04-21T18:25:00Z',
  '2023-04-21T18:25:00Z',
  '2023-04-21T18:25:00Z'
);

INSERT OR IGNORE INTO medical_symptoms (
  id, userId, sessionId, symptom, severity, beforeOrAfter, notes, timestamp, createdAt, updatedAt
) VALUES (
  'symptom-2',
  'test-user-id',
  'session-3',
  'back pain',
  3,
  'after',
  'Pain significantly reduced after session',
  '2023-04-21T19:35:00Z',
  '2023-04-21T19:35:00Z',
  '2023-04-21T19:35:00Z'
);

-- Sample Data: Journal Entries
INSERT OR IGNORE INTO journal_entries (
  id, userId, title, content, mood, tags, sessionId, isPublic, createdAt, updatedAt
) VALUES (
  'journal-1',
  'demo-user-id',
  'Creative Evening with Blue Dream',
  'Tonight I tried Blue Dream for the first time. The experience was incredibly uplifting and sparked a creative flow I haven''t felt in months. I ended up writing three new songs in just a couple of hours. The strain provided a perfect balance of relaxation without sedation, allowing my mind to explore freely while staying focused. Will definitely add this to my regular rotation for creative sessions.',
  'inspired',
  '["creativity", "music", "first experience"]',
  'session-1',
  0,
  '2023-04-20T22:00:00Z',
  '2023-04-20T22:00:00Z'
);

INSERT OR IGNORE INTO journal_entries (
  id, userId, title, content, mood, tags, sessionId, isPublic, createdAt, updatedAt
) VALUES (
  'journal-2',
  'test-user-id',
  'Pain Management Success',
  'I''ve been dealing with back pain for weeks, and today I finally found significant relief. Granddaddy Purple helped reduce my pain level from a 7 to a 3, allowing me to move more freely and even do some light stretching. I''m impressed by how effective this strain is for my particular symptoms compared to others I''ve tried. Need to track this over time to see if the results are consistent.',
  'relieved',
  '["pain relief", "medical", "effective"]',
  'session-3',
  0,
  '2023-04-21T20:15:00Z',
  '2023-04-21T20:15:00Z'
);

-- Sample Data: Dashboards
INSERT OR IGNORE INTO dashboards (
  id, userId, name, layoutData, isDefault, version, createdAt, updatedAt
) VALUES (
  'dashboard-1',
  'demo-user-id',
  'My Main Dashboard',
  '{
    "rows": [
      {
        "id": "row-1",
        "layout": {
          "id": "layout-1",
          "columns": [
            { "id": "column-1", "widthPercentage": 33.33, "widgetId": "widget-1" },
            { "id": "column-2", "widthPercentage": 33.33, "widgetId": "widget-2" },
            { "id": "column-3", "widthPercentage": 33.33, "widgetId": "widget-3" }
          ]
        },
        "index": 1,
        "name": "Stats Overview",
        "showTitle": true
      },
      {
        "id": "row-2",
        "layout": {
          "id": "layout-2",
          "columns": [
            { "id": "column-4", "widthPercentage": 100, "widgetId": "widget-4" }
          ]
        },
        "index": 2,
        "name": "Recent Sessions",
        "showTitle": true
      }
    ]
  }',
  1,
  1,
  '2023-04-01T12:00:00Z',
  '2023-04-01T12:00:00Z'
);

INSERT OR IGNORE INTO dashboards (
  id, userId, name, layoutData, isDefault, version, createdAt, updatedAt
) VALUES (
  'dashboard-2',
  'test-user-id',
  'Medical Tracking',
  '{
    "rows": [
      {
        "id": "row-1",
        "layout": {
          "id": "layout-1",
          "columns": [
            { "id": "column-1", "widthPercentage": 50, "widgetId": "widget-5" },
            { "id": "column-2", "widthPercentage": 50, "widgetId": "widget-6" }
          ]
        },
        "index": 1,
        "name": "Symptom Trends",
        "showTitle": true
      },
      {
        "id": "row-2",
        "layout": {
          "id": "layout-2",
          "columns": [
            { "id": "column-3", "widthPercentage": 100, "widgetId": "widget-7" }
          ]
        },
        "index": 2,
        "name": "Strain Effectiveness",
        "showTitle": true
      }
    ]
  }',
  1,
  1,
  '2023-04-02T14:30:00Z',
  '2023-04-02T14:30:00Z'
);

-- Sample Data: Widgets
INSERT OR IGNORE INTO widgets (
  id, dashboardId, widgetTypeId, props, showTitle, createdAt, updatedAt
) VALUES (
  'widget-1',
  'dashboard-1',
  'statistics-card',
  '{
    "title": "Session Statistics",
    "stats": [
      { "label": "Total Sessions", "value": "2" },
      { "label": "This Week", "value": "2" },
      { "label": "Average Duration", "value": "37.5 min" }
    ]
  }',
  1,
  '2023-04-01T12:00:00Z',
  '2023-04-01T12:00:00Z'
);

INSERT OR IGNORE INTO widgets (
  id, dashboardId, widgetTypeId, props, showTitle, createdAt, updatedAt
) VALUES (
  'widget-2',
  'dashboard-1',
  'consumption-trend',
  '{
    "title": "Consumption Trends",
    "period": "week"
  }',
  1,
  '2023-04-01T12:00:00Z',
  '2023-04-01T12:00:00Z'
);

INSERT OR IGNORE INTO widgets (
  id, dashboardId, widgetTypeId, props, showTitle, createdAt, updatedAt
) VALUES (
  'widget-3',
  'dashboard-1',
  'strain-effectiveness',
  '{
    "title": "Top Strains",
    "limit": 5
  }',
  1,
  '2023-04-01T12:00:00Z',
  '2023-04-01T12:00:00Z'
);

INSERT OR IGNORE INTO widgets (
  id, dashboardId, widgetTypeId, props, showTitle, createdAt, updatedAt
) VALUES (
  'widget-4',
  'dashboard-1',
  'recent-sessions',
  '{
    "title": "Recent Sessions",
    "limit": 5
  }',
  1,
  '2023-04-01T12:00:00Z',
  '2023-04-01T12:00:00Z'
);

INSERT OR IGNORE INTO widgets (
  id, dashboardId, widgetTypeId, props, showTitle, createdAt, updatedAt
) VALUES (
  'widget-5',
  'dashboard-2',
  'symptom-tracker',
  '{
    "title": "Pain Level Tracking",
    "symptom": "back pain",
    "period": "month"
  }',
  1,
  '2023-04-02T14:30:00Z',
  '2023-04-02T14:30:00Z'
);

INSERT OR IGNORE INTO widgets (
  id, dashboardId, widgetTypeId, props, showTitle, createdAt, updatedAt
) VALUES (
  'widget-6',
  'dashboard-2',
  'statistics-card',
  '{
    "title": "Medical Statistics",
    "stats": [
      { "label": "Pain Reduction", "value": "57%" },
      { "label": "Consistent Relief", "value": "Yes" },
      { "label": "Preferred Method", "value": "Joint" }
    ]
  }',
  1,
  '2023-04-02T14:30:00Z',
  '2023-04-02T14:30:00Z'
);

INSERT OR IGNORE INTO widgets (
  id, dashboardId, widgetTypeId, props, showTitle, createdAt, updatedAt
) VALUES (
  'widget-7',
  'dashboard-2',
  'strain-effectiveness',
  '{
    "title": "Strain Effectiveness for Pain",
    "symptom": "back pain",
    "limit": 10
  }',
  1,
  '2023-04-02T14:30:00Z',
  '2023-04-02T14:30:00Z'
);

-- Sample Data: Goals
INSERT OR IGNORE INTO goals (
  id, userId, title, description, goalType, targetValue, currentValue, startDate, endDate, status, createdAt, updatedAt
) VALUES (
  'goal-1',
  'demo-user-id',
  'Reduce Weekly Consumption',
  'Limit cannabis use to weekends only for one month',
  'consumption',
  2,
  0,
  '2023-05-01T00:00:00Z',
  '2023-05-31T23:59:59Z',
  'active',
  '2023-04-25T15:30:00Z',
  '2023-04-25T15:30:00Z'
);

INSERT OR IGNORE INTO goals (
  id, userId, title, description, goalType, targetValue, currentValue, startDate, endDate, status, createdAt, updatedAt
) VALUES (
  'goal-2',
  'test-user-id',
  'Track Pain Management',
  'Document effectiveness of strains for back pain relief',
  'medical',
  30,
  2,
  '2023-05-01T00:00:00Z',
  '2023-07-31T23:59:59Z',
  'active',
  '2023-04-26T10:15:00Z',
  '2023-04-26T10:15:00Z'
); 