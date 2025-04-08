# Sesh-Tracker Database Management Tools

This directory contains scripts for managing the Sesh-Tracker D1 database. These tools simplify the setup, migration, and maintenance of both development and production databases.

## Available Tools

### `setup-db.js`

A guided setup script that helps you create and configure the D1 databases for Sesh-Tracker.

**Features:**
- Creates development and production databases
- Updates wrangler.json with database IDs
- Applies migrations to the databases
- Seeds the development database with test data

**Usage:**
```bash
node setup-db.js
```

### `d1-manager.js`

A command-line utility for managing the D1 database, providing common operations for development and database maintenance.

**Commands:**

- `migrate`: Apply migrations to the database
- `seed`: Seed the database with test data (development only)
- `reset`: Reset the database (drops all tables and re-applies migrations)
- `info`: Display info about the database
- `help`: Show the help message

**Examples:**
```bash
# Apply migrations to development database
node d1-manager.js migrate

# Apply migrations to production database
node d1-manager.js migrate prod

# Seed the development database with test data
node d1-manager.js seed

# Reset the development database
node d1-manager.js reset

# Show information about the development database
node d1-manager.js info

# Show help
node d1-manager.js help
```

## Database Setup Process

Follow these steps to set up the database for the first time:

1. **Run the setup script**:
   ```bash
   node setup-db.js
   ```
   This will guide you through the process of creating the databases, configuring wrangler.json, and applying migrations.

2. **Verify the setup**:
   ```bash
   node d1-manager.js info
   ```
   This will show you information about the database, including the number of tables and their contents.

## Workflow for Database Changes

When making changes to the database schema, follow this workflow:

1. **Create a new migration file** in the `src/worker/migrations` directory with a sequential name (e.g., `0002_add_user_preferences.sql`).

2. **Apply the migration to development**:
   ```bash
   node d1-manager.js migrate
   ```

3. **Test thoroughly** in the development environment.

4. **Apply to production** when ready:
   ```bash
   node d1-manager.js migrate prod
   ```

## Development Environment

For local development:

1. Start your worker with local D1:
   ```bash
   npx wrangler dev --local --persist
   ```

2. Seed with test data (if needed):
   ```bash
   node d1-manager.js seed
   ```

3. Reset database if needed:
   ```bash
   node d1-manager.js reset
   ```

## Database Documentation

For detailed information about the D1 database setup, schema, and API interactions, refer to the documentation in `src/worker/docs/d1-database-setup.md`. 