import React, { useState } from 'react';
import { DASHBOARD_TEMPLATES } from './DashboardTemplates';
import { Dashboard, WidgetInstance } from '../types';

interface TemplateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (result: {
    dashboard: Dashboard;
    widgetInstances: Record<string, WidgetInstance>;
  }) => void;
}

const TemplateSelectionModal: React.FC<TemplateSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
  };

  const handleConfirmSelection = () => {
    if (!selectedTemplateId) return;

    const template = DASHBOARD_TEMPLATES.find(t => t.id === selectedTemplateId);
    if (!template) return;

    const result = template.createDashboard();
    onSelectTemplate(result);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal template-selection-modal">
        <div className="modal-header">
          <h2>Select Dashboard Template</h2>
          <button className="close-button" onClick={onClose}>
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M18 6L6 18M6 6L18 18" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="modal-content">
          <p className="modal-description">
            Choose a template to quickly set up your dashboard with predefined layouts and widgets.
          </p>

          <div className="template-grid">
            {DASHBOARD_TEMPLATES.map((template) => (
              <div 
                key={template.id}
                className={`template-card ${selectedTemplateId === template.id ? 'selected' : ''}`}
                onClick={() => handleSelectTemplate(template.id)}
              >
                <div className="template-thumbnail">
                  {template.thumbnailSrc ? (
                    <img 
                      src={template.thumbnailSrc} 
                      alt={template.name} 
                      className="template-image"
                    />
                  ) : (
                    <div className="template-placeholder">
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
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
                    </div>
                  )}
                </div>
                <div className="template-info">
                  <h3 className="template-name">{template.name}</h3>
                  <p className="template-description">{template.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="secondary-button" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="primary-button"
            disabled={!selectedTemplateId}
            onClick={handleConfirmSelection}
          >
            Apply Template
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelectionModal; 