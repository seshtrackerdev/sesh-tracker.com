/**
 * Script to set up Cloudflare Worker variables for different environments
 * Run with: node setup-worker-vars.js
 */

import { execSync } from 'child_process';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setupWorkerVariables() {
  console.log('=== Sesh-Tracker Worker Environment Setup ===');
  console.log('This script will set up environment variables for your Cloudflare Worker');
  console.log('Make sure you are authenticated with wrangler (run "wrangler login" if not)');
  console.log('');
  
  // Determine which environment to set up
  const environment = await askQuestion('Which environment do you want to configure? (development/production): ');
  
  if (environment !== 'development' && environment !== 'production') {
    console.error('Invalid environment. Please specify either "development" or "production".');
    rl.close();
    return;
  }
  
  console.log(`\nConfiguring ${environment} environment...`);
  
  // Set API_ENV variable
  try {
    console.log(`Setting API_ENV to ${environment}...`);
    execSync(`wrangler secret put API_ENV --env ${environment}`, { stdio: 'inherit' });
    console.log('✅ API_ENV variable set successfully');
  } catch (error) {
    console.error('❌ Failed to set API_ENV variable:', error.message);
  }
  
  // Set AUTH_API_URL variable
  const authApiUrl = await askQuestion('Enter the URL for your authentication API (default: https://kush.observer/api): ') 
    || 'https://kush.observer/api';
  
  try {
    console.log(`Setting AUTH_API_URL to ${authApiUrl}...`);
    execSync(`wrangler secret put AUTH_API_URL --env ${environment}`, { stdio: 'inherit' });
    console.log('✅ AUTH_API_URL variable set successfully');
  } catch (error) {
    console.error('❌ Failed to set AUTH_API_URL variable:', error.message);
  }
  
  // Add any additional variables needed for the worker
  const addMore = await askQuestion('\nDo you want to add more variables? (yes/no): ');
  
  if (addMore.toLowerCase() === 'yes') {
    let adding = true;
    
    while (adding) {
      const varName = await askQuestion('Enter variable name: ');
      
      try {
        console.log(`Setting ${varName}...`);
        execSync(`wrangler secret put ${varName} --env ${environment}`, { stdio: 'inherit' });
        console.log(`✅ ${varName} variable set successfully`);
      } catch (error) {
        console.error(`❌ Failed to set ${varName} variable:`, error.message);
      }
      
      const continue_ = await askQuestion('\nAdd another variable? (yes/no): ');
      adding = continue_.toLowerCase() === 'yes';
    }
  }
  
  console.log('\n=== Configuration Complete ===');
  console.log(`Your ${environment} environment is now configured with the necessary variables.`);
  console.log('You may need to restart your worker for changes to take effect.');
  
  rl.close();
}

// Run the setup function
setupWorkerVariables(); 