import { Dashboard, WidgetInstance } from '../components/dashboard/types';
import { 
  serializeDashboard, 
  deserializeDashboard, 
  validateDashboard,
  createDefaultDashboard,
  // DashboardSchema // Removed
} from '../components/dashboard/DashboardUtils';

// Storage keys
const DASHBOARD_STORAGE_KEY = 'sesh-tracker-dashboard';
const DASHBOARD_LAST_SYNC_KEY = 'sesh-tracker-dashboard-last-sync';

/**
 * Handles dashboard persistence operations (local storage and API)
 */
class DashboardService {
  /**
   * Save dashboard to local storage
   */
  saveLocalDashboard(
    dashboard: Dashboard, 
    widgetInstances: Record<string, WidgetInstance>
  ): boolean {
    try {
      // Validate the dashboard structure
      if (!validateDashboard(dashboard)) {
        console.error('Invalid dashboard structure');
        return false;
      }
      
      // Serialize and store
      const serialized = serializeDashboard(dashboard, widgetInstances);
      localStorage.setItem(DASHBOARD_STORAGE_KEY, serialized);
      localStorage.setItem(DASHBOARD_LAST_SYNC_KEY, new Date().toISOString());
      
      return true;
    } catch (error) {
      console.error('Failed to save dashboard to local storage:', error);
      return false;
    }
  }
  
  /**
   * Load dashboard from local storage
   */
  loadLocalDashboard(): { dashboard: Dashboard | null; widgetInstances: Record<string, WidgetInstance> } {
    try {
      const serialized = localStorage.getItem(DASHBOARD_STORAGE_KEY);
      
      if (!serialized) {
        return { dashboard: null, widgetInstances: {} };
      }
      
      const schema = deserializeDashboard(serialized);
      
      if (!schema) {
        console.error('Failed to deserialize dashboard');
        return { dashboard: null, widgetInstances: {} };
      }
      
      return {
        dashboard: schema.dashboard,
        widgetInstances: schema.widgetInstances
      };
    } catch (error) {
      console.error('Failed to load dashboard from local storage:', error);
      return { dashboard: null, widgetInstances: {} };
    }
  }
  
  /**
   * Check if local dashboard data exists
   */
  hasLocalDashboard(): boolean {
    return !!localStorage.getItem(DASHBOARD_STORAGE_KEY);
  }
  
  /**
   * Clear local dashboard data
   */
  clearLocalDashboard(): void {
    localStorage.removeItem(DASHBOARD_STORAGE_KEY);
    localStorage.removeItem(DASHBOARD_LAST_SYNC_KEY);
  }
  
  /**
   * Create or load a dashboard
   * - Tries to load from local storage first
   * - Creates a default if none exists
   */
  getOrCreateDashboard(): { dashboard: Dashboard; widgetInstances: Record<string, WidgetInstance> } {
    const { dashboard, widgetInstances } = this.loadLocalDashboard();
    
    if (dashboard) {
      return { dashboard, widgetInstances };
    }
    
    // Create a default dashboard
    const defaultDashboard = createDefaultDashboard();
    return { dashboard: defaultDashboard, widgetInstances: {} };
  }
  
  // === Cloud Synchronization Methods (Future Implementation) ===
  
  /**
   * Save dashboard to cloud (API)
   * @todo Implement API integration
   */
  async saveDashboardToCloud(
    // dashboard: Dashboard, // Removed
    // widgetInstances: Record<string, WidgetInstance> // Removed
  ): Promise<boolean> {
    try {
      // Placeholder for API call
      console.log('Todo: Implement API integration for saving dashboard');
      
      // Mock successful API response
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update last sync time
      localStorage.setItem(DASHBOARD_LAST_SYNC_KEY, new Date().toISOString());
      
      return true;
    } catch (error) {
      console.error('Failed to save dashboard to cloud:', error);
      return false;
    }
  }
  
  /**
   * Load dashboard from cloud (API)
   * @todo Implement API integration
   */
  async loadDashboardFromCloud(): Promise<{ 
    dashboard: Dashboard | null; 
    widgetInstances: Record<string, WidgetInstance> 
  }> {
    try {
      // Placeholder for API call
      console.log('Todo: Implement API integration for loading dashboard');
      
      // Mock API response by returning local data for now
      await new Promise(resolve => setTimeout(resolve, 500));
      return this.loadLocalDashboard();
    } catch (error) {
      console.error('Failed to load dashboard from cloud:', error);
      return { dashboard: null, widgetInstances: {} };
    }
  }
  
  /**
   * Get last sync time
   */
  getLastSyncTime(): Date | null {
    const lastSync = localStorage.getItem(DASHBOARD_LAST_SYNC_KEY);
    return lastSync ? new Date(lastSync) : null;
  }
}

// Export singleton instance
export default new DashboardService(); 