import React, { useState } from 'react';

interface WelcomeHeaderProps {
  username?: string;
  lastSession?: {
    date: string;
    strain?: string;
  };
  notifications?: {
    lowInventory?: {
      strain: string;
      count: number;
    }[];
    systemNotifications?: string[];
  };
}

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({
  username = "[user]",
  lastSession = { date: "Not available" },
  notifications = {}
}) => {
  // Add state for notification panel visibility
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Toggle notification panel visibility
  const toggleNotifications = () => {
    setShowNotifications(prev => !prev);
  };

  // Calculate if any special dates are coming up
  const today = new Date();
  const april20 = new Date(today.getFullYear(), 3, 20); // Month is 0-indexed
  const july10 = new Date(today.getFullYear(), 6, 10);
  
  // If the date has passed this year, set it for next year
  if (today > april20) april20.setFullYear(april20.getFullYear() + 1);
  if (today > july10) july10.setFullYear(july10.getFullYear() + 1);
  
  // Calculate days until the next upcoming event
  const daysUntilApril20 = Math.ceil((april20.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const daysUntilJuly10 = Math.ceil((july10.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // Determine if we should show an event reminder (within 30 days)
  const showApril20 = daysUntilApril20 <= 30;
  const showJuly10 = daysUntilJuly10 <= 30;
  
  // Choose which reminder to show (the closest one)
  let eventReminder = null;
  if (showApril20 && (!showJuly10 || daysUntilApril20 < daysUntilJuly10)) {
    eventReminder = `4/20 is ${daysUntilApril20 === 0 ? 'today' : `in ${daysUntilApril20} days`}!`;
  } else if (showJuly10) {
    eventReminder = `7/10 (Oil Day) is ${daysUntilJuly10 === 0 ? 'today' : `in ${daysUntilJuly10} days`}!`;
  }

  // Check if there are any notifications
  const hasNotifications = 
    (notifications.lowInventory && notifications.lowInventory.length > 0) || 
    (notifications.systemNotifications && notifications.systemNotifications.length > 0);

  return (
    <div className="welcome-header">
      {/* Modern card design with subtle gradient background */}
      <div className="welcome-card">
        {/* Header Section with Gradient */}
        <div className="welcome-header-content">
          <div className="welcome-greeting">
            <h2>Welcome, <span className="username">{username}</span> <span className="wave">👋</span></h2>
            <p className="session-info">
              {lastSession.strain 
                ? `Last Session: ${lastSession.strain} - ${lastSession.date}`
                : `Last Session: ${lastSession.date}`
              }
            </p>
          </div>

          {/* Right Side Actions/Alerts */}
          <div className="welcome-actions">
            {/* Notification Bell with Animation */}
            <div className="notification-container">
              <button 
                className="notification-bell" 
                aria-label="View notifications"
                onClick={toggleNotifications}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {/* Badge for notifications */}
                {hasNotifications && (
                  <span className="notification-badge"></span>
                )}
              </button>
            </div>

            {/* Reminder with Cannabis Icon */}
            {eventReminder && (
              <div className="event-reminder">
                <span className="cannabis-icon">🌿</span>
                <p>{eventReminder}</p>
              </div>
            )}
          </div>
        </div>

        {/* Notification Panel - now controlled by state */}
        {hasNotifications && showNotifications && (
          <div className="notification-panel">
            {notifications.lowInventory?.map((item, index) => (
              <div key={`inventory-${index}`} className="notification-item inventory-alert">
                <span className="alert-icon">⚠️</span>
                <p>Low Inventory: <strong>{item.strain}</strong> ({item.count} {item.count === 1 ? 'item' : 'items'} left)</p>
              </div>
            ))}
            {notifications.systemNotifications?.map((notification, index) => (
              <div key={`notification-${index}`} className="notification-item system-notification">
                <span className="info-icon">ℹ️</span>
                <p>{notification}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeHeader; 