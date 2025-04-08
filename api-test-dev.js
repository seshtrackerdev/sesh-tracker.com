/**
 * API Test Script for Development Environment
 */
import fetch from 'node-fetch';

const API_URL = 'http://localhost:4001/api/v1';

// Helper function to make API requests with mock auth
async function makeRequest(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      // Include both headers for proper development auth
      'Authorization': 'Bearer mock-token-for-development',
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

// Test all endpoints
async function runTests() {
  console.log('=== Testing API Endpoints (Development Environment) ===');
  
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
  
  console.log('\n=== Testing Complete ===');
}

// Run the tests
runTests()
  .then(() => console.log('Tests finished running'))
  .catch(err => console.error('Fatal error running tests:', err)); 