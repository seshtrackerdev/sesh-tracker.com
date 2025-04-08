# Sesh-Tracker D1 Database Setup and Configuration

This document provides detailed information about the D1 database setup for the Sesh-Tracker application, including configuration, schema, bindings, and API interactions.

## Database Setup

### Creating D1 Databases

For Sesh-Tracker, we maintain two D1 databases:
1. A development database for local development and testing
2. A production database for the live application

To create these databases, use the Wrangler CLI:

```bash
# Create development database
npx wrangler d1 create sesh-tracker-dev

# Create production database
npx wrangler d1 create sesh-tracker-prod
```

The output will look like:

```
✅ Created database 'sesh-tracker-dev' at <database_id>
```

Make note of the database IDs generated for both databases, as you'll need to update your `wrangler.json` file with these values.

> **Note**: You can also run the setup script at `src/worker/scripts/setup-db.js` to automate this process.

### Configuration in `wrangler.json`

The D1 database configuration should be added to your `wrangler.json` file:

```json
{
  "name": "sesh-tracker",
  "main": "src/worker/index.ts",
  "compatibility_date": "2023-05-18",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "sesh-tracker-prod",
      "database_id": "<production_database_id>"
    }
  ],
  "env": {
    "development": {
      "d1_databases": [
        {
          "binding": "DB",
          "database_name": "sesh-tracker-dev",
          "database_id": "<development_database_id>"
        }
      ]
    }
  }
}
```

Replace `<production_database_id>` and `<development_database_id>` with the actual database IDs generated when creating the databases.

### Applying Database Migrations

Migrations are stored in the `src/worker/migrations` directory. To apply these migrations:

```bash
# For local development database
npx wrangler d1 migrations apply DB

# For production database
npx wrangler d1 migrations apply --production DB
```

A successful migration will output:

```
Migrations to be applied:
0000_initial_schema.sql
0001_enhanced_schema.sql
✅ Applied 2 migrations.
```

## Database Schema

Our database schema is defined in migration files located in the `src/worker/migrations` directory. The schema includes the following core tables:

### Core Tables

1. **users**: Stores user account information
2. **user_profiles**: Extended user information and preferences
3. **dashboards**: User-created dashboards for data visualization
4. **widgets**: Components placed on dashboards
5. **sessions**: Cannabis consumption sessions recorded by users
6. **inventory**: User's cannabis product inventory
7. **strains**: Cannabis strain information

### Extension Tables

1. **session_moods**: Mood tracking before and after sessions
2. **medical_symptoms**: Medical symptom tracking related to sessions
3. **product_catalog**: Reference data for cannabis products
4. **dispensaries**: Information about dispensaries
5. **journal_entries**: User journal entries related to sessions
6. **user_connections**: Connections between users for social features
7. **shared_content**: Content shared between users
8. **goals**: User-defined goals and tracking

### Key Relationships

- Users have many dashboards, sessions, inventory items, and journal entries
- Dashboards contain many widgets
- Sessions can reference inventory items and strains
- Medical symptoms are linked to sessions

## API Interaction

### Binding the Database in Worker Code

The D1 database is bound to the Worker environment and can be accessed through the `context` object:

```typescript
export interface Env {
  DB: D1Database;
  // Other bindings...
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Access the database through env.DB
    const { results } = await env.DB.prepare("SELECT * FROM users LIMIT 10").all();
    // ...
  }
};
```

### Performing Read Operations

```typescript
// Simple query
const { results } = await env.DB.prepare("SELECT * FROM users WHERE id = ?")
  .bind(userId)
  .all();

// Single row
const user = await env.DB.prepare("SELECT * FROM users WHERE id = ?")
  .bind(userId)
  .first();
```

### Performing Write Operations

```typescript
// Insert
const result = await env.DB.prepare(
  "INSERT INTO users (id, email, displayName, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)"
)
  .bind(userId, email, displayName, 'user', currentTime, currentTime)
  .run();

// Update
const result = await env.DB.prepare(
  "UPDATE users SET displayName = ?, updatedAt = ? WHERE id = ?"
)
  .bind(newDisplayName, currentTime, userId)
  .run();

// Delete
const result = await env.DB.prepare(
  "DELETE FROM users WHERE id = ?"
)
  .bind(userId)
  .run();
```

### Transactions

For operations that need to be atomic, use transactions:

```typescript
await env.DB.batch([
  env.DB.prepare("INSERT INTO sessions (id, userId, timestamp) VALUES (?, ?, ?)").bind(sessionId, userId, timestamp),
  env.DB.prepare("INSERT INTO session_moods (id, sessionId, moodRating) VALUES (?, ?, ?)").bind(moodId, sessionId, rating)
]);
```

## Best Practices

### Parameterized Queries

Always use parameterized queries with the `.bind()` method to prevent SQL injection:

```typescript
// Good
const user = await env.DB.prepare("SELECT * FROM users WHERE email = ?")
  .bind(email)
  .first();

// Bad - vulnerable to SQL injection
const user = await env.DB.prepare(`SELECT * FROM users WHERE email = '${email}'`).first();
```

### Connection Management

D1 manages connections automatically, so there's no need to explicitly open or close connections.

### Error Handling

Always handle database errors appropriately:

```typescript
try {
  const result = await env.DB.prepare("INSERT INTO users ...").bind(...).run();
  return new Response("User created", { status: 201 });
} catch (error) {
  console.error("Database error:", error);
  return new Response("Database error", { status: 500 });
}
```

## Local Development

### Running with Local D1

When developing locally, you can use Wrangler to run your application with the D1 database:

```bash
npx wrangler dev --local --persist
```

The `--persist` flag ensures your local database state is preserved between development sessions.

### Seeding Development Data

For development and testing, you can seed the database with test data:

```bash
# Using the database manager script
node src/worker/scripts/d1-manager.js seed

# Or directly with Wrangler
npx wrangler d1 execute DB --file=src/worker/migrations/seeds/dev_seed.sql
```

## Production Operations

### Data Backup

D1 databases are automatically backed up by Cloudflare, but you can also export your data for safekeeping:

```bash
npx wrangler d1 export DB --production > sesh-tracker-backup-$(date +%Y%m%d).sql
```

### Schema Changes

Schema changes should always be done through migrations:

1. Create a new migration file in `src/worker/migrations/`
2. Apply the migration first to your development database
3. Test thoroughly
4. Apply to production when ready

### Database Inspection

To inspect your database or run ad-hoc queries:

```bash
# Interactive SQL console for development
npx wrangler d1 execute DB --command="SELECT * FROM users LIMIT 10;"

# Interactive SQL console for production
npx wrangler d1 execute DB --production --command="SELECT * FROM users LIMIT 10;"
```

## Security Considerations

### Access Control

The D1 database is accessible only to the Worker application itself. All user access should be validated through your API middleware:

```typescript
async function authenticate(request: Request, env: Env): Promise<User | null> {
  // Validate the authentication token
  const token = request.headers.get('Authorization')?.split('Bearer ')[1];
  if (!token) return null;
  
  // Look up the user
  const user = await env.DB.prepare("SELECT * FROM users WHERE id = ?")
    .bind(getUserIdFromToken(token))
    .first();
  
  return user;
}
```

### Secrets Management

Database credentials are managed automatically by Cloudflare and should never be exposed in your application code.

### Data Encryption

Sensitive data stored in the database should be encrypted:

```typescript
// Storing encrypted data
const encryptedData = encrypt(sensitiveData, env.ENCRYPTION_KEY);
await env.DB.prepare("UPDATE users SET sensitive_field = ? WHERE id = ?")
  .bind(encryptedData, userId)
  .run();

// Retrieving and decrypting data
const result = await env.DB.prepare("SELECT sensitive_field FROM users WHERE id = ?")
  .bind(userId)
  .first();
const decryptedData = decrypt(result.sensitive_field, env.ENCRYPTION_KEY);
```

## Monitoring and Maintenance

### Performance Monitoring

Monitor the performance of your database queries:

```typescript
// Log slow queries
const startTime = Date.now();
const result = await env.DB.prepare("SELECT * FROM sessions WHERE userId = ?")
  .bind(userId)
  .all();
const duration = Date.now() - startTime;

if (duration > 100) {
  console.warn(`Slow query detected: ${duration}ms`, { userId });
}
```

### Scheduled Maintenance

Use Cron Triggers to perform regular maintenance tasks:

```typescript
// In wrangler.json
{
  "triggers": {
    "crons": ["0 0 * * *"]
  }
}

// In your Worker
export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    // Perform database maintenance
    await env.DB.prepare("DELETE FROM expired_sessions WHERE timestamp < ?")
      .bind(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
      .run();
  }
}
```

## Reference Information

### Database Limits

D1 has the following limits:

- Maximum database size: 100GB
- Maximum row size: 1MB
- Maximum number of concurrent requests: Depends on your Workers plan

### Environment Variables

Environment-specific configuration can be managed through environment variables in your `wrangler.json` file:

```json
{
  "vars": {
    "DB_MAX_RESULTS": "100"
  },
  "env": {
    "development": {
      "vars": {
        "DB_MAX_RESULTS": "1000"
      }
    }
  }
}
```

Then use these variables in your code:

```typescript
const maxResults = parseInt(env.DB_MAX_RESULTS || "100", 10);
const { results } = await env.DB.prepare(`SELECT * FROM sessions LIMIT ${maxResults}`).all();
``` 