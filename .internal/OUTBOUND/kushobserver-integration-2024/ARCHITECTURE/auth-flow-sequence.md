# OAuth Authentication Flow Sequence (Cloudflare Implementation)

This document provides a sequence diagram that illustrates the authentication flow between Sesh-Tracker.com and Kush.Observer, implemented on Cloudflare Workers.

## OAuth 2.0 Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant ST as Sesh-Tracker.com<br>(Client)
    participant KO as Kush.Observer<br>(Auth Server)
    participant D1 as Cloudflare D1<br>Database
    participant KV as Cloudflare KV<br>Storage

    Note over U,KV: Initial Authentication Flow
    U->>ST: 1. Clicks "Login with Kush.Observer"
    ST->>ST: 2. Generates state, code_verifier,<br>code_challenge
    ST->>KV: 3. Stores state and code_verifier
    ST->>U: 4. Redirects to Kush.Observer authorization URL<br>with client_id, redirect_uri, state, code_challenge
    U->>KO: 5. Arrives at Kush.Observer login page
    KO->>U: 6. Presents login form
    U->>KO: 7. Enters credentials
    KO->>D1: 8. Validates credentials
    D1->>KO: 9. Returns user profile if valid
    KO->>KO: 10. Generates authorization code
    KO->>U: 11. Redirects back to redirect_uri<br>with authorization code and state
    U->>ST: 12. Arrives at callback URL with code and state
    ST->>KV: 13. Retrieves and validates state,<br>fetches code_verifier
    ST->>KO: 14. Exchanges code+code_verifier for tokens<br>(POST to /oauth/token)
    KO->>D1: 15. Validates code and client credentials
    D1->>KO: 16. Returns validation result
    KO->>KO: 17. Generates access and refresh tokens
    KO->>ST: 18. Returns tokens and expiration time
    ST->>KV: 19. Stores tokens securely with expiry
    ST->>KO: 20. Requests user profile with access token
    KO->>ST: 21. Returns user profile data
    ST->>ST: 22. Creates/updates local user session
    ST->>U: 23. Completes login and redirects to dashboard

    Note over U,KV: Token Refresh Flow
    ST->>ST: 24. Detects access token near expiry
    ST->>KV: 25. Retrieves refresh token
    ST->>KO: 26. Requests new access token<br>(POST to /oauth/token with grant_type=refresh_token)
    KO->>D1: 27. Validates refresh token
    D1->>KO: 28. Returns validation result
    KO->>KO: 29. Generates new access token (and possibly refresh token)
    KO->>ST: 30. Returns new tokens and expiration
    ST->>KV: 31. Updates stored tokens

    Note over U,KV: Logout Flow
    U->>ST: 32. Clicks "Logout"
    ST->>KV: 33. Retrieves tokens
    ST->>KO: 34. Requests token revocation<br>(POST to /oauth/revoke)
    KO->>D1: 35. Invalidates tokens
    KO->>ST: 36. Confirms revocation
    ST->>KV: 37. Removes tokens and session
    ST->>U: 38. Redirects to logged out page
```

## Cloudflare Workers Implementation Notes

### D1 Database Usage

- User accounts and credentials are stored in Cloudflare D1
- OAuth clients and their configurations are stored in D1
- Authorization codes and tokens are stored with appropriate TTL

### KV Storage Usage

- Session states are stored in Cloudflare KV with appropriate TTL
- PKCE code verifiers are temporarily stored in KV
- Access tokens can be stored in KV for quick validation with appropriate TTL

### Authentication Endpoints

| Endpoint | Purpose | Notes |
|----------|---------|-------|
| `/oauth/authorize` | Initiates OAuth flow | Validates client_id, redirect_uri, and generates authorization code |
| `/oauth/token` | Exchanges code for tokens | Supports authorization_code and refresh_token grant types |
| `/oauth/revoke` | Revokes tokens | Invalidates access and refresh tokens |
| `/api/userinfo` | Returns user profile | Requires valid access token with appropriate scope |

### Environment Variables Required

| Variable | Purpose |
|----------|---------|
| `OAUTH_CLIENTS` | JSON array of registered OAuth clients |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `COOKIE_SECRET` | Secret for signing cookies |

### Error Handling

- All errors are returned with appropriate HTTP status codes and JSON bodies
- Error responses include `error` and `error_description` fields per OAuth 2.0 spec
- Rate limiting is applied to prevent brute force attacks

## Implementation Flowchart

```mermaid
flowchart TD
    subgraph "Kush.Observer Cloudflare Worker"
        A[Worker Entry Point] --> B{Route Request}
        B -->|/oauth/authorize| C[Authorization Endpoint]
        B -->|/oauth/token| D[Token Endpoint]
        B -->|/oauth/revoke| E[Revocation Endpoint]
        B -->|/api/userinfo| F[User Info Endpoint]
        
        C --> G[Verify Client]
        G --> H[Render Login UI]
        H --> I[Process Login]
        I --> J[Generate Auth Code]
        J --> K[Redirect to Client]
        
        D --> L[Validate Token Request]
        L --> M{Grant Type?}
        M -->|authorization_code| N[Exchange Code]
        M -->|refresh_token| O[Refresh Token]
        N --> P[Generate Tokens]
        O --> P
        P --> Q[Return Tokens]
        
        E --> R[Revoke Token]
        R --> S[Confirm Revocation]
        
        F --> T[Verify Access Token]
        T --> U[Return User Data]
    end
    
    subgraph "D1 Database"
        DB[(User DB)]
        TokenDB[(Token DB)]
        ClientDB[(Client DB)]
    end
    
    subgraph "KV Storage"
        KV1[(Session KV)]
        KV2[(Token KV)]
    end
    
    I --> DB
    L --> ClientDB
    N --> TokenDB
    O --> TokenDB
    R --> TokenDB
    T --> KV2
    T -.-> TokenDB
```

## Security Considerations

1. **PKCE Implementation**: Always use PKCE (Proof Key for Code Exchange) to prevent authorization code interception attacks.
2. **Token Storage**: Store tokens securely in KV with appropriate TTL.
3. **HTTPS Only**: All communications must use HTTPS.
4. **State Parameter**: Always validate the state parameter to prevent CSRF attacks.
5. **Short-lived Tokens**: Configure access tokens with short lifetimes (e.g., 1 hour).
6. **Scoped Access**: Implement and enforce token scopes.

## Monitoring and Analytics

- Use Cloudflare Analytics to monitor authentication attempts and failures
- Set up alerts for suspicious activity patterns
- Track token usage and refresh patterns

---

This sequence diagram provides a comprehensive overview of the OAuth 2.0 authentication flow between Sesh-Tracker.com and Kush.Observer, implemented using Cloudflare Workers, D1 database, and KV storage. 