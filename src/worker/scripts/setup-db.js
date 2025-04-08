#!/usr/bin/env node

/**
 * Sesh-Tracker D1 Database Setup Script
 * 
 * This script guides developers through the initial D1 database setup process
 * for the Sesh-Tracker application.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

// Get the directory name properly in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

// Display header
console.log(`
${colors.bright}${colors.blue}================================================
Sesh-Tracker D1 Database Setup
================================================${colors.reset}

This script will guide you through setting up the D1 database
for the Sesh-Tracker application.

`);

// Main function to run the setup process
async function runSetup() {
  try {
    // Check if Wrangler is installed
    try {
      execSync('npx wrangler --version', { stdio: 'pipe' });
      console.log(`${colors.green}✓ Wrangler is installed${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}✗ Wrangler is not installed${colors.reset}`);
      console.log('\nPlease install Wrangler by running:');
      console.log('  npm install -g wrangler');
      rl.close();
      return;
    }

    // Check if wrangler.json exists
    const wranglerPath = path.resolve(process.cwd(), 'wrangler.json');
    if (!fs.existsSync(wranglerPath)) {
      console.error(`${colors.red}✗ wrangler.json not found at ${wranglerPath}${colors.reset}`);
      console.log('\nPlease run this script from the root of the project');
      rl.close();
      return;
    }

    console.log(`${colors.green}✓ Found wrangler.json${colors.reset}`);

    // Check if user is authenticated with Cloudflare
    console.log('\nChecking Cloudflare authentication...');
    try {
      execSync('npx wrangler whoami', { stdio: 'pipe' });
      console.log(`${colors.green}✓ Authenticated with Cloudflare${colors.reset}`);
    } catch (error) {
      console.log(`${colors.yellow}! Not authenticated with Cloudflare${colors.reset}`);
      console.log('\nYou need to authenticate with Cloudflare to create a D1 database.');
      
      const login = await askQuestion('Would you like to login to Cloudflare now? (y/N): ');
      if (login.toLowerCase() === 'y') {
        try {
          execSync('npx wrangler login', { stdio: 'inherit' });
          console.log(`${colors.green}✓ Successfully authenticated with Cloudflare${colors.reset}`);
        } catch (error) {
          console.error(`${colors.red}✗ Failed to authenticate with Cloudflare${colors.reset}`);
          rl.close();
          return;
        }
      } else {
        console.log('\nYou need to be authenticated with Cloudflare to create a D1 database.');
        console.log('Please run "npx wrangler login" and then run this script again.');
        rl.close();
        return;
      }
    }

    // Check if database already exists in wrangler.json
    let wranglerConfig;
    try {
      wranglerConfig = JSON.parse(fs.readFileSync(wranglerPath, 'utf8'));
    } catch (error) {
      console.error(`${colors.red}✗ Failed to parse wrangler.json: ${error.message}${colors.reset}`);
      rl.close();
      return;
    }

    const hasDatabase = wranglerConfig.d1_databases && 
                        wranglerConfig.d1_databases.some(db => db.binding === 'DB');

    if (hasDatabase) {
      console.log(`${colors.green}✓ Database configuration found in wrangler.json${colors.reset}`);
      
      const proceed = await askQuestion('Database configuration exists. Do you want to continue with setup anyway? (y/N): ');
      if (proceed.toLowerCase() !== 'y') {
        console.log('\nSetup cancelled.');
        rl.close();
        return;
      }
    }

    // Create databases
    console.log('\n1. Creating databases...');
    
    // Create development database
    console.log('\nCreating development database...');
    let devDbId;
    try {
      const result = execSync('npx wrangler d1 create sesh-tracker-dev', { encoding: 'utf8' });
      const match = result.match(/(?:id|uuid|database_id)[^\w\d]+([\w\d-]+)/i);
      devDbId = match ? match[1] : null;
      
      if (devDbId) {
        console.log(`${colors.green}✓ Development database created with ID: ${devDbId}${colors.reset}`);
      } else {
        console.error(`${colors.yellow}! Created development database but couldn't extract ID${colors.reset}`);
        console.log('Please check the output above for the database ID and update wrangler.json manually.');
      }
    } catch (error) {
      if (error.stdout && error.stdout.includes('already exists')) {
        console.log(`${colors.yellow}! Development database already exists${colors.reset}`);
        
        // Try to extract the database ID
        const match = error.stdout.match(/(?:id|uuid|database_id)[^\w\d]+([\w\d-]+)/i);
        devDbId = match ? match[1] : null;
        
        if (devDbId) {
          console.log(`${colors.green}✓ Found existing development database with ID: ${devDbId}${colors.reset}`);
        } else {
          console.log(`${colors.yellow}! Please find your development database ID by running:${colors.reset}`);
          console.log('  npx wrangler d1 list');
          devDbId = await askQuestion('Enter your development database ID: ');
        }
      } else {
        console.error(`${colors.red}✗ Failed to create development database: ${error.message}${colors.reset}`);
        rl.close();
        return;
      }
    }

    // Create production database
    console.log('\nCreating production database...');
    let prodDbId;
    try {
      const result = execSync('npx wrangler d1 create sesh-tracker-prod', { encoding: 'utf8' });
      const match = result.match(/(?:id|uuid|database_id)[^\w\d]+([\w\d-]+)/i);
      prodDbId = match ? match[1] : null;
      
      if (prodDbId) {
        console.log(`${colors.green}✓ Production database created with ID: ${prodDbId}${colors.reset}`);
      } else {
        console.error(`${colors.yellow}! Created production database but couldn't extract ID${colors.reset}`);
        console.log('Please check the output above for the database ID and update wrangler.json manually.');
      }
    } catch (error) {
      if (error.stdout && error.stdout.includes('already exists')) {
        console.log(`${colors.yellow}! Production database already exists${colors.reset}`);
        
        // Try to extract the database ID
        const match = error.stdout.match(/(?:id|uuid|database_id)[^\w\d]+([\w\d-]+)/i);
        prodDbId = match ? match[1] : null;
        
        if (prodDbId) {
          console.log(`${colors.green}✓ Found existing production database with ID: ${prodDbId}${colors.reset}`);
        } else {
          console.log(`${colors.yellow}! Please find your production database ID by running:${colors.reset}`);
          console.log('  npx wrangler d1 list');
          prodDbId = await askQuestion('Enter your production database ID: ');
        }
      } else {
        console.error(`${colors.red}✗ Failed to create production database: ${error.message}${colors.reset}`);
        rl.close();
        return;
      }
    }

    // Update wrangler.json with database IDs
    console.log('\n2. Updating wrangler.json with database IDs...');
    
    try {
      // Make a backup of the original wrangler.json
      const backupPath = `${wranglerPath}.backup`;
      fs.copyFileSync(wranglerPath, backupPath);
      console.log(`${colors.green}✓ Created backup of wrangler.json at ${backupPath}${colors.reset}`);
      
      // Update the configuration
      if (!wranglerConfig.d1_databases) {
        wranglerConfig.d1_databases = [];
      }
      
      // Remove any existing DB configuration
      wranglerConfig.d1_databases = wranglerConfig.d1_databases.filter(db => db.binding !== 'DB');
      
      // Add the new database configurations
      wranglerConfig.d1_databases.push({
        binding: 'DB',
        database_name: 'sesh-tracker-prod',
        database_id: prodDbId
      });
      
      // Update the environment-specific configuration
      if (!wranglerConfig.env) {
        wranglerConfig.env = {};
      }
      
      if (!wranglerConfig.env.development) {
        wranglerConfig.env.development = {};
      }
      
      if (!wranglerConfig.env.development.d1_databases) {
        wranglerConfig.env.development.d1_databases = [];
      }
      
      // Remove any existing DB configuration from development environment
      wranglerConfig.env.development.d1_databases = 
        wranglerConfig.env.development.d1_databases.filter(db => db.binding !== 'DB');
      
      // Add the development database configuration
      wranglerConfig.env.development.d1_databases.push({
        binding: 'DB',
        database_name: 'sesh-tracker-dev',
        database_id: devDbId
      });
      
      // Write the updated configuration back to wrangler.json
      fs.writeFileSync(wranglerPath, JSON.stringify(wranglerConfig, null, 2));
      
      console.log(`${colors.green}✓ Updated wrangler.json with database IDs${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}✗ Failed to update wrangler.json: ${error.message}${colors.reset}`);
      console.log('Please update wrangler.json manually with the following database IDs:');
      console.log(`  Development: ${devDbId}`);
      console.log(`  Production: ${prodDbId}`);
      rl.close();
      return;
    }

    // Apply migrations
    console.log('\n3. Applying migrations...');
    
    // Apply development migrations
    console.log('\nApplying migrations to development database...');
    try {
      execSync('npx wrangler d1 migrations apply DB', { stdio: 'inherit' });
      console.log(`${colors.green}✓ Successfully applied migrations to development database${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}✗ Failed to apply migrations to development database: ${error.message}${colors.reset}`);
      rl.close();
      return;
    }
    
    // Ask about applying migrations to production
    const applyToProd = await askQuestion('\nDo you want to apply migrations to the production database? (y/N): ');
    if (applyToProd.toLowerCase() === 'y') {
      try {
        execSync('npx wrangler d1 migrations apply --production DB', { stdio: 'inherit' });
        console.log(`${colors.green}✓ Successfully applied migrations to production database${colors.reset}`);
      } catch (error) {
        console.error(`${colors.red}✗ Failed to apply migrations to production database: ${error.message}${colors.reset}`);
        rl.close();
        return;
      }
    }

    // Seed the development database
    console.log('\n4. Seeding the development database...');
    const seedDb = await askQuestion('Do you want to seed the development database with test data? (Y/n): ');
    
    if (seedDb.toLowerCase() !== 'n') {
      try {
        execSync('node src/worker/scripts/d1-manager.js seed', { stdio: 'inherit' });
        console.log(`${colors.green}✓ Successfully seeded development database${colors.reset}`);
      } catch (error) {
        console.error(`${colors.red}✗ Failed to seed development database: ${error.message}${colors.reset}`);
        rl.close();
        return;
      }
    }

    // Completed successfully
    console.log(`\n${colors.bright}${colors.green}Database setup completed successfully!${colors.reset}`);
    console.log(`\nYou can now use the following commands to manage your database:`);
    console.log(`  ${colors.cyan}npm run db:info${colors.reset} - View information about your database`);
    console.log(`  ${colors.cyan}npm run db:migrate${colors.reset} - Apply migrations to your database`);
    console.log(`  ${colors.cyan}npm run db:seed${colors.reset} - Seed your development database with test data`);
    console.log(`  ${colors.cyan}npm run db:reset${colors.reset} - Reset your development database`);
    
    rl.close();
  } catch (error) {
    console.error(`${colors.red}An unexpected error occurred: ${error.message}${colors.reset}`);
    rl.close();
  }
}

// Helper function to ask a question and get a response
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Run the setup
runSetup(); 