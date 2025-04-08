#!/usr/bin/env node

/**
 * D1 Database Manager
 * A utility script for managing the Sesh-Tracker D1 database
 * 
 * Commands:
 * - migrate: Apply migrations to the database
 * - seed: Seed the database with test data
 * - reset: Reset the database (drops all tables and re-applies migrations)
 * - info: Display info about the database
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

// Get the directory name properly in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the project root directory
const PROJECT_ROOT = path.resolve(__dirname, '../../..');

// Define paths
const MIGRATIONS_DIR = path.resolve(PROJECT_ROOT, 'migrations');
const SEEDS_DIR = path.resolve(PROJECT_ROOT, 'seeds');

// Setup readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Command line arguments
const args = process.argv.slice(2);
const command = args[0];
const env = args[1] === 'prod' ? 'production' : 'development';

// Help text
function showHelp() {
  console.log(`
D1 Database Manager for Sesh-Tracker

Usage:
  node d1-manager.js <command> [environment]

Commands:
  migrate        Apply all migrations to the database
  seed           Seed the database with test data (development only)
  reset          Reset the database (drops all tables and re-applies migrations)
  info           Display info about the database
  help           Show this help message

Environment:
  dev            Development environment (default)
  prod           Production environment

Examples:
  node d1-manager.js migrate          # Apply migrations to development database
  node d1-manager.js migrate prod     # Apply migrations to production database
  node d1-manager.js seed             # Seed the development database with test data
  node d1-manager.js reset            # Reset the development database
  node d1-manager.js info             # Display info about the database
`);
}

// Confirm action with user
function confirmAction(action, callback) {
  rl.question(`Are you sure you want to ${action}? (y/N): `, (answer) => {
    if (answer.toLowerCase() === 'y') {
      callback();
    } else {
      console.log('Operation cancelled');
      rl.close();
    }
  });
}

// Apply migrations to the database
async function applyMigrations() {
  console.log(`Applying migrations to ${env} database...`);
  
  try {
    if (env === 'production') {
      execSync('npx wrangler d1 migrations apply --production DB', { stdio: 'inherit' });
    } else {
      execSync('npx wrangler d1 migrations apply DB', { stdio: 'inherit' });
    }
    console.log('Migrations applied successfully');
  } catch (error) {
    console.error('Error applying migrations:', error.message);
  }
  
  rl.close();
}

// Seed the database with test data
async function seedDatabase() {
  if (env === 'production') {
    console.error('Cannot seed production database');
    rl.close();
    return;
  }
  
  console.log('Seeding development database with test data...');
  
  try {
    // Get seed file
    const seedFile = path.join(SEEDS_DIR, 'dev_seed.sql');
    
    if (!fs.existsSync(seedFile)) {
      console.error('Seed file not found:', seedFile);
      rl.close();
      return;
    }
    
    // Copy the seed file to a temporary location without spaces in the path
    const tempSeedFile = path.join(process.env.TEMP || '.', 'dev_seed_temp.sql');
    fs.copyFileSync(seedFile, tempSeedFile);
    
    // Apply seed using the temporary file
    execSync(`npx wrangler d1 execute DB --file="${tempSeedFile}"`, { stdio: 'inherit' });
    
    // Clean up the temporary file
    fs.unlinkSync(tempSeedFile);
    
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
  
  rl.close();
}

// Reset database (drop all tables and re-apply migrations)
async function resetDatabase() {
  if (env === 'production') {
    console.error('Cannot reset production database');
    rl.close();
    return;
  }
  
  confirmAction('reset the development database (this will delete all data)', async () => {
    console.log('Resetting development database...');
    
    try {
      // Create a temporary SQL file to drop all tables
      const tempFile = path.join(process.env.TEMP || '.', 'temp_drop_tables.sql');
      
      // Get all tables
      const tableQuery = `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';`;
      fs.writeFileSync(tempFile, tableQuery);
      
      const result = execSync(`npx wrangler d1 execute DB --file="${tempFile}"`, { encoding: 'utf8' });
      
      // Parse the result to get table names
      const tables = result.toString()
        .split('\n')
        .filter(line => line.trim() && !line.includes('name') && !line.includes('---'))
        .map(line => line.trim());
      
      // Generate DROP TABLE statements
      let dropStatements = '';
      tables.forEach(table => {
        dropStatements += `DROP TABLE IF EXISTS ${table};\n`;
      });
      
      // Write to temp file
      fs.writeFileSync(tempFile, dropStatements);
      
      // Execute drop statements
      execSync(`npx wrangler d1 execute DB --file="${tempFile}"`, { stdio: 'inherit' });
      
      // Clean up temp file
      fs.unlinkSync(tempFile);
      
      // Apply migrations
      execSync('npx wrangler d1 migrations apply DB', { stdio: 'inherit' });
      
      console.log('Database reset successfully');
      
      // Ask if user wants to seed the database
      rl.question('Do you want to seed the database with test data? (y/N): ', (answer) => {
        if (answer.toLowerCase() === 'y') {
          seedDatabase();
        } else {
          console.log('Database reset complete without seeding');
          rl.close();
        }
      });
    } catch (error) {
      console.error('Error resetting database:', error.message);
      rl.close();
    }
  });
}

// Display info about the database
async function showDatabaseInfo() {
  console.log(`Fetching database info for ${env} environment...`);
  
  try {
    // Show database size and table counts
    const query = `
      SELECT 'Database Size' as name, page_count * page_size / 1024.0 / 1024.0 || ' MB' as value FROM pragma_page_count(), pragma_page_size()
      UNION ALL
      SELECT 'Table Count' as name, COUNT(*) as value FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'
      UNION ALL
      SELECT 'Index Count' as name, COUNT(*) as value FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%'
    `;
    
    // Create a temporary SQL file in a safe location
    const tempFile = path.join(process.env.TEMP || '.', 'temp_info.sql');
    fs.writeFileSync(tempFile, query);
    
    // Execute the query
    if (env === 'production') {
      execSync(`npx wrangler d1 execute DB --production --file="${tempFile}"`, { stdio: 'inherit' });
    } else {
      execSync(`npx wrangler d1 execute DB --file="${tempFile}"`, { stdio: 'inherit' });
    }
    
    // Clean up temp file
    fs.unlinkSync(tempFile);
    
    // Show table details
    const tableQuery = `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;`;
    const tableFile = path.join(process.env.TEMP || '.', 'temp_tables.sql');
    fs.writeFileSync(tableFile, tableQuery);
    
    console.log('\nTables in database:');
    
    if (env === 'production') {
      execSync(`npx wrangler d1 execute DB --production --file="${tableFile}"`, { stdio: 'inherit' });
    } else {
      execSync(`npx wrangler d1 execute DB --file="${tableFile}"`, { stdio: 'inherit' });
    }
    
    // Clean up temp file
    fs.unlinkSync(tableFile);
  } catch (error) {
    console.error('Error fetching database info:', error.message);
  }
  
  rl.close();
}

// Main switch for commands
switch (command) {
  case 'migrate':
    applyMigrations();
    break;
  case 'seed':
    seedDatabase();
    break;
  case 'reset':
    resetDatabase();
    break;
  case 'info':
    showDatabaseInfo();
    break;
  case 'help':
    showHelp();
    rl.close();
    break;
  default:
    console.log('Unknown command. Use "help" to see available commands.');
    rl.close();
    break;
}

// Handle process exit
process.on('exit', () => {
  if (rl.active) rl.close();
}); 