import React, { useState } from 'react';
import { WidgetInstance } from '../types';

// Base props that all widgets will receive
export interface WidgetProps {
  instance: WidgetInstance;
  isEditing: boolean;
  onConfigureWidget?: (widgetId: string) => void;
  onRemoveWidget?: () => void;
  shouldShowTitle?: boolean;
  onToggleTitle?: () => void;
}

// Higher-order component to wrap all widgets with common functionality
export const withWidgetWrapper = <P extends WidgetProps>(
  WrappedComponent: React.ComponentType<P>
) => {
  const WidgetWrapper: React.FC<P> = (props) => {
    const { instance, isEditing, onConfigureWidget, onRemoveWidget } = props;
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    // Determine if the title should be shown (default to true if not explicitly set)
    const shouldShowTitle = instance.showTitle !== false;

    return (
      <div 
        className={`widget-wrapper ${isEditing ? 'widget-editing' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        data-widget-id={instance.id}
      >
        {isEditing && isHovered && (
          <div className="widget-controls">
            <button 
              className="widget-control-button widget-configure"
              onClick={() => onConfigureWidget?.(instance.id)}
              aria-label="Configure widget"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>
            <button 
              className="widget-control-button widget-remove"
              onClick={() => onRemoveWidget?.()}
              aria-label="Remove widget"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        )}

        <div className="widget-content">
          <WrappedComponent {...props} shouldShowTitle={shouldShowTitle} />
        </div>
      </div>
    );
  };

  return WidgetWrapper;
};

// Abstract base class for widget implementations (for documentation purposes)
export abstract class BaseWidget<P extends Record<string, any>> {
  abstract displayName: string;
  abstract description: string;
  abstract category: string;
  abstract defaultProps: P;
  
  // Each widget should implement its own render method
  abstract render(props: P & WidgetProps): React.ReactNode;
} 