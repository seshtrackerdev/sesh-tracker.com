// api-test.cjs - Test script for Sesh-Tracker API (CommonJS version)

// CommonJS syntax for Node.js compatibility
const fetch = require('node-fetch');

// Configuration
const API_URL = 'http://localhost:4001';
const DEBUG = true;

// Mock user headers for development
const MOCK_HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer dev-token',
  'X-Mock-User-Type': 'test'
};

// Helper to log if debug is enabled
function debugLog(...args) {
  if (DEBUG) {
    console.log('[DEBUG]', ...args);
  }
}

// Helper function to make API requests
async function makeApiRequest(endpoint, method = 'GET', body = null) {
  const url = `${API_URL}${endpoint}`;
  
  debugLog(`Making ${method} request to ${url}`);
  
  const options = {
    method,
    headers: MOCK_HEADERS,
    body: body ? JSON.stringify(body) : undefined
  };
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    debugLog('Response:', {
      status: response.status,
      success: data.success,
      data: data
    });
    
    return { 
      success: response.ok, 
      status: response.status, 
      data 
    };
  } catch (error) {
    console.error(`Error making request to ${url}:`, error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

// Test functions for different API endpoints
const tests = {
  // Test basic API health
  async testApiHealth() {
    console.log('\n----- Testing API Health -----');
    const result = await makeApiRequest('/api/health');
    
    if (result.success && result.data.success) {
      console.log('✅ API Health check passed');
    } else {
      console.log('❌ API Health check failed:', result.data);
    }
    
    return result.success;
  },
  
  // Test authentication middleware
  async testAuth() {
    console.log('\n----- Testing Authentication -----');
    const result = await makeApiRequest('/api/user/profile');
    
    if (result.success && result.data.success) {
      console.log('✅ Authentication successful:', result.data.user.displayName);
    } else {
      console.log('❌ Authentication failed:', result.data);
    }
    
    return result.success;
  },
  
  // Test mood entries
  async testMoodEntries() {
    console.log('\n----- Testing Mood Entries -----');
    
    // Get all mood entries
    const getResult = await makeApiRequest('/api/mood');
    
    if (getResult.success && getResult.data.success) {
      console.log(`✅ Found ${getResult.data.entries.length} mood entries`);
    } else {
      console.log('❌ Failed to get mood entries:', getResult.data);
      return false;
    }
    
    // Create a test mood entry
    const newMood = {
      mood: 'happy',
      intensity: 8,
      note: 'Testing the API with a happy mood',
      tags: ['test', 'api']
    };
    
    const createResult = await makeApiRequest('/api/mood', 'POST', newMood);
    
    if (createResult.success && createResult.data.success) {
      console.log('✅ Created new mood entry:', createResult.data.entry.id);
      
      // Get the newly created entry
      const getOneResult = await makeApiRequest(`/api/mood/${createResult.data.entry.id}`);
      
      if (getOneResult.success && getOneResult.data.success) {
        console.log('✅ Retrieved new mood entry');
      } else {
        console.log('❌ Failed to get new mood entry:', getOneResult.data);
      }
      
      // Update the mood entry
      const updateResult = await makeApiRequest(
        `/api/mood/${createResult.data.entry.id}`, 
        'PUT', 
        { ...newMood, intensity: 9, note: newMood.note + ' (updated)' }
      );
      
      if (updateResult.success && updateResult.data.success) {
        console.log('✅ Updated mood entry');
      } else {
        console.log('❌ Failed to update mood entry:', updateResult.data);
      }
      
      // Delete the mood entry
      const deleteResult = await makeApiRequest(`/api/mood/${createResult.data.entry.id}`, 'DELETE');
      
      if (deleteResult.success && deleteResult.data.success) {
        console.log('✅ Deleted mood entry');
      } else {
        console.log('❌ Failed to delete mood entry:', deleteResult.data);
      }
      
      return true;
    } else {
      console.log('❌ Failed to create mood entry:', createResult.data);
      return false;
    }
  },
  
  // Test medical symptoms
  async testMedicalSymptoms() {
    console.log('\n----- Testing Medical Symptoms -----');
    
    // Get all medical symptoms
    const getResult = await makeApiRequest('/api/medical-symptom');
    
    if (getResult.success && getResult.data.success) {
      console.log(`✅ Found ${getResult.data.symptoms.length} medical symptoms`);
    } else {
      console.log('❌ Failed to get medical symptoms:', getResult.data);
      return false;
    }
    
    // Create a test symptom entry
    const newSymptom = {
      symptom: 'headache',
      severity: 5,
      note: 'Testing the API with a headache symptom',
      bodyLocation: 'head',
      duration: 60  // minutes
    };
    
    const createResult = await makeApiRequest('/api/medical-symptom', 'POST', newSymptom);
    
    if (createResult.success && createResult.data.success) {
      console.log('✅ Created new symptom entry:', createResult.data.symptom.id);
      
      // Get the newly created entry
      const getOneResult = await makeApiRequest(`/api/medical-symptom/${createResult.data.symptom.id}`);
      
      if (getOneResult.success && getOneResult.data.success) {
        console.log('✅ Retrieved new symptom entry');
      } else {
        console.log('❌ Failed to get new symptom entry:', getOneResult.data);
      }
      
      // Update the symptom entry
      const updateResult = await makeApiRequest(
        `/api/medical-symptom/${createResult.data.symptom.id}`, 
        'PUT', 
        { ...newSymptom, severity: 6, note: newSymptom.note + ' (updated)' }
      );
      
      if (updateResult.success && updateResult.data.success) {
        console.log('✅ Updated symptom entry');
      } else {
        console.log('❌ Failed to update symptom entry:', updateResult.data);
      }
      
      // Delete the symptom entry
      const deleteResult = await makeApiRequest(`/api/medical-symptom/${createResult.data.symptom.id}`, 'DELETE');
      
      if (deleteResult.success && deleteResult.data.success) {
        console.log('✅ Deleted symptom entry');
      } else {
        console.log('❌ Failed to delete symptom entry:', deleteResult.data);
      }
      
      return true;
    } else {
      console.log('❌ Failed to create symptom entry:', createResult.data);
      return false;
    }
  },
  
  // Test journal entries
  async testJournalEntries() {
    console.log('\n----- Testing Journal Entries -----');
    
    // Get all journal entries
    const getResult = await makeApiRequest('/api/journal');
    
    if (getResult.success && getResult.data.success) {
      console.log(`✅ Found ${getResult.data.entries.length} journal entries`);
    } else {
      console.log('❌ Failed to get journal entries:', getResult.data);
      return false;
    }
    
    // Create a test journal entry
    const newJournal = {
      title: 'API Test Journal',
      content: 'This is a test journal entry created by the API test script.',
      tags: ['test', 'api', 'journal']
    };
    
    const createResult = await makeApiRequest('/api/journal', 'POST', newJournal);
    
    if (createResult.success && createResult.data.success) {
      console.log('✅ Created new journal entry:', createResult.data.entry.id);
      
      // Get the newly created entry
      const getOneResult = await makeApiRequest(`/api/journal/${createResult.data.entry.id}`);
      
      if (getOneResult.success && getOneResult.data.success) {
        console.log('✅ Retrieved new journal entry');
      } else {
        console.log('❌ Failed to get new journal entry:', getOneResult.data);
      }
      
      // Update the journal entry
      const updateResult = await makeApiRequest(
        `/api/journal/${createResult.data.entry.id}`, 
        'PUT', 
        { ...newJournal, title: newJournal.title + ' (updated)', content: newJournal.content + ' It has been updated.' }
      );
      
      if (updateResult.success && updateResult.data.success) {
        console.log('✅ Updated journal entry');
      } else {
        console.log('❌ Failed to update journal entry:', updateResult.data);
      }
      
      // Delete the journal entry
      const deleteResult = await makeApiRequest(`/api/journal/${createResult.data.entry.id}`, 'DELETE');
      
      if (deleteResult.success && deleteResult.data.success) {
        console.log('✅ Deleted journal entry');
      } else {
        console.log('❌ Failed to delete journal entry:', deleteResult.data);
      }
      
      return true;
    } else {
      console.log('❌ Failed to create journal entry:', createResult.data);
      return false;
    }
  }
};

// Run all tests
async function runTests() {
  console.log('============================');
  console.log(' SESH-TRACKER API TEST TOOL ');
  console.log(`============================\n`);
  console.log(`Using API at: ${API_URL}`);
  
  let passed = 0;
  let total = 0;
  
  try {
    // Run health check first
    if (await tests.testApiHealth()) {
      passed++;
    }
    total++;
    
    // Test authentication
    if (await tests.testAuth()) {
      passed++;
    }
    total++;
    
    // Test mood entries
    if (await tests.testMoodEntries()) {
      passed++;
    }
    total++;
    
    // Test medical symptoms
    if (await tests.testMedicalSymptoms()) {
      passed++;
    }
    total++;
    
    // Test journal entries
    if (await tests.testJournalEntries()) {
      passed++;
    }
    total++;
    
    // Print summary
    console.log('\n============================');
    console.log(`SUMMARY: ${passed}/${total} tests passed`);
    
    if (passed === total) {
      console.log('🎉 All tests passed!');
    } else {
      console.log(`⚠️ ${total - passed} tests failed`);
    }
  } catch (error) {
    console.error('\n❌ An unexpected error occurred during testing:', error);
  }
}

// Run all tests
runTests(); 