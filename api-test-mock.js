/**
 * API Test Script for Development Environment using mock auth
 */
import fetch from 'node-fetch';

// Use the confirmed port from Vite logs
const API_URL = 'http://localhost:4001/api/v1';

// Helper function to make API requests with mock auth only
async function makeRequest(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      // Use ONLY mock auth header for testing
      'X-Mock-User-Type': 'test'
    }
  };

  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  try {
    console.log(`\n[${method}] ${endpoint}`);
    const response = await fetch(`${API_URL}${endpoint}`, options);
    console.log(`Status: ${response.status}`);
    
    let responseData = null;
    const responseText = await response.text();
    
    try {
      if (responseText.trim()) {
        responseData = JSON.parse(responseText);
        console.log(JSON.stringify(responseData, null, 2));
      } else {
        console.log('Empty response body');
      }
    } catch (e) {
      console.log(`Non-JSON response: ${responseText}`);
      responseData = { raw: responseText };
    }
    
    return { status: response.status, data: responseData };
  } catch (error) {
    console.error(`Error making request to ${endpoint}:`, error.message);
    return { status: 500, error: error.message };
  }
}

// Test data for creating entries
const testMoodEntry = {
  userId: 'test-user-id',
  rating: 8,
  note: 'Feeling great today!',
  tags: ['relaxed', 'happy', 'productive'],
  createdAt: new Date().toISOString()
};

const testSymptomEntry = {
  userId: 'test-user-id',
  symptom: 'Headache',
  severity: 5,
  duration: '2 hours',
  notes: 'Mild headache after working on computer',
  tags: ['stress', 'work'],
  createdAt: new Date().toISOString()
};

const testJournalEntry = {
  userId: 'test-user-id',
  title: 'Today\'s Reflections',
  content: 'Had a productive day working on my wellness tracking features...',
  tags: ['coding', 'wellness', 'productivity'],
  mood: 7,
  isPrivate: true,
  createdAt: new Date().toISOString()
};

// Test one endpoint at a time
async function testHealthEndpoint() {
  console.log('=== Testing Health Endpoint ===');
  await makeRequest('/health');
}

async function testMoodEndpoint() {
  console.log('=== Testing Mood Endpoint ===');
  await makeRequest('/mood');
}

async function testCreateMood() {
  console.log('=== Testing Create Mood ===');
  await makeRequest('/mood', 'POST', testMoodEntry);
}

async function testMedicalSymptomsEndpoint() {
  console.log('=== Testing Medical Symptoms Endpoint ===');
  await makeRequest('/medical-symptoms');
}

async function testCreateSymptom() {
  console.log('=== Testing Create Symptom ===');
  await makeRequest('/medical-symptoms', 'POST', testSymptomEntry);
}

async function testJournalEndpoint() {
  console.log('=== Testing Journal Endpoint ===');
  await makeRequest('/journal');
}

async function testCreateJournal() {
  console.log('=== Testing Create Journal ===');
  await makeRequest('/journal', 'POST', testJournalEntry);
}

// Execute the selected test
const args = process.argv.slice(2);
const testToRun = args[0] || 'health';

switch (testToRun) {
  case 'health':
    testHealthEndpoint();
    break;
  case 'mood':
    testMoodEndpoint();
    break;
  case 'create-mood':
    testCreateMood();
    break;
  case 'symptoms':
    testMedicalSymptomsEndpoint();
    break;
  case 'create-symptom':
    testCreateSymptom();
    break;
  case 'journal':
    testJournalEndpoint();
    break;
  case 'create-journal':
    testCreateJournal();
    break;
  default:
    console.log('Unknown test. Available tests: health, mood, create-mood, symptoms, create-symptom, journal, create-journal');
} 