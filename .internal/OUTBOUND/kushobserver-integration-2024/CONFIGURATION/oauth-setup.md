# OAuth 2.0 Setup Guide for Kush.Observer (Cloudflare OpenAuth)

This guide details the OAuth 2.0 configuration required to connect the Kush.Observer authentication system (based on Cloudflare's OpenAuth template) with Sesh-Tracker.com.

## Cloudflare OpenAuth Template Configuration

Kush.Observer is built using Cloudflare's OpenAuth template, which provides a universal framework for managing user authentication with OAuth 2.0 and OpenID Connect capabilities.

### 1. Client Registration in D1 Database

```sql
-- Add client to the oauth_clients table in D1
INSERT INTO oauth_clients 
(client_id, client_name, client_uri, logo_uri, redirect_uris, grant_types, response_types, token_endpoint_auth_method, scope)
VALUES
(
  'sesh-tracker-dashboard', 
  'Sesh-Tracker Dashboard',
  'https://sesh-tracker.com',
  'https://sesh-tracker.com/logo.png',
  '[
    "https://sesh-tracker.com/api/auth/callback",
    "https://staging.sesh-tracker.com/api/auth/callback",
    "http://localhost:3000/api/auth/callback"
  ]',
  '["authorization_code", "refresh_token"]',
  '["code"]',
  'client_secret_post',
  'openid profile email offline_access'
);
```

### 2. Token Configuration

Configure the following token settings in the Cloudflare Worker environment:

- **Access Token Format**: JWT (signed with RS256)
- **Access Token Lifetime**: 3600 seconds (1 hour)
- **Refresh Token Lifetime**: 604800 seconds (7 days)
- **ID Token Format**: JWT (signed with RS256)

These can be configured in the `wrangler.json` file:

```json
{
  "vars": {
    "TOKEN_EXPIRATION_ACCESS": "3600",
    "TOKEN_EXPIRATION_REFRESH": "604800",
    "TOKEN_SIGNING_ALG": "RS256"
  }
}
```

### 3. JWT Claims Configuration

The access token should include these standard claims, which are automatically managed by the OpenAuth template:

```json
{
  "iss": "https://kush.observer",
  "sub": "user_id",
  "aud": "sesh-tracker-dashboard",
  "exp": 1600000000,
  "iat": 1599996400,
  "auth_time": 1599996400,
  "azp": "sesh-tracker-dashboard",
  "scope": "openid profile email offline_access",
  "role": "user|admin",
  "email": "user@example.com"
}
```

## Cloudflare Worker API Endpoints

### 1. Authorization Endpoint

```
GET /auth/authorize
```

Query Parameters:
- `client_id`: Sesh-Tracker client ID
- `redirect_uri`: Must match one of the registered URIs
- `response_type`: "code"
- `scope`: "openid profile email offline_access"
- `state`: CSRF protection token
- `nonce`: Replay protection value

### 2. Token Endpoint

```
POST /auth/token
```

Form Parameters:
- `grant_type`: "authorization_code" or "refresh_token"
- `client_id`: Sesh-Tracker client ID
- `client_secret`: Sesh-Tracker client secret
- `code`: (For authorization_code) The code from the authorization response
- `refresh_token`: (For refresh_token) The refresh token
- `redirect_uri`: (For authorization_code) Must match the original request

### 3. Token Verification Endpoint

```
POST /auth/verify
```

JSON Body:
- `token`: The access token to verify

Response should include:
- `active`: Boolean indicating if token is valid
- `user`: User information object if token is valid

### 4. User Info Endpoint

```
GET /auth/userinfo
```

Headers:
- `Authorization`: Bearer {access_token}

Response:
- Standard OIDC claims for the authenticated user

### 5. Logout Endpoint

```
POST /auth/logout
```

JSON Body:
- `token`: The access token to invalidate
- `refresh_token`: (Optional) The refresh token to invalidate

## Cloudflare Workers CORS Configuration

Ensure your Cloudflare Worker has the following CORS configuration in the `index.ts` file:

```typescript
// CORS middleware configuration
app.use('*', cors({
  origin: (origin) => {
    const allowedOrigins = [
      'https://sesh-tracker.com', 
      'https://staging.sesh-tracker.com', 
      'http://localhost:3000'
    ];
    
    // Check for subdomains
    if (origin && (
      origin.endsWith('.sesh-tracker.com') || 
      origin.match(/^http:\/\/localhost:[0-9]+$/)
    )) {
      return origin;
    }
    
    return allowedOrigins.includes(origin) ? origin : null;
  },
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length', 'X-Request-ID'],
  maxAge: 86400,
  credentials: true
}));
```

## Testing the OAuth Flow

1. Start authentication with:
   ```
   GET https://kush.observer/auth/authorize?client_id=sesh-tracker-dashboard&redirect_uri=https://sesh-tracker.com/api/auth/callback&response_type=code&scope=openid+profile+email+offline_access&state=random_state_value
   ```

2. After user authenticates, handle callback with code:
   ```
   POST https://kush.observer/auth/token
   Content-Type: application/x-www-form-urlencoded

   grant_type=authorization_code&client_id=sesh-tracker-dashboard&client_secret=CLIENT_SECRET&code=CODE_FROM_CALLBACK&redirect_uri=https://sesh-tracker.com/api/auth/callback
   ```

3. Verify returned token:
   ```
   POST https://kush.observer/auth/verify
   Content-Type: application/json

   {
     "token": "ACCESS_TOKEN_FROM_PREVIOUS_STEP"
   }
   ```

## Cloudflare D1 Database Setup

Ensure your D1 database has been properly initialized with the authentication schema:

```bash
# Apply migrations to set up the database schema
npx wrangler d1 migrations apply --remote kushAuthD1
```

## Test Account Configuration

For integration testing, ensure these test accounts are created in the D1 database:

```sql
-- Add test accounts
INSERT INTO users 
(email, password_hash, display_name, role, account_type, subscription_tier, created_at, updated_at) 
VALUES 
(
  'tester@email.com', 
  '$argon2id$v=19$m=16,t=2,p=1$dGVzdHNhbHQ$HYXKCt0HJz4eXDj0SYVlCg', -- Hashed password: Superbowl9-Veggie0-Credit4-Watch1
  'Test User',
  'user',
  'test',
  'premium',
  datetime('now'),
  datetime('now')
),
(
  'demouser1@email.com', 
  '$argon2id$v=19$m=16,t=2,p=1$ZGVtb3NhbHQ$k5CL68yI18NUwwLsKHp9BA', -- Hashed password: Hurry3-Sweat0-Dynamic0-Economist0
  'Demo User',
  'user',
  'demo',
  'premium',
  datetime('now'),
  datetime('now')
);
```

## Security Best Practices for Cloudflare Implementation

1. **Client Secrets**: Store in Cloudflare Worker Secrets
   ```bash
   npx wrangler secret put CLIENT_SECRET_SESHTRACKER
   ```

2. **HTTPS Only**: Ensure all endpoints are only accessible via HTTPS

3. **JWT Validation**: Properly verify signatures using JWKS from the trusted source

4. **CSRF Protection**: Implement state parameter verification for all authorization flows

5. **Secret Rotation**: Set up a schedule to rotate client secrets and signing keys

6. **Token Revocation**: Implement proper session invalidation in the KV store 