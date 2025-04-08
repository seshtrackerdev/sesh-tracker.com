import { v4 as uuidv4 } from 'uuid';
import { Dashboard, DashboardRow, RowLayout, WidgetInstance } from '../types';

export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  thumbnailSrc?: string;
  createDashboard: () => {
    dashboard: Dashboard;
    widgetInstances: Record<string, WidgetInstance>;
  };
}

// Helper to create a simple column layout
const createColumnLayout = (columnWidths: number[]): RowLayout => {
  const columns = columnWidths.map(width => ({
    id: uuidv4(),
    widthPercentage: width,
  }));

  return {
    id: uuidv4(),
    columns,
  };
};

// Basic row structure
const createRow = (
  name: string, 
  index: number, 
  columnWidths: number[],
  showTitle: boolean = true
): DashboardRow => {
  return {
    id: uuidv4(),
    name,
    index,
    showTitle,
    layout: createColumnLayout(columnWidths),
  };
};

// Available dashboard templates
export const DASHBOARD_TEMPLATES: DashboardTemplate[] = [
  // Empty Dashboard
  {
    id: 'empty',
    name: 'Empty Dashboard',
    description: 'Start with a blank dashboard and build it from scratch.',
    thumbnailSrc: '/assets/templates/empty-dashboard.png',
    createDashboard: () => {
      const dashboard: Dashboard = {
        id: uuidv4(),
        name: 'My Dashboard',
        rows: [
          createRow('Row 1', 1, [100]),
        ],
        isDefault: false,
      };

      return {
        dashboard,
        widgetInstances: {},
      };
    },
  },
  
  // Sessions Overview
  {
    id: 'sessions-overview',
    name: 'Sessions Overview',
    description: 'Track and analyze your sessions with charts and statistics.',
    thumbnailSrc: '/assets/templates/sessions-dashboard.png',
    createDashboard: () => {
      // Generate widget instance IDs
      const statsWidgetId = uuidv4();
      const sessionsChartId = uuidv4();
      const recentSessionsId = uuidv4();
      const strainId = uuidv4();
      
      // Create dashboard structure
      const dashboard: Dashboard = {
        id: uuidv4(),
        name: 'Sessions Overview',
        rows: [
          // First row with statistics cards
          {
            id: uuidv4(),
            name: 'Statistics',
            index: 1,
            showTitle: true,
            layout: {
              id: uuidv4(),
              columns: [
                { id: uuidv4(), widthPercentage: 33.33, widgetId: statsWidgetId },
                { id: uuidv4(), widthPercentage: 33.33, widgetId: sessionsChartId },
                { id: uuidv4(), widthPercentage: 33.33, widgetId: strainId },
              ],
            },
          },
          // Second row with recent sessions
          {
            id: uuidv4(),
            name: 'Recent Sessions',
            index: 2,
            showTitle: true,
            layout: {
              id: uuidv4(),
              columns: [
                { id: uuidv4(), widthPercentage: 100, widgetId: recentSessionsId },
              ],
            },
          },
        ],
        isDefault: false,
      };
      
      // Create widget instances
      const widgetInstances: Record<string, WidgetInstance> = {
        [statsWidgetId]: {
          id: statsWidgetId,
          widgetTypeId: 'statistics-card',
          props: {
            title: 'Session Statistics',
            stats: [
              { label: 'Total Sessions', value: '0' },
              { label: 'This Week', value: '0' },
              { label: 'Average Duration', value: '0 min' },
            ],
          },
          showTitle: true,
        },
        [sessionsChartId]: {
          id: sessionsChartId,
          widgetTypeId: 'consumption-trend',
          props: {
            title: 'Consumption Trends',
            period: 'week',
          },
          showTitle: true,
        },
        [recentSessionsId]: {
          id: recentSessionsId,
          widgetTypeId: 'recent-sessions',
          props: {
            title: 'Recent Sessions',
            limit: 5,
          },
          showTitle: true,
        },
        [strainId]: {
          id: strainId,
          widgetTypeId: 'strain-effectiveness',
          props: {
            title: 'Top Strains',
            limit: 5,
          },
          showTitle: true,
        },
      };
      
      return {
        dashboard,
        widgetInstances,
      };
    },
  },
  
  // Inventory Management
  {
    id: 'inventory-management',
    name: 'Inventory Management',
    description: 'Track your inventory, expiration dates, and consumption rates.',
    thumbnailSrc: '/assets/templates/inventory-dashboard.png',
    createDashboard: () => {
      // Generate widget instance IDs
      const inventoryStatsId = uuidv4();
      const inventoryChartId = uuidv4();
      const lowStockId = uuidv4();
      const expiringId = uuidv4();
      
      // Create dashboard structure
      const dashboard: Dashboard = {
        id: uuidv4(),
        name: 'Inventory Management',
        rows: [
          // First row with stats and chart
          {
            id: uuidv4(),
            name: 'Inventory Overview',
            index: 1,
            showTitle: true,
            layout: {
              id: uuidv4(),
              columns: [
                { id: uuidv4(), widthPercentage: 30, widgetId: inventoryStatsId },
                { id: uuidv4(), widthPercentage: 70, widgetId: inventoryChartId },
              ],
            },
          },
          // Second row with alerts
          {
            id: uuidv4(),
            name: 'Inventory Alerts',
            index: 2,
            showTitle: true,
            layout: {
              id: uuidv4(),
              columns: [
                { id: uuidv4(), widthPercentage: 50, widgetId: lowStockId },
                { id: uuidv4(), widthPercentage: 50, widgetId: expiringId },
              ],
            },
          },
        ],
        isDefault: false,
      };
      
      // Create widget instances
      const widgetInstances: Record<string, WidgetInstance> = {
        [inventoryStatsId]: {
          id: inventoryStatsId,
          widgetTypeId: 'statistics-card',
          props: {
            title: 'Inventory Statistics',
            stats: [
              { label: 'Total Items', value: '0' },
              { label: 'Total Weight', value: '0g' },
              { label: 'Estimated Value', value: '$0' },
            ],
          },
          showTitle: true,
        },
        [inventoryChartId]: {
          id: inventoryChartId,
          widgetTypeId: 'consumption-trend',
          props: {
            title: 'Inventory Breakdown',
            chartType: 'pie',
          },
          showTitle: true,
        },
        [lowStockId]: {
          id: lowStockId,
          widgetTypeId: 'low-inventory',
          props: {
            title: 'Low Stock Items',
            limit: 5,
          },
          showTitle: true,
        },
        [expiringId]: {
          id: expiringId,
          widgetTypeId: 'expiring-items',
          props: {
            title: 'Expiring Soon',
            limit: 5,
          },
          showTitle: true,
        },
      };
      
      return {
        dashboard,
        widgetInstances,
      };
    },
  },
];

/**
 * Get a dashboard template by ID
 */
export const getTemplateById = (templateId: string): DashboardTemplate | undefined => {
  return DASHBOARD_TEMPLATES.find(template => template.id === templateId);
};

/**
 * Create a dashboard from a template
 */
export const createDashboardFromTemplate = (templateId: string): {
  dashboard: Dashboard;
  widgetInstances: Record<string, WidgetInstance>;
} | null => {
  const template = getTemplateById(templateId);
  
  if (!template) {
    console.error(`Template not found: ${templateId}`);
    return null;
  }
  
  return template.createDashboard();
}; 