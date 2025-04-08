import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/auth/LoginPage.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, loading: authLoading, error: authError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Get redirect path from location state if available
  const from = location.state?.from || '/dashboard';

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  // Update error message from auth provider
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // The useAuth hook will handle storing tokens and updating context
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // For demo accounts
  const loginWithTestAccount = () => {
    setEmail('tester@email.com');
    setPassword('Superbowl9-Veggie0-Credit4-Watch1');
  };

  const loginWithDemoAccount = () => {
    setEmail('demouser1@email.com');
    setPassword('Hurry3-Sweat0-Dynamic0-Economist0');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Welcome Back</h1>
        <p className="login-subtitle">Sign in to your Sesh-Tracker account</p>

        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          
          <button 
            type="submit" 
            className="login-button" 
            disabled={loading || authLoading}
          >
            {loading || authLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="demo-accounts">
          <p>Quick Login:</p>
          <div className="demo-buttons">
            <button 
              type="button" 
              className="demo-button" 
              onClick={loginWithTestAccount}
            >
              Test Account
            </button>
            <button 
              type="button" 
              className="demo-button" 
              onClick={loginWithDemoAccount}
            >
              Demo Account
            </button>
          </div>
        </div>
        
        <div className="login-footer">
          <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 