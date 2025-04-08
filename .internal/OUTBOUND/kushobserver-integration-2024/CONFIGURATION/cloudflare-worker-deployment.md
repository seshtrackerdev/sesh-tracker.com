# Cloudflare Worker Deployment Guide for Kush.Observer

This guide outlines the deployment process for the Kush.Observer OpenAuth authentication service on Cloudflare Workers. This document provides step-by-step instructions for setting up the development environment, configuring the Worker, and deploying to production.

## Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- Cloudflare account with Workers Paid subscription (for D1 database)
- Domain added to Cloudflare (kush.observer)

## Initial Setup

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Authenticate with Cloudflare

```bash
wrangler login
```

Follow the browser prompts to authorize the Wrangler CLI.

## Project Structure

The Kush.Observer OpenAuth service follows the [Cloudflare OpenAuth Template](https://github.com/cloudflare/worker-openauth). The project structure should look like:

```
kush-observer-openauth/
├── .dev.vars         # Local development environment variables
├── .gitignore
├── package.json
├── tsconfig.json
├── wrangler.toml     # Cloudflare Worker configuration
├── src/
│   ├── index.ts      # Entry point
│   ├── auth/         # Authentication logic
│   ├── db/           # Database interactions
│   ├── middleware/   # Middleware functions
│   ├── models/       # Data models
│   ├── routes/       # API routes
│   ├── utils/        # Utility functions
│   └── views/        # HTML templates
└── migrations/       # D1 database migrations
```

## Environment Configuration

### 1. Local Development Variables

Create a `.dev.vars` file for local development:

```
# OAuth Configuration
JWT_SECRET=your_development_jwt_secret
COOKIE_SECRET=your_development_cookie_secret

# Client Configuration (JSON string)
OAUTH_CLIENTS=[{"client_id":"seshtracker","client_secret":"dev_secret","redirect_uris":["http://localhost:3000/api/auth/callback"],"name":"Sesh-Tracker (Dev)"}]

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://sesh-tracker.com
```

### 2. Configure wrangler.toml

```toml
name = "kush-observer-openauth"
main = "src/index.ts"
compatibility_date = "2023-10-16"
node_compat = true

[vars]
ENVIRONMENT = "production"

# D1 Database
[[d1_databases]]
binding = "DB"
database_name = "kush_observer_auth"
database_id = "your_database_id"

# KV Namespaces
[[kv_namespaces]]
binding = "AUTH_STORE"
id = "your_kv_namespace_id"
```

## Database Setup

### 1. Create D1 Database

```bash
wrangler d1 create kush_observer_auth
```

Take note of the database ID and update your `wrangler.toml` file.

### 2. Create KV Namespace

```bash
wrangler kv:namespace create "AUTH_STORE"
```

Take note of the KV namespace ID and update your `wrangler.toml` file.

### 3. Create Database Schema

Create a migration file in the `migrations` directory:

```sql
-- migrations/0000_initial_schema.sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT UNIQUE,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  metadata TEXT
);

CREATE TABLE oauth_clients (
  client_id TEXT PRIMARY KEY,
  client_secret TEXT NOT NULL,
  redirect_uris TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE oauth_authorization_codes (
  code TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  redirect_uri TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  code_challenge TEXT,
  code_challenge_method TEXT,
  scope TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (client_id) REFERENCES oauth_clients(client_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE oauth_tokens (
  token_id TEXT PRIMARY KEY,
  access_token TEXT UNIQUE NOT NULL,
  refresh_token TEXT UNIQUE,
  client_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  scope TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (client_id) REFERENCES oauth_clients(client_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes for performance
CREATE INDEX idx_oauth_tokens_access_token ON oauth_tokens(access_token);
CREATE INDEX idx_oauth_tokens_refresh_token ON oauth_tokens(refresh_token);
CREATE INDEX idx_oauth_authorization_codes_code ON oauth_authorization_codes(code);
```

### 4. Apply Migrations

```bash
wrangler d1 execute kush_observer_auth --file=./migrations/0000_initial_schema.sql
```

## Secrets Management

### 1. Configure Production Secrets

```bash
wrangler secret put JWT_SECRET
# Enter your production JWT secret when prompted

wrangler secret put COOKIE_SECRET
# Enter your production cookie secret when prompted

wrangler secret put OAUTH_CLIENTS
# Enter your JSON-formatted OAuth clients configuration
```

## Deployment

### 1. Development Deployment

For local testing with the actual D1 database:

```bash
wrangler dev --remote
```

For completely local testing with local storage:

```bash
wrangler dev
```

### 2. Production Deployment

```bash
wrangler deploy
```

## Custom Domain Configuration

### 1. Add Custom Domain in Cloudflare Dashboard

1. Navigate to your Worker in the Cloudflare dashboard
2. Go to the "Triggers" tab
3. Under "Custom Domains", click "Add Custom Domain"
4. Enter `auth.kush.observer` (or your preferred subdomain)
5. Complete the domain setup process

### 2. Update DNS Settings

Ensure that the DNS settings for your domain point to Cloudflare's nameservers and that the appropriate CNAME or A records are set up for the subdomain.

## Post-Deployment Verification

### 1. Test OAuth Endpoints

Verify that the following endpoints are working:

- `https://auth.kush.observer/oauth/authorize`
- `https://auth.kush.observer/oauth/token`
- `https://auth.kush.observer/oauth/revoke`
- `https://auth.kush.observer/api/userinfo`

### 2. Monitor Logs and Analytics

After deployment, monitor the Worker's logs and analytics in the Cloudflare dashboard to ensure everything is functioning correctly and to identify any potential issues.

## Maintenance and Updates

### 1. Update Dependencies

Regularly update dependencies to ensure security and stability:

```bash
npm update
```

### 2. Deploy Updates

After making changes to the codebase:

```bash
wrangler deploy
```

### 3. Database Migrations

For schema changes, create new migration files and apply them:

```bash
wrangler d1 execute kush_observer_auth --file=./migrations/0001_your_migration.sql
```

## Troubleshooting

### Common Issues

1. **Worker Exceeding CPU Limits**
   - Check for inefficient code or infinite loops
   - Consider optimizing database queries

2. **D1 Database Connection Issues**
   - Verify database binding in wrangler.toml
   - Check that migrations have been applied

3. **Authentication Failures**
   - Verify JWT_SECRET is correctly set
   - Check that client credentials match in both services

### Debug Mode

Enable debug mode by setting the `DEBUG` environment variable:

```bash
wrangler secret put DEBUG
# Enter "true" when prompted
```

This will enable more verbose logging in the Worker.

## Additional Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [OAuth 2.0 Specification](https://oauth.net/2/)
- [Cloudflare Worker OpenAuth Template](https://github.com/cloudflare/worker-openauth)

---

This deployment guide provides comprehensive instructions for setting up and deploying the Kush.Observer OpenAuth service on Cloudflare Workers. For questions or assistance, please contact the development team. 