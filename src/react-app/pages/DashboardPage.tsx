import React, { useState, useEffect } from 'react';
import { DashboardContainer } from '../components/dashboard';
import DashboardService from '../services/DashboardService';
import { Dashboard, WidgetInstance } from '../components/dashboard/types';

const DashboardPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<{
    dashboard: Dashboard | null;
    widgetInstances: Record<string, WidgetInstance>;
  }>({ dashboard: null, widgetInstances: {} });

  // Load dashboard on component mount
  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      try {
        // First try to load from cloud (with fallback to local)
        const data = await DashboardService.loadDashboardFromCloud();
        
        // If no dashboard exists, create a default one
        if (!data.dashboard) {
          const defaultData = DashboardService.getOrCreateDashboard();
          setDashboardData(defaultData);
        } else {
          setDashboardData(data);
        }
      } catch (error) {
        console.error('Error loading dashboard:', error);
        // Fallback to local storage or default
        const localData = DashboardService.getOrCreateDashboard();
        setDashboardData(localData);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboard();
  }, []);

  const handleSaveDashboard = async (
    dashboard: Dashboard, 
    widgetInstances: Record<string, WidgetInstance>
  ) => {
    try {
      // First save locally (always)
      DashboardService.saveLocalDashboard(dashboard, widgetInstances);
      
      // Then try to save to cloud
      await DashboardService.saveDashboardToCloud(dashboard, widgetInstances);
      
      console.log('Dashboard saved successfully');
    } catch (error) {
      console.error('Error saving dashboard:', error);
      // At least it's saved locally
      alert('Dashboard saved locally, but couldn\'t sync to cloud.');
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <DashboardContainer 
        initialDashboard={dashboardData.dashboard || undefined}
        onSave={handleSaveDashboard} 
      />
    </div>
  );
};

export default DashboardPage; 