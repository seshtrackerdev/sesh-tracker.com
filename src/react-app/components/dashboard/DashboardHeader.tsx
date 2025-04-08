import React from 'react';
import { useDashboard } from './DashboardContext';

interface DashboardHeaderProps {
  onSave?: (dashboard: any) => void;
  onNewFromTemplate?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onSave, onNewFromTemplate }) => {
  const { 
    dashboard, 
    isEditing, 
    toggleEditMode, 
    addRow, 
    saveCurrentLayout, 
    discardChanges 
  } = useDashboard();

  return (
    <>
      {isEditing && (
        <div className="dashboard-edit-mode-banner">
          <div className="edit-mode-info">
            <span>📐 Dashboard Edit Mode</span>
          </div>
          <div className="edit-actions">
            <button 
              className="cancel-button"
              onClick={discardChanges}
              aria-label="Discard changes"
            >
              Discard Changes
            </button>
            <button 
              className="save-button"
              onClick={() => {
                saveCurrentLayout();
                if (onSave && dashboard) onSave(dashboard);
              }}
              aria-label="Save layout"
            >
              Save Layout
            </button>
          </div>
        </div>
      )}

      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>{dashboard?.name || 'My Dashboard'}</h1>
        </div>
        
        <div className="dashboard-actions">
          {!isEditing ? (
            <>
              <button 
                className="secondary-button template-button"
                onClick={onNewFromTemplate}
                aria-label="New from template"
                style={{ marginRight: '10px' }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ marginRight: '8px' }}
                >
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <line
                    x1="3"
                    y1="9"
                    x2="21"
                    y2="9"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <line
                    x1="9"
                    y1="21"
                    x2="9"
                    y2="9"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                Templates
              </button>
              <button 
                className="primary-button"
                onClick={toggleEditMode}
                aria-label="Edit dashboard"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ marginRight: '10px' }}
                >
                  <path
                    d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Edit Dashboard
              </button>
            </>
          ) : (
            <div className="edit-controls">
              <button 
                className="primary-button add-row-button"
                onClick={() => addRow()}
                aria-label="Add new row"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ marginRight: '8px' }}
                >
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Add Row
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DashboardHeader; 