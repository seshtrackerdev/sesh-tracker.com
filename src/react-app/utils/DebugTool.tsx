import React, { useState, useEffect, CSSProperties, Profiler, ProfilerOnRenderCallback } from 'react';
import { createPortal } from 'react-dom';

// Add the import for the authentication hook
import { useAuth } from '../hooks/useAuth';

// Styles for the debug panel with cannabis theme
const debugStyles: Record<string, CSSProperties> = {
  panel: {
    position: 'fixed',
    bottom: '0',
    right: '0',
    width: '320px',
    backgroundColor: 'rgba(18, 18, 18, 0.9)',
    color: '#76d275',
    fontFamily: 'monospace',
    fontSize: '12px',
    padding: '0',
    zIndex: 9999,
    borderTopLeftRadius: 'var(--radius-lg)',
    boxShadow: '0 0 20px rgba(0, 0, 0, 0.6)',
    maxHeight: '80vh',
    overflowY: 'auto',
    transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    border: '1px solid rgba(67, 160, 71, 0.3)',
    backdropFilter: 'blur(5px)',
  },
  collapsed: {
    transform: 'translateY(calc(100% - 40px))',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 15px',
    borderBottom: '1px solid rgba(67, 160, 71, 0.3)',
    cursor: 'pointer',
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
    userSelect: 'none',
  },
  title: {
    margin: '0',
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#43a047',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  content: {
    padding: '15px',
  },
  tabsContainer: {
    display: 'flex',
    borderBottom: '1px solid rgba(67, 160, 71, 0.3)',
    backgroundColor: 'rgba(25, 25, 25, 0.9)',
  },
  tab: {
    padding: '8px 15px',
    cursor: 'pointer',
    fontSize: '11px',
    textTransform: 'uppercase',
    color: '#b3b3b3',
    borderBottom: '2px solid transparent',
    transition: 'all 0.2s ease',
    flex: 1,
    textAlign: 'center',
    letterSpacing: '0.5px',
  },
  activeTab: {
    color: '#76d275',
    borderBottom: '2px solid #43a047',
    backgroundColor: 'rgba(67, 160, 71, 0.1)',
  },
  section: {
    marginBottom: '15px',
  },
  sectionTitle: {
    borderBottom: '1px solid rgba(67, 160, 71, 0.2)',
    paddingBottom: '5px',
    marginBottom: '8px',
    fontSize: '13px',
    color: '#43a047',
    fontWeight: 'bold',
  },
  infoGroup: {
    margin: '5px 0 15px',
  },
  infoItem: {
    margin: '3px 0',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
  },
  label: {
    color: '#b3b3b3',
    marginRight: '10px',
  },
  value: {
    color: '#f8f9fa',
    maxWidth: '170px',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    textAlign: 'right',
  },
  valueString: {
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    wordBreak: 'break-all',
    lineHeight: 1.4,
  },
  button: {
    backgroundColor: 'rgba(67, 160, 71, 0.15)',
    border: '1px solid rgba(67, 160, 71, 0.5)',
    color: '#76d275',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '11px',
    margin: '5px 0',
    width: '100%',
    transition: 'all 0.2s ease',
    textAlign: 'center',
  },
  buttonContainer: {
    display: 'flex',
    gap: '8px',
    marginTop: '10px',
  },
  buttonHalf: {
    flex: 1,
  },
  pill: {
    padding: '1px 8px',
    borderRadius: '10px',
    fontSize: '10px',
  },
  successPill: {
    backgroundColor: 'rgba(67, 160, 71, 0.3)',
    color: '#76d275',
  },
  errorPill: {
    backgroundColor: 'rgba(244, 67, 54, 0.3)',
    color: '#ff6b6b',
  },
  warnPill: {
    backgroundColor: 'rgba(255, 193, 7, 0.3)',
    color: '#ffd54f',
  },
  consoleRow: {
    fontSize: '10px',
    padding: '4px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    wordBreak: 'break-all',
  },
  log: {
    color: '#e0e0e0',
  },
  warn: {
    color: '#ffd54f',
  },
  error: {
    color: '#ff6b6b',
  }
};

type LogType = 'log' | 'warn' | 'error';

interface LogEntry {
  message: string;
  type: LogType;
  timestamp: Date;
}

// Debug information that is safe to expose
interface DebugInfo {
  buildVersion: string;
  environment: string;
  viewport: string;
  userAgent: string;
  path: string;
  renderCount: number;
  timestamp: string;
  reactVersion: string;
  isLocalStorage: boolean;
  isSessionStorage: boolean;
  isOnline: boolean;
  memoryUsage?: string;
  timingData?: {
    domLoad: number | null;
    fullLoad: number | null;
  };
  pageInfo: {
    title: string;
    url: string;
    referrer: string;
  };
  elementCounts?: {
    total: number;
    visible: number;
    images: number;
  };
  apiRequests?: ApiRequest[];
  slowComponents?: SlowComponent[];
  routeChanges?: RouteChange[];
  interactionEvents?: UserInteraction[];
}

// New interfaces for added features
interface ApiRequest {
  url: string;
  method: string;
  status?: number;
  duration: number;
  timestamp: Date;
  payload?: string;
  response?: string;
}

interface SlowComponent {
  name: string;
  renderTime: number;
  renderCount: number;
  lastRenderTimestamp?: number;
  phase?: string;
}

interface RouteChange {
  from: string;
  to: string;
  timestamp: Date;
  duration: number;
}

interface UserInteraction {
  type: string;
  target: string;
  timestamp: Date;
}

// Add these type declarations to fix TypeScript errors

// For XMLHttpRequest prototype extension
declare global {
  interface XMLHttpRequest {
    _debugUrl?: string;
    _debugMethod?: string;
    _debugStartTime?: number;
  }
}

// Add a configuration section at the top of the file
const DEBUG_CONFIG = {
  MAX_LOG_HISTORY: 500,      // Maximum number of logs to keep
  MAX_API_HISTORY: 50,       // Maximum number of API requests to track
  MAX_INTERACTION_HISTORY: 50, // Maximum number of user interactions to track
  SAVE_INTERVAL: 5000,       // How often to save to storage (ms)
  DEVELOPER_USER_ID: 'c713a9ba8f7b40f0da69c6e20566cdff',  // Developer user ID with debug access
  DEVELOPER_EMAIL: 'development@sesh-tracker.com',        // Developer email for reference
  DEBUG_SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes in milliseconds
  COMPATIBLE_REACT_VERSIONS: ['19.0.0', '19.', '18.2.0', '18.2.', '18.'], // Compatible React versions (prefix match)
  SENSITIVE_PATTERNS: [
    /token=([^&]*)/gi,
    /authorization:\s*bearer\s+([^\s]*)/gi,
    /password=([^&]*)/gi,
    /apikey=([^&]*)/gi,
    /password["']?\s*:\s*["']([^"']*)/gi,
    /email["']?\s*:\s*["']([^"']*)/gi,
    /"auth(?:Token|Key|entication)["']?\s*:\s*["']([^"']*)/gi,
    /sessionid=([^;]*)/gi
  ],
  SENSITIVE_KEYS: [
    'password', 'token', 'apiKey', 'secret', 'auth', 'key', 'credential',
    'session', 'ssn', 'social', 'private', 'secret', 'cvv', 'pin'
  ],
  SENSITIVE_REPLACEMENT: '***REDACTED***'
};

// Add security utilities
const SecurityUtils = {
  // Sanitize potentially sensitive data
  sanitize: (data: any): any => {
    if (data === null || data === undefined) return data;
    
    // Handle strings directly
    if (typeof data === 'string') {
      let sanitized = data;
      
      // Apply regex patterns for sensitive data
      DEBUG_CONFIG.SENSITIVE_PATTERNS.forEach(pattern => {
        sanitized = sanitized.replace(pattern, (match, p1) => {
          return match.replace(p1, DEBUG_CONFIG.SENSITIVE_REPLACEMENT);
        });
      });
      
      return sanitized;
    }
    
    // Handle objects recursively
    if (typeof data === 'object') {
      if (Array.isArray(data)) {
        return data.map(item => SecurityUtils.sanitize(item));
      }
      
      const sanitized: Record<string, any> = {};
      
      for (const key in data) {
        // Check if this is a sensitive key
        const isSensitive = DEBUG_CONFIG.SENSITIVE_KEYS.some(sk => 
          key.toLowerCase().includes(sk.toLowerCase())
        );
        
        if (isSensitive && typeof data[key] === 'string') {
          sanitized[key] = DEBUG_CONFIG.SENSITIVE_REPLACEMENT;
        } else {
          sanitized[key] = SecurityUtils.sanitize(data[key]);
        }
      }
      
      return sanitized;
    }
    
    // Return primitive values as is
    return data;
  },
  
  // Check React version compatibility
  isReactVersionCompatible: (): boolean => {
    if (!React.version) return false;
    
    return DEBUG_CONFIG.COMPATIBLE_REACT_VERSIONS.some(version => 
      React.version.startsWith(version)
    );
  },
  
  // Log for security audit
  logSecurityEvent: (event: string, details?: any) => {
    const timestamp = new Date().toISOString();
    const sanitizedDetails = details ? SecurityUtils.sanitize(details) : {};
    
    console.info(`[SECURITY][${timestamp}] ${event}`, sanitizedDetails);
    
    // In a production app, you might want to send this to a secure logging endpoint
  }
};

// Add session management module
const DebugSession = {
  getSession: (): { startTime: number, lastActivity: number } | null => {
    try {
      const session = sessionStorage.getItem('debugTool_session');
      return session ? JSON.parse(session) : null;
    } catch (e) {
      console.error('Failed to get debug session:', e);
      return null;
    }
  },
  
  startSession: () => {
    const now = Date.now();
    const sessionData = { startTime: now, lastActivity: now };
    try {
      sessionStorage.setItem('debugTool_session', JSON.stringify(sessionData));
      // Log session start securely for audit purposes
      SecurityUtils.logSecurityEvent('Debug session started', { timestamp: new Date(now).toISOString() });
      return sessionData;
    } catch (e) {
      console.error('Failed to start debug session:', e);
      return null;
    }
  },
  
  updateActivity: () => {
    const session = DebugSession.getSession();
    if (session) {
      session.lastActivity = Date.now();
      try {
        sessionStorage.setItem('debugTool_session', JSON.stringify(session));
      } catch (e) {
        console.error('Failed to update debug session activity:', e);
      }
    }
  },
  
  isSessionValid: (): boolean => {
    const session = DebugSession.getSession();
    if (!session) return false;
    
    const now = Date.now();
    // Check if session has expired
    return (now - session.lastActivity) < DEBUG_CONFIG.DEBUG_SESSION_TIMEOUT;
  },
  
  endSession: () => {
    try {
      sessionStorage.removeItem('debugTool_session');
      SecurityUtils.logSecurityEvent('Debug session ended');
    } catch (e) {
      console.error('Failed to end debug session:', e);
    }
  }
};

// Clear all stored debug data (helper function)
const clearStoredDebugData = () => {
  try {
    // Clear only debug-related items from sessionStorage
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('debugTool_')) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (e) {
    console.error('Failed to clear stored debug data:', e);
  }
};

// Add a function to format countdown time with hours:minutes:seconds
const formatCountdown = (ms: number): string => {
  if (ms <= 0) return "Expired";
  
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor(ms / (1000 * 60 * 60));
  
  const pad = (num: number): string => num.toString().padStart(2, '0');
  
  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  } else {
    return `${minutes}:${pad(seconds)}`;
  }
};

const DebugPanel: React.FC = () => {
  // Add React version compatibility check
  const [isCompatibleVersion, setIsCompatibleVersion] = useState(true);
  
  // Load collapsed state from localStorage or default to true
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('debugTool_isCollapsed');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });
  
  // Load active tab from localStorage or default to general
  const [activeTab, setActiveTab] = useState(() => {
    try {
      return localStorage.getItem('debugTool_activeTab') || 'general';
    } catch {
      return 'general';
    }
  });
  
  // Load logs from sessionStorage or default to empty array
  const [logs, setLogs] = useState<LogEntry[]>(() => {
    try {
      const savedLogs = sessionStorage.getItem('debugTool_logs');
      return savedLogs ? JSON.parse(savedLogs).map((log: any) => ({
        ...log,
        timestamp: new Date(log.timestamp)
      })) : [];
    } catch {
      return [];
    }
  });
  
  // Also load other states from sessionStorage
  const [apiRequests, setApiRequests] = useState<ApiRequest[]>(() => {
    try {
      const saved = sessionStorage.getItem('debugTool_apiRequests');
      return saved ? JSON.parse(saved).map((req: any) => ({
        ...req,
        timestamp: new Date(req.timestamp)
      })) : [];
    } catch {
      return [];
    }
  });
  
  const [routeChanges, setRouteChanges] = useState<RouteChange[]>(() => {
    try {
      const saved = sessionStorage.getItem('debugTool_routeChanges');
      return saved ? JSON.parse(saved).map((route: any) => ({
        ...route,
        timestamp: new Date(route.timestamp)
      })) : [];
    } catch {
      return [];
    }
  });
  
  const [userInteractions, setUserInteractions] = useState<UserInteraction[]>(() => {
    try {
      const saved = sessionStorage.getItem('debugTool_userInteractions');
      return saved ? JSON.parse(saved).map((interaction: any) => ({
        ...interaction,
        timestamp: new Date(interaction.timestamp)
      })) : [];
    } catch {
      return [];
    }
  });
  
  // Save state to localStorage/sessionStorage when it changes
  useEffect(() => {
    localStorage.setItem('debugTool_isCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);
  
  useEffect(() => {
    localStorage.setItem('debugTool_activeTab', activeTab);
  }, [activeTab]);
  
  useEffect(() => {
    sessionStorage.setItem('debugTool_logs', JSON.stringify(logs));
  }, [logs]);
  
  useEffect(() => {
    sessionStorage.setItem('debugTool_apiRequests', JSON.stringify(apiRequests));
  }, [apiRequests]);
  
  useEffect(() => {
    sessionStorage.setItem('debugTool_routeChanges', JSON.stringify(routeChanges));
  }, [routeChanges]);
  
  useEffect(() => {
    sessionStorage.setItem('debugTool_userInteractions', JSON.stringify(userInteractions));
  }, [userInteractions]);
  
  const [domLoaded, setDomLoaded] = useState(false);
  
  // New states for added features
  const [slowComponents, setSlowComponents] = useState<SlowComponent[]>([]);
  const [isMonitoringXHR, setIsMonitoringXHR] = useState(false);
  const [isMonitoringInteractions, setIsMonitoringInteractions] = useState(false);
  
  // Add session timeout management
  const [sessionExpiry, setSessionExpiry] = useState<Date | null>(null);

  // Initialize session on mount and setup session timeout
  useEffect(() => {
    // In addition to React version check
    setIsCompatibleVersion(SecurityUtils.isReactVersionCompatible());
    
    // Start or continue debug session
    let session = DebugSession.getSession();
    if (!session || !DebugSession.isSessionValid()) {
      session = DebugSession.startSession();
    } else {
      DebugSession.updateActivity();
    }
    
    // Calculate and set session expiry
    if (session) {
      const expiryTime = new Date(session.lastActivity + DEBUG_CONFIG.DEBUG_SESSION_TIMEOUT);
      setSessionExpiry(expiryTime);
    }
    
    // Setup session timeout checker
    const intervalId = setInterval(() => {
      if (!DebugSession.isSessionValid()) {
        // Session expired, clean up
        DebugSession.endSession();
        SecurityUtils.logSecurityEvent('Debug session expired');
        setSessionExpiry(null);
        
        // Notify user that session expired
        alert('Debug session expired. Refresh the page to start a new session.');
      } else {
        // Update activity and expiry time
        DebugSession.updateActivity();
        const session = DebugSession.getSession();
        if (session) {
          const expiryTime = new Date(session.lastActivity + DEBUG_CONFIG.DEBUG_SESSION_TIMEOUT);
          setSessionExpiry(expiryTime);
        }
      }
    }, 60000); // Check every minute
    
    // Update activity on user interaction
    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    const handleUserActivity = () => {
      DebugSession.updateActivity();
    };
    
    activityEvents.forEach(event => {
      document.addEventListener(event, handleUserActivity);
    });
    
    // Log initialization
    SecurityUtils.logSecurityEvent('Debug Tool Initialized', { reactVersion: React.version });
    
    // Clean up
    return () => {
      clearInterval(intervalId);
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
    };
  }, []);
  
  // Track console logs
  useEffect(() => {
    if (!domLoaded) return;
    
    const originalConsoleLog = console.log;
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;
    
    // Helper to safely stringify objects with possible circular references
    const safeStringify = (obj: any): string => {
      if (typeof obj !== 'object' || obj === null) {
        return String(obj);
      }
      
      // Handle circular references
      const cache: any[] = [];
      try {
        return JSON.stringify(obj, (key, value) => {
          if (typeof value === 'object' && value !== null) {
            if (cache.includes(value)) {
              return '[Circular Reference]';
            }
            cache.push(value);
          }
          return value;
        }, 2);
      } catch (err) {
        return `[Object: stringify failed] ${Object.keys(obj).join(', ')}`;
      }
    };
    
    console.log = (...args) => {
      setLogs(prevLogs => {
        const newLog = {
          message: args.map(arg => 
            typeof arg === 'object' ? safeStringify(arg) : String(arg)
          ).join(' '),
          type: 'log' as LogType,
          timestamp: new Date(),
        };
        
        const updatedLogs = [newLog, ...prevLogs.slice(0, 99)];
        // Store updated logs immediately in sessionStorage
        try {
          sessionStorage.setItem('debugTool_logs', JSON.stringify(updatedLogs));
        } catch (e) {
          console.warn('Failed to store logs in sessionStorage:', e);
        }
        
        return updatedLogs;
      });
      originalConsoleLog(...args);
    };
    
    // Apply the same pattern to console.warn and console.error
    console.warn = (...args) => {
      setLogs(prevLogs => {
        const newLog = {
          message: args.map(arg => 
            typeof arg === 'object' ? safeStringify(arg) : String(arg)
          ).join(' '),
          type: 'warn' as LogType,
          timestamp: new Date(),
        };
        
        const updatedLogs = [newLog, ...prevLogs.slice(0, 99)];
        try {
          sessionStorage.setItem('debugTool_logs', JSON.stringify(updatedLogs));
        } catch (e) {
          // Use originalConsoleWarn to avoid recursion
          originalConsoleWarn('Failed to store logs in sessionStorage:', e);
        }
        
        return updatedLogs;
      });
      originalConsoleWarn(...args);
    };
    
    console.error = (...args) => {
      setLogs(prevLogs => {
        const newLog = {
          message: args.map(arg => 
            typeof arg === 'object' ? safeStringify(arg) : String(arg)
          ).join(' '),
          type: 'error' as LogType,
          timestamp: new Date(),
        };
        
        const updatedLogs = [newLog, ...prevLogs.slice(0, 99)];
        try {
          sessionStorage.setItem('debugTool_logs', JSON.stringify(updatedLogs));
        } catch (e) {
          originalConsoleWarn('Failed to store logs in sessionStorage:', e);
        }
        
        return updatedLogs;
      });
      originalConsoleError(...args);
    };
    
    return () => {
      console.log = originalConsoleLog;
      console.warn = originalConsoleWarn;
      console.error = originalConsoleError;
    };
  }, [domLoaded]);
  
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    buildVersion: import.meta.env.VITE_APP_VERSION || 'dev',
    environment: import.meta.env.MODE || 'development',
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    userAgent: navigator.userAgent,
    path: window.location.pathname,
    renderCount: 0,
    timestamp: new Date().toISOString(),
    reactVersion: React.version,
    isLocalStorage: (() => {
      try {
        return !!window.localStorage;
      } catch (e) {
        return false;
      }
    })(),
    isSessionStorage: (() => {
      try {
        return !!window.sessionStorage;
      } catch (e) {
        return false;
      }
    })(),
    isOnline: navigator.onLine,
    pageInfo: {
      title: document.title,
      url: window.location.href,
      referrer: document.referrer || 'direct'
    }
  });

  // Basic DOM info when mounted
  useEffect(() => {
    setDomLoaded(true);
    
    const timing = window.performance?.timing;
    let domLoad = null;
    let fullLoad = null;
    
    if (timing) {
      domLoad = timing.domContentLoadedEventEnd - timing.navigationStart;
      fullLoad = timing.loadEventEnd - timing.navigationStart;
    }
    
    const countElements = () => {
      const allElements = document.querySelectorAll('*').length;
      const visibleElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      }).length;
      const images = document.querySelectorAll('img').length;
      
      return { total: allElements, visible: visibleElements, images };
    };
    
    setDebugInfo(prev => ({
      ...prev,
      timingData: {
        domLoad,
        fullLoad,
      },
      elementCounts: countElements()
    }));
  }, []);

  // Track render count
  useEffect(() => {
    setDebugInfo(prev => ({
      ...prev,
      renderCount: prev.renderCount + 1,
      path: window.location.pathname,
      timestamp: new Date().toISOString(),
      pageInfo: {
        title: document.title,
        url: window.location.href,
        referrer: document.referrer || 'direct'
      }
    }));

    // Update viewport on resize
    const handleResize = () => {
      setDebugInfo(prev => ({
        ...prev,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [window.location.pathname]);

  // Periodically update memory usage if available
  useEffect(() => {
    const updateMemoryUsage = () => {
      if ('performance' in window && 'memory' in (window.performance as any)) {
        const memoryInfo = (window.performance as any).memory;
        const usedHeapSizeMB = Math.round(memoryInfo.usedJSHeapSize / (1024 * 1024));
        const totalHeapSizeMB = Math.round(memoryInfo.totalJSHeapSize / (1024 * 1024));
        
        setDebugInfo(prev => ({
          ...prev,
          memoryUsage: `${usedHeapSizeMB}MB / ${totalHeapSizeMB}MB`,
        }));
      }
    };

    const intervalId = setInterval(updateMemoryUsage, 5000);
    updateMemoryUsage(); // Initial update
    
    return () => clearInterval(intervalId);
  }, []);

  // Modify API Request monitoring to include data sanitization
  useEffect(() => {
    if (!isMonitoringXHR || !domLoaded) return;

    const originalFetch = window.fetch;
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;

    // Intercept fetch API with proper types and sanitization
    window.fetch = async function(...args: Parameters<typeof originalFetch>): Promise<Response> {
      const url = typeof args[0] === 'string' ? args[0] : args[0] instanceof URL ? args[0].toString() : args[0].url;
      const method = args[1]?.method || 'GET';
      
      // Sanitize payload before logging
      let payload: string | undefined;
      if (args[1]?.body) {
        const rawPayload = typeof args[1].body === 'string' 
          ? args[1].body 
          : JSON.stringify(args[1].body);
        payload = SecurityUtils.sanitize(rawPayload);
      }
      
      const startTime = performance.now();
      
      try {
        const response = await originalFetch.apply(window, args);
        const duration = performance.now() - startTime;
        
        // Clone the response to read it without consuming the original
        const clonedResponse = response.clone();
        let responseText = '';
        
        try {
          const contentType = clonedResponse.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const jsonData = await clonedResponse.json();
            // Sanitize JSON response
            const sanitizedJson = SecurityUtils.sanitize(jsonData);
            responseText = JSON.stringify(sanitizedJson);
          } else {
            responseText = await clonedResponse.text();
            // Sanitize text response
            responseText = SecurityUtils.sanitize(responseText);
          }
        } catch (e) {
          responseText = 'Error reading response body';
        }
        
        // Sanitize URL before storing
        const sanitizedUrl = SecurityUtils.sanitize(url);
        
        const newRequest: ApiRequest = {
          url: sanitizedUrl,
          method,
          status: response.status,
          duration,
          timestamp: new Date(),
          payload,
          response: responseText.length > 500 ? responseText.substring(0, 500) + '...' : responseText
        };
        
        setApiRequests(prev => [newRequest, ...prev.slice(0, DEBUG_CONFIG.MAX_API_HISTORY - 1)]);
        
        return response;
      } catch (error) {
        const duration = performance.now() - startTime;
        
        // Sanitize URL and error before storing
        const sanitizedUrl = SecurityUtils.sanitize(url);
        const sanitizedError = SecurityUtils.sanitize(`Error: ${error}`);
        
        const newRequest: ApiRequest = {
          url: sanitizedUrl,
          method,
          duration,
          timestamp: new Date(),
          payload,
          response: sanitizedError
        };
        
        setApiRequests(prev => [newRequest, ...prev.slice(0, DEBUG_CONFIG.MAX_API_HISTORY - 1)]);
        throw error;
      }
    };

    // Apply similar sanitization to XHR monitoring
    XMLHttpRequest.prototype.open = function(
      method: string, 
      url: string | URL, 
      async: boolean = true, 
      username?: string | null, 
      password?: string | null
    ): void {
      this._debugUrl = url.toString();
      this._debugMethod = method;
      this._debugStartTime = performance.now();
      return originalXHROpen.call(this, method, url, async, username, password);
    };

    XMLHttpRequest.prototype.send = function(body?: Document | XMLHttpRequestBodyInit | null): void {
      const xhr = this;
      // Sanitize payload before logging
      const debugPayload = body ? SecurityUtils.sanitize(body.toString()) : undefined;
      
      xhr.addEventListener('load', function() {
        // Check for undefined before using _debugStartTime
        const duration = xhr._debugStartTime !== undefined 
          ? performance.now() - xhr._debugStartTime 
          : 0;
        
        let responseText = '';
        try {
          responseText = xhr.responseText;
          // Sanitize response
          responseText = SecurityUtils.sanitize(responseText);
          
          if (responseText.length > 500) {
            responseText = responseText.substring(0, 500) + '...';
          }
        } catch (e) {
          responseText = 'Error reading response body';
        }
        
        // Sanitize URL before storing
        const sanitizedUrl = SecurityUtils.sanitize(xhr._debugUrl || 'unknown');
        
        const newRequest: ApiRequest = {
          url: sanitizedUrl,
          method: xhr._debugMethod || 'unknown',
          status: xhr.status,
          duration,
          timestamp: new Date(),
          payload: debugPayload,
          response: responseText
        };
        
        setApiRequests(prev => [newRequest, ...prev.slice(0, DEBUG_CONFIG.MAX_API_HISTORY - 1)]);
      });
      
      return originalXHRSend.call(this, body);
    };

    return () => {
      window.fetch = originalFetch;
      XMLHttpRequest.prototype.open = originalXHROpen;
      XMLHttpRequest.prototype.send = originalXHRSend;
    };
  }, [isMonitoringXHR, domLoaded]);

  // Route change monitoring
  useEffect(() => {
    if (!domLoaded) return;
    
    const handleRouteChange = () => {
      const currentPath = window.location.pathname;
      
      setRouteChanges(prev => {
        if (prev.length === 0 || prev[0].to !== currentPath) {
          return [{
            from: prev.length > 0 ? prev[0].to : 'initial',
            to: currentPath,
            timestamp: new Date(),
            duration: 0 // We don't have a way to measure this accurately
          }, ...prev.slice(0, 9)];
        }
        return prev;
      });
    };
    
    // Check route changes
    window.addEventListener('popstate', handleRouteChange);
    
    // Also try to detect React Router changes by observing URL changes
    const observer = new MutationObserver(() => {
      if (window.location.pathname !== routeChanges[0]?.to) {
        handleRouteChange();
      }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Initial route
    handleRouteChange();
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      observer.disconnect();
    };
  }, [domLoaded, routeChanges]);

  // User interaction monitoring
  useEffect(() => {
    if (!isMonitoringInteractions || !domLoaded) return;
    
    const handleInteraction = (e: Event) => {
      const target = e.target as HTMLElement;
      const targetInfo = target.tagName.toLowerCase() + 
                        (target.id ? `#${target.id}` : '') + 
                        (target.className ? `.${target.className.toString().replace(/\s+/g, '.')}` : '');
      
      const newInteraction: UserInteraction = {
        type: e.type,
        target: targetInfo,
        timestamp: new Date()
      };
      
      setUserInteractions(prev => [newInteraction, ...prev.slice(0, DEBUG_CONFIG.MAX_INTERACTION_HISTORY - 1)]);
    };
    
    // Track significant user interactions
    document.addEventListener('click', handleInteraction);
    document.addEventListener('submit', handleInteraction);
    document.addEventListener('keydown', handleInteraction);
    
    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('submit', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, [isMonitoringInteractions, domLoaded]);

  // Track component render performance
  const [isProfilingEnabled, setIsProfilingEnabled] = useState(false);
  const [componentRenderTimes, setComponentRenderTimes] = useState<Record<string, SlowComponent>>({});
  
  // Profiler callback
  const handleProfilerRender: ProfilerOnRenderCallback = (
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime
  ) => {
    if (!isProfilingEnabled) return;
    
    setComponentRenderTimes(prev => {
      const existing = prev[id] || { name: id, renderTime: 0, renderCount: 0 };
      
      return {
        ...prev,
        [id]: {
          name: id,
          renderTime: existing.renderTime + actualDuration,
          renderCount: existing.renderCount + 1,
          lastRenderTimestamp: commitTime,
          phase
        }
      };
    });
  };

  // Function to wrap the main React app with profilers
  const injectProfilers = () => {
    try {
      // Get the root React element
      const rootElement = document.getElementById('root');
      if (!rootElement) {
        alert('Could not find React root element (#root)');
        return;
      }
      
      // Clear previous profiling data
      setComponentRenderTimes({});
      
      // Enable profiling
      setIsProfilingEnabled(true);
      
      // Inform the user
      alert('Profiling enabled. Navigate through the app to capture component render times.');
      
      // Create a MutationObserver to detect React component renders
      const observer = new MutationObserver((mutations) => {
        // Process components after mutations
        processReactComponents();
      });
      
      // Start observing the entire document for component changes
      observer.observe(document.body, { 
        childList: true, 
        subtree: true,
        attributes: true,
        characterData: true
      });
      
      // Also process components immediately
      processReactComponents();
      
      // Cleanup function - return it for the user to call when done
      return () => {
        observer.disconnect();
        setIsProfilingEnabled(false);
        alert('Profiling disabled. Check the results in the debug panel.');
      };
    } catch (error) {
      alert(`Error setting up profiling: ${error}`);
      return null;
    }
  };
  
  // Function to analyze component structure and gather element information
  const processReactComponents = () => {
    // Get all DOM elements to analyze
    const allElements = Array.from(document.querySelectorAll('*'));
    
    // Look for React component identifiers
    allElements.forEach(el => {
      // Look for React Fiber references
      const possibleFiber = Object.keys(el).find(key => 
        key.startsWith('__reactFiber$') || 
        key.startsWith('__reactInternalInstance$')
      );
      
      if (possibleFiber) {
        const fiber = (el as any)[possibleFiber];
        if (fiber && fiber.type && typeof fiber.type === 'function') {
          const componentName = fiber.type.displayName || fiber.type.name || 'UnnamedComponent';
          const elementId = `component-${componentName}-${Math.random().toString(36).substr(2, 9)}`;
          
          // Record this component
          setComponentRenderTimes(prev => {
            if (prev[elementId]) return prev;
            
            return {
              ...prev,
              [elementId]: {
                name: componentName,
                renderTime: 0,
                renderCount: 0
              }
            };
          });
        }
      }
    });
  };
  
  // Replace the mock implementation with a real analyzer
  const analyzeRenderPerformance = () => {
    // If already profiling, stop and show results
    if (isProfilingEnabled) {
      setIsProfilingEnabled(false);
      
      // Convert the record to an array and sort by render time
      const sortedComponents = Object.values(componentRenderTimes)
        .sort((a, b) => b.renderTime - a.renderTime)
        .slice(0, 20); // Show top 20 components
      
      // Update the slowComponents state for display
      setSlowComponents(sortedComponents);
      
      alert(`Profiling complete! Found ${Object.keys(componentRenderTimes).length} components.`);
      return;
    }
    
    // Not profiling yet, so start
    const cleanup = injectProfilers();
    if (cleanup) {
      // Store cleanup function somewhere accessible if needed
      (window as any).__debugToolProfilerCleanup = cleanup;
    }
  };

  // Function to help fix tour issues
  const fixTourIssues = () => {
    try {
      // First try the showBasicTour function from LandingPage
      if (typeof (window as any).showBasicTour === 'function') {
        (window as any).showBasicTour();
        console.log('Called showBasicTour function');
      }
      
      // Force the classes that enable scrolling and display
      document.body.classList.add('tour-started');
      document.body.classList.add('tour-loaded');
      
      // Enable proper scrolling
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
      document.documentElement.style.overflow = 'auto';
      document.documentElement.style.height = 'auto';
      
      // Fix the landing page element
      const landingPage = document.querySelector('.landing-page');
      if (landingPage) {
        (landingPage as HTMLElement).classList.add('tour-started');
        (landingPage as HTMLElement).style.height = 'auto';
        (landingPage as HTMLElement).style.overflow = 'visible';
        (landingPage as HTMLElement).style.minHeight = 'auto';
      }
      
      // Try to find and fix the tour container
      const tourContainer = document.getElementById('tour-content-container');
      if (tourContainer) {
        // Fix container styles
        tourContainer.style.display = 'flex';
        tourContainer.style.flexDirection = 'column';
        tourContainer.style.opacity = '1';
        tourContainer.style.visibility = 'visible';
        
        // Scroll to it
        window.scrollTo({
          top: window.innerHeight,
          behavior: 'smooth'
        });
        
        // Try multiple scroll attempts
        setTimeout(() => {
          window.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth'
          });
        }, 500);
      }
      
      // Force all sections to be visible
      document.querySelectorAll('.tour-section').forEach(section => {
        const el = section as HTMLElement;
        el.style.display = 'flex';
        el.style.opacity = '1';
        el.style.visibility = 'visible';
        el.classList.add('is-visible');
      });
      
      alert('Tour display issues fixed! Scrolling to tour content.');
    } catch (error) {
      console.error('Error fixing tour:', error);
      alert(`Error fixing tour: ${error}`);
    }
  };

  // Function to generate site map based on links
  const generateSiteMap = () => {
    const links = Array.from(document.querySelectorAll('a'));
    const routes: {path: string, text: string}[] = [];
    
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('/') && !routes.some(r => r.path === href)) {
        routes.push({
          path: href,
          text: link.textContent || href
        });
      }
    });
    
    const siteMapText = routes.map(route => `${route.path} - ${route.text}`).join('\n');
    
    alert(`Site Map:\n\n${siteMapText}`);
  };

  // Function to find and extract important values from localStorage
  const analyzeStorage = () => {
    try {
      const storageData: Record<string, any> = {};
      
      // Check localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          try {
            const value = localStorage.getItem(key);
            if (value) {
              // Try to parse JSON
              try {
                storageData[key] = JSON.parse(value);
              } catch {
                storageData[key] = value;
              }
            }
          } catch (e) {
            storageData[key] = 'Error reading value';
          }
        }
      }
      
      // Format the output
      let output = 'LocalStorage Analysis:\n\n';
      
      // Authentication data
      if (storageData.token || storageData.user || storageData.auth) {
        output += '🔑 Auth Data:\n';
        output += storageData.token ? '- Token present (redacted)\n' : '';
        output += storageData.user ? `- User data present\n` : '';
        output += storageData.auth ? `- Auth state present\n` : '';
        output += '\n';
      }
      
      // Theme data
      if (storageData.theme || storageData.darkMode) {
        output += '🎨 Theme Data:\n';
        output += `- ${JSON.stringify(storageData.theme || storageData.darkMode)}\n\n`;
      }
      
      // App settings
      output += '⚙️ Settings:\n';
      Object.keys(storageData).forEach(key => {
        if (key.includes('setting') || key.includes('config') || key.includes('preference')) {
          output += `- ${key}: ${JSON.stringify(storageData[key])}\n`;
        }
      });
      
      // Total storage usage
      let totalSize = 0;
      Object.keys(storageData).forEach(key => {
        totalSize += key.length + JSON.stringify(storageData[key]).length;
      });
      
      output += `\n📊 Storage Usage: ${(totalSize / 1024).toFixed(2)} KB / 5120 KB (${(totalSize / 5120 / 10.24).toFixed(2)}%)`;
      
      alert(output);
    } catch (e) {
      alert(`Error analyzing storage: ${e}`);
    }
  };

  // Function to copy debug info to clipboard
  const copyDebugInfo = () => {
    const debugText = JSON.stringify(debugInfo, null, 2);
    
    navigator.clipboard.writeText(debugText)
      .then(() => {
        alert('Debug info copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy debug info:', err);
      });
  };
  
  // Run diagnostics on the page
  const runDiagnostics = () => {
    // CSS validation
    const cssIssues = [];
    const elements = document.querySelectorAll('*');
    let overflow = false;
    
    // Check for overflow issues
    elements.forEach(el => {
      const computed = window.getComputedStyle(el);
      const width = el.clientWidth;
      const scrollWidth = (el as HTMLElement).scrollWidth;
      
      if (scrollWidth > width + 10 && computed.overflow !== 'hidden') {
        overflow = true;
      }
    });
    
    if (overflow) {
      cssIssues.push('Horizontal overflow detected');
    }
    
    // Check for z-index battles
    const highZElements = Array.from(elements).filter(el => {
      const computed = window.getComputedStyle(el);
      const zIndex = parseInt(computed.zIndex);
      return !isNaN(zIndex) && zIndex > 100;
    });
    
    if (highZElements.length > 5) {
      cssIssues.push(`${highZElements.length} elements with high z-index (>100)`);
    }
    
    // Check for JS errors
    const hasConsoleErrors = logs.some(log => log.type === 'error');
    
    // Check for unloaded resources
    const images = document.querySelectorAll('img');
    const unloadedImages = Array.from(images).filter(img => !img.complete).length;
    
    // Create diagnostic alert with results
    let diagnosticReport = `📊 SeshTracker Diagnostics 📊\n\n`;
    diagnosticReport += `✅ DOM Loaded: ${domLoaded}\n`;
    diagnosticReport += `✅ Element Count: ${debugInfo.elementCounts?.total || 'Unknown'}\n`;
    diagnosticReport += `${hasConsoleErrors ? '❌' : '✅'} Console Errors: ${hasConsoleErrors ? 'Yes' : 'No'}\n`;
    diagnosticReport += `${unloadedImages > 0 ? '⚠️' : '✅'} Unloaded Images: ${unloadedImages}\n`;
    diagnosticReport += `${cssIssues.length > 0 ? '⚠️' : '✅'} CSS Issues: ${cssIssues.length > 0 ? cssIssues.join(', ') : 'None'}\n`;
    diagnosticReport += `✅ Load Time: ${debugInfo.timingData?.fullLoad ? (debugInfo.timingData.fullLoad / 1000).toFixed(2) + 's' : 'Unknown'}\n`;
    
    alert(diagnosticReport);
  };
  
  // Clear console logs
  const clearLogs = () => {
    setLogs([]);
  };
  
  // Toggle theme function to help with light/dark mode issues
  const toggleTheme = () => {
    document.body.classList.toggle('light-theme');
  };

  // Add a function to clear all persisted debug data with security logging
  const clearAllDebugData = () => {
    // Clear in-memory state
    setLogs([]);
    setApiRequests([]);
    setRouteChanges([]);
    setUserInteractions([]);
    
    // Clear from storage
    clearStoredDebugData();
    
    SecurityUtils.logSecurityEvent('Debug data cleared');
    alert('All debug data cleared');
  };

  // Add a window visibility listener to detect page navigations
  useEffect(() => {
    // This effect ensures the tool remains visible when navigating between pages
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isCollapsed) {
        // Refresh debug info, especially useful after navigation
        setDebugInfo(prev => ({
          ...prev,
          path: window.location.pathname,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          pageInfo: {
            title: document.title,
            url: window.location.href,
            referrer: document.referrer || 'direct'
          },
        }));
      }
    };
    
    // This helps maintain visibility after navigation in some scenarios
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'debugTool_isCollapsed' && e.newValue === 'false') {
        setIsCollapsed(false);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isCollapsed]);

  // Also add a feature to remember panel position
  const [panelPosition, setPanelPosition] = useState<{side: 'left'|'right'}>(() => {
    try {
      const savedPosition = localStorage.getItem('debugTool_position');
      return savedPosition ? JSON.parse(savedPosition) : {side: 'right'};
    } catch {
      return {side: 'right'};
    }
  });

  // Save panel position when it changes
  useEffect(() => {
    localStorage.setItem('debugTool_position', JSON.stringify(panelPosition));
  }, [panelPosition]);

  // Add a toggle button for panel position
  const togglePanelPosition = () => {
    setPanelPosition(prev => ({
      side: prev.side === 'right' ? 'left' : 'right'
    }));
  };

  // Add global error handling to capture uncaught errors
  useEffect(() => {
    if (!domLoaded) return;
    
    const handleGlobalError = (event: ErrorEvent) => {
      const errorMsg = `UNCAUGHT ERROR: ${event.message} at ${event.filename}:${event.lineno}:${event.colno}`;
      
      setLogs(prevLogs => {
        const newLog = {
          message: errorMsg,
          type: 'error' as LogType,
          timestamp: new Date(),
        };
        
        const updatedLogs = [newLog, ...prevLogs.slice(0, DEBUG_CONFIG.MAX_LOG_HISTORY - 1)];
        try {
          sessionStorage.setItem('debugTool_logs', JSON.stringify(updatedLogs));
        } catch (e) {
          // Avoid using console here to prevent potential loops
        }
        
        return updatedLogs;
      });
      
      // Don't prevent the default error handling
      return false;
    };
    
    const handlePromiseRejection = (event: PromiseRejectionEvent) => {
      const rejectionReason = event.reason ? 
        (typeof event.reason === 'object' ? 
         (event.reason.stack || JSON.stringify(event.reason)) : 
         String(event.reason)) 
        : 'Unknown rejection reason';
      
      const errorMsg = `UNHANDLED PROMISE REJECTION: ${rejectionReason}`;
      
      setLogs(prevLogs => {
        const newLog = {
          message: errorMsg,
          type: 'error' as LogType,
          timestamp: new Date(),
        };
        
        const updatedLogs = [newLog, ...prevLogs.slice(0, DEBUG_CONFIG.MAX_LOG_HISTORY - 1)];
        try {
          sessionStorage.setItem('debugTool_logs', JSON.stringify(updatedLogs));
        } catch (e) {
          // Avoid using console here to prevent potential loops
        }
        
        return updatedLogs;
      });
    };
    
    // Listen for uncaught errors
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handlePromiseRejection);
    
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handlePromiseRejection);
    };
  }, [domLoaded]);

  // Add copy support for long console logs
  const copyLogToClipboard = (logMessage: string) => {
    navigator.clipboard.writeText(logMessage)
      .then(() => {
        // Flash a "Copied" indicator without using alert
        const tempElement = document.createElement('div');
        tempElement.style.cssText = `
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background-color: rgba(67, 160, 71, 0.9);
          color: white;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 12px;
          z-index: 10000;
          pointer-events: none;
        `;
        tempElement.textContent = 'Copied!';
        document.body.appendChild(tempElement);
        
        setTimeout(() => {
          document.body.removeChild(tempElement);
        }, 1500);
      })
      .catch(err => {
        console.error('Failed to copy log:', err);
      });
  };

  return (
    <div 
      style={{ 
        ...debugStyles.panel, 
        ...(isCollapsed ? debugStyles.collapsed : {}),
        right: panelPosition.side === 'right' ? '0' : 'auto',
        left: panelPosition.side === 'left' ? '0' : 'auto',
        borderTopRightRadius: panelPosition.side === 'left' ? 'var(--radius-lg)' : 'none',
        borderTopLeftRadius: panelPosition.side === 'right' ? 'var(--radius-lg)' : 'none',
      }}
    >
      {!isCompatibleVersion && (
        <div style={{
          backgroundColor: 'rgba(244, 67, 54, 0.9)',
          color: 'white',
          padding: '5px 10px',
          fontSize: '10px',
          textAlign: 'center'
        }}>
          Warning: Unsupported React version ({React.version}). Debug tools may be unstable.
        </div>
      )}
      
      <div 
        style={debugStyles.header} 
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h3 style={debugStyles.title}>
          <span role="img" aria-label="cannabis">🌿</span> SeshTracker Debug
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {sessionExpiry && (
            <span style={{ 
              fontSize: '10px', 
              opacity: 0.7,
              color: Date.now() > sessionExpiry.getTime() - 5 * 60 * 1000 ? '#ff6b6b' : undefined,
              whiteSpace: 'nowrap'
            }}>
              {new Date().toLocaleTimeString()} • {formatCountdown(sessionExpiry.getTime() - Date.now())}
            </span>
          )}
          <span>{isCollapsed ? '↑' : '↓'}</span>
        </div>
      </div>

      {!isCollapsed && (
        <>
          <div style={debugStyles.tabsContainer}>
            <div 
              style={{
                ...debugStyles.tab,
                ...(activeTab === 'general' ? debugStyles.activeTab : {})
              }}
              onClick={() => setActiveTab('general')}
            >
              General
            </div>
            <div 
              style={{
                ...debugStyles.tab,
                ...(activeTab === 'console' ? debugStyles.activeTab : {})
              }}
              onClick={() => setActiveTab('console')}
            >
              Console
            </div>
            <div 
              style={{
                ...debugStyles.tab,
                ...(activeTab === 'network' ? debugStyles.activeTab : {})
              }}
              onClick={() => setActiveTab('network')}
            >
              Network
            </div>
            <div 
              style={{
                ...debugStyles.tab,
                ...(activeTab === 'tools' ? debugStyles.activeTab : {})
              }}
              onClick={() => setActiveTab('tools')}
            >
              Tools
            </div>
          </div>

          <div style={debugStyles.content}>
            {activeTab === 'general' && (
              <>
                <div style={debugStyles.section}>
                  <div style={debugStyles.sectionTitle}>System</div>
                  <div style={debugStyles.infoGroup}>
                    <div style={debugStyles.infoItem}>
                      <span style={debugStyles.label}>Build Version:</span>
                      <span style={debugStyles.value}>{debugInfo.buildVersion}</span>
                    </div>
                    <div style={debugStyles.infoItem}>
                      <span style={debugStyles.label}>Environment:</span>
                      <span style={debugStyles.value}>{debugInfo.environment}</span>
                    </div>
                    <div style={debugStyles.infoItem}>
                      <span style={debugStyles.label}>React Version:</span>
                      <span style={debugStyles.value}>{debugInfo.reactVersion}</span>
                    </div>
                    <div style={debugStyles.infoItem}>
                      <span style={debugStyles.label}>LocalStorage:</span>
                      <span style={{
                        ...debugStyles.value,
                        color: debugInfo.isLocalStorage ? '#76d275' : '#ff6b6b'
                      }}>
                        {debugInfo.isLocalStorage ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    <div style={debugStyles.infoItem}>
                      <span style={debugStyles.label}>Memory:</span>
                      <span style={debugStyles.value}>{debugInfo.memoryUsage || 'N/A'}</span>
                    </div>
                  </div>

                  <div style={debugStyles.sectionTitle}>Page</div>
                  <div style={debugStyles.infoGroup}>
                    <div style={debugStyles.infoItem}>
                      <span style={debugStyles.label}>Path:</span>
                      <span style={debugStyles.value}>{debugInfo.path}</span>
                    </div>
                    <div style={debugStyles.infoItem}>
                      <span style={debugStyles.label}>Viewport:</span>
                      <span style={debugStyles.value}>{debugInfo.viewport}</span>
                    </div>
                    <div style={debugStyles.infoItem}>
                      <span style={debugStyles.label}>Render Count:</span>
                      <span style={debugStyles.value}>{debugInfo.renderCount}</span>
                    </div>
                    <div style={debugStyles.infoItem}>
                      <span style={debugStyles.label}>Element Count:</span>
                      <span style={debugStyles.value}>
                        {debugInfo.elementCounts ? 
                          `${debugInfo.elementCounts.visible} / ${debugInfo.elementCounts.total}` : 
                          'N/A'}
                      </span>
                    </div>
                    <div style={debugStyles.infoItem}>
                      <span style={debugStyles.label}>Load Time:</span>
                      <span style={debugStyles.value}>
                        {debugInfo.timingData?.fullLoad ? 
                          `${(debugInfo.timingData.fullLoad / 1000).toFixed(2)}s` : 
                          'N/A'}
                      </span>
                    </div>
                  </div>

                  <div style={debugStyles.buttonContainer}>
                    <button 
                      style={{...debugStyles.button, ...debugStyles.buttonHalf}}
                      onClick={copyDebugInfo}
                    >
                      Copy Debug Info
                    </button>
                    <button 
                      style={{...debugStyles.button, ...debugStyles.buttonHalf}}
                      onClick={() => setIsCollapsed(true)}
                    >
                      Minimize
                    </button>
                  </div>

                  <button 
                    style={debugStyles.button}
                    onClick={togglePanelPosition}
                  >
                    Move Panel to {panelPosition.side === 'right' ? 'Left' : 'Right'} Side
                  </button>
                </div>
              </>
            )}

            {activeTab === 'console' && (
              <div style={debugStyles.section}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px'
                }}>
                  <div style={debugStyles.sectionTitle}>Console Output</div>
                  <button
                    style={{
                      ...debugStyles.button,
                      width: 'auto',
                      padding: '3px 8px',
                      margin: 0
                    }}
                    onClick={clearLogs}
                  >
                    Clear
                  </button>
                </div>
                
                <div style={{
                  maxHeight: '300px',
                  overflowY: 'auto',
                  border: '1px solid rgba(67, 160, 71, 0.2)',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  padding: '5px'
                }}>
                  {logs.length === 0 ? (
                    <div style={{
                      padding: '10px',
                      color: '#888',
                      fontStyle: 'italic',
                      textAlign: 'center',
                      fontSize: '11px'
                    }}>
                      No console output captured yet
                    </div>
                  ) : (
                    logs.map((log, index) => (
                      <div 
                        key={index} 
                        style={{
                          ...debugStyles.consoleRow,
                          ...(log.type === 'log' ? debugStyles.log : 
                             log.type === 'warn' ? debugStyles.warn :
                             debugStyles.error),
                          cursor: 'pointer',
                        }}
                        onClick={() => copyLogToClipboard(log.message)}
                        title="Click to copy log message"
                      >
                        <span style={{opacity: 0.7, marginRight: '5px'}}>
                          {log.timestamp.toLocaleTimeString()} 
                        </span>
                        <span>{log.message}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'network' && (
              <div style={debugStyles.section}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px'
                }}>
                  <div style={debugStyles.sectionTitle}>API Requests</div>
                  <button
                    style={{
                      ...debugStyles.button,
                      width: 'auto',
                      padding: '3px 8px',
                      margin: 0,
                      backgroundColor: isMonitoringXHR ? 'rgba(244, 67, 54, 0.15)' : 'rgba(67, 160, 71, 0.15)',
                      borderColor: isMonitoringXHR ? 'rgba(244, 67, 54, 0.5)' : 'rgba(67, 160, 71, 0.5)',
                      color: isMonitoringXHR ? '#ff6b6b' : '#76d275'
                    }}
                    onClick={() => setIsMonitoringXHR(!isMonitoringXHR)}
                  >
                    {isMonitoringXHR ? 'Stop Monitoring' : 'Start Monitoring'}
                  </button>
                </div>
                
                {!isMonitoringXHR && (
                  <div style={{
                    padding: '10px',
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    border: '1px solid rgba(255, 193, 7, 0.2)',
                    borderRadius: '4px',
                    marginBottom: '10px',
                    fontSize: '11px',
                    color: '#ffd54f'
                  }}>
                    Click 'Start Monitoring' to track API requests
                  </div>
                )}
                
                <div style={{
                  maxHeight: '300px',
                  overflowY: 'auto',
                  border: '1px solid rgba(67, 160, 71, 0.2)',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  padding: '5px'
                }}>
                  {apiRequests.length === 0 ? (
                    <div style={{
                      padding: '10px',
                      color: '#888',
                      fontStyle: 'italic',
                      textAlign: 'center',
                      fontSize: '11px'
                    }}>
                      No API requests captured yet
                    </div>
                  ) : (
                    apiRequests.map((request, index) => (
                      <div 
                        key={index} 
                        style={{
                          padding: '8px',
                          marginBottom: '5px',
                          backgroundColor: 'rgba(25, 25, 25, 0.8)',
                          borderRadius: '4px',
                          fontSize: '11px',
                          borderLeft: `3px solid ${request.status && request.status >= 400 ? '#ff6b6b' : '#76d275'}`
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '5px'
                        }}>
                          <span style={{fontWeight: 'bold', color: '#e0e0e0'}}>{request.method} {request.url.split('?')[0]}</span>
                          <span style={{color: request.status && request.status >= 400 ? '#ff6b6b' : '#76d275'}}>
                            {request.status || 'N/A'} ({request.duration.toFixed(0)}ms)
                          </span>
                        </div>
                        
                        {request.payload && (
                          <div style={{marginBottom: '5px'}}>
                            <details>
                              <summary style={{color: '#b3b3b3', cursor: 'pointer'}}>Payload</summary>
                              <pre style={{
                                fontSize: '10px',
                                margin: '5px 0',
                                padding: '5px',
                                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                color: '#e0e0e0',
                                overflowX: 'auto',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-all'
                              }}>{request.payload}</pre>
                            </details>
                          </div>
                        )}
                        
                        {request.response && (
                          <div>
                            <details>
                              <summary style={{color: '#b3b3b3', cursor: 'pointer'}}>Response</summary>
                              <pre style={{
                                fontSize: '10px',
                                margin: '5px 0',
                                padding: '5px',
                                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                color: '#e0e0e0',
                                overflowX: 'auto',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-all'
                              }}>{request.response}</pre>
                            </details>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
                
                <div style={{...debugStyles.sectionTitle, marginTop: '20px'}}>Route Changes</div>
                <div style={{
                  maxHeight: '150px',
                  overflowY: 'auto',
                  border: '1px solid rgba(67, 160, 71, 0.2)',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  padding: '5px'
                }}>
                  {routeChanges.length === 0 ? (
                    <div style={{
                      padding: '10px',
                      color: '#888',
                      fontStyle: 'italic',
                      textAlign: 'center',
                      fontSize: '11px'
                    }}>
                      No route changes captured
                    </div>
                  ) : (
                    routeChanges.map((route, index) => (
                      <div 
                        key={index} 
                        style={{
                          padding: '5px 8px',
                          marginBottom: '2px',
                          backgroundColor: 'rgba(25, 25, 25, 0.8)',
                          borderRadius: '4px',
                          fontSize: '11px',
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}
                      >
                        <span style={{color: '#e0e0e0'}}>{route.from} → {route.to}</span>
                        <span style={{color: '#b3b3b3'}}>{new Date(route.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'tools' && (
              <div style={debugStyles.section}>
                <div style={debugStyles.sectionTitle}>Debug Tools</div>
                
                <button 
                  style={debugStyles.button}
                  onClick={runDiagnostics}
                >
                  Run Page Diagnostics
                </button>
                
                <button 
                  style={debugStyles.button}
                  onClick={toggleTheme}
                >
                  Toggle Light/Dark Theme
                </button>
                
                <button 
                  style={debugStyles.button}
                  onClick={fixTourIssues}
                >
                  Fix Tour Display Issues
                </button>
                
                <button 
                  style={debugStyles.button}
                  onClick={() => {
                    localStorage.clear();
                    sessionStorage.clear();
                    alert('Local & Session Storage Cleared!');
                  }}
                >
                  Clear Browser Storage
                </button>
                
                <button 
                  style={debugStyles.button}
                  onClick={() => window.location.reload()}
                >
                  Reload Page
                </button>

                <div style={debugStyles.sectionTitle}>Advanced Tools</div>
                
                <button 
                  style={{
                    ...debugStyles.button,
                    backgroundColor: isProfilingEnabled ? 'rgba(244, 67, 54, 0.15)' : 'rgba(67, 160, 71, 0.15)',
                    borderColor: isProfilingEnabled ? 'rgba(244, 67, 54, 0.5)' : 'rgba(67, 160, 71, 0.5)',
                    color: isProfilingEnabled ? '#ff6b6b' : '#76d275'
                  }}
                  onClick={analyzeRenderPerformance}
                >
                  {isProfilingEnabled ? 'Stop Component Profiling' : 'Analyze Component Performance'}
                </button>
                
                {slowComponents.length > 0 && (
                  <div style={{
                    maxHeight: '200px',
                    overflowY: 'auto',
                    border: '1px solid rgba(67, 160, 71, 0.2)',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    padding: '5px',
                    marginTop: '10px'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '5px',
                      borderBottom: '1px solid rgba(67, 160, 71, 0.3)',
                      fontWeight: 'bold',
                      fontSize: '11px'
                    }}>
                      <span style={{flex: 2}}>Component</span>
                      <span style={{flex: 1, textAlign: 'right'}}>Render Time</span>
                      <span style={{flex: 1, textAlign: 'right'}}>Render Count</span>
                    </div>
                    {slowComponents.map((comp, index) => (
                      <div 
                        key={index}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '5px',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                          fontSize: '11px',
                          backgroundColor: index % 2 === 0 ? 'rgba(0, 0, 0, 0.2)' : 'transparent'
                        }}
                      >
                        <span style={{flex: 2, color: '#e0e0e0'}}>{comp.name}</span>
                        <span style={{flex: 1, textAlign: 'right', color: comp.renderTime > 10 ? '#ff6b6b' : '#76d275'}}>
                          {comp.renderTime.toFixed(2)}ms
                        </span>
                        <span style={{flex: 1, textAlign: 'right', color: '#b3b3b3'}}>
                          {comp.renderCount}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                
                <button 
                  style={debugStyles.button}
                  onClick={analyzeStorage}
                >
                  Analyze Local Storage
                </button>
                
                <button 
                  style={debugStyles.button}
                  onClick={generateSiteMap}
                >
                  Generate Site Map
                </button>
                
                <button 
                  style={{
                    ...debugStyles.button,
                    backgroundColor: isMonitoringInteractions ? 'rgba(244, 67, 54, 0.15)' : 'rgba(67, 160, 71, 0.15)',
                    borderColor: isMonitoringInteractions ? 'rgba(244, 67, 54, 0.5)' : 'rgba(67, 160, 71, 0.5)',
                    color: isMonitoringInteractions ? '#ff6b6b' : '#76d275'
                  }}
                  onClick={() => setIsMonitoringInteractions(!isMonitoringInteractions)}
                >
                  {isMonitoringInteractions ? 'Stop User Interaction Tracking' : 'Track User Interactions'}
                </button>
                
                {isMonitoringInteractions && userInteractions.length > 0 && (
                  <div style={{
                    maxHeight: '150px',
                    overflowY: 'auto',
                    border: '1px solid rgba(67, 160, 71, 0.2)',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    padding: '5px',
                    marginTop: '10px',
                    fontSize: '11px'
                  }}>
                    {userInteractions.map((interaction, index) => (
                      <div key={index} style={{
                        padding: '3px 0',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                      }}>
                        <span style={{color: '#b3b3b3'}}>{interaction.type}</span>: <span style={{color: '#e0e0e0'}}>{interaction.target.length > 30 ? interaction.target.substring(0, 30) + '...' : interaction.target}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={debugStyles.sectionTitle}>Tour & Landing Page Tools</div>
                
                <button 
                  style={{
                    ...debugStyles.button,
                    backgroundColor: 'rgba(123, 44, 191, 0.15)',
                    borderColor: 'rgba(123, 44, 191, 0.5)',
                    color: '#ae52f4'
                  }}
                  onClick={fixTourIssues}
                >
                  Complete Tour Repair
                </button>
                
                <button 
                  style={debugStyles.button}
                  onClick={() => {
                    // Advanced button click simulation
                    const discoverButton = document.getElementById('discoverButton');
                    if (discoverButton) {
                      // Create and dispatch events
                      ['mousedown', 'mouseup', 'click'].forEach(eventType => {
                        const event = new MouseEvent(eventType, {
                          bubbles: true,
                          cancelable: true,
                          view: window
                        });
                        discoverButton.dispatchEvent(event);
                      });
                      alert('Tour discover button clicked through event simulation');
                    } else {
                      alert('Discover button not found');
                    }
                  }}
                >
                  Simulate Discover Button Click
                </button>
                
                <button 
                  style={debugStyles.button}
                  onClick={() => {
                    // Direct function call attempt for tour
                    if (typeof (window as any).showBasicTour === 'function') {
                      (window as any).showBasicTour();
                      alert('Called showBasicTour() function directly');
                    } else if (typeof (window as any).handleDiscoverClick === 'function') {
                      (window as any).handleDiscoverClick();
                      alert('Called handleDiscoverClick() function directly');
                    } else {
                      alert('No tour functions found in global scope');
                    }
                  }}
                >
                  Call Tour Function Directly
                </button>

                <div style={debugStyles.sectionTitle}>Security</div>
                
                <button 
                  style={debugStyles.button}
                  onClick={() => {
                    // Force session expiry
                    DebugSession.endSession();
                    SecurityUtils.logSecurityEvent('Debug session manually ended');
                    setSessionExpiry(null);
                    alert('Debug session ended. Refresh the page to start a new session.');
                  }}
                >
                  End Debug Session
                </button>
                
                <button 
                  style={{
                    ...debugStyles.button,
                    backgroundColor: 'rgba(244, 67, 54, 0.15)',
                    borderColor: 'rgba(244, 67, 54, 0.5)',
                    color: '#ff6b6b',
                    marginTop: '15px'
                  }}
                  onClick={clearAllDebugData}
                >
                  Clear All Debug Data
                </button>
              </div>
            )}
          </div>
          
          {/* Session timeout warning bar */}
          {sessionExpiry && Date.now() > sessionExpiry.getTime() - 5 * 60 * 1000 && (
            <div style={{
              backgroundColor: 'rgba(255, 87, 34, 0.1)',
              borderTop: '1px solid rgba(255, 87, 34, 0.2)',
              padding: '5px 10px',
              fontSize: '10px',
              textAlign: 'center',
              color: '#ff9800'
            }}>
              Session expires in {formatCountdown(sessionExpiry.getTime() - Date.now())}
            </div>
          )}
        </>
      )}
    </div>
  );
};

interface DebugToolProps {
  enabled?: boolean;
}

// Main Debug Tool Component that will be imported
const DebugTool: React.FC<DebugToolProps> = ({ enabled = import.meta.env.MODE !== 'production' }) => {
  // Use the auth hook to get the current user
  const auth = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  // Check if the current user is the developer
  useEffect(() => {
    // If auth is loaded and we have a user, check if their ID matches the developer ID
    if (!auth?.isLoading && auth?.user) {
      // Only allow the specific developer user ID
      const hasAccess = auth.user.id === DEBUG_CONFIG.DEVELOPER_USER_ID;
      setIsAuthorized(hasAccess);
      
      // Log access attempt for security auditing
      if (hasAccess) {
        SecurityUtils.logSecurityEvent('Developer accessing debug tools', { 
          userId: DEBUG_CONFIG.DEVELOPER_USER_ID,
          email: DEBUG_CONFIG.DEVELOPER_EMAIL
        });
      } else {
        // Log unauthorized access attempt
        SecurityUtils.logSecurityEvent('Unauthorized debug tool access attempt', {
          userId: auth.user.id,
          email: auth.user.email
        });
      }
    } else {
      setIsAuthorized(false);
    }
  }, [auth?.isLoading, auth?.user]);
  
  // Only render if:
  // 1. Debug tool is enabled via prop or non-production mode
  // 2. User is authenticated and has developer permissions
  if (!enabled || !isAuthorized) return null;
  
  // Create portal for the debug panel
  return createPortal(<DebugPanel />, document.body);
};

export default DebugTool; 