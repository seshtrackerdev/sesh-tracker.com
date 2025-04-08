import React, { useState, useEffect } from 'react';
import { DashboardProvider, useDashboard } from './DashboardContext';
import { Dashboard, WidgetInstance } from './types';
import DashboardHeader from './DashboardHeader';
import WelcomeHeader from './WelcomeHeader';
import DashboardGrid from './DashboardGrid';
import GlobalLayoutModal from './GlobalLayoutModal';
import WidgetSelectorModal from './WidgetSelectorModal';
import TemplateSelectionModal from './templates/TemplateSelectionModal';
import DashboardService from '../../services/DashboardService';
import './Dashboard.css';

interface DashboardContainerProps {
  initialDashboard?: Dashboard;
  onSave?: (dashboard: Dashboard, widgetInstances: Record<string, WidgetInstance>) => void;
}

// Wrapper component that uses the dashboard context
const DashboardContent: React.FC<{ 
  onSave?: (dashboard: Dashboard, widgetInstances: Record<string, WidgetInstance>) => void 
}> = ({ onSave }) => {
  const { 
    dashboard,
    isEditing, 
    addWidget, 
    widgetSelectorModalState, 
    closeWidgetSelectorModal,
    saveCurrentLayout
  } = useDashboard();
  
  // Add state for template modal
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  
  // Handle save with persistence
  const handleSave = () => {
    if (dashboard && onSave) {
      saveCurrentLayout(); // First save in context
      
      // Get all widget instances from context (we need access to this)
      // This would be better handled with a context API that exposes widgetInstances
      const widgetInstances = {}; // This should be exposed from context
      
      onSave(dashboard, widgetInstances);
    }
  };
  
  const handleSelectWidget = (widgetTypeId: string) => {
    if (widgetSelectorModalState.rowId && widgetSelectorModalState.columnId) {
      addWidget(
        widgetSelectorModalState.rowId, 
        widgetSelectorModalState.columnId, 
        widgetTypeId
      );
    }
  };
  
  // Handler for template selection
  const handleSelectTemplate = (result: {
    dashboard: Dashboard;
    widgetInstances: Record<string, WidgetInstance>;
  }) => {
    if (onSave) {
      onSave(result.dashboard, result.widgetInstances);
    }
  };
  
  return (
    <div className={`dashboard-container ${isEditing ? 'editing' : ''}`}>
      <div className="dashboard-content">
        <WelcomeHeader 
          username="[user]"
          lastSession={{ 
            date: "Today, 12:45 PM",
            strain: "Sample Strain" 
          }}
          notifications={{
            lowInventory: [
              { strain: "Sample Strain", count: 2 }
            ],
            systemNotifications: [
              "New feature: Try out the updated report builder!"
            ]
          }}
        />
        <DashboardHeader 
          onSave={handleSave} 
          onNewFromTemplate={() => setIsTemplateModalOpen(true)}
        />
        <DashboardGrid />
        
        {/* Render modals */}
        <GlobalLayoutModal />
        <WidgetSelectorModal 
          isOpen={widgetSelectorModalState.isOpen}
          onClose={closeWidgetSelectorModal}
          onSelectWidget={handleSelectWidget}
        />
        
        {/* Template selection modal */}
        <TemplateSelectionModal
          isOpen={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          onSelectTemplate={handleSelectTemplate}
        />
      </div>
    </div>
  );
};

const DashboardContainer: React.FC<DashboardContainerProps> = ({ 
  initialDashboard,
  onSave
}) => {
  // Dashboard state with proper persistence
  const [dashboardData, setDashboardData] = useState<{
    dashboard: Dashboard | null;
    widgetInstances: Record<string, WidgetInstance>;
  }>(() => {
    // If initialDashboard is provided, use it
    if (initialDashboard) {
      return {
        dashboard: initialDashboard,
        widgetInstances: {} // Ideally this would be provided too
      };
    }
    
    // Otherwise, load from local storage or create default
    return DashboardService.getOrCreateDashboard();
  });
  
  // Handle saving dashboard
  const handleSaveDashboard = (
    dashboard: Dashboard, 
    widgetInstances: Record<string, WidgetInstance>
  ) => {
    // Update local state
    setDashboardData({ dashboard, widgetInstances });
    
    // Save to persistence layer
    DashboardService.saveLocalDashboard(dashboard, widgetInstances);
    
    // Call parent onSave if provided
    if (onSave) {
      onSave(dashboard, widgetInstances);
    }
  };
  
  // Load or create dashboard on mount
  useEffect(() => {
    if (!initialDashboard) {
      const data = DashboardService.getOrCreateDashboard();
      setDashboardData(data);
    }
  }, [initialDashboard]);
  
  // Don't render until we have dashboard data
  if (!dashboardData.dashboard) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <DashboardProvider initialDashboard={dashboardData.dashboard}>
      <DashboardContent onSave={handleSaveDashboard} />
    </DashboardProvider>
  );
};

export default DashboardContainer; 