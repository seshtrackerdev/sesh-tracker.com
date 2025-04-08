import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react'; // Using lucide-react for icons
import { Button } from '../ui'; // Import from the ui directory index file
import { useAuth } from '../../hooks/useAuth';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Get authentication status from useAuth hook
  const isAuthenticated = !!user;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Branding/Logo with gradient */}
        <div className="navbar-brand">
          <Link to="/">
            <span className="brand-gradient">Sesh</span>
            -Tracker.com
          </Link>
        </div>

        {/* Menu Toggle Button (Always Visible) */}
        <div className="navbar-toggle">
          {/* Use a Button component for the toggle for consistency, styling as ghost/icon */}
          <Button 
             variant="ghost" 
             size="md"
             onClick={toggleMenu} 
             aria-label="Toggle menu"
             aria-expanded={isMenuOpen} // Add aria-expanded
           >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Menu Dropdown (Shown when isMenuOpen is true) */}
      {isMenuOpen && (
        <div className="navbar-menu">
          <div className="navbar-links">
             {/* Use Button with link variant or asChild for nav links */}
             <Link to="/" className="nav-menu-link" onClick={() => setIsMenuOpen(false)}>Home</Link>
             {isAuthenticated && (
               <>
                 <Link to="/dashboard" className="nav-menu-link" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                 <Link to="/wellness" className="nav-menu-link" onClick={() => setIsMenuOpen(false)}>Wellness</Link>
               </>
             )}
             <Link to="/support" className="nav-menu-link" onClick={() => setIsMenuOpen(false)}>Support / Contact</Link>
             <Link to="/ui-components" className="nav-menu-link" onClick={() => setIsMenuOpen(false)}>UI Components</Link>
             <Link to="/components/tags" className="nav-menu-link" onClick={() => setIsMenuOpen(false)}>Tags Showcase</Link>
             {/* Add other primary nav links here if needed */}
          </div>
          
          {/* Divider */}
          <div className="menu-divider"></div>
          
          <div className="navbar-actions">
            {isAuthenticated ? (
              // Show user-specific actions if logged in
              <>
                <div className="text-sm text-gray-600 mb-2">
                  Signed in as: {user.displayName}
                </div>
                <Button 
                  variant="outline" 
                  size="md" 
                  fullWidth 
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                >
                  Log Out
                </Button>
              </>
            ) : (
              // Show Log In / Sign Up if logged out
              <>
                <Button variant="secondary" size="md" fullWidth>Log In</Button>
                <Button variant="primary" size="md" fullWidth>Sign Up</Button>
              </>
            )}
          </div>
          
          {/* Divider */}
          <div className="menu-divider"></div>
          
          {/* Switch to Classic Button - Using Button component with custom class */}
          <Link to="/classic" className="nav-menu-link btn-switch-classic" onClick={() => setIsMenuOpen(false)}>
              Switch to Classic
          </Link>
        </div>
      )}
    </nav>
  );
} 