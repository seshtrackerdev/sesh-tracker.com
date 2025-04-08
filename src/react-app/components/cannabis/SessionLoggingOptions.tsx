import React, { useState } from 'react';
import QuickSessionButton from './QuickSessionButton';
import MinimalSessionForm from './MinimalSessionForm';
import InsightfulSessionForm from './InsightfulSessionForm';
import { Clock, ClipboardList, FileText } from 'lucide-react';
import '../../styles/cannabis/SessionLoggingOptions.css';

interface StrainItem {
  id: string;
  name: string;
  type: 'indica' | 'sativa' | 'hybrid';
}

interface SessionLoggingOptionsProps {
  /**
   * Array of strains available in the inventory
   */
  inventory?: StrainItem[];
  /**
   * Callback for when a session is saved
   */
  onSessionSaved?: (sessionData: any) => void;
  /**
   * Whether to disable the session logging options
   */
  disabled?: boolean;
}

type SessionLogMode = 'quick' | 'minimal' | 'insightful';

/**
 * SessionLoggingOptions component providing multiple ways to log a cannabis session
 */
const SessionLoggingOptions: React.FC<SessionLoggingOptionsProps> = ({
  inventory = [],
  onSessionSaved,
  disabled = false
}) => {
  // Track the active tab
  const [activeMode, setActiveMode] = useState<SessionLogMode>('quick');

  /**
   * Handler for when a session is saved from any of the logging options
   */
  const handleSessionSaved = (sessionData: any) => {
    if (onSessionSaved) {
      // Include the logging mode used in the session data
      onSessionSaved({
        ...sessionData,
        loggingMode: activeMode
      });
    }
  };

  /**
   * Handler for when a session is started
   */
  const handleSessionStart = () => {
    // Could implement analytics or other tracking here
    console.log(`Started a ${activeMode} session`);
  };

  /**
   * Handler for when a session is cancelled
   */
  const handleSessionCancel = () => {
    // Could implement analytics or other tracking here
    console.log(`Cancelled a ${activeMode} session`);
  };

  return (
    <div className="session-logging-options">
      <div className="logging-tabs">
        <button
          className={`logging-tab ${activeMode === 'quick' ? 'active' : ''}`}
          onClick={() => setActiveMode('quick')}
        >
          <Clock className="tab-icon" size={18} />
          <span>Quick</span>
        </button>
        
        <button
          className={`logging-tab ${activeMode === 'minimal' ? 'active' : ''}`}
          onClick={() => setActiveMode('minimal')}
        >
          <ClipboardList className="tab-icon" size={18} />
          <span>Basic</span>
        </button>
        
        <button
          className={`logging-tab ${activeMode === 'insightful' ? 'active' : ''}`}
          onClick={() => setActiveMode('insightful')}
        >
          <FileText className="tab-icon" size={18} />
          <span>Detailed</span>
        </button>
      </div>
      
      <div className="logging-content">
        {activeMode === 'quick' && (
          <div className="logging-option">
            <div className="option-heading">
              <h3>Quick Session</h3>
              <p>Track time only - perfect for a quick log with minimal interruption</p>
            </div>
            <QuickSessionButton 
              onSessionStart={handleSessionStart}
              onSessionEnd={handleSessionSaved}
              onSessionCancel={handleSessionCancel}
              disabled={disabled}
              label="Quick Sesh"
              description="Just track the time - no input needed"
            />
          </div>
        )}
        
        {activeMode === 'minimal' && (
          <div className="logging-option">
            <div className="option-heading">
              <h3>Basic Session</h3>
              <p>Track essential details about your session experience</p>
            </div>
            <MinimalSessionForm 
              inventory={inventory}
              onSessionStart={handleSessionStart}
              onSessionEnd={handleSessionSaved}
              onSessionCancel={handleSessionCancel}
              disabled={disabled}
            />
          </div>
        )}
        
        {activeMode === 'insightful' && (
          <div className="logging-option">
            <div className="option-heading">
              <h3>Detailed Session</h3>
              <p>Track comprehensive details for maximum insights</p>
            </div>
            <InsightfulSessionForm 
              inventory={inventory}
              onSessionStart={handleSessionStart}
              onSessionEnd={handleSessionSaved}
              onSessionCancel={handleSessionCancel}
              disabled={disabled}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionLoggingOptions; 