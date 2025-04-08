/**
 * Simple CLI for testing the wellness API endpoints
 */
import fetch from 'node-fetch';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const API_URL = 'http://localhost:5173/api/v1';
const AUTH_TOKEN = 'test-auth-token';

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
    console.log(`\nRequesting ${method} ${API_URL}${endpoint}`);
    
    const response = await fetch(`${API_URL}${endpoint}`, options);
    console.log(`Response status: ${response.status}`);
    
    const responseText = await response.text();
    
    try {
      if (responseText) {
        const responseData = JSON.parse(responseText);
        console.log('Response data:');
        console.log(JSON.stringify(responseData, null, 2));
        return { status: response.status, data: responseData };
      } else {
        console.log('Empty response');
        return { status: response.status, data: null };
      }
    } catch (parseError) {
      console.log(`Response is not JSON: ${responseText}`);
      return { status: response.status, data: { raw: responseText } };
    }
  } catch (error) {
    console.error(`Error making request:`, error.message);
    return { status: 500, error: error.message };
  }
}

// Test data
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

// Available tests
const tests = {
  'health': async () => {
    await makeRequest('/health');
  },
  'create-mood': async () => {
    await makeRequest('/mood', 'POST', testMoodEntry);
  },
  'list-moods': async () => {
    await makeRequest('/mood');
  },
  'create-symptom': async () => {
    await makeRequest('/medical-symptoms', 'POST', testSymptomEntry);
  },
  'list-symptoms': async () => {
    await makeRequest('/medical-symptoms');
  },
  'create-journal': async () => {
    await makeRequest('/journal', 'POST', testJournalEntry);
  },
  'list-journals': async () => {
    await makeRequest('/journal');
  }
};

function showMenu() {
  console.log('\n=== API Test CLI ===');
  console.log('Available commands:');
  Object.keys(tests).forEach(cmd => {
    console.log(`- ${cmd}`);
  });
  console.log('- exit (quit the program)');
  console.log('- help (show this menu)');
}

async function runCommand(cmd) {
  if (cmd === 'exit') {
    rl.close();
    return;
  }
  
  if (cmd === 'help') {
    showMenu();
    return;
  }
  
  if (tests[cmd]) {
    try {
      await tests[cmd]();
    } catch (error) {
      console.error('Error executing command:', error);
    }
  } else {
    console.log(`Unknown command: ${cmd}`);
    console.log('Type "help" to see available commands');
  }
}

// Start the CLI
console.log('Welcome to the Wellness API Test CLI');
showMenu();

rl.on('line', async (line) => {
  const cmd = line.trim();
  await runCommand(cmd);
  rl.prompt();
});

rl.on('close', () => {
  console.log('Exiting API Test CLI. Goodbye!');
  process.exit(0);
});

rl.prompt(); 