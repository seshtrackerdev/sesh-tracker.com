import React, { useState, useEffect } from 'react';
import '../../../styles/NotificationBanner.css';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface NotificationBannerProps {
  type?: NotificationType;
  title?: string;
  message: string;
  isVisible?: boolean;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
  showIcon?: boolean;
  action?: React.ReactNode;
  className?: string;
}

/**
 * NotificationBanner component - Displays notification banners for session events
 * This is a placeholder implementation that will be expanded later
 */
export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  type = 'info',
  title,
  message,
  isVisible = true,
  onClose,
  autoClose = false,
  autoCloseDelay = 5000,
  showIcon = true,
  action,
  className = '',
}) => {
  const [visible, setVisible] = useState(isVisible);

  // Handle auto-close functionality
  useEffect(() => {
    setVisible(isVisible);
    
    if (isVisible && autoClose && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, autoCloseDelay, onClose]);

  if (!visible) return null;

  const bannerClasses = [
    'notification-banner',
    `notification-${type}`,
    className
  ].filter(Boolean).join(' ');

  const renderIcon = () => {
    if (!showIcon) return null;

    switch (type) {
      case 'success':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="notification-icon">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="notification-icon">
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 9l-6 6M9 9l6 6" />
          </svg>
        );
      case 'warning':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="notification-icon">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="notification-icon">
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4M12 8h.01" />
          </svg>
        );
    }
  };

  return (
    <div className={bannerClasses} role="alert">
      {showIcon && <div className="notification-icon-container">{renderIcon()}</div>}
      
      <div className="notification-content">
        {title && <div className="notification-title">{title}</div>}
        <div className="notification-message">{message}</div>
      </div>
      
      {action && <div className="notification-action">{action}</div>}
      
      {onClose && (
        <button className="notification-close" onClick={onClose} aria-label="Close notification">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default NotificationBanner; 