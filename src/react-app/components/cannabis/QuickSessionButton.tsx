import React, { useState, useEffect, useRef } from 'react';
import { Play, Clock, Save, X } from 'lucide-react';
import '../../styles/cannabis/QuickSessionButton.css';

export interface QuickSessionButtonProps {
  /**
   * Optional label for the button
   */
  label?: string;
  /**
   * Optional description for the button
   */
  description?: string;
  /**
   * Handler for when a session is started
   */
  onSessionStart?: () => void;
  /**
   * Handler for when a session is saved/ended
   * @param duration Duration of the session in seconds
   */
  onSessionEnd?: (duration: number) => void;
  /**
   * Handler for when a session is cancelled
   */
  onSessionCancel?: () => void;
  /**
   * Whether the button is disabled
   */
  disabled?: boolean;
}

/**
 * QuickSessionButton component for starting and tracking cannabis sessions
 * Provides a simple one-click interface to start tracking a session with a timer
 */
const QuickSessionButton: React.FC<QuickSessionButtonProps> = ({
  label = 'Start Session',
  description = 'Track your cannabis session with one click',
  onSessionStart,
  onSessionEnd,
  onSessionCancel,
  disabled = false
}) => {
  // Track if a session is currently active
  const [isActive, setIsActive] = useState(false);
  // Store the start time of the session
  const [startTime, setStartTime] = useState<Date | null>(null);
  // Track the elapsed time in seconds
  const [elapsedTime, setElapsedTime] = useState(0);
  // Reference to the timer interval
  const timerRef = useRef<number | null>(null);

  // Setup and cleanup the timer
  useEffect(() => {
    // If session is active, start the timer
    if (isActive && startTime) {
      timerRef.current = window.setInterval(() => {
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setElapsedTime(diffInSeconds);
      }, 1000);
    }

    // Cleanup function to clear the interval when component unmounts or session ends
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, startTime]);

  /**
   * Start a new session
   */
  const startSession = () => {
    if (disabled) return;
    
    const now = new Date();
    setStartTime(now);
    setIsActive(true);
    setElapsedTime(0);
    
    if (onSessionStart) {
      onSessionStart();
    }
  };

  /**
   * End the current session and save data
   */
  const endSession = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (onSessionEnd && elapsedTime > 0) {
      onSessionEnd(elapsedTime);
    }
    
    resetSession();
  };

  /**
   * Cancel the current session without saving
   */
  const cancelSession = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (onSessionCancel) {
      onSessionCancel();
    }
    
    resetSession();
  };

  /**
   * Reset the session state
   */
  const resetSession = () => {
    setIsActive(false);
    setStartTime(null);
    setElapsedTime(0);
  };

  /**
   * Format seconds into a readable time string (mm:ss or hh:mm:ss)
   */
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // If there's no active session, show the start button
  if (!isActive) {
    return (
      <div className="quick-session">
        <button 
          className="quick-session-start-btn"
          onClick={startSession}
          disabled={disabled}
        >
          <div className="quick-session-icon">
            <Play />
          </div>
          <div className="quick-session-text">
            <span className="quick-session-label">{label}</span>
            <span className="quick-session-sublabel">{description}</span>
          </div>
        </button>
      </div>
    );
  }

  // If there's an active session, show the timer and end/cancel buttons
  return (
    <div className="quick-session">
      <div className="quick-session-active">
        <div className="quick-session-timer">
          <div className="quick-session-timer-icon">
            <Clock />
          </div>
          <div className="quick-session-timer-display">
            {formatTime(elapsedTime)}
          </div>
        </div>
        
        <div className="quick-session-controls">
          <button 
            className="quick-session-end-btn"
            onClick={endSession}
          >
            <Save />
            <span>Save Session</span>
          </button>
          
          <button 
            className="quick-session-cancel-btn"
            onClick={cancelSession}
          >
            <X />
            <span>Cancel</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickSessionButton; 