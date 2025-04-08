import React, { useState, useEffect, useRef } from 'react';
import { Clock, Save, X, User, Flame, Droplet } from 'lucide-react';
import '../../styles/cannabis/MinimalSessionForm.css';

interface ConsumptionMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface StrainItem {
  id: string;
  name: string;
  type: 'indica' | 'sativa' | 'hybrid';
}

export interface MoodOption {
  id: string;
  name: string;
  emoji: string;
}

export interface MinimalSessionFormProps {
  inventory?: StrainItem[];
  onSessionStart?: () => void;
  onSessionEnd?: (sessionData: SessionData) => void;
  onSessionCancel?: () => void;
  disabled?: boolean;
}

export interface SessionData {
  duration: number;
  mood?: string;
  strainId?: string;
  method?: string;
  type?: string;
  notes?: string;
  timestamp: Date;
}

/**
 * MinimalSessionForm component for tracking cannabis sessions with basic details
 */
const MinimalSessionForm: React.FC<MinimalSessionFormProps> = ({
  inventory = [],
  onSessionStart,
  onSessionEnd,
  onSessionCancel,
  disabled = false
}) => {
  // Session state
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<number | null>(null);

  // Form fields
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [selectedStrain, setSelectedStrain] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [smokeType, setSmokeType] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Predefined options
  const moodOptions: MoodOption[] = [
    { id: 'happy', name: 'Happy', emoji: '😃' },
    { id: 'relaxed', name: 'Relaxed', emoji: '😌' },
    { id: 'creative', name: 'Creative', emoji: '🎨' },
    { id: 'focused', name: 'Focused', emoji: '🧠' },
    { id: 'energetic', name: 'Energetic', emoji: '⚡' },
    { id: 'tired', name: 'Tired', emoji: '😴' },
    { id: 'anxious', name: 'Anxious', emoji: '😰' },
    { id: 'pain', name: 'Pain Relief', emoji: '🤕' }
  ];

  const consumptionMethods: ConsumptionMethod[] = [
    { id: 'joint', name: 'Joint', icon: <Flame size={16} /> },
    { id: 'pipe', name: 'Pipe', icon: <Flame size={16} /> },
    { id: 'bong', name: 'Bong', icon: <Flame size={16} /> },
    { id: 'vape', name: 'Vape', icon: <Droplet size={16} /> },
    { id: 'edible', name: 'Edible', icon: <User size={16} /> }
  ];

  const smokeTypes = [
    { id: 'flower', name: 'Flower' },
    { id: 'concentrate', name: 'Concentrate' },
    { id: 'edible', name: 'Edible' },
    { id: 'tincture', name: 'Tincture' }
  ];

  // Setup and cleanup the timer
  useEffect(() => {
    if (isActive && startTime) {
      timerRef.current = window.setInterval(() => {
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setElapsedTime(diffInSeconds);
      }, 1000);
    }

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
      const sessionData: SessionData = {
        duration: elapsedTime,
        mood: selectedMood,
        strainId: selectedStrain,
        method: selectedMethod,
        type: smokeType,
        notes: notes,
        timestamp: startTime || new Date()
      };
      
      onSessionEnd(sessionData);
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
    setSelectedMood('');
    setSelectedStrain('');
    setSelectedMethod('');
    setSmokeType('');
    setNotes('');
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
      <div className="minimal-session">
        <button 
          className="minimal-session-start-btn"
          onClick={startSession}
          disabled={disabled}
        >
          <div className="minimal-session-icon">
            <Clock />
          </div>
          <div className="minimal-session-text">
            <span className="minimal-session-label">Track Session</span>
            <span className="minimal-session-sublabel">Record details about your experience</span>
          </div>
        </button>
      </div>
    );
  }

  // If there's an active session, show the form with timer
  return (
    <div className="minimal-session">
      <div className="minimal-session-active">
        <div className="minimal-session-timer">
          <div className="minimal-session-timer-icon">
            <Clock />
          </div>
          <div className="minimal-session-timer-display">
            {formatTime(elapsedTime)}
          </div>
        </div>
        
        <div className="minimal-session-form">
          {/* Mood Selection */}
          <div className="form-section">
            <label>How are you feeling?</label>
            <div className="mood-options">
              {moodOptions.map(mood => (
                <button
                  key={mood.id}
                  type="button"
                  className={`mood-option ${selectedMood === mood.id ? 'selected' : ''}`}
                  onClick={() => setSelectedMood(mood.id)}
                >
                  <span className="mood-emoji">{mood.emoji}</span>
                  <span className="mood-name">{mood.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Strain Selection */}
          <div className="form-section">
            <label htmlFor="strain-select">What are you consuming?</label>
            <select 
              id="strain-select"
              value={selectedStrain}
              onChange={(e) => setSelectedStrain(e.target.value)}
              className="strain-select"
            >
              <option value="">Select a strain</option>
              {inventory.map(strain => (
                <option key={strain.id} value={strain.id}>
                  {strain.name} ({strain.type})
                </option>
              ))}
            </select>
          </div>
          
          {/* Consumption Method */}
          <div className="form-section">
            <label>How are you consuming?</label>
            <div className="method-options">
              {consumptionMethods.map(method => (
                <button
                  key={method.id}
                  type="button"
                  className={`method-option ${selectedMethod === method.id ? 'selected' : ''}`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <span className="method-icon">{method.icon}</span>
                  <span className="method-name">{method.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Smoke Type */}
          <div className="form-section">
            <label>Type</label>
            <div className="type-options">
              {smokeTypes.map(type => (
                <button
                  key={type.id}
                  type="button"
                  className={`type-option ${smokeType === type.id ? 'selected' : ''}`}
                  onClick={() => setSmokeType(type.id)}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Notes */}
          <div className="form-section">
            <label htmlFor="session-notes">Quick Notes</label>
            <textarea
              id="session-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How was your experience? Any effects worth noting?"
              className="session-notes"
              rows={2}
            />
          </div>
        </div>
        
        <div className="minimal-session-controls">
          <button 
            className="minimal-session-end-btn"
            onClick={endSession}
          >
            <Save />
            <span>Save Session</span>
          </button>
          
          <button 
            className="minimal-session-cancel-btn"
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

export default MinimalSessionForm; 