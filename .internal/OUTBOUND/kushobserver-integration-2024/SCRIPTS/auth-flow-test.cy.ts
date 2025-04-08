// Cypress end-to-end test for validating the Kush.Observer authentication flow
// Based on Cloudflare OpenAuth template implementation

describe('Kush.Observer Authentication Flow (Cloudflare OpenAuth)', () => {
  // We'll use environment variables for test credentials
  // These should be set in cypress.env.json or via CI/CD variables
  const testEmail = Cypress.env('TEST_USER_EMAIL') || 'tester@email.com';
  const testPassword = Cypress.env('TEST_USER_PASSWORD') || 'Superbowl9-Veggie0-Credit4-Watch1';
  
  beforeEach(() => {
    // Clear cookies and local storage before each test
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Intercept auth API calls to monitor the flow
    cy.intercept('POST', '**/auth/token').as('tokenRequest');
    cy.intercept('POST', '**/auth/verify').as('verifyToken');
    cy.intercept('GET', '**/auth/userinfo').as('getUserInfo');
    cy.intercept('GET', '**/api/users/me').as('getUserProfile');
  });

  it('should successfully authenticate through Kush.Observer OpenAuth', () => {
    // 1. Visit the home page
    cy.visit('/');
    cy.contains('Log In').click();
    
    // 2. Should redirect to Kush.Observer authorization page
    cy.url().should('include', 'kush.observer/auth/authorize');
    cy.url().should('include', 'client_id=sesh-tracker-dashboard');
    cy.url().should('include', 'response_type=code');
    
    // 3. Complete login form on Kush.Observer
    cy.origin('https://kush.observer', () => {
      const testEmail = Cypress.env('TEST_USER_EMAIL') || 'tester@email.com';
      const testPassword = Cypress.env('TEST_USER_PASSWORD') || 'Superbowl9-Veggie0-Credit4-Watch1';
      
      // Login form
      cy.get('[data-testid="email-input"]').type(testEmail);
      cy.get('[data-testid="password-input"]').type(testPassword, { log: false });
      cy.get('[data-testid="login-button"]').click();
      
      // Handle consent screen if it appears (first-time login)
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="consent-button"]').length > 0) {
          cy.get('[data-testid="consent-button"]').click();
        }
      });
    });
    
    // 4. Should redirect back to Sesh-Tracker.com
    cy.url().should('include', 'sesh-tracker.com');
    
    // 5. Should exchange the auth code for tokens
    cy.wait('@tokenRequest').then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      expect(interception.response.body).to.have.property('access_token');
      expect(interception.response.body).to.have.property('refresh_token');
      expect(interception.response.body).to.have.property('id_token');
    });
    
    // 6. Should verify the token
    cy.wait('@verifyToken').its('response.statusCode').should('eq', 200);
    
    // 7. Should fetch user info from OpenID Connect endpoint
    cy.wait('@getUserInfo').then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      expect(interception.response.body).to.have.property('sub');
      expect(interception.response.body).to.have.property('email', testEmail);
    });
    
    // 8. Dashboard should be visible and user should be logged in
    cy.contains('Welcome').should('be.visible');
    cy.contains(testEmail).should('be.visible');
  });

  it('should maintain authentication state after page reload', () => {
    // 1. Log in first using custom command
    cy.loginViaKushObserver(testEmail, testPassword);
    
    // 2. Reload the page
    cy.reload();
    
    // 3. Should still be authenticated
    cy.wait('@verifyToken').its('response.statusCode').should('eq', 200);
    cy.contains('Welcome').should('be.visible');
  });

  it('should handle token refresh when expired', () => {
    // 1. Log in first
    cy.loginViaKushObserver(testEmail, testPassword);
    
    // 2. Simulate token expiration by modifying the stored token
    cy.window().then((win) => {
      // This assumes you store tokens in localStorage in a specific format
      // Adjust according to your actual implementation
      const authData = JSON.parse(win.localStorage.getItem('auth') || '{}');
      authData.expiresAt = Date.now() - 10000; // expired 10 seconds ago
      win.localStorage.setItem('auth', JSON.stringify(authData));
    });
    
    // 3. Make an authenticated request that should trigger refresh
    cy.visit('/dashboard');
    
    // 4. Should see token refresh request with refresh_token
    cy.intercept('POST', '**/auth/token').as('refreshToken');
    cy.wait('@refreshToken').then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      expect(interception.request.body).to.include('grant_type=refresh_token');
    });
    
    // 5. Should still show dashboard after refresh
    cy.contains('Dashboard').should('be.visible');
  });

  it('should correctly handle logout', () => {
    // 1. Log in first
    cy.loginViaKushObserver(testEmail, testPassword);
    
    // 2. Verify we're logged in
    cy.contains('Welcome').should('be.visible');
    
    // 3. Click logout and intercept the logout request
    cy.intercept('POST', '**/auth/logout').as('logoutRequest');
    cy.contains('Log Out').click();
    
    // 4. Verify logout request was made
    cy.wait('@logoutRequest').its('response.statusCode').should('eq', 200);
    
    // 5. Should be logged out
    cy.contains('Log In').should('be.visible');
    
    // 6. Should not be able to access protected routes
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
  });

  it('should handle authorization errors gracefully', () => {
    // 1. Simulate an authorization error by redirecting with an error
    cy.visit('/api/auth/callback?error=access_denied&error_description=User+rejected+the+request');
    
    // 2. Should show an error message
    cy.contains('Authorization Error').should('be.visible');
    cy.contains('access_denied').should('be.visible');
    
    // 3. Should provide a way to retry
    cy.contains('Try Again').should('be.visible').click();
    
    // 4. Should redirect back to login
    cy.url().should('include', '/login');
  });
});

// Custom command for login flow
Cypress.Commands.add('loginViaKushObserver', (email, password) => {
  cy.visit('/login');
  
  // Authorize endpoint should be called
  cy.url().should('include', 'kush.observer/auth/authorize');
  
  // Login on Kush.Observer
  cy.origin('https://kush.observer', () => {
    const testEmail = Cypress.env('TEST_USER_EMAIL') || 'tester@email.com';
    const testPassword = Cypress.env('TEST_USER_PASSWORD') || 'Superbowl9-Veggie0-Credit4-Watch1';
    
    cy.get('[data-testid="email-input"]').type(testEmail);
    cy.get('[data-testid="password-input"]').type(testPassword, { log: false });
    cy.get('[data-testid="login-button"]').click();
    
    // Handle consent screen if it appears
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="consent-button"]').length > 0) {
        cy.get('[data-testid="consent-button"]').click();
      }
    });
  });
  
  // Wait for redirect and auth completion
  cy.url().should('include', 'sesh-tracker.com');
  cy.contains('Welcome').should('be.visible');
});

// Add TypeScript support for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      loginViaKushObserver(email: string, password: string): Chainable<void>;
    }
  }
} 