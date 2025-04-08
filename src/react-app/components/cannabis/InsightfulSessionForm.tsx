import React, { useState, useEffect, useRef } from 'react';
import { Clock, Save, X, User, Flame, Droplet, MapPin, Target, Users } from 'lucide-react';
import '../../styles/cannabis/InsightfulSessionForm.css';

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

interface MoodOption {
  id: string;
  name: string;
  emoji: string;
}

export type SessionPurpose = 
  | 'recreational' 
  | 'medical' 
  | 'creative' 
  | 'relaxation' 
  | 'social' 
  | 'sleep' 
  | 'productivity'
  | 'spiritual'
  | 'other';

export type SessionSetting = 
  | 'home' 
  | 'outdoors' 
  | 'friends' 
  | 'party' 
  | 'work' 
  | 'concert' 
  | 'hiking'
  | 'meditation'
  | 'other';

export interface SymptomRelief {
  symptomName: string;
  beforeLevel: number;
  afterLevel?: number;
}

export interface InsightfulSessionFormProps {
  inventory?: StrainItem[];
  onSessionStart?: () => void;
  onSessionEnd?: (sessionData: InsightfulSessionData) => void;
  onSessionCancel?: () => void;
  disabled?: boolean;
}

export interface InsightfulSessionData {
  duration: number;
  mood?: string;
  strainId?: string;
  method?: string;
  type?: string;
  purpose?: SessionPurpose;
  setting?: SessionSetting;
  symptoms?: SymptomRelief[];
  companions?: number;
  activityLevel?: number;
  notes?: string;
  timestamp: Date;
}

/**
 * InsightfulSessionForm component for detailed cannabis session tracking
 * Extends MinimalSessionForm with additional fields for set, setting, purpose, etc.
 */
const InsightfulSessionForm: React.FC<InsightfulSessionFormProps> = ({
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

  // Basic form fields
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [selectedStrain, setSelectedStrain] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [smokeType, setSmokeType] = useState<string>('');
  
  // Insightful additional fields
  const [purpose, setPurpose] = useState<SessionPurpose | ''>('');
  const [setting, setSetting] = useState<SessionSetting | ''>('');
  const [companions, setCompanions] = useState<number>(0);
  const [activityLevel, setActivityLevel] = useState<number>(5);
  const [notes, setNotes] = useState<string>('');
  
  // Symptom tracking
  const [symptoms, setSymptoms] = useState<SymptomRelief[]>([]);
  const [newSymptom, setNewSymptom] = useState<string>('');
  const [newSymptomLevel, setNewSymptomLevel] = useState<number>(5);

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

  const purposeOptions = [
    { id: 'recreational', name: 'Recreational' },
    { id: 'medical', name: 'Medical' },
    { id: 'creative', name: 'Creative' },
    { id: 'relaxation', name: 'Relaxation' },
    { id: 'social', name: 'Social' },
    { id: 'sleep', name: 'Sleep Aid' },
    { id: 'productivity', name: 'Productivity' },
    { id: 'spiritual', name: 'Spiritual' },
    { id: 'other', name: 'Other' }
  ];

  const settingOptions = [
    { id: 'home', name: 'Home', icon: <User size={16} /> },
    { id: 'outdoors', name: 'Outdoors', icon: <MapPin size={16} /> },
    { id: 'friends', name: 'With Friends', icon: <Users size={16} /> },
    { id: 'party', name: 'Party', icon: <Users size={16} /> },
    { id: 'work', name: 'Work', icon: <Target size={16} /> },
    { id: 'concert', name: 'Concert/Event', icon: <Users size={16} /> },
    { id: 'hiking', name: 'Hiking/Active', icon: <MapPin size={16} /> },
    { id: 'meditation', name: 'Meditation', icon: <User size={16} /> },
    { id: 'other', name: 'Other', icon: <MapPin size={16} /> }
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
      const sessionData: InsightfulSessionData = {
        duration: elapsedTime,
        mood: selectedMood,
        strainId: selectedStrain,
        method: selectedMethod,
        type: smokeType,
        purpose: purpose as SessionPurpose,
        setting: setting as SessionSetting,
        symptoms: symptoms.map(s => ({
          ...s,
          afterLevel: s.afterLevel || s.beforeLevel // Default to before if after not set
        })),
        companions,
        activityLevel,
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
    setPurpose('');
    setSetting('');
    setCompanions(0);
    setActivityLevel(5);
    setSymptoms([]);
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

  /**
   * Add a new symptom to track
   */
  const addSymptom = () => {
    if (!newSymptom.trim()) return;
    
    setSymptoms([
      ...symptoms,
      {
        symptomName: newSymptom.trim(),
        beforeLevel: newSymptomLevel,
      }
    ]);
    
    setNewSymptom('');
    setNewSymptomLevel(5);
  };

  /**
   * Update a symptom's before or after level
   */
  const updateSymptomLevel = (index: number, level: number, isAfter: boolean = false) => {
    const updatedSymptoms = [...symptoms];
    
    if (isAfter) {
      updatedSymptoms[index].afterLevel = level;
    } else {
      updatedSymptoms[index].beforeLevel = level;
    }
    
    setSymptoms(updatedSymptoms);
  };

  /**
   * Remove a symptom from tracking
   */
  const removeSymptom = (index: number) => {
    const updatedSymptoms = [...symptoms];
    updatedSymptoms.splice(index, 1);
    setSymptoms(updatedSymptoms);
  };

  // If there's no active session, show the start button
  if (!isActive) {
    return (
      <div className="insightful-session">
        <button 
          className="insightful-session-start-btn"
          onClick={startSession}
          disabled={disabled}
        >
          <div className="insightful-session-icon">
            <Clock />
          </div>
          <div className="insightful-session-text">
            <span className="insightful-session-label">Detailed Session</span>
            <span className="insightful-session-sublabel">Track your full cannabis experience</span>
          </div>
        </button>
      </div>
    );
  }

  // If there's an active session, show the form with timer
  return (
    <div className="insightful-session">
      <div className="insightful-session-active">
        <div className="insightful-session-timer">
          <div className="insightful-session-timer-icon">
            <Clock />
          </div>
          <div className="insightful-session-timer-display">
            {formatTime(elapsedTime)}
          </div>
        </div>
        
        <div className="insightful-session-form">
          {/* Basic tracking section */}
          <div className="form-group">
            <h3 className="form-group-title">Basic Info</h3>
            
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
          </div>
          
          {/* Set and Setting section */}
          <div className="form-group">
            <h3 className="form-group-title">Set & Setting</h3>
            
            {/* Purpose */}
            <div className="form-section">
              <label>Purpose of this session</label>
              <div className="purpose-options">
                {purposeOptions.map(option => (
                  <button
                    key={option.id}
                    type="button"
                    className={`purpose-option ${purpose === option.id ? 'selected' : ''}`}
                    onClick={() => setPurpose(option.id as SessionPurpose)}
                  >
                    {option.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Setting */}
            <div className="form-section">
              <label>Your environment</label>
              <div className="setting-options">
                {settingOptions.map(option => (
                  <button
                    key={option.id}
                    type="button"
                    className={`setting-option ${setting === option.id ? 'selected' : ''}`}
                    onClick={() => setSetting(option.id as SessionSetting)}
                  >
                    <span className="setting-icon">{option.icon}</span>
                    <span className="setting-name">{option.name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Companions */}
            <div className="form-section">
              <label>People with you</label>
              <div className="companions-slider">
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  value={companions} 
                  onChange={(e) => setCompanions(parseInt(e.target.value))}
                  className="slider"
                />
                <div className="companions-value">
                  {companions === 0 ? 'Solo session' : `${companions} ${companions === 1 ? 'person' : 'people'}`}
                </div>
              </div>
            </div>
            
            {/* Activity Level */}
            <div className="form-section">
              <label>Activity level during session</label>
              <div className="activity-slider">
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={activityLevel} 
                  onChange={(e) => setActivityLevel(parseInt(e.target.value))}
                  className="slider"
                />
                <div className="activity-value-labels">
                  <span>Sedentary</span>
                  <span className="activity-value">{activityLevel}/10</span>
                  <span>Very active</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Symptom Tracking section */}
          <div className="form-group">
            <h3 className="form-group-title">Symptom Tracking</h3>
            
            {/* Add symptom */}
            <div className="form-section">
              <div className="add-symptom">
                <input
                  type="text"
                  value={newSymptom}
                  onChange={(e) => setNewSymptom(e.target.value)}
                  placeholder="Enter symptom (e.g., Anxiety, Pain)"
                  className="symptom-input"
                />
                <div className="symptom-level-selector">
                  <label>Intensity: {newSymptomLevel}/10</label>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={newSymptomLevel} 
                    onChange={(e) => setNewSymptomLevel(parseInt(e.target.value))}
                    className="slider"
                  />
                </div>
                <button 
                  type="button" 
                  onClick={addSymptom}
                  className="add-symptom-btn"
                  disabled={!newSymptom.trim()}
                >
                  Add
                </button>
              </div>
            </div>
            
            {/* List of tracked symptoms */}
            {symptoms.length > 0 && (
              <div className="symptom-list">
                {symptoms.map((symptom, index) => (
                  <div key={index} className="symptom-item">
                    <div className="symptom-header">
                      <h4 className="symptom-name">{symptom.symptomName}</h4>
                      <button 
                        type="button"
                        onClick={() => removeSymptom(index)}
                        className="remove-symptom-btn"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    
                    <div className="symptom-levels">
                      <div className="symptom-level">
                        <label>Before: {symptom.beforeLevel}/10</label>
                        <input 
                          type="range" 
                          min="1" 
                          max="10" 
                          value={symptom.beforeLevel} 
                          onChange={(e) => updateSymptomLevel(index, parseInt(e.target.value), false)}
                          className="slider"
                        />
                      </div>
                      
                      <div className="symptom-level">
                        <label>After: {symptom.afterLevel || symptom.beforeLevel}/10</label>
                        <input 
                          type="range" 
                          min="1" 
                          max="10" 
                          value={symptom.afterLevel || symptom.beforeLevel} 
                          onChange={(e) => updateSymptomLevel(index, parseInt(e.target.value), true)}
                          className="slider"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {symptoms.length === 0 && (
              <div className="no-symptoms">
                <p>Add symptoms you're experiencing to track relief.</p>
              </div>
            )}
          </div>
          
          {/* Notes */}
          <div className="form-group">
            <h3 className="form-group-title">Session Notes</h3>
            <div className="form-section">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Record your thoughts, effects, or anything notable about this session..."
                className="session-notes"
                rows={4}
              />
            </div>
          </div>
        </div>
        
        <div className="insightful-session-controls">
          <button 
            className="insightful-session-end-btn"
            onClick={endSession}
          >
            <Save />
            <span>Save Session</span>
          </button>
          
          <button 
            className="insightful-session-cancel-btn"
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

export default InsightfulSessionForm; 