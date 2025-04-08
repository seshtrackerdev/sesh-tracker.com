// Import WidgetUtils directly from lowercase dashboard path
import WidgetUtils from '../dashboard/widgets/WidgetUtils';
import { Dashboard, DashboardRow, ColumnDefinition, WidgetInstance } from './types';
import { v4 as uuidv4 } from 'uuid';

console.log('DashboardUtils module loaded');
console.log('WidgetUtils available:', WidgetUtils !== undefined);

// Re-export WidgetUtils
export { WidgetUtils };

// Original export
export const calculateColumnWidths = (numberOfColumns: number): number[] => {
  const equalWidth = 100 / numberOfColumns;
  return Array(numberOfColumns).fill(equalWidth);
};

// Schema version for backward compatibility
export const DASHBOARD_SCHEMA_VERSION = '1.0';

/**
 * Dashboard schema with version for forward/backward compatibility
 */
export interface DashboardSchema {
  version: string;
  dashboard: Dashboard;
  widgetInstances: Record<string, WidgetInstance>;
}

/**
 * Serializes dashboard data to a string format for storage
 */
export const serializeDashboard = (
  dashboard: Dashboard, 
  widgetInstances: Record<string, WidgetInstance>
): string => {
  const schema: DashboardSchema = {
    version: DASHBOARD_SCHEMA_VERSION,
    dashboard,
    widgetInstances
  };
  
  return JSON.stringify(schema);
};

/**
 * Deserializes a dashboard from string format with schema validation
 */
export const deserializeDashboard = (serialized: string): DashboardSchema | null => {
  try {
    const parsed = JSON.parse(serialized);
    
    // Basic schema validation
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !parsed.version ||
      !parsed.dashboard ||
      !parsed.widgetInstances
    ) {
      console.error('Invalid dashboard schema:', parsed);
      return null;
    }
    
    // Version check for future migrations if needed
    if (parsed.version !== DASHBOARD_SCHEMA_VERSION) {
      console.warn(`Dashboard version mismatch: expected ${DASHBOARD_SCHEMA_VERSION}, got ${parsed.version}`);
      // Here you could implement migration logic for older versions
    }
    
    return parsed;
  } catch (error) {
    console.error('Failed to deserialize dashboard:', error);
    return null;
  }
};

/**
 * Validates a dashboard object for structural correctness
 */
export const validateDashboard = (dashboard: Dashboard): boolean => {
  try {
    // Check required fields
    if (!dashboard.id || !dashboard.name || !Array.isArray(dashboard.rows)) {
      return false;
    }
    
    // Validate all rows have required fields
    for (const row of dashboard.rows) {
      if (!row.id || !row.layout || !row.layout.id || !Array.isArray(row.layout.columns)) {
        return false;
      }
      
      // Validate columns in each row
      for (const column of row.layout.columns) {
        if (!column.id || typeof column.widthPercentage !== 'number') {
          return false;
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Dashboard validation failed:', error);
    return false;
  }
};

/**
 * Creates a default empty dashboard
 */
export const createDefaultDashboard = (name: string = 'My Dashboard'): Dashboard => {
  const dashboardId = uuidv4();
  
  // Create a single default row with one column
  const defaultRow: DashboardRow = {
    id: uuidv4(),
    index: 1,
    name: 'Row 1',
    showTitle: true,
    layout: {
      id: uuidv4(),
      columns: [
        {
          id: uuidv4(),
          widthPercentage: 100
        }
      ]
    }
  };
  
  return {
    id: dashboardId,
    name,
    rows: [defaultRow],
    isDefault: true
  };
}; 