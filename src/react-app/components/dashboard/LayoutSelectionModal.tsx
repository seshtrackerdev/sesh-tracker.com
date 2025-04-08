import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { RowLayout } from './types';
import './Dashboard.css';

interface LayoutOption {
  id: string;
  name: string;
  description: string;
  columns: number[];
}

const LAYOUT_OPTIONS: LayoutOption[] = [
  {
    id: 'single-column',
    name: 'Full Width',
    description: 'One full width column',
    columns: [100]
  },
  {
    id: 'two-equal',
    name: '50/50 Split',
    description: 'Two equal width columns',
    columns: [50, 50]
  },
  {
    id: 'three-equal',
    name: 'Equal Thirds',
    description: 'Three equal width columns',
    columns: [33.33, 33.33, 33.34]
  },
  {
    id: 'left-sidebar',
    name: 'Left Sidebar',
    description: 'Narrow left column with wider right column',
    columns: [30, 70]
  },
  {
    id: 'right-sidebar',
    name: 'Right Sidebar',
    description: 'Wider left column with narrow right column',
    columns: [70, 30]
  },
  {
    id: 'three-column-wide-center',
    name: 'Wide Center',
    description: 'Narrow side columns with wider center column',
    columns: [25, 50, 25]
  },
  {
    id: 'four-equal',
    name: 'Four Columns',
    description: 'Four equal width columns',
    columns: [25, 25, 25, 25]
  },
  {
    id: 'two-one-asymmetric',
    name: '2:1 Ratio',
    description: 'Two columns in a 2:1 ratio',
    columns: [66.67, 33.33]
  }
];

interface LayoutSelectionModalProps {
  onSelect: (layout: RowLayout) => void;
  onCancel: () => void;
}

const LayoutSelectionModal: React.FC<LayoutSelectionModalProps> = ({ 
  onSelect, 
  onCancel 
}) => {
  const [selectedLayoutId, setSelectedLayoutId] = useState<string | null>(null);

  const handleLayoutSelect = (layoutOption: LayoutOption) => {
    setSelectedLayoutId(layoutOption.id);
  };

  const handleConfirm = () => {
    if (!selectedLayoutId) return;
    
    const selectedLayout = LAYOUT_OPTIONS.find(layout => layout.id === selectedLayoutId);
    if (!selectedLayout) return;
    
    // Create a new row layout based on the selected template
    const newLayout: RowLayout = {
      id: uuidv4(),
      columns: selectedLayout.columns.map(widthPercentage => ({
        id: uuidv4(),
        widthPercentage
      }))
    };
    
    onSelect(newLayout);
  };

  return (
    <div className="modal-backdrop">
      <div className="layout-selection-modal">
        <div className="modal-header">
          <h2>Select Row Layout</h2>
          <button className="modal-close-button" onClick={onCancel} aria-label="Close modal">×</button>
        </div>
        
        <div className="layout-options-container">
          {LAYOUT_OPTIONS.map(layout => (
            <div 
              key={layout.id}
              className={`layout-option ${selectedLayoutId === layout.id ? 'selected' : ''}`}
              onClick={() => handleLayoutSelect(layout)}
              data-layout-id={layout.id}
            >
              <div className="layout-preview">
                {layout.columns.map((width, index) => (
                  <div 
                    key={index}
                    className="layout-preview-column"
                    style={{ width: `${width}%` }}
                  />
                ))}
              </div>
              <div className="layout-info">
                <h3>{layout.name}</h3>
                <p>{layout.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="modal-footer">
          <button className="secondary-button" onClick={onCancel}>Cancel</button>
          <button 
            className="primary-button" 
            onClick={handleConfirm}
            disabled={!selectedLayoutId}
          >
            Apply Layout
          </button>
        </div>
      </div>
    </div>
  );
};

export default LayoutSelectionModal; 