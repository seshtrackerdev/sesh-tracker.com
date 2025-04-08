import React, { useState } from 'react';
import { useDashboard } from './DashboardContext';
import { DashboardRow as DashboardRowType } from './types';
import DashboardColumn from './DashboardColumn';

interface DashboardRowProps {
  row: DashboardRowType;
}

const DashboardRow: React.FC<DashboardRowProps> = ({ row }) => {
  const { 
    isEditing, 
    removeRow, 
    moveRow, 
    duplicateRow, 
    openLayoutModal,
    renameRow,
    toggleRowTitle
  } = useDashboard();

  const [isRenaming, setIsRenaming] = useState(false);
  const [nameInput, setNameInput] = useState(row.name || '');

  // Get a display name based on row index or ID
  const getRowDisplayName = () => {
    if (row.name) return row.name;
    
    // If we have an index, use it
    if (row.index) return `Row ${row.index}`;
    
    // Fall back to using the first part of the ID
    return `Row ${row.id.split('-')[0]}`;
  };

  const handleRenameClick = () => {
    setNameInput(row.name || '');
    setIsRenaming(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameInput(e.target.value);
  };

  const handleNameSubmit = () => {
    const trimmedName = nameInput.trim();
    if (trimmedName) {
      renameRow(row.id, trimmedName);
    }
    setIsRenaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    } else if (e.key === 'Escape') {
      setIsRenaming(false);
    }
  };

  // Determine if the title should be shown (default to true if not explicitly set)
  const shouldShowTitle = row.showTitle !== false;

  return (
    <div className="dashboard-row">
      {isEditing && (
        <div className="dashboard-row-controls">
          <div className="dashboard-row-label">
            {isRenaming ? (
              <div className="row-rename-container">
                <input
                  type="text"
                  value={nameInput}
                  onChange={handleNameChange}
                  onBlur={handleNameSubmit}
                  onKeyDown={handleKeyDown}
                  className="row-rename-input"
                  placeholder={`Row ${row.index || ''}`}
                  autoFocus
                />
              </div>
            ) : (
              <div className="row-name-display" onClick={handleRenameClick}>
                <span className="row-name">{getRowDisplayName()}</span>
                <span className="row-edit-name-icon" title="Rename row">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="12" 
                    height="12" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </span>
              </div>
            )}
          </div>
          <div className="dashboard-row-actions">
            <button
              className="dashboard-row-action-button"
              onClick={() => moveRow(row.id, 'up')}
              aria-label="Move row up"
              title="Move Up"
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
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
            </button>
            <button
              className="dashboard-row-action-button"
              onClick={() => moveRow(row.id, 'down')}
              aria-label="Move row down"
              title="Move Down"
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
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <button
              className="dashboard-row-action-button"
              onClick={() => duplicateRow(row.id)}
              aria-label="Duplicate row"
              title="Duplicate Row"
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
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
            <button
              className="dashboard-row-action-button"
              onClick={() => openLayoutModal(row.id)}
              aria-label="Change row layout"
              title="Change Layout"
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
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="12" y1="3" x2="12" y2="21"></line>
              </svg>
            </button>
            <button
              className="dashboard-row-action-button"
              onClick={() => toggleRowTitle(row.id)}
              aria-label="Toggle row title visibility"
              title={shouldShowTitle ? "Hide Title" : "Show Title"}
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
                {shouldShowTitle ? (
                  // Eye icon (visible)
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                ) : (
                  // Eye-off icon (hidden)
                  <>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </>
                )}
              </svg>
            </button>
            <button
              className="dashboard-row-action-button dashboard-row-delete"
              onClick={() => removeRow(row.id)}
              aria-label="Delete row"
              title="Delete Row"
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
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Only show the title when not editing and showTitle is true */}
      {!isEditing && shouldShowTitle && row.name && (
        <div className="dashboard-row-title">
          <h3>{row.name}</h3>
        </div>
      )}

      <div className="dashboard-row-content">
        {row.layout.columns.map((column) => (
          <DashboardColumn
            key={column.id}
            rowId={row.id}
            column={column}
          />
        ))}
      </div>
    </div>
  );
};

export default DashboardRow; 