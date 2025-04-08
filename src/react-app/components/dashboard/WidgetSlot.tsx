import React, { useMemo, useEffect } from 'react';
import { useDashboard } from './DashboardContext';
import { getWidgetComponent, getWidgetTypeById } from './widgets/WidgetRegistry';
import WidgetComponents from './widgets/implementations';

// Debug logging
console.log('WidgetSlot loaded: imports available', {
  useDashboard: !!useDashboard,
  getWidgetComponent: !!getWidgetComponent,
  getWidgetTypeById: !!getWidgetTypeById,
  WidgetComponents: !!WidgetComponents,
  ComponentKeys: Object.keys(WidgetComponents || {})
});

interface WidgetSlotProps {
  rowId: string;
  columnId: string;
  widgetId?: string;
}

const WidgetSlot: React.FC<WidgetSlotProps> = ({ rowId, columnId, widgetId }) => {
  const {
    isEditing,
    openWidgetSelectorModal,
    removeWidget,
    getWidgetInstance,
    toggleWidgetTitle,
  } = useDashboard();

  // Get the widget instance data
  const widgetInstance = widgetId ? getWidgetInstance(widgetId) : null;
  
  // Get the widget type data based on the instance type
  const widgetType = useMemo(() => {
    if (!widgetInstance) return null;
    return getWidgetTypeById(widgetInstance.widgetTypeId);
  }, [widgetInstance]);

  // Get the proper widget component based on the widget type
  const WidgetComponent = useMemo(() => {
    if (!widgetType) return null;
    
    // First try to get the component directly from the WidgetComponents
    if (widgetType.component in WidgetComponents) {
      console.log(`Loading widget component directly: ${widgetType.component}`);
      return WidgetComponents[widgetType.component as keyof typeof WidgetComponents];
    }
    
    // Fallback to the registry
    const component = getWidgetComponent(widgetType.component);
    if (component) {
      console.log(`Loading widget component from registry: ${widgetType.component}`);
      return component;
    }
    
    console.error(`Widget component not found: ${widgetType.component}`);
    return null;
  }, [widgetType]);

  // Add debugging for widget loading
  useEffect(() => {
    if (widgetId && widgetType) {
      console.log('Loading widget:', {
        widgetId,
        widgetTypeId: widgetInstance?.widgetTypeId,
        componentName: widgetType.component,
        availableComponents: Object.keys(WidgetComponents),
        componentFound: widgetType.component in WidgetComponents,
        fallbackComponent: getWidgetComponent(widgetType.component) !== null
      });
    }
  }, [widgetId, widgetType, widgetInstance]);

  const handleRemoveWidget = () => {
    if (widgetId) {
      removeWidget(rowId, columnId);
    }
  };

  const handleConfigureWidget = (widgetId: string) => {
    // This will be implemented in a future phase
    console.log('Configure widget:', widgetId);
  };

  // Empty slot when in edit mode
  if (!widgetId && isEditing) {
    return (
      <div className="widget-slot widget-slot-empty">
        <button 
          className="add-widget-button"
          onClick={() => openWidgetSelectorModal(rowId, columnId)}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Add Widget</span>
        </button>
      </div>
    );
  }

  // Empty slot when not in edit mode
  if (!widgetId && !isEditing) {
    return (
      <div className="widget-slot widget-slot-empty widget-slot-hidden">
        {/* Hidden when not in edit mode */}
      </div>
    );
  }

  // Unrecognized widget
  if (!WidgetComponent || !widgetInstance || !widgetType) {
    return (
      <div className="widget-slot widget-slot-error">
        <div className="widget-error-message">
          <span>Widget not found or incorrectly configured</span>
          {isEditing && (
            <button 
              className="remove-widget-button"
              onClick={handleRemoveWidget}
            >
              Remove
            </button>
          )}
        </div>
      </div>
    );
  }

  // Render the actual widget with the instance data
  return (
    <div className="widget-slot">
      <WidgetComponent
        instance={widgetInstance}
        isEditing={isEditing}
        onConfigureWidget={handleConfigureWidget}
        onRemoveWidget={handleRemoveWidget}
        onToggleTitle={() => toggleWidgetTitle(widgetInstance.id)}
      />
    </div>
  );
};

export default WidgetSlot; 