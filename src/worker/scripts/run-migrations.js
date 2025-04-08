#!/usr/bin/env node

/**
 * Database migration runner for Sesh-Tracker
 * This script applies migrations to the D1 database
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// Configuration
const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');
const DATABASE_NAME = process.env.DATABASE_NAME || 'sesh-tracker-dev';

/**
 * Execute a wrangler d1 command
 */
async function runWranglerCommand(command) {
  try {
    console.log(`Running: ${command}`);
    const { stdout, stderr } = await execAsync(command);
    if (stderr) {
      console.error('Command stderr:', stderr);
    }
    return stdout;
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    throw error;
  }
}

/**
 * Get all migration files sorted by version number
 */
function getMigrationFiles() {
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql'))
    .sort(); // Ensures migrations are applied in order (0000, 0001, 0002, etc.)
  
  return files.map(file => path.join(MIGRATIONS_DIR, file));
}

/**
 * Apply a single migration file
 */
async function applyMigration(migrationPath) {
  const migrationName = path.basename(migrationPath);
  try {
    console.log(`Applying migration: ${migrationName}`);
    
    // Execute the migration using wrangler d1 execute
    await runWranglerCommand(
      `npx wrangler d1 execute ${DATABASE_NAME} --file=${migrationPath}`
    );
    
    console.log(`Migration ${migrationName} applied successfully`);
  } catch (error) {
    console.error(`Failed to apply migration ${migrationName}`);
    throw error;
  }
}

/**
 * Main migration function
 */
async function runMigrations() {
  console.log(`Starting migrations for database: ${DATABASE_NAME}`);
  
  try {
    // Get all migration files
    const migrations = getMigrationFiles();
    
    if (migrations.length === 0) {
      console.log('No migrations found.');
      return;
    }
    
    console.log(`Found ${migrations.length} migration(s)`);
    
    // Apply migrations in sequence
    for (const migration of migrations) {
      await applyMigration(migration);
    }
    
    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration process failed:', error.message);
    process.exit(1);
  }
}

// Run migrations when script is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations }; 