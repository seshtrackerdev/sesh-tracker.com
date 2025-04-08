/**
 * Simple script to test the wellness API endpoints
 */
import fetch from 'node-fetch';

const API_URL = 'http://localhost:5173/api/v1';

// Mock authentication token for testing
const AUTH_TOKEN = 'test-auth-token';

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

// Helper function to make API requests
async function makeRequest(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AUTH_TOKEN}`
    }
  };

  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  try {
    console.log(`Attempting ${method} request to ${API_URL}${endpoint}`);
    
    const response = await fetch(`${API_URL}${endpoint}`, options);
    console.log(`Response status: ${response.status}`);
    
    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
      console.log(`Response data: ${JSON.stringify(responseData, null, 2)}`);
    } catch (parseError) {
      console.log(`Response is not JSON: ${responseText}`);
      responseData = { raw: responseText };
    }
    
    return { status: response.status, data: responseData };
  } catch (error) {
    console.error(`Error making request to ${endpoint}:`, error.message);
    return { status: 500, error: error.message };
  }
}

// Test all endpoints
async function runTests() {
  console.log('=== Testing Wellness API Endpoints ===');
  
  try {
    // 1. Test health endpoint
    console.log('\n--- Testing Health Endpoint ---');
    await makeRequest('/health');
    
    // 2. Test mood endpoints
    console.log('\n--- Testing Mood Endpoints ---');
    
    // Create a mood entry
    console.log('\nCreating mood entry...');
    const moodResponse = await makeRequest('/mood', 'POST', testMoodEntry);
    const moodId = moodResponse.data?.data?.id;
    
    if (moodId) {
      // Get all mood entries
      console.log('\nFetching all mood entries...');
      await makeRequest('/mood');
      
      // Get specific mood entry
      console.log(`\nFetching mood entry ${moodId}...`);
      await makeRequest(`/mood/${moodId}`);
      
      // Update mood entry
      console.log(`\nUpdating mood entry ${moodId}...`);
      await makeRequest(`/mood/${moodId}`, 'PUT', {
        ...testMoodEntry,
        rating: 9,
        note: 'Feeling even better after some relaxation!'
      });
      
      // Delete mood entry
      console.log(`\nDeleting mood entry ${moodId}...`);
      await makeRequest(`/mood/${moodId}`, 'DELETE');
    } else {
      console.log('Could not create mood entry, skipping related tests');
    }
    
    // 3. Test medical symptom endpoints
    console.log('\n--- Testing Medical Symptom Endpoints ---');
    
    // Create a symptom entry
    console.log('\nCreating symptom entry...');
    const symptomResponse = await makeRequest('/medical-symptoms', 'POST', testSymptomEntry);
    const symptomId = symptomResponse.data?.data?.id;
    
    if (symptomId) {
      // Get all symptom entries
      console.log('\nFetching all symptom entries...');
      await makeRequest('/medical-symptoms');
      
      // Get specific symptom entry
      console.log(`\nFetching symptom entry ${symptomId}...`);
      await makeRequest(`/medical-symptoms/${symptomId}`);
      
      // Update symptom entry
      console.log(`\nUpdating symptom entry ${symptomId}...`);
      await makeRequest(`/medical-symptoms/${symptomId}`, 'PUT', {
        ...testSymptomEntry,
        severity: 3,
        notes: 'Headache getting better after taking a break'
      });
      
      // Delete symptom entry
      console.log(`\nDeleting symptom entry ${symptomId}...`);
      await makeRequest(`/medical-symptoms/${symptomId}`, 'DELETE');
    } else {
      console.log('Could not create symptom entry, skipping related tests');
    }
    
    // 4. Test journal endpoints
    console.log('\n--- Testing Journal Endpoints ---');
    
    // Create a journal entry
    console.log('\nCreating journal entry...');
    const journalResponse = await makeRequest('/journal', 'POST', testJournalEntry);
    const journalId = journalResponse.data?.data?.id;
    
    if (journalId) {
      // Get all journal entries
      console.log('\nFetching all journal entries...');
      await makeRequest('/journal');
      
      // Get specific journal entry
      console.log(`\nFetching journal entry ${journalId}...`);
      await makeRequest(`/journal/${journalId}`);
      
      // Update journal entry
      console.log(`\nUpdating journal entry ${journalId}...`);
      await makeRequest(`/journal/${journalId}`, 'PUT', {
        ...testJournalEntry,
        title: 'Updated Reflections',
        content: 'Added more details to my journal entry...'
      });
      
      // Delete journal entry
      console.log(`\nDeleting journal entry ${journalId}...`);
      await makeRequest(`/journal/${journalId}`, 'DELETE');
    } else {
      console.log('Could not create journal entry, skipping related tests');
    }
  } catch (error) {
    console.error('Test execution error:', error);
  }
  
  console.log('\n=== Testing Complete ===');
}

// Run the tests
runTests()
  .then(() => console.log('Tests finished running'))
  .catch(err => console.error('Fatal error running tests:', err)); 