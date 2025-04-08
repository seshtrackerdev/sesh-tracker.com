/**
 * Kush.Observer Authentication Flow Test Worker
 * 
 * This Cloudflare Worker script tests the OAuth authentication flow between
 * Kush.Observer (OpenAuth provider) and Sesh-Tracker.com (client application).
 * 
 * Deploy this worker to test the integration in different environments.
 */

// Configuration options for different environments
const CONFIG = {
  development: {
    kushObserverBaseUrl: 'http://localhost:8787',
    seshTrackerBaseUrl: 'http://localhost:3000',
    clientId: 'seshtracker-dev',
    clientSecret: 'dev-secret',
    redirectUri: 'http://localhost:3000/api/auth/callback',
  },
  staging: {
    kushObserverBaseUrl: 'https://auth-staging.kush.observer',
    seshTrackerBaseUrl: 'https://staging.sesh-tracker.com',
    clientId: 'seshtracker-staging',
    clientSecret: 'staging-secret',
    redirectUri: 'https://staging.sesh-tracker.com/api/auth/callback',
  },
  production: {
    kushObserverBaseUrl: 'https://auth.kush.observer',
    seshTrackerBaseUrl: 'https://sesh-tracker.com',
    clientId: 'seshtracker',
    clientSecret: 'production-secret',
    redirectUri: 'https://sesh-tracker.com/api/auth/callback',
  }
};

// Test user credentials (for test environments only)
const TEST_USER = {
  username: 'test_user',
  password: 'test_password',
};

// Helper function to generate a random string for state and PKCE
function generateRandomString(length = 32) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// Helper function to generate code challenge from code verifier
async function generateCodeChallenge(codeVerifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Main worker handler
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Determine environment based on hostname or query parameter
    let environment = 'development';
    if (url.hostname.includes('staging')) {
      environment = 'staging';
    } else if (!url.hostname.includes('localhost') && !url.hostname.includes('127.0.0.1')) {
      environment = 'production';
    }
    
    // Allow override via query parameter
    const envParam = url.searchParams.get('env');
    if (envParam && ['development', 'staging', 'production'].includes(envParam)) {
      environment = envParam;
    }
    
    const config = CONFIG[environment];
    
    // Create a simple UI for test interactions
    if (path === '/' || path === '') {
      return new Response(renderTestUI(environment, config), {
        headers: { 'Content-Type': 'text/html' },
      });
    }
    
    // Start OAuth flow test
    if (path === '/start-auth-flow') {
      const state = generateRandomString();
      const codeVerifier = generateRandomString(43);
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      
      // Store state and code verifier in KV (or cookies in this demo)
      const cookieHeader = `state=${state}; path=/; max-age=600, code_verifier=${codeVerifier}; path=/; max-age=600`;
      
      // Build authorization URL with PKCE
      const authUrl = new URL(`${config.kushObserverBaseUrl}/oauth/authorize`);
      authUrl.searchParams.set('client_id', config.clientId);
      authUrl.searchParams.set('redirect_uri', config.redirectUri);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('state', state);
      authUrl.searchParams.set('code_challenge', codeChallenge);
      authUrl.searchParams.set('code_challenge_method', 'S256');
      
      return new Response(null, {
        status: 302,
        headers: {
          'Location': authUrl.toString(),
          'Set-Cookie': cookieHeader,
        },
      });
    }
    
    // Simulate callback endpoint for testing (normally this would be on Sesh-Tracker.com)
    if (path === '/simulate-callback') {
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      
      // In a real implementation, we would validate the state against what we stored
      if (!code) {
        return new Response('Error: No authorization code provided', { status: 400 });
      }
      
      try {
        // Extract code verifier from cookie (in a real app, this would be from session storage)
        const cookies = request.headers.get('Cookie') || '';
        const codeVerifierMatch = cookies.match(/code_verifier=([^;]+)/);
        const codeVerifier = codeVerifierMatch ? codeVerifierMatch[1] : null;
        
        if (!codeVerifier) {
          return new Response('Error: No code verifier found', { status: 400 });
        }
        
        // Exchange code for tokens
        const tokenResponse = await fetch(`${config.kushObserverBaseUrl}/oauth/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client_id: config.clientId,
            client_secret: config.clientSecret,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: config.redirectUri,
            code_verifier: codeVerifier,
          }),
        });
        
        const tokenData = await tokenResponse.json();
        
        if (!tokenResponse.ok) {
          return new Response(`Error exchanging code for tokens: ${JSON.stringify(tokenData)}`, { 
            status: 400,
            headers: { 'Content-Type': 'text/html' },
          });
        }
        
        // Fetch user information using the access token
        const userInfoResponse = await fetch(`${config.kushObserverBaseUrl}/api/userinfo`, {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
          },
        });
        
        const userData = await userInfoResponse.json();
        
        if (!userInfoResponse.ok) {
          return new Response(`Error fetching user data: ${JSON.stringify(userData)}`, { 
            status: 400,
            headers: { 'Content-Type': 'text/html' },
          });
        }
        
        // Display the successful authentication result
        return new Response(renderSuccessUI(tokenData, userData, environment), {
          headers: { 'Content-Type': 'text/html' },
        });
        
      } catch (error) {
        return new Response(`Error during token exchange: ${error.message}`, { 
          status: 500,
          headers: { 'Content-Type': 'text/plain' },
        });
      }
    }
    
    // Test token refresh flow
    if (path === '/test-token-refresh') {
      const refreshToken = url.searchParams.get('refresh_token');
      
      if (!refreshToken) {
        return new Response('Error: No refresh token provided', { status: 400 });
      }
      
      try {
        // Exchange refresh token for new access token
        const tokenResponse = await fetch(`${config.kushObserverBaseUrl}/oauth/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client_id: config.clientId,
            client_secret: config.clientSecret,
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
          }),
        });
        
        const tokenData = await tokenResponse.json();
        
        return new Response(JSON.stringify(tokenData, null, 2), {
          headers: { 'Content-Type': 'application/json' },
        });
        
      } catch (error) {
        return new Response(`Error during token refresh: ${error.message}`, { 
          status: 500,
          headers: { 'Content-Type': 'text/plain' },
        });
      }
    }
    
    // Token revocation test
    if (path === '/test-token-revocation') {
      const token = url.searchParams.get('token');
      const tokenType = url.searchParams.get('token_type') || 'access_token';
      
      if (!token) {
        return new Response('Error: No token provided', { status: 400 });
      }
      
      try {
        // Revoke the token
        const revokeResponse = await fetch(`${config.kushObserverBaseUrl}/oauth/revoke`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client_id: config.clientId,
            client_secret: config.clientSecret,
            token: token,
            token_type_hint: tokenType,
          }),
        });
        
        const revokeData = await revokeResponse.text();
        
        // Verify revocation by trying to use the token
        const verifyResponse = await fetch(`${config.kushObserverBaseUrl}/api/userinfo`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        const verifyData = await verifyResponse.json();
        
        return new Response(JSON.stringify({
          revoke_status: revokeResponse.status,
          revoke_response: revokeData,
          verify_status: verifyResponse.status,
          verify_response: verifyData,
        }, null, 2), {
          headers: { 'Content-Type': 'application/json' },
        });
        
      } catch (error) {
        return new Response(`Error during token revocation: ${error.message}`, { 
          status: 500,
          headers: { 'Content-Type': 'text/plain' },
        });
      }
    }
    
    // Endpoint information for debugging
    if (path === '/endpoints') {
      return new Response(JSON.stringify({
        environment,
        endpoints: {
          authorize: `${config.kushObserverBaseUrl}/oauth/authorize`,
          token: `${config.kushObserverBaseUrl}/oauth/token`,
          revoke: `${config.kushObserverBaseUrl}/oauth/revoke`,
          userinfo: `${config.kushObserverBaseUrl}/api/userinfo`,
          callback: config.redirectUri,
        }
      }, null, 2), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Default catch-all handler
    return new Response('Not found', { status: 404 });
  },
};

// HTML templates for the test UI
function renderTestUI(environment, config) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Kush.Observer Auth Flow Test</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          color: #333;
        }
        h1 {
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
          color: #111;
        }
        .card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          background-color: #f9f9f9;
        }
        .environment {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: bold;
          margin-left: 10px;
        }
        .environment.development {
          background-color: #e3f2fd;
          color: #0d47a1;
        }
        .environment.staging {
          background-color: #fff9c4;
          color: #f57f17;
        }
        .environment.production {
          background-color: #ffebee;
          color: #b71c1c;
        }
        button {
          background-color: #4CAF50;
          border: none;
          color: white;
          padding: 10px 20px;
          text-align: center;
          text-decoration: none;
          display: inline-block;
          font-size: 16px;
          margin: 4px 2px;
          cursor: pointer;
          border-radius: 4px;
        }
        button:hover {
          background-color: #45a049;
        }
        .config-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        .config-table th {
          text-align: left;
          padding: 8px;
          background-color: #f5f5f5;
          border: 1px solid #ddd;
        }
        .config-table td {
          padding: 8px;
          border: 1px solid #ddd;
        }
        .warning {
          color: #d32f2f;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <h1>Kush.Observer Auth Flow Test <span class="environment ${environment}">${environment}</span></h1>
      
      <div class="card">
        <h2>Current Configuration</h2>
        <table class="config-table">
          <tr>
            <th>Setting</th>
            <th>Value</th>
          </tr>
          <tr>
            <td>Kush.Observer URL</td>
            <td>${config.kushObserverBaseUrl}</td>
          </tr>
          <tr>
            <td>Sesh-Tracker URL</td>
            <td>${config.seshTrackerBaseUrl}</td>
          </tr>
          <tr>
            <td>Client ID</td>
            <td>${config.clientId}</td>
          </tr>
          <tr>
            <td>Redirect URI</td>
            <td>${config.redirectUri}</td>
          </tr>
        </table>
        
        <p>
          <a href="/endpoints" target="_blank">View detailed endpoint information</a>
        </p>
        
        ${environment === 'production' ? 
          '<p class="warning">Warning: You are testing against the production environment!</p>' : ''}
      </div>
      
      <div class="card">
        <h2>Test OAuth Authentication Flow</h2>
        <p>This will simulate the full OAuth flow with PKCE:</p>
        <ol>
          <li>Redirect to Kush.Observer's authorization endpoint</li>
          <li>Log in with test credentials (in non-production environments)</li>
          <li>Receive authorization code via redirect</li>
          <li>Exchange code for tokens</li>
          <li>Fetch user information with access token</li>
        </ol>
        <button onclick="location.href='/start-auth-flow'">Start Auth Flow Test</button>
      </div>
      
      <div class="card">
        <h2>Switch Environment</h2>
        <p>Switch the test environment:</p>
        <button onclick="location.href='/?env=development'">Development</button>
        <button onclick="location.href='/?env=staging'">Staging</button>
        <button onclick="location.href='/?env=production'">Production</button>
      </div>
    </body>
    </html>
  `;
}

function renderSuccessUI(tokenData, userData, environment) {
  const expiresIn = tokenData.expires_in || 3600;
  const expiryDate = new Date(Date.now() + (expiresIn * 1000)).toLocaleString();
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Authentication Successful</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          color: #333;
        }
        h1 {
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
          color: #111;
        }
        .success-icon {
          color: #4CAF50;
          font-size: 48px;
          margin-bottom: 20px;
        }
        .card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          background-color: #f9f9f9;
        }
        .token-display {
          background-color: #f5f5f5;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 10px;
          overflow-x: auto;
          word-break: break-all;
          margin-bottom: 10px;
        }
        button {
          background-color: #2196F3;
          border: none;
          color: white;
          padding: 10px 20px;
          text-align: center;
          text-decoration: none;
          display: inline-block;
          font-size: 16px;
          margin: 4px 2px;
          cursor: pointer;
          border-radius: 4px;
        }
        button:hover {
          background-color: #0b7dda;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          text-align: left;
          padding: 8px;
          border-bottom: 1px solid #ddd;
        }
        th {
          background-color: #f5f5f5;
        }
      </style>
    </head>
    <body>
      <h1>Authentication Successful <span style="color: #4CAF50;">✓</span></h1>
      
      <div class="card">
        <h2>User Information</h2>
        <table>
          <tr>
            <th>Property</th>
            <th>Value</th>
          </tr>
          ${Object.entries(userData).map(([key, value]) => `
            <tr>
              <td>${key}</td>
              <td>${typeof value === 'object' ? JSON.stringify(value) : value}</td>
            </tr>
          `).join('')}
        </table>
      </div>
      
      <div class="card">
        <h2>Token Information</h2>
        <p><strong>Access Token:</strong></p>
        <div class="token-display">${tokenData.access_token}</div>
        
        <p><strong>Token Type:</strong> ${tokenData.token_type}</p>
        <p><strong>Expires In:</strong> ${expiresIn} seconds (${expiryDate})</p>
        
        ${tokenData.refresh_token ? `
          <p><strong>Refresh Token:</strong></p>
          <div class="token-display">${tokenData.refresh_token}</div>
        ` : ''}
        
        ${tokenData.scope ? `<p><strong>Scopes:</strong> ${tokenData.scope}</p>` : ''}
      </div>
      
      <div class="card">
        <h2>Test Additional Flows</h2>
        
        ${tokenData.refresh_token ? `
          <button onclick="testRefreshToken('${tokenData.refresh_token}')">Test Token Refresh</button>
        ` : ''}
        
        <button onclick="testTokenRevocation('${tokenData.access_token}', 'access_token')">Revoke Access Token</button>
        
        ${tokenData.refresh_token ? `
          <button onclick="testTokenRevocation('${tokenData.refresh_token}', 'refresh_token')">Revoke Refresh Token</button>
        ` : ''}
        
        <button onclick="location.href='/'">Back to Test Home</button>
      </div>
      
      <div id="result-container" class="card" style="display: none;">
        <h2>Test Result</h2>
        <pre id="result-content" style="white-space: pre-wrap; background-color: #f5f5f5; padding: 10px; border-radius: 4px;"></pre>
      </div>
      
      <script>
        async function testRefreshToken(refreshToken) {
          const resultContainer = document.getElementById('result-container');
          const resultContent = document.getElementById('result-content');
          resultContainer.style.display = 'block';
          resultContent.textContent = 'Loading...';
          
          try {
            const response = await fetch(\`/test-token-refresh?refresh_token=\${refreshToken}\`);
            const data = await response.json();
            resultContent.textContent = JSON.stringify(data, null, 2);
          } catch (error) {
            resultContent.textContent = \`Error: \${error.message}\`;
          }
        }
        
        async function testTokenRevocation(token, tokenType) {
          const resultContainer = document.getElementById('result-container');
          const resultContent = document.getElementById('result-content');
          resultContainer.style.display = 'block';
          resultContent.textContent = 'Loading...';
          
          try {
            const response = await fetch(\`/test-token-revocation?token=\${token}&token_type=\${tokenType}\`);
            const data = await response.json();
            resultContent.textContent = JSON.stringify(data, null, 2);
          } catch (error) {
            resultContent.textContent = \`Error: \${error.message}\`;
          }
        }
      </script>
    </body>
    </html>
  `;
} 