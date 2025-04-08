import React, { useState, useEffect } from 'react';
import { WidgetType } from './types';
import { WidgetRegistry } from './widgets';

// Get the appropriate icon for a widget based on its type
const getWidgetIcon = (widget: WidgetType) => {
  switch (widget.id) {
    case 'statistics-card':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="3" y1="9" x2="21" y2="9"></line>
          <line x1="15" y1="21" x2="15" y2="9"></line>
          <line x1="9" y1="21" x2="9" y2="9"></line>
        </svg>
      );
    case 'status-indicator':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      );
    case 'consumption-trend':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
          <polyline points="17 6 23 6 23 12"></polyline>
        </svg>
      );
    case 'inventory-breakdown':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M5.84 5.84L18.16 18.16"></path>
          <path d="M5.84 18.16L18.16 5.84"></path>
        </svg>
      );
    case 'session-heatmap':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      );
    case 'quick-session':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          <line x1="12" y1="11" x2="12" y2="17"></line>
          <line x1="9" y1="14" x2="15" y2="14"></line>
        </svg>
      );
    case 'inventory-quick-add':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="12" y1="8" x2="12" y2="16"></line>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
      );
    case 'recent-activity':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="3" y1="9" x2="21" y2="9"></line>
          <line x1="9" y1="21" x2="9" y2="9"></line>
        </svg>
      );
  }
};

interface WidgetSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWidget: (widgetTypeId: string) => void;
}

const WidgetSelectorModal: React.FC<WidgetSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectWidget,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredWidgets, setFilteredWidgets] = useState<WidgetType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedWidget, setSelectedWidget] = useState<WidgetType | null>(null);
  const categories = WidgetRegistry.getWidgetCategories();

  // Get all widgets on component mount
  useEffect(() => {
    const widgets = WidgetRegistry.getAllWidgetTypes();
    setFilteredWidgets(widgets);
  }, []);

  // Filter widgets based on search query and selected category
  useEffect(() => {
    let widgets = WidgetRegistry.getAllWidgetTypes();

    // Filter by category if one is selected
    if (selectedCategory) {
      widgets = widgets.filter(widget => widget.category === selectedCategory);
    }

    // Filter by search query if one exists
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      widgets = widgets.filter(
        widget => 
          widget.name.toLowerCase().includes(query) || 
          widget.category.toLowerCase().includes(query)
      );
    }

    setFilteredWidgets(widgets);
  }, [searchQuery, selectedCategory]);

  // Handle widget selection
  const handleSelectWidget = (widget: WidgetType) => {
    if (selectedWidget && selectedWidget.id === widget.id) {
      // If clicking already selected widget, add it
      onSelectWidget(widget.id);
      onClose();
    } else {
      // Otherwise just select it to show details
      setSelectedWidget(widget);
    }
  };

  // Add the selected widget
  const handleAddSelectedWidget = () => {
    if (selectedWidget) {
      onSelectWidget(selectedWidget.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="widget-selector-modal-overlay">
      <div className="widget-selector-modal">
        <div className="widget-selector-header">
          <h2>Select a Widget</h2>
          <button className="modal-close-button" onClick={onClose} aria-label="Close">
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
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="widget-selector-search">
          <input
            type="text"
            placeholder="Search widgets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search widgets"
          />
        </div>
        
        <div className="widget-selector-categories">
          <button
            className={`category-button ${selectedCategory === null ? 'active' : ''}`}
            onClick={() => setSelectedCategory(null)}
          >
            All Widgets
          </button>
          {categories.map(({ category, count }) => (
            <button
              key={category}
              className={`category-button ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category} ({count})
            </button>
          ))}
        </div>
        
        <div className="widget-selector-content">
          <div className="widget-selector-grid">
            {filteredWidgets.length === 0 ? (
              <div className="no-widgets-found">
                <p>No widgets found matching your search criteria.</p>
              </div>
            ) : (
              filteredWidgets.map((widget) => (
                <div 
                  key={widget.id} 
                  className={`widget-card ${selectedWidget?.id === widget.id ? 'selected' : ''}`}
                  onClick={() => handleSelectWidget(widget)}
                  data-category={widget.category}
                >
                  <div className="widget-card-header">
                    <h3>{widget.name}</h3>
                    <span className="widget-category">{widget.category}</span>
                  </div>
                  <div className="widget-card-preview">
                    <div className="widget-preview-placeholder">
                      {getWidgetIcon(widget)}
                    </div>
                  </div>
                  <p className="widget-card-description">
                    A {widget.name.toLowerCase()} to help visualize your data.
                  </p>
                </div>
              ))
            )}
          </div>

          {selectedWidget && (
            <div className="widget-detail-panel">
              <h3>{selectedWidget.name}</h3>
              <span className="widget-category-badge">{selectedWidget.category}</span>
              
              <div className="widget-preview-large">
                {getWidgetIcon(selectedWidget)}
              </div>
              
              <div className="widget-description">
                <p>
                  This widget provides visualization and tracking for your {selectedWidget.name.toLowerCase()} data.
                  Add it to your dashboard to monitor key metrics and insights.
                </p>
              </div>
              
              <div className="widget-default-props">
                <h4>Default Configuration</h4>
                <ul>
                  {selectedWidget.defaultProps && Object.entries(selectedWidget.defaultProps).map(([key, value]) => (
                    <li key={key}><strong>{key}:</strong> {String(value)}</li>
                  ))}
                </ul>
              </div>
              
              <button 
                className="add-widget-button"
                onClick={handleAddSelectedWidget}
              >
                Add to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WidgetSelectorModal; 